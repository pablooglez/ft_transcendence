/**
 * @file index.ts
 * @brief Pong server entrypoint
 */


/**
 * Imports
 */
import fastify from "fastify";
import { createServer } from "http";
import { Server } from "socket.io";
import { gameController, isPaused } from "./controllers/gameControllers";
import {
  getGameState,
  moveUp,
  moveDown,
  updateGame,
} from "./services/gameServices";

const app = fastify({ logger: true });
const server = createServer(app.server);
const io = new Server(server, { cors: { origin: "*" } });

/**
 * Register REST routes with io injected
 */
gameController(app, io);

// WebSockets
io.on("connection", (socket) =>
{
  	console.log("Player connected:", socket.id);

  // Send initial state
	socket.emit("gameState", getGameState());

  // Player controls
	socket.on("moveUp", (side: "left" | "right") =>
		{
		if (!isPaused)
		{
			const state = moveUp(side);
			io.emit("gameState", state);
		}
	});

	socket.on("moveDown", (side: "left" | "right") =>
	{
		if (!isPaused)
		{
			const state = moveDown(side);
			io.emit("gameState", state);
		}
	});

	socket.on("disconnect", () =>
	{
		console.log("Player disconnected:", socket.id);
	});
});

/**
 * Game loop for ball + scoring
 */
	setInterval(() =>
	{
		if (!isPaused)
		{
			const state = updateGame();
			io.emit("gameState", state);
		}
	}, 1000 / 60); // 60 FPS

/**
 * Start server
 */
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () =>
	{
		console.log(`Pong server running at http://localhost:${PORT}`);
	});
