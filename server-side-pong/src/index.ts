/**
 * @file index.ts
 * @brief Pong server con soporte para modo LOCAL y REMOTE
 */

import fastify from "fastify";
import websocket, { SocketStream } from "@fastify/websocket";
import dotenv from "dotenv";
import { gameController, isPaused } from "./controllers/gameControllers";
import {
  moveUp,
  moveDown,
  updateGame,
} from "./services/gameServices";

dotenv.config();

const app = fastify({ logger: true });

export const playerConnections = new Map<string, SocketStream>();
export const playerSides = new Map<string, "left" | "right" | "both">(); // 🔥 "both" para modo local

app.register(websocket);
gameController(app);

/**
 * Helper para obtener headers
 */
function getHeaderValue(req: any, headerName: string): string | undefined {
  if (typeof req.headers === 'function') {
    const headers = req.headers();
    return headers[headerName] || headers[headerName.toLowerCase()];
  }
  return req.headers[headerName] || req.headers[headerName.toLowerCase()];
}

app.get("/", { websocket: true }, (connection: SocketStream, req) => {
  console.log("=== NEW WEBSOCKET CONNECTION ===");

  // 🔥 Extraer token de la query string
  const token = (req.query as { token: string }).token;

  if (!token) {
    console.error("❌ No token provided!");
    connection.socket.close(1008, "Missing token");
    return;
  }

  // Extraer playerId
  let playerId = getHeaderValue(req, "x-player-id");
  if (!playerId && req.raw?.headers) {
    playerId = req.raw.headers["x-player-id"] as string;
  }

  // 🔥 Extraer game mode del header o query
  let gameMode = getHeaderValue(req, "x-game-mode") || "local"; // default: local
  if (req.query && typeof req.query === 'object') {
    gameMode = (req.query as any).mode || gameMode;
  }

  console.log("Game mode:", gameMode);

  let clientId: string;
  if (!playerId) {
    clientId = `guest_${Math.random().toString(36).substring(2, 9)}`;
    console.warn(`⚠️ No x-player-id → guest mode: ${clientId}`);
  } else {
    clientId = playerId;
    console.log(`✅ Player ID: ${clientId}`);
  }

  playerConnections.set(clientId, connection);
  
  // 🔥 ASIGNACIÓN SEGÚN MODO
  let assignedSide: "left" | "right" | "both";
  
  if (gameMode === "local") {
    // Modo LOCAL: controla ambos lados
    assignedSide = "both";
    playerSides.set(clientId, assignedSide);
    console.log(`🎮 LOCAL MODE: Player ${clientId} controls BOTH paddles`);
  } else {
    // Modo REMOTE: asignar un lado
    if (!playerSides.has(clientId)) {
      const sides = Array.from(playerSides.values());
      assignedSide = sides.includes("left") ? "right" : "left";
      playerSides.set(clientId, assignedSide);
      console.log(`🎮 REMOTE MODE: Player ${clientId} → ${assignedSide} paddle`);
    } else {
      assignedSide = playerSides.get(clientId)!;
    }
  }

  // Enviar asignación después del handshake
  setImmediate(() => {
    try {
      connection.socket.send(JSON.stringify({
        event: "assigned",
        side: assignedSide,
        mode: gameMode
      }));
      console.log(`📤 Sent assignment to ${clientId}: ${assignedSide} (${gameMode})`);
    } catch (err) {
      console.error(`❌ Error sending assignment:`, err);
    }
  });

  /**
   * 🔥 MANEJAR MENSAJES CON SIDE EXPLÍCITO
   */
  connection.socket.on("message", (message: Buffer) => {
    try {
      const msg = JSON.parse(message.toString());
      
      if (isPaused) return;

      const playerSide = playerSides.get(clientId);
      if (!playerSide) return;

      // 🔥 El frontend envía { event: "moveUp", side: "left" | "right" }
      const targetSide = msg.side || "left"; // fallback

      // Si es modo "both", permite cualquier lado
      // Si es modo single, solo permite su lado asignado
      if (playerSide === "both" || playerSide === targetSide) {
        if (msg.event === "moveUp") {
          moveUp(targetSide);
          console.log(`🎮 ${clientId} moved ${targetSide} UP`);
        } else if (msg.event === "moveDown") {
          moveDown(targetSide);
          console.log(`🎮 ${clientId} moved ${targetSide} DOWN`);
        }
      } else {
        console.warn(`⚠️ ${clientId} tried to move ${targetSide} but is assigned to ${playerSide}`);
      }
    } catch (e) {
      console.error("Invalid message:", message.toString(), e);
    }
  });

  connection.socket.on("error", (err: Error) => {
    console.error(`❌ WebSocket error (${clientId}):`, err);
  });

  connection.socket.on("close", () => {
    console.log(`👋 Player ${clientId} disconnected`);
    playerConnections.delete(clientId);
    playerSides.delete(clientId);
  });
});

// Game loop
let frameCount = 0;
setInterval(() => {
  if (!isPaused && playerConnections.size > 0) {
    const state = updateGame();
    const message = JSON.stringify({ event: "gameState", data: state });

    if (frameCount % 300 === 0) { // Log cada 5 segundos
      console.log(`📡 Broadcasting frame ${frameCount} to ${playerConnections.size} players`);
    }
    frameCount++;

    for (const [playerId, connection] of playerConnections.entries()) {
      try {
        if (connection.socket.readyState === 1) {
          connection.socket.send(message);
        }
      } catch (err) {
        console.error(`Error sending to ${playerId}:`, err);
      }
    }
  }
}, 1000 / 60);

const PORT = process.env.PORT || 3000;
app.listen({ port: Number(PORT), host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Pong server running at ${address}`);
});