import { FastifyReply, FastifyRequest } from "fastify";
import { registerUser, loginUser, logoutUser, createTokensLogin, findOrCreateUserFrom42, findOrCreateUserFromGoogle, sendEmail, generateUniqueId, deleteUserData } from "../services/authService";
import { rotateTokens, generateAccessToken} from "../services/tokenService"
import * as speakeasy from "speakeasy";
import { findUserById, updateUser2FA, updateUserPending2FA, getUserPending2FA, activateUser2FA, debugUsers, createUser } from "../repositories/userRepository";
import QRCode from "qrcode";
import nodemailer from "nodemailer";

import { DeleteUserBody, ForgotPasswordBody, GenerateQRBody, LoginBody, RegisterBody, RestoreUserHeaders, Verify2FABody } from "../schemas/authSchemas";


export async function registerController(req: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
   const { username, password, email } = req.body;

   try {
       const result = await registerUser(username, password, email);
       return reply.send(result);
   } catch (err: any) {
        return reply.code(200).send({ success: false, error: err.message });
   }
}

export async function loginController(req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    const { username, password } = req.body;
    try {
        const { user, authUser } = await loginUser(username, password);

        if (authUser.is_2fa_enabled) {
            const token = generateAccessToken(user);
            return reply.send({ requires2FA: true, userId: user.id, username: user.username, tempToken: token });
        }

        const { token, refreshToken } = createTokensLogin(user);

        reply.setCookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, //Change in future to true
            sameSite: "none", //Change in future to strict
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
        });

        return reply.send({ accessToken: token, user: { id: user.id, username: user.username, email: user.email, twofa: authUser.is_2fa_enabled },
        });

    } catch (err: any) {
        return reply.code(200).send({ success: false, error: "Invalid username or password" });
    }
}

export async function refreshController(req: FastifyRequest, reply: FastifyReply) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return reply.code(200).send({ success: false, error: "Refresh token is required" });
    }

    try {
        const { newAccessToken, newRefreshToken } = rotateTokens(refreshToken);

        reply.setCookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true, //Change in future to true
            sameSite: "none", //Change in future to strict
            path: "/",
            maxAge: 7 * 24 * 60 * 60
        });

        return reply.send({
            accessToken: newAccessToken
        });

    } catch (err: any) {
        return reply.code(200).send({ success: false, error: err.message });
    }
}

export async function logoutController(req: FastifyRequest, reply: FastifyReply) {
    let refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        const authHeader = req.headers["authorization"];
        if (authHeader?.startsWith("Bearer ")) {
            refreshToken = authHeader.split(" ")[1].trim();
        }
        else
            return reply.code(400).send({ error: "Refresh token is required" });
    }

    try {
        logoutUser(refreshToken);

        reply.clearCookie("refreshToken", {
            path: "/auth/refresh",
        })

        return reply.send({ success: true, message: "Logged out successfully" });
    } catch (err) {
        return reply.code(500).send({ error: "Logout failed" });
    }
}

export async function verify2FAController(
  req: FastifyRequest<{ Body: Verify2FABody }>,
  reply: FastifyReply
) {
  const { userId, code } = req.body;

  // Fetch user from user-management service
  const res = await fetch("http://user-management-service:8082/getUserById", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId }),
  });

  if (!res.ok) {
    return reply.code(400).send({ error: "Unable to fetch user" });
  }

  const user = await res.json();

  if (!user?.id) {
    return reply.code(400).send({ error: "User not found" });
  }

  // Get the user auth info
  const authUser = findUserById(userId);
  if (!authUser) {
    return reply.code(400).send({ error: "User not found" });
  }

  const secret = authUser.pending_2fa_secret || authUser.totp_secret;
  if (!secret) {
    return reply.code(400).send({ error: "2FA not set up" });
  }

  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: code,
    window: 1,
  });

  if (!verified) {
    return reply.code(401).send({ error: "Invalid 2FA code" });
  }

  // Case 1: Enabling 2FA for the first time
  if (authUser.pending_2fa_secret) {
    activateUser2FA(userId, authUser.pending_2fa_secret);

    return reply.code(200).send({
      success: true,
      message: "2FA enabled successfully",
    });
  }

  // Case 2: Normal login, return access token
  const { token, refreshToken } = createTokensLogin(user);

  // Set refresh token cookie
  reply.setCookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // Change to true in production
    sameSite: "none", // Change to strict in production
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  // Ensure all user fields are present and types match the schema
  const safeUser = {
    id: user.id,
    username: user.username ?? "",
    email: user.email ?? "",
    twofa: Boolean(authUser.is_2fa_enabled),
  };

  // Send schema-compliant response
  return reply.code(200).send({
    accessToken: token,
    user: safeUser,
  });
}

