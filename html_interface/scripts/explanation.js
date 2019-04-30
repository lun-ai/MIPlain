/*
    Create partitioned database
*/
function partition(){
    var session = pl.create(RESOLUTION_DEPTH);
    session.consult(PL_FILE_NAME);
    var partitions = [{
                        'win_1':[],
                        'win_2':[],
                        'win_3':[]
                     },
                     {
                        'win_1':[],
                        'win_2':[],
                        'win_3':[]
                     },
                     {
                        'win_1':[],
                        'win_2':[],
                        'win_3':[]
                     },
                     {
                        'win_1':[],
                        'win_2':[],
                        'win_3':[]
                     },
                     {
                        'win_1':[],
                        'win_2':[],
                        'win_3':[]
                     },
                     {
                        'win_1':[],
                        'win_2':[],
                        'win_3':[]
                     },
                     {
                        'win_1':[],
                        'win_2':[],
                        'win_3':[]
                     },
                     {
                        'win_1':[],
                        'win_2':[],
                        'win_3':[]
                     },
                     {
                        'win_1':[],
                        'win_2':[],
                        'win_3':[]
                     }];

    for (var k in minimaxTable) {

        var board = k.split('').map(Number);
        var numMove = board.filter(x => x === 0).length;


        if (win(board, 1) || win(board, 2)) {
            continue;
        }

        var meanMinimaxScore = 0;
        minimaxTable[k][1].forEach(n => meanMinimaxScore += n);
        meanMinimaxScore = meanMinimaxScore / minimaxTable[k][1].length;

        if (meanMinimaxScore === 10 || meanMinimaxScore === -10) {
            continue;
        }

        var entry = composeStrategyState(board);
        var queryWin1, queryWin2, queryWin3;
        session.query('win_1(' + entry + ', B).');
        session.answer(x => queryWin1 = x);
        session.query('win_2(' + entry + ', B).');
        session.answer(x => queryWin2 = x);
        session.query('win_3(' + entry + ', B).');
        session.answer(x => queryWin3 = x);

        if (queryWin1 !== false && queryWin1 !== null) {
            var ans = partitions[numMove - 1]['win_1'];
            ans[ans.length] = k;
        } else if (queryWin2 !== false && queryWin2 !== null) {
            var ans = partitions[numMove - 1]['win_2'];
            ans[ans.length] = k;
        } else if (queryWin3 !== false && queryWin3 !== null) {
            var ans = partitions[numMove - 1]['win_3'];
            ans[ans.length] = k;
        }

    }

    // Create a js file storing partitioned database as a variable
    var a = document.createElement("a");
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(partitions)));
    a.setAttribute('download', 'partitions.js');
    a.click();
}


/*
    Consult strategy learned from metagol. Provide explanation on the optimal strategy that could be played.
*/
function consultStrategy(board1, board2) {

    // take current board and check if next board aligns with any solution provided by the strategy (win_1, win_2, win_3)
    var session = pl.create(RESOLUTION_DEPTH);
    session.consult(PL_FILE_NAME);
    var entryA = composeStrategyState(board1),
        entryB = composeStrategyState(board2);

    if (questionConfigsDup[Math.floor(phase / 2) - 1]['win_1'].includes(board1.join(''))) {

        var queryWin1;
        session.query('win_1(' + entryA + ', ' + entryB + ').');
        session.answer(x => queryWin1 = x);

        if (queryWin1 === false || queryWin1 === null) {

            console.log('Strategy: chosen cell makes win_1 fail');
            wrongMoveBoard = board2;

            // let hypothesis program give suggestions
            var queryWin1_1;
            session.query('win_1(' + entryA + ', B).');
            session.answer(x => queryWin1_1 = x);

            // Get next move board B
            suggestionB = parsePrologVar(queryWin1_1);
            console.log('B: ' + String(suggestionB));
            wrongQuestionTypes[wrongQuestionTypes.length] = 'win_1';
            record += '@w1\n'

            return false;

        }

    } else if (questionConfigsDup[Math.floor(phase / 2) - 1]['win_2'].includes(board1.join(''))) {

        var queryWin2;
        session.query('win_2(' + entryA + ', ' + entryB +').');
        session.answer(x => queryWin2 = x);

        if (queryWin2 === false || queryWin2 === null) {

            console.log('Strategy: chosen cell makes win_2 fail');
            wrongMoveBoard = board2;

            // let hypothesis program give suggestions
            var queryWin2_1, queryWin2_2, entrySuggestionB;

            // Get next move board B
            session.query('win_2(' + entryA + ', B).');
            session.answer(x => queryWin2_1 = x);
            suggestionB = parsePrologVar(queryWin2_1.lookup('B'));
            entrySuggestionB = composeStrategyState(suggestionB);
            console.log('B: ' + String(suggestionB));

            // use minimax to find an optimal move as C
            var player = 2 - (suggestionB.filter(x => x === 0).length % 2);
            var optimalC = composeStrategyState(computeNextMove(suggestionB, player));
            console.log('optimalC: ' + String(optimalC));

            // get outcome D with C being optimal move for X
            session.query('move(' + entryA + ', ' + entrySuggestionB + '), \\+(win_1('
                                + entrySuggestionB + ','
                                + optimalC + ')), move(' + entrySuggestionB + ','
                                + optimalC + '), win_1('
                                + optimalC + ',D).');
            session.answer(x => queryWin2_2 = x);
            console.log('D: ' + String(queryWin2_2));

            suggestionD1 = parsePrologVar(queryWin2_2.lookup('D'));
            wrongQuestionTypes[wrongQuestionTypes.length] = 'win_2';
            record += '@w2\n'

            return false;

        }

    } else if (questionConfigsDup[Math.floor(phase / 2) - 1]['win_3'].includes(board1.join(''))) {

        var queryWin3;
        session.query('win_3(' + entryA + ', ' + entryB + ').');
        session.answer(x => queryWin3 = x);

        if (queryWin3 === false || queryWin3 === null) {

            console.log('Strategy: chosen cell makes win_3 fail');
            wrongMoveBoard = board2;

            // let hypothesis program give suggestions
            var queryWin3_1, queryWin3_2, queryWin3_3, entrySuggestionB;

            // Get next move board B
            session.query('win_3(' + entryA + ', B).');
            session.answer(x => queryWin3_1 = x);
            suggestionB = parsePrologVar(queryWin3_1.lookup('B'));
            entrySuggestionB = composeStrategyState(suggestionB);
            console.log('B: ' + String(suggestionB));

            // use minimax to find an optimal move as C
            var player = 2 - (suggestionB.filter(x => x === 0).length % 2);
            var optimalC = composeStrategyState(computeNextMove(suggestionB, player));

            // get outcome D with C being optimal move for X
            session.query('move(' + entryA + ', ' + entrySuggestionB + '), \\+(win_1('
                        + entrySuggestionB + ',C)), \\+(win_2(' + entrySuggestionB + ',C)), move(' + entrySuggestionB + ',C), win_1(C, D).');
            session.answer(x => queryWin3_2 = x);
            session.query('move(' + entryA + ', ' + entrySuggestionB + '), \\+(win_1('
                        + entrySuggestionB + ','
                        + optimalC + ')), \\+(win_2(' + entrySuggestionB + ','
                        + optimalC + ')), move(' + entrySuggestionB + ','
                        + optimalC + '), win_2('
                        + optimalC + ',D).');
            session.answer(x => queryWin3_3 = x);
            console.log('D1: ' + String(queryWin3_2));
            console.log('D2: ' + String(queryWin3_3));

            suggestionD1 = (queryWin3_2 !== null && queryWin3_2 !== false)
                            ? parsePrologVar(queryWin3_2.lookup('D'))
                            : [];
            suggestionD2 = (queryWin3_3 !== null && queryWin3_3 !== false)
                            ? parsePrologVar(queryWin3_3.lookup('D'))
                            : [];
            wrongQuestionTypes[wrongQuestionTypes.length] = 'win_3';
            record += '@w3\n'

            return false;
        }
    }

    return true;
}

