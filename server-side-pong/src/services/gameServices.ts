/**
 * @file gameServices.ts
 * @brief Core game state and logic for Pong
 */
import { GameState, Paddle, Ball } from "../";

/**
 * Constants
 */
const FIELD_WIDTH = 600;
const FIELD_HEIGHT = 400;
const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 10;
const PADDLE_SPEED = 20;
const BALL_SPEED = 5;

/**
 * Game State setting
 */
let gameState: GameState = resetGame();

/**
 *  Game API
 */ 
export function getGameState(): GameState
{
	return gameState;
}


/**
 * 
 * @returns {GameState} a initial stting gamestate
 */
export function resetGame(): GameState
{
	gameState =
	{
		paddles:
		{
			left: { y: FIELD_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
			right: { y: FIELD_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
		},
			ball:
		{
			x: FIELD_WIDTH / 2,
			y: FIELD_HEIGHT / 2,
			vx: BALL_SPEED,
			vy: BALL_SPEED,
		},
		scores:
		{
			left: 0,
			right: 0,
		},
	};
	return gameState;
}

export function moveUp(side: "left" | "right"): GameState
{
	gameState.paddles[side].y = Math.max(0,gameState.paddles[side].y - PADDLE_SPEED);
	return gameState;
}

export function moveDown(side: "left" | "right"): GameState
{
	gameState.paddles[side].y = Math.min(FIELD_HEIGHT - PADDLE_HEIGHT,gameState.paddles[side].y + PADDLE_SPEED);
	return gameState;
}

/**
 * Update ball position, handle collisions & scoring
 */
export function updateGame(): GameState
{
	const ball = gameState.ball;

	/**
	 * Move ball
	 */
	ball.x += ball.vx;
	ball.y += ball.vy;

	/**
	 * Collitions for top and bottom
	 */
	if (ball.y <= 0 || ball.y >= FIELD_HEIGHT)
	{
		ball.vy *= -1;
	}

	/**
	 * Paddle collitions
	 */
	const leftPaddle = gameState.paddles.left;
	const rightPaddle = gameState.paddles.right;

	/**
	 * Left Paddle
	 */
	if (ball.x <= PADDLE_WIDTH && ball.y >= leftPaddle.y && ball.y <= leftPaddle.y + PADDLE_HEIGHT)
	{
		ball.vx *= -1;
		ball.x = PADDLE_WIDTH; // weird but apparently to prevent sticking
	}

	/**
	 * Right Paddle
	 */
	if (ball.x >= FIELD_WIDTH - PADDLE_WIDTH && ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + PADDLE_HEIGHT)
	{
		ball.vx *= -1;
		ball.x = FIELD_WIDTH - PADDLE_WIDTH; // weird but apparently to prevent sticking
	}

	/**
	 * Scoring
	 */
	if (ball.x < 0)
	{
		gameState.scores.right += 1;
		resetBall(-1);
	}
	else if (ball.x > FIELD_WIDTH)
	{
		gameState.scores.left += 1;
		resetBall(1);
	}

	return gameState;
}

/**
 * Helper
 * @param direction 
 */
function resetBall(direction: number)
{
	gameState.ball.x = FIELD_WIDTH / 2;
	gameState.ball.y = FIELD_HEIGHT / 2;
	gameState.ball.vx = BALL_SPEED * direction;
	gameState.ball.vy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
}
