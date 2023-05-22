/**
 * Unused. experiment only involved questions, participants didn't play games
 */
function startNewGame() {
  removeButton();
  document.getElementById('instruction3').textContent = 'Player: ' + score['Player'] + ' - '
                                                      + 'Computer: ' + score['Computer'] + ' - '
                                                      + 'Draw: ' + score['Draw'];
  document.getElementById('expl1').textContent = '';
  clicked = false;
  if (acc[phase - 1] >= PHASE_SETTING[phase - 1]) {

        stopCount();
        score = {
            'Player': 0,
            'Computer': 0,
            'Draw': 0
        };
        nextPhase();

  } else {

    boxes.forEach(function (square) {
        square.innerHTML = EMPTY;
    });

    prevBoard = phase === 2 ? trainGameConfigs[acc[phase - 1]] : testGameConfigs[acc[phase - 1]];
    convertBoardToBoxes(prevBoard);
    turn = prevBoard.filter(x => x === 0).length === 7 ? 'O' : 'X';
    gamePlayer = turn === 'O' ? 1 : 2;
    acc[phase - 1] += 1;
    moves = 9 - prevBoard.filter(x => x === 0).length;
    document.getElementById('instruction4').textContent = '***** You now play ' + turn + ' *****';
    document.getElementById('instruction5').textContent = 'Once a move is decided, you can click the corresponding '
                                    + 'position on the board, your OPPONENT will respond immediately.';
    document.getElementById('instruction6').textContent = 'From the above board configuration, play your STRATEGY '
                                    + ' against your OPPONENT such that you can WIN or DRAW the game. ';

  }

}


function setGame(box) {
  if (box.innerHTML !== EMPTY || clicked) {
    return;
  }

  clicked = true;
  moves ++;
  box.innerHTML = turn;
  var board = convertBoxesTOBoard();
  var move_score = getMiniMaxScore(prevBoard, board, gamePlayer);
  console.log(String(move_score));

  record += String(board) + '@' + move_score + '|';
  showExplanation(move_score);

  if (win(board, gamePlayer)) {

    score[turn] ++;
    record += '+#';
    score['Player'] ++;
    createButton('You win! Next Game', startNewGame);

  } else if (moves === N_SIZE * N_SIZE) {

    record += '=#';
    score['Draw'] ++;
    createButton('Draw! Next Game', startNewGame);

  } else {

    console.log(String(board));
    var newBoard = computeNextMove(board, 1 + (gamePlayer % 2));
    record += String(newBoard) + '@' + getMiniMaxScore(board, newBoard, 1 + (gamePlayer % 2)) + '|';
    prevBoard = newBoard;
    convertBoardToBoxes(newBoard);
    moves ++;

    if (win(newBoard, 1 + (gamePlayer % 2))) {
        score['Computer'] ++;
        record += '-#';
        createButton('You lost! Next Game', startNewGame);

    } else if (moves === N_SIZE * N_SIZE) {
        record += '=#';
        score['Draw'] ++;
        createButton('Draw! Next Game', startNewGame);
    } else {
        clicked = false;
    }
  }
}