############################################################
## Q-learning tic-tac-toe(accessed 14 April, 2019). url:https://gist.github.com/fheisler/430e70fa249ba30e707f.
############################################################

from subprocess import call
import os

open('./output/q.txt', 'w').close()
with open(os.devnull, "w") as f:
    for i in range(10):
        call(['python', 'q.py'], stdout=f)
        print('Round' + str(i+1))