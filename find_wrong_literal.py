import os
import numpy as np
import collections

lines = [[0,1,5],
         [1,2,3],
         [3,4,5],
         [3,0,7],
         [1,8,7],
         [4,0,8],
         [5,6,7],
         [2,0,6]]

answers_pre = [[], []]
answers_post = [[], []]
removed_pre = [[], []]
removed_post = [[], []]

control_removed = [1568645135208,1568645248238,1568645315456,1568645579206,1568645804246,1568645823002,1568645952904,1568646805732,1568648969480,1568649496838]
treatment_removed = [1568644977867,1568645090715,1568645316015,1568646477503,1568646741391,1568647328925,1568647833357,1568647883577,1568648608467,1568649695393,1568649910557,1568652434927]


def read_nth_line(file, n):
    file.seek(0, 0)
    for i in range(0, n - 1):
        file.readline()
    return str(file.readline())


def strip_arr_text(attr, text):
    return list(map(float, text.strip(attr + ':').strip(' ').strip('[').split(']')[0].split(',')))


def list_map(f, l):
    return list(map(f, l))


for file_name in os.listdir('./records/island'):
    if file_name.endswith('.txt'):
        with open('./records/island/' + file_name, 'r') as file:
            i = int(file_name.split('.')[0].split('_')[1]) % 2
            id = int(read_nth_line(file, 1).strip('\n'))
            a1 = []
            a1.append(list_map(int, read_nth_line(file, 6).strip('\n').replace('[', '').replace(']', '').split(',')[9:]))
            for line in range(7, 21):
                a1.append(
                    list_map(int, read_nth_line(file, line).strip('\n').replace('[', '').replace(']', '').split(',')[10:]))
            if id in control_removed or id in treatment_removed:
                removed_pre[i].append(a1[5:])
            else:
                answers_pre[i].append(a1[5:])

            a2 = []
            a2.append(
                list_map(int, read_nth_line(file, 49).strip('\n').replace('[', '').replace(']', '').split(',')[9:]))
            for line in range(50, 64):
                a2.append(
                    list_map(int, read_nth_line(file, line).strip('\n').replace('[', '').replace(']', '').split(',')[10:]))
            if id in control_removed or id in treatment_removed:
                removed_post[i].append(a2[5:])
            else:
                answers_post[i].append(a2[5:])


def find_weak_option(B, player):
    ls = []
    for l in lines:
        if count_occ(np.array(B)[l], player) == 1 and count_occ(np.array(B)[l], (player % 2) + 1) == 0:
            ls.append(l)
    return ls


def find_strong_option(B, player):
    ls = []
    for l in lines:
        if count_occ(np.array(B)[l], player) == 2 and count_occ(np.array(B)[l], (player % 2) + 1) == 0:
            ls.append(l)
    return ls


def count_occ(l, m):
    return sum([1 for c in l if m == c])


def check_win_2(B):
    if len(find_strong_option(B, 1)) != 2:
        return 'first condition failed'
    elif len(find_strong_option(B, 2)) != 0:
        return 'second condition failed'
    return 'success'


def check_win_3(B):
    l = find_strong_option(B, 1)

    if len(l) != 1:
        print(B)
        return 'first condition failed'

    B_c = list(B)
    for c in l[0]:
        if B_c[c] != 1:
            B_c[c] = 2

    for idx in range(len(B_c)):
        B_c_c = list(B_c)
        if B_c_c[idx] == 0:
            B_c_c[idx] = 1
            if len(find_strong_option(B_c_c, 1)) == 2 and len(find_strong_option(B_c_c, 2)) == 0:
                return 'success condition failed'
    return 'second'


def check_for_mistakes(answers1, answers2):

    print('--------------------')

    mistakes = {'first condition failed': 0, 'second condition failted': 0, 'success': 0}

    mistakes_pre2 = mistakes.copy()
    mistakes_post2 = mistakes.copy()
    mistakes_pre3 = mistakes.copy()
    mistakes_post3 = mistakes.copy()

    for ans in answers1:
        for p in ans[:5]:
            mistakes_pre2[check_win_2(p)] += 1
        for p in ans[5:]:
            mistakes_pre3[check_win_3(p)] += 1

    for ans in answers2:
        for p in ans[:5]:
            mistakes_post2[check_win_2(p)] += 1
        for p in ans[5:]:
            mistakes_post3[check_win_3(p)] += 1

    print('depth 2: ')
    print(mistakes_pre2)
    print(mistakes_post2)
    print('depth 3: ')
    print(mistakes_pre3)
    print(mistakes_post3)
    print('\n')

print('Control selected:')
check_for_mistakes(answers_pre[0], answers_post[0])
print('Treatment selected:')
check_for_mistakes(answers_pre[1], answers_post[1])
print('Control removed:')
check_for_mistakes(removed_pre[0], removed_post[0])
print('Treatment removed:')
check_for_mistakes(removed_pre[1], removed_post[1])
