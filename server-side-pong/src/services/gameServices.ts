/**
 * @file gameServices
 * @brief Import from the index.ts the types
 */
import { GameState, Paddle} from "../";

const FIELD_HEIGHT = 400;
const PADDLE_HEIGHT = 80;
const PADDLE_SPEED = 20;

/**
 * initializes the paddles in the middle 
 */
let gameState: GameState =
{
	paddles:
	{
		left: { y: 200 },
		right: { y: 200 },
	},
};

/**
 * 
 * @returns {GameState} a structure with the state of the game
 */
export function getGameState(): GameState
{
	return gameState;
}

/**
 * 
 * @returns {GameState} a reseted state of the game 
 */
export function resetGame(): GameState
{
	gameState =
	{
	paddles:
		{
			left: { y: 200 },
			right: { y: 200 },
		},
	};
	return gameState;
}

/**
 * 
 * @param side the paddle side id
 * @returns {GameState} a new game state with the new position of the paddle
 */
export function moveUp(side: "left" | "right"): GameState
{
	gameState.paddles[side].y = Math.max(0, gameState.paddles[side].y - PADDLE_SPEED);
	return gameState;
}

/**
 * 
 * @param side the paddle side id
 * @returns {GameState} a new game state with the new position of the paddle
 */
export function moveDown(side: "left" | "right"): GameState
{
	gameState.paddles[side].y = Math.min(FIELD_HEIGHT - PADDLE_HEIGHT,gameState.paddles[side].y + PADDLE_SPEED);
	return gameState;
}
