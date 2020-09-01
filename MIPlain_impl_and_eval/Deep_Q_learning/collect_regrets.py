############################################################
## Solving tic-tac-toe using deep reinforcement learning.(accessed 14 April, 2019).url:https://github.com/yanji84/tic-tac-toe-rl.
############################################################

from subprocess import call
import os

open('./output/DQN.txt', 'w').close()
# with open(os.devnull, "w") as f:
call(['python', 'train.py'])
print('finished')
