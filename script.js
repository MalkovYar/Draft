const words = ["КОМПЬЮТЕР", "ПРОГРАММА", "ТЕЛЕГРАМ", "ПИТОН", "БОТ", "ИГРА"];
let selectedWord = "";
let hiddenWord = [];
let usedLetters = [];
let attemptsLeft = 6;

// ASCII-арт для виселицы
const hangmanArt = [
    `
      +---+
      |   |
          |
          |
          |
          |
    =========
    `,
    `
      +---+
      |   |
      O   |
          |
          |
          |
    =========
    `,
    `
      +---+
      |   |
      O   |
      |   |
          |
          |
    =========
    `,
    `
      +---+
      |   |
      O   |
     /|   |
          |
          |
    =========
    `,
    `
      +---+
      |   |
      O   |
     /|\\  |
          |
          |
    =========
    `,
    `
      +---+
      |   |
      O   |
     /|\\  |
     /    |
          |
    =========
    `,
    `
      +---+
      |   |
      O   |
     /|\\  |
     / \\  |
          |
    =========
    `
];

// Инициализация игры
function initGame() {
    selectedWord = words[Math.floor(Math.random() * words.length)];
    hiddenWord = Array(selectedWord.length).fill('_');
    usedLetters = [];
    attemptsLeft = 6;
    
    updateDisplay();
}

// Обновление отображения
function updateDisplay() {
    document.getElementById('word-display').textContent = hiddenWord.join(' ');
    document.getElementById('used-letters').textContent = usedLetters.join(', ');
    document.getElementById('attempts').textContent = attemptsLeft;
    document.getElementById('hangman-art').textContent = hangmanArt[6 - attemptsLeft];
}

// Проверка буквы
function guessLetter() {
    const input = document.getElementById('letter-input');
    const letter = input.value.toUpperCase();
    
    if (!letter || !/[А-ЯЁ]/.test(letter)) {
        alert("Пожалуйста, введите русскую букву!");
        return;
    }
    
    if (usedLetters.includes(letter)) {
        alert("Вы уже использовали эту букву!");
        return;
    }
    
    usedLetters.push(letter);
    
    if (selectedWord.includes(letter)) {
        // Открываем буквы в слове
        for (let i = 0; i < selectedWord.length; i++) {
            if (selectedWord[i] === letter) {
                hiddenWord[i] = letter;
            }
        }
        
        // Проверка победы
        if (!hiddenWord.includes('_')) {
            setTimeout(() => {
                alert("🎉 Победа! Вы угадали слово: " + selectedWord);
                initGame();
            }, 100);
        }
    } else {
        attemptsLeft--;
        
        // Проверка проигрыша
        if (attemptsLeft <= 0) {
            setTimeout(() => {
                alert("💀 Игра окончена! Загаданное слово: " + selectedWord);
                initGame();
            }, 100);
        }
    }
    
    input.value = '';
    updateDisplay();
}

// Обработчики событий
document.getElementById('guess-btn').addEventListener('click', guessLetter);
document.getElementById('restart-btn').addEventListener('click', initGame);
document.getElementById('letter-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') guessLetter();
});

// Запуск игры при загрузке
window.onload = initGame;