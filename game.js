class Game {
    constructor() {
        this._sizeX = 15;
        this._sizeY = 15;
        this._sizeCell = 30;
        this._speed = 100;
        this._isStarted = false;
        this._canvas = document.getElementById('canvas');
        this._canvas.width = this._sizeX * this._sizeCell;
        this._canvas.height = this._sizeY * this._sizeCell;
        this._canvas.style.width = this._sizeX * this._sizeCell + 'px';
        this._canvas.style.height = this._sizeY * this._sizeCell + 'px';
        this._ctx = this._canvas.getContext('2d');
        this._pauseBtn = document.getElementById('pause');
        this._pauseBtn.addEventListener('click', this._pause.bind(this));
        this._restartBtn = document.getElementById('restart');
        this._restartBtn.addEventListener('click', this._restart.bind(this));
        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, { x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2) });
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
        this._startGame();
    }
    _startGame() {
        this._pauseBtn.disabled = false;
        this._processInterval = setInterval(() => {
            this.step(this._snake.randomAction());
            this._drawField();
            this._drawFruit();
            this._snake.draw();
        }, this._speed);
    }
    _pause() {
        this._isStarted = false;
        this._pauseBtn.disabled = true;
        clearInterval(this._processInterval);
    }
    _restart() {
        this._isStarted = false;
        clearInterval(this._processInterval);
        this._pauseBtn.disabled = true;
        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, { x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2) });
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
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
        const snake = [this._snake.head, ...this._snake.body];
        let inSnake = true;
        let x;
        let y;
        while (inSnake) {
            x = Math.floor(Math.random() * (this._sizeX));
            y = Math.floor(Math.random() * (this._sizeY));
            inSnake = snake.some((item) => item.x === x && item.y === y);
        }
        this._fruit = { x, y };
    }
    _drawFruit() {
        this._ctx.fillStyle = '#AA0000';
        this._ctx.fillRect(this._fruit.x * this._sizeCell, this._fruit.y * this._sizeCell, this._sizeCell, this._sizeCell);
    }
    step(action = 0) {
        this._snake.direction = this._snake.direction - action === 2 ? this._snake.direction : action;
        const head = Object.assign({}, this._snake.head);
        switch (this._snake.direction) {
            case Direction.Up:
                head.y--;
                break;
            case Direction.Down:
                head.y++;
                break;
            case Direction.Right:
                head.x++;
                break;
            case Direction.Left:
                head.x--;
                break;
        }
        let growing = false;
        if (this._checkFruit(head)) {
            this._createFruit();
            this._drawFruit();
            growing = true;
        }
        if (!this._checkIsAlive(head)) {
            this._endGame();
            return;
        }
        this._snake.move(growing);
    }
    _checkFruit(head) {
        if (head.x === this._fruit.x && head.y === this._fruit.y) {
            return true;
        }
        return false;
    }
    _checkIsAlive(head) {
        // Проверка на столкновение со стеной
        if ((head.x < 0) || (head.x >= this._sizeX) || (head.y < 0) || (head.y >= this._sizeY)) {
            return false;
        }
        // Проверка на столкновение с туловищем
        for (const item of this._snake.body) {
            if (item.x === head.x && item.y === head.y) {
                return false;
            }
        }
        return true;
    }
    _endGame() {
        clearInterval(this._processInterval);
        this._pauseBtn.disabled = true;
        alert('Поражение!');
    }
}
class Snake {
    constructor(context, size, startPoint) {
        this.body = [];
        this.direction = Direction.Up;
        this._ctx = context;
        this._sizeCell = size;
        this.head = startPoint;
    }
    draw() {
        this._ctx.fillStyle = '#008800';
        this._ctx.fillRect(this.head.x * this._sizeCell, this.head.y * this._sizeCell, this._sizeCell, this._sizeCell);
        this._ctx.fillStyle = '#00BB00';
        for (let i = 0; i < this.body.length; i++) {
            this._ctx.fillRect(this.body[i].x * this._sizeCell, this.body[i].y * this._sizeCell, this._sizeCell, this._sizeCell);
        }
    }
    move(growing) {
        const oldHead = Object.assign({}, this.head);
        this.body.unshift(oldHead);
        if (!growing)
            this.body.pop();
        switch (this.direction) {
            case Direction.Up:
                this.head.y--;
                break;
            case Direction.Down:
                this.head.y++;
                break;
            case Direction.Right:
                this.head.x++;
                break;
            case Direction.Left:
                this.head.x--;
                break;
        }
    }
    randomAction() {
        const random = Math.random();
        if (random < 0.25)
            return 0;
        if (random < 0.5)
            return 1;
        if (random < 0.75)
            return 2;
        return 3;
    }
}
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Right"] = 1] = "Right";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
})(Direction || (Direction = {}));
const game = new Game;
