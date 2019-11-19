var examples =   ['100211022','212101020','112200012','100010202','010002012','020002011','002001000','001002000','000001020'].map(x=>boardRepreToBoardRotated(x)),
    rightMoves = ['110211022','212111020','112201012','100110202','010102012','120002011','002001010','001102000','010001020'].map(x=>boardRepreToBoardRotated(x)),
    wrongMoves = ['101211022','212101120','112210012','100010212','110002012','020102011','002001001','101002000','100001020'].map(x=>boardRepreToBoardRotated(x)),
    PHASE1_QUESTIONS = ['110102022','100220211','200101212','100112202','112102002'].sort((a, b)=> sortTestBoardsAscend(a,b))
                       .concat(['100120020','000001212','100100022','000002112','210001020'].sort((a, b)=> sortTestBoardsAscend(a,b)))
                       .concat(['000001200','010002000','000100002','100020000','001000002'].sort((a, b)=> sortTestBoardsAscend(a,b)))
                       .map(x=>boardRepreToBoardRotated(x)),
    PHASE3_QUESTIONS = ['112202010','102110022','212101002','102001122','110200212'].sort((a, b)=> sortTestBoardsAscend(a,b))
                       .concat(['110002002','012100002','122001000','012000021','220100010'].sort((a, b)=> sortTestBoardsAscend(a,b)))
                       .concat(['010000002','000100020','000100200','102000000','000010200'].sort((a, b)=> sortTestBoardsAscend(a,b)))
                       .map(x=>boardRepreToBoardRotated(x));
    PHASE4_QUESTIONS = [[[1,1,2,2,0,2,0,1,0],[1,1,2,2,0,2,0,1,1]],
                        [[1,2,2,0,0,1,0,0,0],[1,2,2,1,0,1,0,0,0]],
                        [[0,0,0,1,0,0,0,2,0],[1,0,0,1,0,0,0,2,0]]];

