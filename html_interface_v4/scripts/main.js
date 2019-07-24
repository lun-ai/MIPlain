var TOTAL_QUESTIONS = PHASE1_QUESTIONS.length,
    TOTAL_EXPL = examples.length,
    RESOLUTION_DEPTH = 50000,
    N_SIZE = 3,
    EMPTY = '&nbsp;',
    TIMER_SLICE = 200,
    PL_FILE_NAME = 'strategy',
    TURN = 'X',
    TOTAL_GROUP = 2,
    QUESTION_TIME = 60 * 60 * 24,
    EXPL_TIME = 120;

var t,
    phase = 1,
    th = 1.2,
    S = 0,
    sec = 0,
    boxes = [],
    totalTime = QUESTION_TIME,
    currentQuestion = 0,
    prevBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0],
    emptyBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0],
    boardToPlay = emptyBoard,
    test_boards = PHASE1_QUESTIONS,
    difficulty = [],
    moveChosen = false,
    currentExpl = 0,
    ended = false,
    timeTakenExpl = [],
    answers = [],
    scores = [],
    timeTaken = [],
    record = '';

var texts = String(window.location).split('=');
// uncomment for deployment
//var participantID = (new Date).getTime();

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
        if(phase == 2 && sec == totalTime - 10) {
            if (currentExpl == TOTAL_EXPL) {
                document.getElementById("timer").textContent = 'Will move onto the next part in 10 secs';
            } else {
                document.getElementById("timer").textContent = 'Will move onto the next example in 10 secs';
            }
        }
        sec += 0.2;
        t = setTimeout(startCount, TIMER_SLICE);
    }
}

function stopCountPhase0() {
    removeChild('nextPhaseButton', 'nextPhase');
    removeChild('gameBoard', 'game');
    boxes = [];

    if (ended) {
            // finished game
        removeChild('gameBoard', 'game');
        createButton('nextPhaseButton', 'nextPhase', 'Continue', prephase1);
    }     
    else {
            // unfinished game
        document.getElementById('instruction1').textContent = 'Select one territory to capture resources.';
        document.getElementById('phase').textContent = '';
        document.getElementById('instruction2').textContent = '';

        boardToPlay = changeLabelsOnBoard(boardToPlay);
        var board = document.createElement('div');
        document.getElementById('game').appendChild(board);
        board.setAttribute('id', 'gameBoard');
        board.style.position = 'absolute';
        board.style.left = '20%';
        board.style.height = '60%';
        board.style.width = '60%';

        for (var i = 0; i < N_SIZE; i++) {

            var island = document.createElement('div');
            board.appendChild(island);
            island.setAttribute('id', 'island');
            island.style.height = '30%';
            island.style.width = '25%';
            island.style.position = 'absolute';

            if (i === 0) {
                island.style.top = '10%';
                island.style.left = '20%';
            } else if (i == 1) {
                island.style.top = '10%';
                island.style.right = '20%';
            } else {
                island.style.top = '50%';
                island.style.left = '37.5%';
            }

            var cell1 = createIsland(boardToPlay[i * 3], ISLAND_ATTR[i * 3]);
            island.appendChild(cell1);
            cell1.style.top = '0%';
            cell1.style.left = '0%';
            cell1.addEventListener('click', boardClickedgame);
            var cell2 = createIsland(boardToPlay[i * 3 + 1], ISLAND_ATTR[i * 3 + 1]);
            island.appendChild(cell2);
            cell2.style.top = '0%';
            cell2.style.right = '0%';
            cell2.addEventListener('click', boardClickedgame);
            var cell3 = createIsland(boardToPlay[i * 3 + 2], ISLAND_ATTR[i * 3 + 2]);
            island.appendChild(cell3);
            cell3.style.bottom = '0%';
            cell3.style.left = '25%';
            cell3.addEventListener('click', boardClickedgame);


            var islandTag = document.createElement('div');
            islandTag.classList.add('islandTag');
            island.appendChild(islandTag);
            islandTag.style.height = '20%';
            islandTag.style.width = '30%';
            islandTag.style.top = '40%';
            islandTag.style.left = '35%';
            islandTag.style.backgroundColor = DEFAULT_C;
            islandTag.innerHTML = 'Island ' + (i + 1);

            boxes.push(cell1);
            boxes.push(cell2);
            boxes.push(cell3);
        }
    
    }

}

