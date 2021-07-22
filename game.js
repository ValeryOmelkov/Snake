class Game {
    constructor() {
        this._sizeX = 15;
        this._sizeY = 15;
        this._sizeCell = 30;
        this._speed = 1500;
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
    _startGame() {
        this._pauseBtn.disabled = false;
        this._processInterval = setInterval(() => {
            this._moveSnake();
            this._drawField();
            this._drawFruit();
            this._snake.draw();
            this._directionChosen = false;
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
        this._directionChosen = false;
        this._pauseBtn.disabled = true;
        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, { x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2) });
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
    }
    _getState() {
        const head = this._snake.head;
        let wallState = []; // Значения от 0 до 1
        let bodyState = new Array(8).fill(0); // Значения от 0 до 1 | 0 при отсутствии в поле видимости
        let foodState = new Array(8).fill(0); // Значения от 0 до 1 | 0 при отсутствии в поле видимости
        // Стенки
        wallState.push(head.y); // Вверх
        wallState.push(Math.min(this._sizeX - head.x, head.y)); // Вверх-вправо
        wallState.push(this._sizeX - head.x); // Вправо
        wallState.push(Math.min(this._sizeX - head.x, this._sizeY - head.y)); // Вниз-вправо 
        wallState.push(this._sizeY - head.y); // Вниз
        wallState.push(Math.min(head.x, this._sizeY - head.y)); // Вниз-влево
        wallState.push(head.x); // Влево
        wallState.push(Math.min(head.x, head.y)); // Вверх-влево
        wallState = wallState.map((n) => { return 1 / n; }); // Нормализация от 0 до 1
        // Тело
        let mpX; // Множитель для X
        let mpY; // Множитель для Y
        for (let i = 0; i < 8; i++) {
            mpX = (i > 4) ? -1 : ((i < 4 && i > 0) ? 1 : 0);
            mpY = (i > 2 && i < 6) ? 1 : ((i > 6 || i < 2) ? -1 : 0);
            let distance = 1;
            while (!(head.x + (distance * mpX) < 0 || head.x + (distance * mpX) >= this._sizeX || head.y + (distance * mpY) < 0 || head.y + (distance * mpY) >= this._sizeY)) {
                if (this._snake.body.filter((item) => item.x === head.x + (distance * mpX) && item.y === head.y + (distance * mpY)).length > 0) {
                    bodyState[i] = distance;
                    break;
                }
                distance++;
            }
        }
        bodyState = bodyState.map((n) => { return n != 0 ? 1 / n : 0; });
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
        foodState = foodState.map((n) => { return n != 0 ? 1 / n : 0; }); // Нормализация от 0 до 1
        return [...wallState, ...bodyState, ...foodState];
    }
    _onKeyPress(event) {
        if (this._directionChosen)
            return;
        switch (event.code) {
            case 'KeyW':
                this._snake.up();
                break;
            case 'KeyA':
                this._snake.left();
                break;
            case 'KeyS':
                this._snake.down();
                break;
            case 'KeyD':
                this._snake.right();
                break;
            default: return;
        }
        this._directionChosen = true;
        if (!this._isStarted) {
            this._startGame();
            this._isStarted = true;
        }
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
    _moveSnake() {
        const direction = this._snake.direction;
        const head = Object.assign({}, this._snake.head);
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
        else {
            this._snake.move(growing);
        }
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
    }
    up() {
        this.direction = this.direction != 'down' ? 'up' : 'down';
    }
    left() {
        this.direction = this.direction != 'right' ? 'left' : 'right';
    }
    down() {
        this.direction = this.direction != 'up' ? 'down' : 'up';
    }
    right() {
        this.direction = this.direction != 'left' ? 'right' : 'left';
    }
}
const game = new Game;
