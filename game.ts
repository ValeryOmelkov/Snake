class Game {
    protected _canvas: any;
    protected _ctx: any;

    public snake: Snake;
    protected _fruit: Point;
    
    protected _sizeX: number = 9;
    protected _sizeY: number = 9;
    protected _sizeCell: number = 50;
    
    protected _state: Array<number>;

    protected _lifeDiv: HTMLSpanElement;
    protected _maxDiv: HTMLSpanElement;
    protected _currDiv: HTMLSpanElement;

    protected _life: number = 0;
    protected _max: number = 1;
    protected _curr: number = 1;
    protected _epoch: number = 0;
    
    constructor() {
        this._canvas = document.getElementById('canvas');
        this._canvas.width = this._sizeX * this._sizeCell;
        this._canvas.height = this._sizeY * this._sizeCell; 
        this._canvas.style.width = this._sizeX * this._sizeCell + 'px';
        this._canvas.style.height = this._sizeY * this._sizeCell + 'px';
        this._ctx = this._canvas.getContext('2d');

        this._lifeDiv = document.getElementById('life');
        this._maxDiv = document.getElementById('max');
        this._currDiv = document.getElementById('current')
        
        this.drawField();
        this.snake = new Snake(this._ctx, this._sizeCell, {x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2)});
        this.snake.draw();
        this._createFruit();
        this.drawFruit();
    }

    public getStateSecond(): Array<number>{
        const head: Point = this.snake.head;
        const fruit: Point = this._fruit;
        let state: Array<number> = [];

        if (head.y === fruit.y){
            if (fruit.x > head.x){
                state.push(fruit.x - head.x, fruit.x - (head.x + 1), fruit.x - head.x, fruit.x - (head.x - 1));
            } else {
                state.push(head.x - fruit.x, (head.x + 1) - fruit.x, head.x - fruit.x, (head.x - 1) - fruit.x);
            }
        } else if (head.x === fruit.x){
            if(fruit.y > head.y){
                state.push(fruit.y - (head.y - 1), fruit.y - head.y, fruit.y - (head.y + 1), fruit.y - head.y);
            } else {
                state.push((head.y - 1) - fruit.y, head.y - fruit.y, (head.y + 1) - fruit.y, head.y - fruit.y);
            }
        } else if (fruit.x > head.x && fruit.y < head.y){
            if((fruit.x - head.x) <= (fruit.y - head.y)){
                state.push(head.y - (fruit.y - 1), head.y - fruit.y, head.y - (fruit.y + 1), head.y - fruit.y);
            } else{
                state.push(fruit.x - head.x, fruit.x - (head.x + 1), fruit.x - head.x, fruit.x - (head.x - 1));
            }
        } else if (fruit.x > head.x && fruit.y > head.y){
            if((fruit.x - head.x) <= (head.y - fruit.y)){
                state.push(fruit.y - (head.y - 1), fruit.y - head.y, fruit.y - (head.y + 1), fruit.y - head.y);
            } else {
                state.push(fruit.x - head.x, fruit.x - (head.x + 1), fruit.x - head.x, fruit.x - (head.x - 1))
            }
        } else if (fruit.x < head.x && fruit.y > head.y){
            if((head.x - fruit.x) <= (fruit.y - head.y)){
                state.push(fruit.y - (head.y - 1), fruit.y - head.y, fruit.y - (head.y + 1), fruit.y - head.y );
            } else {
                state.push((head.x + 1) - fruit.x, head.x - fruit.x, (head.x - 1) - fruit.x, head.x - fruit.x);
            }
        } else if (fruit.x < head.x && fruit.y < head.y){
            if((head.x - fruit.x) <= (head.y - fruit.y)){
                 state.push((head.y - 1) - fruit.y, head.y - fruit.y, (head.y - 1) - fruit.y, head.y - fruit.y);
            } else {
                state.push(head.x - fruit.x, (head.x + 1) - fruit.x, head.x - fruit.x, (head.x - 1) - fruit.x);
            }
        }
        state = state.map((n) => {return n * (-1)})
        return state;
    }
    
    public getState(): Array<number> {
        const head: Point = this.snake.head;
        let wallState: Array<number> = []; // Значения от 0 до 1
        let bodyState: Array<number> = new Array(8).fill(0); // Значения от 0 до 1 | 0 при отсутствии в поле видимости
        let foodState: Array<number> = new Array(8).fill(0); // Значения от 0 до 1 | 0 при отсутствии в поле видимости
        // Стенки
        wallState.push(head.y);                                               // Вверх
        wallState.push(Math.min(this._sizeX - head.x, head.y));               // Вверх-вправо
        wallState.push(this._sizeX - head.x);                                 // Вправо
        wallState.push(Math.min(this._sizeX - head.x, this._sizeY - head.y)); // Вниз-вправо 
        wallState.push(this._sizeY - head.y);                                 // Вниз
        wallState.push(Math.min(head.x, this._sizeY - head.y));               // Вниз-влево
        wallState.push(head.x);                                               // Влево
        wallState.push(Math.min(head.x, head.y));                             // Вверх-влево
        wallState = wallState.map((n) => {return n != 0 ? 1/n : 0}); // Нормализация от 0 до 1
        // Тело
        let mpX: number; // Множитель для X
        let mpY: number; // Множитель для Y
        for(let i = 0; i < 8; i++){
            mpX = (i > 4) ? -1 : ((i < 4 && i > 0) ? 1 : 0);
            mpY = (i > 2 && i < 6) ? 1 : ((i > 6 || i < 2) ? -1 : 0);
            let distance: number = 1;
            while(!(head.x + (distance * mpX) < 0 || head.x + (distance * mpX) >= this._sizeX || head.y + (distance * mpY) < 0 || head.y + (distance * mpY) >= this._sizeY)){
                if (this.snake.body.filter((item) => item.x === head.x + (distance * mpX) && item.y === head.y + (distance * mpY)).length > 0){
                    bodyState[i] = distance;
                    break;
                }
                distance++;
            }
        }
        bodyState = bodyState.map((n) => {return n != 0 ? 1/n : 0})
        // Еда
        if (head.x === this._fruit.x){ // Верх/Низ
            head.y > this._fruit.y ? foodState[0] = head.y - this._fruit.y : foodState[4] = this._fruit.y - head.y;
        } else if (head.y === this._fruit.y){ // Лево/Право
            head.x > this._fruit.x ? foodState[6] = head.x - this._fruit.x : foodState[2] = this._fruit.x - head.x;
        } else if (head.x - this._fruit.x === head.y - this._fruit.y){ // Диагональ с лева направо, сверху вниз
            head.x > this._fruit.x ? foodState[7] = Math.abs(head.x - this._fruit.x) : foodState[3] = Math.abs(head.x - this._fruit.x);
        } else if (Math.abs(head.x - this._fruit.x) === Math.abs(head.y - this._fruit.y)){ // Диагональ с лева направо, снизу вверх
            head.x > this._fruit.x ? foodState[5] = Math.abs(head.x - this._fruit.x) : foodState[1] = Math.abs(head.x - this._fruit.x);
        }
        foodState = foodState.map((n) => {return n != 0 ? 1/n : 0}); // Нормализация от 0 до 1

        return [...wallState, ...bodyState, ...foodState];
    }

    public step(action: number = 0) {
        // Начальная награда - 0, если не изменится, значит ходим по пустой клетке
        let reward = -0.25;
        const head: Point = {...this.snake.head};

        // Меняем направление змеи
        /*
            direction - 1 === Повернуть влево по часовой
            direction + 0 === Не поворачивать
            direction + 1 === Повернуть вправо по часовой
        */

        this.snake.direction = (this.snake.direction + (action > -1 ? action : 3)) % 4;

        // Смотрим, где окажется голова
        switch(this.snake.direction) {
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
            reward = -20;
            this._life = 0;
            this._curr = 1;
            this._epoch++;
            this._endGame(); // Если змея ударилась, вызываем эту функцию
            return reward; // и выходим
        }
        // Проверям, если новая голова съела фрукт
        if (this._checkFruit(head)) {
            reward = 50;
            this._createFruit();
            this.drawFruit();
            this._curr++;
        }
        // Ходим змейкой
        this.snake.move(reward === 50);

        this._max = this._curr > this._max ? this._curr : this._max;
        this._life++;
        
        this._currDiv.innerHTML = this._curr.toString();
        this._lifeDiv.innerHTML = this._life.toString();
        this._maxDiv.innerHTML = this._max.toString() + '    Игр: ' + this._epoch.toString();


        return reward;
    }

    public drawField(): void {
        for(let y: number = 0; y < this._sizeY; y++) {
            for(let x: number = 0; x < this._sizeX; x++) {
                this._ctx.fillStyle = ((x + (y % 2)) % 2 === 0) ? '#AAAAAA' : '#777777';
                this._ctx.fillRect(x * this._sizeCell, y * this._sizeCell, this._sizeCell, this._sizeCell);
            }
        }
    }
    
    protected _createFruit(): void {
        const snake = [this.snake.head, ...this.snake.body];
        let inSnake: boolean = true;
        let x: number;
        let y: number;
        while(inSnake){
            x = Math.floor(Math.random() * (this._sizeX));
            y = Math.floor(Math.random() * (this._sizeY));
            inSnake = snake.some((item) => item.x === x && item.y === y);
        }
        this._fruit = {x, y};
    }
    
    public drawFruit(): void {
        this._ctx.fillStyle = '#AA0000';
        this._ctx.fillRect(this._fruit.x * this._sizeCell, this._fruit.y * this._sizeCell, this._sizeCell, this._sizeCell);
    }
    
    protected _checkFruit(head: Point): boolean {
        if (head.x === this._fruit.x && head.y === this._fruit.y) {
            return true;
        }
        return false;
    }
    
    protected _checkIsAlive(head: Point): boolean {
        // Проверка на столкновение со стеной
        if ((head.x < 0) || (head.x >= this._sizeX) || (head.y < 0) || (head.y >= this._sizeY)) {
            return false;
        }
        // Проверка на столкновение с туловищем
        for(const item of this.snake.body) {
            if(item.x === head.x && item.y === head.y){
                return false;
            }
        }
        
        return true;
    }
    
    protected _endGame(): void {
        //console.log('Поражение!');

        // Запускаем игру сначала
        this.drawField();
        this.snake = new Snake(this._ctx, this._sizeCell, {x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2)});
        this.snake.draw();
        this._createFruit();
        this.drawFruit();
    }
}

