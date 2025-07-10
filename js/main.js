import celebrateWin from "./confetti.js"

const cells = document.querySelectorAll('.box');
const statusText = document.getElementById('status');
const gameModeSelect = document.getElementById('gameMode');
const usernameSection = document.getElementById("usernameSection");
const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");

const p1Card = document.getElementById('p1Card');
const p2Card = document.getElementById('p2Card');
const drawsCard = document.getElementById('drawsCard');

const p1Wins = document.getElementById('p1Wins');
const p2Wins = document.getElementById('p2Wins');
const draws = document.getElementById('draws');

const restartBtn = document.getElementById('restart');
const newRoundBtn = document.getElementById('newRound');
const forfeitBtn = document.getElementById("forfeit");
const replayRoundBtn = document.getElementById("replayRound")

const forfeitModal = document.getElementById("forfeitModal");
const confirmForfeit = document.getElementById("confirmForfeit");
const cancelForfeit = document.getElementById("cancelForfeit");

const errorSound = document.getElementById('errorSound');
const winSound = document.getElementById('winSound');
const backgroundMusic = document.getElementById("backgroundMusic");

const settingsBtn = document.getElementById("openSettingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const musicBtn = document.getElementById("musicToggle")

const countdownBarContainer = document.getElementById("countdownBarContainer");
const countdownBar = document.getElementById("countdownBar");

let board = Array(9).fill("");
let currentPlayer = "X";
let gameMode = gameModeSelect.value;
let gameActive = true;
let winner = "";
let moveHistory = []

let gameStarted = false;
let players = { X: "Player 1", O: "Player 2" };
let rapidMode = false;
let rapidTimeLimit = 5000; // 5 seconds
let rapidTimer;
let countdownInterval;
backgroundMusic.volume = 0.1

let score = JSON.parse(localStorage.getItem("scores")) || {
  X: 0,
  O: 0,
  Draw: 0
};

loadScores()

restartBtn.addEventListener('click', resetGame)
newRoundBtn.addEventListener('click', newRound)
replayRoundBtn.addEventListener("click", replayRound)
player1Input.addEventListener("input", updatePlayerDisplay);
player2Input.addEventListener("input", updatePlayerDisplay);
document.getElementById("resetBtn").addEventListener("click", resetUsernames);


const savedNames = JSON.parse(localStorage.getItem("usernames"));

if (savedNames) {
  player1Input.value = savedNames.X || "";
  player2Input.value = savedNames.O || "";
  updatePlayerDisplay();
}

window.addEventListener("DOMContentLoaded", () => {
  loadSavedGameMode();
  gameMode = gameModeSelect.value;
  loadUserData();
  updatePlayerDisplay();
  showCurrentTurn();
});

settingsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  settingsPanel.classList.toggle("hidden");
});

// Auto-close settings panel when clicking outside
document.addEventListener("click", (e) => {
  const isClickInside = settingsPanel.contains(e.target) || settingsBtn.contains(e.target);

  if (!isClickInside && !settingsPanel.classList.contains("hidden")) {
    settingsPanel.classList.add("hidden");
  }
});

// Saves game mode selection
gameModeSelect.addEventListener('change', () => {
  localStorage.setItem('gameMode', gameModeSelect.value);
});


gameModeSelect.addEventListener("change", (e) => {
  const selectedMode = e.target.value;

  if (selectedMode !== gameMode) {
    gameMode = selectedMode;

    if (gameMode === "pvc") {
      player2Input.style.display = "none";
      player2Input.value = "Computer";
    } else {
      player2Input.style.display = "block";
      player2Input.value = "";
    }

    resetGame(); // ✅ Now only resets when mode actually changes
  }

  updatePlayerDisplay();
});

// newRoundBtn.style.cursor = newRoundBtn.disabled === true ? "not-allowed" : "pointer"
// newRoundBtn.style.cursor = "not-allowed"

// Rapid toggle mode
document.getElementById("rapidToggle").addEventListener("change", (e) => {
  rapidMode = e.target.checked;
});

// Time input
document.getElementById("rapidSeconds").addEventListener("input", (e) => {
  const seconds = parseInt(e.target.value);
  rapidTimeLimit = isNaN(seconds) ? 5000 : seconds * 1000;
});

document.getElementById("rapidToggle").addEventListener("change", (e) => {
  rapidMode = e.target.checked;
  saveToLocalStorage(); 
});