function stopCountPhase1() {

    if (t != null) {
        clearTimeout(t);
        sec = 0;
    }

    currentQuestion += 1;
    
    
   if (currentQuestion > TOTAL_QUESTIONS) {
        
	    removeChild('nextQuestionButton', 'nextQuestion');
        document.getElementById('phase').textContent = 'Well done for completing Part 1!';
        document.getElementById('timer').textContent = '';

		document.getElementById('instruction1').textContent =
                	'In Part 2, examples are given by the Great Wizard'
                	+ ' and you need choose between two potential moves for what '
               		 + 'you think to be the best move to WIN the Great Wizard.';
		document.getElementById('instruction1').textContent = '';
        document.getElementById('instruction2').textContent =
          	          'The Great Wizard tells you which one is the right move and which is not.';
        document.getElementById('Great_Wizard_intro').style.display = 'block';

        if (participantID % TOTAL_GROUP == 0) {
            document.getElementById('instruction3').textContent =
                	    'Then, you are given 2 minutes to think about your choice.'
       	} else {
            document.getElementById('instruction3').textContent =
               		 'Then, you are given 2 minutes to study the explanation from MIGO.'
            document.getElementById('MIGO_intro').style.display = 'block';
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
            timeTakenExpl.push(Math.round(Math.max(0, sec - 1) * 100) / 100);
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
        document.getElementById('phase').textContent = 'Well done for completing Part 2!';
        document.getElementById('instruction1').textContent = 'In Part 3, you will answer ' + TOTAL_QUESTIONS + ' questions. '
                                                    + 'For each question, you are given a board and you will play X.'
        document.getElementById('instruction2').textContent = 'And you should choose what you think to be the best move to WIN.'
                                                    + ' You have ONE CHANCE for each question.';
        document.getElementById('instruction3').textContent = '';
        createButton('nextPhaseButton', 'nextPhase', 'Continue', phase3);

    } else {
        document.getElementById('timer').textContent = '';
        nextExample();
        startCount();
    }

}

function stopCountPhase3() {

    if (t != null) {
        clearTimeout(t);
        sec = 0;
    }

    currentQuestion += 1;

    if (currentQuestion > TOTAL_QUESTIONS) {
        removeChild('nextQuestionButton', 'nextQuestion');
        removeChild('nextExampleButton', 'nextExample');
        removeChild('gameBoard', 'game');
        removeChild('nextPhaseButton', 'nextPhase');
        document.getElementById('phase').textContent =
                'Well done for completing Part 3!'
        document.getElementById('timer').textContent = '';
        document.getElementById('instruction1').textContent = 'Please now complete the following short survey';
        document.getElementById('instruction2').textContent = '';
        document.getElementById('instruction3').textContent = '';
        document.getElementById('numQuestion').textContent = '';

	 record += '\n\nPart 3: \n'
        + answers.map(g => '[[' + g.join('],[') + ']]\n')
        + 'difficulty: [' + difficulty + ']\n'
        + 'scores: [' + scores + ']\n'
        + 'time: [' + timeTaken + ']\n';
        createButton('nextPhaseButton', 'nextPhase', 'Continue', phase4);

    } else {
        nextQuestion();
        startCount();
    }

}

function boardClickedgame() {

    if (this.style.backgroundColor !== WHITE) {
        return;
    }  else if (!ended) {
        this.style.backgroundColor = P1_COLOR;

        var currentBoard = convertBoxesTOBoard(boxes);
        
        if(win(currentBoard,1)) {
            ended = true;
            document.getElementById('instruction1').textContent = 'You have won the game!';
            stopCount();

        } else if (currentBoard.filter(x => x === 0).length === 0) {
            ended = true;
            document.getElementById('instruction1').textContent = 'The game is drawn.';
            stopCount();
        } else {
           // var board2 = computeNextMove(currentBoard, 2);
           var board2 = randomMove(currentBoard,2);
            if (win(board2, 2)) {
                ended = true;
                document.getElementById('instruction1').textContent = 'You have lost the game!';
                stopCount();
            } else {
            boardToPlay = board2;
            stopCount();

            }

        }
}
}


function boardClicked() {

    if (this.style.backgroundColor !== WHITE) {
        return;
    } else if (!ended) {

        this.style.backgroundColor = P1_COLOR;
        ended = true;

        var currentBoard = convertBoxesTOBoard(boxes);
        console.log(currentBoard);
        answers[currentQuestion - 1].push(currentBoard);

        scores.push(getMiniMaxScore(prevBoard, currentBoard, 1));
        timeTaken.push(Math.round(Math.max(0, sec - 1) * 100) / 100);
        console.log(timeTaken);
        console.log(scores);

        createButton('nextQuestionButton', 'gameBoard', 'Next Question', stopCount);
        var button = document.getElementById('nextQuestionButton');
        button.style.position = 'absolute';
        button.style.height = '10%';
        button.style.width = '10%';
        button.style.bottom = '0%';
        button.style.left = '45%';
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

    var board = document.createElement('div');
    document.getElementById('game').appendChild(board);
    board.setAttribute('id', 'gameBoard');
    board.style.position = 'absolute';
    board.style.left = '20%';
    board.style.height = '60%';
    board.style.width = '60%';

    for (var i = 0; i < N_SIZE; i++) {

        var island = document.createElement('div');
        board.appendChild(island);
        island.style.height = '30%';
        island.style.width = '25%';
        island.style.position = 'absolute';

        if (i === 0) {
            island.style.top = '10%';
            island.style.left = '20%';
        } else if (i == 1) {
            island.style.top = '10%';
            island.style.right = '20%';
        } else {
            island.style.top = '50%';
            island.style.left = '37.5%';
        }

        var cell1 = createIsland(rightIndexAndLabel[i * 3], ISLAND_ATTR[i * 3]);
        island.appendChild(cell1);
        cell1.style.top = '0%';
        cell1.style.left = '0%';
        cell1.addEventListener('click', boardClicked);
        var cell2 = createIsland(rightIndexAndLabel[i * 3 + 1], ISLAND_ATTR[i * 3 + 1]);
        island.appendChild(cell2);
        cell2.style.top = '0%';
        cell2.style.right = '0%';
        cell2.addEventListener('click', boardClicked);
        var cell3 = createIsland(rightIndexAndLabel[i * 3 + 2], ISLAND_ATTR[i * 3 + 2]);
        island.appendChild(cell3);
        cell3.style.bottom = '0%';
        cell3.style.left = '25%';
        cell3.addEventListener('click', boardClicked);


        var islandTag = document.createElement('div');
        islandTag.classList.add('islandTag');
        island.appendChild(islandTag);
        islandTag.style.height = '20%';
        islandTag.style.width = '30%';
        islandTag.style.top = '40%';
        islandTag.style.left = '35%';
        islandTag.style.backgroundColor = DEFAULT_C;
        islandTag.innerHTML = 'Island ' + (i + 1);

        boxes.push(cell1);
        boxes.push(cell2);
        boxes.push(cell3);
    }

}

function endExpr() {

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(record));
    element.setAttribute('download', participantID + '#' + formattedDate() + '.txt');

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    window.location.href = 'record.php';
}

function phase0() {

    removeChild('nextPhaseButton', 'nextPhase');

    phase = 0;
    document.getElementById('phase').textContent = 'Phase No.' + phase;
    document.getElementById('instruction1').textContent = "You will first play a training game to get familiar with the rules of the game. Your opponent plays randomly."
    document.getElementById('instruction2').textContent = 'You play Green. For every move, press the cell you want to select. ' + 
                        'You have only one shot for each of your move.'
    totalTime = QUESTION_TIME;

    createButton('nextPhaseButton', 'nextPhase', 'Play', stopCount);
}

function prephase1() {

    document.getElementById('phase').textContent = '';
    document.getElementById('instruction1').innerHTML = 'From now on, you will play against another opponent, which is an OPTIMAL player, in Part 1.'
    document.getElementById('instruction2').innerHTML = 'And you should choose what you think to be the best move to WIN.'
                                                    + ' You have ONE CHANCE for each question and try your best.';
    createButton('nextPhaseButton', 'nextPhase', 'Next', phase1);

}

function phase1() {

    removeChild('nextPhaseButton', 'nextPhase');

    phase = 1;
    totalTime = QUESTION_TIME;

    document.getElementById('phase').textContent = 'Part ' + phase;
    document.getElementById('instruction1').innerHTML = 'You play <span style="background-color: '
                        + P1_COLOR + '">Green</span>, '
                        + 'and please press a WHITE cell' +
                        ' to acquire resources that you think can lead to WIN';
    document.getElementById('instruction2').innerHTML = 'You have ONE CHANCE for each question.';
    stopCount();
}

function phase2() {

    removeChild('nextPhaseButton', 'nextPhase');
    removeChild('gameBoard', 'game');

    record += '\n\nPart 1: \n'
        + answers.map(g => '[[' + g.join('],[') + ']]\n')
        + 'difficulty: [' + difficulty + ']\n'
        + 'scores: [' + scores + ']\n'
        + 'time: [' + timeTaken + ']\n';

    console.log(record);

    flushLocalCache();
	
    phase = 2
	
    totalTime = QUESTION_TIME;

    document.getElementById('explanation').style.display = 'block';
    document.getElementById('MIGO_intro').style.display = 'none';
    document.getElementById('Great_Wizard_intro').style.display = 'none';

    document.getElementById('phase').textContent = 'Part ' + phase;
	
    document.getElementById('instruction1').innerHTML = 'You play <span style="background-color: '
                        + P1_COLOR + '">Green</span>, and opponent plays <span style="background-color: '
                        + P2_COLOR + '">Orange</span>. '
    document.getElementById('instruction2').innerHTML = 'Given an initial board, choose between two potential moves '
                        + 'highlighted in <span style="background-color: yellow">Yellow</span>, '
                        + 'for WINNING.'
    document.getElementById('instruction3').innerHTML =
                    'The Great Wizard then tells you which one is the right move and which is not. ';

    if (participantID % TOTAL_GROUP == 0) {
        document.getElementById('instruction3').textContent +=
                    'You are given time to think about your choice.';
        document.getElementById('feedbackPanel').style.display = 'none';
    } else {
        document.getElementById('instruction3').textContent +=
                    'You are given time to study the comments from MIGO AI.'
    }

    stopCount();
}

function phase3() {

    removeChild('nextPhaseButton', 'nextPhase');

    record += '\n\nPart 2: \n'
        + answers.map(g => '[[' + g.join('],[') + ']]\n')
        + 'scores: [' + scores + ']\n'
        + 'time: [' + timeTaken + ']\n'
        + 'time on expl: [' + timeTakenExpl + ']\n';

    console.log(record);

    flushLocalCache();

    phase = 3,
    totalTime = QUESTION_TIME;

    document.getElementById('phase').textContent = 'Part ' + phase;
    document.getElementById('instruction1').innerHTML = 'You play <span style="background-color: '
                        + P1_COLOR + '">Green</span>, '
                        + 'and please press a WHITE cell' +
                        ' to acquire resources that you think can lead to WIN';
    document.getElementById('instruction2').innerHTML = 'You have ONE CHANCE for each question. ';

    test_boards = PHASE3_QUESTIONS;
    stopCount();
}

function phase4() {

    console.log(record);
    flushLocalCache();

    phase = 4;
    var u;
    if (S > th) {
	u = 2;
    } else {u = 4;
    }

    // localStorage.setItem("expResult", record);
    var element = document.getElementById("postrecord");
    element.value = record
    document.getElementById('phase').textContent = 'Part ' + u;
    removeChild('nextPhaseButton', 'nextPhase');
    document.getElementById('genderform').style.display = 'block';
    document.getElementById('participantid').value = participantID

	//localStorage.setItem("participantID"; participantID);
   // record += '\n\nPart 4: \n'
    //    + answers.map(g => '[[' + g.join('],[') + ']]\n')
     //   + 'scores: [' + scores + ']\n'
      //  + 'time: [' + timeTaken + ']\n'
      //  + 'time on expl: [' + timeTakenExpl + ']\n';

}

function checkform() {
    if (!document.genderform.gender[0].checked && !document.genderform.gender[1].checked && !document.genderform.gender[2].checked) {
	// no radio button is selected
	return false;
    } else {
    return true;
    }
}

function stopCount() {
    if (phase == 0) {
        stopCountPhase0();
    } else if (phase == 1) {
        stopCountPhase1();
    } else if (phase == 2) {
        stopCountPhase2();
    } else if (phase == 3) {
        stopCountPhase3();
    } else if (phase == 4) {
        stopCountPhase4();
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

    createBoard(examples[currentExpl - 1], 'initialBoard', 'initialState', 'Initial Board', [], WHITE,10);
    removeChild('rightMove','move1');
    removeChild('rightMove','move1');

    var initial = changeLabelsOnBoard(examples[currentExpl - 1]);
    var right = changeLabelsOnBoard(rightMoves[currentExpl - 1]);
    var wrong = changeLabelsOnBoard(wrongMoves[currentExpl - 1]);

    var rightIdx = initial.map((_, i) => initial[i] == right[i] ? -1 : i).filter(x => x != -1)[0];
    var wrongIdx = initial.map((_, i) => initial[i] == wrong[i] ? -1 : i).filter(x => x != -1)[0];

    if (Math.random() > 0.5) {
        var text1 = createParitalBoard(examples[currentExpl - 1], rightMoves[currentExpl - 1], 'rightMove', 'move1');
        var text2 = createParitalBoard(examples[currentExpl - 1], wrongMoves[currentExpl - 1], 'wrongMove', 'move2');
        createButton('rightMoveButton', 'rightMoveComment', text1, rightMoveChosen);
        createButton('wrongMoveButton', 'wrongMoveComment', text2, wrongMoveChosen);
    } else {
        var text1 = createParitalBoard(examples[currentExpl - 1], wrongMoves[currentExpl - 1], 'wrongMove', 'move1');
        var text2 = createParitalBoard(examples[currentExpl - 1], rightMoves[currentExpl - 1], 'rightMove', 'move2');
        createButton('wrongMoveButton', 'wrongMoveComment', text1, wrongMoveChosen);
        createButton('rightMoveButton', 'rightMoveComment', text2, rightMoveChosen);
    }

    document.getElementById("rightMove"+rightIdx).innerHTML = formatHTMLText('<span style="background-color: yellow">'
                        + ISLAND_ATTR[rightIdx] + '</span>');
    document.getElementById("wrongMove"+wrongIdx).innerHTML = formatHTMLText('<span style="background-color: yellow">'
                        + ISLAND_ATTR[wrongIdx] + '</span>');
}

function showExpl() {

    timeTaken.push(Math.round(Math.max(0, sec - 1) * 100) / 100);
    console.log(timeTaken);

    removeChild('wrongMoveButton', 'wrongMoveComment');
    removeChild('rightMoveButton', 'rightMoveComment');

    document.getElementById('wrongMoveComment').innerHTML = '<span style="color: red">This is a wrong move</span>';
    document.getElementById('rightMoveComment').innerHTML = '<span style="color: green">This is a right move</span>';

    var initial = changeLabelsOnBoard(examples[currentExpl - 1]);
    var right = changeLabelsOnBoard(rightMoves[currentExpl - 1]);
    var wrong = changeLabelsOnBoard(wrongMoves[currentExpl - 1]);

    var rightIdx = initial.map((_, i) => initial[i] == right[i] ? -1 : i).filter(x => x != -1)[0];
    var wrongIdx = initial.map((_, i) => initial[i] == wrong[i] ? -1 : i).filter(x => x != -1)[0];

//    document.getElementById('wrongMove' + wrongIdx).style.color = 'red';
//    document.getElementById('rightMove' + rightIdx).style.color = 'green';

    moveChosen = true;
    totalTime = EXPL_TIME;
    sec = 0;

    if (participantID % TOTAL_GROUP != 0) {

        var game = learnerPlayGame(inverseLabelsOnBoard(right));
        if (document.getElementById('rightMove').parentElement.id == 'move1') {
            showPosExamples(game, 'explExample1', rightIdx);
            showNegExamples(inverseLabelsOnBoard(wrong), 'explExample2', wrongIdx);
        } else {
            showPosExamples(game, 'explExample2', rightIdx);
            showNegExamples(inverseLabelsOnBoard(wrong), 'explExample1', wrongIdx);
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

function createParitalBoard(originalBoard, board, boardId, parentId) {

    var div = document.createElement('div');
    div.setAttribute('id', boardId);
    div.style.position = 'relative';
    div.style.height = '250px';
    document.getElementById(parentId).appendChild(div);

    if (board.length !== 0) {

        var original = changeLabelsOnBoard(originalBoard);
        var newBoard = changeLabelsOnBoard(board);

        var diffIdx = original.map((_,i) => original[i] === newBoard[i] ? -1 : i).filter(x => x !== -1)[0];
        var islandNum = Math.floor(diffIdx / N_SIZE);

        var island = document.createElement('div');
        island.setAttribute('id', boardId + 'Island');
        div.appendChild(island);
        island.style.height = '30%';
        island.style.width = '40%';
        island.style.position = 'absolute';
        island.style.top = '20%';
        island.style.left = '30%';

        var cell1 = createIsland(newBoard[islandNum * 3], ISLAND_ATTR[islandNum * 3]);
        cell1.style.top = '0%';
        cell1.style.left = '0%';
        cell1.style.fontSize = '10px';
        cell1.setAttribute('id', boardId + (islandNum * 3));
        var cell2 = createIsland(newBoard[islandNum * 3 + 1], ISLAND_ATTR[islandNum * 3 + 1]);
        cell2.style.top = '0%';
        cell2.style.right = '0%';
        cell2.style.fontSize = '10px';
        cell2.setAttribute('id', boardId + (islandNum * 3 + 1));
        var cell3 = createIsland(newBoard[islandNum * 3 + 2], ISLAND_ATTR[islandNum * 3 + 2]);
        cell3.style.bottom = '0%';
        cell3.style.left = '25%';
        cell3.style.fontSize = '10px';
        cell3.setAttribute('id', boardId + (islandNum * 3 + 2));
        island.appendChild(cell3);
        island.appendChild(cell2);
        island.appendChild(cell1);

        var islandTag = document.createElement('div');
        islandTag.classList.add('islandTag');
        island.appendChild(islandTag);
        islandTag.style.height = '20%';
        islandTag.style.width = '30%';
        islandTag.style.top = '40%';
        islandTag.style.left = '35%';
        islandTag.style.fontSize = '10px';
        islandTag.style.backgroundColor = DEFAULT_C;
        islandTag.innerHTML = 'Island ' + (islandNum + 1);

        var comment = document.createElement('div');
        div.appendChild(comment);
        comment.style.position = 'absolute';
        comment.style.bottom = '30%';
        comment.style.width = '100%';
        comment.setAttribute('id', boardId+'Comment');
        comment.align = 'center';
        comment.style.fontSize = 'small';
        comment.style.whiteSpace = 'pre-wrap';

        return 'Take (' + ISLAND_ATTR[islandNum * 3 + (diffIdx % 3)] + ') on Island '+ (islandNum + 1);
    }
}

function createBoard2(board, parentId, text) {
    createBoardExpl(board, 'board1', parentId, text, 'black');
}

function createBoard_withtriplet(board, id, parentId, text, player) {
    createBoardExpl(board, id, parentId, text, 'black');
    if (player == 1){
        highlightAttr(id, [winLine(board,player)], 'green', 'x');
    } else {
        highlightAttr(id, [winLine(board,player)], 'yellow', 'o');
    }
}

function createBoard_withstrong(board, id, parentId, text, player) {
    createBoardExpl(board, id, parentId, text, 'black');
    var strong = findPosStrongOption(board, player);
    if (player == 1){
        highlightAttr(id, strong, 'green', 'x');
    } else {
        highlightAttr(id, strong, 'yellow', 'o');
    }
}

function createBoardExpl(board, boardId, parentId, text, color) {

    var div = document.createElement('div');
    div.setAttribute('id', boardId);
    div.classList.add('column3');
    div.style.position = 'relative';
    div.style.height = '250px';
    var frame = document.createElement('div');
    div.appendChild(frame);
    frame.style.position = 'absolute';
    frame.style.height = '68%';
    frame.style.width = '100%';
    frame.style.border = '1px solid black';
    frame.style.top = '5%';
    frame.style.backgroundColor = "transparent";

    document.getElementById(parentId).appendChild(div);  
    if (board.length !== 0) {
        var newBoard = changeLabelsOnBoard(board);

        for (var i = 0; i < 3; i++) {

            var island = document.createElement('div');
            var islandID = boardId + 'Island' + (i + 1);
            island.setAttribute('id', islandID);
            div.appendChild(island);
            island.style.height = '25%';
            island.style.width = '46%';
            island.style.position = 'absolute';

            if (i === 0) {
                island.style.top = '10%';
                island.style.left = '3%';
            } else if (i == 1) {
                island.style.top = '10%';
                island.style.right = '2%';
            } else {
                island.style.top = '40%';
                island.style.left = '27.5%';
            }
            var cell1 = createIsland(newBoard[i * 3], ISLAND_ATTR[i * 3]);
            cell1.style.top = '0%';
            cell1.style.left = '0%';
            cell1.style.fontSize = '8px';
            cell1.setAttribute('id', islandID + 'Cell1');
            cell1.innerHTML = '<p>'
                            + ISLAND_ATTR[i * 3]
                                .split(', ')
                                .map(a => '<span id="' + islandID + ISLAND_ATTR_MAP[a]
                                                       + newBoard[i * 3]
                                                       + '">' + a + '</span>')
                                .join(', ')
                            + '</p>';

            var cell2 = createIsland(newBoard[i * 3 + 1], ISLAND_ATTR[i * 3 + 1]);
            cell2.style.top = '0%';
            cell2.style.right = '0%';
            cell2.style.fontSize = '8px';
            cell2.setAttribute('id', islandID + 'Cell2');
            cell2.innerHTML = '<p>'
                            + ISLAND_ATTR[i * 3 + 1]
                                .split(', ')
                                .map(a => '<span id="' + islandID + ISLAND_ATTR_MAP[a]
                                                       + newBoard[i * 3 + 1]
                                                       + '">' + a + '</span>')
                                .join(', ')
                            + '</p>';

            var cell3 = createIsland(newBoard[i * 3 + 2], ISLAND_ATTR[i * 3 + 2]);
            cell3.style.bottom = '0%';
            cell3.style.left = '25%';
            cell3.style.fontSize = '8px';
            cell3.setAttribute('id', islandID + 'Cell3');
            cell3.innerHTML = '<p>'
                            + ISLAND_ATTR[i * 3 + 2]
                                .split(', ')
                                .map(a => '<span id="' + islandID + ISLAND_ATTR_MAP[a]
                                                       + newBoard[i * 3 + 2]
                                                       + '">' + a + '</span>')
                                .join(', ')
                            + '</p>';

            island.appendChild(cell3);
            island.appendChild(cell2);
            island.appendChild(cell1);

            var islandTag = document.createElement('div');
            islandTag.classList.add('islandTag');
            island.appendChild(islandTag);
            islandTag.style.height = '18%';
            islandTag.style.width = '30%';
            islandTag.style.top = '40%';
            islandTag.style.left = '35%';
            islandTag.style.fontSize = '8px';
            islandTag.style.backgroundColor = DEFAULT_C;
            islandTag.innerHTML = 'Island ' + (i + 1);

        }

        var comment = document.createElement('div');
        div.appendChild(comment);
        comment.style.position = 'absolute';
        comment.style.top = '75%';
        comment.style.width = '100%';
        comment.setAttribute('id', boardId+'Comment');
        comment.align = 'center';
        comment.style.fontSize = 'small';
        comment.style.whiteSpace = 'pre-wrap';
        comment.innerHTML = '<span style="color: ' + color + '">'
                        + text + '</span>';
    }

    var button = createButton(boardId + 'p1CountTableButton', boardId, 'Board', function() {p1CountTable(boardId, board);});
    button.style.position = 'absolute';
    button.style.top = '65%';
    button.style.right = '0%';
}


function createBoard(board, boardId, parentId, text, positions, color, borderWidth) {

    var div = document.createElement('div');
    div.setAttribute('id', boardId);
    div.style.position = 'relative';
    div.style.height = '300px';
    div.style.border = '1px solid black';
    document.getElementById(parentId).appendChild(div);

    if (board.length !== 0) {

        var newBoard = changeLabelsOnBoard(board);

        for (var i = 0; i < N_SIZE; i++) {

            var island = document.createElement('div');
            island.setAttribute('id', boardId + 'Island' + (i + 1));
            div.appendChild(island);
            island.style.height = '25%';
            island.style.width = '40%';
            island.style.position = 'absolute';

            if (i === 0) {
                island.style.top = '20%';
                island.style.left = '5%';
            } else if (i == 1) {
                island.style.top = '20%';
                island.style.right = '5%';
            } else {
                island.style.top = '60%';
                island.style.left = '30%';
            }

            var cell1 = createIsland(newBoard[i * 3], ISLAND_ATTR[i * 3]);
            cell1.style.top = '0%';
            cell1.style.left = '0%';
            cell1.style.fontSize = '10px';
            var cell2 = createIsland(newBoard[i * 3 + 1], ISLAND_ATTR[i * 3 + 1]);
            cell2.style.top = '0%';
            cell2.style.right = '0%';
            cell2.style.fontSize = '10px';
            var cell3 = createIsland(newBoard[i * 3 + 2], ISLAND_ATTR[i * 3 + 2]);
            cell3.style.bottom = '0%';
            cell3.style.left = '25%';
            cell3.style.fontSize = '10px';
            island.appendChild(cell3);
            island.appendChild(cell2);
            island.appendChild(cell1);


            var islandTag = document.createElement('div');
            islandTag.classList.add('islandTag');
            island.appendChild(islandTag);
            islandTag.style.height = '20%';
            islandTag.style.width = '30%';
            islandTag.style.top = '40%';
            islandTag.style.left = '35%';
            islandTag.style.fontSize = '10px';
            islandTag.style.backgroundColor = DEFAULT_C;
            islandTag.innerHTML = 'Island ' + (i + 1);

        }
    }
}

function createIsland(elem, text) {
    var cell = document.createElement('div');
    cell.classList.add('islandCell');
    cell.style.height = '48.2%';
    cell.style.width = '49%';

    cell.innerHTML = formatHTMLText(text);
    cell.style.backgroundColor = elem === 'e' ?
                                 WHITE :
                                 elem === 'x' ?
                                 P1_COLOR :
                                 P2_COLOR;
    return cell;
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
    if (game[0].filter(x => x === 0).length === 6) {
        // Depth 3
        var strong1 = findPosStrongOption(game[0], 1);
        var strong2 = findPosStrongOption(game[2], 1);

        createBoardExpl(game[0], 'posboard0', parentId, 'You should move and obtain 1 pair (' + strong1 + ')', TEXT_GREEN);
        createBoardExpl(game[1], 'posboard1', parentId, 'Opponent would block (' + strong1 + ')', TEXT_GREEN);
        createBoardExpl(game[2], 'posboard2', parentId, 'You obtain 2 pairs of "'
                                                        + findPosStrongOption(game[2], 1)
                                                        + '" and opponent should have no pair', TEXT_GREEN);

        highlightAttr('posboard0', strong1, GREEN, 'x');
        highlightAttr('posboard1', strong1, GREEN, 'x');
        highlightIslandCell('posboard1', game[1]
                                         .map((x,i) => x !== game[0][i] ? changeIndex(i) : -1)
                                         .filter(x => x !== -1)[0],
                            'yellow', 'o');
        highlightAttr('posboard2',
                      [...new Set(game[0]
                                  .map((x,i) => x === 2 ? ISLAND_ATTR[changeIndex(i)] : -1)
                                  .filter(x => x !== -1)
                                  .join(', ')
                                  .split(', '))],
                      'yellow', 'o');
        highlightAttr('posboard2', strong2, GREEN, 'x');

    } else if (game[0].filter(x => x === 0).length === 4) {
        // Depth 2
        var strong = findPosStrongOption(game[0], 1);
	    createBoardExpl(game[0], 'posboard0', parentId, 'You should move and obtain 2 pairs (' + strong + ')', TEXT_GREEN);
        createBoardExpl(game[0], 'posboard1', parentId, 'Opponent should have no pair', TEXT_GREEN);
        highlightAttr('posboard0', strong, GREEN, 'x');
        highlightAttr('posboard1',
                      [...new Set(game[0]
                                  .map((x,i) => x === 2 ? ISLAND_ATTR[changeIndex(i)] : -1)
                                  .filter(x => x !== -1)
                                  .join(', ')
                                  .split(', '))],
                      'yellow', 'o');

    } else if (game[0].filter(x => x === 0).length === 2) {
        // Depth 1
        createBoardExpl(game[0], 'posboard0', parentId, 'You should move and obtain 1 triplet (' + winLine(game[0],1) + ')', TEXT_GREEN);
        highlightAttr('posboard0', [winLine(game[0],1)], GREEN, 'x');
    }
}

function showNegExamples(board, parentId, pos){
    if (board.filter(x => x === 0).length === 6) {
        // depth 3
        var strong1 = findPosStrongOption(board, 1);
        var strong2, newBoard;

       	if (strong1.length === 0 ) {
	 	    createBoardExpl(board, 'negboard0', parentId, 'Contrast: Not enough pair(s)', TEXT_RED);
	    } else {
	        createBoardExpl(board, 'negboard0', parentId, EMPTY, TEXT_RED);
	    }

        nextBoard = computeNextMove(board, 2);
	    createBoardExpl(nextBoard,'negboard1', parentId, EMPTY, TEXT_RED);
	    highlightIslandCell('negboard1', nextBoard
                                         .map((x,i) => x !== board[i] ? changeIndex(i) : -1)
                                         .filter(x => x !== -1)[0],
                            'yellow', 'o');
	    nextBoard = computeNextMove(nextBoard, 1);
        strong2 = findPosStrongOption(nextBoard, 1);

        if (strong2.length !== 2) {
            createBoardExpl(nextBoard,'negboard2', parentId, 'Contrast: Not enough pair(s)', TEXT_RED);
            highlightAttr('negboard2', strong2, GREEN, 'x');
		}  else {
		    createBoardExpl(nextBoard,'negboard2', parentId, 'Contrast: opponent has 1 pair', TEXT_RED);
            highlightAttr('negboard2',
                          [...new Set(nextBoard
                                      .map((x,i) => x === 2 ? ISLAND_ATTR[changeIndex(i)] : -1)
                                      .filter(x => x !== -1)
                                      .join(', ')
                                      .split(', '))],
                          'yellow', 'o');
		}

	    highlightAttr('negboard0', strong1, GREEN, 'x');

    } else if (board.filter(x => x === 0).length === 4) {
        // depth 2
        var strong = findPosStrongOption(board, 1);
        if (strong.length !== 2) {
            createBoardExpl(board, 'negboard0', parentId, 'Contrast: Not enough pair(s)', TEXT_RED);
        } else {
            createBoardExpl(board, 'negboard0', parentId, EMPTY, TEXT_RED);
        }
        highlightAttr('negboard0', strong, 'yellow', 'x');

        var opponentStrong = findPosStrongOption(board, 2);
        if (opponentStrong.length === 0) {
		    createBoardExpl(board, 'negboard1', parentId, EMPTY, TEXT_RED);
		    highlightAttr('negboard1', ATTR, 'yellow', 'o');
		} else {
	        createBoardExpl(board, 'negboard1', parentId, 'Contrast: opponent has 1 pair', TEXT_RED);
	        highlightAttr('negboard1', opponentStrong, 'yellow', 'o');
		}

	} else if (board.filter(x => x === 0).length === 2) {
	    // depth 1
        createBoardExpl(board, 'negboard0', parentId, 'Contrast: No triplet', TEXT_RED);
        highlightAttr('negboard0', ATTR, 'yellow', 'x');
    }
}

function p1CountTable(parentId, board) {

    var attr = ['Island1', 'Island2', 'Island3', 'Animal', 'Castle', 'Cornfield', 'Forest', 'River'];
    var parent = document.getElementById(parentId);

    document.getElementById(parentId + 'Island1').style.display = 'none';
    document.getElementById(parentId + 'Island2').style.display = 'none';
    document.getElementById(parentId + 'Island3').style.display = 'none';

    var table = document.getElementById(parentId + 'p1CountTable');

    if (table === null) {

        var div = document.createElement('div');
        parent.appendChild(div);
        div.style.position = 'absolute';
        div.style.width = '60%';
        div.style.height = '60%';
        div.style.top = '20%';
        div.style.left = '20%';
        table = document.createElement('table');
        table.classList.add('table4');
        table.setAttribute('id', parentId + 'p1CountTable');
        div.appendChild(table);

        var count = countAttrs(board, 1);

        for (var i = 0; i < 4; i++) {

            var row = document.createElement('tr');
            table.appendChild(row);

            for (var j = 0; j < 4; j++) {

                var cell = document.createElement('td');
                row.appendChild(cell);
                cell.style.align = 'center';

                if ((i * 4 + j) % 2 == 0) {
                    cell.style.backgroundColor = P1_COLOR;
                    cell.innerHTML = attr[Math.floor((i * 4 + j) / 2)];
                } else {
                    cell.innerHTML = count[Math.floor((i * 4 + j - 1) / 2)];
                }

            }
        }
    } else {
        table.style.display = 'initial';
    }

    removeChild(parentId + 'p1CountTableButton', parentId);
    var button = createButton(parentId + 'p2CountTableButton', parentId, 'P1 resources', function() {p2CountTable(parentId, board);});
    button.style.position = 'absolute';
    button.style.top = '65%';
    button.style.right = '0%';
}

function p2CountTable(parentId, board) {

    var attr = ['Island1', 'Island2', 'Island3', 'Animal', 'Castle', 'Cornfield', 'Forest', 'River'];
    var parent = document.getElementById(parentId);

    document.getElementById(parentId + 'p1CountTable').style.display = 'none';

    var table = document.getElementById(parentId + 'p2CountTable');

    if (table === null) {

        var div = document.createElement('div');
        parent.appendChild(div);
        div.style.position = 'absolute';
        div.style.width = '60%';
        div.style.height = '60%';
        div.style.top = '20%';
        div.style.left = '20%';
        table = document.createElement('table');
        table.classList.add('table4');
        table.setAttribute('id', parentId + 'p2CountTable');
        div.appendChild(table);

        var count = countAttrs(board, 2);

        for (var i = 0; i < 4; i++) {

            var row = document.createElement('tr');
            table.appendChild(row);

            for (var j = 0; j < 4; j++) {

                var cell = document.createElement('td');
                row.appendChild(cell);
                cell.style.align = 'center';

                if ((i * 4 + j) % 2 == 0) {
                    cell.style.backgroundColor = P2_COLOR;
                    cell.innerHTML = attr[Math.floor((i * 4 + j) / 2)];
                } else {
                    cell.innerHTML = count[Math.floor((i * 4 + j - 1) / 2)];
                }

            }
        }
    } else {
        table.style.display = 'initial';
    }

    removeChild(parentId + 'p2CountTableButton', parentId);
    var button = createButton(parentId + 'boardView', parentId, 'P2 resources', function() {boardView(parentId, board);});
    button.style.position = 'absolute';
    button.style.top = '65%';
    button.style.right = '0%';
}

function boardView(parentId, board) {

    document.getElementById(parentId + 'p2CountTable').style.display = 'none';
    document.getElementById(parentId + 'Island1').style.display = 'initial';
    document.getElementById(parentId + 'Island2').style.display = 'initial';
    document.getElementById(parentId + 'Island3').style.display = 'initial';

    removeChild(parentId + 'boardView', parentId);
    var button = createButton(parentId + 'p1CountTableButton', parentId, 'Board', function() {p1CountTable(parentId, board);});
    button.style.position = 'absolute';
    button.style.top = '65%';
    button.style.right = '0%';
}

phase2();