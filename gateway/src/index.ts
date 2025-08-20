import Fastify from "fastify";
import dotenv from "dotenv";

import { authMiddleware } from "./middleware/authMiddleware.js";
import authRoutes from "./routes/authRoutes";

// Loads .env variables into process.env
dotenv.config();

// Creates a Fastify instance with logger activated
const app = Fastify({ logger: true });

app.register(authRoutes);

//----------------------------
// Protected endpoint example
//----------------------------

app.get("/protected", async (req, reply) => {
    return { message: `Hello ${req.user?.username}` };
});

//------------------
//
// END JWT IMPLEMENTATION
//
//------------------

app.addHook("preHandler", authMiddleware);

// Endpoint to test the server
app.get("/ping", async () => {
    return { pong: true };
});

app.get("/health", async () => {
    return { status: "ok", uptime: process.uptime() };
});

const PORT = process.env.PORT || 8080;

app.listen({ port: Number(PORT), host: "0.0.0.0" })
    .then(() => console.log(`Server running on port ${PORT}`));