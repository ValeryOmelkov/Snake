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
        this._sizeX = 9;
        this._sizeY = 9;
        this._sizeCell = 50;
        this._canvas = document.getElementById('canvas');
        this._canvas.width = this._sizeX * this._sizeCell;
        this._canvas.height = this._sizeY * this._sizeCell;
        this._canvas.style.width = this._sizeX * this._sizeCell + 'px';
        this._canvas.style.height = this._sizeY * this._sizeCell + 'px';
        this._ctx = this._canvas.getContext('2d');
        this.drawField();
        this.snake = new Snake(this._ctx, this._sizeCell, { x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2) });
        this.snake.draw();
        this._createFruit();
        this.drawFruit();
    }
    Game.prototype.getState = function () {
        var head = this.snake.head;
        var wallState = []; // Значения от 0 до 1
        var bodyState = new Array(8).fill(0); // Значения от 0 до 1 | 0 при отсутствии в поле видимости
        var foodState = new Array(8).fill(0); // Значения от 0 до 1 | 0 при отсутствии в поле видимости
        // Стенки
        wallState.push(head.y); // Вверх
        wallState.push(Math.min(this._sizeX - head.x, head.y)); // Вверх-вправо
        wallState.push(this._sizeX - head.x); // Вправо
        wallState.push(Math.min(this._sizeX - head.x, this._sizeY - head.y)); // Вниз-вправо 
        wallState.push(this._sizeY - head.y); // Вниз
        wallState.push(Math.min(head.x, this._sizeY - head.y)); // Вниз-влево
        wallState.push(head.x); // Влево
        wallState.push(Math.min(head.x, head.y)); // Вверх-влево
        wallState = wallState.map(function (n) { return 1 / n; }); // Нормализация от 0 до 1
        // Тело
        var mpX; // Множитель для X
        var mpY; // Множитель для Y
        var _loop_1 = function (i) {
            mpX = (i > 4) ? -1 : ((i < 4 && i > 0) ? 1 : 0);
            mpY = (i > 2 && i < 6) ? 1 : ((i > 6 || i < 2) ? -1 : 0);
            var distance = 1;
            while (!(head.x + (distance * mpX) < 0 || head.x + (distance * mpX) >= this_1._sizeX || head.y + (distance * mpY) < 0 || head.y + (distance * mpY) >= this_1._sizeY)) {
                if (this_1.snake.body.filter(function (item) { return item.x === head.x + (distance * mpX) && item.y === head.y + (distance * mpY); }).length > 0) {
                    bodyState[i] = distance;
                    break;
                }
                distance++;
            }
        };
        var this_1 = this;
        for (var i = 0; i < 8; i++) {
            _loop_1(i);
        }
        bodyState = bodyState.map(function (n) { return n != 0 ? 1 / n : 0; });
        // Еда
        if (head.x === this._fruit.x) { // Верх/Низ
            head.y > this._fruit.y ? foodState[0] = head.y - this._fruit.y : foodState[4] = this._fruit.y - head.y;
        }
        else if (head.y === this._fruit.y) { // Лево/Право
            head.x > this._fruit.x ? foodState[6] = head.x - this._fruit.x : foodState[2] = this._fruit.x - head.x;
        }
        else if (head.x - this._fruit.x === head.y - this._fruit.y) { // Диагональ с лева направо, сверху вниз
            head.x > this._fruit.x ? foodState[7] = Math.abs(head.x - this._fruit.x) : foodState[3] = Math.abs(head.x - this._fruit.x);
        }
        else if (Math.abs(head.x - this._fruit.x) === Math.abs(head.y - this._fruit.y)) { // Диагональ с лева направо, снизу вверх
            head.x > this._fruit.x ? foodState[5] = Math.abs(head.x - this._fruit.x) : foodState[1] = Math.abs(head.x - this._fruit.x);
        }
        foodState = foodState.map(function (n) { return n != 0 ? 1 / n : 0; }); // Нормализация от 0 до 1
        return __spreadArray(__spreadArray(__spreadArray([], wallState), bodyState), foodState);
    };
    Game.prototype.step = function (action) {
        if (action === void 0) { action = 0; }
        // Начальная награда - 0, если не изменится, значит ходим по пустой клетке
        var reward = 0;
        var head = __assign({}, this.snake.head);
        // Меняем направление змеи
        /*
            direction - 1 === Повернуть влево по часовой
            direction + 0 === Не поворачивать
            direction + 1 === Повернуть вправо по часовой
        */
        this.snake.direction = (this.snake.direction + (action > -1 ? action : 3)) % 4;
        // Смотрим, где окажется голова
        switch (this.snake.direction) {
            case Direction.Up:
                head.y--;
                break;
            case Direction.Right:
                head.x++;
                break;
            case Direction.Down:
                head.y++;
                break;
            case Direction.Left:
                head.x--;
                break;
        }
        // Проверям, если новая голова ударилась
        if (!this._checkIsAlive(head)) {
            reward = -1000;
            this._endGame(); // Если змея ударилась, вызываем эту функцию
            return reward; // и выходим
        }
        // Проверям, если новая голова съела фрукт
        if (this._checkFruit(head)) {
            reward = 100;
            this._createFruit();
            this.drawFruit();
        }
        // Ходим змейкой
        this.snake.move(reward === 100);
        return reward;
    };
    Game.prototype.drawField = function () {
        for (var y = 0; y < this._sizeY; y++) {
            for (var x = 0; x < this._sizeX; x++) {
                this._ctx.fillStyle = ((x + (y % 2)) % 2 === 0) ? '#AAAAAA' : '#777777';
                this._ctx.fillRect(x * this._sizeCell, y * this._sizeCell, this._sizeCell, this._sizeCell);
            }
        }
    };
    Game.prototype._createFruit = function () {
        var snake = __spreadArray([this.snake.head], this.snake.body);
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
    Game.prototype.drawFruit = function () {
        this._ctx.fillStyle = '#AA0000';
        this._ctx.fillRect(this._fruit.x * this._sizeCell, this._fruit.y * this._sizeCell, this._sizeCell, this._sizeCell);
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
        for (var _i = 0, _a = this.snake.body; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.x === head.x && item.y === head.y) {
                return false;
            }
        }
        return true;
    };
    Game.prototype._endGame = function () {
        console.log('Поражение!');
        // Запускаем игру сначала
        this.drawField();
        this.snake = new Snake(this._ctx, this._sizeCell, { x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2) });
        this.snake.draw();
        this._createFruit();
        this.drawFruit();
    };
    return Game;
}());
var Snake = /** @class */ (function () {
    function Snake(context, size, startPoint) {
        this.body = [];
        this.direction = Direction.Up;
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
            case Direction.Up:
                this.head.y--;
                break;
            case Direction.Right:
                this.head.x++;
                break;
            case Direction.Down:
                this.head.y++;
                break;
            case Direction.Left:
                this.head.x--;
                break;
        }
    };
    Snake.prototype.randomAction = function () {
        var rand = Math.random();
        if (rand < 0.33)
            return -1;
        if (rand < 0.67)
            return 0;
        return 1;
    };
    return Snake;
}());
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Right"] = 1] = "Right";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
})(Direction || (Direction = {}));
var Controller = /** @class */ (function () {
    function Controller() {
        this._game = new Game;
        //this._learner = new QLearner(0.1, 0.9);
        this.exploration = 0.01;
    }
    Controller.prototype.step = function () {
        var game = this._game;
        //const learner = this._learner;
        var state = game.getState();
        //let action = learner.bestAction(state);
        //if there is no best action try to explore
        // if ((action==undefined) || (learner.getQValue(state, action) <= 0) || (Math.random() < this.exploration)) {
        //     action = game.snake.randomAction();
        // }
        var action = game.snake.randomAction();
        var reward = game.step(action);
        var nextState = game.getState();
        //learner.add(state, nextState, reward, action);
        //make que q-learning algorithm number of iterations=10 or it could be another number
        //learner.learn(100);
    };
    Controller.prototype.draw = function () {
        this._game.drawField();
        this._game.drawFruit();
        this._game.snake.draw();
    };
    return Controller;
}());
var game = new Game;
