let rows;
let cols;
const cellSize = 70;
const SVG_NS = "http://www.w3.org/2000/svg";
const img_count = 36;
const img_path = "./images/pieces";
const img_ext = ".png";
const maxHint = 999;
const level_rule =    { 4:{stoneMin: 8, stoneMax: 10}, 5:{cardBack: 14},};
const img_card = "./images/cardBack.png";
const img_stone = "./images/rock.png";
const stone = "#";
const maxHammer = 999;

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
const hammerButton = document.getElementById("hammer");
const hammerCount = document.getElementById("hammer-count");

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
let spiral = [];
let pickTiles = [];
let ice = [];
let hammerLeft = maxHammer;
let hammerMode = false;
let iceCount = 0;

menuGame.style.display = "none";

//chon lv
function SetLv(level) {
    currentLevel = level;
    if (currentLevel < 7) {
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
    pickTiles = [];
    hammerLeft = maxHammer;
    hammerMode = false;
    iceCount = 0;

    updateHint();
    updateHammer();
    spiral = spiralOder(rows, cols);
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
        for (let row = 0; row < rows; row++) board[row][col] = tiles[row] !== undefined ? tiles[row] : "";
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
        for (let col = 0; col < cols; col++) board[row][col] = tiles[col] !== undefined ? tiles[col] : "";
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
//level4 - don xoan oc va da chan duong
function spiralOder(rows, cols) {   //xoắn từ ngoài vào trong
    const oder = [];
    let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
    while (top <= bottom && left <= right) {
        for (let col = left; col <= right; col++) oder.push([top, col]);
        for (let row = top + 1; row <= bottom; row++) oder.push([row, right]);
        for (let col = right - 1; col >= left; col--) oder.push([bottom, col]);
        for (let row = bottom - 1; row > top; row--) oder.push([row, left]);
        top++, bottom--, left++, right--;
    }
    return oder;
}
function move(from, to) {
    const tiles = [];
    for (let i = from; i <= to; i++) {      //gom the
        const row = spiral[i][0];
        const col = spiral[i][1];
        if (board[row][col] !== "") tiles.push(board[row][col]);
    }
    for (let i = from; i <= to; i++) {  //xep lai
        const row = spiral[i][0];
        const col = spiral[i][1];
        board[row][col] = tiles[i - from] !== undefined ? tiles[i - from] : "";
    }
}
function level4() {
    let start = 0;
    for (let i = 0; i <= spiral.length; i++) {
        const isEnd = i === spiral.length;
        const isStone = !isEnd && board[spiral[i][0]][spiral[i][1]] === stone;
        if (isEnd || isStone) {
            move(start, i - 1);
            start = i + 1;
        }
    }
}

//level5-dồn ra cạnh và có thẻ úp
function level5() {
     const halfRow = Math.floor(rows / 2);
     const halfCol = Math.floor(cols / 2);

     //ngang
    for (let row = 0; row < rows; row++) {  //trái
        const tiles = [];
        for (let col = 0; col < halfCol; col++) {
            if (board[row][col] !== "") tiles.push(board[row][col]);
        }
        for (let col = 0; col < halfCol; col++) board[row][col] = tiles[col] !== undefined ? tiles[col] : "";
    }
    for (let row = 0; row < rows; row++) {  //phải
        const tiles = [];
        for (let col = cols - halfCol; col < cols; col++) {
            if (board[row][col] !== "") tiles.push(board[row][col]);
        }
        for (let col = cols - halfCol; col < cols; col++) board[row][col] = "";
        for (let i = 0; i < tiles.length; i++) board[row][cols - tiles.length + i] = tiles[i];
    }

    //dọc
    for (let col = 0; col < cols; col++) {  //trên
        const tiles = [];
        for (let row = 0; row < halfRow; row++) {
            if (board[row][col] !== "") tiles.push(board[row][col]);
        }
        for (let row = 0; row < halfRow; row++) board[row][col] = tiles[row] !== undefined ? tiles[row] : "";
    }
    for (let col = 0; col < cols; col++) {  //dưới
        const tiles = [];
        for (let row = rows - halfRow; row < rows; row++) {
            if (board[row][col] !== "") tiles.push(board[row][col]);
        }
        for (let row = rows - halfRow; row < rows; row++) board[row][col] = "";
        for (let i = 0; i < tiles.length; i++) board[rows - tiles.length + i][col] = tiles[i];
    }
}

//level6-co che dong va pha bang
function updateHammer() {   //bua
    hammerCount.textContent = hammerLeft;
    hammerButton.disabled = hammerLeft <= 0;
    hammerButton.style.display = currentLevel === 6 ? "" : "none";
    hammerButton.classList.toggle("active", hammerMode);
}
function useHammer() {  //chon bua
    if (isDrawing || isOver || hammerLeft <= 0) return;
    hammerMode = !hammerMode;
    pick = null;
    updateHammer();
    drawBoard();
}
function useHammerAt(row, col) {    //pha bang 2x2
    let broke = false;
    for (let r = row; r <= row + 1; r++) {
        for (let c = col; c <= col + 1; c++) {
            if (r < rows && c < cols && ice[r][c]) {
                ice[r][c] = false;
                broke = true;
            }
        }
    }
    if (broke) {
        hammerLeft--;
        hammerMode = false;
        iceCount = 0;
        updateHammer();
        drawBoard();
    }
}
function level6(r1, c1, r2, c2) {   //pha bang va lan bang
    const cell = [[r1, c1], [r2, c2]];
    const dir = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    let broke = false;

    for (let i = 0; i < cell.length; i++) {
        for (let j = 0; j < 4; j++) {
            const row = cell[i][0] + dir[j][0];
            const col = cell[i][1] + dir[j][1];
            if (row >= 0 && row < rows && col >= 0 && col < cols && ice[row][col]) {
                ice[row][col] = false;
                broke = true;
            }
        }
    }

    if (broke) {
        iceCount = 0;
        return;
    }
    iceCount++;
    if (iceCount > 1) {
        spreadIce(); spreadIce(); spreadIce(); spreadIce();
        iceCount = 0;
    }
}
function spreadIce() {  //bang lan
    const dir = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    const random = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (ice[row][col]) continue;
            if (board[row][col] === "" || board[row][col] === stone) continue;
            for (let j = 0; j < 4; j++) {
                const r = row + dir[j][0];
                const c = col + dir[j][1];
                if (r >= 0 && r < rows && c >= 0 && c < cols && ice[r][c]) {
                    random.push([row, col]); break;
                }
            }
        }
    }
    if (random.length === 0) return;
    const target = random[Math.floor(Math.random() * random.length)];
    ice[target[0]][target[1]] = true;
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
function createTiles(total) {
    const tiles = [];
    const temp = currentLevel === 0 ? 2 : 4;
    const id = [];

    for (let i = 1; i <= img_count; i++) id.push(i);
    shuffleArray(id);

    let remain = total, k = 0;
    while (remain > 0) {
        const n = Math.min(temp, remain);
        for (let j = 0; j < n; j++) tiles.push(id[k % id.length]);
        remain -= n;
        k++;
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
    const stoneSet = new Set();
    if (currentLevel === 4) {   //đá ngẫu nhiên
        const count = Math.random() < 0.5 ? 8 : 10;
        while (stoneSet.size < count) {
            stoneSet.add(Math.floor(Math.random() * rows * cols));
        }
    }

    const temp = createTiles(rows * cols - stoneSet.size);
    shuffleArray(temp);
    board = [];
    let index = 0;

    for (let row = 0; row < rows; row++) {
        board[row] = [];
        for (let col = 0; col < cols; col++) {
            if (stoneSet.has(row * cols + col)) {
                board[row][col] = stone;
            } else {
                board[row][col] = temp[index];
                index++;
            }
        }
    }

    if (currentLevel === 5) { //thẻ úp ngẫu nhiên
        const cell = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) cell.push([row, col]);
        }
        shuffleArray(cell);
        for (let i = 0; i < level_rule[5].cardBack; i++) {
            const row = cell[i][0];
            const col = cell[i][1];
            board[row][col] = -board[row][col];
        }
    }

    ice = [];
    for (let row = 0; row < rows; row++) {  //tao bang
        ice[row] = [];
        for (let col = 0; col < cols; col++) ice[row][col] = false;
    }
    if (currentLevel === 6) {   //tao 2-3 vung bang
        const iceRan = Math.random() < 0.5 ? 2 : 3;
        const plus = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
        for (let i = 0; i < iceRan; i++) {
            const row = 1 + Math.floor(Math.random() * (rows - 2));//-2 de ko nam ngoai cung
            const col = 1 + Math.floor(Math.random() * (cols - 2));
            for (let j = 0; j < plus.length; j++) ice[row + plus[j][0]] [col + plus[j][1]] = true;
        }
    }
}

