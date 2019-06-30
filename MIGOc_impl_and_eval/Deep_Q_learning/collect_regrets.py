from subprocess import call
import os

open('./output/DQN.txt', 'w').close()
# with open(os.devnull, "w") as f:
call(['python', 'train.py'])
print('finished')
