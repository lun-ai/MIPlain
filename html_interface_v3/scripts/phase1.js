var TOTAL_QUESTIONS = PHASE1_QUESTIONS.length,
    TOTAL_EXPL = examples.length,
    RESOLUTION_DEPTH = 50000,
    N_SIZE = 3,
    EMPTY = '&nbsp;',
    TIMER_SLICE = 1000,
    PL_FILE_NAME = 'strategy',
    TURN = 'X',
    TOTAL_GROUP = 2,
    QUESTION_TIME = 60 * 60 * 24,
    EXPL_TIME = 120;

var t,
    phase = 0,
    sec = 0,
    boxes = [],
    totalTime = QUESTION_TIME,
    currentQuestion = 0,
    prevBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0],
    test_boards = PHASE1_QUESTIONS,
    difficulty = [],
    moveChosen = false,
    currentExpl = 0,
    timeTakenExpl = [],
    answers = [],
    scores = [],
    timeTaken = [],
    ended = false,
    record = '';

var texts = String(window.location).split('=');
var participantID = isNaN(texts[texts.length - 1]) ? 1 : Number(texts[texts.length - 1]);

function flushLocalCache() {
    prevBoard = [0,0,0,0,0,0,0,0,0],
    difficulty = [],
    answers = [],
    scores = [],
    timeTaken = [],
    timeTakenExpl = [],
    ended = false,
    moveChosen = false,
    currentExpl = 0,
    currentQuestion = 0;

    document.getElementById('phase').textContent = '';
    document.getElementById('timer').textContent = '';
    document.getElementById('instruction1').textContent = '';
    document.getElementById('instruction2').textContent = '';
    document.getElementById('instruction3').textContent = '';
}

function applyStrategy(board) {

    var session = pl.create(RESOLUTION_DEPTH);

    session.consult(PL_FILE_NAME + (participantID % TOTAL_GROUP) + '.pl');
    var depth = Math.floor((board.filter(c => c == 0).length - 1) / 2);

    var queryWin;
    session.query('win_' + depth + '(' + composeStrategyState(board) + ', B).');
    session.answer(x => queryWin = x);

    var nextBoard = parsePrologVar(queryWin.lookup('B'));

    return nextBoard;
}

