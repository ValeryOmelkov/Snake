class Game {
    constructor() {
        this._speed = 100;
        this._sizeX = 17;
        this._sizeY = 17;
        this._sizeCell = 30;
        this._width = this._sizeX * this._sizeCell;
        this._height = this._sizeY * this._sizeCell;
        this._canvas = document.getElementById('canvas');
        this._ctx = this._canvas.getContext('2d');
        this._snake = new Snake([5, 5], this._sizeCell, this._ctx);
        this._drawField();
        this._snake.drawSnake();
        this._createFruit();
        setInterval(() => {
            this._snake.moveSnake();
            this._drawField();
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
    _createFruit() {
        const x = Math.round(Math.random() * (this._sizeX));
        const y = Math.round(Math.random() * (this._sizeY));
        this._fruitCoord = [x, y];
        this._ctx.fillStyle = '#AA0000';
        this._ctx.fillRect(x * this._sizeCell, y * this._sizeCell, this._sizeCell, this._sizeCell);
    }
}
class Snake {
    constructor(coord, sizeCell, ctx) {
        this._snake = [];
        this._sizeCell = sizeCell;
        this._ctx = ctx;
        document.addEventListener('keypress', this._onKeyPress.bind(this));
        for (let i = 0; i < 4; i++) {
            this._snake.push([coord[0] + i, coord[1]]);
        }
    }
    _onKeyPress(event) {
        switch (event.key) {
            case 'w':
                this._direction = this._direction != 'down' ? 'up' : 'down';
                break;
            case 'a':
                this._direction = this._direction != 'right' ? 'left' : 'right';
                break;
            case 's':
                this._direction = this._direction != 'up' ? 'down' : 'up';
                break;
            case 'd':
                this._direction = this._direction != 'left' ? 'right' : 'left';
                break;
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
    moveSnake() {
        if (this._direction) {
            for (let i = this._snake.length - 1; i > 0; i--) {
                this._snake[i] = this._snake[i - 1];
            }
        }
        switch (this._direction) {
            case 'up':
                this._snake[0] = [this._snake[0][0], this._snake[0][1] - 1];
                break;
            case 'down':
                this._snake[0] = [this._snake[0][0], this._snake[0][1] + 1];
                break;
            case 'right':
                this._snake[0] = [this._snake[0][0] + 1, this._snake[0][1]];
                break;
            case 'left':
                this._snake[0] = [this._snake[0][0] - 1, this._snake[0][1]];
                break;
        }
    }
}
const game = new Game();
