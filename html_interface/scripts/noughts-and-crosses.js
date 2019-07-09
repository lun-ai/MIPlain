/**
 * Sets clicked square and also updates the turn.
 */
function boardClicked() {
    if (!ended && !explShown) {
        convertBoardToBoxes(prevBoard);
        if (this.innerHTML !== EMPTY) {
            return;
        }
        this.innerHTML = turn;
        createButton('nextQuestion', 'next', 'Proceed', setQuestion);
    }
}

function endExp(){

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(record));
    element.setAttribute('download', participantID + '@' + Number(withExpl) + '#' + Date.now() + '.txt');

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    window.location.href = 'submission.html';
}

function nextPhase() {

    phase += 1;
    record += '\n';

    if (phase > PHASE_SETTING.length) {
        stopCount();
        document.getElementById('phase').textContent = 'End of Session';
        document.getElementById('instruction1').textContent = 'Instructions on submitting the record:';
        document.getElementById('instruction2').textContent = '1) Open a new tab in browser';
        document.getElementById('instruction3').textContent = '2) Copy the URL and go to the submission page https://driveuploader.com/upload/cOyGrqRFuT/';
        document.getElementById('instruction4').textContent = '3) Choose and submit the record file that you just downloaded, e.g. with name like x@x#xxxxxxx.txt';
        document.getElementById('instruction5').textContent = '';
        document.getElementById('instruction6').textContent = 'Thank you for submitting the record and finishing the session!';

        var tictactoe = document.getElementById("tictactoe");
        tictactoe.parentNode.removeChild(tictactoe);

        ended = true;
        endExp();
    } else {
        console.log('Phase: ' + PHASE_NAMES[phase - 1]);
        document.getElementById('phase').textContent = PHASE_NAMES[phase - 1];
        document.getElementById('feedback').textContent = 'Feedback Panel';

        if (phase === 1) {
            alert(PHASE_NAMES[phase - 1] + '. You are going to answers '
                        + PHASE_SETTING[phase - 1]
                        + ' questions. You have '
                        + PHASE_TIME_SETTING[phase - 1] + ' seconds for each question.');
            record += 'Phase 1\n'
        } else if (acc[phase - 1] === 0) {
            var alertMsg = PHASE_NAMES[phase - 1] + '. You are going to answers '
                        + PHASE_SETTING[phase - 1]
                        + ' questions. You have '
                        + PHASE_TIME_SETTING[phase - 1] + ' seconds for each question. ';
            if (phase % 2 === 0) {
                alertMsg += 'And you have ' + PHASE_TIME_SETTING[phase - 1]* 2 + ' seconds for reflecting your made choice. '
            }
            record += 'Phase ' + phase + '\n'
            alert(alertMsg);
        }
//        if (phase === 2 || phase === 4) {
//            document.getElementById('instruction1').textContent = 'During this stage, you are going to play '
//                        + PHASE_SETTING[phase - 1] + ' games against a COMPUTER.';
//            document.getElementById('instruction2').textContent = 'Your OPPONENT plays according to MINIMAX.';
//            startCount();
//            startNewGame();
//        } else
//        document.getElementById('instruction1').textContent = 'During this stage, you are going to answers '
//                        + PHASE_SETTING[phase - 1]
//                        + ' questions. You have '
//                        + PHASE_TIME_SETTING[phase - 1] + ' seconds for each question.';
        document.getElementById('instruction3').textContent = '';
        startNewQuestion();
    }
}