//ve bang game
function drawBoard() {
    svg.innerHTML = "";
    svg.setAttribute("viewBox", "0 0 " + cols * cellSize + " " + rows * cellSize);
    svg.setAttribute("width", cols * cellSize);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const id = board[row][col];

            if (id === "") continue;

            const x = col * cellSize;
            const y = row * cellSize;

            if (id === stone) { //ve da
                const g = createSVG("g", {class: "stone"});
                g.appendChild(createSVG("rect", { x: x + 3, y: y + 3,
                    width: cellSize - 6, height: cellSize - 6, rx: 10}));
                g.appendChild(createSVG("image", {
                    href: img_stone, x: x + 10, y: y + 10,
                    width: cellSize - 20, height: cellSize - 20}))
                svg.appendChild(g);
                continue;
            }
            const flip = Math.abs(id);

            const isPick = pick !== null && pick.row === row && pick.col === col;
            const isHint = hintTiles.some(function (tile) {
                return tile.row === row && tile.col === col;
            })
            const isPickTile = pickTiles.some(function (tile) {
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
                href: img_path + Math.abs(id) + img_ext,
                x: x +10,
                y: y +10,
                width: cellSize -20,
                height: cellSize - 20
            })

            const gr = createSVG("g", {
                class: (isPick || isPickTile) ? "tile picked" : (isHint ? "tile hint" : "tile")
            });
            gr.appendChild(rect);
            gr.appendChild(img);
            gr.addEventListener("click", function () {
                selectTitle(row, col);
            });
            svg.appendChild(gr);

            //vẽ thẻ úp
            if (id < 0 && !isPickTile && !isPick) {
                const cb = createSVG("g", { class: "tile cardBack"});
                cb.appendChild(createSVG("rect", {
                    x: x + 3, y: y + 3,
                    width: cellSize - 6, height: cellSize - 6, rx: 10
                }));
                cb.appendChild(createSVG("image", {
                    href: img_card,
                    x: x + 10, y: y + 10,
                    width: cellSize - 20, height: cellSize - 20,
                }))
                cb.addEventListener("click", function () {selectTitle(row, col)});
                svg.appendChild(cb);
                continue;
            }
        }
    }
    //ve bang
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (ice[row][col] && board[row][col] !== "") {
                svg.appendChild(createSVG("rect", {
                    x: col * cellSize + 3, y: row * cellSize + 3,
                    width: cellSize - 6, height: cellSize - 6, rx: 10, class: "ice"
                }))
            }
        }
    }
}

