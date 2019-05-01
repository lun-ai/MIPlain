function showVerbalExpl() {
}

function showVisualExpl() {

    // Neg example
    if (wrongMoves[TOTAL_GAMES - currentGame] != -1) {
        showNegExample(games[TOTAL_GAMES - currentGame],
                       wrongMoves[TOTAL_GAMES - currentGame],
                       positions[TOTAL_GAMES - currentGame]);
        var outcome = games[TOTAL_GAMES - currentGame].length === 7 ? 'Lose' : 'Draw'
        document.getElementById('outcome').textContent = 'Outcome - ' + outcome;
        document
            .getElementById('board' + (games[TOTAL_GAMES - currentGame].length - 1) + 'Comment')
            .textContent = outcome;


    }
    // Pos example
    else {
        showPosExample(games[TOTAL_GAMES - currentGame]);
        document.getElementById('outcome').textContent = 'Outcome - Win';
        document
            .getElementById('board' + (games[TOTAL_GAMES - currentGame].length - 1) + 'Comment')
            .textContent = 'Win';
    }
}


// board has row1-row2-row3 format
function createBoard(board, boardId, parentId, pos, color) {

  var div = document.createElement('td');
  div.setAttribute('id', boardId);

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
          cell.setAttribute('height', 60);
          cell.setAttribute('width',  60);
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

      div.appendChild(table);

      var comment = document.createElement('div');
      comment.setAttribute('id', boardId+'Comment');

      if (color == 'white') {
        comment.textContent = ' -> ';
      } else {
        comment.textContent = 'Bad move';
      }

      comment.classList.add('col');
      comment.align = 'center';
      div.appendChild(comment);
      document.getElementById(parentId).appendChild(div);
  }

}


function clearBoards() {
    for (var i = 0; i < 9; i++) {
        var child = document.getElementById('board'+i);
        if (child != null){
            if (child.parentNode.id == 'example_1') {
                document.getElementById('example_1').removeChild(child);
            } else {
                document.getElementById('example_2').removeChild(child);
            }
        }
    }
}


function showPosExample(example){

    for (var i = 0; i < example.length; i++) {
        createBoard(example[i], 'board'+i, 'example_2', 0, 'white');
    }
}

function showNegExample(example, move, pos){

    for (var i = 0; i < example.length; i++) {
        if (i === move) {
            createBoard(example[i], 'board'+i, 'example_1', changeIndex(pos), 'red');
        } else {
            createBoard(example[i], 'board'+i, 'example_1', 0, 'white');
        }
    }

}


function stopCountPhase3() {

    if (t != null) {
        if (timeTaken.length <= (TOTAL_GAMES - currentGame)) {
            timeTaken.push(Math.min(sec, totalTime));
            console.log(timeTaken);
        }
        clearTimeout(t);
        sec = 0;
    }

    currentGame -= 1;

    clearBoards();

    if (currentGame < 1) {

        removeChild('nextGameButton', 'nextGame');
        document.getElementById('phase').textContent = '';
        document.getElementById('timer').textContent = '';
        document.getElementById('instruction1').textContent = 'In phase 3, you will play 7'
                        + ' games. Each GAME starts from 2-ply board and you will play against '
                        + 'the OPTIMAL opponent. You have 30 SECS for each GAME.';
        document.getElementById('instruction2').textContent = '';
        document.getElementById('instruction3').textContent = '';
        document.getElementById('numGame').textContent = '';
        document.getElementById('outcome').textContent = '';
        removeChild('gameBoard', 'game');

        removeChild('nextExampleButton', 'nextExample');
        createButton('nextPhaseButton', 'nextPhase', 'Next Phase', phase4);

    } else {
        nextExpl();
        startCount();
    }

}


function nextExpl() {

    document.getElementById('numGame').textContent = 'Played game NO.' + (TOTAL_GAMES - currentGame + 1);

    showVisualExpl();
    showVerbalExpl();

    createButton('nextExampleButton', 'nextExample', 'Next', stopCount);
}


function phase3 () {

    removeChild('nextPhaseButton', 'nextPhase');

    record += 'Phase 2: \n'
        + games.map(g => '[\n' + g.join('\n') + '\n]\n')
        + 'cumulative regret: ' + regret + '\n'
        + 'time: ' + timeTaken + '\n'
        + 'moves: ' + wrongMoves + '\n'
        + 'position played: ' + positions;
    timeTaken = [];

    totalTime = 60;
    phase = 3;
    ended = false;

    document.getElementById('phase').textContent = 'Phase No.' + phase;
    document.getElementById('instruction1').textContent = 'For each GAME ' +
                        'you WON, you can check your moves against provided strategy. ';
    document.getElementById('instruction2').textContent =
        'For each other GAME you played, you can look at the first non-optimal move and ' +
        'compare with provided strategy from which you could play otherwise.';
    document.getElementById('instruction3').textContent = 'Press \'Next\' to continue.';

    stopCount();
}







