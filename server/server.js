const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const Game = require('./game');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3000;
const game = new Game(io);

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// API для проверки состояния (можно оставить для дебага)
app.get('/api/game-state', (req, res) => {
    res.json(game.getPublicState());
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Socket.io подключения
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Регистрация игрока
    socket.on('register', (name, callback) => {
        const player = game.addPlayer(socket.id, name);
        if (player) {
            callback({ success: true, player });
            io.emit('players-updated', game.getPlayers());
        } else {
            callback({ success: false, error: 'Game is full or already started' });
        }
    });
    
    // Драфт карты
    socket.on('draft-card', (cardIndex, callback) => {
        const result = game.draftCard(socket.id, cardIndex);
        callback(result);
    });
    
    // Старт игры
    socket.on('start-game', () => {
        if (game.canStartGame(socket.id)) {
            game.startGame();
        }
    });
    
    // Отключение игрока
    socket.on('disconnect', () => {
        game.removePlayer(socket.id);
        io.emit('players-updated', game.getPlayers());
        console.log('Client disconnected:', socket.id);
    });
});