class Snake {
    protected _ctx: any;
    protected _sizeCell: number;
    public head: Point;
    public body: Point[] = [];
    public direction: Direction = Direction.Up;
    
    constructor(context: any, size: number, startPoint: Point) {
        this._ctx = context;
        this._sizeCell = size;
        this.head = startPoint;
    }
    
    public draw() {
        this._ctx.fillStyle = '#008800';
        this._ctx.fillRect(this.head.x * this._sizeCell, this.head.y * this._sizeCell, this._sizeCell, this._sizeCell);
        this._ctx.fillStyle = '#00BB00';
        for(let i: number = 0; i < this.body.length; i++) {
            this._ctx.fillRect(this.body[i].x * this._sizeCell, this.body[i].y * this._sizeCell, this._sizeCell, this._sizeCell);
        }
    }
    
    public move(growing: boolean) {
        const oldHead = {...this.head};
        this.body.unshift(oldHead);
        if (!growing) this.body.pop();
        
        switch(this.direction) {
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
    }

    public randomAction(): number {
        let rand = Math.random()
        if (rand < 0.33) return -1;
        if (rand < 0.67) return 0;
        return 1;
    }
}

interface Point {
    x: number;
    y: number;
}

enum Direction {
    Up = 0,
    Right,
    Down,
    Left
}

class Controller {
    protected _game: Game;
    protected _learner: QLearner;
    public exploration;

    constructor() {
        this._game = new Game;
        this._learner = new QLearner(0.1, 0.9);
        this.exploration = 0.01;
    }

    step() {
        const game = this._game;
        const learner = this._learner;

        let state = game.getStateSecond();

        let action: any = learner.bestAction(state);

        //if there is no best action try to explore
        if ((action==undefined) || (learner.getQValue(state, action) <= 0) || (Math.random() < this.exploration)) {
            action = game.snake.randomAction();
        }

        action = Number(action);

        let reward: number = game.step(action);

        let nextState = game.getStateSecond();

        learner.add(state, nextState, reward, action);

        //make que q-learning algorithm number of iterations=10 or it could be another number
        learner.learn(100);
    }

    draw(): void {
        this._game.drawField();
        this._game.drawFruit();
        this._game.snake.draw();
    }
}

const game = new Game;