document.getElementById("rapidSeconds").addEventListener("input", (e) => {
  const seconds = parseInt(e.target.value);
  rapidTimeLimit = isNaN(seconds) ? 5000 : seconds * 1000;
  saveToLocalStorage();
});


cells.forEach((cell, index)=>{
    cell.addEventListener('click',()=>{
        handleMove(index)
    })
})

showCurrentTurn()

function handleMove(index){
    // to start game logic on first move
    if (!gameStarted) {
        startGameFromFirstMove();
    }
    if (!gameActive || board[index] !== "") {
        errorSound.play();
        return
    }

    clearTimeout(rapidTimer);
    clearInterval(countdownInterval);
    countdownBarContainer.classList.add("hidden");

    board[index] = currentPlayer;
    updateBoard();
    moveHistory.push({player: currentPlayer, index: index})

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
    } else if (rapidMode) {
        startRapidCountdown();
    }
    // console.log(moveHistory)
   

} 

function loadSavedGameMode() {
  const savedMode = localStorage.getItem("gameMode");
  if (savedMode) {
    gameMode = savedMode;
    gameModeSelect.value = savedMode;

    // Update UI based on mode
    if (savedMode === "pvc") {
      player2Input.style.display = "none";
      player2Input.value = "Computer";
    } else {
      player2Input.style.display = "block";
    }
  }
}

function startGameFromFirstMove() {
    gameStarted = true;
    
    const p1 = player1Input.value.trim() || "Player 1";
    const p2 = gameMode === "pvc" ? "Computer" : (player2Input.value.trim() || "Player 2");

    players = {
        X: p1,
        O: p2
    };
    //saving username when game starts
    localStorage.setItem("usernames", JSON.stringify(players));
    updatePlayerDisplay();

    // Set avatar for Player O (player 2 or computer)
    const avatarO = document.getElementById("avatarO");
    avatarO.src = (gameMode === "pvc")
        ? "https://api.dicebear.com/9.x/bottts/svg?seed=Aneka"
        : "https://api.dicebear.com/9.x/thumbs/svg?flip=false";

    const avatarX = document.getElementById("avatarX");

    // Save avatars
    localStorage.setItem("avatars", JSON.stringify({
        X: avatarX.src,
        O: avatarO.src
    }));

    usernameSection.style.display = "none";
    showCurrentTurn();

    // Starting countdown for player X
    if (rapidMode && currentPlayer == "X") {
        startRapidCountdown();
    }
}

function startRapidCountdown() {
  clearTimeout(rapidTimer);
  clearInterval(countdownInterval);

  if (gameMode === "pvc" && currentPlayer === "O") return;

  const totalDuration = rapidTimeLimit; // in ms
  const startTime = Date.now();

  // Show the countdown bar
  countdownBarContainer.classList.remove("hidden");
  countdownBar.style.width = "100%";

  // Animate the bar shrinking
  countdownInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const percent = Math.max(0, 100 - (elapsed / totalDuration) * 100);
    countdownBar.style.width = `${percent}%`;
  }, 100);

  // Timer ends (player loses turn)
  rapidTimer = setTimeout(() => {
    clearInterval(countdownInterval);
    countdownBarContainer.classList.add("hidden");

    statusText.textContent = `⏳ ${players[currentPlayer]} took too long! Skipping turn.`;
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    showCurrentTurn();

    if (gameMode === "pvc" && currentPlayer === "O") {
      setTimeout(computerMove, 500);
    } else {
      startRapidCountdown(); // restart for next player
    }
  }, totalDuration);
}

function updatePlayerDisplay() {
  const p1 = player1Input.value.trim() || "Player 1";
  const p2 = gameMode === "pvc"
    ? "Computer"
    : (player2Input.value.trim() || "Player 2");

  // Update names
  document.getElementById("nameX").textContent = p1;
  document.getElementById("nameO").textContent = p2;

  // Update avatars
  document.getElementById("avatarX").src = "https://api.dicebear.com/9.x/thumbs/svg?flip=false&seed=" + encodeURIComponent(p1);

  document.getElementById("avatarO").src = gameMode === "pvc"
    ? "https://api.dicebear.com/9.x/bottts/svg?seed=Aneka"
    : "https://api.dicebear.com/9.x/thumbs/svg?flip=false&seed=" + encodeURIComponent(p2);
}

function loadUsernamesFromStorage() {
  const savedNames = JSON.parse(localStorage.getItem("usernames"));
  if (savedNames) {
    players = savedNames;

    if (player1Input) player1Input.value = players.X;
    if (player2Input && gameMode === "pvp") player2Input.value = players.O;

    updatePlayerDisplay();
  }
}

