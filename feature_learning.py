import pickle
import random
import minimax_DB as nc

data = pickle.load(open('data.m', 'rb'))
canonical = pickle.load(open('canonical_map.m', 'rb'))

def board_change_ori(board):
    newBoard = ['e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e']
    keys = ['e', 'o', 'x']

    newBoard[4] = keys[board[0]]
    newBoard[0] = keys[board[1]]
    newBoard[1] = keys[board[2]]
    newBoard[2] = keys[board[3]]
    newBoard[5] = keys[board[4]]
    newBoard[7] = keys[board[6]]
    newBoard[8] = keys[board[5]]
    newBoard[6] = keys[board[7]]
    newBoard[3] = keys[board[8]]

    return newBoard

def get_examples_from_valid_states():
    win_1 = []
    win_2 = []
    win_3 = []
    draw_1 = []
    draw_2 = []
    draw_3 = []
    draw_4 = []
    neg_1 = []
    neg_2 = []
    neg_3 = []
    for d in data:
        if len(data[d][0]) == 1:
            for i in range(len(data[d][0])):
                if data[d][1][i] == 0:
                    b = map(int, list(d))
                    bstr1 = ','.join(board_change_ori(b))
                    b[data[d][0][i]] = 1
                    bstr2 = ','.join(board_change_ori(b))
                    draw_1.append('draw_1(s(o,_,b(%s)), s(x,_,b(%s)))' % (bstr1, bstr2))

        if len(data[d][0]) == 3:
            for i in range(len(data[d][0])):
                if data[d][1][i] == 10:
                    b = map(int, list(d))
                    bstr1 = ','.join(board_change_ori(b))
                    b[data[d][0][i]] = 1
                    bstr2 = ','.join(board_change_ori(b))
                    win_1.append('win_1(s(o,_,b(%s)), s(x,_,b(%s)))' % (bstr1, bstr2))
                if data[d][1][i] == 0:
                    b = map(int, list(d))
                    bstr1 = ','.join(board_change_ori(b))
                    b[data[d][0][i]] = 1
                    bstr2 = ','.join(board_change_ori(b))
                    draw_2.append('win_1(s(o,_,b(%s)), s(x,_,b(%s)))' % (bstr1, bstr2))
                if 10 in data[d][1] and data[d][1][i] != 10:
                    b = map(int, list(d))
                    bstr1 = ','.join(board_change_ori(b))
                    b[data[d][0][i]] = 1
                    bstr2 = ','.join(board_change_ori(b))
                    neg_1.append('win_1(s(o,_,b(%s)), s(x,_,b(%s)))' % (bstr1, bstr2))


        if len(data[d][0]) == 5:
            for i in range(len(data[d][0])):
                if data[d][1][i] == 10:
                    b = map(int, list(d))
                    bstr1 = ','.join(board_change_ori(b))
                    b[data[d][0][i]] = 1
                    bstr2 = ','.join(board_change_ori(b))
                    win_2.append('win_2(s(o,_,b(%s)), s(x,_,b(%s)))' % (bstr1, bstr2))
                if data[d][1][i] == 0:
                    b = map(int, list(d))
                    bstr1 = ','.join(board_change_ori(b))
                    b[data[d][0][i]] = 1
                    bstr2 = ','.join(board_change_ori(b))
                    draw_3.append('win_2(s(o,_,b(%s)), s(x,_,b(%s)))' % (bstr1, bstr2))
                if 10 in data[d][1] and data[d][1][i] != 10:
                    b = map(int, list(d))
                    bstr1 = ','.join(board_change_ori(b))
                    b[data[d][0][i]] = 1
                    bstr2 = ','.join(board_change_ori(b))
                    neg_2.append('win_2(s(o,_,b(%s)), s(x,_,b(%s)))' % (bstr1, bstr2))

        if len(data[d][0]) == 7:
            for i in range(len(data[d][0])):
                if data[d][1][i] == 10:
                    b = map(int, list(d))
                    bstr1 = ','.join(board_change_ori(b))
                    b[data[d][0][i]] = 1
                    bstr2 = ','.join(board_change_ori(b))
                    win_3.append('win_3(s(o,_,b(%s)), s(x,_,b(%s)))' % (bstr1, bstr2))
                if data[d][1][i] == 0:
                    b = map(int, list(d))
                    bstr1 = ','.join(board_change_ori(b))
                    b[data[d][0][i]] = 1
                    bstr2 = ','.join(board_change_ori(b))
                    draw_4.append('win_3(s(o,_,b(%s)), s(x,_,b(%s)))' % (bstr1, bstr2))
                if 10 in data[d][1] and data[d][1][i] != 10:
                    b = map(int, list(d))
                    bstr1 = ','.join(board_change_ori(b))
                    b[data[d][0][i]] = 1
                    bstr2 = ','.join(board_change_ori(b))
                    neg_3.append('win_3(s(o,_,b(%s)), s(x,_,b(%s)))' % (bstr1, bstr2))

    # print('win\n\n%s\n\n%s\n\n%s' % (',\n'.join(win_1), ',\n'.join(win_2), ',\n'.join(win_3)))
    # print('draw\n\n%s\n\n%s\n\n%s\n\n%s' % (',\n'.join(draw_1), ',\n'.join(draw_2), ',\n'.join(draw_3), ',\n'.join(draw_4)))
    # print('Neg for win\n\n%s\n\n%s\n\n%s' % (',\n'.join(neg_1), ',\n'.join(neg_2), ',\n'.join(neg_3)))

    print('Pos *********** \n\n%s\n\n%s\n\n%s' % (',\n'.join(win_1), ',\n'.join(win_2), ',\n'.join(win_3)))
    print('\nNeg *********** \n\n%s\n\n%s\n\n%s' % (',\n'.join(neg_1), ',\n'.join(neg_2), ',\n'.join(neg_3)))
    
