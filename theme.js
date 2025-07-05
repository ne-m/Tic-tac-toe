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