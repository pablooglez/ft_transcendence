import { FastifyInstance } from "fastify";
import { registerController, loginController } from "../controllers/authController";

export default async function authRoutes(app: FastifyInstance) {
    app.post("/login", loginController);
    app.post("/register", registerController);
}