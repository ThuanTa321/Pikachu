let rows;
let cols;
const cellSize = 70;
const SVG_NS = "http://www.w3.org/2000/svg";
const img_count = 36;
const img_path = "./images/pieces";
const img_ext = ".png";
const maxHint = 999;

const svg = document.getElementById("game");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const menuLV = document.querySelector(".menu-lv");
const menuGame = document.querySelector(".menu-game");
const overlayText = document.getElementById("overlay-text");
const hintButton = document.getElementById("hint");
const hintCount = document.getElementById("hint-count");
const overlay = document.getElementById("overlay");
const nextLevel = document.getElementById("next-level");

let board = [];
let pick = null;
let score = 0;
let currentLevel = 0;
let timeLeft = 180;
let timeId = null;
let isOver = false;
let isDrawing = false;
let hintLeft = maxHint;
let hintTiles = [];
let hintTimer = null;

menuGame.style.display = "none";

//chon lv
function SetLv(level) {
    currentLevel = level;
    if (currentLevel === 0) {
        rows = 7;
        cols = 7;
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
    overlay.style.display = "none";
    hintLeft = maxHint;
    hintTiles = [];

    updateHint();
    createBoard();
    drawBoard();
    startTimer();
    console.log("Đang chơi Level: " + currentLevel);
}

function NextLevel() {
    if (currentLevel < 6) {
        SetLv(currentLevel + 1);
    }
}

//level2 - don theo hang va cot
function level2() {
    //cot
    for (let col = 0; col < cols; col += 2) { //dò cột lẻ, mảng là 024
        const tiles = [];
        for (let row = 0; row < rows; row++) {
            if (board[row][col] !== "") {
                tiles.push(board[row][col]);
            }
        }
        for (let row = 0; row < rows; row++) board[row][col] = tiles[row] ?? "";
    }
    for (let col = 1; col < cols; col += 2) {   //dò cột chẵn
        const tiles = [];
        for (let row = 0; row < rows; row++) {
            if (board[row][col] !== "") {
                tiles.push(board[row][col]);
            }
        }
        for (let row = 0; row < rows; row++) board[row][col] = "";
        for (let i = 0; i < tiles.length; i++) board[rows - tiles.length + i][col] = tiles[i];
    }

    //hang
    for (let row = 1; row < rows; row += 2) { //dò hàng chẵn
        const tiles = [];
        for (let col = 0; col < cols; col++) {
            if (board[row][col] !== "") {
                tiles.push(board[row][col]);
            }
        }
        for (let col = 0; col < cols; col++) board[row][col] = tiles[col] ?? "";
    }
    for (let row = 0; row < rows; row += 2) {
        const tiles = [];
        for (let col = 0; col < cols; col++) {
            if (board[row][col] !== "") {
                tiles.push(board[row][col]);
            }
        }
        for (let col = 0; col < cols; col++) board[row][col] = "";
        for (let i = 0; i < tiles.length; i++) board[row][cols - tiles.length + i] = tiles[i];
    }
}

//level3 - don vao giua
function level3() {
    //theo chieu ngang
    for (let row = 0; row < rows; row++) {
        const tiles = [];
        for (let col = 0; col < cols; col++) {
            if (board[row][col] !== "") {
                tiles.push(board[row][col]);
            }
        }
        for (let col = 0; col < cols; col++) {
            board[row][col] = "";
        }
        const startCol = Math.floor((cols - tiles.length) / 2);
        for (let i = 0; i < tiles.length; i++) board[row][startCol + i] = tiles[i];
    }

    //theo chieu doc
    for (let col = 0; col < cols; col++) {
        const tiles = [];
        for (let row = 0; row < rows; row++) {
            if (board[row][col] !== "") {
                tiles.push(board[row][col]);
            }
        }
        for (let row = 0; row < rows; row++) {
            board[row][col] = "";
        }
        const startRow = Math.floor((rows - tiles.length) / 2);
        for (let i = 0; i < tiles.length; i++) board[startRow + i][col] = tiles[i];
    }
}
//level4 -
function level4() {

}

//level5
function level5() {

}

//level6
function level6() {

}

//tinh gio
function startTimer() {
    stopTimer();
    timeLeft = 180;
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
            const isHint = hintTiles.some(function (tile) {
                return tile.row === row && tile.col === col;
            })
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
                class: isPick ? "tile picked" : (isHint ? "tile hint" : "tile")
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
        board[firstPick.row][firstPick.col] = "";   //xoa da ghep
        board[row][col] = "";
        score = score + 10;
        scoreText.textContent = score;
        pick = null;
        applyLevelEffect();
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
function canGo(row, col, endRow, endCol) {
    if (row < -1 || row > rows || col < -1 || col > cols) return false;
    if (row === endRow && col === endCol) return true;
    if (row < 0 || row >= rows || col < 0 || col >= cols) return true;
    return board[row][col] === "";
}

function findPath(r1, c1, r2, c2) {
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    const queue = [{
        row: r1, col: c1,
        direction: -1,
        turns: 0,
        path: [{row: r1, col: c1}]
    }];

    const visited = new Set();
    while (queue.length > 0) {
        const current = queue.shift();
        if (current.row === r2 && current.col === c2) return current.path;

        for (let i = 0; i < 4; i++) {
            let turns = current.turns;
            if (current.direction !== -1 && current.direction !== i) turns++;
            if (turns > 2) continue;

            const nextRow = current.row + directions[i][0];
            const nextCol = current.col + directions[i][1];
            if (!canGo(nextRow, nextCol, r2, c2)) continue;

            const key = nextRow + "-" + nextCol + "-" + i + "-" + turns;
            if (visited.has(key)) continue;
            visited.add(key);
            queue.push({
                row: nextRow, col: nextCol,
                direction: i, turns: turns,
                path: current.path.concat({row: nextRow, col: nextCol})
            });
        }
    }
    return [];
}

function applyLevelEffect() {
    switch (currentLevel) {
        case 1:
            break;
        case 2:
            level2();
            break;
        case 3:
            level3();
            break;
        case 4:
            level4();
            break;
        case 5:
            level5();
            break;
        case 6:
            level5();
            break;
    }
}

function updateHint() {
    hintCount.textContent = hintLeft;
    hintButton.disabled = hintLeft <= 0;
}

function hint() {
    if (isOver || isDrawing || hintLeft <= 0) return;
    for (let row1 = 0; row1 < rows; row1++) {
        for (let col1 = 0; col1 < cols; col1++) {
            const firtTile = board[row1][col1];

            if (firtTile === "") continue;
            for (let row2 = row1; row2 < rows; row2++) {
                const startCol = row1 === row2 ? col1 + 1 : 0;      //cùng hàng thì bắt đầu ở ô tiếp theo

                for (let col2 = startCol; col2 < cols; col2++) {
                    const secondTile = board[row2][col2];
                    if (firtTile !== secondTile) continue;
                    const path = findPath(row1, col1, row2, col2); // dùng BFS
                    if (path.length > 0) {
                        hintLeft--;
                        updateHint();
                        isDrawing = true;
                        hintTiles = [{ row: row1, col: col1},
                                     { row: row2, col: col2},];
                        drawBoard();
                        setTimeout(function () {
                            drawLine(path);

                            setTimeout(function () {
                                board[row1][col1] = "";
                                board[row2][col2] = "";
                                score += 10;
                                scoreText.textContent = score;
                                hintTiles = [];
                                pick = null;
                                applyLevelEffect();
                                isDrawing = false;
                                drawBoard();
                                checkWin();
                            },100);
                        },100); return;
                    }
                }
            }
        }
    }
    alert("không phát hiện ra cặp để nối.");
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
    overlay.style.display = "flex";
}
