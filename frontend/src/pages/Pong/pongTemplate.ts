export function getLocalPongHtml(): string {
    return `
    <div class="pong-container">
      <h1>Pong - Local Game</h1>
      <div id="modeSelection" style="display:none">
        <button id="localBtn" class="pong-button">Play Local</button>
        <button id="onlineBtn" class="pong-button">Play Online</button>
      </div>
      <div id="roleInfo"></div>

      <div class="scoreboard-container">
        <button id="startGameBtn" class="pong-button hidden">Start Game</button>
        <div id="scoreboard" class="scoreboard">0 : 0</div>
        <button id="playAgainBtn" class="pong-button hidden">Play Again</button>
      </div>

      <p id="winnerMessage" class="winner-message" style="display: none;"></p>

      <div id="gameInfo" class="game-info" style="display:none;">
        <div class="controls left-controls">
          <p>Left Player: W / S</p>
        </div>

        <canvas id="pongCanvas" width="800" height="600"></canvas>

        <div class="controls right-controls">
          <p>Right Player: ↑ / ↓</p>
        </div>
      </div>

      <div id="extraInfo" class="extra-info">
        <p>Press 'P' to Pause/Resume</p>
      </div>
    </div>
  `;
}

export function getRemotePongHtml(): string {
    return `
    <div class="pong-container">
      <h1>Pong - Remote Game</h1>
      <div id="modeSelection">
        <button id="localBtn" class="pong-button">Play Local</button>
        <button id="onlineBtn" class="pong-button">Play Online</button>
      </div>
      <div id="roleInfo"></div>

      <div class="scoreboard-container">
        <button id="startGameBtn" class="pong-button hidden">Start Game</button>
        <div id="scoreboard" class="scoreboard">0 : 0</div>
        <button id="playAgainBtn" class="pong-button hidden">Play Again</button>
      </div>

      <p id="winnerMessage" class="winner-message" style="display: none;"></p>

      <div id="gameInfo" class="game-info" style="display:none;">
        <div class="controls left-controls">
          <p>Left Player: W / S</p>
        </div>

        <canvas id="pongCanvas" width="800" height="600"></canvas>

        <div class="controls right-controls">
          <p>Right Player: ↑ / ↓</p>
        </div>
      </div>

      <div id="extraInfo" class="extra-info">
        <p>Press 'P' to Pause/Resume</p>
      </div>
    </div>
  `;
}