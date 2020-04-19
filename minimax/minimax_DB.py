"""
Data are formatted as 3 arrays.
First array contains sorted canonical board configuration. array(integer).
Second array contains best move for each of the board configuration. array(integer).
Third array contains reward or penalty for each of the board configuration. array(integer).

One nought on board is marked as 1.
One cross on board is marked as 2.
Blank grid is 0.

A configuration is [s0, s1, s2, s3, s4, s5, s6, s7, s8], for s0 being the
center grid, s1 being the top left grid, and s2 the top middle grid and so on
in clockwise order.
"""

import pickle

# Initialize database with empty board
records = {'000000000': ([], [])}
canonical_map = {'000000000': '000000000'}


# Check for a winning termination
def check_for_win(board, player):
    assert player != 0
    if board[0] == board[1] == board[5] == player:
        return True
    if board[0] == board[3] == board[7] == player:
        return True
    if board[1] == board[2] == board[3] == player:
        return True
    if board[3] == board[4] == board[5] == player:
        return True
    if board[7] == board[6] == board[5] == player:
        return True
    if board[7] == board[8] == board[1] == player:
        return True
    if board[8] == board[0] == board[4] == player:
        return True
    if board[2] == board[0] == board[6] == player:
        return True
    return False


# 8 transformation that is identical to one canonical board representation
def rotate_90_ACW(board):
    rotated_board = [board[0]] + board[3:] + board[1:3]
    assert len(rotated_board) == len(board)
    return rotated_board


def horizontal_mirror(board):
    mirror = [board[0], board[7], board[6], board[5], board[4], board[3], board[2], board[1], board[8]]
    assert len(mirror) == len(board)
    return mirror


def veritical_mirror(board):
    mirror = [board[0], board[3], board[2], board[1], board[8], board[7], board[6], board[5], board[4]]
    assert len(mirror) == len(board)
    return mirror


def left_diagonal_sym(board):
    symmetry = [board[0], board[1], board[8], board[7], board[6], board[5], board[4], board[3], board[2]]
    assert len(symmetry) == len(board)
    return symmetry


def right_diagonal_sym(board):
    symmetry = [board[0], board[5], board[4], board[3], board[2], board[1], board[8], board[7], board[6]]
    assert len(symmetry) == len(board)
    return symmetry


# Count number of moves made by both players add up to a given number
def count_moves_equals(n, board_rep, equals):
    return True if board_rep.count('1') + board_rep.count('2') == n and equals else False


def compute_canonical(board):
    """
    Compute the canonical (least) representation of a board.
    A board is a list of integers 0, 1 or 2. board representations is a board in string form.
    Returns (canonical repre, board).
    """
    b_min = '300000000'
    canonical_board = []
    transformations = [lambda x: x,
                       rotate_90_ACW,
                       lambda x: rotate_90_ACW(rotate_90_ACW(x)),
                       lambda x: rotate_90_ACW(rotate_90_ACW(rotate_90_ACW(x))),
                       horizontal_mirror,
                       veritical_mirror,
                       left_diagonal_sym,
                       right_diagonal_sym]
    for t in transformations:
        transformed = t(board)
        b_repre = ''.join(map(str, transformed))
        if b_repre <= b_min:
            b_min = b_repre
            canonical_board = transformed
    return b_min, canonical_board

def compute_canonical_map(previous, num_free, to_move_player):
    left_space = num_free - 1
    for i in range(len(previous)):
        if previous[i] == 0:
            next = list(previous)
            next[i] = to_move_player
            next_repre = ''.join(map(str, next))
            repre_canonical, next_canonical = compute_canonical(next)

            if not canonical_map.__contains__(next_repre):
                canonical_map[next_repre] = repre_canonical

                if left_space == 0 and not check_for_win(next, to_move_player):
                    canonical_map[next_repre] = repre_canonical
                elif check_for_win(next, to_move_player):
                    canonical_map[next_repre] = repre_canonical
                else:
                    canonical_map[next_repre] = repre_canonical
                    compute_canonical_map(next, left_space, (to_move_player % 2) + 1)


def simulate_boards(previous, num_free, to_move_player):
    """
    Simulate all canonical board settings by DFS. Each board has 8 equivalent configs with respect to rotations and
    reflections.
    """
    left_space = num_free - 1
    next_moves = []
    next_repres_canonical = []
    for i in range(len(previous)):
        if previous[i] == 0:
            next = list(previous)
            next[i] = to_move_player
            repre_canonical, next_canonical = compute_canonical(next)
            next_moves.append(i)
            next_repres_canonical.append(repre_canonical)

            if not records.__contains__(repre_canonical):
                if left_space == 0 and not check_for_win(next_canonical, to_move_player):
                        records[repre_canonical] = ([], [0])
                elif check_for_win(next_canonical, to_move_player):
                    records[repre_canonical] = ([], [-10 + 20 * (to_move_player % 2)])
                else:
                    records[repre_canonical] = ([], [])
                    simulate_boards(next_canonical, left_space, (to_move_player % 2) + 1)

    repre_previous, _ = compute_canonical(previous)
    records[repre_previous][0].extend(next_moves)
    if to_move_player == 1:
        records[repre_previous][1].extend(
            [min(records[next_repres_canonical[i]][1]) for i in range(len(next_repres_canonical))])
    else:
        records[repre_previous][1].extend(
            [max(records[next_repres_canonical[i]][1]) for i in range(len(next_repres_canonical))])