export async function enable2FAController(req: FastifyRequest<{ Body: Verify2FABody }>, reply: FastifyReply) {
    try {
        const { username, userId } = req.body as {username: string, userId: number};
        const secret = speakeasy.generateSecret({
            name: `ft_transcendence (${username})`,
            length: 20,
        });

        updateUserPending2FA(secret.base32, userId);
        return reply.send({ message: "2FA setup started, call /generate-qr to get qr"})

    } catch (err: any) {
        console.error("enable2FA error:", err);
        return reply.code(500).send({ error: "Failed to enable 2FA" });
    }
}

export async function generateQRController(req: FastifyRequest<{ Body: GenerateQRBody }>, reply: FastifyReply) {
    try {
        const { username, userId } = req.body;
        
        let secret = getUserPending2FA(userId);
        if (!secret) {
            const user = findUserById(userId);
            if (!user || !user.totp_secret) {
                return reply.code(400).send({ error: "No pending 2FA setup"});
            }
            secret = user.totp_secret;
        }

        const otpauthUrl = speakeasy.otpauthURL({
            secret: secret,
            label: `ft_transcendence`,
            issuer: "ft_transcendence",
            encoding: "base32",
        });
        
        const qr = await QRCode.toDataURL(otpauthUrl);

        return reply.send({ qr });
    } catch (err: any) {
        console.error("generateQR error:", err);
        return reply.code(500).send({ error: "Failed to generate QR"});
    }
}

export async function forgotPasswordController(req: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) {
  try {
    const { email } = req.body;

    const res = await fetch("http://user-management-service:8082/getUserByEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      return reply.code(400).send({ success: false, error: "Email not found" });
    }

    const user = await res.json();

    const password = generateUniqueId();

    const changeRes = await fetch("http://user-management-service:8082/changePasswordBackend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password, userId: user.id }),
    });

    if (!changeRes.ok) {
      return reply.code(500).send({ success: false, error: "Failed to change password" });
    }

    await sendEmail(
      email,
      "New Password Request for ft_transcendence",
      `<h1>Hello ${user.username}!</h1>
      <p>Here is your new password: ${password}</p>
      <p>If you didn't ask for a new password, you can change it again in your user settings.</p>`
    );

    return reply.code(200).send({ success: true, message: "Password changed. Check your email!" });
  } catch (err) {
    console.error(err);
    return reply.code(500).send({ success: false, error: "Something went wrong" });
  }
}

export async function restoreUserController(req: FastifyRequest<{ Headers: RestoreUserHeaders }>, reply: FastifyReply) {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId || typeof userId !== "string") {
      return reply.status(400).send({ error: "Missing or invalid x-user-id header" });
    }

    const res = await fetch("http://user-management-service:8082/getUserById", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return reply.status(res.status).send({
        error: `User service responded with status ${res.status}`,
        details: errText || undefined,
      });
    }

    const user = await res.json();

    if (!user || !user.id) {
      return reply.status(404).send({ error: "User not found or invalid user data" });
    }

    const authUser = findUserById(user.id);
    if (!authUser) {
      return reply.status(404).send({ error: "User not found in authentication system" });
    }

    return reply.send({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        twofa: authUser.is_2fa_enabled ?? false,
      },
    });
  } catch (err: any) {
    console.error("⚠️ restoreUserController error:", err);
    return reply.status(500).send({
      error: "Internal server error" });
  }
}

export async function deleteUserController(req: FastifyRequest<{ Body: DeleteUserBody }>, reply: FastifyReply) {
    const { userId } = req.body as { userId: number };

    if (!userId || typeof userId !== "number") {
        return reply.code(400).send({ error: "Missing or invalid userId" });
    }

    try {

        await deleteUserData(userId);

        return reply.send({ success: true, message: "User deleted successfully" });
    } catch (err: any) {
        console.error("deleteUserController error:", err);
        return reply.code(500).send({ error: "Internal server error" });
    }
}