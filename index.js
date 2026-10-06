let rows = 4;
let cols = 4;
const cellSize = 70;
const SVG_NS = "http://www.w3.org/2000/svg";
const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const svg = document.getElementById("game");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const menuLV = document.querySelector(".menu-lv");
const menuGame = document.querySelector(".menu-game");

let board = [];
let pick = null;
let score = 0;
let currentLevel = 0;
let timeLeft = 60;
let timeId = null;

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
    menuGame.style.display = "block";
    score = 0;
    scoreText.textContent = score;
    pick = null;
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
    menuLV.style.display = "block";
}

//tao chu cai
function createLetters() {
    const letters = [];
    const total = rows * cols;
    const temp = currentLevel === 0 ? 2 : 4;
    const kinds = total / temp;

    for (let i = 0; i < kinds; i++) {
        for (let k  = 0; k < temp; k++) {
            letters.push(ABC[i]);
        }
    }
    return letters;
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
    const temp = createLetters();
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

//ve bang game
function drawBoard() {
    svg.innerHTML = "";
    const cellSize = 70;
    svg.setAttribute("width", cols * cellSize);
    svg.setAttribute("height", rows * cellSize);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const letter = board[row][col];

            if (letter === "") {
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
                rx: 8,
                fill: isPick ? "yellow" : "white",
                stroke: "#888"
            });
            const text = createSVG("text", {
                x: x + cellSize / 2,
                y: y + 45,
                "text-anchor": "middle",
                "font-size": 28,
                fill: "#333"
            });
            text.textContent = letter;
            const gr = createSVG("g");
            gr.appendChild(rect);
            gr.appendChild(text);
            gr.addEventListener("click", function () {
                selectTitle(row, col);
            });
            svg.appendChild(gr);
        }
    }
}

//chon va ghep
function selectTitle(row, col) {
    const clickLetter = board[row][col];
    if (clickLetter === "") return;
    //chua chon -> luu o
    if (pick === null) {
        pick = {
            row: row,
            col: col
        };
        drawBoard();
        return;
    }
    //chon r thi xoa
    if (pick.row === row && pick.col === col) {
        pick = null;
        drawBoard();
        return;
    }
    const firtLetter = board[pick.row][pick.col];
    const secondLetter = board[row][col];

    //2 o giong
    if (firtLetter === secondLetter) {
        board[pick.row][pick.col] = "";
        board[row][col] = "";
        score = score + 10;
        scoreText.textContent = score;
        pick = null;
        drawBoard();
        checkWin();
    } else {
        pick = {
            row: row,
            col: col
        };
        drawBoard();
    }
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
        setTimeout(function () {
            alert("diem: " + score);
        });
    }
}
