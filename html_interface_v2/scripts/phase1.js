var TOTAL_EXAMPLE = 2,
    N_SIZE = 3,
    EMPTY = '&nbsp;',
    TIMER_SLICE = 1000,
    NUM_GROUP = 3;
var t,
    sec = 0,
    current_example = 0;
var texts = String(window.location).split('=');
var participantID = Number(texts[texts.length - 1]);


function startCount() {
    var totalTime = 30;
    var elapse = Math.max(totalTime - sec, 0);

    if (totalTime - sec < 0) {
        stopCount();
    } else {
        document.getElementById("timer").textContent = 'Remaining time: ' + Math.floor(elapse / 60) + ':' + wrapTime(elapse % 60);
        sec += 1;
        t = setTimeout(startCount, TIMER_SLICE);
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

    current_example += 1;
    clearBoards();

    if (current_example > TOTAL_EXAMPLE) {
        removeChild('nextExampleButton', 'nextExample');
        createButton('nextPhaseButton', 'nextPhase', 'Next Phase', phase2);
    } else {
        nextExample();
        startCount();
    }

}

function wrapTime(time) {

    if (time === 0) {
        return '00';
    } else if (time < 10) {
        time = '0' + time;
    }

    return time;
}

function phase1_instruction() {


}


function phase2() {
    window.location.href = 'phase2-4.html?' + 'participantID=' + participantID;
}

alert('In phase 1, you will see ' + TOTAL_EXAMPLE +
    ' games of Noughts and Crosses. Each GAME starts from 2-ply board. You have 30 SECS to inspect each example.');
document.getElementById('instruction1').textContent = 'Each GAME is either a WIN for X, a LOSE or a DRAW.' +
                        ' For each lost or drawn game, the first bad move is highlighted in ';
document.getElementById('instruction2').textContent = 'RED';
document.getElementById('instruction3').textContent = 'Press \'Next Example\' to continue to the next game.';
stopCount();


