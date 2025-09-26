import { FastifyInstance } from "fastify";
import proxy from "@fastify/http-proxy";

export default async function pongRoutes(fastify: FastifyInstance) {
  fastify.log.info("Registering pongRoutes");

  // 🔥 Proxy para WebSockets - Simplificado para solo reenviar
  fastify.register(proxy, {
    upstream: "http://pong-service:3000",
    prefix: "/ws/pong",
    ws: true,
    rewritePrefix: "/", // Mantiene query params como ?token=...
    websocket: true,
  });

  // 🔥 Proxy para rutas REST
  fastify.register(proxy, {
    upstream: "http://pong-service:3000",
    prefix: "/game",
    rewritePrefix: "/game",
    
    replyOptions: {
      rewriteRequestHeaders: (originalReq, headers) => {
        if (originalReq.user) {
          headers["x-player-id"] = String(originalReq.user.id);
          fastify.log.info(`[REST] Injected x-player-id: ${headers["x-player-id"]}`);
        }
        return headers;
      },
    },
  });

  fastify.log.info("pongRoutes registered successfully");
}