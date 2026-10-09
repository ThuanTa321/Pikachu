let rows = 4;
let cols = 4;
const cellSize = 70;
const SVG_NS = "http://www.w3.org/2000/svg";
const img_count = 36;
const img_path = "./images/pieces";
const img_ext = ".png";

const svg = document.getElementById("game");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const menuLV = document.querySelector(".menu-lv");
const menuGame = document.querySelector(".menu-game");
const overlayText = document.getElementById("overlay-text");

let board = [];
let pick = null;
let score = 0;
let currentLevel = 0;
let timeLeft = 60;
let timeId = null;
let isOver = false;
let isDrawing = false;

menuGame.style.display = "none";

//chon lv
function SetLv(level) {
    currentLevel = level;
    if (currentLevel === 0) {
        rows = 4;
        cols = 4;
    }
    else {
        rows = 9;
        cols = 16;
    }
    menuLV.style.display = "none";
    menuGame.style.display = "flex";
    score = 0;
    scoreText.textContent = score;
    pick = null;
    isOver = false;
    createBoard();
    drawBoard();
    startTimer();
    console.log("Đang chơi Level: " + currentLevel);
}

//tinh gio
function startTimer() {
    stopTimer();
    timeLeft = 60;
    timeText.textContent = timeLeft;
    timeId = setInterval(function () {
        timeLeft--;
        timeText.textContent = timeLeft;
        if (timeLeft <= 0) {
            stopTimer();
            alert("Hết giờ: Điểm của bạn là: " + score);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timeId);
    timeId = null;
}

//chơi lại
function SetReplay() {
    SetLv(currentLevel);
}

//ve menu
function SetMenu() {
    stopTimer();
    menuGame.style.display = "none";
    menuLV.style.display = "flex";
}

//tao cap anh
function createTiles() {
    const tiles = [];
    const  total = rows * cols;
    const temp = currentLevel === 0 ? 2 : 4;
    const kind = total / temp;
    const id = [];

    for (let i = 1; i <= img_count; i++) {
        id.push(i);
    }
    shuffleArray(id);

    for (let i = 0; i < kind; i++) {
        for (let j = 0; j < temp; j++) {
            tiles.push(id[i]);
        }
    }
    return tiles;
}

//tao o SVG
function createSVG(name, attributes) {
    const element = document.createElementNS(SVG_NS, name);
    for (const key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

//tao bang game
function createBoard(){
    const temp = createTiles();
    shuffleArray(temp);
    board = [];
    let index = 0;

    for (let row = 0; row < rows; row++) {
        board[row] = [];
        for (let col = 0; col < cols; col++) {
            board[row][col] = temp[index];
            index++;
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

//tron lai
function shuffleBoard() {
    if (isOver) return;
    const tiles = [];

    for (let row = 0; row < rows; row++) {  //ham gom hinh
        for (let col = 0; col < cols; col++) {
            if (board[row][col] !== "") {
                tiles.push(board[row][col]);
            }
        }
    }

    shuffleArray(tiles);
    let index = 0;
    for (let row = 0; row < rows; row++) {  //xep vao mang
        for (let col = 0; col < cols; col++) {
            if (board[row][col] !== "") {
                board[row][col] = tiles[index];
                index++;
            }
        }
    }
    pick = null;
    drawBoard();
}

//ve bang game
function drawBoard() {
    svg.innerHTML = "";
    svg.setAttribute("viewBox", "0 0 " + cols * cellSize + " " + rows * cellSize);
    svg.setAttribute("width", cols * cellSize);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const id = board[row][col];

            if (id === "") {
                continue;
            }
            const x = col * cellSize;
            const y = row * cellSize;

            const isPick = pick !== null && pick.row === row && pick.col === col;
            const rect = createSVG("rect", {
                x: x + 3,
                y: y + 3,
                width: cellSize - 6,
                height: cellSize - 6,
                rx: 10
            });
            const img = createSVG("image", {
                href: img_path + id + img_ext,
                x: x +10,
                y: y +10,
                width: cellSize -20,
                height: cellSize - 20
            })

            const gr = createSVG("g", {
                class: isPick ? "tile picked" : "tile"
            });
            gr.appendChild(rect);
            gr.appendChild(img);
            gr.addEventListener("click", function () {
                selectTitle(row, col);
            });
            svg.appendChild(gr);
        }
    }
}

//chon va ghep
function selectTitle(row, col) {
    if (isOver || isDrawing) return;
    const clickedTile = board[row][col];
    if (clickedTile === "") return;
    //chua chon thi luu o
    if (pick === null) {
        pick = {
            row: row,
            col: col
        };
        drawBoard();
        return;
    }
    //bam lai o de huy chon
    if (pick.row === row && pick.col === col) {
        pick = null;
        drawBoard();
        return;
    }
    const firtTile = board[pick.row][pick.col];
    const secondTile = board[row][col];

    if (firtTile !== secondTile) {
        pick = {row: row, col: col};
        drawBoard();
        return;
    }

    //2 o giong
    const path = findPath(pick.row, pick.col, row, col);
    if (path.length === 0) {
        pick = {row: row, col: col};
        drawBoard();
        return;
    }
    isDrawing = true;
    drawLine(path);
    const firstPick = pick;
    setTimeout(function () {
        board[firstPick.row][firstPick.col] = "";
        board[row][col] = "";
        score = score + 10;
        scoreText.textContent = score;
        pick = null;
        isDrawing = false;
        drawBoard();
        checkWin();
    }, 300);
}

function draw(path) {
    return path.length >= 2 && path.length <= 4;
}

//ve duong di
function drawLine(path) {
    const points = path.map(function (p) {
        const x = centerOf(p.col, cols);
        const y = centerOf(p.row, rows);
        return x + "," + y;
    }).join(" ");

    const line = createSVG("polyline", {
        points: points,
        class: "path-line"
    });
    svg.appendChild(line);
    setTimeout(function () {
        line.remove();
    }, 300);
}

function centerOf(index, max) {
    if (index < 0) return -8;
    if (index >= max) return max * cellSize + 8;
    return index * cellSize + cellSize/2;
}

//tim duong di (BFS)
function findPath(r1, c1, r2, c2) {
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    const maxRow = rows + 1;
    const maxCol = cols + 1;
    const startRow = r1 + 1;
    const startCol = c1 + 1;
    const endRow = r2 + 1;
    const endCol = c2 + 1;
    const queue = [{
        row: startRow, col: startCol,
        direction: -1,
        turns: 0,
        path: [{row: r1, col: c1}]
    }];

    const visited = new Set();
    let index = 0;
    while (index < queue.length) {
        const current = queue[index];
        index++;
        if (current.row === endRow && current.col === endCol) return current.path;

        for (let i = 0; i < 4; i++) {
            let turns = current.turns;
            if (current.direction !== -1 && current.direction !== i) turns++;
            if (turns > 2) continue;

            const nextRow = current.row + directions[i][0];
            const nextCol = current.col + directions[i][1];
            if (nextRow < 0 || nextRow > maxRow || nextCol < 0 || nextCol > maxCol) continue;

            const isEnd = nextRow === endRow && nextCol === endCol;
            const insideBoard = nextRow >= 1 && nextRow <= rows && nextCol >= 1 && nextCol <= cols; //kt co bi chan ko?
            if (insideBoard && !isEnd) {
                const tile = board[nextRow - 1][nextCol - 1];
                if (tile !== "") continue;
            }
            const key = nextRow + "-" + nextCol + "-" + i + "-" + turns;
            if (visited.has(key)) continue;
            visited.add(key);
            queue.push({
                row: nextRow, col: nextCol,
                direction: i, turns: turns,
                path: current.path.concat({
                    row: nextRow - 1, col: nextCol - 1  //-1 la dang o vien ngoai ban co
                })
            });
        }
    }
    return [];
}

//check win
function checkWin() {
    let res = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col] !== "") {
                res++;
            }
        }
    }

    if (res ===0 ){
        stopTimer();
        isOver = true;
        showOverlay("Điểm của bạn: " + score);
    }
}

function showOverlay(msg) {
    overlayText.textContent = msg;
    overlayText.style.display = "flex";
}