function learnerPlayGame(board) {

    var game = [board];
    var nextBoard = board;

    while(true) {

        if (nextBoard.filter(x=>x==0).length % 2 == 1) {
            nextBoard = applyStrategy(nextBoard);
            game.push(nextBoard);
        }

        if (win(nextBoard, 1)) {
            break;
        }

        if (nextBoard.filter(mark => mark == 0).length == 0) {
            break;
        }

        if (nextBoard.filter(x=>x==0).length % 2 == 0) {
            nextBoard = computeNextMove(nextBoard, 2);
            game.push(nextBoard);
        }

        if (win(nextBoard, 2)){
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
//        document.getElementById("timer").textContent = 'Remaining time: ' + Math.floor(elapse / 60) + ':' + wrapTime(elapse % 60);
        if(phase == 2 && sec == totalTime - 10) {
            document.getElementById("timer").textContent = 'We will be forced to move on in 10 secs';
        }
        sec += 1;
        t = setTimeout(startCount, TIMER_SLICE);
    }
}

function stopCountPhase1() {

    if (currentQuestion != 0) {
        if (!ended) {
            // unfinished game
            answers[currentQuestion - 1].push(prevBoard);
            scores.push(-1);
            timeTaken.push(totalTime);
        }
    }

    if (t != null) {
        clearTimeout(t);
        sec = 0;
    }

    currentQuestion += 1;

    if (currentQuestion > TOTAL_QUESTIONS) {

        removeChild('nextQuestionButton', 'nextQuestion');
        document.getElementById('phase').textContent = 'Instruction:';
        document.getElementById('timer').textContent = '';
        document.getElementById('instruction1').textContent =
                'In Part 2, you need choose between two potential moves for what '
                + 'you think to be the best move to win against an OPTIMAL O opponent.';
        if (participantID % TOTAL_GROUP == 0) {
            document.getElementById('instruction2').textContent =
                    'You will see which one is the right move and which is not.';
            document.getElementById('instruction3').textContent =
                    'You will pick your choice and have ' + EXPL_TIME + ' SECs to think about your choice.'
        } else {
            document.getElementById('instruction2').textContent =
                'Machine learner MIGO comments on which move is the right and which move is not.';
            document.getElementById('instruction3').textContent =
                    'You will pick your choice and have ' + EXPL_TIME + ' SECs to study the explanation by MIGO.'
        }

        document.getElementById('numQuestion').textContent = '';
        removeChild('gameBoard', 'game');

        createButton('nextPhaseButton', 'nextPhase', 'Continue', phase2);

    } else {
        nextQuestion();
        startCount();
    }

}

function stopCountPhase2() {

    if (currentExpl != 0) {
        if (!moveChosen) {
            answers[currentExpl - 1].push(wrongMoves[currentExpl - 1]);
            timeTaken.push(totalTime);
            wrongMoveChosen();
            startCount();
            return;
        } else if (moveChosen && sec > EXPL_TIME){
            timeTakenExpl.push(totalTime);
        } else {
            timeTakenExpl.push(Math.max(0, sec - 1));
        }
    }

    if (t != null) {
        clearTimeout(t);
        sec = 0;
    }

    currentExpl += 1;

    if (currentExpl > TOTAL_EXPL) {

        clearBoards();
        removeChild('nextExampleButton', 'nextExample');
        document.getElementById('explanation').style.display = 'none';
        document.getElementById('timer').textContent = '';
        document.getElementById('phase').textContent = 'Instruction: ';
        document.getElementById('instruction1').textContent = 'In Part 3, you will answer ' + TOTAL_QUESTIONS + ' questions. '
                                                    + 'For each question, you are given a board and you will play X.'
        document.getElementById('instruction2').textContent = 'And you should choose what you think to be the best move to WIN '
                                                    + 'against an OPTIMAL O opponent. You have ONE CHANCE for each question.';
        document.getElementById('instruction3').textContent = '';
        createButton('nextPhaseButton', 'nextPhase', 'Continue', phase3);

    } else {
        document.getElementById('timer').textContent = '';
        nextExample();
        startCount();
    }

}

function stopCountPhase3() {

    if (currentQuestion != 0) {
        if (!ended) {
            answers[currentQuestion - 1].push(prevBoard);
            scores.push(-1);
            timeTaken.push(totalTime);
        }
    }

    if (t != null) {
        clearTimeout(t);
        sec = 0;
    }

    currentQuestion += 1;

    if (currentQuestion > TOTAL_QUESTIONS) {
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

        createButton('nextQuestionButton', 'nextQuestion', 'Next Question', stopCount);

    }
}

function nextQuestion() {

    ended = false;
    prevBoard = test_boards[currentQuestion - 1];
    // available moves / num of winning moves
    difficulty.push(computeBoardDifficulty(prevBoard));
    answers.push([]);
    answers[currentQuestion - 1].push(prevBoard);

    var rightIndexAndLabel = changeLabelsOnBoard(prevBoard);
    removeChild('gameBoard', 'game');
    removeChild('nextQuestionButton', 'nextQuestion');
    boxes = [];
    document.getElementById('numQuestion').textContent = 'Question NO.' + currentQuestion;

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

    record += '\n\nPart 3: \n'
        + answers.map(g => '[[' + g.join('],[') + ']]\n')
        + 'difficulty: ' + difficulty + '\n',
        + 'scores: ' + scores + '\n'
        + 'time: ' + timeTaken + '\n';

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(record));
    element.setAttribute('download', participantID + '#' + formattedDate() + '.txt');

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    window.location.href = 'submission.html';
}

function phase1() {

    removeChild('nextPhaseButton', 'nextPhase');

    phase = 1;
    totalTime = QUESTION_TIME;

    document.getElementById('phase').textContent = 'Part No.' + phase;
    document.getElementById('instruction1').textContent = 'You play X, and please press corresponding cell' +
                        ' for what you think to be the best move to WIN against an OPTIMAL O opponent';
    document.getElementById('instruction2').textContent = 'You have ONE CHANCE for each question.';
    stopCount();
}

function phase2() {

    removeChild('nextPhaseButton', 'nextPhase');

    record += '\n\nPart 1: \n'
        + answers.map(g => '[[' + g.join('],[') + ']]\n')
        + 'difficulty: ' + difficulty + '\n',
        + 'scores: ' + scores + '\n'
        + 'time: ' + timeTaken + '\n';

    console.log(record);

    flushLocalCache();

    phase = 2,
    totalTime = QUESTION_TIME;

    document.getElementById('explanation').style.display = 'block';

    document.getElementById('phase').textContent = 'Part No.' + phase;
    document.getElementById('instruction1').textContent = 'You are playing X. Given an initial board, choose between two potential moves for what '
                + 'you think to be the best move to win against an OPTIMAL O opponent.'

        if (participantID % TOTAL_GROUP == 0) {
            document.getElementById('instruction2').textContent =
                    'You will be informed which one is the right move and which is not.';
            document.getElementById('instruction3').textContent =
                    'You will pick your choice and '
                    + EXPL_TIME + ' SECs to think about your choice.';
            document.getElementById('feedbackPanel').style.display = 'none';
        } else {
            document.getElementById('instruction2').textContent =
                'You will receive comments from machine learner MIGO on which move is the right and which move is not.';
            document.getElementById('instruction3').textContent =
                    'You can pick your choice and '
                    + EXPL_TIME + ' SECs to study the comments by MIGO.'
        }
    stopCount();
}

