class Game {
    protected _canvas: any;
    protected _ctx: any;
    protected _startBtn: HTMLButtonElement;
    protected _pauseBtn: HTMLButtonElement;
    protected _restartBtn: HTMLButtonElement;
    protected _lifeDiv: HTMLElement;

    protected _snake: Snake;
    protected _fruit: Point;
    
    protected _sizeX: number = 20;
    protected _sizeY: number = 20;
    protected _sizeCell: number = 30;
    protected _speed: number = 50;
    protected _life: number = 100;

    protected _isStarted: boolean = false;
    protected _processInterval: number;

    protected _net: any;
    protected steps: number = 0;
    protected stepsNeeded: number = 25000; // Шагов перед обучением
    protected _trainData: Array<Train> = [];
    
    constructor() {
        this._canvas = document.getElementById('canvas');
        this._canvas.width = this._sizeX * this._sizeCell;
        this._canvas.height = this._sizeY * this._sizeCell; 
        this._canvas.style.width = this._sizeX * this._sizeCell + 'px';
        this._canvas.style.height = this._sizeY * this._sizeCell + 'px';
        this._ctx = this._canvas.getContext('2d');

        this._startBtn = document.getElementById('start') as HTMLButtonElement;
        this._startBtn.addEventListener('click', this._startGame.bind(this));
        
        this._pauseBtn = document.getElementById('pause') as HTMLButtonElement;
        this._pauseBtn.addEventListener('click', this._pause.bind(this));
        
        this._restartBtn = document.getElementById('restart') as HTMLButtonElement;
        this._restartBtn.addEventListener('click', this._restart.bind(this));

        this._lifeDiv = document.getElementById('life');

        const config = {
            inputSize: 24,
            hiddenLayers: [12],
            outputSize: 4,
            activation: 'relu',
            learningRate: 0.1,
        };

        this._net = new brain.NeuralNetwork(config);
        
        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, {x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2)});
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
        this._startGame();
    }
    
    protected _startGame() {
        this._pauseBtn.disabled = false;
        this._processInterval = setInterval (() => {
            this.step(this.steps <= this.stepsNeeded ? this.DFS() : this.NetAction());
            this._drawField();
            this._drawFruit();
            this._snake.draw();
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
        this._pauseBtn.disabled = true;
        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, {x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2)});
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
        this._startGame();
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

    protected _getState(): Array<number>{
        const head: Point = this._snake.head;
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
        wallState = wallState.map((n) => {return n!= 0 ? Number((1/n).toFixed(2)) : 0}); // Нормализация от 0 до 1
        // Тело
        let mpX: number; // Множитель для X
        let mpY: number; // Множитель для Y
        for(let i = 0; i < 8; i++){
            mpX = (i > 4) ? -1 : ((i < 4 && i > 0) ? 1 : 0);
            mpY = (i > 2 && i < 6) ? 1 : ((i > 6 || i < 2) ? -1 : 0);
            let distance: number = 1;
            while(!(head.x + (distance * mpX) < 0 || head.x + (distance * mpX) >= this._sizeX || head.y + (distance * mpY) < 0 || head.y + (distance * mpY) >= this._sizeY)){
                if (this._snake.body.filter((item) => item.x === head.x + (distance * mpX) && item.y === head.y + (distance * mpY)).length > 0){
                    bodyState[i] = distance;
                    break;
                }
                distance++;
            }
        }
        bodyState = bodyState.map((n) => {return n != 0 ? Number((1/n).toFixed(2)) : 0})
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
        foodState = foodState.map((n) => {return n != 0 ? Number((1/n).toFixed(2)) : 0}); // Нормализация от 0 до 1

        return [...wallState, ...bodyState, ...foodState];
    }
    
    public step(action: Array<number>): void {
        console.log(this.steps);
        if (this.steps < this.stepsNeeded){
            this._setTrainData(this._getState(), this.DFS());
        }
        this.steps++;
        if(this.steps === this.stepsNeeded){
            this.NetTrain();
        }
        this._life--;
        this._lifeDiv.textContent = this._life.toString();
        
        const max = Math.max.apply(null, action);
        let indexMax = action.indexOf(max);
        if(indexMax === -1) indexMax = 0;
        this._snake.direction = Math.abs(this._snake.direction - indexMax) === 2 ? this._snake.direction : indexMax;
        const head: Point = {...this._snake.head};

        switch(this._snake.direction) {
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

        if(this._life <= 0){
            this._endGame();
            return;
        }
        
        let growing: boolean = false;
        if (this._checkFruit(head)) {
            this._createFruit();
            this._drawFruit();
            this._life = 100;
            growing = true;
        }

        this._snake.move(growing);
    }
    // Получение действия от сети
    protected NetAction(): Array<number>{
        const action = this._net.run(this._getState());
        console.log(action);
        return action;
    }
    // Сбор данных
    protected _setTrainData(inp: Array<number>, out: Array<number>): void{
        this._trainData.push({input: inp, output: out});
    }
    // Обучение сети
    protected NetTrain(): void{
        this._pause();
        console.log('Обучение...')
        this._net.train(this._trainData, 
            {
                log: true, 
                logPeriod: 100, 
                errorThresh: 0.005, 
                iterations: 10000, 
                timeout: 600000, 
                learningRate: 0.1
            }
        );
        console.log('Обучилось!');
        this._restart();
    }

    protected DFS(): Array<number>{
        const fruit: Point = this._fruit;
        const head: Point = this._snake.head;
        let field: Array<Array<number | undefined>> = new Array(this._sizeY); 
        for(let i = 0; i < field.length; i++){
            field[i] = new Array(this._sizeX).fill(100);
        }
        field[fruit.y][fruit.x] = 80;        
        field[head.y][head.x] = 0;
        for(let item of this._snake.body){
            field[item.y][item.x] = 150;
        }

        let mainArray: Array<Point> = [head];
        let assistArray: Array<Point> = [];
        let findFood: boolean = false;
        const offset: Array<number> = [-1, 1, 1, -1];
        let num: number = 1;
        let offY: number;
        let offX: number;
        while(!findFood){
            assistArray = mainArray;
            mainArray = [];
            for(let item of assistArray){
                for(let i = 0; i < 4; i++){ 
                    if(i % 2 === 0){ 
                        offY = offset[i];
                        offX = 0;
                    } else {
                        offY = 0;
                        offX = offset[i];
                    } 
                    if((item.y + offY || item.x + offX) < 0 || (item.y + offY >= this._sizeY || item.x + offX >= this._sizeX)){
                        continue;
                    }
                    if(field[item.y + offY][item.x + offX] === 150){
                        continue;
                    }
                    if (field[item.y + offY][item.x + offX] === 100 && field[item.y + offY][item.x + offX] != 0 || field[item.y + offY][item.x + offX] === 80) {
                        if (item.y + offY === fruit.y && item.x + offX === fruit.x) {
                            findFood = true;
                        }
                        field[item.y + offY][item.x + offX] = num;
                        let x = item.x + offX;
                        let y = item.y + offY;
                        mainArray.push({x, y} as Point);
                    }
                }
            }
            num++;
            if(num > (this._sizeY*3)) break;
        }

        let currentPoint: Point = fruit;
        const way: Array<Point> = [fruit];
        let findWay: boolean = false;
        while(!(currentPoint.x === head.x && currentPoint.y === head.y)){
            let countWay: number = 0;
            for(let i = 0; i < 4; i++){
                if(i % 2 === 0){ 
                    offY = offset[i];
                    offX = 0;
                } else {
                    offY = 0;
                    offX = offset[i];
                }
                const item: Point = {x:(currentPoint.x + offX), y:(currentPoint.y + offY)};
                if(item.x < 0 || item.y < 0 || item.x >= this._sizeX || item.y >= this._sizeY){
                    continue;
                }
                if(field[item.y][item.x] < field[currentPoint.y][currentPoint.x]){
                    way.push(item);
                    currentPoint = item;
                    findWay = true;
                    countWay++;
                    break;
                }
            }
            if(countWay === 0) {
                findWay = false;
                break;
            }
        }
        way.pop();

        let nearestPoint: Point;
        let dirX: number;
        let dirY: number;
        if (findWay){
            nearestPoint = way.pop();
            dirX = nearestPoint.x - head.x;
            dirY = nearestPoint.y - head.y;
        } else {
            for(let i = 0; i < 4; i++){
                offY = (i % 2 === 0) ? offset[i] : 0;
                offX = (i % 2 === 0) ? 0 : offset[i];
                const item: Point = {x:(head.x + offX), y:(head.y + offY)};
                if(item.x < 0 || item.y < 0 || item.x >= this._sizeX || item.y >= this._sizeY){
                    continue;
                }
                if(field[item.y][item.x] > field[head.y][head.x] && field[item.y][item.x] < 100){
                    dirX = item.x - head.x;
                    dirY = item.y - head.y;
                    break;
                }
            }
        }
    
        if (dirX === 0 && dirY === -1) return [1, 0, 0, 0];
        else if (dirX === 1 && dirY === 0) return [0, 1, 0, 0];
        else if (dirX === 0 && dirY === 1) return [0, 0, 1, 0];
        else return [0, 0, 0, 1];
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
        this._life = 100;
        this._snake = new Snake(this._ctx, this._sizeCell, {x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2)});
        this._drawField();
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
        this._pauseBtn.disabled = true;
        console.log('Поражение!');
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
        this.body.push({x:this.head.x, y:(this.head.y + 1)}, {x:this.head.x, y:(this.head.y + 2)})
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

    public randomAction(): Array<number>{
        const random: number = Math.random();
        if (random < 0.25) return [1, 0, 0, 0];
        if (random < 0.5) return [0, 1, 0, 0];
        if (random < 0.75) return [0, 0, 1, 0];
        return [0, 0, 0, 1];
    }
}

interface Point {
    x: number;
    y: number;
}

enum Direction {
    Up = 0,
    Right = 1,
    Down = 2,
    Left = 3
}

interface Train {
    input: Array<number>;
    output: Array<number>;
}

const game = new Game;