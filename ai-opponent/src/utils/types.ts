export interface Paddle { y: number; }
export interface Ball { x: number; y: number; dx: number; dy: number; }
export interface Scores { left: number; right: number; }


export interface GameState {
    paddles: { left: Paddle; right: Paddle };
    ball: Ball;
    scores: Scores;
    gameEnded: boolean;
}


export type Side = 'left' | 'right';


// AI action/event types (simulated keyboard)
export type KeyName = 'ArrowUp' | 'ArrowDown';
export type KeyEventType = 'keydown' | 'keyup';


export interface AIKeyEvent{
    type: KeyEventType; // 'keydown' | 'keyup'
    key: KeyName; // ArrowUp | ArrowDown
    atMs: number; // relative ms from the start of the 1s interval (0..1000)
}


export interface AIActionResponse
{
    // Sequence of key events that the game should play (simulate) for the next interval
    events: AIKeyEvent[];
    // helpful debug info (optional)
    debug?: {
    predictedY: number | null;
    targetY: number;
    paddleCenterBefore: number;
    paddleCenterAfter: number;
    mistakeMade: boolean;
};
}