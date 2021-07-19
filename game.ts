class Game{
    protected _canvas: any;
    protected _ctx: any;

    protected _isStarted: boolean = false;

    protected _speed: number = 100;
    protected _sizeX: number = 17;
    protected _sizeY: number = 17;
    protected _sizeCell: number = 30;
    protected _width: number = this._sizeX * this._sizeCell;
    protected _height: number = this._sizeY * this._sizeCell;

    protected _processInterval: number;
    protected _fruitCoord: [number, number];
    protected _snake: Snake;
    protected _points: number;

    constructor(){
        this._canvas = document.getElementById('canvas'); 
        this._ctx = this._canvas.getContext('2d');
        document.addEventListener('keypress', this._onKeyPress.bind(this));
        this._snake = new Snake([8,8], this._sizeCell, this._ctx);
        this._createFruit();
        this._drawField();
        this._drawFruit();
        this._snake.drawSnake();
    }

    protected _process(): void{
        this._processInterval = setInterval (() => {
            this._moveSnake();
            this._drawField();
            this._drawFruit();
            this._snake.drawSnake();
        }, this._speed);
    }

    protected _drawField(): void{
        for(let y: number = 0; y < this._sizeY; y++){
            for(let x: number = 0; x < this._sizeX; x++){
                this._ctx.fillStyle = ((x + (y % 2)) % 2 === 0) ? '#AAAAAA' : '#777777';
                this._ctx.fillRect(x*this._sizeCell, y*this._sizeCell, this._sizeCell, this._sizeCell);
            }
        }
    }

    protected _createFruit(): void{
        const snake: Array<[number, number]> = this._snake.getSnake();
        let inSnake: boolean = true;
        let x: number;
        let y: number;
        while(inSnake){
            x = Math.floor(Math.random() * (this._sizeX));
            y = Math.floor(Math.random() * (this._sizeY));
            inSnake = snake.some(function(item){
                return (item[0] === x && item[1] === y);
            });
        }
        this._fruitCoord = [x, y];
    }

    protected _drawFruit(): void{
        this._ctx.fillStyle = '#AA0000';
        this._ctx.fillRect(this._fruitCoord[0]*this._sizeCell, this._fruitCoord[1]*this._sizeCell, this._sizeCell, this._sizeCell);
    }

    protected _checkFruit(snake: Array<[number, number]>): boolean{
        if (snake[0][0] === this._fruitCoord[0] && snake[0][1] === this._fruitCoord[1]){
            return true;
        }
        return false;
    }

    protected _moveSnake(): void{
        const direction: string = this._snake.getDirection();
        const oldSnake: Array<[number, number]> = this._snake.getSnake();
        let currentSnake: Array<[number, number]> = [];
        
        switch(direction){
            case 'up': currentSnake[0] = [oldSnake[0][0], oldSnake[0][1] - 1]; break;
            case 'down': currentSnake[0] = [oldSnake[0][0], oldSnake[0][1] + 1]; break;
            case 'right': currentSnake[0] = [oldSnake[0][0] + 1, oldSnake[0][1]]; break;
            case 'left': currentSnake[0] = [oldSnake[0][0] - 1, oldSnake[0][1]]; break;
        }
    
        for(let i: number = 1; i < oldSnake.length; i++){
            currentSnake[i] = oldSnake[i-1];
        }

        if(this._checkFruit(oldSnake)){
            this._createFruit();
            currentSnake.push(oldSnake[oldSnake.length-1]);
        }

        if(this._checkIsAlive(currentSnake)){
            this._snake.setSnake(currentSnake);
        } else {
            this._endGame();
        }
    }

    protected _checkIsAlive(snake: Array<[number, number]>): boolean{
        const head: [number, number] = snake[0]; // Координаты головы змеи
        // Проверка на столкновение со стеной
        if ((head[0] < 0) || (head[0] >= this._sizeX) || (head[1] < 0) || (head[1] >= this._sizeY)){
            return false;
        }
        // Проверка на столкновение с туловищем
        for(const item of snake.slice(1)){
            if(item[0] === head[0] && item[1] === head[1]){
                return false;
            }
        }

        return true;
    }

    protected _onKeyPress(event: any): void{
        switch(event.key){
            case 'w': this._snake.up(); break;
            case 'a': this._snake.left(); break;
            case 's': this._snake.down(); break;
            case 'd': this._snake.right(); break;
            default: return;
        }

        if(!this._isStarted) {
            this._process();
            this._isStarted = true;
        }
    }

    protected _endGame(): void{
        clearInterval(this._processInterval);
        alert('Проигрышь!');
    }
}

class Snake{
    protected _ctx: any;
    protected _snake: Array<[number, number]> = [];
    protected _sizeCell: number;
    protected _direction: string; // up | down | right | left
    protected _isAlive: boolean = true;

    constructor(coord: [number, number], sizeCell: number, ctx: any){
        this._sizeCell = sizeCell;
        this._ctx = ctx;
        for(let i: number = 0; i < 3; i++){
           this._snake.push([coord[0]+i, coord[1]]);
        }
    }

    public drawSnake(): void{
        this._ctx.fillStyle = '#008800';
        this._ctx.fillRect(this._snake[0][0]*this._sizeCell, this._snake[0][1]*this._sizeCell, this._sizeCell, this._sizeCell);
        this._ctx.fillStyle = '#00BB00';
        for(let i: number = 1; i < this._snake.length; i++){
            this._ctx.fillRect(this._snake[i][0]*this._sizeCell, this._snake[i][1]*this._sizeCell, this._sizeCell, this._sizeCell);
        }
    }

    public up(): void{
        this._direction = this._direction != 'down' ? 'up' : 'down';
    }

    public left(): void{
        this._direction = this._direction != 'right' ? 'left' : 'right';
    }

    public down(): void{
        this._direction = this._direction != 'up' ? 'down' : 'up';
    }

    public right(): void{
        this._direction = this._direction != 'left' ? 'right' : 'left';
    }

    public getSnake(): Array<[number, number]>{
        return this._snake;
    }

    public setSnake(value: Array<[number, number]>): void{
        this._snake = value;
    }

    public getDirection(): string{
        return this._direction;
    }
}

const game = new Game();