import { FastifyInstance } from "fastify";
import fastifyHttpProxy from "@fastify/http-proxy";

export default async function chatRoutes(app: FastifyInstance) {
    // Proxy para endpoints REST
    app.register(fastifyHttpProxy, {
        upstream: "http://chat-service:8083",
        prefix: "/conversations",
        rewritePrefix: "/conversations",
    });

    // Proxy para WebSocket
    app.register(fastifyHttpProxy, {
        upstream: "http://chat-service:8083",
        prefix: "/ws",
        rewritePrefix: "/ws",
        websocket: true
    });
}