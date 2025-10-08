import { Ball, AIKeyEvent, AIActionResponse } from '../utils/types';

function mod(n: number, m: number) { return ((n % m) + m) % m; }


/**
 * Predicts the Y position of the ball when it reaches targetX, considering bounces.
 * Returns null if the ball is not moving towards targetX.
 */
export function predictBallY(ball: Ball, fieldHeight: number, targetX: number): number | null
{
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
 * Generates a sequence of keyboard events to move the paddle for a given interval (dtSeconds).
 * This acts as a "planner" for the next second.
 */
export function computeAIKeyEvents(
    paddleCenter: number,
    paddleHeight: number,
    ball: Ball,
    fieldHeight: number,
    targetX: number,
    paddleSpeed: number, // px per second
    dtSeconds = 1.0,
    aimBias = 0,
    mistakeProb = 0.08
): AIActionResponse {
    const events: AIKeyEvent[] = [];
    let mistakeMade = false;

    // 1. Predicts the ball and movement target
    const predictedY = predictBallY(ball, fieldHeight, targetX);
    // If we can't predict, aim for the center
    const targetY = (predictedY === null ? fieldHeight / 2 : predictedY) + aimBias;

    // 2. Calculate the necessary movement
    const diff = targetY - paddleCenter;
    const distanceToMove = Math.abs(diff);

    // If no movement is needed, do nothing
    if (distanceToMove < 5)
    {
        return { events, debug: { predictedY, targetY, paddleCenterBefore: paddleCenter, paddleCenterAfter: paddleCenter, mistakeMade: false } };
    }

    // Borders checking to prevent the paddle from getting stuck
    const paddleTopY = paddleCenter - paddleHeight / 2;
    const paddleBottomY = paddleCenter + paddleHeight / 2;
    const moveDirection: 'up' | 'down' = diff < 0 ? 'up' : 'down';
    const BORDER_TOLERANCE = 5;

    if (moveDirection === 'up' && paddleTopY <= BORDER_TOLERANCE)
        return { events, debug: { predictedY, targetY, paddleCenterBefore: paddleCenter, paddleCenterAfter: paddleCenter, mistakeMade: false } };
    if (moveDirection === 'down' && paddleBottomY >= fieldHeight - BORDER_TOLERANCE)
        return { events, debug: { predictedY, targetY, paddleCenterBefore: paddleCenter, paddleCenterAfter: paddleCenter, mistakeMade: false } };

    // 3. Calculate the time needed for the movement
    // Time (s) = Distance (px) / Speed (px/s)
    const timeNeededSeconds = distanceToMove / paddleSpeed;

    // The movement time cannot be greater than the decision interval
    const moveDurationSeconds = Math.min(timeNeededSeconds, dtSeconds);
    let moveDurationMs = Math.round(moveDurationSeconds * 1000);

    const keyName = moveDirection === 'up' ? 'ArrowUp' : 'ArrowDown';

    // 4. Simulate human errors
    if (Math.random() < mistakeProb)
    {
        mistakeMade = true;
        // The mistake can be hesitation, moving in the wrong direction, or moving for less time
        moveDurationMs *= (0.2 + Math.random() * 0.5); // Move between 20% and 70% of the needed time
    }

    // 5. Generate the event plan if movement is needed
    if (moveDurationMs > 50)
    { // Only generate events if the movement is significant
        events.push({ type: 'keydown', key: keyName, atMs: 0 }); // Start moving immediately
        events.push({ type: 'keyup', key: keyName, atMs: moveDurationMs }); // Stop moving after the calculated duration
    }

    // 6. Finalize and return the plan
    const clampedEvents = events.map(e => ({ ...e, atMs: Math.min(Math.round(dtSeconds * 1000), e.atMs) }));

    return {
        events: clampedEvents,
        debug: {
            predictedY,
            targetY,
            paddleCenterBefore: paddleCenter,
            paddleCenterAfter: paddleCenter, // The executor will calculate the final position
            mistakeMade
        }
    } as AIActionResponse;
}