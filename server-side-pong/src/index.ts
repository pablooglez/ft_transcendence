/**
 * @file index.ts
 * @brief Pong server entrypoint
 */

/**
 * Imports
 */
import fastify from "fastify";
import websocket, { SocketStream } from "@fastify/websocket";
import dotenv from "dotenv";
import { gameController, isPaused } from "./controllers/gameControllers";
import { getGameState, moveUp, moveDown, updateGame } from "./services/gameServices";

dotenv.config();

const app = fastify({ logger: true });

/**
 * map of player connections
 * - ahora guarda directamente el WebSocket real (de "ws")
 */
export const playerConnections = new Map<string, WebSocket>();

// Registrar el plugin de WebSocket
app.register(websocket);

/**
 * register the REST routes
 */
gameController(app);

/**
 * Define the websocket endpoint in the root /
 */
app.get("/", { websocket: true }, (connection: SocketStream, req) => {
	// Gateway passses the player id in the header
	const playerId = req.headers["x-player-id"] as string;
	let clientId: string;

	// Si no hay header -> se conecta como guest
	if (!playerId) {
		console.warn(
			"Warning: Connection received without x-player-id header. This may indicate a direct call bypassing the gateway."
		);
		const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
		clientId = guestId;
		playerConnections.set(clientId, connection.socket);
		console.log(`Pong Service: Unauthenticated guest ${guestId} connected.`);
	} else {
		clientId = playerId;
		playerConnections.set(clientId, connection.socket);
		console.log(`Pong Service: Player ${playerId} connected.`);
	}

	/**
	 * send the messages to the client
	 */
	connection.socket.on("message", (message: Buffer) => {
		try {
			const msg = JSON.parse(message.toString());
			if (isPaused) return; // ignore movements if game is paused

			// simulate the events
			if (msg.event === "moveUp") moveUp(msg.payload);
			if (msg.event === "moveDown") moveDown(msg.payload);
		} catch (e) {
			console.error("Invalid client message:", message.toString());
		}
	});

	/**
	 * Clean the connection when the client disconnects
	 */
	connection.socket.on("close", () => {
		console.log(`Pong Service: Player ${clientId} disconnected.`);
		playerConnections.delete(clientId);
	});
});

/**
 * Game Loop: emits from native connections
 */
setInterval(() => {
	if (!isPaused && playerConnections.size > 0) {
		const state = updateGame();
		const message = JSON.stringify({ event: "gameState", data: state });

		// send the state to all connected players
		for (const ws of playerConnections.values()) {
			// ahora ws es directamente un WebSocket
			if (ws.readyState === ws.OPEN) {
				ws.send(message);
			}
		}
	}
}, 1000 / 60); // 60 FPS

const PORT = process.env.PORT || 3000;
app.listen({ port: Number(PORT), host: "0.0.0.0" }, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Pong server (Fastify WS) running in ${address}`);
});
