/**
 * @file index.ts
 * @brief
 */

export interface Paddle
{
  y: number;
}

export interface GameState
{
  paddles: {
    left: Paddle;
    right: Paddle;
  };
}


import fastify from "fastify";
import { createServer } from "http";
import { Server } from "socket.io";
import { gameController } from "./controllers/gameControllers";
import { getGameState, moveUp, moveDown } from "./services/gameServices";

const app = fastify({ logger: true });
const server = createServer(app.server);
const io = new Server(server, { cors: { origin: "*" } });

/**
 * @brief register REST routes with io injected 
 */
gameController(app, io);

// WebSockets
io.on("connection", (socket) =>
{
	console.log("Player connected:", socket.id);

	/**
	 * @brief send initial state
	 */
	socket.emit("paddles", getGameState());

	/**
	 * @brief player controls
	 */
	socket.on("moveUp", (side: "left" | "right") =>
	{
		const state = moveUp(side);
		io.emit("paddles", state);
	});

	socket.on("moveDown", (side: "left" | "right") =>
	{
		const state = moveDown(side);
		io.emit("paddles", state);
	});

	/**
	 * @brief disconnec the player
	 */
	socket.on("disconnect", () =>
	{
	console.log("Player disconnected:", socket.id);
	});
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
{
	console.log(`Pong server running at http://localhost:${PORT}`);
});