function phase3() {

    removeChild('nextPhaseButton', 'nextPhase');

    record += '\n\nPart 2: \n'
        + answers.map(g => '[[' + g.join('],[') + ']]\n')
        + 'scores: ' + scores + '\n'
        + 'time: ' + timeTaken + '\n'
        + 'time on expl: ' + timeTakenExpl + '\n';

    console.log(record);

    flushLocalCache();

    phase = 3,
    totalTime = QUESTION_TIME;

    document.getElementById('phase').textContent = 'Part No.' + phase;
    document.getElementById('instruction1').textContent = 'You play X, and please press corresponding cell' +
                        ' for what you think to be the best move to WIN against an OPTIMAL O opponent';
    document.getElementById('instruction2').textContent = 'You have ONE CHANCE for each question. ';

    test_boards = PHASE3_QUESTIONS;
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

function nextExample() {

    clearBoards();
    moveChosen = false;
    totalTime = QUESTION_TIME;
    removeChild('nextExampleButton', 'nextExample');
    answers.push([]);
    answers[currentExpl - 1].push(examples[currentExpl - 1]);
    showExample();

}

function showExample() {

    createBoard(examples[currentExpl - 1], 'initialBoard', 'initialState', 'Initial Board', [0], 'white',20);

    var initial = changeLabelsOnBoard(examples[currentExpl - 1]);
    var right = changeLabelsOnBoard(rightMoves[currentExpl - 1]);
    var wrong = changeLabelsOnBoard(wrongMoves[currentExpl - 1]);

    var rightIdx = initial.map((_, i) => initial[i] == right[i] ? -1 : i).filter(x => x != -1)[0];
    var wrongIdx = initial.map((_, i) => initial[i] == wrong[i] ? -1 : i).filter(x => x != -1)[0];

    if (Math.random() > 0.5) {
        createBoard(rightMoves[currentExpl - 1], 'rightMove', 'move1', '', [rightIdx], 'grey', 20);
        createBoard(wrongMoves[currentExpl - 1], 'wrongMove', 'move2', '', [wrongIdx], 'grey', 20);
        createButton('rightMoveButton', 'rightMoveComment', 'Choose this move', rightMoveChosen);
        createButton('wrongMoveButton', 'wrongMoveComment', 'Choose this move', wrongMoveChosen);
    } else {
        createBoard(wrongMoves[currentExpl - 1], 'wrongMove', 'move1', '', [wrongIdx], 'grey', 20);
        createBoard(rightMoves[currentExpl - 1], 'rightMove', 'move2', '', [rightIdx], 'grey', 20);
        createButton('wrongMoveButton', 'wrongMoveComment', 'Choose this move', wrongMoveChosen);
        createButton('rightMoveButton', 'rightMoveComment', 'Choose this move', rightMoveChosen);
    }
}

function showExpl() {

    timeTaken.push(Math.max(0, sec - 1));
    console.log(timeTaken);

    removeChild('wrongMoveButton', 'wrongMoveComment');
    removeChild('rightMoveButton', 'rightMoveComment');

    document.getElementById('wrongMoveComment').textContent = 'This is a wrong move';
    document.getElementById('rightMoveComment').textContent = 'This is a right move';

    var initial = changeLabelsOnBoard(examples[currentExpl - 1]);
    var right = changeLabelsOnBoard(rightMoves[currentExpl - 1]);
    var wrong = changeLabelsOnBoard(wrongMoves[currentExpl - 1]);

    var rightIdx = initial.map((_, i) => initial[i] == right[i] ? -1 : i).filter(x => x != -1)[0];
    var wrongIdx = initial.map((_, i) => initial[i] == wrong[i] ? -1 : i).filter(x => x != -1)[0];

    document.getElementById('wrongMove' + wrongIdx).style.backgroundColor = 'red';
    document.getElementById('rightMove' + rightIdx).style.backgroundColor = 'green';

    moveChosen = true;
    totalTime = EXPL_TIME;
    sec = 0;

    if (participantID % TOTAL_GROUP != 0) {

        var game = learnerPlayGame(inverseLabelsOnBoard(right));
        if (document.getElementById('rightMove').parentElement.id == 'move1') {
            showPosExamples(game, 'explExample1', rightIdx);
            showNegExamples(inverseLabelsOnBoard(wrong), 'explExample2', wrongIdx);
        } else {
            showNegExamples(inverseLabelsOnBoard(wrong), 'explExample1', wrongIdx);
            showPosExamples(game, 'explExample2', rightIdx);
        }
    }

}

function rightMoveChosen() {

    answers[currentExpl - 1].push(rightMoves[currentExpl - 1]);
    scores.push(10);
    showExpl();
    createButton('nextExampleButton', 'nextExample', 'Next', stopCount);

}

function wrongMoveChosen() {

    answers[currentExpl - 1].push(wrongMoves[currentExpl - 1]);
    scores.push(getMiniMaxScore(answers[currentExpl - 1][0], answers[currentExpl - 1][1], 1));
    showExpl();
    createButton('nextExampleButton', 'nextExample', 'Next', stopCount);

}


function createBoard(board, boardId, parentId, text, pos, color) {

  var td = document.createElement('td');
  td.setAttribute('id', boardId);
  td.align = 'center';

  if (board.length !== 0) {

      var newBoard = changeLabelsOnBoard(board);
      var table = document.createElement('table');
      table.setAttribute('border', 1);
      table.setAttribute('cellspacing', 0);
      table.classList.add('table2');
      var markerRow = Math.floor(pos / N_SIZE);
      var markerCol = pos % N_SIZE;

      for (var i = 0; i < N_SIZE; i++) {

          var row = document.createElement('tr');
          table.appendChild(row);

          for (var j = 0; j < N_SIZE; j++) {

              var cell = document.createElement('td');
              cell.setAttribute('id', boardId + (i * 3 + j));
              cell.setAttribute('height', 50);
              cell.setAttribute('width',  50);
              cell.setAttribute('align',  'center');
              cell.setAttribute('valign',  'center');

              if (i === markerRow && j === markerCol) {
                  cell.style.backgroundColor = color;
              } else {
                  cell.style.backgroundColor = 'white';
              }

              row.appendChild(cell);
              cell.innerHTML = newBoard[i * 3 + j] == 'e' ? EMPTY : newBoard[i * 3 + j];
          }
      }

      td.appendChild(table);

      var comment = document.createElement('div');
      comment.setAttribute('id', boardId+'Comment');
      comment.textContent = text;
      comment.classList.add('col');
      comment.align = 'center';

      td.appendChild(comment);
      document.getElementById(parentId).appendChild(td);
  }
}

function createBoard(board, boardId, parentId, text, positions, color, borderWidth) {

  var td = document.createElement('td');
  td.setAttribute('id', boardId);
  td.style.border = borderWidth + "px solid white";
  td.align = 'center';

  if (board.length !== 0) {

      var newBoard = changeLabelsOnBoard(board);
      var table = document.createElement('table');
      table.setAttribute('border', 1);
      table.setAttribute('cellspacing', 0);
      table.classList.add('table2');

      for (var i = 0; i < N_SIZE; i++) {

          var row = document.createElement('tr');
          table.appendChild(row);

          for (var j = 0; j < N_SIZE; j++) {

              var cell = document.createElement('td');
              cell.setAttribute('id', boardId + (i * 3 + j));
              cell.setAttribute('height', 45);
              cell.setAttribute('width',  45);
              cell.setAttribute('align',  'center');
              cell.setAttribute('valign',  'center');
              cell.style.backgroundColor = 'white';

              row.appendChild(cell);
              cell.innerHTML = newBoard[i * 3 + j] == 'e' ? EMPTY : newBoard[i * 3 + j];
          }
      }

      td.appendChild(table);

      var comment = document.createElement('div');
      comment.setAttribute('id', boardId+'Comment');
      comment.innerHTML = text;
      comment.classList.add('col');
      comment.align = 'center';

      td.appendChild(comment);
      document.getElementById(parentId).appendChild(td);
  }

  for (var i = 0; i < positions.length; i++) {
      document.getElementById(boardId+positions[i]).style.backgroundColor = color;
  }

}

function clearBoards() {
    removeChild('initialBoard', 'initialState');
    removeChild('rightMove', 'move1');
    removeChild('wrongMove', 'move1');
    removeChild('rightMove', 'move2');
    removeChild('wrongMove', 'move2');
    removeChild('posboard0', 'explExample1');
    removeChild('posboard1', 'explExample1');
    removeChild('posboard2', 'explExample1');
    removeChild('posboard3', 'explExample1');
    removeChild('negboard0', 'explExample1');
    removeChild('negboard1', 'explExample1');
    removeChild('negboard2', 'explExample1');
    removeChild('posboard0', 'explExample2');
    removeChild('posboard1', 'explExample2');
    removeChild('posboard2', 'explExample2');
    removeChild('posboard3', 'explExample2');
    removeChild('negboard0', 'explExample2');
    removeChild('negboard1', 'explExample2');
    removeChild('negboard2', 'explExample2');
}

function showPosExamples(game, parentId, pos){
    if (game[0].filter(x=>x==0).length == 6) {
        // Depth 3
        var strongPos = findPosStrongOption(game[0], 1).map(changeIndex);
        createBoard(game[0], 'posboard0', parentId, 'X moves + X should have 1 strong option',
                    strongPos , 'green', 17.5);
        createBoard(game[1], 'posboard1', parentId, 'O blocks X\'s strong option',
                    strongPos, 'grey', 5);
        createBoard(game[2], 'posboard2', parentId, 'X has 2 strong options + O has no strong option',
                    findPosStrongOption(game[2], 1).map(changeIndex), 'green', 5);

        var opponentPos = game[2].map((x,i) => x == 2 ? changeIndex(i) : -1).filter(x => x != -1);
        for (var i = 0; i < opponentPos.length; i++) {
            document.getElementById('posboard2' + opponentPos[i]).style.backgroundColor = 'grey';
        }

    }else if (game[0].filter(x=>x==0).length == 4) {
        // Depth 2
        createBoard(game[0], 'posboard0', parentId, 'X moves + X should have 2 strong options + ',
                    findPosStrongOption(game[0], 1).map(changeIndex), 'green', 17.5);
        createBoard(game[0], 'posboard1', parentId, 'O should have no strong option',
                    game[0].map((x,i) => x == 2 ? changeIndex(i) : -1).filter(x => x != -1),
                    'grey', 5);
    } else if (game[0].filter(x=>x==0).length == 2) {
        // Depth 1
        createBoard(game[0], 'posboard0', parentId, 'X moves + should have three pieces in a line',
                    winLine(game[0],1).map(changeIndex), 'green', 17.5);
    }
}

function showNegExamples(board, parentId, pos){

    if (board.filter(x=>x==0).length == 6) {
        var strong = findPosStrongOption(board, 1).map(changeIndex);
        createBoard(board, 'negboard0', parentId, EMPTY,
                    board.map((x,i) => x == 1 ? changeIndex(i) : -1).filter(x => x != -1).concat(strong),
                    'grey', 17.5);
        if (strong.length != 0) {
            var nextBoard = computeNextMove(board, 2);
            var opponentStrong = findPosStrongOption(nextBoard, 2).map(changeIndex);
            createBoard(nextBoard,'negboard1', parentId, EMPTY,
                            opponentStrong, 'red', 5);

            nextBoard = computeNextMove(nextBoard, 1);
            strong = findPosStrongOption(nextBoard, 1).map(changeIndex);
            createBoard(nextBoard,'negboard2', parentId, EMPTY,
                        strong, 'grey', 5);
        }

    } else if (board.filter(x=>x==0).length == 4) {
        createBoard(board, 'negboard0', parentId, EMPTY,
                    findPosStrongOption(board, 1).map(changeIndex), 'grey', 17.5);
        var opponentStrong = findPosStrongOption(board, 2).map(changeIndex);
        if(opponentStrong.length != 0) {
            createBoard(board,'negboard1', parentId, EMPTY,
                        opponentStrong, 'red', 5);
        }
    } else if (board.filter(x=>x==0).length == 2) {
        createBoard(board, 'negboard0', parentId, EMPTY,
        board.map((x,i) => x == 1 ? changeIndex(i) : -1).filter(x => x != -1), 'grey', 17.5);
    }
    document.getElementById('negboard0' + pos).style.backgroundColor = 'red';
}


document.getElementById('phase').textContent = 'Instruction: ';
document.getElementById('instruction1').textContent = 'In Part 1, you will answer ' + TOTAL_QUESTIONS + ' questions. '
                                                    + 'For each question, you are given a board and you will play X.'
document.getElementById('instruction2').textContent = 'And you should choose what you think to be the best move to WIN '
                                                    + 'against an OPTIMAL O opponent. You have ONE CHANCE for each question.';
createButton('nextPhaseButton', 'nextPhase', 'Continue', phase1);