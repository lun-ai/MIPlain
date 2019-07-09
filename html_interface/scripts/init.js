/**
 * Initializes first board.
 */
function init() {

  var board = document.createElement('table');
  board.setAttribute('border', 1);
  board.setAttribute('cellspacing', 0);
  board.classList.add('table1');

  for (var i = 0; i < N_SIZE; i++) {

    var row = document.createElement('tr');
    board.appendChild(row);

    for (var j = 0; j < N_SIZE; j++) {

      var cell = document.createElement('td');
      cell.setAttribute('height', 120);
      cell.setAttribute('width', 120);
      cell.setAttribute('align', 'center');
      cell.setAttribute('valign', 'center');

      cell.addEventListener('click', boardClicked);
      row.appendChild(cell);
      boxes.push(cell);

    }
  }

  document.getElementById('tictactoe').appendChild(board);
  nextPhase();
}

init();