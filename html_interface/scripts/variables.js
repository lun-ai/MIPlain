var N_SIZE = 3,
    EMPTY = '&nbsp;',
    RESOLUTION_DEPTH = 15000, // 5000, 10000 resolution depth are not sufficient for finding all boards that satisfy win_3 rule at move 2
    PHASE_SETTING = [8, 3, 5, 3, 5, 2, 2],
    PHASE_NAMES = [ 'Background Test',
                    'Train 4th Move',
                    'Test 4th Move',
                    'Train 3rd Move',
                    'Test 3rd Move',
                    'Train 2nd Move',
                    'Test 2nd Move' ],
    PHASE_TIME_SETTING = [30, 30, 30, 30, 30, 30, 30], //
    WAIT_TIME = 50,
    TIMER_SLICE = 1000,
    PL_FILE_NAME = 'strategy.pl';

var boxes = [],
    sec = 0,
    t,
    turn = 'O',
    score = {
        'Player': 0,
        'Computer': 0,
        'Draw': 0
    },      // Unused
    maxGameNum = 10,
    moves,
    ended = false,
    explShown = false,
    minimaxTable = canonicalData,
    boardRepreToCanonical = canonicalMap,
    record = '',
    prevBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0],
    acc = [ 0,
            PHASE_SETTING[1],
            PHASE_SETTING[2],
            PHASE_SETTING[3],
            PHASE_SETTING[4],
            PHASE_SETTING[5],
            PHASE_SETTING[6] ],     // count from 0 until equals PHASE_SETTING
    ansSubmitted = true,
    phase = 0,
    gamePlayer = -1,
    sampledQuestions = [],
    wrongQuestionTypes = [],
    questionScore = -100,
    wrongMoveBoard = [],
    suggestionB = [],       // to store each viable binding of the variable B and D in the violated rule
    suggestionD1 = [],
    suggestionD2 = [];

var texts = String(window.location).split('=');
var participantID = Number(texts[texts.length - 1]);
var withExpl = participantID % 2 === 1;
console.log('With explanation: ' + withExpl);

var questionConfigs = [ JSON.parse(JSON.stringify(partitions[1])),
                        JSON.parse(JSON.stringify(partitions[3])),
                        JSON.parse(JSON.stringify(partitions[5])) ];

var questionConfigsDup = [ JSON.parse(JSON.stringify(partitions[1])),
                           JSON.parse(JSON.stringify(partitions[3])),
                           JSON.parse(JSON.stringify(partitions[5])) ];