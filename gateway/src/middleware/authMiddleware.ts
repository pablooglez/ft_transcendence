import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

const publicUrls = ["/auth/login", "/auth/register", "/auth/refresh", "/ping", "/health"];

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
    // Obtener la ruta sin parámetros de consulta
    const urlPath = req.url.split('?')[0];
    
    // Permitir rutas públicas y WebSocket
    if (publicUrls.includes(urlPath) || urlPath.startsWith('/ws')) {
        return;
    }

    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return reply.code(401).send({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]?.trim();
    if (!token) {
        return reply.code(401).send({ error: "Unauthorized: Malformed token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string;
            username: string;
            iat?: number;
            exp?: number;
        };

        req.user = decoded;

    }   catch (err) {
            return reply.code(401).send({ error: "Unauthorized: Invalid or expired token" });
    }
}