// render verbal explanations in html
function showVerbalExpl() {
    document.getElementById('explanation' + (participantID % 3)).style.display = 'block';
}

// show good games and bad games w/o explanations
function showVisualExpl() {

    var game = games[TOTAL_GAMES - currentGame];

    if (wrongMoves[TOTAL_GAMES - currentGame] != -1) {

        // Mistake
        var wrongMoveIdx = wrongMoves[TOTAL_GAMES - currentGame];
        var pos = positions[TOTAL_GAMES - currentGame];
        var outcome = win(game[game.length - 1], 2) ? 'Lose' : game.length == 8 ? 'Draw' : 'Unfinished';

        showNegExample(game, wrongMoveIdx, pos);
        document.getElementById('example_1_comment').textContent = 'Game NO.' + (TOTAL_GAMES - currentGame + 1)
                                                                 + ' played by you: ' + outcome;

        if (participantID % 3 != 0) {
            // treatment group
            var newGame = game.slice(0, wrongMoveIdx - 1).concat(learnerPlayGame(game[wrongMoveIdx - 1]));
            document.getElementById('example_2_comment').textContent = 'Played by strategy: Win';
            showPosExample(newGame, wrongMoves[TOTAL_GAMES - currentGame]);
            document.getElementById('posboard' + (newGame.length - 1) + 'Comment').textContent = 'Win';

        } else {
            // control group
            var count = Math.floor((wrongMoveIdx + 1) / 2);
            count = count + (count == 1 ? 'st' : count == 2 ? 'nd' : 'rd');
            document.getElementById('negboard' + wrongMoveIdx + 'Comment').textContent = 'Bad ' + count + ' move';
        }

        document.getElementById('negboard' + (game.length - 1) + 'Comment').textContent = outcome;

    }
    // No mistake
    else {
        showPosExample(game);
        document.getElementById('example_2_comment').textContent = 'Played by you: Win';
        document.getElementById('posboard' + (game.length - 1) + 'Comment').textContent = 'Win';
    }
}


// board has row1-row2-row3 format
function createBoard(board, boardNum, boardId, parentId, pos, color) {

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
              cell.setAttribute('height', 40);
              cell.setAttribute('width',  40);
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

      var count = Math.floor((boardNum + 1) / 2);
      count = count + (count == 1 ? 'st' : count == 2 ? 'nd' : 'rd');

      // green for a good move and red for a bad move
      if (color == 'green') {
          comment.textContent = 'Correct ' + count + ' move' ;
      } else if (color == 'red') {
          comment.textContent = 'Violates ' + count + ' rule';
      } else {
          if (boardNum % 2 == 1) {
              comment.textContent = count + ' move';
          } else {
              comment.textContent = ' => ';
          }
      }

      comment.classList.add('col');
      comment.align = 'center';
      div.appendChild(comment);
      document.getElementById(parentId).appendChild(div);
  }

}


function clearBoards() {
    for (var i = 0; i < 9; i++) {

        var child = document.getElementById('posboard'+i);
        if (child != null){
            if (child.parentNode.id == 'example_1') {
                document.getElementById('example_1').removeChild(child);
            } else {
                document.getElementById('example_2').removeChild(child);
            }
        }

        child = document.getElementById('negboard'+i);
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
        createBoard(example[i], 'posboard'+i, 'example_2', 0, 'white');
    }
}


function showPosExample(example, move){
    for (var i = 0; i < example.length; i++) {
        if (i === move) {
            var pos = example[i].map(function(_, j) { return example[i][j] != example[i - 1][j] ? j : -1;})
                                         .filter(j => j != -1)[0];
            createBoard(example[i], i, 'posboard'+i, 'example_2', changeIndex(pos), 'green');
        } else {
            createBoard(example[i], i, 'posboard'+i, 'example_2', 0, 'white');
        }
    }
}


function showNegExample(example, move, pos){

    for (var i = 0; i < example.length; i++) {
        if (i === move) {
            if (pos == N_SIZE * N_SIZE) {
                createBoard(example[i], i, 'negboard'+i, 'example_1', 0, 'white');
            } else {
                createBoard(example[i], i, 'negboard'+i, 'example_1', changeIndex(pos), 'red');
            }
        } else {
            createBoard(example[i], i, 'negboard'+i, 'example_1', 0, 'white');
        }
    }

}


function stopCountPhase3() {

    if (timeTaken.length <= (TOTAL_GAMES - currentGame)) {
        timeTaken.push(Math.min(Math.max(0, sec - 1), totalTime));
    }

    if (t != null) {
        clearTimeout(t);
        sec = 0;
    }

    currentGame -= 1;

    clearBoards();

    if (currentGame < 1) {

        document.getElementById('phase').textContent = '';
        document.getElementById('timer').textContent = '';
        document.getElementById('instruction1').textContent = 'In phase 4, you will play 7'
                        + ' games. Each GAME starts from 2-ply board and you will play against '
                        + 'the OPTIMAL opponent. You have 30 SECS for each GAME.';
        document.getElementById('instruction2').textContent = '';
        document.getElementById('instruction3').textContent = '';
        document.getElementById('numGame').textContent = '';
        document.getElementById('outcome').textContent = '';
        document.getElementById('example_1_comment').textContent = '';
        document.getElementById('example_2_comment').textContent = '';
        document.getElementById('explanation1').style.display = 'none';
        document.getElementById('explanation2').style.display = 'none';
        removeChild('gameBoard', 'game');

        removeChild('nextGameButton', 'nextGame');
        removeChild('nextExampleButton', 'nextExample');
        createButton('nextPhaseButton', 'nextPhase', 'Continue', phase4);

    } else {
        nextExpl();
        startCount();
    }

}


function nextExpl() {

    removeChild('nextExampleButton', 'nextExample');
    document.getElementById('example_1_comment').textContent = '';
    document.getElementById('example_2_comment').textContent = '';

    showVisualExpl();
    if (participantID % 3 != 0) {
        showVerbalExpl();
    }

    if(currentGame > 1) {
        createButton('nextExampleButton', 'nextExample', 'Next', stopCount);
    } else {
        createButton('nextGameButton', 'nextGame', 'Next', stopCount);
    }
}


function phase3 () {

    removeChild('nextPhaseButton', 'nextPhase');

    record += 'Phase 2: \n'
        + games.map(g => '[\n' + g.join('\n') + '\n]\n')
        + 'cumulative regrets: ' + regrets + '\n'
        //+ 'strategy regrets:' + strategyRegrets + '\n'
        + 'time: ' + timeTaken + '\n'
        + 'moves: ' + wrongMoves + '\n'
        + 'position played: ' + positions;
    timeTaken = [], strategyRegrets = [];

    console.log(record);

    totalTime = 60,
    phase = 3,
    ended = false;

    document.getElementById('phase').textContent = 'Phase No.' + phase;

    document.getElementById('instruction1').textContent = '';
    document.getElementById('instruction2').textContent = '';
    document.getElementById('instruction3').textContent = '';

    stopCount();
}