//for username and score persistence
function loadUserData() {
  const savedNames = JSON.parse(localStorage.getItem("usernames"));
  const savedAvatars = JSON.parse(localStorage.getItem("avatars"));
  const savedScores = JSON.parse(localStorage.getItem("scores"));
  const savedRapidMode = JSON.parse(localStorage.getItem("rapidMode"));
  const savedRapidLimit = parseInt(localStorage.getItem("rapidTimeLimit"));

  // Restore usernames
  if (savedNames) {
    players = savedNames;
    if (player1Input) player1Input.value = players.X;
    if (player2Input && gameMode === "pvp") player2Input.value = players.O;
  }

  // Restore avatars
  if (savedAvatars) {
    document.getElementById("avatarX").src = savedAvatars.X;
    document.getElementById("avatarO").src = savedAvatars.O;
  }

  // Restore scores
  if (savedScores) {
    score = savedScores;
    p1Wins.textContent = score.X;
    p2Wins.textContent = score.O;
    draws.textContent = score.Draw;
  }

  // Restore Rapid Mode
  if (typeof savedRapidMode === "boolean") {
    rapidMode = savedRapidMode;
    document.getElementById("rapidToggle").checked = rapidMode;
  }

  if (!isNaN(savedRapidLimit)) {
    rapidTimeLimit = savedRapidLimit;
    document.getElementById("rapidSeconds").value = rapidTimeLimit / 1000;
  }

  updatePlayerDisplay();
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

    const playerName = players[currentPlayer];
    const playerColor = currentPlayer === "X" ? "🔴" : "🔵";

    statusText.textContent = `${playerColor} ${playerName}'s turn`;
    statusText.className = `${currentPlayer === 'X' ? 'text-red-600' : 'text-blue-600'} font-bold animate-pulse-once`;

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

    resetStyles()
    //get usernames
    const p1Name = players.X || "Player 1";
    const p2Name = players.O || (gameMode === "pvc" ? "Computer" : "Player 2");

    // Highlight winner
    if (winner === 'X') {
        p1Card.classList.add('ring-4', 'ring-green-400', 'animate-pulse-once');
        statusText.innerText = wasForfeit  
            ? `🔴 ${p1Name} wins by forfeit!`
            : `🎉 ${p1Name} wins!`;
        statusText.classList.add('text-red-600', 'animate-pulse-once');
    } else if (winner === 'O' && gameMode === 'pvp') {
        p2Card.classList.add('ring-4', 'ring-green-400', 'animate-pulse-once');
        statusText.innerText = wasForfeit
            ? `🔵 ${p2Name} wins by forfeit!`
            : `🎉 ${p2Name} wins!`;
        statusText.classList.add('text-blue-600', 'animate-pulse-once');
    } else if (winner === 'O' && gameMode === 'pvc'){
        p2Card.classList.add('ring-4', 'ring-green-400', 'animate-pulse-once');
        statusText.innerText = wasForfeit 
            ? '🔵 Computer wins by Forfeit' 
            : '🎉 Computer wins!';
        statusText.classList.add('text-gray-600', 'animate-pulse-once');
    } else{
        drawsCard.classList.add('ring-4', 'ring-yellow-400', 'animate-pulse-once');
        statusText.innerText = '🤝 It\'s a draw!';
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
    saveHistoryToLocalStorage()
    newRoundBtn.disabled = false
    replayRoundBtn.disabled = false
    clearTimeout(rapidTimer);
    clearInterval(countdownInterval);
    countdownBarContainer.classList.add("hidden");

}

function saveToLocalStorage() {
    localStorage.setItem("scores", JSON.stringify(score));
    localStorage.setItem("usernames", JSON.stringify(players));
    localStorage.setItem("avatars", JSON.stringify({
        X: document.getElementById("avatarX").src,
        O: document.getElementById("avatarO").src
    }));

    localStorage.setItem("rapidMode", JSON.stringify(rapidMode));
    localStorage.setItem("rapidTimeLimit", rapidTimeLimit);
}

function loadScores() {
    p1Wins.textContent = score.X;
    p2Wins.textContent = score.O;
    draws.textContent = score.Draw;
}

function resetGame(){
    moveHistory=[]
    score.X = 0;
    score.O = 0;
    score.Draw = 0;
    gameStarted = false;
    saveToLocalStorage()

    loadScores()

    board.fill("")
    gameActive = true
    currentPlayer = "X"

    resetStyles()
    updateBoard()
    scrollToTop()
    showCurrentTurn()
    clearTimeout(rapidTimer);
    clearInterval(countdownInterval);
    countdownBarContainer.classList.add("hidden");
    newRoundBtn.disabled = true
    replayRoundBtn.disabled = true

    // Show username section again
    usernameSection.style.display = "block";

    // Reset status text
    statusText.textContent = "🎯 Enter usernames to start";

    // Adjust Player 2 input field based on game mode
    if (gameMode === "pvc") {
        player2Input.style.display = "none";
        player2Input.value = "Computer";
    } else {
        player2Input.style.display = "block";
    }

    loadUsernamesFromStorage();
}

function resetUsernames() {
  if (confirm("Are you sure you want to clear saved usernames?")) {
    localStorage.removeItem("usernames");
    player1Input.value = "";
    player2Input.value = "";
    updatePlayerDisplay();

    usernameSection.style.display = "block";
  }
}

function newRound() {
    // console.log("new round");
    moveHistory = []
    
    board.fill("")
    gameActive = true
    currentPlayer = "X"

    resetStyles()
    updateBoard()
    showCurrentTurn()
    newRoundBtn.disabled = true // the new round button gets disabled after a new round is stared and when the game is midway
    replayRoundBtn.disabled = true
    scrollToTop()
}

function saveHistoryToLocalStorage() {
    const roundHistory = {
        prevWinner: statusText.innerText,
        moves: moveHistory,
        players: {
            X: players.X,
            O: players.O
        }
    };
    localStorage.setItem("lastRound", JSON.stringify(roundHistory));
}

function replayRound() {
    scrollToTop()
    const lastRound = JSON.parse(localStorage.getItem("lastRound"));
    if (!lastRound || !lastRound.moves || !lastRound.players) return;

    // Restore previuos players
    players = lastRound.players;

    // Update avatar names
    document.getElementById("nameX").textContent = players.X;
    document.getElementById("nameO").textContent = players.O;
    document.getElementById("nameX").textContent = players.X;
    document.getElementById("nameO").textContent = players.O;

    // Reset board visually
    board = Array(9).fill("");
    updateBoard();
    gameActive = false;
    gameStarted = true;

    statusText.textContent = "🔁 Replaying last round...";
    replayRoundBtn.disabled = true;

    let delay = 0;

    lastRound.moves.forEach((move, i) => {
    setTimeout(() => {
        board[move.index] = move.player;
        updateBoard();

        if (i === lastRound.moves.length - 1) {
        // After last move
        statusText.textContent =lastRound.prevWinner;
        }
    }, delay);
    delay += 600; // Adjust speed
    });

    replayRoundBtn.disabled = false
}

// Show modal when forfeit button is clicked
forfeitBtn.addEventListener("click", () => {
  if (!gameActive) return;
  forfeitModal.classList.remove("hidden");
});

// Confirm forfeit
confirmForfeit.addEventListener("click", () => {
  const opponent = currentPlayer === "X" ? "O" : "X";
  forfeitModal.classList.add("hidden");
  endGame(opponent, true); // true = forfeit
  scrollToTop()
});

// Cancel forfeit
cancelForfeit.addEventListener("click", () => {
  forfeitModal.classList.add("hidden");
});

function resetStyles() {
  [p1Card, p2Card, drawsCard].forEach(card => {
    card.classList.remove('ring-4', 'ring-green-400', 'animate-pulse-once');
  });
}

function scrollToTop(){
    window.scrollTo({ top: 254, behavior: 'smooth' });
}

const toggleBtn = document.getElementById("creatorToggle");
const panel = document.getElementById("creatorPanel");

toggleBtn.addEventListener("click", () => {
  panel.classList.toggle("hidden");
});

// Optional: Click outside to close
document.addEventListener("click", (e) => {
  if (!toggleBtn.contains(e.target) && !panel.contains(e.target)) {
    panel.classList.add("hidden");
  }
});

musicBtn.addEventListener("click", ()=>{
  musicBtn.classList.toggle("mute")

  if (musicBtn.classList.contains("mute")){
    backgroundMusic.muted = true
    musicBtn.innerHTML = '<span><img src="./images/mute.svg" alt="Sound on" class="h-5"></span>'
  } else {
    backgroundMusic.muted = false
    musicBtn.innerHTML = '<span><img src="./images/sound.svg" alt="Muted" class="h-5"></span>'
  }
})