function composeStrategyState(board){
    var numMove = board.filter(x => x === 0).length;
    var toPlay = numMove % 2 === 1 ? 'o' : 'x';
        outcome = '_';
    return 's('
            + toPlay
            + ',' + outcome
            + ',b(' + changeLabelsOnBoard(board).join(',')
            + '))';
}


/*
    show explanations on the right hand side of the webpage and show boards along with explanations
*/
function showExplanation(prevBoard) {

    var opponent = turn === 'O' ? 'X' : 'O',
        wrongType = wrongQuestionTypes[wrongQuestionTypes.length - 1];
    var wrongMoveBoardLabelled = changeLabelsOnBoard(wrongMoveBoard);
    var suggestionBLabelled = changeLabelsOnBoard(suggestionB);

    /*
        For information only

        'win_1(A,B):- move(A,B), won(B).';
        'win_2(A,B):- move(A,B), not(win_1(B,C)), not(move(B,C), not(win_1(C,D))).'
        'win_3(A,B):- move(A,B), not(win_1(B,C)), not(win_2(B,C)), not(move(B,C), not(win_1(C,D)), not(win_2(C,D))).';
    */


    showExplBoard(prevBoard, 'Initial board (A)', 'original', 0, 'white');

    wrongMoveBoardLabelled.forEach(function(x, i) {
        if (suggestionBLabelled[i] !== x) {
            console.log('here');
            console.log(suggestionBLabelled);
            if (suggestionBLabelled[i] === 'e') {
                console.log('here1');
                showExplBoard(wrongMoveBoard, 'Your move', 'example1', i, 'red');
            } else if (x === 'e') {
                console.log('here2');
                showExplBoard(suggestionB, 'Suggestion (B)', 'example2', i, 'green');
                showExplBoard(suggestionD1, 'Win in one round from B (D-1)', 'example3', i, 'green');
                showExplBoard(suggestionD2, 'Win in two rounds from B (D-2)', 'example4', i, 'green');
            }
        }
    });

    if (wrongType === 'win_1') {

        rule_1 = ansSubmitted ? 'Bad Move. ' : 'No Move.'
            + 'There is move B from A (Initial) and B has one three-pieces line.';
        document.getElementById('expl1').textContent = rule_1;
        console.log('Win_1 violated');

    } else if (wrongType === 'win_2') {

        rule_2 = ansSubmitted ? 'Bad Move. ' : 'No Move.'
            + 'There is move B from A (Initial) and such that no C (opponent\'s) '
            + 'is won in one move from B and for move C (opponent\'s) from B, '
            + 'D is won in one move from C (opponent\'s).';
        document.getElementById('expl2').textContent = rule_2;
        console.log('Win_2 violated');

    } else if (wrongType === 'win_3') {

        rule_3 = ansSubmitted ? 'Bad Move. ' : 'No Move.'
            + 'There is move B from A (Initial) and such that no C (opponent\'s) '
            + 'is won in one move from B and such that no C (opponent\'s) is won '
            + 'in two moves from B and for move C (opponent\'s) from B, D is won '
            + 'in one move from C (opponent\'s) or D is won in two moves from C '
            + '(opponent\'s)';
        document.getElementById('expl3').textContent = rule_3;
        console.log('Win_3 violated');

    }

}
