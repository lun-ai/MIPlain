var examples =   ['100211022','212101020','100121220','100010202','020002011','010002012'].map(x=>boardRepreToBoardRotated(x)),
    rightMoves = ['110211022','212111020','110121220','100110202','120002011','010102012'].map(x=>boardRepreToBoardRotated(x)),
    wrongMoves = ['101211022','212101120','101121220','100010212','020102011','110002012'].map(x=>boardRepreToBoardRotated(x)),
    PHASE1_QUESTIONS = (shuffle([]) +
                        shuffle([]) +
                        shuffle([])).map(x=>boardRepreToBoardRotated(x)),
    PHASE3_QUESTIONS = (shuffle([]) +
                        shuffle([]) +
                        shuffle([])).map(x=>boardRepreToBoardRotated(x));

