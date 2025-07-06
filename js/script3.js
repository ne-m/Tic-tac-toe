import celebrateWin from "./confetti.js"

const cells = document.querySelectorAll('.box');
const statusText = document.getElementById('status');
const gameModeSelect = document.getElementById('gameMode');

const p1Card = document.getElementById('p1Card');
const p2Card = document.getElementById('p2Card');
const drawsCard = document.getElementById('drawsCard');

const p1Wins = document.getElementById('p1Wins');
const p2Wins = document.getElementById('p2Wins');
const draws = document.getElementById('draws');

const restartBtn = document.getElementById('restart');
const newRoundBtn = document.getElementById('newRound');
const forfeitBtn = document.getElementById("forfeit");

const errorSound = document.getElementById('errorSound');
const winSound = document.getElementById('winSound');

let board = Array(9).fill("");
let currentPlayer = "X";
let gameMode = gameModeSelect.value;
let gameActive = true;
let winner = "";

let score = JSON.parse(localStorage.getItem("scores")) || {
  X: 0,
  O: 0,
  Draw: 0
};

loadScores()

restartBtn.addEventListener('click', resetGame)
newRoundBtn.addEventListener('click', newRound)
forfeitBtn.addEventListener("click", forfeitGame);

gameModeSelect.addEventListener("change", (e) => {
  gameMode = e.target.value;
//   resetGame();
});

// newRoundBtn.style.cursor = newRoundBtn.disabled === true ? "not-allowed" : "pointer"
// newRoundBtn.style.cursor = "not-allowed"

cells.forEach((cell, index)=>{
    cell.addEventListener('click',()=>{
        handleMove(index)
    })
})

showCurrentTurn()

function handleMove(index){
    if (!gameActive || board[index] !== "") {
        errorSound.play();
        return
    }

    board[index] = currentPlayer;
    updateBoard();

    winner = checkWin()

    if(winner !== ""){
        endGame(winner);
        return;
    } 

    if (checkFreeSpaces() === 0) {
        endGame("draw");
        return;
    }

    // switching player
    currentPlayer = currentPlayer == "X" ? "O" : "X";
    showCurrentTurn()

    //If playing vs computer and its the computer's turn
    if (gameMode === "pvc" && currentPlayer === "O") {
        setTimeout(computerMove, 500); // Delay to mimic thinking
    }
} 

function updateBoard() {
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
    cell.classList.remove("text-blue-600", "text-red-600");

    if (board[index] === "X") {
      cell.classList.add("text-red-600", "text-4xl", "font-bold");
    } else if (board[index] === "O") {
      cell.classList.add("text-blue-600", "text-4xl", "font-bold");
    }
  });
}

function checkWin(){
    for (let i = 0; i < 7; i+=3) { //checks rows
        if (board[i] !== "" && board[i] == board[i+1] && board[i] == board[i+2]) {
            return board[i]
        }
    }

    for (let i = 0; i < 3; i++) { //checks columns
        if (board[i] !== "" && board[i] == board[i+3] && board[i] == board[i+6]) {
            return board[i]
        }
    }

    let x = 0; //checks diagonals
    if (board[x] !== "" && board[x] == board[x+4] && board[x] == board[x+8]) {
        return board[x]
    }

    let y=2; //checks diagonals
    if (board[y] !== "" && board[y] == board[y+2] && board[y] == board[y+4]) {
        return board[y]
    }

    return "";

}

function checkFreeSpaces(){
    let freeSpaces = 9;

    for (let i = 0; i < board.length; i++) {
        if (board[i] != "") {
            freeSpaces --
        }
    }
    return freeSpaces;
}

function showCurrentTurn() {
    if(!gameActive) return;

    if (gameMode === "pvc" && currentPlayer === "O") {
        statusText.textContent = "🔵 Computer's turn";
    } else {
        statusText.textContent = `${currentPlayer === "X" ? "🔴 Player 1" : "🔵 Player 2"}'s turn`;
    }

    // if (currentPlayer === 'X') {
    //     statusText.innerText = "🔴 Player 1's Turn";
    //     statusText.className = "text-red-600 font-bold animate-pulse-once";
    // } else if(currentPlayer === "O" && gameMode === "pvp"){
    //     statusText.innerText = "🔵 Player 2's Turn";
    //     statusText.className = "text-blue-600 font-bold animate-pulse-once";
    // } else if (gameMode === "pvc" && currentPlayer === "O") {
    //     statusText.innerText = "🔵 Computer's Turn";
    //     statusText.className = "text-blue-600 font-bold animate-pulse-once";
    // }
}

