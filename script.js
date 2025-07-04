//When the score changes
const p1WinsEl = document.getElementById("p1Wins");
p1WinsEl.classList.add("animate-pulse-once");
setTimeout(() => p1WinsEl.classList.remove("animate-pulse-once"), 300);


//Function for highlighting the winner
function highlightWinner(winner) {
  const p1Card = document.getElementById('p1Card');
  const p2Card = document.getElementById('p2Card');
  const drawsCard = document.getElementById('drawsCard');
  const status = document.getElementById('status');

  // Reset styles
  [p1Card, p2Card, drawsCard].forEach(card => {
    card.classList.remove('ring-4', 'ring-green-400', 'animate-pulse-once');
  });

  // Highlight winner
  if (winner === 'X') {
    p1Card.classList.add('ring-4', 'ring-green-400', 'animate-pulse-once');
    status.innerText = '🎉 Player 1 Wins!';
    status.classList.add('text-red-600', 'animate-pulse-once');
  } else if (winner === 'O') {
    p2Card.classList.add('ring-4', 'ring-green-400', 'animate-pulse-once');
    status.innerText = '🎉 Player 2 Wins!';
    status.classList.add('text-blue-600', 'animate-pulse-once');
  } else {
    drawsCard.classList.add('ring-4', 'ring-yellow-400', 'animate-pulse-once');
    status.innerText = '🤝 It\'s a draw!';
    status.classList.add('text-gray-600', 'animate-pulse-once');
  }

  // Remove the pulse effect after a moment
  setTimeout(() => {
    status.classList.remove('animate-pulse-once');
  }, 400);
}//Call this function after game ends


/* highlightWinner('X');  // Player 1
    highlightWinner('O');  // Player 2 or AI
    highlightWinner('draw');  // For draw */

//Function for highlighting current player's turn
function showCurrentTurn(currentPlayer) {
  const status = document.getElementById('status');
  if (currentPlayer === 'X') {
    status.innerText = "🔴 Player 1's Turn";
    status.className = "text-red-600 font-bold animate-pulse-once";
  } else {
    status.innerText = "🔵 Player 2's Turn";
    status.className = "text-blue-600 font-bold animate-pulse-once";
  }
}//Call showCurrentTurn('X') or ('O') after each move


//for rounds
let rounds = 0;
function updateRounds() {
  rounds++;
  document.getElementById('rounds').textContent = `Total Rounds Played: ${rounds}`;
}

//for rotating themes
const themes = [
  'bg-gradient-to-br from-blue-400 to-purple-600',
  'bg-gradient-to-br from-yellow-300 to-pink-500',
  'bg-gradient-to-br from-white-800 to-gray-900',
];
let themeIndex = 0;

document.getElementById('themeBtn').addEventListener('click', () => {
  document.body.className = themes[themeIndex];
  themeIndex = (themeIndex + 1) % themes.length;
});

//confetti on win, call celebrateWin() when a player wins
function celebrateWin() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

// Load sounds
const winSound = new Audio('sounds/win.wav');
const errorSound = new Audio('sounds/error.mp3');

// Optional: Set volume
winSound.volume = 0.6;
errorSound.volume = 0.5;

// Functions to play sounds
function playWinSound() {
  winSound.currentTime = 0;
  winSound.play();
}

function playErrorSound() {
  errorSound.currentTime = 0;
  errorSound.play();
}

//on invalid move
box.addEventListener('click', () => {
  if (box.classList.contains('x') || box.classList.contains('o')) {
    playErrorSound();
    return;
  }

});

//on winning
if (winner) {
  playWinSound();
  celebrateWin(); //confetti function
 
}


