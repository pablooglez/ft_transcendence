/**
 * @file gameControllers.ts
 * @brief REST API for controlling the Pong game
 */
import { FastifyInstance } from "fastify";
import { getGameState, resetGame } from "../services/gameServices";
import { playerConnections } from "../index";

/**
 * runtime flag to pause the game 
 */
export let isPaused = false;

export function setPaused(value: boolean) {
  isPaused = value;
  if (isPaused)
    console.log("Game is paused.");
  else
    console.log("Game is not paused.");

  // 🔥 Avisar a todos los clientes conectados
  const message = JSON.stringify({
    event: isPaused ? "pause" : "resume"
  });

  for (const [playerId, connection] of playerConnections.entries()) {
    try {
      // 🔥 USAR connection.socket.send() no ws.send()
      if (connection.socket.readyState === 1) { // 1 = OPEN
        connection.socket.send(message);
      }
    } catch (err) {
      console.error(`Error sending pause/resume to player ${playerId}:`, err);
    }
  }
}

export async function gameController(fastify: FastifyInstance) {
  /**
   * initializes but doesnt start the game
   */
  fastify.post("/game/init", async () => {
    const state = resetGame();
    setPaused(true);
    return { message: "Game initialized", state };
  });

  /**
   * route to get the game going
   */
  fastify.post("/game/resume", async () => {
    setPaused(false);
    return { message: "Game resumed" };
  });
}