var PHASE1_QUESTIONS = [[0,0,0,2,0,1,0,0,0], [0,0,0,0,0,1,2,0,0], [0,0,0,1,0,0,0,0,2],
                             [0,0,0,1,0,0,0,2,0], [0,0,2,0,1,0,0,0,0], [0,2,0,0,1,0,0,0,0],
                             [1,0,0,0,0,0,2,0,0]],
    PHASE3_QUESTIONS = [[0,1,0,0,0,0,2,0,0], [0,0,0,2,0,0,0,0,1], [1,0,0,0,0,0,0,0,2],
                             [0,1,0,0,0,2,0,0,0], [0,1,2,0,0,0,0,0,0], [0,0,0,0,0,0,2,0,1],
                             [0,1,0,0,0,0,0,2,0]],
    TOTAL_GAMES = TWO_PLY_BOARDS_PHASE2.length,
    RESOLUTION_DEPTH = 50000,
    N_SIZE = 3,
    EMPTY = '&nbsp;',
    TIMER_SLICE = 1000,
    PL_FILE_NAME = 'strategy',
    TURN = 'X',
    TOTAL_GROUP = 2;

var t,
    phase = 1,
    sec = 0,
    boxes = [],
    totalTime = 30,
    currentQuestion = 0,
    prevBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0],
    test_boards = TWO_PLY_BOARDS_PHASE2,
    difficulty = [],
    answers = [],
    scores = [],
    timeTaken = [],
    ended = false,
    minimaxTable = canonicalData,
    record = '',
    boardRepreToCanonical = canonicalMap;

var texts = String(window.location).split('=');
var participantID = isNaN(texts[texts.length - 1]) ? 1 : Number(texts[texts.length - 1]);

function flushRecords() {
    prevBoard = [0,0,0,0,0,0,0,0,0];
    difficulty = [];
    answers = [];
    scores = [];
    timeTaken = [];
}

function applyStrategy(board) {

    var session = pl.create(RESOLUTION_DEPTH);

    session.consult(PL_FILE_NAME + (participantID % 3) + '.pl');
    var depth = Math.floor((board.filter(c => c == 0).length - 1) / 2);

    var queryWin;
    session.query('win_' + depth + '(' + composeStrategyState(board) + ', B).');
//    console.log('win_' + depth + '(' + composeStrategyState(board) + ', B).');
    session.answer(x => queryWin = x);
//    console.log(queryWin);

    var nextBoard = parsePrologVar(queryWin.lookup('B'));

    return nextBoard;
}


function learnerPlayGame(board) {

    var game = [board];
    var nextBoard = board;

    while(true) {

        nextBoard = applyStrategy(nextBoard);
        game.push(nextBoard);

        if (win(nextBoard, 1)) {
            strategyRegrets.push(0);
            break;
        }

        if (nextBoard.filter(mark => mark == 0).length == 0) {
            strategyRegrets.push(1);
            break;
        }

        nextBoard = computeNextMove(nextBoard, 2);
        game.push(nextBoard);

        if (win(nextBoard, 2)){
            strategyRegrets.push(2);
            break;
        }

    }

    return game;
}

function startCount() {
    var elapse = Math.max(totalTime - sec, 0);

    if (totalTime - sec < 0) {
        stopCount();
    } else if (!ended && sec <= totalTime){
        document.getElementById("timer").textContent = 'Remaining time: ' + Math.floor(elapse / 60) + ':' + wrapTime(elapse % 60);
        sec += 1;
        t = setTimeout(startCount, TIMER_SLICE);
    }

}

function stopCountPhase1() {

    if (currentQuestion != 0) {
        if (!ended) {
            // unfinished game
            answers[currentQuestion - 1].push(prevBoard);
            scores.push(-10);
            timeTaken.push(totalTime);
        }
    }

    if (t != null) {
        clearTimeout(t);
        sec = 0;
    }

    currentQuestion += 1;

    if (currentQuestion > TOTAL_GAMES) {

        removeChild('nextQuestionButton', 'nextQuestion');
        document.getElementById('phase').textContent = '';
        document.getElementById('timer').textContent = '';
        document.getElementById('instruction1').textContent = 'In phase 3, you are given chances to look at the games '
                            + 'you just played and learn from them.';
        if (participantID % TOTAL_GROUP == 0) {
            document.getElementById('instruction2').textContent = 'For each GAME ' +
                        'you WON, think about a strategy which led you to win. ';
            document.getElementById('instruction3').textContent =
                'For each other GAME you played, the first non-optimal move will is marked' +
                ' and you should think about a strategy which could make you win.';
        } else {
            document.getElementById('instruction2').textContent = 'For each GAME ' +
                        'you WON, you can compare the strategy you played against the provided strategy. ';
            document.getElementById('instruction3').textContent =
                'For each other GAME you played, the first non-optimal move is marked and ' +
                'you should try to understand the provided strategy to apply it.';
        //document.getElementById('instruction3').textContent = 'Press \'Next\' to continue.';
        }
        document.getElementById('numGame').textContent = '';
        document.getElementById('outcome').textContent = '';
        removeChild('gameBoard', 'game');

        createButton('nextPhaseButton', 'nextPhase', 'Continue', phase3);

    } else {
        nextQuestion();
        startCount();
    }

}

