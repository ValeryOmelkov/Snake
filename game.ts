class Game{
    protected _canvas: any;
    protected _ctx: any;
    protected _speed: number = 100;
    protected _sizeX: number = 17;
    protected _sizeY: number = 17;
    protected _sizeCell: number = 30;
    protected _width: number = this._sizeX * this._sizeCell;
    protected _height: number = this._sizeY * this._sizeCell;
    protected _fruitCoord: Array<number>;
    protected _snake: Snake;

    constructor(){
        this._canvas = document.getElementById('canvas'); 
        this._ctx = this._canvas.getContext('2d');
        this._snake = new Snake([5,5], this._sizeCell, this._ctx);
        this._drawField();
        this._snake.drawSnake();
        this._createFruit();
        setInterval (() => {
            this._snake.moveSnake();
            this._drawField();
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
        const x = Math.round(Math.random() * (this._sizeX));
        const y = Math.round(Math.random() * (this._sizeY));
        this._fruitCoord = [x, y];
        this._ctx.fillStyle = '#AA0000';
        this._ctx.fillRect(x*this._sizeCell, y*this._sizeCell, this._sizeCell, this._sizeCell);
    }
}

class Snake{
    protected _snake: Array<Array<number>> = [];
    protected _sizeCell: number;
    protected _ctx: any;
    protected _direction: string; // up | down | right | left

    constructor(coord: Array<number>, sizeCell: number, ctx: any){
        this._sizeCell = sizeCell;
        this._ctx = ctx;
        document.addEventListener('keypress', this._onKeyPress.bind(this));
        for(let i: number = 0; i < 4; i++){
           this._snake.push([coord[0]+i, coord[1]]);
        }
    }

    protected _onKeyPress(event: any): void{
        switch(event.key){
            case 'w': this._direction = this._direction != 'down' ? 'up' : 'down'; break;
            case 'a': this._direction = this._direction != 'right' ? 'left' : 'right'; break;
            case 's': this._direction = this._direction != 'up' ? 'down' : 'up'; break;
            case 'd': this._direction = this._direction != 'left' ? 'right' : 'left'; break;
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

    public moveSnake(): void{
        if (this._direction){
            for(let i: number = this._snake.length - 1; i > 0; i--){
                this._snake[i] = this._snake[i-1];
            }
        }
        switch(this._direction){
            case 'up': this._snake[0] = [this._snake[0][0], this._snake[0][1] - 1]; break;
            case 'down': this._snake[0] = [this._snake[0][0], this._snake[0][1] + 1]; break;
            case 'right': this._snake[0] = [this._snake[0][0] + 1, this._snake[0][1]]; break;
            case 'left': this._snake[0] = [this._snake[0][0] - 1, this._snake[0][1]]; break;
        }
    }
}

const game = new Game();