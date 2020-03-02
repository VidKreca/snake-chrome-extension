/*
  Pure JavaScript, CSS and HTML snake
  By Vid Kreča, 13.2.2020
  Notes:
  Game loop:
    - check for collisions (wall, food, snake itself)
      - if collision with wall - end game
      - if collision with food - add new node, spawn new food
      - if collision with itself - end game
    - advance snake (delete last node, add new)
    - check if end of game (spawned enough food to end the game)
*/
var debug = true;

// Constants
const SNAKE_COLOR = "black";
const SNAKE_HEAD_COLOR = "white";
const CANVAS_COLOR = "gray";
const FOOD_COLOR = "red";

const GAME_SPEED = 150; // More is slower
const INIT_SNAKE_SIZE = 10;
const step = 10;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let h = canvas.height;
let w = canvas.width;

// Variables

let snake = [];
function generateSnake() {
  for (i = INIT_SNAKE_SIZE; i > 0; i--) {
    let tx = (i+1)*step;
    let ty = (h/2);
    snake.push({x: tx, y: ty});
  }
}
generateSnake();

let dx = step, dy = 0;
let interval;
let score = 0;
let changingDir = false;
let food;
let addPart = false;


document.body.onload = function() {
  start();
}


// Initialization function
function start() {
  getHighscore();

  // Start game loop
  interval = setInterval(loop, GAME_SPEED);
  generateFood();

  if (debug) console.log("Game started!");
}

function restart() {
  snake = [];
  generateSnake();
  dx = step; dy = 0;
  score = 0;
  changingDir = false;
  food = null;
  generateFood();
  addPart = false;
  clearInterval(interval);
  start();
}
document.getElementById("restartBtn").addEventListener("click", restart);


// Ends the game, displays score
function end(win = false) {
  clearInterval(interval);
  let text = (win) ? "You won :)" : "You lost :(";

  // Display end text
  ctx.fillStyle = "white";
  ctx.fillRect(15, 25, 80, 70);

  var txtSize = 15;
  ctx.fillStyle = "red";
  ctx.font = txtSize+"px Arial bold";
  ctx.fillText("Game over!", 20, 40);
  ctx.fillText(text, 20, 50+txtSize);
  ctx.fillText("Score: "+score, 20, 60+txtSize*2);

  if (debug) console.log("Game over!\n"+text+"\nScore: "+score);

  saveHighscore();
}


// Highscore functions
function saveHighscore() {
  var currHighscore = document.getElementById("highscore").innerText.split(":")[1];
  if (score > currHighscore) {
    chrome.storage.sync.set({ "highscore" : score }, function() {});
  }
}
function getHighscore() {
  chrome.storage.sync.get("highscore", function(items) {
    if (!chrome.runtime.error) {
      document.getElementById("highscore").innerText = "Highscore: "+items.highscore;
    }
  });
}


// Game loop
function loop() {
  if (score > ((w/step)*(h/step)-INIT_SNAKE_SIZE)) end(true);
  clear();
  drawSnake();
  collisionCheck();
  advanceSnake();
}


// Clear canvas
function clear() {
  // Set canvas background color
  ctx.fillStyle = CANVAS_COLOR;
  ctx.fillRect(0, 0, w, h);

  // Draw food
  ctx.fillStyle = FOOD_COLOR;
  ctx.fillRect(food.x, food.y, step, step);
}


// Draw snake body
function drawSnake() {
  let first = true;
  snake.forEach((part) => {
    if (first) {
      ctx.fillStyle = SNAKE_HEAD_COLOR;
      first = false;
    }
    else ctx.fillStyle = SNAKE_COLOR;

    ctx.fillRect(part.x, part.y, step, step);
  });
}


// Moves snake in current moving direction
function advanceSnake() {
  changingDir = false;

  if (addPart) addPart = false;
  else snake.pop() // Removes last element

  cx = snake[0].x;
  cy = snake[0].y;
  if (dx != 0) {  // Left/Right
    snake.unshift({x: cx+dx, y: cy});
  }
  else if (dy != 0) { // Up/Down
    snake.unshift({x: cx, y: cy+dy});
  }
}


// Checks for all types of collisions
function collisionCheck() {
  cx = snake[0].x;
  cy = snake[0].y;

  // Check snake->snake collision
  snake.forEach((part, i) => {
    if (i != 0 && part.x == cx && part.y == cy) end();
  });

  // Check snake->wall collision
  if (cx < 0 || cx > w-(1*step)) end();
  if (cy < 0 || cy > h-(1*step)) end();

  // Check snake->food collision
  if (cx == food.x && cy == food.y) {
    score++;
    document.getElementById("score").innerHTML = "Score: " + score;

    generateFood();
    addPart = true;
  }
}


// Generate random food location
function generateFood() {
  let rx, ry;
  let s = true;

  while (s) {
    s = false;
    rx = (Math.random() * w-1);
    ry = (Math.random() * h-1);
    rx -= rx % step;
    ry -= ry % step;

    snake.forEach((part) => {
      if (part.x == rx || part.y == ry) s = true;
    });
  }

  food = {x: rx, y: ry};
  if (debug) console.log("Food at: " + rx + ", " + ry);
}


// Event listener for keyboard input
document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
  const LEFT = 37;
  const RIGHT = 39;
  const UP = 38;
  const DOWN = 40;
  let key = event.keyCode;

  if (changingDir) return;

  switch (key) {
    case LEFT: if (dx != step) { dx=-step; dy=0; } break;
    case RIGHT: if (dx != -step) { dx=step; dy=0; } break;
    case UP: if (dy != step) { dx=0; dy=-step; } break;
    case DOWN: if (dy != -step) { dx=0; dy=step; } break;
  }
  changingDir = true;
}
