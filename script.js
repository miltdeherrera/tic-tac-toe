const gameBoard = (function () {
    // initialize  board state
    var _gameStateArray = [['', '', ''],
    ['', '', ''],
    ['', '', '']];

    // function that recalls symbol in particular cell
    function getBoardValue(row, column) {
        if (row < 3 && column < 3) {
            return _gameStateArray[row][column];
        }
    }

    // initializes board for new game
    const initializeBoard = () => {
        _gameStateArray = [['', '', ''],
        ['', '', ''],
        ['', '', '']];
    }

    // decomposes board state to 2-dimensional array
    function getBoardState() {
        const _boardStateArray = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                _boardStateArray.push(_gameStateArray[i][j]);
            }
        }

        return _boardStateArray;
    }

    // writes board value to board
    function _writeBoardValue(symbol, row, column) {
        _gameStateArray[row][column] = symbol;

    }

    // returns true if space is empty
    function _isEmptySpace(row, column) {
        return (getBoardValue(row, column) === '');
    };

    // public function for editing the board. Returns true if move was successfully made, otherwise false.
    function placeMarkOnBoard(symbol, row, column) {
        if (_isEmptySpace(row, column)) {
            _writeBoardValue(symbol, row, column);

            game.firstPlayerTurn ? game.player1.recordMove(row, column) :
                game.player2.recordMove(row, column);

            // remove after testing. is recorded move actually being passed?
            game.firstPlayerTurn ?
                console.log("player one name", game.player1.getName()) :
                console.log("player two name", game.player2.getName());

            console.log(`Since firstPlayerTurn is ${game.firstPlayerTurn}, we are sending ${game.firstPlayerTurn ? game.player1.getName() :
                game.player2.getName()} to the playThroughTurn function.`)

            game.playThroughTurn(game.firstPlayerTurn ? game.player1 : game.player2);

            return true;
        }
        else {
            console.log("Square occupied, try again.");
            return false;
        }
    }

    return {
        getBoardValue,
        getBoardState,
        placeMarkOnBoard,
        initializeBoard
    }

})();

const displayController = (function () {
    // iniitializing cells
    var _cells = document.querySelectorAll("div.cell");

    // places mark on board depending on whose turn it is
    const _clickOnCell = function (symbol, row, col) {
        gameBoard.placeMarkOnBoard(game.firstPlayerTurn ? game.player1.getSymbol() : game.player2.getSymbol(), row, col);
    }

    // click event for cells: if the game isn't over yet, let the person make the click and update the board accordingly.
    for (let cell of _cells) {
        cell.addEventListener('click', () => {
            if (!game.gameOverYet())
                _clickOnCell(game.firstPlayerTurn ? game.player1 : game.player2,
                    cell.dataset.row, cell.dataset.col);
            updateBoard();
        })
    };

    // redraws board based on board state
    const updateBoard = () => {
        const _currentState = gameBoard.getBoardState();
        for (let i in _currentState) {
            _cells[i].textContent = _currentState[i];
        }
    };

    return { updateBoard }
})();

const playerFactory = (playerName, playerSymbol) => {
    // initialize player object
    let _name = playerName;
    let _symbol = playerSymbol;

    const _moves = [];

    const renamePlayer = newName => {
        _name = newName;
    };

    const getName = () => _name;
    const getSymbol = () => _symbol;
    const getMoveSet = () => _moves;
    const recordMove = (row, col) => {
        _moves.push(Number(row) * 3 + Number(col));
    };
    const clearMoves = () => _moves.length = 0;

    return {
        getName,
        getSymbol,
        getMoveSet,
        recordMove,
        renamePlayer,
        clearMoves
    };
};



const game = (() => {
    let player1 = playerFactory(prompt("Enter name of player 1: "), "X");
    let player2 = playerFactory(prompt("Enter name of player 2: "), "O");
    let firstPlayerTurn = true;
    let _gameOver = false;
    const _screen = document.querySelector("div.screen");

    const initializeGame = () => {
        let winBanner = document.querySelector('div.win-banner');
        winBanner.parentNode.removeChild(winBanner);


        gameBoard.initializeBoard();
        player1.clearMoves();
        player2.clearMoves();
        displayController.updateBoard();
        game.firstPlayerTurn = true;
        _gameOver = false;

    }

    // start - reset button functionality
    const startResetButton = document.querySelector("#start-reset");
    startResetButton.addEventListener("click", () => initializeGame());

    const _drawWinBanner = (winningPlayer) => {
        const winString = `${winningPlayer.getName()} wins in ${winningPlayer.getMoveSet().length} moves! Click Start / Reset to play again!`;
        const winBanner = document.createElement('div');
        winBanner.classList = "win-banner";
        winBanner.textContent = winString;
        _screen.appendChild(winBanner);
    };


    // function checks to see if a given player has won the game.
    function _winConditionMet(thisPlayer) {
        console.log(`Win condition check begin for ${thisPlayer.getName()}.
        firstplayerturn = ${game.firstPlayerTurn}`); // remove after testing

        // list of win conditions. num = row * 3 + col.
        const WIN_CONDITIONS = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 6],
            [0, 4, 8],
            [2, 4, 6]
        ];

        // get current player board state
        const markerLocs = thisPlayer.getMoveSet();

        console.log("current player: ", thisPlayer.getName(),
            " current move set: ", markerLocs); // remove after testing

        function _hasAll(outerArray, innerArray) {
            for (let i of innerArray) {
                if (!(outerArray.includes(i))) return false;
            }
            return true;
        }

        for (let condition of WIN_CONDITIONS)
            if (_hasAll(markerLocs, condition)) {
                // do winner stuff
                game.gameOverToggle();
                console.log(`${thisPlayer.getName()} wins`); // remove after testing
                _drawWinBanner(thisPlayer);
                return true;
            }



        console.log("win condition false"); // remove after testing
        return false;
    }

    const gameOverYet = () => _gameOver;
    const gameOverToggle = () => _gameOver = !(_gameOver);


    function _tieConditionMet() {
        if (!(gameBoard.getBoardState().includes(''))) {
            console.log("tie game");
            gameOverToggle(); // remove after testing
        }

        return (!(gameBoard.getBoardState().includes('')));
    }

    // playThroughTurn goes through the ramifications of a player's turn once they have moved. It checks to see if win and tie conditions have been met.
    function playThroughTurn(player) {
        if (_winConditionMet(player)) {
            // all necessary stuff happens in win condition
        }
        else if (_tieConditionMet()) {
        }
        else {
            game.firstPlayerTurn = !game.firstPlayerTurn;
        }
    }



    return { firstPlayerTurn, player1, player2, playThroughTurn, gameOverYet, gameOverToggle, initializeGame };

})();