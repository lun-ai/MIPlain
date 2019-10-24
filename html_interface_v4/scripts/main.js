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
    EXPL_TIME = 120,
    PART4_TOTAL_SAMPLES = 6;

var t,
    participantID = 0,
    phase = 1,
    th = 1.2,
    clicked = 0,
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
    record = '',
    verbalResponses = [],
    part4Examples = [],
    part4Scores = [];

function getPart1Scores() {
    var samplesStore = localStorage['samples'];
    if (samplesStore == null) {return [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];}

    var samples = JSON.parse(samplesStore);
    return samples == null ? [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] : samples;
}

function getParticipantID() {
    var pid = localStorage['partID'];
    return isNaN(pid) ? 1 : pid;
}

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
    var participantID = getParticipantID();

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
        if(phase == 2 && (totalTime - sec - 10) < 0.01) {
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

    if (boardToPlay == emptyBoard){
        document.getElementById('instruction2').textContent = '';
    }

    if (ended) {
        // finished game
        document.getElementById('instruction2').textContent = '';
        removeChild('gamep1CountTable','game');
        removeChild('gamep2CountTable','game');
        removeChild('gameBoard', 'game');
        createButton('nextPhaseButton', 'nextPhase', 'Continue', prephase1);
    }     
    else {
        // unfinished game
        document.getElementById('instruction1').textContent = 'Select one territory at a time to capture resources.';
        document.getElementById('phase').textContent = '';

        var currentBoard = changeLabelsOnBoard(boardToPlay);
        var board = document.createElement('div');
        document.getElementById('game').appendChild(board);
        var boardID = 'gameBoard';
        board.setAttribute('id', boardID);
        board.style.position = 'absolute';
        board.style.left = '20%';
        board.style.height = '60%';
        board.style.width = '60%';

        for (var i = 0; i < N_SIZE; i++) {

            var island = document.createElement('div');
            board.appendChild(island);
            var islandID = boardID + 'Island' + (i + 1);
            island.setAttribute('id', islandID);
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

            var cell1 = createIsland(currentBoard[i * 3], islandID, ISLAND_ATTR[i * 3]);
            island.appendChild(cell1);
            cell1.style.top = '0%';
            cell1.style.left = '0%';
            cell1.setAttribute('id', 'cell1_'+i);
            cell1.addEventListener('click', boardClickedGame);

            var cell2 = createIsland(currentBoard[i * 3 + 1], islandID, ISLAND_ATTR[i * 3 + 1]);
            island.appendChild(cell2);
            cell2.style.top = '0%';
            cell2.style.right = '0%';
            cell2.setAttribute('id', 'cell2_'+i);
            cell2.addEventListener('click', boardClickedGame);

            var cell3 = createIsland(currentBoard[i * 3 + 2], islandID, ISLAND_ATTR[i * 3 + 2]);
            island.appendChild(cell3);
            cell3.style.bottom = '0%';
            cell3.style.left = '25%';
            cell3.setAttribute('id', 'cell3_'+i);
            cell3.addEventListener('click', boardClickedGame);


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

        boardToPlay = currentBoard;
    }

}


function getAnswerSamplesFromTest(ans, s, prevS, resT) {

    // cor/incor :- type, move
    // corT/incorT :- T, idx to cor/incor
    // cases :- pre-post answer case, type, idx to cor/incor
    var incor = [[], [], []];
    var cor = [[], [], []];
    var incorT = [[], [], []];
    var corT = [[], [], []];
    var cases = [[], [], [], []];

    var sample = [];
    var sampleScores = [];

    // partition answers based on correctness and question type
    for (var sp = 0; sp < s.length; ++ sp) {

        var type = 0;

        if (5 <= sp && sp < 10) {
            type = 1;
        } else if (10 <= sp && sp < s.length) {
            type = 2;
        }

        if (s[sp] != 10 && prevS[sp] != 10) {
            cases[0].push([type, incorT[type].length]);
            incor[type].push(ans[sp]);
            incorT[type].push([resT[sp], incorT[type].length, s[sp] - prevS[sp]]);
        } else if (s[sp] == 10 && prevS[sp] != 10) {
            cases[1].push([type, incorT[type].length]);
            incor[type].push(ans[sp]);
            incorT[type].push([resT[sp], incorT[type].length, s[sp] - prevS[sp]]);
        } else if (s[sp] != 10 && prevS[sp] == 10) {
            cases[2].push([type, corT[type].length]);
            cor[type].push(ans[sp]);
            corT[type].push([resT[sp], corT[type].length, s[sp] - prevS[sp]]);
        } else {
            cases[3].push([type, corT[type].length]);
            cor[type].push(ans[sp]);
            corT[type].push([resT[sp], corT[type].length, 0]);
        }
    }

    // sample answers based on response time for each type
    // fill in by type from depth 1 to depth 3
    while (sample.length < PART4_TOTAL_SAMPLES) {

        for (var k = 0; k < 4; ++ k) {

            var c = cases[k];
            var rt, as;
            if (k < 2) {rt = incorT; as = incor;}
            else {rt = corT; as = cor;}

            for (var inc = 0; inc < 3; ++ inc) {

                if (sample.length < PART4_TOTAL_SAMPLES) {
                    var idxs = c.filter(x => x[0] == inc).map(y => y[1]);

                    if (idxs.length != 0) {
                        if (idxs.length == 1) {
                            sample.push(as[inc][idxs[0]]);
                            sampleScores.push(k);
                        } else {
                            rt[inc].sort((a, b) => b[0] * (-1) * b[2] - a[0] * (-1) * a[2]);
                            for (var ti = 0; ti < rt[inc].length; ++ ti) {
                                var i = idxs.indexOf(rt[inc][ti][1]);
                                if (i != -1 && sample.filter(s => JSON.stringify(s) == JSON.stringify(as[inc][idxs[i]])).length == 0){
                                    sample.push(as[inc][idxs[i]]);
                                    sampleScores.push(k);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

    }

//    console.log(cor);
//    console.log(corT);
//    console.log(incor);
//    console.log(incorT);

    return [sample, sampleScores];
}


function stopCountPhase1() {

    if (t != null) {
        clearTimeout(t);
        sec = 0;
    }

    currentQuestion += 1;
    
   if (currentQuestion > TOTAL_QUESTIONS) {
        var participantID = getParticipantID();

        document.getElementById('participantid').value = participantID;
        localStorage.setItem('samples', JSON.stringify(scores));

        record += '\n\nPart 1: \n'
            + answers.map(g => '[[' + g.join('],[') + ']]\n')
            + 'difficulty: [' + difficulty + ']\n'
            + 'scores: [' + scores + ']\n'
            + 'time: [' + timeTaken + ']\n';

        var element = document.getElementById("postrecord");
        element.value = record;
	    removeChild('nextQuestionButton', 'nextQuestion');
	    removeChild('gamep1CountTable', 'game');
        removeChild('gamep2CountTable', 'game');
        document.getElementById('phase').textContent = 'Well done for completing Part 1!';
        document.getElementById('timer').textContent = '';

        document.getElementById('goconcepts2').style.display = 'block';

        document.getElementById('instruction1').textContent = '';
        document.getElementById('instruction2').textContent = '';

        document.getElementById('numQuestion').textContent = '';
        removeChild('gameBoard', 'game');

   } else {
        nextQuestion();
        startCount();
   }

}

function stopCountPhase2() {

    var participantID = getParticipantID();

    if (currentExpl != 0) {
        ended = true;
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
        document.getElementById('instruction1').textContent = 'In Part 3, you will answer ' + TOTAL_QUESTIONS + ' questions '
                                                    + 'for which you play against an OPTIMAL opponent.';
        document.getElementById('instruction2').textContent = 'You should select what you think is the best territory to WIN.'
                                                    + ' You have ONE CHANCE for each question and should try your best.';
        document.getElementById('instruction3').textContent = '';
        document.getElementById('instruction4').textContent = '';
        document.getElementById('numQuestion').textContent = '';
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

    var participantID = getParticipantID();
    currentQuestion += 1;

    if (currentQuestion > TOTAL_QUESTIONS) {

        removeChild('nextQuestionButton', 'nextQuestion');
        removeChild('nextExampleButton', 'nextExample');
        removeChild('gameBoard', 'game');
        removeChild('gamep1CountTable', 'game');
        removeChild('gamep2CountTable', 'game');
        removeChild('nextPhaseButton', 'nextPhase');
        document.getElementById('phase').textContent =
                'Well done for completing Part 3!'
        document.getElementById('timer').textContent = '';
        document.getElementById('instruction1').innerHTML = '</br>In Part 4, you will answer 6 questions '
                                                    + 'all of which are based on your answers to previous sections.';
        document.getElementById('instruction2').innerHTML = 'For each question, you will review one move you made and ';
        document.getElementById('instruction3').innerHTML = 'need to provide a short explanation for each move.';
        document.getElementById('instruction4').innerHTML = '';
        document.getElementById('numQuestion').innerHTML = '';

        var prevScores = getPart1Scores();
        var samples = getAnswerSamplesFromTest(answers, scores, prevScores, timeTaken);

        // fetch saved samples from part 1 and load into current session
        part4Examples = samples[0];
        part4Scores = samples[1];
        console.log(samples);

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

function stopCountPhase4() {
    if (t != null) {
        clearTimeout(t);
        sec = 0;
    }

    var participantID = getParticipantID();
    currentQuestion += 1;

    // three questions from part 1 responses, three from part 2 responses

    if (currentQuestion > part4Examples.length) {

        removeChild('nextQuestionButton', 'nextQuestion');
        removeChild('nextExampleButton', 'nextExample');
        removeChild('gameBoard', 'game');
        removeChild('gamep1CountTable', 'game');
        removeChild('gamep2CountTable', 'game');
        removeChild('nextPhaseButton', 'nextPhase');
        removeChild('answerExp','game');
        document.getElementById('phase').textContent = 'Well done for completing Part 4!'
        document.getElementById('timer').textContent = '';
        document.getElementById('instruction1').textContent = 'Please now complete the following short survey';
        document.getElementById('instruction2').textContent = '';
        document.getElementById('instruction3').textContent = '';
        document.getElementById('instruction4').textContent = '';
        document.getElementById('instruction5').textContent = '';
        document.getElementById('numQuestion').textContent = '';

	    record += '\n\nPart 4: \n'
               + answers.map(g => '[[' + g.join('],[') + ']]\n')
               + 'responses: [' + verbalResponses + ']\n'
               + 'scores: [' + part4Scores + ']\n'
               + 'time on expl: [' + timeTakenExpl + ']\n';
        createButton('nextPhaseButton', 'nextPhase', 'Continue', phase5);

    } else {
        nextQuestionPart4();
        startCount();
    }
}

function boardClickedGame() {

    if (this.style.backgroundColor !== WHITE) {
        return;
    } else if (!ended) {

        this.style.backgroundColor = P1_COLOR;
        document.getElementById('instruction2').textContent = 'You have captured ' + resources(this.id) + '!';

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

function board1Click() {
    if (this.style.backgroundColor !== WHITE || clicked == 1) {
        return;
    } else {
        this.style.backgroundColor = P1_COLOR;

        clicked = 1;

        var div = document.getElementById('emptyWorld');

        var comment = document.createElement('div');
        div.appendChild(comment);
        comment.style.position = 'absolute';
        comment.style.top = '-5%';
        comment.style.width = '100%';
        comment.setAttribute('id', 'Comment');
        comment.align = 'center';
        comment.style.fontSize = 'normal';
        comment.style.whiteSpace = 'pre-wrap';
        comment.innerHTML = 'You have captured ' + resources(this.id) + '!';

        var currentBoard = convertBoxesTOBoard(boxes);
    }
}

function recordExplanationPart4() {
    var res = document.getElementById('answerExp').value;
    if (res.trim().length >= 10) {
        verbalResponses.push(res);
        timeTakenExpl.push(Math.max(floatRoundTo2(Math.max(0, sec - 1)), 0));
        ended = true;
        stopCount();
    }
}

function boardClicked() {

    if (this.style.backgroundColor !== WHITE) {
        return;
    } else if (!ended) {

        this.style.backgroundColor = P1_COLOR;
        ended = true;

        var currentBoard = convertBoxesTOBoard(boxes);
        answers[currentQuestion - 1].push(currentBoard);

        scores.push(getMiniMaxScore(prevBoard, currentBoard, 1));
        timeTaken.push(Math.round(Math.max(0, sec - 1) * 100) / 100);

        removeChild('gameBoardp1CountTableButton', 'gameBoard');
        createButton('nextQuestionButton', 'nextQuestion', 'Next Question', stopCount);
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
    removeChild('gamep1CountTable', 'game');
    removeChild('gamep2CountTable', 'game');
    boxes = [];
    document.getElementById('numQuestion').textContent = 'Question NO.' + currentQuestion;

    var board = document.createElement('div');
    document.getElementById('game').appendChild(board);
    var boardID = 'gameBoard';
    board.setAttribute('id', boardID);
    board.style.position = 'absolute';
    board.style.left = '20%';
    board.style.height = '60%';
    board.style.width = '60%';

    for (var i = 0; i < N_SIZE; i++) {

        var island = document.createElement('div');
        board.appendChild(island);
        var islandID = boardID + 'Island' + (i + 1);
        island.setAttribute('id', islandID);
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

        var cell1 = createIsland(rightIndexAndLabel[i * 3], islandID, ISLAND_ATTR[i * 3]);
        island.appendChild(cell1);
        cell1.style.top = '0%';
        cell1.style.left = '0%';
        cell1.addEventListener('click', boardClicked);

        var cell2 = createIsland(rightIndexAndLabel[i * 3 + 1], islandID, ISLAND_ATTR[i * 3 + 1]);
        island.appendChild(cell2);
        cell2.style.top = '0%';
        cell2.style.right = '0%';
        cell2.addEventListener('click', boardClicked);

        var cell3 = createIsland(rightIndexAndLabel[i * 3 + 2], islandID, ISLAND_ATTR[i * 3 + 2]);
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

function nextQuestionPart4() {
    ended = false;
    // available moves / num of winning moves
    difficulty.push(computeBoardDifficulty(prevBoard));
    // odd numbered questions are from part 1, even from part 2
    var move = part4Examples[currentQuestion - 1];
    console.log(move);
    answers.push(move);

    var rightIndexAndLabel = changeLabelsOnBoard(prevBoard);
    removeChild('gameBoard', 'game');
    removeChild('nextQuestionButton', 'nextQuestion');
    removeChild('gamep1CountTable', 'game');
    removeChild('gamep2CountTable', 'game');
    removeChild('answerExp', 'game');
    boxes = [];
    document.getElementById('instruction5').innerHTML = '';
    document.getElementById('numQuestion').textContent = 'Question NO.' + currentQuestion;

    var div = document.createElement('div');
    document.getElementById('game').appendChild(div);
    div.classList.add('row');
    div.setAttribute('id', 'gameBoard');
    var div1 = document.createElement('div');
    div1.setAttribute('id', 'initialBoard');
    div1.style.position = 'absolute';
    div1.style.width = '30%';
    div1.style.float = 'left';
    div1.style.left = '10%';
    div1.style.top = '20%';
    var div2 = document.createElement('div');
    div2.setAttribute('id', 'afterMove');
    div2.style.position = 'absolute';
    div2.style.width = '30%';
    div2.style.float = 'right';
    div2.style.right = '10%';
    div2.style.top = '20%';
    div.appendChild(div1);
    div.appendChild(div2);

    createBoard(move[0], 'initial', 'initialBoard', 'Initial Board', [], WHITE, 10);
    createBoard(move[1], 'move', 'afterMove', 'Your move', [], WHITE, 10);

    var initial = changeLabelsOnBoard(move[0]);
    var move = changeLabelsOnBoard(move[1]);
    var moveIdx = initial.map((_, i) => initial[i] == move[i] ? -1 : i).filter(x => x != -1)[0];
    var cell = document.getElementById('move' + 'Island' + (Math.floor(moveIdx / N_SIZE) + 1) + '' + (moveIdx % N_SIZE + 1));
    cell.style.border = '2px solid yellow';
    cell.style.zIndex = 2;

    var arrow = document.createElement('img');
    div.appendChild(arrow);
    arrow.src = 'imgs/arrowPart4.png';
    arrow.style.height = '10%';
    arrow.style.width = '10%';
    arrow.style.position = 'absolute';
    arrow.style.top = '40%';
    arrow.style.left = '45%';

    var newInstruction = document.getElementById('instruction5')
    newInstruction.innerHTML = '</br> Now imagine you need to <b>EXPLAIN</b> to a close friend why you chose this move '
                             + '</br> <b> WITH AT LEAST TWO SENTENCES </b>';
    newInstruction.style.position = 'absolute';
    newInstruction.style.bottom = '22%';
    newInstruction.style.left = '30%';

    var textInput = document.createElement('textarea');
    textInput.setAttribute('id', 'answerExp');
    textInput.setAttribute('placeHolder', 'Please write an explanation for your strategy (required)');
    textInput.setAttribute('row', 10);
    textInput.setAttribute('col', 30);
    document.getElementById('game').appendChild(textInput);
    textInput.style.height = '10%';
    textInput.style.width = '20%';
    textInput.style.position = 'absolute';
    textInput.style.bottom = '10%';
    textInput.style.left = '40%';
    textInput.required = true;
    createButton('nextQuestionButton', 'nextQuestion', 'Submit explanation', recordExplanationPart4);

    var button = document.getElementById('nextQuestionButton');
    button.style.position = 'absolute';
    button.style.height = '8%';
    button.style.width = '10%';
    button.style.bottom = '0%';
    button.style.left = '45%';
}

function endExpr() {

    var participantID = getParticipantID();
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

    var participantID = (new Date).getTime();
    localStorage.setItem('partID', participantID);

    phase = 0;
    document.getElementById('phase').textContent = 'Phase ' + phase + ' / 5';
    document.getElementById('instruction1').innerHTML =
    			'Let\'s now play a training game to get familiar with the rules of the game. <br />' +
    			'Your opponent plays <span style="font-weight:bold">RANDOMLY</span> and it does <span style="font-weight:bold">NOT</span> always choose optimal moves.<br /> <br />';
    document.getElementById('instruction2').innerHTML = 'You play first as the <span style="background-color:' + P1_COLOR + '">Blue</span> player. <br />' +
    			'Your opponent plays as <span style="background-color:' + P2_COLOR + '">Orange</span>.<br />' + 
    			'Press the <b>EMPTY</b> territory you want to select. ' +
                'You have only one shot for each of your move.<br /> <br />';
    document.getElementById('instruction2').innerHTML =  '<span style="text-decoration: underline"> NOTE: While answering questions, do not feel rushed and take your time.</span> <br />'
                     + '<span style="text-decoration: underline"> Please follow the instructions given. </span> <br />'
                     + '<span style="text-decoration: underline"> Please do not discuss your results with any other participants. </span> <br /> <br />';

    totalTime = QUESTION_TIME;

    createButton('nextPhaseButton', 'nextPhase', 'Play', stopCount);
}

function prephase1() {

    document.getElementById('phase').textContent = '';
    document.getElementById('instruction1').innerHTML = 'Your opponent now plays <span style="font-weight:bold">OPTIMALLY</span> and it always chooses the <span style="font-weight:bold">best</span> possible move. <br /><br />' +
    			'In Part 1, you will be given ' + TOTAL_QUESTIONS + ' questions.';
    document.getElementById('instruction2').innerHTML = 'You should select what you think is the best territory to WIN.<br />'
                                                    + ' You have ONE CHANCE for each question and you should try your best.<br /><br />';
    createButton('nextPhaseButton', 'nextPhase', 'Next', phase1);

}

function phase1() {

    removeChild('nextPhaseButton', 'nextPhase');

    phase = 1;
    totalTime = QUESTION_TIME;

    document.getElementById('phase').textContent = 'Part ' + phase;
    document.getElementById('instruction1').innerHTML = 'You play <span style="background-color: '
                        + P1_COLOR + '">Blue</span>, '
                        + 'and please press a <b>WHITE</b> cell' +
                        ' to capture resources that you think can lead to WIN';
    document.getElementById('instruction2').innerHTML = 'You have <b>ONE CHANCE</b> for each question.';
    stopCount();
}

function prephase2() {

    var participantID = getParticipantID();
    
    phase = 2;
    document.getElementById('instruction1').innerHTML =
                '<br />In Part 2, examples are given by the Great Wizard. <br />'
                + 'You have to choose between two potential moves the one '
                 + 'you think to be the best to WIN against the Great Wizard.';
    document.getElementById('instruction2').textContent =
                  'Then, the Great Wizard will tell you which one is the right move and which is not.';
    document.getElementById('Great_Wizard_intro').style.display = 'block';

    document.getElementById('phase').textContent = 'Part ' + phase;

    if (participantID % TOTAL_GROUP == 0) {
        document.getElementById('instruction3').textContent =
                    'You will be given 2 minutes to think about your choice.'
    } else {
        document.getElementById('instruction3').textContent =
                 'You will be given 2 minutes to study the explanation from MIGO, an AI agent.'
        document.getElementById('MIGO_intro').style.display = 'block';
    }

    createButton('nextPhaseButton', 'nextPhase', 'Continue', phase2);


}

function phase2() {

    removeChild('nextPhaseButton', 'nextPhase');
    removeChild('gameBoard', 'game');
    var participantID = getParticipantID();
    totalTime = QUESTION_TIME;

    document.getElementById('explanation').style.display = 'block';
    document.getElementById('MIGO_intro').style.display = 'none';
    document.getElementById('Great_Wizard_intro').style.display = 'none';

    document.getElementById('phase').textContent = 'Part ' + phase;
	
    document.getElementById('instruction1').innerHTML = 'You play <span style="background-color: '
                        + P1_COLOR + '">Blue</span>, and opponent plays <span style="background-color: '
                        + P2_COLOR + '">Orange</span>. '
    document.getElementById('instruction2').innerHTML = 'Given an initial board, choose between two potential moves '
                        + 'highlighted in <span style="background-color: yellow">Yellow</span>, '
                        + 'for WINNING.'
    document.getElementById('instruction3').innerHTML =
                    'The Great Wizard then tells you which one is the right move and which is not. ';

    if (participantID % TOTAL_GROUP == 0) {
        document.getElementById('instruction3').innerHTML +=
                    'You are given time to think about your choice. <br /> <br />';
        document.getElementById('feedbackPanel').style.display = 'none';
    } else {
        document.getElementById('instruction3').innerHTML +=
                    '<br /> <b>You are given time to read comments of MIGO AI. '
                    + 'They explain why the right move is better than the wrong move. </b>';
        document.getElementById('instruction4').innerHTML = '<br /> <span style="text-decoration: underline">'
                    + 'Please pay attention to the highlighted resources and comments. </span><br /><br />'
    }

    stopCount();
}


function phase3() {

    removeChild('nextPhaseButton', 'nextPhase');
    var participantID = getParticipantID();
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
                        + P1_COLOR + '">Blue</span>, '
                        + 'and please press a <b>WHITE</b> cell' +
                        ' to capture resources that you think can lead to WIN';
    document.getElementById('instruction2').innerHTML = 'You have <b>ONE CHANCE</b> for each question. ';

    test_boards = PHASE3_QUESTIONS;
    stopCount();
}


function phase4() {

    removeChild('nextPhaseButton', 'nextPhase');

    flushLocalCache();

    phase = 4,
    totalTime = QUESTION_TIME;

    document.getElementById('phase').textContent = 'Part ' + phase;
    document.getElementById('instruction1').innerHTML = 'For each question, you will see one move you made in one of the previous sections and';
    document.getElementById('instruction2').innerHTML = 'you need to <b>EXPLAIN</b> briefly why you chose that move as you would say to a friend';

    test_boards = PHASE4_QUESTIONS;
    stopCount();

}

function phase5() {

    var participantID = getParticipantID();

    console.log(record);
    flushLocalCache();

    phase = 5;
    var u;
    if (S > th) {
	u = 2;
    } else {u = phase;
    }

    // localStorage.setItem("expResult", record);
    var element = document.getElementById("postrecord");
    element.value = record;
    document.getElementById('phase').textContent = 'Part ' + u;
    removeChild('nextPhaseButton', 'nextPhase');
    document.getElementById('genderform').style.display = 'block';
    document.getElementById('participantid').value = participantID

}

function checkform() {
	// no radio button is selected
    if (!document.genderform.gender[0].checked &&
        !document.genderform.gender[1].checked &&
        !document.genderform.gender[2].checked) {
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
    } else if (phase == 5) {
        stopCountPhase5();
    }
}

function nextExample() {
    clearBoards();
    moveChosen = false;
    ended = false;
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

    var diffIdxright = initial.map((_,i) => initial[i] === right[i] ? -1 : i).filter(x => x !== -1)[0];
    var islandNumright = Math.floor(diffIdxright / N_SIZE)+1;
    var cellNumright = diffIdxright % N_SIZE+1;

    var diffIdxwrong = initial.map((_,i) => initial[i] === wrong[i] ? -1 : i).filter(x => x !== -1)[0];
    var islandNumwrong = Math.floor(diffIdxwrong / N_SIZE)+1;
    var cellNumwrong = diffIdxwrong % N_SIZE+1;

    if (Math.random() > 0.5) {
        var text1 = createParitalBoard(examples[currentExpl - 1], rightMoves[currentExpl - 1], 'rightMove', 'move1');
        var text2 = createParitalBoard(examples[currentExpl - 1], wrongMoves[currentExpl - 1], 'wrongMove', 'move2');
        createMoveButton('rightMoveButton', 'rightMoveComment', text1, rightMoveChosen);
        createMoveButton('wrongMoveButton', 'wrongMoveComment', text2, wrongMoveChosen);
    } else {
        var text1 = createParitalBoard(examples[currentExpl - 1], wrongMoves[currentExpl - 1], 'wrongMove', 'move1');
        var text2 = createParitalBoard(examples[currentExpl - 1], rightMoves[currentExpl - 1], 'rightMove', 'move2');
        createMoveButton('wrongMoveButton', 'wrongMoveComment', text1, wrongMoveChosen);
        createMoveButton('rightMoveButton', 'rightMoveComment', text2, rightMoveChosen);
    }

    document.getElementById('initialBoard' + 'Island' + islandNumright + cellNumright).style.borderColor = 'yellow';
    document.getElementById('initialBoard' + 'Island' + islandNumright + cellNumright).style.borderWidth = '2px';
    document.getElementById('initialBoard' + 'Island' + islandNumright + cellNumright).style.zIndex = 2;

    document.getElementById('initialBoard' + 'Island' + islandNumwrong + cellNumwrong).style.borderColor = 'yellow';
    document.getElementById('initialBoard' + 'Island' + islandNumwrong + cellNumwrong).style.borderWidth = '2px';
    document.getElementById('initialBoard' + 'Island' + islandNumwrong + cellNumwrong).style.zIndex = 2;

    document.getElementById('rightMoveIsland' + rightIdx).style.borderColor = 'yellow';
    document.getElementById('rightMoveIsland' + rightIdx).style.borderWidth = '2px';
    document.getElementById('rightMoveIsland' + rightIdx).style.zIndex = 2;
    document.getElementById('wrongMoveIsland' + wrongIdx).style.borderColor = 'yellow';
    document.getElementById('wrongMoveIsland' + wrongIdx).style.borderWidth = '2px';
    document.getElementById('wrongMoveIsland' + wrongIdx).style.zIndex = 2;
}

function showExpl() {

    timeTaken.push(Math.round(Math.max(0, sec - 1) * 100) / 100);
    totalTime = EXPL_TIME;

    removeChild('wrongMoveButton', 'wrongMoveComment');
    removeChild('rightMoveButton', 'rightMoveComment');

    document.getElementById('wrongMoveComment').innerHTML = '<span style="color: red">This is a wrong move</span>';
    document.getElementById('rightMoveComment').innerHTML = '<span style="color: green">This is a right move</span>';

    var initial = changeLabelsOnBoard(examples[currentExpl - 1]);
    var right = changeLabelsOnBoard(rightMoves[currentExpl - 1]);
    var wrong = changeLabelsOnBoard(wrongMoves[currentExpl - 1]);

    var rightIdx = initial.map((_, i) => initial[i] == right[i] ? -1 : i).filter(x => x != -1)[0];
    var wrongIdx = initial.map((_, i) => initial[i] == wrong[i] ? -1 : i).filter(x => x != -1)[0];

    moveChosen = true;
    totalTime = EXPL_TIME;
    sec = 0;
    var participantID = getParticipantID();

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

function createParitalBoard(originalBoard, board, boardID, parentId) {

    var div = document.createElement('div');
    div.setAttribute('id', boardID);
    div.classList.add('center1');
    div.style.position = 'relative';
    div.style.height = '250px';
    document.getElementById(parentId).appendChild(div);

    if (board.length !== 0) {

        var original = changeLabelsOnBoard(originalBoard);
        var newBoard = changeLabelsOnBoard(board);

        var diffIdx = original.map((_,i) => original[i] === newBoard[i] ? -1 : i).filter(x => x !== -1)[0];
        var islandNum = Math.floor(diffIdx / N_SIZE);

        var island = document.createElement('div');
        var islandID = boardID + 'Island';
        island.setAttribute('id', islandID);
        div.appendChild(island);
        island.style.height = '30%';
        island.style.width = '40%';
        island.style.position = 'absolute';
        island.style.top = '20%';
        island.style.left = '30%';

        var cellID = islandID + (islandNum * 3);
        var cell1 = createIslandAux(newBoard[islandNum * 3], cellID, ISLAND_ATTR[islandNum * 3], 'iconImgXS');
        cell1.style.top = '0%';
        cell1.style.left = '0%';
        cell1.style.fontSize = '10px';
        cell1.setAttribute('id', cellID);

        cellID = islandID + (islandNum * 3 + 1);
        var cell2 = createIslandAux(newBoard[islandNum * 3 + 1], cellID, ISLAND_ATTR[islandNum * 3 + 1], 'iconImgXS');
        cell2.style.top = '0%';
        cell2.style.right = '0%';
        cell2.style.fontSize = '10px';
        cell2.setAttribute('id', cellID);

        cellID = islandID + (islandNum * 3 + 2);
        var cell3 = createIslandAux(newBoard[islandNum * 3 + 2], cellID, ISLAND_ATTR[islandNum * 3 + 2], 'iconImgXS');
        cell3.style.bottom = '0%';
        cell3.style.left = '25%';
        cell3.style.fontSize = '10px';
        cell3.setAttribute('id', cellID);
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
        islandTag.style.zIndex = 3;
        islandTag.innerHTML = 'Island ' + (islandNum + 1);

        var comment = document.createElement('div');
        div.appendChild(comment);
        comment.style.position = 'absolute';
        comment.style.bottom = '30%';
        comment.style.width = '100%';
        comment.setAttribute('id', boardID+'Comment');
        comment.align = 'center';
        comment.style.fontSize = 'small';
        comment.style.whiteSpace = 'pre-wrap';

        return 'Take (' + ISLAND_ATTR[islandNum * 3 + (diffIdx % 3)] + ') on Island ' + (islandNum + 1);
    }
}

function createBoard_oneclick(iniboard, boardid, parentId, text, color) {

    var currentBoard = changeLabelsOnBoard(iniboard);
    var board = document.createElement('div');
    document.getElementById(parentId).appendChild(board);
    board.setAttribute('id', boardid);
    board.style.position = 'absolute';
    board.style.width = '100%';
    board.style.height = '80%';
    var frame = document.createElement('div');
    board.appendChild(frame);
    frame.style.position = 'absolute';
    frame.style.height = '95%';
    frame.style.width = '65%';
    frame.style.left = '17%';
    frame.style.border = '1px solid black';
    frame.style.top = '7%';
    frame.style.backgroundColor = "white";

    for (var i = 0; i < 3; i++) {
        var island = document.createElement('div');
        board.appendChild(island);
        var islandID = boardid + 'Island' + (i + 1);
        island.setAttribute('id', islandID);
        island.style.height = '40%';
        island.style.width = '25%';
        island.style.position = 'absolute';

        if (i === 0) {
            island.style.top = '10%';
            island.style.left = '20%';
        } else if (i == 1) {
            island.style.top = '10%';
            island.style.right = '20%';
        } else {
            island.style.top = '60%';
            island.style.left = '37.5%';
            }

        var cell1 = createIsland(currentBoard[i * 3], islandID, ISLAND_ATTR[i * 3]);
        island.appendChild(cell1);
        cell1.style.top = '1%';
        cell1.style.left = '1%';
        cell1.setAttribute('id', 'cell1_'+i);
        cell1.addEventListener('click', board1Click);

        var cell2 = createIsland(currentBoard[i * 3 + 1], islandID, ISLAND_ATTR[i * 3 + 1]);
        island.appendChild(cell2);
        cell2.style.top = '1%';
        cell2.style.right = '0%';
        cell2.setAttribute('id', 'cell2_'+i);
        cell2.addEventListener('click', board1Click);

        var cell3 = createIsland(currentBoard[i * 3 + 2], islandID, ISLAND_ATTR[i * 3 + 2]);
        island.appendChild(cell3);
        cell3.style.bottom = '0%';
        cell3.style.left = '25%';
        cell3.setAttribute('id', 'cell3_'+i);
        cell3.addEventListener('click', board1Click);

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

    var arrow = document.createElement('img');
    document.getElementById('cell2_1').appendChild(arrow);
    arrow.src = 'imgs/arrow.png';
    arrow.style.height = '25%';
    arrow.style.width = '200%';
    arrow.style.position = 'absolute';
    arrow.style.top = '150%';
    arrow.style.left = '50%';
}

function createBoard_withtriplet(board, id, parentId, text, player) {
    var div = createBoardExpl(board, id, parentId, text, 'black');
    if (player == 1){
        highlightAttr(id, [winLine(board,player)], 'green', 'x');
    } else {
        highlightAttr(id, [winLine(board,player)], 'yellow', 'o');
    }

    div.classList.remove('column3');
    div.style.width = '70%';
    div.style.height = '100%';
}

function createBoard_withstrong(board, id, parentId, text, player) {
    var div = createBoardExpl(board, id, parentId, text, 'black');
    var strong = findPosStrongOption(board, player);
    if (player == 1){
        highlightAttr(id, strong, 'green', 'x');
    } else {
        highlightAttr(id, strong, 'yellow', 'o');
    }

    div.classList.remove('column3');
    div.style.width = '70%';
    div.style.height = '100%';
}

function createTableViewButton(buttonId, parentId, text, func) {
    var button = createButton(buttonId, parentId, text, func);
    button.style.position = 'absolute';
    button.style.width = '';
    button.style.height = '';
    return button;
}

function createMoveButton(buttonId, parentId, text, func) {
    var button = createTableViewButton(buttonId, parentId, text, func);
    button.style.position = 'relative';
    return button;
}

function createBoardExpl(board, boardId, parentId, text, color) {

    var div = document.createElement('div');
    div.classList.add('column3');
    div.classList.add('center1');
    div.setAttribute('id', boardId);
    div.style.position = 'relative';
    div.style.height = '245px';
    var frame = document.createElement('div');
    div.appendChild(frame);
    frame.style.position = 'absolute';
    frame.style.height = '66%';
    frame.style.width = '97%';
    frame.style.border = '1px solid black';
    frame.style.top = '5%';
    frame.style.backgroundColor = "white";

    document.getElementById(parentId).appendChild(div);  
    if (board.length !== 0) {
        var newBoard = changeLabelsOnBoard(board);

        for (var i = 0; i < 3; i++) {

            var island = document.createElement('div');
            var islandID = boardId + 'Island' + (i + 1);
            island.setAttribute('id', islandID);
            div.appendChild(island);
            island.style.height = '22%';
            island.style.width = '44%';
            island.style.position = 'absolute';

            if (i === 0) {
                island.style.top = '10%';
                island.style.left = '2%';
            } else if (i == 1) {
                island.style.top = '10%';
                island.style.right = '3%';
            } else {
                island.style.top = '40%';
                island.style.left = '26%';
            }
            var cell1 = createIslandAux(newBoard[i * 3], islandID, ISLAND_ATTR[i * 3], 'iconImgXXS');
            cell1.style.top = '1%';
            cell1.style.left = '0%';
            cell1.style.fontSize = '8px';
            cell1.setAttribute('id', islandID + 'Cell1');

            var cell2 = createIslandAux(newBoard[i * 3 + 1], islandID, ISLAND_ATTR[i * 3 + 1], 'iconImgXXS');
            cell2.style.top = '1%';
            cell2.style.right = '1%';
            cell2.style.fontSize = '8px';
            cell2.setAttribute('id', islandID + 'Cell2');

            var cell3 = createIslandAux(newBoard[i * 3 + 2], islandID, ISLAND_ATTR[i * 3 + 2], 'iconImgXXS');
            cell3.style.bottom = '0%';
            cell3.style.left = '24%';
            cell3.style.fontSize = '8px';
            cell3.setAttribute('id', islandID + 'Cell3');

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

    return div;
}

function add_table_title(parent,id,text){

    var title = document.createElement('div');
    parent.appendChild(title);
    title.style.position = 'relative';
    title.style.top = '0%';
    title.style.width = '100%';
    title.setAttribute('id', id);
    title.align = 'center';
    title.style.fontSize = 'small';
    title.style.whiteSpace = 'pre-wrap';
    title.innerHTML = text;

}

function createBoard(board, boardId, parentId, text, positions, color, borderWidth) {

    var div = document.createElement('div');
    div.setAttribute('id', boardId);
    div.classList.add('center1');
    div.style.position = 'relative';
    div.style.height = '300px';
    div.style.border = '1px solid black';
    document.getElementById(parentId).appendChild(div);

    if (board.length !== 0) {

        var newBoard = changeLabelsOnBoard(board);

        for (var i = 0; i < N_SIZE; i++) {

            var island = document.createElement('div');
            var islandID = boardId + 'Island' + (i + 1);
            island.setAttribute('id', islandID);
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

            var cell1 = createIslandAux(newBoard[i * 3], islandID, ISLAND_ATTR[i * 3], 'iconImgXS');
            cell1.style.top = '1%';
            cell1.style.left = '1%';
            cell1.style.fontSize = '10px';
            cell1.setAttribute('id', islandID+1);

            var cell2 = createIslandAux(newBoard[i * 3 + 1], islandID, ISLAND_ATTR[i * 3 + 1], 'iconImgXS');
            cell2.style.top = '1%';
            cell2.style.right = '0%';
            cell2.style.fontSize = '10px';
            cell2.setAttribute('id', islandID+2);

            var cell3 = createIslandAux(newBoard[i * 3 + 2], islandID, ISLAND_ATTR[i * 3 + 2], 'iconImgXS');
            cell3.style.bottom = '0%';
            cell3.style.left = '25%';
            cell3.style.fontSize = '10px';
            cell3.setAttribute('id', islandID+3);
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
            islandTag.style.zIndex = 3;
            islandTag.style.backgroundColor = DEFAULT_C;
            islandTag.innerHTML = 'Island ' + (i + 1);

        }
    }

}

function createIsland(elem, islandID, text) {
    return createIslandAux(elem, islandID, text, 'iconImgS');
}

function createIslandAux(elem, islandID, text, iconClass) {
    var cell = document.createElement('div');
    cell.classList.add('islandCell');
    cell.style.height = '48.2%';
    cell.style.width = '49%';

    cell.innerHTML = '<p id="' + islandID + 'Attr">'
                        + text.split(', ')
                              .map(a => '<img id="' + islandID + ISLAND_ATTR_MAP[a]
                                                     + elem
                                                     + '" src="imgs/' + ISLAND_ATTR_MAP[a]
                                                     + '.png" class="' + iconClass + '">')
                              .join(' ')
                        + '</p>';
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

        createBoardExpl(game[0], 'posboard0', parentId, 'You select this territory and obtain 1 pair (' + strong1 + ')', TEXT_GREEN);
        createBoardExpl(game[1], 'posboard1', parentId, 'Opponent conquers and prevents you from getting a triplet (' + strong1 + ')', TEXT_GREEN);
        createBoardExpl(game[2], 'posboard2', parentId, 'You obtain 2 pairs ('
                                                        + findPosStrongOption(game[2], 1)
                                                        + ') and opponent has no pair', TEXT_GREEN);

        highlightAttr('posboard0', strong1, GREEN, 'x');
        highlightAttr('posboard2', strong2, GREEN, 'x');

    } else if (game[0].filter(x => x === 0).length === 4) {
        // Depth 2
        var strong = findPosStrongOption(game[0], 1);
	    createBoardExpl(game[0], 'posboard0', parentId, 'You select this territory and obtain 2 pairs ('
	                    + strong[0] + ', '
	                    + strong[1] + ')', TEXT_GREEN);
        createBoardExpl(game[0], 'posboard1', parentId, 'Opponent has no pair', TEXT_GREEN);
        highlightAttr('posboard0', strong, GREEN, 'x');

    } else if (game[0].filter(x => x === 0).length === 2) {
        // Depth 1
        createBoardExpl(game[0], 'posboard0', parentId, 'You select this territory and obtain 1 triplet (' + winLine(game[0],1) + ')', TEXT_GREEN);
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
		} else {
	        createBoardExpl(board, 'negboard1', parentId, 'Contrast: opponent has 1 pair', TEXT_RED);
	        highlightAttr('negboard1', opponentStrong, 'yellow', 'o');
		}

	} else if (board.filter(x => x === 0).length === 2) {
	    // depth 1
        createBoardExpl(board, 'negboard0', parentId, 'Contrast: No triplet', TEXT_RED);
    }
}


