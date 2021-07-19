class Game {
    constructor() {
        this._isStarted = false;
        this._speed = 100;
        this._sizeX = 17;
        this._sizeY = 17;
        this._sizeCell = 30;
        this._width = this._sizeX * this._sizeCell;
        this._height = this._sizeY * this._sizeCell;
        this._canvas = document.getElementById('canvas');
        this._ctx = this._canvas.getContext('2d');
        document.addEventListener('keypress', this._onKeyPress.bind(this));
        this._snake = new Snake([8, 8], this._sizeCell, this._ctx);
        this._createFruit();
        this._drawField();
        this._drawFruit();
        this._snake.drawSnake();
    }
    _process() {
        this._processInterval = setInterval(() => {
            this._moveSnake();
            this._drawField();
            this._drawFruit();
            this._snake.drawSnake();
        }, this._speed);
    }
    _drawField() {
        for (let y = 0; y < this._sizeY; y++) {
            for (let x = 0; x < this._sizeX; x++) {
                this._ctx.fillStyle = ((x + (y % 2)) % 2 === 0) ? '#AAAAAA' : '#777777';
                this._ctx.fillRect(x * this._sizeCell, y * this._sizeCell, this._sizeCell, this._sizeCell);
            }
        }
    }
    // TODO: Сделать генерацию не под змейкой
    _createFruit() {
        const x = Math.floor(Math.random() * (this._sizeX));
        const y = Math.floor(Math.random() * (this._sizeY));
        this._fruitCoord = [x, y];
    }
    _drawFruit() {
        this._ctx.fillStyle = '#AA0000';
        this._ctx.fillRect(this._fruitCoord[0] * this._sizeCell, this._fruitCoord[1] * this._sizeCell, this._sizeCell, this._sizeCell);
    }
    _checkFruit(snake) {
        if (snake[0][0] === this._fruitCoord[0] && snake[0][1] === this._fruitCoord[1]) {
            return true;
        }
        return false;
    }
    _moveSnake() {
        const direction = this._snake.getDirection();
        const oldSnake = this._snake.getSnake();
        let currentSnake = [];
        switch (direction) {
            case 'up':
                currentSnake[0] = [oldSnake[0][0], oldSnake[0][1] - 1];
                break;
            case 'down':
                currentSnake[0] = [oldSnake[0][0], oldSnake[0][1] + 1];
                break;
            case 'right':
                currentSnake[0] = [oldSnake[0][0] + 1, oldSnake[0][1]];
                break;
            case 'left':
                currentSnake[0] = [oldSnake[0][0] - 1, oldSnake[0][1]];
                break;
        }
        for (let i = 1; i < oldSnake.length; i++) {
            currentSnake[i] = oldSnake[i - 1];
        }
        if (this._checkFruit(oldSnake)) {
            this._createFruit();
            currentSnake.push(oldSnake[oldSnake.length - 1]);
        }
        if (this._checkIsAlive(currentSnake)) {
            this._snake.setSnake(currentSnake);
        }
        else {
            this._endGame();
        }
    }
    _checkIsAlive(snake) {
        const head = snake[0]; // Координаты головы змеи
        // Проверка на столкновение со стеной
        if ((head[0] < 0) || (head[0] >= this._sizeX) || (head[1] < 0) || (head[1] >= this._sizeY)) {
            return false;
        }
        // Проверка на столкновение с туловищем
        for (const item of snake.slice(1)) {
            if (item[0] === head[0] && item[1] === head[1]) {
                return false;
            }
        }
        return true;
    }
    _onKeyPress(event) {
        switch (event.key) {
            case 'w':
                this._snake.up();
                break;
            case 'a':
                this._snake.left();
                break;
            case 's':
                this._snake.down();
                break;
            case 'd':
                this._snake.right();
                break;
            default: return;
        }
        if (!this._isStarted) {
            this._process();
            this._isStarted = true;
        }
    }
    _endGame() {
        clearInterval(this._processInterval);
        alert('Проигрышь!');
    }
}
class Snake {
    constructor(coord, sizeCell, ctx) {
        this._snake = [];
        this._isAlive = true;
        this._sizeCell = sizeCell;
        this._ctx = ctx;
        for (let i = 0; i < 3; i++) {
            this._snake.push([coord[0] + i, coord[1]]);
        }
    }
    drawSnake() {
        this._ctx.fillStyle = '#008800';
        this._ctx.fillRect(this._snake[0][0] * this._sizeCell, this._snake[0][1] * this._sizeCell, this._sizeCell, this._sizeCell);
        this._ctx.fillStyle = '#00BB00';
        for (let i = 1; i < this._snake.length; i++) {
            this._ctx.fillRect(this._snake[i][0] * this._sizeCell, this._snake[i][1] * this._sizeCell, this._sizeCell, this._sizeCell);
        }
    }
    up() {
        this._direction = this._direction != 'down' ? 'up' : 'down';
    }
    left() {
        this._direction = this._direction != 'right' ? 'left' : 'right';
    }
    down() {
        this._direction = this._direction != 'up' ? 'down' : 'up';
    }
    right() {
        this._direction = this._direction != 'left' ? 'right' : 'left';
    }
    getSnake() {
        return this._snake;
    }
    setSnake(value) {
        this._snake = value;
    }
    getDirection() {
        return this._direction;
    }
}
const game = new Game();
