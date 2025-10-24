import { FastifyInstance } from "fastify";
import fastifyHttpProxy from "@fastify/http-proxy";
import { authMiddleware } from "../middleware/authMiddleware";

export default async function tournamentRoutes(app: FastifyInstance) {
  app.register(async function (protectedRoutes: FastifyInstance) {
    protectedRoutes.register(fastifyHttpProxy, {
      upstream: "http://tournament-service:8085",
      prefix: "/tournaments",
      rewritePrefix: "/tournaments",
      async preHandler(req, reply) {

        const publicPaths = [
            "/tournaments/local",
            "/tournaments/:id/start",
            "/tournaments/:id/advance",
        ];

        const isPublic = publicPaths.some((path) => req.url.startsWith(path));

        console.log("path:", req.url, "isPublic:", isPublic);

        if (isPublic) {
          const userId = req.headers["x-user-id"];
          if (!userId) {
            console.warn(`Public route accessed without x-user-id header: ${req.url}`);
            return reply.code(401).send({ error: "Missing x-user-id header" });
          }
          console.log("Public route allowed. Skipping auth.");
          return;
        }

        await authMiddleware(req, reply);

        if (req.user) {
          (req.headers as Record<string, string>)["x-user-id"] = req.user.id;
          (req.headers as Record<string, string>)["x-username"] = req.user.username;
        }

        console.log("Forwarding headers to user service:", {
          "x-user-id": req.user?.id,
          "x-username": req.user?.username,
        });
      },
    });
  });
}