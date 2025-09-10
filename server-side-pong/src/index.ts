/**
 * @file index.ts
 * @brief Pong server entrypoint
 */

/**
 * Exports for paddles, ball and gamestate
 */
export interface Paddle {
  y: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface GameState {
  paddles: {
    left: Paddle;
    right: Paddle;
  };
  ball: Ball;
  scores: {
    left: number;
    right: number;
  };
}

/**
 * Imports
 */
import fastify from "fastify";
import { createServer } from "http";
import { Server } from "socket.io";
import { gameController } from "./controllers/gameControllers";
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
io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Send initial state
  socket.emit("gameState", getGameState());

  // Player controls
  socket.on("moveUp", (side: "left" | "right") => {
    const state = moveUp(side);
    io.emit("gameState", state);
  });

  socket.on("moveDown", (side: "left" | "right") => {
    const state = moveDown(side);
    io.emit("gameState", state);
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
  });
});

/**
 * Game loop for ball + scoring
 */
setInterval(() => {
  const state = updateGame();
  io.emit("gameState", state);
}, 1000 / 60); // 60 FPS

/**
 * Start server
 */
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Pong server running at http://localhost:${PORT}`);
});