function stopCountPhase2() {

    if (currentQuestion != 0) {
        if (ended) {
            // finished game
            timeTaken.push(Math.max(0, sec - 1));
        } else {
            // unfinished game
            games[currentQuestion - 1].push(prevBoard);
            wrongMoves[currentQuestion - 1] = wrongMoves[currentQuestion - 1] == -1 ? games[currentQuestion - 1].length - 1
                                                                            : wrongMoves[currentQuestion - 1];
            positions[currentQuestion - 1] = positions[currentQuestion - 1] == -1 ? N_SIZE * N_SIZE
                                                                          : positions[currentQuestion - 1];
            timeTaken.push(totalTime);
            regrets.push(2);
        }
    }

    if (t != null) {
        clearTimeout(t);
        sec = 0;
    }

    currentQuestion += 1;

    if (currentQuestion > TOTAL_GAMES) {

        removeChild('nextQuestionButton', 'nextQuestion');
        document.getElementById('phase').textContent = '';
        document.getElementById('timer').textContent = '';
        document.getElementById('instruction1').textContent = 'In phase 3, you are given chances to look at the games '
                            + 'you just played and learn from them.';
        if (participantID % TOTAL_GROUP == 0) {
            document.getElementById('instruction2').textContent = 'For each GAME ' +
                        'you WON, think about a strategy which led you to win. ';
        document.getElementById('instruction3').textContent =
            'For each other GAME you played, the first non-optimal move will is marked' +
            ' and you should think about a strategy which could make you win.';
    } else {
        document.getElementById('instruction2').textContent = 'For each GAME ' +
                        'you WON, you can compare the strategy you played against the provided strategy. ';
        document.getElementById('instruction3').textContent =
            'For each other GAME you played, the first non-optimal move is marked and ' +
            'you should try to understand the provided strategy to apply it.';
        //document.getElementById('instruction3').textContent = 'Press \'Next\' to continue.';
    }
        document.getElementById('numGame').textContent = '';
        document.getElementById('outcome').textContent = '';
        removeChild('gameBoard', 'game');

        createButton('nextPhaseButton', 'nextPhase', 'Continue', phase3);

    } else {
//        if (participantID % 3 != 0) {
//            gamesUsingStrategy.push(learnerPlayGame(test_boards[currentQuestion - 1]));
//        }
        nextQuestion();
        startCount();
    }

}

function stopCountPhase3() {

    if (currentQuestion != 0) {
        if (ended) {
            timeTaken.push(Math.max(0, sec - 1));
        } else {
            timeTaken.push(totalTime);
            regrets.push(2);
        }
    }

    if (t != null) {
        clearTimeout(t);
        sec = 0;
    }

    currentQuestion += 1;

    if (currentQuestion > TOTAL_GAMES) {

       endExpr();

    } else {
        nextQuestion();
        startCount();
    }

}


function boardClicked() {

    if (this.innerHTML !== EMPTY) {
        return;
    } else if (!ended) {

        this.innerHTML = TURN;
        ended = true;

        var currentBoard = convertBoxesTOBoard(boxes);
        answers[currentQuestion - 1].push(currentBoard);

        scores.push(getMiniMaxScore(prevBoard, currentBoard, 1));
        timeTaken.push(Math.max(0, sec - 1));

        createButton('nextQuestionButton', 'nextQuestion', 'Next', stopCount);

    }
}


function nextQuestion() {

    ended = false;
    prevBoard = test_boards[currentQuestion - 1];
    // 1 / num of winning moves
    difficulty.push(1 / (minimaxTable[boardRepreToCanonical[prevBoard.join('')]][1]
                          .filter(x => x == 10)
                          .length));
    answers[currentQuestion - 1]

    var rightIndexAndLabel = changeLabelsOnBoard(prevBoard);
    removeChild('gameBoard', 'game');
    removeChild('nextQuestionButton', 'nextQuestion');
    boxes = [];
    document.getElementById('numGame').textContent = 'Game NO.' + currentQuestion;
    document.getElementById('outcome').textContent = 'Outcome: ';

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

function endExpr() {

    record += '\n\nPhase 4: \n'
        + games.map(g => '[\n' + g.join('\n') + '\n]\n')
        + 'cumulative regrets: ' + regrets + '\n'
        + 'time: ' + timeTaken + '\n'
        + 'moves: ' + wrongMoves + '\n'
        + 'position played: ' + positions;

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(record));
    element.setAttribute('download', participantID + '#' + Date.now() + '.txt');

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    window.location.href = 'submission.html';
}

function phase4() {

    removeChild('nextPhaseButton', 'nextPhase');

    record += '\n\nPhase 3: \n'
        + 'time: ' + timeTaken + '\n';

    games = [],
    timeTaken = [],
    wrongMoves = [-1, -1, -1, -1, -1, -1, -1],
    positions = [-1, -1, -1, -1, -1, -1, -1];

    phase = 4,
    totalTime = 30;

    document.getElementById('phase').textContent = 'Phase No.' + phase;
    document.getElementById('instruction1').textContent = 'You play X, and for every move you can press corresponding cell' +
                        ' for what you think is an optimal move. ';
    document.getElementById('instruction2').textContent = 'You have only one shot for each of your move. ' +
                        ' The outcome of the game is either you WIN, LOSE or DRAW with O. ';
    //document.getElementById('instruction3').textContent = 'Press \'Next Game\' to continue to the next game.';

    test_boards = TWO_PLY_BOARDS_PHASE4;
    stopCount();
}

function stopCount() {

    if (phase == 1) {
        stopCountPhase1();
    } else if (phase == 2) {
        stopCountPhase2();
    } else if (phase == 3) {
        stopCountPhase3();
    }
}


document.getElementById('phase').textContent = 'Phase No.' + phase;
document.getElementById('instruction1').textContent = 'You play X, and for every move you can press corresponding cell' +
                        ' for what you think is an optimal move. ';
document.getElementById('instruction2').textContent = 'You have only one shot for each of your move. ' +
                        ' The outcome of the game is either you WIN, LOSE or DRAW with O. ';
//document.getElementById('instruction3').textContent = 'Press \'Next Game\' to continue to the next game.';
stopCount();