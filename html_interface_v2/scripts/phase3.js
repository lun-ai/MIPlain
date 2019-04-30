function showVerbalExpl() {
}

function showVisualExpl() {
    // mistake
    if(wrongMoves[TOTAL_GAMES - currentGame] != -1) {
    } else {
    }
}

function nextExample() {

    document.getElementById('numExample').textContent = 'Example NO.' + current_example;
    createButton('nextExampleButton', 'nextExample', 'Next example', stopCount);

    // Neg example
    if (current_example % 2 === 0) {
        showNegExample(examples[current_example - 1],
                       moves[Math.floor(current_example / 2) - 1],
                       positions[Math.floor(current_example / 2) - 1]);
        var outcome = examples[current_example - 1].length === 7 ? 'Lose' : 'Draw'
        document.getElementById('outcome').textContent = 'Outcome - ' + outcome;
        document.getElementById('board' + (examples[current_example - 1].length - 1) + 'Comment').textContent = outcome;
    }
    // Pos example
    else {
        showPosExample(examples[current_example - 1]);
        document.getElementById('outcome').textContent = 'Outcome - Win';
        document.getElementById('board' + (examples[current_example - 1].length - 1) + 'Comment').textContent = 'Win';
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
            document.getElementById('example').removeChild(child);
        }
    }
}


function showPosExample(example){

    for (var i = 0; i < example.length; i++) {
        createBoard(boardRepreToBoardRotated(example[i]), 'board'+i, 'example', 0, 'white');
    }
}

function showNegExample(example, move, pos){

    for (var i = 0; i < example.length; i++) {
        if (i === move) {
            createBoard(boardRepreToBoardRotated(example[i]), 'board'+i, 'example', changeIndex(pos), 'red');
        } else {
            createBoard(boardRepreToBoardRotated(example[i]), 'board'+i, 'example', 0, 'white');
        }
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
        nextExpl();
        startCount();
    }

}


function nextExpl() {
    currentGame -= 1;

    showVerbalExpl();
    showVisualExpl();
}


while(!phase3_start) {
}

var totalTime = 60;




