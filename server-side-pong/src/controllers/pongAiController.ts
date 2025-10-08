/**
 * @file pongAiController.ts
 * @brief Manages game logic for Player vs. AI matches.
 */
import { FastifyInstance } from "fastify";
import { Server } from "socket.io";
import fetch from "node-fetch";
import { getGameState, moveUp, moveDown, isGameEnded } from "../services/gameServices";
import { getIsPaused } from "./gameControllers";

const aiIntervals = new Map<string, NodeJS.Timeout>();
const aiMovementTimers = new Map<string, NodeJS.Timeout[]>();

function stopAi(roomId: string)
{
    if (aiIntervals.has(roomId))
    {
        clearInterval(aiIntervals.get(roomId));
        aiIntervals.delete(roomId);
    }
    // Clear any scheduled movement timers
    if (aiMovementTimers.has(roomId))
    {
        aiMovementTimers.get(roomId)?.forEach(clearTimeout);
        aiMovementTimers.delete(roomId);
    }
    console.log(`[AI] Stopped for room ${roomId}`);
}

// Simulate the keyboard keys state for the ai
const aiKeyState = new Map<string, { up: boolean, down: boolean }>();

export async function pongAiController(fastify: FastifyInstance, io: Server)
{
    fastify.post("/game/:roomId/start-ai", async (req, reply) =>
    {
        const { roomId } = req.params as { roomId: string };

        if (aiIntervals.has(roomId))
            return reply.send({ message: "AI already running." });

        console.log(`[AI] Starting for room ${roomId}`);
        aiKeyState.set(roomId, { up: false, down: false });

        // Planning loop for the ai, 1 second
        const intervalId = setInterval(async () => {
            const state = getGameState(roomId);
            const isPaused = getIsPaused(roomId);

            // Stop ai ionce the game ends
            if (state.gameEnded)
            {
                stopAi(roomId);
                return;
            }

            // If the game is paused, just skip this planning cycle.
            if (isPaused)
                return;


            try {
                const aiServiceUrl = process.env.AI_SERVICE_URL || "http://ai-service:7010";
                const response = await fetch(`${aiServiceUrl}/ai/update`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ state, side: "right", dt: 1.0 }), // dt es 1 segundo
                });

                if (!response.ok) throw new Error(`AI service error: ${response.statusText}`);

                const { events } = await response.json() as { events: { type: string, key: string, atMs: number }[] };

                // Clean old plans before executing the new one
                aiMovementTimers.get(roomId)?.forEach(clearTimeout);
                aiMovementTimers.set(roomId, []);

                // Execute the plan
                for (const event of events)
                {
                    const timer = setTimeout(() =>
                    {
                        const keys = aiKeyState.get(roomId);
                        if (!keys) return;

                        if (event.key === 'ArrowUp')
                            keys.up = (event.type === 'keydown');
                        else if (event.key === 'ArrowDown')
                            keys.down = (event.type === 'keydown');
                    }, event.atMs);
                    aiMovementTimers.get(roomId)?.push(timer);
                }

            }
            catch (error) {
                console.error("[AI] Failed to get plan from AI service:", error);
                stopAi(roomId);
            }
        }, 1000); // <-- RESTRICCIÓN: 1 CALL PER SECOND

        aiIntervals.set(roomId, intervalId);
        io.to(roomId).emit("gameReady", { roomId });
        reply.send({ message: "AI started" });
    });

    // AI movement loop (60 times per second, like the game)
    setInterval(() => {
        for (const [roomId, keys] of aiKeyState.entries()) {
            if (getIsPaused(roomId) || isGameEnded(roomId)) continue;
            
            if (keys.up) moveUp("right", roomId);
            if (keys.down) moveDown("right", roomId);
        }
    }, 1000 / 60);

    fastify.post("/game/:roomId/stop-ai", async (req, reply) => {
        const { roomId } = req.params as { roomId: string };
        stopAi(roomId);
        reply.send({ message: "AI stopped" });
    });
}