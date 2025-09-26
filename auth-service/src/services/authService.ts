import bcrypt from "bcrypt";
import { createUser, findUser } from "../repositories/userRepository";
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository";
import { generateAccessToken, generateRefreshToken } from "./tokenService";

const refreshTokenRepo = new RefreshTokenRepository();

export async function registerUser(username: string, password: string, email: string) {
    const res = await fetch("http://user-management-service:8082/getUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
    });

    const user = await res.json();
    if (user) {
        throw new Error("User already exists");
    }

    const hashed = await bcrypt.hash(password, 10);
    createUser(username, hashed, email);

    const register = await fetch("http://user-management-service:8082/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, hashed, email }),
      });

    const result = await register.json();
    if (result.ok)
        return { message: "User registered successfully" };
    else
        throw new Error("Failed register in user service");
}

export async function loginUser(username: string, password: string) {
    const res = await fetch("http://user-management-service:8082/getUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
    });

    const user = await res.json();
    console.log("user from user-management-service:", user);

    if (!user)
        throw new Error("Invalid username or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
        throw new Error("Invalid username or password");

    return user;
}

export function createTokensLogin(user: any) {
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    refreshTokenRepo.add(user.id, refreshToken);
    
    return { token, refreshToken };
}

export function logoutUser(refreshToken: string) {
    const tokenData = refreshTokenRepo.findByToken(refreshToken);
    if (!tokenData)
        return ;

    refreshTokenRepo.deleteAllForUser(tokenData.user_id);
}