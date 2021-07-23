import {QLearner} from "./q-learning.js"

"use strict";
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
        this._sizeX = 8;
        this._sizeY = 8;
        this._sizeCell = 50;
        this._life = 0;
        this._max = 1;
        this._curr = 1;
        this._epoch = 0;
        this._canvas = document.getElementById('canvas');
        this._canvas.width = this._sizeX * this._sizeCell;
        this._canvas.height = this._sizeY * this._sizeCell;
        this._canvas.style.width = this._sizeX * this._sizeCell + 'px';
        this._canvas.style.height = this._sizeY * this._sizeCell + 'px';
        this._ctx = this._canvas.getContext('2d');
        this._lifeDiv = document.getElementById('life');
        this._maxDiv = document.getElementById('max');
        this._currDiv = document.getElementById('current');
        this.drawField();
        this.snake = new Snake(this._ctx, this._sizeCell, { x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2) });
        this.snake.draw();
        this._createFruit();
        this.drawFruit();
    }
    Game.prototype.getState = function () {
        var head = __assign({}, this.snake.head);
        var leftPoint;
        var straightPoint;
        var rightPoint;
        var directions = [false, false, false, false];
        directions[this.snake.direction] = true;
        switch (this.snake.direction) {
            case Direction.Up:
                leftPoint = {x: head.x - 1, y: head.y};
                straightPoint = {x: head.x, y: head.y - 1};
                rightPoint = {x: head.x + 1, y: head.y};
                break;
            case Direction.Right:
                leftPoint = {x: head.x, y: head.y - 1};
                straightPoint = {x: head.x + 1, y: head.y};
                rightPoint = {x: head.x, y: head.y + 1};
                break;
            case Direction.Down:
                leftPoint = {x: head.x + 1, y: head.y};
                straightPoint = {x: head.x, y: head.y + 1};
                rightPoint = {x: head.x - 1, y: head.y};
                break;
            case Direction.Left:
                leftPoint = {x: head.x, y: head.y + 1};
                straightPoint = {x: head.x - 1, y: head.y};
                rightPoint = {x: head.x, y: head.y - 1};
                break;
        }

        var dangerLeft = this._checkIsAlive(leftPoint);
        var dangerStraight = this._checkIsAlive(straightPoint);
        var dangerRight = this._checkIsAlive(rightPoint);

        var x = head.x - this._fruit.x;
        var y = head.y - this._fruit.y;

        var state = [
            dangerLeft, dangerStraight, dangerRight,
            ...directions,
            y > 0, x < 0, y < 0, x > 0
        ]
        return state;
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
            this._life = 0;
            this._curr = 1;
            this._epoch++;
            this._endGame(); // Если змея ударилась, вызываем эту функцию
            return reward; // и выходим
        }
        // Проверям, если новая голова съела фрукт
        if (this._checkFruit(head)) {
            reward = 100;
            this._createFruit();
            this.drawFruit();
            this._curr++;
        }
        // Ходим змейкой
        this.snake.move(reward === 100);
        this._max = this._curr > this._max ? this._curr : this._max;
        this._life++;
        this._currDiv.innerHTML = this._curr.toString();
        this._lifeDiv.innerHTML = this._life.toString();
        this._maxDiv.innerHTML = this._max.toString() + '    Игр: ' + this._epoch.toString();
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
        this._learner = new QLearner(0.1, 0.9);
        this.exploration = 0.01;
    }
    Controller.prototype.step = function () {
        var game = this._game;
        var learner = this._learner;
        var state = game.getState();
        var action = Number(learner.bestAction(state));
        //if there is no best action try to explore
        if ((action == undefined) || (learner.getQValue(state, action) <= 0) || (Math.random() < this.exploration)) {
            action = game.snake.randomAction();
        }
        var reward = game.step(action);
        var nextState = game.getState();
        learner.add(state, nextState, reward, action);
        //make que q-learning algorithm number of iterations=10 or it could be another number
        learner.learn(100);
    };
    Controller.prototype.draw = function () {
        this._game.drawField();
        this._game.drawFruit();
        this._game.snake.draw();
    };
    return Controller;
}());
var controller = new Controller;
var slowTime = 100;
var fastTime = 50;
var stepTime = slowTime;
var sid = setTimeout(slow, stepTime);
function stepController() {
    controller.step();
    controller.draw();
}
function slow() {
    stepTime = slowTime;
    clearTimeout(sid);
    stepController();
    sid = setInterval(slow, stepTime);
}
function fast() {
    stepTime = fastTime;
    clearTimeout(sid);
    stepController();
    sid = setInterval(fast, stepTime);
}
function show() {
    console.log(controller._learner.statesList)
}

document.getElementById('fast').addEventListener('click', fast)
document.getElementById('slow').addEventListener('click', slow)
document.getElementById('show').addEventListener('click', show)
//const game = new Game;
