/**
 * @file pongAiController.ts
 * @brief Manages game logic for Player vs. AI matches.
 */
import { FastifyInstance } from "fastify";
import { Server } from "socket.io";
import { getGameState, moveUp, moveDown } from "../services/gameServices";
import fetch from "node-fetch";

// Types
interface AIKeyEvent {
    type: 'keydown' | 'keyup';
    key: 'ArrowUp' | 'ArrowDown';
    atMs: number;
}

interface AIActionResponse {
    events: AIKeyEvent[];
}

const aiIntervals = new Map<string, NodeJS.Timeout>();
const hasAiLoop = (roomId: string) => aiIntervals.has(roomId);
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:7010";

/**
 * Initiates the ai loop for a specific game room
 */
function startAiOpponent(roomId: string) {
    console.log(`[AI Controller] Starting AI loop for room: ${roomId}`);

    if (aiIntervals.has(roomId))
	{
        clearInterval(aiIntervals.get(roomId)!);
    }

    const interval = setInterval(async () =>
	{
        const state = getGameState(roomId);
        if (state.gameEnded)
		{
            console.log(`[AI Controller] Game ended in room ${roomId}. Stopping AI loop.`);
            clearInterval(interval);
            aiIntervals.delete(roomId);
            return;
        }

        try {
            const response = await fetch(`${AI_SERVICE_URL}/ai/update`,
			{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state, side: 'right', dt: 1 }), // dt: 1 segundo
            });

            if (!response.ok)
			{
                console.error(`[AI Controller] AI service error: ${response.statusText}`);
                return;
            }

            const aiResponse = await response.json() as AIActionResponse;

            for (const event of aiResponse.events)
			{
                if (event.type === 'keydown')
				{
                    if (event.key === 'ArrowUp')
					{
                        moveUp('right', roomId);
                    }
					else if (event.key === 'ArrowDown')
					{
                        moveDown('right', roomId);
                    }
                }
            }
        } catch (error)
		{
            console.error('[AI Controller] Failed to fetch AI move:', (error as Error).message);
            clearInterval(interval);
            aiIntervals.delete(roomId);
        }
    }, 1000); // one desicion per second

    aiIntervals.set(roomId, interval);
}

/**
 * Stops the AI loop for a specific room if it exists
 */
function stopAiOpponent(roomId: string)
{
    const interval = aiIntervals.get(roomId);
    if (!interval)
    {
        return;
    }

    clearInterval(interval);
    aiIntervals.delete(roomId);
    console.log(`[AI Controller] Stopped AI loop for room: ${roomId}`);
}

/**
 * Endpoint to start the game against the ai
 */
export async function pongAiController(fastify: FastifyInstance, io: Server)
{
    fastify.post("/game/:roomId/start-ai", async (req, reply) =>
	{
        const { roomId } = req.params as { roomId: string };
        
        startAiOpponent(roomId);

        // init the game automatically
        fastify.inject({ method: 'POST', url: `/game/${roomId}/resume` });

        return { message: "AI opponent activated for room " + roomId };
    });

    fastify.post("/game/:roomId/stop-ai", async (req, reply) =>
    {
        const { roomId } = req.params as { roomId: string };

        if (!hasAiLoop(roomId))
        {
            return { message: `AI loop already stopped for room ${roomId}` };
        }

        stopAiOpponent(roomId);
        return { message: "AI opponent stopped for room " + roomId };
    });
}