/**
 * Simple AI Opponent Microservice for Pong
 * @brief Listens for game state and returns a sequence of key events.
 */

import express from 'express';
import cors from 'cors';
import { GameState, Side, AIActionResponse } from './utils/types';
import { computeAIKeyEvents } from './services/ai';

// --- Environment and Game Constants ---
const PORT = Number(process.env.PORT || 3010);

// Game dimensions and rules
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;
const PADDLE_OFFSET_X = 30;
const PADDLE_SPEED = 300; // Velocidad de la pala en px/segundo

// Calculated constants
const FIELD_HEIGHT = CANVAS_HEIGHT;
const PADDLE_X_LEFT = PADDLE_OFFSET_X;
const PADDLE_X_RIGHT = CANVAS_WIDTH - PADDLE_OFFSET_X - PADDLE_WIDTH;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

/**
* POST /ai/update
* body: { state: GameState, side: 'left'|'right', dt?: number }
* returns: AIActionResponse -> The sequence of key events for the AI paddle.
*/
app.post('/ai/update', (req, res) => {
    try {
        const { state, side, dt } = req.body as { state: GameState; side: Side; dt?: number };
        if (!state || !side) {
            return res.status(400).json({ error: 'Missing state or side' });
        }

        const paddle = side === 'left' ? state.paddles.left : state.paddles.right;
        const targetX = side === 'left' ? PADDLE_X_LEFT : PADDLE_X_RIGHT;
        const dtSeconds = typeof dt === 'number' && dt > 0 ? dt : 1.0; // Intervalo de decisión de 1 segundo por defecto

        // La 'y' que recibimos es el borde superior, la IA necesita el centro.
        const currentCenterY = paddle.y + PADDLE_HEIGHT / 2;

        // Llamamos a la función original que genera eventos de teclado
        const aiResponse: AIActionResponse = computeAIKeyEvents(
            currentCenterY,
            PADDLE_HEIGHT,
            state.ball,
            FIELD_HEIGHT,
            targetX,
            PADDLE_SPEED,
            dtSeconds
        );

        return res.json(aiResponse);

    } catch (err) {
        console.error("AI Update Error:", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Pong AI microservice listening on port ${PORT}`);
});