def get_examples_from_minimax_games(N):
    two_ply_states = []
    win_1_pos = []
    win_2_pos = []
    win_3_pos = []
    win_1_neg = []
    win_2_neg = []
    win_3_neg = []

    win_pos = [win_3_pos, win_2_pos, win_1_pos]
    win_neg = [win_3_neg, win_2_neg, win_1_neg]
    win = ['win_3', 'win_2', 'win_1']

    for d in data:
        if len(data[d][0]) == 7:
            two_ply_states.append(d)
    for _ in range(N):
        b_repre = random.choice(two_ply_states)

        for i in range(len(win)):

            rand_ind = random.randrange(len(data[b_repre][0]))
            b_repre = get_example_aux(b_repre, rand_ind, win_pos[i], win_neg[i], win[i])
            if b_repre == None or len(data[b_repre][0]) == 0:
                break
            rand_move = random.choice([data[b_repre][0][i] for i in range(len(data[b_repre][0])) if data[b_repre][1][i] == min(data[b_repre][1])])
            b = list(map(int, list(b_repre)))
            b[rand_move] = 2

            b_repre, _ = nc.compute_canonical(b)
            if len(data[b_repre][0]) == 0:
                break

    print('Pos *********** \n\n%s\n\n%s\n\n%s' % (',\n'.join(win_1_pos), ',\n'.join(win_2_pos), ',\n'.join(win_3_pos)))
    print('\nNeg *********** \n\n%s\n\n%s\n\n%s' % (',\n'.join(win_1_neg), ',\n'.join(win_2_neg), ',\n'.join(win_3_neg)))

    # print('Pos *********** \n\n%s\n\n%s\n\n%s' % ('.\n'.join(win_1_pos), '.\n'.join(win_2_pos), '.\n'.join(win_3_pos)))
    # print('\nNeg *********** \n\n%s\n\n%s\n\n%s' % ('.\n'.join(win_1_neg), '.\n'.join(win_2_neg), '.\n'.join(win_3_neg)))

def get_example_aux(board_repre, i, pos, neg, name):
    if data[board_repre][1][i] == 10:

        b = list(map(int, list(board_repre)))
        bstr1 = ','.join(board_change_ori(b))
        b[data[board_repre][0][i]] = 1
        bstr2 = ','.join(board_change_ori(b))
        pos.append('%s(s(o,_,b(%s)), s(x,_,b(%s)))' % (name, bstr1, bstr2))

        return nc.compute_canonical(b)[0]

    if 10 in data[board_repre][1] and data[board_repre][1][i] != 10:

        b = list(map(int, list(board_repre)))
        bstr1 = ','.join(board_change_ori(b))
        b[data[board_repre][0][i]] = 1
        bstr2 = ','.join(board_change_ori(b))
        neg.append('%s(s(o,_,b(%s)), s(x,_,b(%s)))' % (name, bstr1, bstr2))

        return nc.compute_canonical(b)[0]

def get_games():
    pos_games = []
    neg_games = []
    moves = []
    positions = []




# get_examples_from_minimax_games(100)
# get_examples_from_valid_states()
# get_games()