function computerMove() {
  // If game is inactive, do nothing
  if (!gameActive) return;

  // Find all empty cells
  const emptyIndexes = board
    .map((val, idx) => (val === "" ? idx : null)) // returns two things: 1)the idx of the box which is empty and 2) null where the box contains something
    .filter((val) => val !== null); // removes all indexes with null

  // Simple AI: choose a random empty cell
  const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];

  // Simulate a move
  handleMove(randomIndex);
}

function endGame(winner, wasForfeit = false){
    gameActive = false
    // const status = document.getElementById('status');

    // Reset styles
    // [p1Card, p2Card, drawsCard].forEach(card => {
    // card.classList.remove('ring-4', 'ring-green-400', 'animate-pulse-once');
    // });

    resetStyles()

    // Highlight winner
    if (winner === 'X') {
        p1Card.classList.add('ring-4', 'ring-green-400', 'animate-pulse-once');
        statusText.innerText = wasForfeit? "🔴 Player 1 Wins by Forfeit!": '🎉 Player 1 Wins!';
        statusText.classList.add('text-red-600', 'animate-pulse-once');
    } else if (winner === 'O') {
        p2Card.classList.add('ring-4', 'ring-green-400', 'animate-pulse-once');
        statusText.innerText = wasForfeit ? '🔵 Player 2 Wins by Forfeit!' : '🎉 Player 2 Wins!';
        statusText.classList.add('text-blue-600', 'animate-pulse-once');
    } else {
        drawsCard.classList.add('ring-4', 'ring-yellow-400', 'animate-pulse-once');
        statusText.innerText = wasForfeit ? 'Computer wins by Forfeit?' : '🤝 It\'s a draw!';
        statusText.classList.add('text-gray-600', 'animate-pulse-once');
    }

    if (winner != ""){
        winSound.play();
        celebrateWin()
    }

    // Remove the pulse effect after a moment
    setTimeout(() => {
        statusText.classList.remove('animate-pulse-once');
    }, 400);   
    
    if (winner === "X") {
        score.X++;
        p1Wins.textContent = score.X;
    } else if (winner === "O") {
        score.O++;
        p2Wins.textContent = score.O;
    } else {
        score.Draw++;
        draws.textContent = score.Draw;
    }

    saveToLocalStorage()
    newRoundBtn.disabled = false
}

function saveToLocalStorage() {
    localStorage.setItem("scores", JSON.stringify(score))
}

function loadScores() {
    p1Wins.textContent = score.X;
    p2Wins.textContent = score.O;
    draws.textContent = score.Draw;
}

function resetGame(){
    score.X = 0;
    score.O = 0;
    score.Draw = 0;
    saveToLocalStorage()

    // p1Wins.textContent = score.X;
    // p2Wins.textContent = score.O;
    // draws.textContent = score.Draw;
    loadScores()

    board.fill("")
    gameActive = true

    resetStyles()
    updateBoard()
    newRoundBtn.disabled = true
}

function newRound() {
    // console.log("new round");
    
    board.fill("")
    gameActive = true
    currentPlayer = "X"

    resetStyles()
    updateBoard()
    showCurrentTurn()
    newRoundBtn.disabled = true // the new round button gets disabled after a new round is stared and when the game is midway
}

function forfeitGame(){
  if (!gameActive) return;

  const confirmation = confirm("Are you sure you want to forfeit the match?");
  if (!confirmation) return;

  const opponent = currentPlayer === "X" ? "O" : "X";
  endGame(opponent, true); // true = was a forfeit
}


function resetStyles() {
  [p1Card, p2Card, drawsCard].forEach(card => {
    card.classList.remove('ring-4', 'ring-green-400', 'animate-pulse-once');
  });
}

