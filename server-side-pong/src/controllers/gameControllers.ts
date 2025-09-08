/**
 * @file gameControllers.ts
 * @brief Import FastifyInstance to use its server, the the gameService and the PaddleSide
 */
import { FastifyInstance } from "fastify";
import { getGameState, resetGame } from "../services/gameServices";
import { Server } from "socket.io";

export async function gameController(fastify: FastifyInstance, io: Server)
{
	/**
	 * POST to init the game after reset
	 */
	fastify.post("/game/init", async () =>
	{
		const state = resetGame();
		io.emit("paddles", state); // notify clients
		return { message: "Game initialized", state };
	});

	/**
	 * GET to get the current state of the game
	 */
	fastify.get("/game/state", async () =>
	{
		return getGameState();
	});
}
