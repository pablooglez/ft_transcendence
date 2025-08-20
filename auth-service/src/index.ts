import Fastify from "fastify";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = Fastify({ logger: true });

app.register(authRoutes);

app.get("/ping", async () => {
    return { pong: true };
});

const PORT = process.env.PORT || 4242;

app.listen({ port: Number(PORT), host: "0.0.0.0" })
    .then(() => console.log(`Auth-service listening on port: ${PORT}`));
