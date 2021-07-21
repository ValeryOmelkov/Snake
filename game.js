var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var Game = /** @class */ (function () {
    function Game() {
        this._sizeX = 17;
        this._sizeY = 17;
        this._sizeCell = 30;
        this._speed = 100;
        this._isStarted = false;
        this._directionChosen = false;
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
        document.addEventListener('keypress', this._onKeyPress.bind(this));
        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, { x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2) });
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
    }
    Game.prototype._startGame = function () {
        var _this = this;
        this._pauseBtn.disabled = false;
        this._processInterval = setInterval(function () {
            _this._moveSnake();
            _this._drawField();
            _this._drawFruit();
            _this._snake.draw();
            _this._directionChosen = false;
        }, this._speed);
    };
    Game.prototype._pause = function () {
        this._isStarted = false;
        this._pauseBtn.disabled = true;
        clearInterval(this._processInterval);
    };
    Game.prototype._restart = function () {
        this._isStarted = false;
        clearInterval(this._processInterval);
        this._pauseBtn.disabled = true;
        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, { x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2) });
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
    };
    Game.prototype._onKeyPress = function (event) {
        if (this._directionChosen)
            return;
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
        this._directionChosen = true;
        if (!this._isStarted) {
            this._startGame();
            this._isStarted = true;
        }
    };
    Game.prototype._drawField = function () {
        for (var y = 0; y < this._sizeY; y++) {
            for (var x = 0; x < this._sizeX; x++) {
                this._ctx.fillStyle = ((x + (y % 2)) % 2 === 0) ? '#AAAAAA' : '#777777';
                this._ctx.fillRect(x * this._sizeCell, y * this._sizeCell, this._sizeCell, this._sizeCell);
            }
        }
    };
    Game.prototype._createFruit = function () {
        var snake = __spreadArray([this._snake.head], this._snake.body);
        var inSnake = true;
        var x;
        var y;
        while (inSnake) {
            x = Math.floor(Math.random() * (this._sizeX));
            y = Math.floor(Math.random() * (this._sizeY));
            inSnake = snake.some(function (item) { return item.x === x && item.y === y; });
        }
        this._fruit = { x: x, y: y };
    };
    Game.prototype._drawFruit = function () {
        this._ctx.fillStyle = '#AA0000';
        this._ctx.fillRect(this._fruit.x * this._sizeCell, this._fruit.y * this._sizeCell, this._sizeCell, this._sizeCell);
    };
    Game.prototype._moveSnake = function () {
        var direction = this._snake.direction;
        var head = __assign({}, this._snake.head);
        switch (direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'right':
                head.x++;
                break;
            case 'left':
                head.x--;
                break;
        }
        var growing = false;
        if (this._checkFruit(head)) {
            this._createFruit();
            this._drawFruit();
            growing = true;
        }
        if (!this._checkIsAlive(head)) {
            this._endGame();
            return;
        }
        else {
            this._snake.move(growing);
        }
    };
    Game.prototype._checkFruit = function (head) {
        if (head.x === this._fruit.x && head.y === this._fruit.y) {
            return true;
        }
        return false;
    };
    Game.prototype._checkIsAlive = function (head) {
        // Проверка на столкновение со стеной
        if ((head.x < 0) || (head.x >= this._sizeX) || (head.y < 0) || (head.y >= this._sizeY)) {
            return false;
        }
        // Проверка на столкновение с туловищем
        for (var _i = 0, _a = this._snake.body; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.x === head.x && item.y === head.y) {
                return false;
            }
        }
        return true;
    };
    Game.prototype._endGame = function () {
        clearInterval(this._processInterval);
        this._pauseBtn.disabled = true;
        alert('Поражение!');
    };
    return Game;
}());
var Snake = /** @class */ (function () {
    function Snake(context, size, startPoint) {
        this.body = [];
        this._ctx = context;
        this._sizeCell = size;
        this.head = startPoint;
    }
    Snake.prototype.draw = function () {
        this._ctx.fillStyle = '#008800';
        this._ctx.fillRect(this.head.x * this._sizeCell, this.head.y * this._sizeCell, this._sizeCell, this._sizeCell);
        this._ctx.fillStyle = '#00BB00';
        for (var i = 0; i < this.body.length; i++) {
            this._ctx.fillRect(this.body[i].x * this._sizeCell, this.body[i].y * this._sizeCell, this._sizeCell, this._sizeCell);
        }
    };
    Snake.prototype.move = function (growing) {
        var oldHead = __assign({}, this.head);
        this.body.unshift(oldHead);
        if (!growing)
            this.body.pop();
        switch (this.direction) {
            case 'up':
                this.head.y--;
                break;
            case 'down':
                this.head.y++;
                break;
            case 'right':
                this.head.x++;
                break;
            case 'left':
                this.head.x--;
                break;
        }
    };
    Snake.prototype.up = function () {
        this.direction = this.direction != 'down' ? 'up' : 'down';
    };
    Snake.prototype.left = function () {
        this.direction = this.direction != 'right' ? 'left' : 'right';
    };
    Snake.prototype.down = function () {
        this.direction = this.direction != 'up' ? 'down' : 'up';
    };
    Snake.prototype.right = function () {
        this.direction = this.direction != 'left' ? 'right' : 'left';
    };
    return Snake;
}());
var game = new Game;
