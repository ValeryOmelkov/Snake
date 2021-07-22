class Game {
    protected _canvas: any;
    protected _ctx: any;

    public snake: Snake;
    protected _fruit: Point;
    
    protected _sizeX: number = 17;
    protected _sizeY: number = 17;
    protected _sizeCell: number = 30;
    
    
    constructor() {
        this._canvas = document.getElementById('canvas');
        this._canvas.width = this._sizeX * this._sizeCell;
        this._canvas.height = this._sizeY * this._sizeCell; 
        this._canvas.style.width = this._sizeX * this._sizeCell + 'px';
        this._canvas.style.height = this._sizeY * this._sizeCell + 'px';
        this._ctx = this._canvas.getContext('2d');
        
        this.drawField();
        this.snake = new Snake(this._ctx, this._sizeCell, {x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2)});
        this.snake.draw();
        this._createFruit();
        this.drawFruit();
    }
    
    public getState(): Array<number> {
        let state = [];
        return state;
    }

    public step(action: number = 0) {
        // Начальная награда - 0, если не изменится, значит ходим по пустой клетке
        let reward = 0;
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
        console.log('Поражение!');

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
    public body: Point[] = [{x:8, y:9}];
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
    //protected _learner: QLearner;
    public exploration;

    constructor() {
        this._game = new Game;
        //this._learner = new QLearner(0.1, 0.9);
        this.exploration = 0.01;
    }

    step() {
        const game = this._game;
        //const learner = this._learner;

        let state = game.getState();

        //let action = learner.bestAction(state);

        //if there is no best action try to explore
        // if ((action==undefined) || (learner.getQValue(state, action) <= 0) || (Math.random() < this.exploration)) {
        //     action = game.snake.randomAction();
        // }

        let action = game.snake.randomAction();

        let reward: number = game.step(action);

        let nextState = game.getState();

        //learner.add(state, nextState, reward, action);

        //make que q-learning algorithm number of iterations=10 or it could be another number
        //learner.learn(100);
    }

    draw(): void {
        this._game.drawField();
        this._game.drawFruit();
        this._game.snake.draw();
    }
}

const game = new Game;