// canvas setup
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
const ranks = ["a", "b", "c", "d", "e", "f", "g", "h"];
const squareInput = document.querySelector("#square");
const button = document.querySelector("button");

class Board {
  constructor(s, colors) {
    this.x = canvas.width/2 - s*4;
    this.y = canvas.height/2 - s*4;
    this.s = s;
    this.colors = colors;
    this.ranks = ["a", "b", "c", "d", "e", "f", "g", "h"];
  }

  switchColor(color) {
      return color == this.colors[0] ? this.colors[1] : this.colors[0];
  }

  draw() {
  let x = this.x;
  let y = this.y
  let initX = x;
  let color = "white";

  for(let i = 0; i < 64; i++) {
    if(i % 8 == 0) {
      if(i != 0) y += this.s;
      x = initX
    } else {
        x += this.s;
        color = this.switchColor(color);
    }
    c.rect(x, y, this.s, this.s);
    c.stroke()
    c.fillStyle = color;
    c.fillRect(x, y, this.s, this.s);
  }
 }
}

class Knight {
  constructor(pos, rad, color) {
    this.pos = pos;
    this.initPos = pos;
    this.rad = rad;
    this.color = color;
    this.visitedSquares = { };
    this.moves = 1;
    this.coord;
  }

  init() {
    this.coord = this.getPosition();
    this.visitedSquares[this.pos] = true;
    this.reset();
    this.playBestMoves();
  }

  playBestMoves() {
    let moves = 63;
    const interval = setInterval(() => {
      if(moves <= 0) {
        clearInterval(interval);
      } else {
        this.moveTo(this.getBestMove());
        moves--;
      }
    }, 200);
  }

  reset() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    board.draw();
    this.pos = this.initPos;
    this.coord = this.getPosition();
    this.draw();
  }

  getBestMove() {
    const movesAvailable = this.getMoves(this.pos);
    const bestMove = ["", 64];
    movesAvailable.forEach(move => {
      const degree = this.getMoves(move).length
      if(degree < bestMove[1]) {
        bestMove[0] = move;
        bestMove[1] = degree;
      }
    });
    return bestMove[0];
  }

  getPosition() {
    const squareHalf = board.s / 2;
    const x = board.x + board.s * board.ranks.indexOf(this.pos[0]) + squareHalf;
    const y = board.y + board.s * (8 - Number(this.pos[1])) + squareHalf;
    return { x, y };
  }

  moveTo(pos) {
    this.pos = pos;
    this.visitedSquares[pos] = true;
    c.beginPath();
    c.strokeStyle = this.color;
    c.moveTo(this.coord.x, this.coord.y)
    this.coord = this.getPosition();
    c.lineTo(this.coord.x, this.coord.y);
    c.stroke();
    this.draw();
  }

  isVisitedSquare(square) {
    return !!this.visitedSquares[square];
  }

  isValidSquare(square) {
    const x = board.ranks.indexOf(square[0]) + 1;
    const y = Number(square[1]);
    return square.length == 2 && (x >= 1 && x <= 8) && (y >= 1 && y <= 8);
  }

  getMoves(pos) {
    const canMove = (x, y) => {
      const square = board.ranks[board.ranks.indexOf(pos[0]) + x] + "" + (Number(pos[1]) + y);
      if(this.isValidSquare(square) && !this.isVisitedSquare(square)) return square;
      return false;
    }

    const moves = [];
    
    for(let i = -2; i < 3; i++) {
      for(let j = -2; j < 3; j++) {
        const square = canMove(i, j);
        if((i != 0 && j != 0) && (Math.abs(i) != Math.abs(j)) && square) {
          moves.push(square);
        }
      }
    }
    return moves;
  }

  makeTempMove(pos) {
    this.moves++;
    this.pos = pos;
    this.visitedSquares[pos] = true;
  }

  undoTempMove(pos) {
    this.moves--;
    this.pos = pos;
    delete this.visitedSquares[pos];
  }
  
  draw() {
    c.beginPath();
    c.fillStyle = this.color;
    c.arc(this.coord.x, this.coord.y, this.rad, 0, 2 * Math.PI);
    c.fill();
  }
}

function init() {
  const square = squareInput.value 
  knight = new Knight(square, 5, "blue");
  knight.init();
}

// initializing board and knight
let knight;
const board = new Board(50, ["white", "black"]);
board.draw();
button.addEventListener("click", init);
squareInput.addEventListener("keydown", e => {
  if(e.key === "Enter") {
    init();
  }
});

// maintaining board and knight centralized when the screen is resized
addEventListener("resize", () => {
  c.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  board.x = canvas.width/2 - board.s*4;
  board.y = canvas.height/2 - board.s*4;
  board.draw();
});