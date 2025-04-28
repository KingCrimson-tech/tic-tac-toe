// Player Factory Function
const Player = (name, marker, isBot = false) => {
    return { name, marker, isBot };
};

// Game Board Module
const GameBoard = (() => {
    let board = Array(9).fill(null);

    const getBoard = () => [...board];

    const resetBoard = () => {
        board = Array(9).fill(null);
        return getBoard();
    };

    const placeMarker = (index, marker) => {
        if (index >= 0 && index < 9 && board[index] === null) {
            board[index] = marker;
            return true;
        }
        return false;
    };

    const isBoardFull = () => {
        return board.every(cell => cell !== null);
    };

    const checkWin = () => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return {
                    winner: board[a],
                    winningCells: pattern
                };
            }
        }
        return null;
    };

    const getAvailableMoves = () => {
        return board.reduce((moves, cell, index) => {
            if (cell === null) moves.push(index);
            return moves;
        }, []);
    };

    return {
        getBoard,
        resetBoard,
        placeMarker,
        isBoardFull,
        checkWin,
        getAvailableMoves
    };
})();

// Minimax Algorithm
const Minimax = (() => {
    const evaluateBoard = (board) => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a] === 'O' ? 10 : -10;
            }
        }
        return 0;
    };

    const minimax = (board, depth, isMaximizing) => {
        const score = evaluateBoard(board);
        
        if (score !== 0) return score;
        if (board.every(cell => cell !== null)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    const score = minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    const score = minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const getBestMove = (board) => {
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                const score = minimax(board, 0, false);
                board[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    };

    return {
        getBestMove
    };
})();

// Display Controller Module
const DisplayController = (() => {
    const boardElement = document.getElementById('game-board');
    const statusElement = document.getElementById('status');
    const restartButton = document.getElementById('restart-btn');
    const playerXElement = document.getElementById('player-x');
    const playerOElement = document.getElementById('player-o');
    const gameSetupElement = document.querySelector('.game-setup');
    const startGameButton = document.getElementById('start-game');
    const gameModeSelect = document.getElementById('game-mode');
    const player1NameInput = document.getElementById('player1-name');
    const player2NameInput = document.getElementById('player2-name');

    const initializeBoard = () => {
        boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            boardElement.appendChild(cell);
        }
    };

    const updateBoard = (board) => {
        const cells = boardElement.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = board[index] || '';
            cell.className = 'cell';
            if (board[index]) {
                cell.classList.add(board[index].toLowerCase());
            }
        });
    };

    const updateStatus = (message) => {
        statusElement.textContent = message;
    };

    const addCellClickHandlers = (handleCellClick) => {
        const cells = boardElement.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const index = parseInt(cell.dataset.index);
                handleCellClick(index);
            });
        });
    };

    const addRestartHandler = (handleRestart) => {
        restartButton.addEventListener('click', handleRestart);
    };

    const addStartGameHandler = (handleStartGame) => {
        startGameButton.addEventListener('click', handleStartGame);
    };

    const highlightWinningCells = (winningCells) => {
        const cells = boardElement.querySelectorAll('.cell');
        winningCells.forEach(index => {
            cells[index].style.backgroundColor = '#DCEDC8';
        });
    };

    const updateActivePlayer = (marker) => {
        playerXElement.classList.toggle('active', marker === 'X');
        playerOElement.classList.toggle('active', marker === 'O');
    };

    const hideSetup = () => {
        gameSetupElement.style.display = 'none';
    };

    const showSetup = () => {
        gameSetupElement.style.display = 'block';
    };

    const getPlayerNames = () => {
        return {
            player1: player1NameInput.value || 'Player X',
            player2: player2NameInput.value || 'Player O'
        };
    };

    const getGameMode = () => {
        return gameModeSelect.value;
    };

    return {
        initializeBoard,
        updateBoard,
        updateStatus,
        addCellClickHandlers,
        addRestartHandler,
        addStartGameHandler,
        highlightWinningCells,
        updateActivePlayer,
        hideSetup,
        showSetup,
        getPlayerNames,
        getGameMode
    };
})();

// Game Controller Module
const GameController = (() => {
    let currentPlayer;
    let players;
    let gameActive;

    const initialize = () => {
        const { player1, player2 } = DisplayController.getPlayerNames();
        const gameMode = DisplayController.getGameMode();

        players = [
            Player(player1, 'X'),
            Player(player2, 'O', gameMode === 'pve')
        ];

        currentPlayer = players[0];
        gameActive = true;

        GameBoard.resetBoard();
        DisplayController.hideSetup();

        // Display setup
        DisplayController.initializeBoard();
        DisplayController.updateBoard(GameBoard.getBoard());
        DisplayController.updateStatus(`${currentPlayer.name}'s turn (${currentPlayer.marker})`);
        DisplayController.updateActivePlayer(currentPlayer.marker);

        DisplayController.addCellClickHandlers(handleCellClick);
        DisplayController.addRestartHandler(restartGame);

        if (currentPlayer.isBot) {
            makeBotMove();
        }
    };

    const handleCellClick = (index) => {
        if (!gameActive || currentPlayer.isBot) return;

        if (GameBoard.placeMarker(index, currentPlayer.marker)) {
            DisplayController.updateBoard(GameBoard.getBoard());

            const winResult = GameBoard.checkWin();
            if (winResult) {
                DisplayController.updateStatus(`${currentPlayer.name} wins!`);
                DisplayController.highlightWinningCells(winResult.winningCells);
                gameActive = false;
                return;
            }

            if (GameBoard.isBoardFull()) {
                DisplayController.updateStatus('Game ended in a draw!');
                gameActive = false;
                return;
            }

            switchPlayer();
            if (currentPlayer.isBot) {
                setTimeout(makeBotMove, 500);
            }
        }
    };

    const makeBotMove = () => {
        if (!gameActive) return;

        const board = GameBoard.getBoard();
        const bestMove = Minimax.getBestMove(board);
        
        if (bestMove !== null) {
            GameBoard.placeMarker(bestMove, currentPlayer.marker);
            DisplayController.updateBoard(GameBoard.getBoard());

            const winResult = GameBoard.checkWin();
            if (winResult) {
                DisplayController.updateStatus(`${currentPlayer.name} wins!`);
                DisplayController.highlightWinningCells(winResult.winningCells);
                gameActive = false;
                return;
            }

            if (GameBoard.isBoardFull()) {
                DisplayController.updateStatus('Game ended in a draw!');
                gameActive = false;
                return;
            }

            switchPlayer();
        }
    };

    const switchPlayer = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
        DisplayController.updateStatus(`${currentPlayer.name}'s turn (${currentPlayer.marker})`);
        DisplayController.updateActivePlayer(currentPlayer.marker);
    };

    const restartGame = () => {
        DisplayController.showSetup();
        DisplayController.updateBoard(GameBoard.resetBoard());
        DisplayController.updateStatus('');
        DisplayController.updateActivePlayer(null);
    };

    return {
        initialize,
        restartGame
    };
})();

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    DisplayController.addStartGameHandler(GameController.initialize);
});
