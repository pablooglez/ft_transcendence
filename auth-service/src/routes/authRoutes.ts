import { FastifyInstance } from "fastify";
import { registerController, loginController, refreshController } from "../controllers/authController";

export default async function authRoutes(app: FastifyInstance) {
    app.post("/login", loginController);
    app.post("/register", registerController);
    app.post("/refresh", refreshController);
}