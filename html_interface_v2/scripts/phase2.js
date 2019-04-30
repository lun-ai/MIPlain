var TOTAL_GAMES = 7,
    N_SIZE = 3,
    EMPTY = '&nbsp;',
    TIMER_SLICE = 1000,
    TURN = 'X',
    TWO_PLY_BOARDS_PHASE2 = [[0,0,0,0,0,1,0,2,0], [0,0,0,0,0,1,2,0,0], [0,0,0,0,1,0,0,2,0],
                             [0,0,0,1,0,0,0,2,0], [0,0,0,0,2,0,1,0,0], [0,0,0,0,2,0,0,1,0],
                             [2,0,0,0,0,0,1,0,0]];
    TWO_PLY_BOARDS_PHASE4 = [[0,2,0,0,0,1,0,0,0], [0,0,2,0,0,0,0,0,1], [0,0,0,1,0,0,2,0,0],
                             [0,1,0,2,0,0,0,0,0], [0,2,0,0,0,0,0,0,1], [0,0,0,2,0,0,1,0,0],
                             [2,0,0,0,1,0,0,0,0]];

var t,
    sec = 0,
    boxes = [],
    totalTime = 30,
    currentGame = 0,
    prevBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0],
    test_boards = TWO_PLY_BOARDS_PHASE2,
    regret = 0,
    games = [],
    ended = false,
    phase3_start = false;
    wrongMoves = [-1, -1, -1, -1, -1, -1, -1],
    positions = [-1, -1, -1, -1, -1, -1, -1],
    minimaxTable = canonicalData,
    boardRepreToCanonical = canonicalMap;


function startCount() {
    var elapse = Math.max(totalTime - sec, 0);

    if (totalTime - sec < 0) {
        stopCount();
    } else {
        document.getElementById("timer").textContent = 'Remaining time: ' + Math.floor(elapse / 60) + ':' + wrapTime(elapse % 60);
        sec += 1;
        t = setTimeout(startCount, TIMER_SLICE);
    }
}

function stopCount() {

    if (t != null) {
        clearTimeout(t);
        sec = 0;
    }

    currentGame += 1;

    if (currentGame > 10) {
        createButton('nextPhaseButton', 'nextPhase', 'Next Phase', phase3);
    } else {
        nextGame();
        startCount();
    }

}

function wrapTime(time) {

    if (time === 0) {
        return '00';
    } else if (time < 10) {
        time = '0' + time;
    }

    return time;
}


function boardClicked() {

    if (this.innerHTML !== EMPTY) {
        return;
    } else if (!ended) {

        this.innerHTML = TURN;
        games[currentGame - 1].push(prevBoard);

        var currentBoard = convertBoxesTOBoard(boxes);
        games[currentGame - 1].push(currentBoard);

        if (wrongMoves[currentGame - 1] == -1 && getMiniMaxScore(prevBoard, currentBoard, 1) != 10) {
            wrongMoves[currentGame - 1] = games[currentGame - 1].length - 1;
            positions[currentGame - 1] = prevBoard
                                         .map(function(_, i) { return prevBoard[i] != currentBoard[i] ? i : -1;})
                                         .filter(i => i != -1)[0];
        }

        console.log(wrongMoves);
        console.log(positions);
        console.log(games);

        if (win(currentBoard, 1)){
            regret += 0;
            ended = true;
            document.getElementById('outcome').textContent = 'WIN';
            createButton('nextGameButton', 'nextGame', 'Next Game', stopCount);
            return;
        } else {

            if (currentBoard.filter(mark => mark == 0).length == 0) {
                regret += 1;
                ended = true;
                document.getElementById('outcome').textContent = 'DRAW';
                createButton('nextGameButton', 'nextGame', 'Next Game', stopCount);
                return;
            }

            var newBoard = computeNextMove(currentBoard, 2);
            convertBoardToBoxes(newBoard, boxes);

            if (win(newBoard, 2)) {
                regret += 2;
                ended = true;
                games[currentGame - 1].push(newBoard);
                document.getElementById('outcome').textContent = 'LOSE';
                createButton('nextGameButton', 'nextGame', 'Next Game', stopCount);
                return;
            }

            prevBoard = newBoard;

        }
    }
}



function nextGame() {

    games.push([]);
    ended = false;
    prevBoard = test_boards[currentGame - 1];
    var rightIndexAndLabel = changeLabelsOnBoard(prevBoard);
    removeChild('gameBoard', 'game');
    removeChild('nextGameButton', 'nextGame');
    boxes = [];
    document.getElementById('numGame').textContent = 'Game NO.' + currentGame;
    document.getElementById('outcome').textContent = '';

    var board = document.createElement('table');
    board.setAttribute('id', 'gameBoard');
    board.setAttribute('border', 1);
    board.setAttribute('cellspacing', 0);
    board.classList.add('table1');

    for (var i = 0; i < N_SIZE; i++) {

        var row = document.createElement('tr');
        board.appendChild(row);

        for (var j = 0; j < N_SIZE; j++) {

        var cell = document.createElement('td');
        cell.setAttribute('height', 120);
        cell.setAttribute('width', 120);
        cell.setAttribute('align', 'center');
        cell.setAttribute('valign', 'center');

        cell.addEventListener('click', boardClicked);
        cell.innerHTML = rightIndexAndLabel[i * 3 + j] == 'e' ?
                         EMPTY :
                         rightIndexAndLabel[i * 3 + j].charAt(0).toUpperCase();
        row.appendChild(cell);
        boxes.push(cell);

        }
    }

    document.getElementById('game').appendChild(board);
}


function phase3 () {
    phase3_start = true;
}

alert('In this phase, you play 7 games. Each GAME ' +
                        'starts from 2-ply board and you will play against ' +
                        'the OPTIMAL opponent. You have 30 SECS for each GAME.');
document.getElementById('instruction1').textContent = 'You play X, and for every move you can press corresponding cell' +
                        ' for what you think is an optimal move. ';
document.getElementById('instruction2').textContent = 'You have only one shot for each of your move. ' +
                        ' The outcome of the game is either you WIN, LOSE or DRAW with O. ';
document.getElementById('instruction3').textContent = 'Press \'Next Game\' to continue to the next game.';
stopCount();