class Game {
    constructor() {
        this._img = new Image();
        this._sizeX = 20;
        this._sizeY = 20;
        this._sizeCell = 30;
        this._speed = 50;
        //protected _LifeNN: HTMLElement;
        this._isNet = false;
        this._countGame = 1;
        this._maxLength = 0;
        this._life = 500;
        this._isStarted = false;
        this.steps = 0;
        this.stepsNeeded = 25000; // Шагов перед обучением
        this._trainData = [];
        this._hamiltonPath = [];
        this.StepsCountAfterCalculatePath = 0;
        this.InvertHamiltonPath = false;
        this.TempPath = [];
        this._canvas = document.getElementById('canvas');
        this._canvas.width = this._sizeX * this._sizeCell;
        this._canvas.height = this._sizeY * this._sizeCell;
        this._canvas.style.width = this._sizeX * this._sizeCell + 'px';
        this._canvas.style.height = this._sizeY * this._sizeCell + 'px';
        this._ctx = this._canvas.getContext('2d');
        this._img.src = 'image/apple.png';
        this._startBtn = document.getElementById('start');
        this._startBtn.addEventListener('click', this._startGame.bind(this));
        this._pauseBtn = document.getElementById('pause');
        this._pauseBtn.addEventListener('click', this._pause.bind(this));
        this._restartBtn = document.getElementById('restart');
        this._restartBtn.addEventListener('click', this._restart.bind(this));
        this._jsonTextArea = document.getElementById('json');
        this._MaxLengthA = document.getElementById('MaxLengthA');
        this._LengthA = document.getElementById('LengthA');
        this._CountGameA = document.getElementById('CountGameA');
        //this._LifeA = document.getElementById('LifeA');
        this._MaxLengthNN = document.getElementById('MaxLengthNN');
        this._LengthNN = document.getElementById('LengthNN');
        this._CountGameNN = document.getElementById('CountGameNN');
        //this._LifeNN = document.getElementById('LifeNN');
        this._createHamiltonPath();
        this._createNet();
        //this._loadNet();
        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, { x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2) });
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
        this._calculatePath();
        this._startGame();
    }
    _startGame() {
        this._pauseBtn.disabled = false;
        this._processInterval = setInterval(() => {
            this.step(this._isNet ? this.NetAction() : this._getDirection(false));
            this._drawField();
            this._drawFruit();
            this._snake.draw();
            if (this._snake.body.length < this.StepsCountAfterCalculatePath) {
                this._calculatePath();
            }
        }, this._speed);
    }
    _pause() {
        this._isStarted = false;
        clearInterval(this._processInterval);
    }
    _restart() {
        this._isStarted = false;
        clearInterval(this._processInterval);
        this._drawField();
        this._snake = new Snake(this._ctx, this._sizeCell, { x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2) });
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
        this._startGame();
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
        //this._ctx.fillStyle = '#AA0000';
        this._ctx.drawImage(this._img, this._fruit.x * this._sizeCell, this._fruit.y * this._sizeCell, this._sizeCell, this._sizeCell);
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
        wallState = wallState.map((n) => { return n != 0 ? Number((1 / n).toFixed(2)) : 0; }); // Нормализация от 0 до 1
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
        bodyState = bodyState.map((n) => { return n != 0 ? Number((1 / n).toFixed(2)) : 0; });
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
        foodState = foodState.map((n) => { return n != 0 ? Number((1 / n).toFixed(2)) : 0; }); // Нормализация от 0 до 1
        return [...wallState, ...bodyState, ...foodState];
    }
    step(action) {
        //console.log(this.steps);
        if (this.steps < this.stepsNeeded) {
            this._setTrainData(this._getState(), this._getDirection());
        }
        this.steps++;
        if (this.steps === this.stepsNeeded) {
            this.NetTrain();
        }
        //this._life--;
        const max = Math.max.apply(null, action);
        let indexMax = action.indexOf(max);
        if (indexMax === -1)
            indexMax = 0;
        this._snake.direction = Math.abs(this._snake.direction - indexMax) === 2 ? this._snake.direction : indexMax;
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
        // Гамильтонов цикл бывает идёт куда дольше
        /*if(this._life <= 0){
            console.log('Закончились жизни');
            this._endGame();
            return;
        }*/
        let growing = false;
        if (this._checkFruit(head)) {
            this._createFruit();
            this._drawFruit();
            this._life = 100;
            growing = true;
        }
        this._setTextDivBlock();
        this._snake.move(growing);
    }
    _setTextDivBlock() {
        if (this._isNet) {
            if (this._snake.body.length + 1 > this._maxLength) {
                this._maxLength = this._snake.body.length + 1;
                this._MaxLengthNN.textContent = this._maxLength.toString();
            }
            this._LengthNN.textContent = (this._snake.body.length + 1).toString();
            this._CountGameNN.textContent = this._countGame.toString();
            //this._LifeNN.textContent = this._life.toString();
        }
        else {
            if (this._snake.body.length + 1 > this._maxLength) {
                this._maxLength = this._snake.body.length + 1;
                this._MaxLengthA.textContent = this._maxLength.toString();
            }
            this._LengthA.textContent = (this._snake.body.length + 1).toString();
            this._CountGameA.textContent = this._countGame.toString();
            //this._LifeA.textContent = this._life.toString();
        }
    }
    _createNet() {
        const config = {
            inputSize: 24,
            hiddenLayers: [12],
            outputSize: 4,
            activation: 'relu',
            learningRate: 0.1,
        };
        this._net = new brain.NeuralNetwork(config);
    }
    // Получение действия от сети
    NetAction() {
        const action = this._net.run(this._getState());
        console.log(action);
        return action;
    }
    // Сбор данных
    _setTrainData(inp, out) {
        this._trainData.push({ input: inp, output: out });
    }
    // Обучение сети
    NetTrain() {
        this._pause();
        console.log('Обучение...');
        this._net.train(this._trainData, {
            log: true,
            logPeriod: 100,
            errorThresh: 0.005,
            iterations: 10000,
            timeout: 600000,
            learningRate: 0.1
        });
        console.log('Обучилось!');
        this._isNet = true;
        this._restart();
    }
    // Сохранение сети
    _saveNet() {
        const json = JSON.stringify(this._net.toJSON());
        this._jsonTextArea.innerHTML = json;
    }
    // Загрузка сети
    _loadNet(jsonFile) {
        jsonFile = JSON.parse(jsonFile);
        this._net.fromJSON(jsonFile);
        this._isNet = true;
    }
    _createHamiltonPath() {
        this._hamiltonPath = [];
        this._hamiltonPath.push({ x: 0, y: 0 });
        if (!this._hamiltonStep(this._hamiltonPath[0])) {
            alert('Нет гамильтонова цикла!');
        }
    }
    _hamiltonStep(currentPoint) {
        if (this._hamiltonPath.length === this._sizeX * this._sizeY) {
            let first = this._hamiltonPath[0];
            return (first.x == currentPoint.x && first.y == currentPoint.y - 1)
                || (first.x == currentPoint.x && first.y == currentPoint.y + 1)
                || (first.x - 1 == currentPoint.x && first.y == currentPoint.y)
                || (first.x + 1 == currentPoint.x && first.y == currentPoint.y);
        }
        const offset = [-1, 1, 1, -1];
        for (let i = 0; i < 4; i++) {
            let offY, offX;
            if (i % 2 === 0) {
                offY = offset[i];
                offX = 0;
            }
            else {
                offY = 0;
                offX = offset[i];
            }
            const newPoint = { x: (currentPoint.x + offX), y: (currentPoint.y + offY) };
            if ((newPoint.x >= 0) && (newPoint.y >= 0) && (newPoint.x < this._sizeX) && (newPoint.y < this._sizeY) && !this._hamiltonPath.some(point => point.x === newPoint.x && point.y === newPoint.y)) {
                this._hamiltonPath.push(newPoint);
                if (this._hamiltonStep(newPoint)) {
                    return true;
                }
                this._hamiltonPath.filter(point => !(point.x === newPoint.x && point.y === newPoint.y));
            }
        }
        return false;
    }
    _getDirection(needShift = true) {
        const head = this._snake.head;
        let dirX;
        let dirY;
        if (this.TempPath.length > 0) {
            let nextPoint = needShift ? this.TempPath.shift() : this.TempPath[0];
            dirX = nextPoint.x - head.x;
            dirY = nextPoint.y - head.y;
            if (dirX === 0 && dirY === -1)
                return [1, 0, 0, 0];
            else if (dirX === 1 && dirY === 0)
                return [0, 1, 0, 0];
            else if (dirX === 0 && dirY === 1)
                return [0, 0, 1, 0];
            else
                return [0, 0, 0, 1];
        }
        this.StepsCountAfterCalculatePath++;
        for (let i = 0; i < this._hamiltonPath.length; i++) {
            const point = this._hamiltonPath[i];
            if (point.x === head.x && point.y === head.y) {
                let nextIndex = (i + 1 < this._hamiltonPath.length ? i + 1 : 0);
                this.InvertHamiltonPath = true;
                if (!this._checkIsAlive(this._hamiltonPath[nextIndex])) {
                    nextIndex = (i - 1 < 0 ? this._hamiltonPath.length - 1 : i - 1);
                    this.InvertHamiltonPath = false;
                }
                dirX = this._hamiltonPath[nextIndex].x - head.x;
                dirY = this._hamiltonPath[nextIndex].y - head.y;
            }
        }
        if (dirX === 0 && dirY === -1)
            return [1, 0, 0, 0];
        else if (dirX === 1 && dirY === 0)
            return [0, 1, 0, 0];
        else if (dirX === 0 && dirY === 1)
            return [0, 0, 1, 0];
        else
            return [0, 0, 0, 1];
    }
    _calculatePath() {
        this.StepsCountAfterCalculatePath = 0;
        let finalIndexPoint = this._hamiltonPath.findIndex(point => point.x === this._fruit.x && point.y === this._fruit.y);
        let tempPath = [];
        let stepPiton = [this._snake.head, ...this._snake.body];
        let index = 0;
        let result = this.StepTempPath(index, this.GetInvert(stepPiton), this._snake.head, finalIndexPoint, stepPiton, tempPath);
        if (result.PathIsFound) {
            this.TempPath = result.TempPath;
            this.InvertHamiltonPath = result.InvertHamiltonPath;
        }
    }
    StepTempPath(index, invert, current, finalIndexPoint, stepPiton, tempPath) {
        index++;
        if (this._hamiltonPath.length < index) {
            return new ResultAnalizePath(tempPath, false);
        }
        let finalPoint = this._hamiltonPath[finalIndexPoint];
        if (current.x === finalPoint.x && current.y === finalPoint.y) {
            if (this._snake.body.length <= 2) {
                return new ResultAnalizePath(tempPath, true);
            }
            // Смотрим путь из фрукта по Гаимльтонову пути и по обратному Гамильтонову пути
            let result = null;
            [false, true].forEach(d => {
                let tempPiton = [...stepPiton];
                let isFound = true;
                let invertHamiltonPath = d;
                for (let j = 1; j < this._snake.body.length + 3; j++) {
                    let hamiltonPoint;
                    if (invertHamiltonPath) {
                        hamiltonPoint = finalIndexPoint - j >= 0 ? this._hamiltonPath[finalIndexPoint - j] : this._hamiltonPath[this._hamiltonPath.length + (finalIndexPoint - j)];
                    }
                    else {
                        hamiltonPoint = finalIndexPoint + j < this._hamiltonPath.length ? this._hamiltonPath[finalIndexPoint + j] : this._hamiltonPath[finalIndexPoint + j - this._hamiltonPath.length];
                    }
                    // Смотрим на Гамильтонов путь от фрукта, и если он пересекается с самой змейкой или кратчайшем путём, то тогда этот путь не подходит
                    if (tempPiton.some(point => point.x === hamiltonPoint.x && point.y === hamiltonPoint.y)) {
                        isFound = false;
                        break;
                    }
                    tempPiton.push(hamiltonPoint);
                }
                if (isFound) {
                    result = new ResultAnalizePath(tempPiton.slice(this._snake.body.length + 1, tempPiton.length), true, invertHamiltonPath);
                }
            });
            if (result !== null) {
                return result;
            }
            return new ResultAnalizePath(tempPath, false);
        }
        if ((this._sizeX + this._sizeY * 2) <= tempPath.length) {
            return new ResultAnalizePath(tempPath, false);
        }
        let newElement = null;
        if (invert) {
            if (current.x < finalPoint.x) {
                newElement = { x: current.x + 1, y: current.y };
            }
            else if (finalPoint.x < current.x) {
                newElement = { x: current.x - 1, y: current.y };
            }
            else if (current.y < finalPoint.y) {
                newElement = { x: current.x, y: current.y + 1 };
            }
            else if (finalPoint.y < current.y) {
                newElement = { x: current.x, y: current.y - 1 };
            }
        }
        else {
            if (current.y < finalPoint.y) {
                newElement = { x: current.x, y: current.y + 1 };
            }
            else if (finalPoint.y < current.y) {
                newElement = { x: current.x, y: current.y - 1 };
            }
            else if (current.x < finalPoint.x) {
                newElement = { x: current.x + 1, y: current.y };
            }
            else if (finalPoint.x < current.x) {
                newElement = { x: current.x - 1, y: current.y };
            }
        }
        if (!stepPiton.some(point => point.x === newElement.x && point.y === newElement.y)) {
            tempPath.push(newElement);
            stepPiton.push(newElement);
            let result = this.StepTempPath(index, !invert, newElement, finalIndexPoint, stepPiton, tempPath);
            if (result.PathIsFound) {
                return result;
            }
            if (this._hamiltonPath.length < index) {
                return new ResultAnalizePath(tempPath, false);
            }
            tempPath = tempPath.filter(point => !(point.x === newElement.x && point.y === newElement.y));
            stepPiton = stepPiton.filter(point => !(point.x === newElement.x && point.y === newElement.y));
        }
        // Тормозит с этим улучшением
        /*
        let nextFinalPoint;
        if (this.InvertHamiltonPath) {
            nextFinalPoint = (finalIndexPoint - 1 < 0) ? this._hamiltonPath[this._hamiltonPath.length - 1] : this._hamiltonPath[finalIndexPoint - 1];
        } else {
            nextFinalPoint = (finalIndexPoint + 1 == this._hamiltonPath.length) ? this._hamiltonPath[0] : this._hamiltonPath[finalIndexPoint + 1];
        }
        
        let directions = [];
        directions.push(finalPoint.y < nextFinalPoint.y ? 0 : 2);
        directions.push(finalPoint.x < nextFinalPoint.x ? 3 : 1);
        directions.push(finalPoint.y < nextFinalPoint.y ? 2 : 0);
        directions.push(finalPoint.x < nextFinalPoint.x ? 1 : 3);

        let result = null;
        directions.forEach(direction => {
            switch(direction) {
                case Direction.Up:
                    newElement = {x: current.x, y: current.y - 1};
                    break;
                case Direction.Left:
                    newElement = {x: current.x - 1, y: current.y};
                    break;
                case Direction.Down:
                    newElement = {x: current.x, y: current.y + 1};
                    break;
                case Direction.Rigth:
                    newElement = {x: current.x + 1, y: current.y};
                    break;
            }
            if (this._checkIsAlive(newElement)) {
                tempPath.push(newElement);
                stepPiton.push(newElement);
                let resultNew = this.StepTempPath(index, this.GetInvert(stepPiton), newElement, finalIndexPoint, stepPiton, tempPath);
                if (resultNew.PathIsFound) {
                    result = resultNew;
                }
                if (this._hamiltonPath.length < index) {
                    result = new ResultAnalizePath(tempPath, false);
                }
                tempPath = tempPath.filter(point => !(point.x == newElement.x && point.y === newElement.y));
                stepPiton = stepPiton.filter(point => !(point.x == newElement.x && point.y === newElement.y));
            }
        })
        if (result !== null) {
            return result;
        }*/
        return new ResultAnalizePath(tempPath, false);
    }
    GetInvert(stepPiton) {
        if (this._snake.body.length > 0) {
            let snakeDir = stepPiton[stepPiton.length - 1].y - stepPiton[stepPiton.length - 2].y;
            let fruitDir = stepPiton[stepPiton.length - 1].y - this._fruit.y;
            return (snakeDir < 0 && fruitDir < 0) || (snakeDir > 0 && fruitDir > 0);
        }
        return false;
    }
    DFS() {
        const fruit = this._fruit;
        const head = this._snake.head;
        let field = new Array(this._sizeY);
        for (let i = 0; i < field.length; i++) {
            field[i] = new Array(this._sizeX).fill(100);
        }
        field[fruit.y][fruit.x] = 80;
        field[head.y][head.x] = 0;
        for (let item of this._snake.body) {
            field[item.y][item.x] = 150;
        }
        let mainArray = [head];
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
                    if (field[item.y + offY][item.x + offX] === 100 && field[item.y + offY][item.x + offX] != 0 || field[item.y + offY][item.x + offX] === 80) {
                        if (item.y + offY === fruit.y && item.x + offX === fruit.x) {
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
            if (num > (this._sizeY * 3))
                break;
        }
        let currentPoint = fruit;
        const way = [fruit];
        let findWay = false;
        while (!(currentPoint.x === head.x && currentPoint.y === head.y)) {
            let countWay = 0;
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
                if (field[item.y][item.x] < field[currentPoint.y][currentPoint.x]) {
                    way.push(item);
                    currentPoint = item;
                    findWay = true;
                    countWay++;
                    break;
                }
            }
            if (countWay === 0) {
                findWay = false;
                break;
            }
        }
        way.pop();
        let nearestPoint;
        let dirX;
        let dirY;
        if (findWay) {
            nearestPoint = way.pop();
            dirX = nearestPoint.x - head.x;
            dirY = nearestPoint.y - head.y;
        }
        else {
            for (let i = 0; i < 4; i++) {
                offY = (i % 2 === 0) ? offset[i] : 0;
                offX = (i % 2 === 0) ? 0 : offset[i];
                const item = { x: (head.x + offX), y: (head.y + offY) };
                if (item.x < 0 || item.y < 0 || item.x >= this._sizeX || item.y >= this._sizeY) {
                    continue;
                }
                if (field[item.y][item.x] > field[head.y][head.x] && field[item.y][item.x] < 100) {
                    dirX = item.x - head.x;
                    dirY = item.y - head.y;
                    break;
                }
            }
        }
        if (dirX === 0 && dirY === -1)
            return [1, 0, 0, 0];
        else if (dirX === 1 && dirY === 0)
            return [0, 1, 0, 0];
        else if (dirX === 0 && dirY === 1)
            return [0, 0, 1, 0];
        else
            return [0, 0, 0, 1];
    }
    _checkFruit(head) {
        if (head.x === this._fruit.x && head.y === this._fruit.y) {
            return true;
        }
        return false;
    }
    _checkIsAlive(point) {
        // Проверка на столкновение со стеной
        if ((point.x < 0) || (point.x >= this._sizeX) || (point.y < 0) || (point.y >= this._sizeY)) {
            return false;
        }
        // Проверка на столкновение с туловищем
        for (const item of this._snake.body) {
            if (item.x === point.x && item.y === point.y) {
                return false;
            }
        }
        return true;
    }
    _endGame() {
        this.TempPath = [];
        this.StepsCountAfterCalculatePath = 0;
        this._countGame++;
        //this._life = 500;
        this._snake = new Snake(this._ctx, this._sizeCell, { x: Math.floor(this._sizeX / 2), y: Math.floor(this._sizeY / 2) });
        this._drawField();
        this._snake.draw();
        this._createFruit();
        this._drawFruit();
        console.log('Поражение!');
    }
}
class ResultAnalizePath {
    constructor(tempPath, pathIsFound, invertHamiltonPath = false) {
        this.TempPath = tempPath;
        this.PathIsFound = pathIsFound;
        this.InvertHamiltonPath = invertHamiltonPath;
    }
}
class Snake {
    constructor(context, size, startPoint) {
        this.body = [];
        this.direction = Direction.Up;
        this._ctx = context;
        this._sizeCell = size;
        this.head = startPoint;
        this.body.push({ x: this.head.x, y: (this.head.y + 1) }, { x: this.head.x, y: (this.head.y + 2) });
    }
    draw() {
        this._ctx.fillStyle = '#008800';
        this._ctx.fillRect(this.head.x * this._sizeCell, this.head.y * this._sizeCell, this._sizeCell, this._sizeCell);
        for (let i = 0; i < this.body.length; i++) {
            this._ctx.fillStyle = '#008800';
            this._ctx.fillRect(this.body[i].x * this._sizeCell, this.body[i].y * this._sizeCell, this._sizeCell, this._sizeCell);
            this._ctx.fillStyle = '#00BB00';
            this._ctx.fillRect(this.body[i].x * this._sizeCell + 2, this.body[i].y * this._sizeCell + 2, this._sizeCell - 4, this._sizeCell - 4);
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
            return [1, 0, 0, 0];
        if (random < 0.5)
            return [0, 1, 0, 0];
        if (random < 0.75)
            return [0, 0, 1, 0];
        return [0, 0, 0, 1];
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
