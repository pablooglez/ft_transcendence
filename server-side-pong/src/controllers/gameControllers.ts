/**
 * @file gameControllers.ts
 * @brief REST API for controlling the Pong game
 */
import { FastifyInstance } from "fastify";
import { getGameState, resetGame } from "../services/gameServices";
import { Server } from "socket.io";

/**
 * runtime flag to pause the game 
 */
export let isPaused = false;

export async function gameController(fastify: FastifyInstance, io: Server)
{
  /**
   * POST /game/init
   * Reset and initialize the game
   */
	fastify.post("/game/init", async () =>
	{
		const state = resetGame();
		isPaused = true;
		io.emit("gameState", state);
		return { message: "Game initialized", state };
	});

	/**
	 * GET /game/state
	 * Fetch the current full game state (paddles + ball + scores)
	 */
	fastify.get("/game/state", async () =>
	{
		return { paused: isPaused, state: getGameState() };
	});

	/**
	 * POST /game/pause
	 * Pause the game loop (ball stops moving, players frozen)
	 */
	fastify.post("/game/pause", async () =>
	{
		isPaused = true;
		io.emit("gamePaused", { paused: true });
		return { message: "Game paused" };
	});

	/**
	 * POST /game/resume
	 * Resume the game loop
	 */
	fastify.post("/game/resume", async () =>
	{
		isPaused = false;
		io.emit("gamePaused", { paused: false });
		return { message: "Game resumed" };
	});

	/**
	 * POST /game/reset-score
	 * Reset only the scores, leave paddles and ball as-is
	 */
	fastify.post("/game/reset-score", async () =>
	{
		const state = getGameState();
		state.scores.left = 0;
		state.scores.right = 0;
		io.emit("gameState", state);
		return { message: "Scores reset", state };
	});

	/**
	 * Helper for other services to check pause state
	 */
	fastify.decorate("isGamePaused", () => isPaused);
}
