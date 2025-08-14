document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    let currentPlayer = null;
    
    // Элементы интерфейса
    const lobbyScreen = document.getElementById('lobby');
    const gameScreen = document.getElementById('game-area');
    const playersList = document.getElementById('players-list');
    const startGameBtn = document.getElementById('start-game');
    const registerForm = document.getElementById('register-form');
    const playerNameInput = document.getElementById('player-name');
    const availableCardsContainer = document.getElementById('available-cards');
    const playersContainer = document.querySelector('.players-container');
    const roundNumber = document.getElementById('round-number');
    
    // Регистрация игрока
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = playerNameInput.value.trim() || `Игрок ${Math.floor(Math.random() * 1000)}`;
        
        socket.emit('register', name, (response) => {
            if (response.success) {
                currentPlayer = response.player;
                lobbyScreen.querySelector('h2').textContent = `Лобби (${name})`;
                playerNameInput.disabled = true;
                registerForm.querySelector('button').disbled = true;
                
                if (response.player.isHost) {
                    startGameBtn.style.display = 'block';
                }
            } else {
                alert(response.error || 'Ошибка регистрации');
            }
        });
    });
    
    // Начало игры
    startGameBtn.addEventListener('click', () => {
        socket.emit('start-game');
    });
    
    // Драфт карты
    availableCardsContainer.addEventListener('click', (e) => {
        const cardElement = e.target.closest('.card');
        if (!cardElement || !currentPlayer) return;
        
        const cardIndex = parseInt(cardElement.dataset.index);
        if (isNaN(cardIndex)) return;
        
        socket.emit('draft-card', cardIndex, (response) => {
            if (!response.success) {
                console.error(response.error);
            }
        });
    });
    
    // Socket.io события
    
    // Обновление списка игроков
    socket.on('players-updated', (players) => {
        playersList.innerHTML = '';
        players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player-info';
            playerElement.textContent = player.name;
            if (player.isHost) {
                playerElement.textContent += ' (Хост)';
            }
            playersList.appendChild(playerElement);
        });
    });
    
    // Начало игры
    socket.on('game-started', (gameState) => {
        lobbyScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        updateGameState(gameState);
    });
    
    // Новая генерация карт
    socket.on('cards-generated', (cards) => {
        renderAvailableCards(cards);
    });
    
    // Карта задрафчена
    socket.on('card-drafted', (data) => {
        const playerElement = document.querySelector(`.player[data-id="${data.playerId}"]`);
        if (playerElement) {
            const cardElement = createCardElement(data.card);
            playerElement.querySelector('.player-cards').appendChild(cardElement);
        }
    });
    
    // Конец игры
    socket.on('game-ended', (scores) => {
        alert(`
            Игра окончена!\n
            ${scores.map((p, i) => `${i+1}. ${p.name}: ${p.totalPower} очков`).join('\n')}
        `);
    });
    
    // Вспомогательные функции
    
    function updateGameState(state) {
        roundNumber.textContent = state.currentRound;
        renderPlayers(state);
    }
    
    function renderPlayers(state) {
        playersContainer.innerHTML = '';
        
        state.players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player';
            playerElement.dataset.id = player.id;
            
            const playerName = document.createElement('h3');
            playerName.className = 'player-name';
            playerName.textContent = player.name + (player.id === currentPlayer?.id ? ' (Вы)' : '');
            
            const playerCards = document.createElement('div');
            playerCards.className = 'player-cards';
            
            (state.draftedCards[player.id] || []).forEach(card => {
                playerCards.appendChild(createCardElement(card));
            });
            
            playerElement.appendChild(playerName);
            playerElement.appendChild(playerCards);
            playersContainer.appendChild(playerElement);
        });
    }
    
    function renderAvailableCards(cards) {
        availableCardsContainer.innerHTML = '';
        
        cards.forEach((card, index) => {
            const cardElement = createCardElement(card);
            cardElement.dataset.index = index;
            availableCardsContainer.appendChild(cardElement);
        });
    }
    
    function createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        const cardTitle = document.createElement('h4');
        cardTitle.textContent = card.type;
        
        const cardPower = document.createElement('p');
        cardPower.className = 'power';
        cardPower.textContent = `Сила: ${card.power}`;
        
        const cardDesc = document.createElement('p');
        cardDesc.textContent = card.description;
        
        cardElement.appendChild(cardTitle);
        cardElement.appendChild(cardPower);
        cardElement.appendChild(cardDesc);
        
        return cardElement;
    }
});