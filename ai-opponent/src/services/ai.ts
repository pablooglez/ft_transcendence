import { Ball, AIKeyEvent, AIActionResponse } from '../utils/types';


function mod(n: number, m: number) { return ((n % m) + m) % m; }

/**
 * Predicts the Y coordinate where the ball will reach targetX, simulating bounces on top/bottom.
 * Returns null if the ball is moving away (t <= 0).
 */
export function predictBallY(ball: Ball, fieldHeight: number, targetX: number): number | null {
    if (ball.dx === 0) return null;
    const t = (targetX - ball.x) / ball.dx;
    if (t <= 0) return null;


    let predictedY = ball.y + ball.dy * t;
    const period = 2 * fieldHeight;
    predictedY = mod(predictedY, period);
    if (predictedY > fieldHeight) predictedY = period - predictedY;
    return predictedY;
}

/**
 * Generates a sequence of keyboard events to move the paddle for a given interval.
 */
export function computeAIKeyEvents(
    paddleCenter: number,
    paddleHeight: number,
    ball: Ball,
    fieldHeight: number,
    targetX: number,
    paddleSpeed: number,
    dtSeconds = 1,
    aimBias = 0,
    mistakeProb = 0.08, // 8% of error probability
    maxJitterMs = 200
): AIActionResponse
{
    const predicted = predictBallY(ball, fieldHeight, targetX);
    const targetY = (predicted === null ? fieldHeight / 2 : predicted) + aimBias;

    const diff = targetY - paddleCenter;
    const neededMove = Math.abs(diff);
    const maxMove = paddleSpeed * dtSeconds;
    const actualMove = Math.min(neededMove, maxMove);
    const moveDirection: 'up' | 'down' = diff < 0 ? 'up' : 'down';

    const moveDurationSeconds = actualMove / paddleSpeed;
    const moveDurationMs = Math.round(moveDurationSeconds * 1000);

    const jitter = Math.floor(Math.random() * (maxJitterMs + 1));
    const durationJitter = Math.floor((Math.random() - 0.5) * 150);
    let finalDurationMs = Math.max(0, moveDurationMs + durationJitter);

    const mistakeRoll = Math.random();
    let mistakeMade = false;
    const events: AIKeyEvent[] = [];

    if (actualMove < 1)
    {
        // No movement needed}
    }
    else {
        // Movement and mistake logic
        if (mistakeRoll < mistakeProb)
        {
            mistakeMade = true;
            if (Math.random() < 0.4)
            {
                // inverts the direction briefly
                const wrongDir = moveDirection === 'up' ? 'down' : 'up';
                const wrongDur = Math.max(50, Math.floor(finalDurationMs * 0.5));
                events.push({ type: 'keydown', key: wrongDir === 'up' ? 'ArrowUp' : 'ArrowDown', atMs: jitter });
                events.push({ type: 'keyup', key: wrongDir === 'up' ? 'ArrowUp' : 'ArrowDown', atMs: jitter + wrongDur });
                finalDurationMs = Math.max(50, Math.floor(finalDurationMs * 0.6));
            }
            else
            {
                // Short pulse 
                finalDurationMs = Math.max(50, Math.floor(finalDurationMs * 0.4));
            }
        }

        // Correct event or correction of previous event
        const keyName = moveDirection === 'up' ? 'ArrowUp' : 'ArrowDown';
        events.push({ type: 'keydown', key: keyName, atMs: jitter });
        events.push({ type: 'keyup', key: keyName, atMs: jitter + finalDurationMs });
    }

    const maxMs = Math.max(0, Math.round(dtSeconds * 1000));
    const clamped = events.map(e => ({ ...e, atMs: Math.min(maxMs, Math.max(0, e.atMs)) }));

    const effectiveSignedMove = (moveDirection === 'down' ? 1 : -1) * (finalDurationMs / 1000) * paddleSpeed * (mistakeMade ? 0.6 : 1);
    const paddleCenterAfter = Math.max(paddleHeight / 2, Math.min(fieldHeight - paddleHeight / 2, paddleCenter + effectiveSignedMove));

    return {
        events: clamped,
        debug: {
            predictedY: predicted,
            targetY,
            paddleCenterBefore: paddleCenter,
            paddleCenterAfter,
            mistakeMade
        }
    } as AIActionResponse;
}