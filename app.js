// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

// Развернуть приложение на весь экран
tg.expand();

// Можно добавить обработку данных от Telegram
tg.MainButton.setText("Сыграть ещё раз");
tg.MainButton.onClick(() => {
    initGame();
    tg.MainButton.hide();
});

// Показать кнопку, когда игра закончена
function showMainButton() {
    tg.MainButton.show();
}