const gameContainer = document.querySelector('.game-container');
const ball = document.getElementById('ball');
const paddle1 = document.getElementById('paddle1');
const paddle2 = document.getElementById('paddle2');
const player1ScoreEl = document.getElementById('player1-score');
const player2ScoreEl = document.getElementById('player2-score');
const levelDisplay = document.getElementById('level');
const backgroundMusic = document.getElementById('background-music');
const playButton = document.getElementById('play-button');
const startButton = document.getElementById('start-button');
const startOverlay = document.querySelector('.start-overlay');
const victoryOverlay = document.querySelector('.victory-overlay');
const victoryMessageEl = document.getElementById('victory-message');
const nextButton = document.getElementById('next-button');

let player1Score = 0;
let player2Score = 0;
let level = 1;
let ballSpeedX = 1.5; // Reduced ball speed for a slower game
let ballSpeedY = 1.5;
let ballPosX = gameContainer.clientWidth / 2;
let ballPosY = gameContainer.clientHeight / 2;
let paddle1Y = gameContainer.clientHeight / 2 - paddle1.clientHeight / 2;
let gameRunning = false;

// Neon Colors Array for Levels
const neonColors = ["#FF69B4", "#1E90FF", "#32CD32", "#FF4500", "#FFD700", "#8A2BE2", "#FF6347", "#00FA9A"];

// Function to Update Neon Color Based on Level
function updateNeonColor() {
  const colorIndex = (level - 1) % neonColors.length;
  const neonColor = neonColors[colorIndex];
  document.documentElement.style.setProperty('--neon-color', neonColor);
}

// Toggle background music play/pause
playButton.addEventListener('click', () => {
  if (backgroundMusic.paused) {
    backgroundMusic.play();
    playButton.textContent = 'Pause Music';
  } else {
    backgroundMusic.pause();
    playButton.textContent = 'Play Music';
  }
});

// Start button functionality
startButton.addEventListener('click', () => {
  startOverlay.style.display = 'none';
  gameContainer.style.filter = 'none';
  gameRunning = true;
  update();
});

function resetBall() {
  ballPosX = gameContainer.clientWidth / 2;
  ballPosY = gameContainer.clientHeight / 2;
  ballSpeedX = -ballSpeedX; // Reverse ball direction on reset
}

function levelUp() {
  if (level < 1000) {
    level++;
    levelDisplay.textContent = level;
    updateNeonColor(); // Change neon color at each level
  }
}

const victoryMessages = ["Epic!", "Right On!", "Awesome!", "Nice!", "Fantastic!", "Unstoppable!"];
function showVictoryMessage() {
  gameRunning = false;
  const randomMessage = victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
  victoryMessageEl.textContent = randomMessage;
  victoryOverlay.style.display = 'flex';
}

nextButton.addEventListener('click', () => {
  victoryOverlay.style.display = 'none';
  levelUp();
  gameRunning = true;
  update();
});

function update() {
  if (!gameRunning) return;

  // Ball movement
  ballPosX += ballSpeedX;
  ballPosY += ballSpeedY;

  // Ball collision with top/bottom walls
  if (ballPosY <= 0 || ballPosY + ball.clientHeight >= gameContainer.clientHeight) {
    ballSpeedY = -ballSpeedY;
  }

  // AI movement with dynamic speed based on level
  const aiSpeed = Math.min(1 + level * 0.05, 10); // Limit AI speed as levels increase
  if (ballPosY < paddle1Y + paddle1.clientHeight / 2) {
    paddle1Y -= aiSpeed;
  } else {
    paddle1Y += aiSpeed;
  }

  // Ball collision with paddles and repel physics
  function applyImpactEffect() {
    ball.classList.add("impact");
    setTimeout(() => ball.classList.remove("impact"), 100);
  }

  if (
    (ballPosX <= paddle1.offsetLeft + paddle1.clientWidth &&
      ballPosY + ball.clientHeight >= paddle1Y &&
      ballPosY <= paddle1Y + paddle1.clientHeight) ||
    (ballPosX + ball.clientWidth >= paddle2.offsetLeft &&
      ballPosY + ball.clientHeight >= paddle2.getBoundingClientRect().top &&
      ballPosY <= paddle2.getBoundingClientRect().top + paddle2.clientHeight)
  ) {
    const paddle = ballPosX < gameContainer.clientWidth / 2 ? paddle1 : paddle2;
    const paddleCenter = paddle.getBoundingClientRect().top + paddle.clientHeight / 2;
    const impactPoint = (ballPosY + ball.clientHeight / 2) - paddleCenter;
    ballSpeedY += impactPoint * 0.1; // Increase Y-speed based on impact point
    ballSpeedX = -ballSpeedX * 1.1; // Increase X-speed slightly on impact

    applyImpactEffect();
  }

  // Score update - Ensure ball only goes out on AI's side, not the player's side
  if (ballPosX <= 0) {
    player2Score++;
    player2ScoreEl.textContent = player2Score;
    resetBall();
    showVictoryMessage();
  } else if (ballPosX + ball.clientWidth >= gameContainer.clientWidth) {
    player1Score++;
    player1ScoreEl.textContent = player1Score;
    resetBall();
  }

  // Move AI paddle and ball
  paddle1.style.top = `${paddle1Y}px`;
  ball.style.left = `${ballPosX}px`;
  ball.style.top = `${ballPosY}px`;

  requestAnimationFrame(update);
}

// Mouse movement event listener for controlling the player's paddle
gameContainer.addEventListener('mousemove', (e) => {
  const containerBounds = gameContainer.getBoundingClientRect();
  const mouseY = e.clientY - containerBounds.top;

  paddle2.style.top = `${Math.min(
    gameContainer.clientHeight - paddle2.clientHeight,
    Math.max(0, mouseY - paddle2.clientHeight / 2)
  )}px`;
});

// Initialize Neon Color
updateNeonColor();
