from subprocess import call
import os

file = open('./output/MIGO.txt','w').close()
with open(os.devnull, "w") as f:
    for i in range(10):
        call(['swipl', '-s', 'experiment.pl', '-g', 'goal(' + str(400) + ').', '-t', 'halt'], stdout=f)
        print('Round' + str(i+1))