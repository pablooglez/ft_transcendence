/**
 * @file pong.ts
 * @brief Frontend logic for the server-side Pong game page.
 */

import { io } from "socket.io-client";

let socket: any;
let ctx: CanvasRenderingContext2D | null = null;

interface Paddle
{
	y: number;
}

interface GameState
{
	paddles:
	{
		left: Paddle;
		right: Paddle;
	};
}


/**
 * @brief Holds the current game state received from the server.
 */
let gameState: GameState =
{
    paddles:
    {
        left: { y: 250 },
        right: { y: 250 },
    },
};

/**
 * @brief Returns the HTML markup for the Pong game page.
 * @returns {string} HTML string for the Pong page.
 */
export function pongPage()
{
	return `
		<h1>Server-Side Pong (Paddles Only)</h1>
		<canvas id="pongCanvas" width="800" height="600"></canvas>
		<p>Use W/S to move Left Paddle, ArrowUp/ArrowDown for Right Paddle</p>
		`;
}
/**
 * @brief Sets up event handlers and socket connection for the Pong game.
 */
export function pongHandlers()
{
	const canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
	ctx = canvas.getContext("2d");

	// Connect to Pong backend microservice
	socket = io("http://localhost:3000");

	// Init REST call (optional)
	fetch("http://localhost:3000/game/init", { method: "POST" });

    /**
     * @brief Listen for game state updates from the server.
     */
	socket.on("paddles", (state: GameState) =>
		{
			gameState = state;
			draw();
		});

    /**
     * @brief Handle paddle movement input from the users.
     */
	window.addEventListener("keydown", (e) =>
		{
			if (e.key === "w") socket.emit("moveUp", "left");
			if (e.key === "s") socket.emit("moveDown", "left");
			if (e.key === "ArrowUp") socket.emit("moveUp", "right");
			if (e.key === "ArrowDown") socket.emit("moveDown", "right");
		});
	draw();
}

/**
 * @brief Draws the current game state (paddles) on the canvas.
 * ctx =  canvas rendering context 2D
 */
function draw()
{
	if (!ctx) return;
	ctx.clearRect(0, 0, 800, 600);

	// Draw paddles
    ctx.fillStyle = "black";
    ctx.fillRect(30, gameState.paddles.left.y, 20, 100);
    ctx.fillRect(750, gameState.paddles.right.y, 20, 100);
}
