let mines;
let timeInSecs;
let timeInMins;
let ticker;
let cells;
let firstClick;
let rows, cols, mineCount;
let minesLeft;
const emojiBtn = document.querySelector('.emoji-button');
const emojReaction = emojiBtn.innerHTML = '🙂';

setFieldParams(16, 16, 40);
newGame(rows, cols, mineCount);
document.querySelector('.mine-count').innerHTML = `${mineCount}`//add mines to the rules

function newGame() {
  gameEnded = false;
  firstClick = true;
  drawGrid(rows, cols);
}

function generate(startX, startY, rows, cols, mineCount) {
  mines = [];
  for (let i = 0; i < rows; i++) {
    mines[i] = [];
    for (let j = 0; j < cols; j++) {
      mines[i][j] = 0;
    }
  }

  let mine_x, mine_y;
  let m, n;

  for (let k = 0; k < mineCount; k++) {
    while (true) {
      mine_x = Math.floor(Math.random() * rows);
      mine_y = Math.floor(Math.random() * cols);
      if (!(between(mine_x, startX - 1, startX + 1) && between(mine_y, startY - 1, startY + 1)) &&
        mines[mine_x][mine_y] != -1) {
        break;
      }
    }

    for (n = mine_x - 1; n <= mine_x + 1; n++) {
      for (m = mine_y - 1; m <= mine_y + 1; m++) {
        if (mine_x == n && mine_y == m) {
          mines[n][m] = -1;
        } else
          if (between(n, 0, rows - 1) && between(m, 0, cols - 1) && !hasMine(n, m))
            mines[n][m]++;
      }
    }
  }
}

function drawGrid(rows, cols) {
  cells = [];
  for (let i = 0; i < rows; i++) cells[i] = [];

  const container = document.querySelector('.field');
  container.innerText = "";

  for (let i = 0; i < cols; i++) {
    const col = document.createElement('div');
    col.classList.add('column');

    for (let j = 0; j < rows; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.classList.add('cell-closed');
      cell.setAttribute('coords', coordsToStr(j, i));
      cell.oncontextmenu = function (e) {
        return false;
      };
      cell.onmousedown = function (e) {
        if (e.button === 1) return false;
      }
      cell.onmouseup = onCellClick;
      cell.ondblclick = onCellDoubleClick;
      cells[j][i] = cell;
      col.appendChild(cell);
    }
    container.appendChild(col);
  }
}

function onFirstClick(x, y, secs, mins) {
  firstClick = false;
  generate(x, y, rows, cols, mineCount);
  startTimer(1, 40 * 60);// start timer and stopwatch
}

function onCellClick(e, isDouble) {
  if (gameEnded) return;

  let coords = parseCoords(e.target.getAttribute('coords'));

  if (firstClick) {
    if (e.button === 0)
      onFirstClick(coords.x, coords.y);
    else
      return;
  }

  if (e.button === 0) {
    if (isDouble)
      tryOpenNearest(coords.x, coords.y);
    else
      tryOpenCell(coords.x, coords.y);
  }
  else if (e.button == 1)
    tryOpenNearest(coords.x, coords.y);
  else if (e.button == 2)
    toggleFlag(coords.x, coords.y);
}

function onCellDoubleClick(e) {
  onCellClick(e, true);
}

// open cell and check for result
function tryOpenCell(x, y) {
  if (isOpened(x, y) || isFlagged(x, y)) return;

  openCell(x, y);

  if (hasMine(x, y)) {
    endGame(false, x, y);
  } else {
    if (mines[x][y] == 0) {
      tryOpenNearest(x, y);
    }
    checkVictory(x, y);
  }
}

// add classes and text to DOM
function openCell(x, y) {
  let target = cells[x][y];

  target.classList.remove('cell-closed');
  target.classList.add('cell-opened');

  if (hasMine(x, y)) {
    target.classList.add('cell-mine');
  } else {
    target.classList.add('cell-' + mines[x][y]);
    if (mines[x][y] > 0) {
      target.innerText = mines[x][y];
    }
  }
}

function tryOpenNearest(x, y) {
  let flags = 0;
  for (let i = x - 1; i < x + 2; i++) {
    for (let j = y - 1; j < y + 2; j++) {
      if (between(i, 0, rows - 1) && between(j, 0, cols - 1) && isFlagged(i, j))
        flags++;
    }
  }

  if (!isOpened(x, y) || flags != mines[x][y]) return;

  for (let i = x - 1; i < x + 2; i++) {
    for (let j = y - 1; j < y + 2; j++) {
      if (between(i, 0, rows - 1) && between(j, 0, cols - 1))
        tryOpenCell(i, j);
    }
  }
}

