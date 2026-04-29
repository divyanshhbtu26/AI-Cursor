const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreDisplay = document.getElementById('score');

const gridSize = 20;
let snake = [];
let food = {};
let stone = {};
let gem = {};
let score = 0;
let direction = 'right';
let changingDirection = false;
let gameInterval;
let gameSpeed = 150; // milliseconds

function generateRandomPosition() {
    return {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
}

function resetGame() {
    snake = [
        { x: 10 * gridSize, y: 10 * gridSize },
        { x: 9 * gridSize, y: 10 * gridSize },
        { x: 8 * gridSize, y: 10 * gridSize }
    ];
    food = generateRandomPosition();
    stone = generateRandomPosition();
    gem = generateRandomPosition();
    score = 0;
    scoreDisplay.textContent = score;
    direction = 'right';
    changingDirection = false;
    gameSpeed = 150;
    clearInterval(gameInterval);
    startButton.textContent = "Start Game";
}

function drawSnakePart(snakePart) {
    ctx.fillStyle = 'yellow';
    ctx.strokeStyle = 'darkgreen';
    ctx.fillRect(snakePart.x, snakePart.y, gridSize, gridSize);
    ctx.strokeRect(snakePart.x, snakePart.y, gridSize, gridSize);
}

function drawFood() {
    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'darkgreen';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
    ctx.strokeRect(food.x, food.y, gridSize, gridSize);
}

function drawStone() {
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'darkgrey';
    ctx.fillRect(stone.x, stone.y, gridSize, gridSize);
    ctx.strokeRect(stone.x, stone.y, gridSize, gridSize);
}

function drawGem() {
    ctx.fillStyle = 'purple';
    ctx.strokeStyle = 'darkmagenta';
    ctx.fillRect(gem.x, gem.y, gridSize, gridSize);
    ctx.strokeRect(gem.x, gem.y, gridSize, gridSize);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.forEach(drawSnakePart);
    drawFood();
    drawStone();
    drawGem();
}

function advanceSnake() {
    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up':
            head.y -= gridSize;
            break;
        case 'down':
            head.y += gridSize;
            break;
        case 'left':
            head.x -= gridSize;
            break;
        case 'right':
            head.x += gridSize;
            break;
    }

    snake.unshift(head);

    const didEatFood = head.x === food.x && head.y === food.y;
    const didEatGem = head.x === gem.x && head.y === gem.y;

    if (didEatFood) {
        score += 10;
        scoreDisplay.textContent = score;
        food = generateRandomPosition();
    } else if (didEatGem) {
        score += 50;
        scoreDisplay.textContent = score;
        gem = generateRandomPosition();
        // Optional: Increase game speed or snake length more significantly
    } else {
        snake.pop();
    }

    if (head.x === stone.x && head.y === stone.y) {
        endGame();
    }

    if (checkCollision()) {
        endGame();
    }
    changingDirection = false;
}

function checkCollision() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > canvas.width - gridSize;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > canvas.height - gridSize;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

function endGame() {
    clearInterval(gameInterval);
    alert(`Game Over! Your score: ${score}`);
    startButton.textContent = "Play Again";
}

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    if (changingDirection) return;
    changingDirection = true;

    const keyPressed = event.keyCode;
    const goingUp = direction === 'up';
    const goingDown = direction === 'down';
    const goingLeft = direction === 'left';
    const goingRight = direction === 'right';

    if (keyPressed === LEFT_KEY && !goingRight) {
        direction = 'left';
    }

    if (keyPressed === UP_KEY && !goingDown) {
        direction = 'up';
    }

    if (keyPressed === RIGHT_KEY && !goingLeft) {
        direction = 'right';
    }

    if (keyPressed === DOWN_KEY && !goingUp) {
        direction = 'down';
    }
}

function startGame() {
    if (gameInterval) {
        resetGame();
    }
    startButton.textContent = "Reset Game";
    gameInterval = setInterval(() => {
        advanceSnake();
        draw();
    }, gameSpeed);
}

document.addEventListener('keydown', changeDirection);
startButton.addEventListener('click', startGame);

// Initial setup
resetGame();
draw();
