const gameBoard = (function () {
    // initialize game state
    var _gameStateArray = [['', '', ''],
    ['', '', ''],
    ['', '', '']];

    // function that recalls symbol in particular cell
    function getBoardValue(row, column) {
        if (row < 3 && column < 3) {
            return _gameStateArray[row][column];
        }
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

    // returns if space is empty
    function _isEmptySpace(row, column) {
        return (getBoardValue(row, column) === '');
    };

    // function for editing the board.
    function placeMarkOnBoard(symbol, row, column) {
        if (_isEmptySpace(row, column)) {
            _writeBoardValue(symbol, row, column);

            game.firstPlayerTurn ? game.player1.makeMove(row, column) :
                game.player2.makeMove(row, column);

            game.firstPlayerTurn = !game.firstPlayerTurn;
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
        placeMarkOnBoard
    }

})();

const displayController = (function () {
    var _cells = document.querySelectorAll("div.cell");

    const _updateBoard = () => {
        const _currentState = gameBoard.getBoardState();

        for (let i in _currentState) {
            _cells[i].textContent = _currentState[i];
        }
    };


    const _clickOnCell = function (symbol, row, col) {
        gameBoard.placeMarkOnBoard(game.firstPlayerTurn ? game.player1.getSymbol() : game.player2.getSymbol(), row, col);
    }

    for (let cell of _cells) {
        cell.addEventListener('click', () => {
            _clickOnCell(game.firstPlayerTurn ? game.player1 : game.player2,
                cell.dataset.row, cell.dataset.col);
            _updateBoard();
        })
    };

    return {}
})();

const playerFactory = (playerName, playerSymbol) => {
    let _name = playerName;
    let _symbol = playerSymbol;

    const _moves = [];

    const renamePlayer = newName => {
        _name = newName;
    };

    const getName = () => _name;
    const getSymbol = () => _symbol;
    const getMoveSet = () => _moves;
    const makeMove = (row, col) => _moves.push(row + 3 * col);

    return {
        getName,
        getSymbol,
        getMoveSet,
        makeMove
    };
};



const game = (() => {
    const player1 = playerFactory(prompt("Enter name of player 1: "), "X");
    const player2 = playerFactory(prompt("Enter name of player 2: "), "O");

    let firstPlayerTurn = true;

    function _winConditionMet(player) {
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

        function _hasAll(outerArray, innerArray) {
            for (let i of innerArray) {
                if (!(i in outerArray)) return false;
            }
            return true;
        }

        for (let condition of WIN_CONDITIONS)
            if (_hasAll(player.getMoveSet(), condition)) {
                // do winner stuff
                return true;
            }

        return false;
    }

    function _tieConditionMet(boardStateArray) {
        return (boardStateArray.length === 9);
    }

    while (!(_winConditionMet(firstPlayerTurn ? player1 : player2) ||
        _tieConditionMet(gameBoard.getBoardState()))) {

        // player has to successfully place mark on board for this to continue
        while (!placeMarkOnBoard(firstPlayerTurn ? player1 : player2)) { }


    }

    return { firstPlayerTurn, player1, player2 };

})();