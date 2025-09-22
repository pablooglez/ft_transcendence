import { FastifyInstance } from "fastify";
import fastifyHttpProxy from "@fastify/http-proxy";
import { authMiddleware } from "../middleware/authMiddleware.js";


export default async function pongRoutes(app: FastifyInstance)
{
	/**
	 * Proxy for the routes of the game API
	 */
	app.register(fastifyHttpProxy,
	{
		upstream: "http://pong-service:3000",
		prefix: "/game",
		rewritePrefix: "/game",
		preHandler: authMiddleware,
	});

	/**
	 * Proxy for the game websocket connection
	 */
    app.register(fastifyHttpProxy,
	{
		upstream: "http://pong-service:3000",
		prefix: "/ws/pong",
		rewritePrefix: "/",
		websocket: true,
		preHandler: authMiddleware,
		rewriteRequestHeaders: (originalReq, headers) =>
		{
			if (originalReq.user)
			{
				headers['x-player-id'] = originalReq.user.id;
			}
			return headers;
		}
	});
}