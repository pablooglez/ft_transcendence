import jwt from "jsonwebtoken"
import { RefreshTokenRepository } from "../repositories/refreshTokenRepository"

export function generateAccessToken(user: { id: number; username: string; }) {
    return jwt.sign(
        { id: user.id, username: user.username },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
    );
}

export function generateRefreshToken(user: { id: number; username: string }) {
    return jwt.sign(
        { id: user.id, username: user.username },
    process.env.REFRESH_SECRET as string,
    { expiresIn: "7d" }
    );
}

export function verifyRefreshToken(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET as string) as {
            id: string;
            username: string;
        };

        return {
            id: parseInt(decoded.id, 10),
            username: decoded.username,
        };
    } catch (err) {
        throw new Error("Invalid or expired refresh token")
    }
}

const refreshTokenRepo = new RefreshTokenRepository();

export function rotateTokens(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);

    const existing = refreshTokenRepo.findByToken(refreshToken);
    if (!existing) {
        throw new Error("Invalid refresh token");
    }

    const newAccessToken = generateAccessToken({ username: decoded.username, id: decoded.id });
    const newRefreshToken = generateRefreshToken({ username: decoded.username, id: decoded.id });

    refreshTokenRepo.delete(refreshToken);
    refreshTokenRepo.add(decoded.id, newRefreshToken);

    return { newAccessToken, newRefreshToken };
}