//tron lai
function shuffleBoard() {
    if (isOver) return;
    const tiles = [];

    for (let row = 0; row < rows; row++) {  //ham gom hinh
        for (let col = 0; col < cols; col++) {
            if (board[row][col] !== "" && board[row][col] !== stone) {
                tiles.push(board[row][col]);
            }
        }
    }

    shuffleArray(tiles);
    let index = 0;
    for (let row = 0; row < rows; row++) {  //xep vao mang
        for (let col = 0; col < cols; col++) {
            if (board[row][col] !== "" && board[row][col] !== stone) {
                board[row][col] = tiles[index];
                index++;
            }
        }
    }
    pick = null;
    drawBoard();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

//chon va ghep
function selectTitle(row, col) {
    if (isOver || isDrawing) return;
    const clickedTile = board[row][col];
    if (clickedTile === "") return;
    if (hammerMode) {
        useHammerAt(row, col);
        return;
    }
    if (ice[row][col]) return;
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
    const cardFlip = firtTile < 0 || secondTile < 0;
    const same = Math.abs(firtTile) === Math.abs(secondTile);
    const path = same ? findPath(pick.row, pick.col, row, col) : [];

    //ko ghép được
    if (path.length === 0) {
        if (cardFlip) {
            isDrawing = true;
            pickTiles = [{row: pick.row, col: pick.col}, {row: row, col: col}];
            pick = null;
            drawBoard();
            setTimeout(function () {
                pickTiles = [];
                isDrawing = false;
                drawBoard();
            }, 500);
        } else {
            pick = {row: row, col: col};
            drawBoard();
        }
        return;
    }

    //ghép được
    isDrawing = true;
    drawLine(path);
    const firstPick = pick;
    setTimeout(function () {
        board[firstPick.row][firstPick.col] = "";   //xoa da ghep
        board[row][col] = "";
        score = score + 10;
        scoreText.textContent = score;
        pick = null;
        applyLevelEffect(firstPick.row, firstPick.col, row, col);
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
    const queue = [{ row: r1, col: c1,
                                            direction: -1, turns: 0,
                                            path: [{row: r1, col: c1}]}];

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

function applyLevelEffect(r1, c1, r2, c2) {
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
            level6(r1, c1, r2, c2);
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

            if (firtTile === "" || firtTile === stone || firtTile < 0 || ice[row1][col1]) continue;
            for (let row2 = row1; row2 < rows; row2++) {
                const startCol = row1 === row2 ? col1 + 1 : 0;      //cùng hàng thì bắt đầu ở ô tiếp theo

                for (let col2 = startCol; col2 < cols; col2++) {
                    const secondTile = board[row2][col2];
                    if (firtTile !== secondTile) continue;
                    if (ice[row2][col2]) continue;
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
                                applyLevelEffect(row1, col1, row2, col2);
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
            if (board[row][col] !== "" && board[row][col] !== stone) {
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
