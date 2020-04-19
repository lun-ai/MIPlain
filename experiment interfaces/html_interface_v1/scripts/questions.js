function selectQuestionBoard(){

    var choice;
    var boardChoices = [];

    if (phase === 1) {

        if (acc[phase - 1] < 3) {
            boardChoices = questionConfigs[0]['win_1'];
        } else if (acc[phase - 1] < 6) {
            boardChoices = questionConfigs[1]['win_2'];
        } else {
            boardChoices = questionConfigs[2]['win_3'];
        }

    } else if (phase === 2 || phase === 3) {
        boardChoices = questionConfigs[0]['win_1'];
    } else if (phase === 4 || phase === 5){
        boardChoices = questionConfigs[1]['win_2'];
    } else if (phase === 6 || phase === 7) {
        boardChoices = questionConfigs[2]['win_3'];
    }

    choice = boardChoices[Math.floor(Math.random() * boardChoices.length)];
    boardChoices.splice(boardChoices.indexOf(choice), 1);
    console.log('Is chosen board in pool after sampling: ' + boardChoices.includes(choice));
    return choice.split('').map(Number);

}


function findCategory(boardRepre, index){

    for (var k in questionConfigs[index]) {
        if (questionConfigs[index][k].include(boardRepre)) {
            return k;
        }
    }
    return null;

}


function startNewQuestion() {

    stopCount();

    removeButton('nextQuestion', 'next');
    removeButton('proceed', 'nextQuestionAfterExpl');
    clearExplBoard('Initial board (A)', 'original');
    clearExplBoard('Your move', 'example1');
    clearExplBoard('Suggestion (B)', 'example2');
    clearExplBoard('Win in one round from B (D-1)', 'example3');
    clearExplBoard('Win in two rounds from B (D-2)', 'example4');
    wrongMoveBoard = [];
    suggestionB = [],
    suggestionD1 = [],
    suggestionD2 = [];

    document.getElementById('explSimple').textContent = '';
    document.getElementById('expl1').textContent = '';
    document.getElementById('expl2').textContent = '';
    document.getElementById('expl3').textContent = '';
    document.getElementById('instruction2').textContent = 'Question No.' + String(acc[phase - 1] + 1);
    explShown = false;

    if (!ansSubmitted) {

        if (phase === 1) {
            if (acc[phase - 1] < 3) {
                console.log('Answer not submitted, init phase ' + PHASE_NAMES[1]);
                acc[1] = 0;
            } else if (acc[phase - 1] < 6) {
                console.log('Answer not submitted, init phase ' + PHASE_NAMES[3]);
                acc[3] = 0;
            } else {
                console.log('Answer not submitted, init phase ' + PHASE_NAMES[5]);
                acc[5] = 0;
            }
        } else if (phase === 2 || phase === 4 || phase === 6){
            console.log('Answer not submitted, init phase ' + PHASE_NAMES[phase]);
            acc[phase] = 0;
        }

    }


    if (acc[phase - 1] >= PHASE_SETTING[phase - 1]) {

        if (phase % 2 === 1) {
            wrongQuestionTypes = [];
        }
        nextPhase();

    } else {

        boxes.forEach(function (square) {
            square.innerHTML = EMPTY;
        });
        prevBoard = selectQuestionBoard();
        record += String(prevBoard) + '\n';
        convertBoardToBoxes(prevBoard);
        turn = prevBoard.filter(x => x === 0).length % 2 === 1 ? 'O' : 'X';
        gamePlayer = turn === 'O' ? 1 : 2;
        acc[phase - 1] += 1;
        ansSubmitted = false;
        document.getElementById('instruction4').textContent = 'For the below board, which position '
                                    + ' is your OPTIMAL move (that could lead to a WIN) ? '
                                    + 'You can answer this question by first PRESSING '
                                    + 'your chosen position on the board and click PROCEED button below to confirm your choice. ';
        document.getElementById('instruction5').textContent = '***** You now play ' + turn + ' *****';
        startCount();

    }
}

function setQuestion() {

    stopCount();

    var newBoard = convertBoxesTOBoard();
    questionScore = getMiniMaxScore(prevBoard, newBoard, gamePlayer);
    console.log('Choice confirmed, good score: ' + (questionScore === (-10 + (gamePlayer % 2) * 20)));
    record += String(newBoard) + '@' + questionScore + '\n';
    ansSubmitted = true;

    if(phase === 1 && questionScore !== (-10 + (gamePlayer % 2) * 20))  {

        if (acc[phase - 1] < 3) {
            acc[1] = 0;
        } else if (acc[phase - 1] < 6) {
            acc[3] = 0;
        } else {
            acc[5] = 0;
        }

    } else if ((phase % 2) === 0) {

        removeButton('nextQuestion', 'next');
        explShown = true;
        startCount();

        if (withExpl && !consultStrategy(prevBoard, newBoard)) {

            acc[phase] = 0;
            showExplanation(prevBoard);
            createButton('proceed', 'nextQuestionAfterExpl', 'Proceed', startNewQuestion);

            return;
        } else if (!withExpl) {
            if (questionScore !== (-10 + (gamePlayer % 2) * 20)) {

                acc[phase] = 0;
                consultStrategy(prevBoard, newBoard);
                document.getElementById('explSimple').textContent = 'Bad Move!';
                createButton('proceed', 'nextQuestionAfterExpl', 'Proceed', startNewQuestion);

                return;
            }
        }
    }
    startNewQuestion();
}

