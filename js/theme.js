const themes = [
  'bg-gradient-to-br from-blue-400 to-purple-600',
  'bg-gradient-to-br from-yellow-300 to-pink-500',
  'bg-gradient-to-br from-gray-800 via-gray-600 to-gray-900',
  'bg-gradient-to-br from-green-300 via-blue-500 to-purple-600',
  'bg-gradient-to-br from-red-400 via-yellow-300 to-pink-500',
];
let themeIndex = 0;

function rotateTheme() {
  const body = document.body;

  // Remove previous gradient classes
  body.className = body.className
    .split(' ')
    .filter(cls => !cls.startsWith('bg-gradient-to-') && !cls.startsWith('from-') && !cls.startsWith('to-') && !cls.startsWith('via-'))
    .join(' ');

  // Apply new theme
  body.classList.add(...themes[themeIndex].split(' '));

  // Save current index
  localStorage.setItem("themeIndex", themeIndex);

  // Cycle to next
  themeIndex = (themeIndex + 1) % themes.length;
}

// Restore theme on load
window.addEventListener("DOMContentLoaded", () => {
  const savedIndex = parseInt(localStorage.getItem("themeIndex"));
  if (!isNaN(savedIndex)) {
    themeIndex = savedIndex;
    rotateTheme(); // apply saved theme
  }
});

document.getElementById('themeBtn').addEventListener('click', rotateTheme);