// toggle flag and question mark
function toggleFlag(x, y) {
  if (isOpened(x, y)) return;

  if (cells[x][y].classList.contains('cell-flagged')) {
    cells[x][y].classList.remove('cell-flagged');
    cells[x][y].classList.add('cell-question-mark');
  } else if (cells[x][y].classList.contains('cell-question-mark')) {
    cells[x][y].classList.remove('cell-question-mark');
  } else {
    cells[x][y].classList.add('cell-flagged');
  }
}

// -1: has mine
function hasMine(x, y) {
  hasMineCheck = true
  return mines[x][y] == -1;
}

function isOpened(x, y) {
  return cells[x][y].classList.contains('cell-opened');
}

function isFlagged(x, y) {
  return cells[x][y].classList.contains('cell-flagged');
}

function checkVictory(x, y) {
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      if (isOpened(i, j) && hasMine(i, j)) return false; // mine opened
      if (!isOpened(i, j) && !hasMine(i, j)) return false; // not mine closed
    }
  endGame(true, x, y);
  return true;
}

// end game outcomes
function endGame(result, x, y) {
  clearInterval(ticker);
  gameEnded = true;
  if (result === true) {
    emojiBtn.innerHTML = '😎'
    document.querySelector('.field').onmouseover = function () {
      emojiBtn.innerHTML = '😎'
    }
    revealBoard(x, y);
    // alert('You win!');
  } else {
    document.querySelector('.field').onmouseover = function () {
      emojiBtn.innerHTML = '😵'
    }
    cells[x][y].classList.add('cell-mine-red');
    revealBoard(x, y);
    // alert('You lost.');
  }
}

function revealBoard(x, y, direction) {
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      if (!cells[i][j].classList.contains('cell-flagged')) {
        openCell(i, j);
      } else if (cells[i][j].classList.contains('cell-flagged') && !hasMine(i, j)) {
        openCell(i, j);
        cells[i][j].classList.remove('cell-flagged');
        cells[i][j].classList.add('cell-not-mine');
        cells[i][j].innerHTML = "";
      }
}

// edit coords
function coordsToStr(x, y) {
  return x + ';' + y;
}

function parseCoords(str) {
  if (typeof (str) != 'string' || str.indexOf(';') == -1) return;
  return {
    x: parseInt(str.split(';')[0]),
    y: parseInt(str.split(';')[1])
  };
}

// new game emoji button
let newGameClick = document.getElementById('newGameButton').onclick = function () {
  clearInterval(ticker);
  document.querySelector(".game-stopwatch").innerHTML = "000";
  document.querySelector(".game-stopwatch").classList.remove('game-stopwatch-special');
  document.querySelector(".game-timer").innerHTML = "040";
  newGame();
  emojiBtn.innerHTML = '🙂';
  document.querySelector('.field').onmousedown = function () {
    emojiBtn.innerHTML = '😮'
  }
  document.querySelector('.field').onmouseover = function () {
    emojiBtn.innerHTML = '🙂';
  };
};

// face on mouseover
document.querySelector('.field').onmousedown = function () {
  emojiBtn.innerHTML = '😮'
};

// face on mouseout
document.querySelector('.field').onmouseout = function () {
  emojiBtn.innerHTML = '🙂';
};

//set rows, colums, and the amount of mines
function setFieldParams(r, c, m) {
  rows = r;
  cols = c;
  mineCount = m;
}

function between(x, a, b) {
  return x >= a && x <= b;
}

// timer and stopwatch
function startTimer(secs, mins) {
  timeInSecs = parseInt(secs);
  timeInMins = parseInt(mins);
  ticker = setInterval(tick, 1000);
}

function tick() {
  let secs = timeInSecs;
  let mins = timeInMins;
  timeInSecs++;
  timeInMins--;

  if (secs < mins * 40 && mins > 0) {
    timeInSecs++;
    timeInMins--;
  } else {
    stopTimer(true);
  }
  let minuts = Math.ceil(mins / 60);
  let seconds = secs;
  mins %= 60;

  let resultSecs = checkDigits(seconds);
  let resultMinutes = checkDigits(minuts)

  if (secs >= 0 && secs <= 1000) {
    document.querySelector(".game-stopwatch").innerHTML = resultSecs;
  } else {
    // over 1000 seconds
    document.querySelector(".game-stopwatch").classList.add('game-stopwatch-special')
    document.querySelector(".game-stopwatch-special").innerHTML = resultSecs;
  }
  document.querySelector(".game-timer").innerHTML = resultMinutes;
}

// edit timer and stopwatch digits
function checkDigits(digits) {
  if (digits < 10) { return "00" + digits };
  if (digits >= 10 && digits < 100) { return "0" + digits };
  if (digits >= 100 && digits < 1000) { return digits };
  if (digits >= 1000) { return digits };
}

// end game when time is out
function stopTimer(x, y) {
  clearInterval(ticker);
  endGame(true, x, y);
  emojiBtn.innerHTML = '😵'
  document.querySelector('.field').onmouseover = function () {
    emojiBtn.innerHTML = '😵'
  }
}