def generate_board_configs():
    """
        Generate canonical board configurations. Perform minimax to get scores of all moves.
        Decay is set to GAMMA. Total canonical configurations 765, terminals 135.
        Number of non-canonical positions 5478.
    """
    simulate_boards([0] * 9, 9, 1)
    compute_canonical_map([0] * 9, 9, 1)
    pickle.dump(records, open('data.m', 'wb'))
    pickle.dump(canonical_map, open('canonical_map.m', 'wb'))
    data = pickle.load(open('data.m', 'rb'))
    c_map = pickle.load(open('canonical_map.m', 'rb'))
    print(data)
    print(c_map)
    acc = 0
    for v in data.values():
        if len(v[0]) == 0:
            acc += 1
    print('Total configs: ' + str(len(data)) + ' - Termination count: ' + str(acc))
    for move in range(0, 10):
        print('Num of Different terminal positions at ' + str(move) + ' is: '
              + str(sum(map(lambda x: count_moves_equals(move, x, len(data[x][0]) == 0),
                            data))) +
              ', Num of Non-terminal positions is: ' +
              str(sum(map(lambda x: count_moves_equals(move, x, len(data[x][0]) != 0), data))))
    print('\nTotal number of Positions: ' + str(len(c_map)))
    v_file = open('vdata.txt', 'w')
    file = open('data.txt', 'w')
    for d in sorted(data):
        v_file.write(visualize_board(list(map(int, list(d)))))
        v_file.write(d + '\n')
        v_file.write(str(data[d]) + '\n\n')
        file.write(d + '\n')
        file.write(str(data[d]) + '\n\n')
    file.close()
    v_file.close()


def visualize_board(board):
    real_board = []
    for grid in board:
        if grid == 0:
            real_board.append(' ')
        elif grid == 1:
            real_board.append('O')
        else:
            real_board.append('X')
    board = ' %s | %s | %s' % (real_board[1], real_board[2], real_board[3]) + '\n'
    board += '---+---+---' + '\n'
    board += ' %s | %s | %s' % (real_board[8], real_board[0], real_board[4]) + '\n'
    board += '---+---+---' + '\n'
    board += ' %s | %s | %s' % (real_board[7], real_board[6], real_board[5]) + '\n'
    return board

# Write pickled data to JS file and assign to a variable
def binary_to_JS():
    import json
    data = pickle.load(open('data.m', 'rb'))
    canonical_map = pickle.load(open('canonical_map.m', 'rb'))
    with open('html_interface_v1/scripts/data.scripts', 'w') as data_file:
        data_file.write('var canonicalData = ')
        json.dump(data, data_file)

    with open('html_interface_v1/scripts/canonicalMap.scripts', 'w') as map_file:
        map_file.write('var canonicalMap = ')
        json.dump(canonical_map, map_file)
    print('-------------- Write completed -------------')

def count_terminals():
    data = pickle.load(open('data.m', 'rb'))
    one_move = [0, 0]
    two_moves = [0, 0]
    three_moves = [0, 0]
    one_position = 0
    two_position = 0
    three_position = 0
    for d in data.values():
        if len(d[1]) == 8:
            one_position += 1
            one_move[0] += sum(filter(lambda x: x == 10, d[1])) / 10
            one_move[1] += sum(filter(lambda x: x == -10, d[1])) / -10
        if len(d[1]) == 7:
            two_position += 1
            print(d)
            two_moves[0] += sum(filter(lambda x: x == 10, d[1])) / 10
            two_moves[1] += sum(filter(lambda x: x == -10, d[1])) / -10
        if len(d[1]) == 6:
            three_position += 1
            three_moves[0] += sum(filter(lambda x: x == 10, d[1])) / 10
            three_moves[1] += sum(filter(lambda x: x == -10, d[1])) / -10
    print('Terminals after one move: ' + str(one_move) + 'positions: ' + str(one_position))
    print('Terminals after two moves: ' + str(two_moves) + 'positions: ' + str(two_position))
    print('Terminals after three moves: ' + str(three_moves) + 'positions: ' + str(three_position))

generate_board_configs()
#binary_to_JS()
#print(visualize_board([1,0,1,1,2,2,0,2,1]))
