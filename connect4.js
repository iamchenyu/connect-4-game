/** Connect Four
  
 /* Player 1 and 2 alternate turns. On each turn, a piece is dropped down a column until a player gets four-in-a-row (horiz, vert, or diag) or until board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;
const htmlBoard = document.querySelector("#board");
const modal = document.getElementById("modal");
const resumeBtn = document.getElementById("resumebtn");
const newGameBtn = document.getElementById("newgamebtn");
let currPlayer = 1; // active player: 1 or 2
let board = JSON.parse(localStorage.getItem("board")) || [];

handleModalDisplay();

// define main functions
function handleModalDisplay() {
  if (isUnfinished()) {
    //show modal
    modal.style.display = "block";
    //add event listerners to two buttons
    resumeBtn.addEventListener("click", handleresume);
    newGameBtn.addEventListener("click", handleNewGame);
    // check new game
  } else {
    handleNewGame();
  }
}

function isUnfinished() {
  return board.some((row) => row.some((val) => val != null));
}

function handleresume() {
  modal.style.display = "none";
  makeHtmlBoard();
  insertPieces();
  checkCurrUser();
}

function handleNewGame() {
  resetBoard();
  modal.style.display = "none";
  makeBoard();
  makeHtmlBoard();
}

// check current player - we need to know who's turn when resuming the unfinished game
function checkCurrUser() {
  let playerArr = [];
  for (let i = 0; i < board.length; i++) {
    playerArr.push(...board[i]);
  }
  const player1 = playerArr.filter((val) => val === 1).length;
  const player2 = playerArr.filter((val) => val === 2).length;
  player1 > player2 ? (currPlayer = 2) : (currPlayer = 1);
}

function resetBoard() {
  board = [];
  localStorage.setItem("board", JSON.stringify(board));
}

// recreate the board for the unfinished game by inserting pieces
function insertPieces() {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x]) {
        const piece = document.createElement("div");
        piece.classList.add("piece");
        board[y][x] === 1
          ? piece.classList.add("p1")
          : piece.classList.add("p2");
        const cell = document.getElementById(`${y}-${x}`);
        cell.append(piece);
      }
    }
  }
}

// create in-JS board structure - fundamental for the game
function makeBoard() {
  // TODO: set "board" to an empty HEIGHT x WIDTH matrix array
  let row = [];
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      row.push(null);
    }
    board.push(row);
    row = [];
  }
  return board;
}

// make HTML table and row of column tops
function makeHtmlBoard() {
  makeTableHeader();
  makeTableBoard();
}

function makeTableHeader() {
  // TODO: create the top of the table and add event listener to each cell
  const top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  // add click and hover events to the top row - event delegation to each cell in the top row
  top.addEventListener("click", handleClick);
  top.addEventListener("mouseover", (e) =>
    currPlayer === 1
      ? e.target.classList.add("p1")
      : e.target.classList.add("p2")
  );
  top.addEventListener("mouseout", (e) => (e.target.classList = ""));

  // create cells for the top
  for (let x = 0; x < WIDTH; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }

  htmlBoard.append(top);
}

function makeTableBoard() {
  // TODO: create the play board
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);

      // add hover effects to cells
      const head = document.getElementById(x);
      cell.addEventListener("mouseover", () =>
        currPlayer === 1 ? head.classList.add("p1") : head.classList.add("p2")
      );
      cell.addEventListener("mouseout", () => (head.classList = ""));

      // add click event listener to cells
      cell.addEventListener("click", handleClick);
      row.append(cell);
    }

    htmlBoard.append(row);
  }
}

/** handleClick: handle click of column top to play piece */
function handleClick(evt) {
  // get x - row index
  const x = [...evt.target.parentElement.children].indexOf(evt.target);

  // get y - column index
  const y = findSpotForCol(x);
  if (y === null) {
    return;
  }

  // place piece in HTML board and update the board
  placeInTable(y, x);

  // check for win
  if (checkForWin()) {
    return endGame(`Player ${currPlayer} won!`);
  }

  // check for tie
  // TODO: check if all cells in board are filled; if so call, call endGame
  if (checkForTie()) {
    return endGame("Tied - Both of you are winners!");
  }

  // switch players
  // TODO: switch currPlayer 1 <-> 2
  switchPlayers();
}

function switchPlayers() {
  currPlayer === 1 ? (currPlayer = 2) : (currPlayer = 1);
}

function placeInTable(y, x) {
  // TODO: make a div and insert into correct table cell
  const piece = document.createElement("div");
  piece.classList.add("piece");
  currPlayer === 1 ? piece.classList.add("p1") : piece.classList.add("p2");
  const cell = document.getElementById(`${y}-${x}`);
  cell.append(piece);
  // TODO: add line to update in-memory board
  board[y][x] = currPlayer;
  // update local storage
  localStorage.setItem("board", JSON.stringify(board));
}

/** findSpotForCol: given column x, return top empty y (null if filled) */
function findSpotForCol(x) {
  // TODO: write the real version of this, rather than always returning 0
  // starting from the end, find the first null position
  for (let y = HEIGHT - 1; y >= 0; y--) {
    if (board[y][x] === null) {
      return y;
    }
  }
  return null;
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */
function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer

    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }

  // TODO: write comments
  // for every cell, check 4 elements in sequence for 4 directions: horizental, vertical, diagonal-right/down and difagonal-left/up
  // and save them to 4 arrays, each holding 4 values/positions
  // [y, x] ([row, column]) ---> [[],[],[],[]]
  // loop over y and x so that every cell will be checked

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const horiz = [
        [y, x],
        [y, x + 1],
        [y, x + 2],
        [y, x + 3],
      ];
      const vert = [
        [y, x],
        [y + 1, x],
        [y + 2, x],
        [y + 3, x],
      ];
      const diagDR = [
        [y, x],
        [y + 1, x + 1],
        [y + 2, x + 2],
        [y + 3, x + 3],
      ];
      const diagDL = [
        [y, x],
        [y + 1, x - 1],
        [y + 2, x - 2],
        [y + 3, x - 3],
      ];

      // check every cell before move-on
      // pass these 4 variables to function_win
      // as long as 1 returns true, it means we have a winner
      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}

// checkForTie
function checkForTie() {
  return board.every((row) => row.every((val) => val != null));
}

/** endGame: announce game end */
function endGame(msg) {
  // reset the game
  resetBoard();
  // TODO: pop up alert message
  setTimeout(function () {
    alert(msg);
    window.location.reload();
  }, 200);
}
