const uuid = require('uuid');

class Game {
    constructor(io) {
        this.io = io;
        this.players = [];
        this.availableCards = [];
        this.draftedCards = {};
        this.currentRound = 0;
        this.gameStarted = false;
        this.maxPlayers = 4;
        this.cardTypes = [
            'Меч', 'Щит', 'Зелье', 'Артефакт', 'Заклинание',
            'Драгоценность', 'Доспех', 'Лук', 'Посох', 'Кольцо'
        ];
    }

    addPlayer(socketId, name) {
        if (this.gameStarted || this.players.length >= this.maxPlayers) {
            return null;
        }
        
        const player = {
            id: socketId,
            name: name || `Игрок ${this.players.length + 1}`,
            isHost: this.players.length === 0
        };
        
        this.players.push(player);
        this.draftedCards[socketId] = [];
        
        return player;
    }

    removePlayer(socketId) {
        this.players = this.players.filter(p => p.id !== socketId);
        delete this.draftedCards[socketId];
        
        // Если хост вышел, назначим нового
        if (this.players.length > 0 && !this.players.some(p => p.isHost)) {
            this.players[0].isHost = true;
        }
    }

    canStartGame(socketId) {
        const player = this.players.find(p => p.id === socketId);
        return player && player.isHost && !this.gameStarted && this.players.length > 1;
    }

    startGame() {
        if (this.gameStarted) return;
        
        this.gameStarted = true;
        this.currentRound = 1;
        this.generateCards();
        
        this.io.emit('game-started', this.getPublicState());
    }

    generateCards() {
        this.availableCards = [];
        const cardsPerPlayer = 4;
        const totalCards = this.players.length * cardsPerPlayer;
        
        for (let i = 0; i < totalCards; i++) {
            const type = this.cardTypes[Math.floor(Math.random() * this.cardTypes.length)];
            const power = Math.floor(Math.random() * 10) + 1;
            this.availableCards.push({
                id: uuid.v4(),
                type,
                power,
                description: this.getCardDescription(type, power)
            });
        }
        
        this.io.emit('cards-generated', this.availableCards);
    }

    getCardDescription(type, power) {
        const descriptions = {
            'Меч': `Острое оружие (+${power} к атаке)`,
            'Щит': `Защитный щит (+${power} к защите)`,
            'Зелье': `Магическое зелье (+${power} к здоровью)`,
            'Артефакт': `Древний артефакт (+${power} ко всем характеристикам)`,
            'Заклинание': `Мощное заклинание (${power} урона)`,
            'Драгоценность': `Ценная драгоценность (+${power} золота)`,
            'Доспех': `Прочный доспех (+${power} к защите)`,
            'Лук': `Дальнобойное оружие (+${power} к атаке)`,
            'Посох': `Магический посох (+${power} к магии)`,
            'Кольцо': `Волшебное кольцо (+${power} к удаче)`
        };
        return descriptions[type] || `Таинственный предмет (+${power})`;
    }

    draftCard(playerId, cardIndex) {
        if (!this.gameStarted) return { success: false, error: 'Game not started' };
        
        const player = this.players.find(p => p.id === playerId);
        if (!player) return { success: false, error: 'Player not found' };
        
        if (cardIndex < 0 || cardIndex >= this.availableCards.length) {
            return { success: false, error: 'Invalid card index' };
        }
        
        const card = this.availableCards.splice(cardIndex, 1)[0];
        this.draftedCards[playerId].push(card);
        
        this.io.emit('card-drafted', {
            playerId,
            card,
            remainingCards: this.availableCards.length
        });
        
        if (this.availableCards.length === 0) {
            this.currentRound++;
            if (this.currentRound <= 3) {
                setTimeout(() => this.generateCards(), 2000);
            } else {
                this.endGame();
            }
        }
        
        return { success: true, card };
    }

    endGame() {
        this.gameStarted = false;
        const scores = this.calculateScores();
        this.io.emit('game-ended', scores);
    }

    calculateScores() {
        return Object.entries(this.draftedCards).map(([playerId, cards]) => {
            const player = this.players.find(p => p.id === playerId);
            return {
                playerId,
                name: player?.name || 'Unknown',
                totalPower: cards.reduce((sum, card) => sum + card.power, 0),
                cards
            };
        }).sort((a, b) => b.totalPower - a.totalPower);
    }

    getPlayers() {
        return this.players.map(p => ({
            id: p.id,
            name: p.name,
            isHost: p.isHost
        }));
    }

    getPublicState() {
        return {
            players: this.getPlayers(),
            availableCardsCount: this.availableCards.length,
            draftedCards: Object.fromEntries(
                Object.entries(this.draftedCards).map(([id, cards]) => [id, cards.length])
            ),
            currentRound: this.currentRound,
            gameStarted: this.gameStarted,
            maxPlayers: this.maxPlayers
        };
    }
}

module.exports = Game;