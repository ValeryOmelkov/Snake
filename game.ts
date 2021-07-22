class Game {
    protected _canvas: any;
    protected _ctx: any;
    protected _pauseBtn: HTMLButtonElement;
    protected _restartBtn: HTMLButtonElement;

    protected _snake: Snake;
    protected _fruit: Point;
    
    protected _sizeX: number = 17;
    protected _sizeY: number = 17;
    protected _sizeCell: number = 30;
    protected _speed: number = 100;
    
    protected _isStarted: boolean = false;
    protected _directionChosen: boolean = false;
    protected _processInterval: number;
    
    
    constructor() {
        this._canvas = document.getElementById('canvas');
        this._canvas.width = this._sizeX * this._sizeCell;
        this._canvas.height = this._sizeY * this._sizeCell; 
        this._canvas.style.width = this._sizeX * this._sizeCell + 'px';
        this._canvas.style.height = this._sizeY * this._sizeCell + 'px';
        this._ctx = this._canvas.getContext('2d');
        
        this._pauseBtn = document.getElementById('pause') as HTMLButtonElement;
        this._pauseBtn.addEventListener('click', this._pause.bind(this));
        
        this._restartBtn = document.getElementById('restart') as HTMLButtonElement;
        this._restartBtn.addEventListener('click', this._restart.bind(this));
        
        document.addEventListener('keypress', this._onKeyPress.bind(this));
        
        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, {x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2)});
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
    }
    
    protected _startGame() {
        this._pauseBtn.disabled = false;
        this._processInterval = setInterval (() => {
            this._moveSnake();
            this._drawField();
            this._drawFruit();
            this._snake.draw();
            this._directionChosen = false;
        }, this._speed);
    }
    
    protected _pause() {
        this._isStarted = false;
        this._pauseBtn.disabled = true;
        clearInterval(this._processInterval);
    }
    
    protected _restart() {
        this._isStarted = false;
        clearInterval(this._processInterval);
        this._directionChosen = false;
        this._pauseBtn.disabled = true;
        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, {x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2)});
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
    }
    
    protected _onKeyPress(event: any): void {
        if (this._directionChosen) return;

        switch(event.code){
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
        
        if(!this._isStarted) {
            this._startGame();
            this._isStarted = true;
        }
    }

    protected _drawField(): void {
        for(let y: number = 0; y < this._sizeY; y++) {
            for(let x: number = 0; x < this._sizeX; x++) {
                this._ctx.fillStyle = ((x + (y % 2)) % 2 === 0) ? '#AAAAAA' : '#777777';
                this._ctx.fillRect(x * this._sizeCell, y * this._sizeCell, this._sizeCell, this._sizeCell);
            }
        }
    }
    
    protected _createFruit(): void {
        const snake = [this._snake.head, ...this._snake.body];
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
    
    protected _drawFruit(): void {
        this._ctx.fillStyle = '#AA0000';
        this._ctx.fillRect(this._fruit.x * this._sizeCell, this._fruit.y * this._sizeCell, this._sizeCell, this._sizeCell);
    }
    
    protected _moveSnake(): void {
        const direction: string = this._snake.direction;
        const head: Point = {...this._snake.head};
        
        switch(direction) {
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
        
        let growing: boolean = false;
        if (this._checkFruit(head)) {
            this._createFruit();
            this._drawFruit();
            growing = true;
        }
        
        if (!this._checkIsAlive(head)) {
            this._endGame();
            return;
        } else {
            this._snake.move(growing);
        }
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
        for(const item of this._snake.body) {
            if(item.x === head.x && item.y === head.y){
                return false;
            }
        }
        
        return true;
    }
    
    protected _endGame(): void {
        clearInterval(this._processInterval);
        this._pauseBtn.disabled = true;
        alert('Поражение!');
    }
}

class Snake {
    protected _ctx: any;
    protected _sizeCell: number;
    public head: Point;
    public body: Point[] = [];
    public direction: string;
    
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
    
    public up(): void{
        this.direction = this.direction != 'down' ? 'up' : 'down';
    }
    
    public left(): void{
        this.direction = this.direction != 'right' ? 'left' : 'right';
    }
    
    public down(): void{
        this.direction = this.direction != 'up' ? 'down' : 'up';
    }
    
    public right(): void{
        this.direction = this.direction != 'left' ? 'right' : 'left';
    }
}

interface Point {
    x: number;
    y: number;
}

const game = new Game;