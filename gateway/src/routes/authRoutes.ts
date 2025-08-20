import { FastifyInstance } from "fastify";
import { registerController, loginController } from "../controllers/authController";

export default async function authRoutes(app: FastifyInstance) {
    app.post("/auth/login", loginController);
    app.post("/auth/register", registerController);
}