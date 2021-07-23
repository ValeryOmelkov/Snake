class Game {
    constructor() {
        this._sizeX = 20;
        this._sizeY = 20;
        this._sizeCell = 30;
        this._speed = 200;
        this._life = 40;
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
        this._lifeDiv = document.getElementById('life');
        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, { x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2) });
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
        this.DFS();
        this._startGame();
    }
    _startGame() {
        this._pauseBtn.disabled = false;
        this._processInterval = setInterval(() => {
            this.step(this.DFS());
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
        this._life--;
        this._lifeDiv.textContent = this._life.toString();
        this._snake.direction = Math.abs(this._snake.direction - action) === 2 ? this._snake.direction : action;
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
        if (!this._checkIsAlive(head)) {
            this._endGame();
            return;
        }
        if (this._life <= 0) {
            this._endGame();
            return;
        }
        let growing = false;
        if (this._checkFruit(head)) {
            this._createFruit();
            this._drawFruit();
            this._life = 40;
            growing = true;
        }
        this._snake.move(growing);
    }
    DFS() {
        const fruit = this._fruit;
        const head = this._snake.head;
        let field = new Array(this._sizeY);
        for (let i = 0; i < field.length; i++) {
            field[i] = new Array(this._sizeX).fill(100);
        }
        field[fruit.y][fruit.x] = 0;
        field[head.y][head.x] = 50;
        for (let item of this._snake.body) {
            field[item.y][item.x] = 150;
        }
        let mainArray = [fruit];
        let assistArray = [];
        let findFood = false;
        const offset = [-1, 1, 1, -1];
        let num = 1;
        let offY;
        let offX;
        while (!findFood) {
            assistArray = mainArray;
            mainArray = [];
            for (let item of assistArray) {
                for (let i = 0; i < 4; i++) {
                    if (i % 2 === 0) {
                        offY = offset[i];
                        offX = 0;
                    }
                    else {
                        offY = 0;
                        offX = offset[i];
                    }
                    if ((item.y + offY || item.x + offX) < 0 || (item.y + offY >= this._sizeY || item.x + offX >= this._sizeX)) {
                        continue;
                    }
                    if (field[item.y + offY][item.x + offX] === 150) {
                        continue;
                    }
                    if (field[item.y + offY][item.x + offX] === 100 && field[item.y + offY][item.x + offX] != 0 || field[item.y + offY][item.x + offX] === 50) {
                        if (item.y + offY === head.y && item.x + offX === head.x) {
                            findFood = true;
                        }
                        field[item.y + offY][item.x + offX] = num;
                        let x = item.x + offX;
                        let y = item.y + offY;
                        mainArray.push({ x, y });
                    }
                }
            }
            num++;
            if (num > (this._sizeY * 1.5))
                break;
        }
        console.log(field);
        console.log(num);
        if (!findFood) {
            console.log('Рандом');
            return this._snake.randomAction();
        }
        // console.log('1');
        // console.log(field);
        let currentPoint = head;
        const way = [];
        // while(!(currentPoint.x === fruit.x && currentPoint.y === fruit.y)){
        for (let i = 0; i < 4; i++) {
            if (i % 2 === 0) {
                offY = offset[i];
                offX = 0;
            }
            else {
                offY = 0;
                offX = offset[i];
            }
            const item = { x: (currentPoint.x + offX), y: (currentPoint.y + offY) };
            if (item.x < 0 || item.y < 0 || item.x >= this._sizeX || item.y >= this._sizeY) {
                continue;
            }
            // console.log(field[item.y][item.x]);
            // console.log(field[currentPoint.y][currentPoint.x]);
            if (field[item.y][item.x] < field[currentPoint.y][currentPoint.x]) {
                way.push(item);
                currentPoint = item;
                break;
            }
        }
        //}
        const nearestPoint = way.shift();
        const dirX = nearestPoint.x - head.x;
        const dirY = nearestPoint.y - head.y;
        if (dirX === 0 && dirY === -1)
            return 0;
        else if (dirX === 1 && dirY === 0)
            return 1;
        else if (dirX === 0 && dirY === 1)
            return 2;
        else
            return 3;
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
        this._life = 40;
        this._snake = new Snake(this._ctx, this._sizeCell, { x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2) });
        this._drawField();
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
        this._pauseBtn.disabled = true;
        console.log('Поражение!');
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
