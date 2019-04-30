function startCount() {

    var totalTime = (phase % 2 === 0 && explShown) ? PHASE_TIME_SETTING[phase - 1] * 2 : PHASE_TIME_SETTING[phase - 1];
    var elapse = Math.max(totalTime - sec, 0);

    if (totalTime - sec < 0) {

        stopCount();

        if (phase % 2 === 0 && !explShown) {

            removeButton('nextQuestion', 'next');
            explShown = true;
            startCount();
            wrongMoveBoard = prevBoard;

            if (withExpl) {

                acc[phase] = 0;
                consultStrategy(prevBoard, prevBoard);
                showExplanation(prevBoard);
                createButton('proceed', 'nextQuestionAfterExpl', 'Proceed', startNewQuestion);

            } else {

                acc[phase] = 0;
                consultStrategy(prevBoard, prevBoard);
                document.getElementById('explSimple').textContent = 'No Move!';
                createButton('proceed', 'nextQuestionAfterExpl', 'Proceed', startNewQuestion);

            }
        } else {
            setTimeout(startNewQuestion, 0.5 * TIMER_SLICE);
        }

    } else {
        document.getElementById("timer").textContent = 'Remaining Time: ' + Math.floor(elapse / 60) + ':' + wrapTime(elapse % 60);
        sec = sec + 1;
        t = setTimeout(startCount, TIMER_SLICE);
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


function stopCount() {
    if (t != null) {
        clearTimeout(t);
        sec = 0;
    }
}


function createButton(buttonId, parentId, text, func) {
    var button = document.getElementById(buttonId);

    if (button === null) {
        button = document.createElement('Button');
        document.getElementById(parentId).appendChild(button)
    }

    button.type = 'button';
    button.style.width = '80px';
    button.style.height = '35px';
    button.id = buttonId;
    button.textContent = text;
    button.onclick = func;
}


function removeButton(buttonId, parentId) {
    var child = document.getElementById(buttonId);
    if (child != null){
       document.getElementById(parentId).removeChild(child);
    }
}


function showExplBoard(board, boardId, parentId, pos, color) {

  if (board.length !== 0) {

      var newBoard = changeLabelsOnBoard(board);
      var table = document.createElement('table');
      table.setAttribute('id', boardId);
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
          cell.innerHTML = newBoard[i * 3 + j] === 'e' ? EMPTY : newBoard[i * 3 + j];
        }
      }
      document.getElementById(parentId).appendChild(table);
      document.getElementById(parentId + 'Label').textContent = boardId;
  }

}


function clearExplBoard(boardId, parentId) {
    var child = document.getElementById(boardId);
    if (child != null){
       document.getElementById(parentId).removeChild(child);
    }
    document.getElementById(parentId + 'Label').textContent = '';
}


function parsePrologVar(sub){
    return inverseLabelsOnBoard(sub.toString().split('(')[2].split(')')[0].split(', '));
}


/*
    Change number labels to o / x labels on a board and switch positioning of cells.
*/
function changeLabelsOnBoard(board) {
    var newBoard = ['e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e'],
        keys = ['e', 'o', 'x'];
    newBoard[4] = keys[board[0]];
    newBoard[0] = keys[board[1]];
    newBoard[1] = keys[board[2]];
    newBoard[2] = keys[board[3]];
    newBoard[5] = keys[board[4]];
    newBoard[7] = keys[board[6]];
    newBoard[8] = keys[board[5]];
    newBoard[6] = keys[board[7]];
    newBoard[3] = keys[board[8]];
    return newBoard;
}


/*
    Inverse o / x labels to number labels on a board and switch positioning of cells.
*/
function inverseLabelsOnBoard(board) {
    var rightOrder = ['e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e'],
        newBoard = [];
    rightOrder[0] = board[4];
    rightOrder[1] = board[0];
    rightOrder[2] = board[1];
    rightOrder[3] = board[2];
    rightOrder[4] = board[5];
    rightOrder[6] = board[7];
    rightOrder[5] = board[8];
    rightOrder[7] = board[6];
    rightOrder[8] = board[3];
    rightOrder.map(function(x) {
                        if (x === 'o') {
                            newBoard.push(1);
                        } else if (x === 'x') {
                            newBoard.push(2);
                        } else {
                            newBoard.push(0);
                        }});
    return newBoard;
}