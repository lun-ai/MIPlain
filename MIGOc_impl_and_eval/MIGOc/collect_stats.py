from subprocess import call
import os
import numpy as np
import matplotlib.pyplot as plt


def get_inference():
    # open('./output/inference.txt', 'w').close()
    open('./output/rule_inference_a.txt', 'w').close()
    open('./output/rule_inference_b.txt', 'w').close()
    with open(os.devnull, "w") as f:

        for i in range(0, 50):
            call(['swipl', '-s', 'test_inference.pl', '-g', 'get_rule_inference(a,' + str(100) + ').', '-t', 'halt'],
                 stdout=f)
        print('Statistics Collected')

        for i in range(0, 50):
            call(['swipl', '-s', 'test_inference.pl', '-g', 'get_rule_inference(b,' + str(100) + ').', '-t', 'halt'],
                 stdout=f)
        print('Statistics Collected')


        # for i in range(0, 50):
        #     call(
        #         ['swipl', '-s', 'test_inference.pl', '-g', 'get_strategy_inference(a,' + str(100) + ').', '-t', 'halt'],
        #         stdout=f)
        # print('Statistics Collected')
        #
        # for i in range(0, 50):
        #     call(
        #         ['swipl', '-s', 'test_inference.pl', '-g', 'get_strategy_inference(b,' + str(100) + ').', '-t', 'halt'],
        #         stdout=f)
        # print('Statistics Collected')


def plot_rule_inference_graph():
    l1 = []
    l2 = []
    with open('./output/rule_inference_a.txt', 'r') as f:
        for line in f:
            l1.append(list(map(float, line.strip('\n').strip().strip('[').strip(']').split(','))))

    with open('./output/rule_inference_b.txt', 'r') as f:
        for line in f:
            l2.append(list(map(float, line.strip('\n').strip().strip('[').strip(']').split(','))))
    print(l1)
    print(l2)

    p = [list(np.average(l1[2::3], axis=0)),
         list(np.average(l1[1::3], axis=0)),
         list(np.average(l1[::3], axis=0)),
         list(np.average(l2[2::3], axis=0)),
         list(np.average(l2[1::3], axis=0)),
         list(np.average(l2[::3], axis=0))]
    p2 = []
    for k in range(len(p)):
        p[k] = [float(np.sum(p[k][:i + 1])) for i in range(0, len(p[k]))]
        p[k].insert(0, 0)
        p2.append(p[k])
        print(p[k])

    plt.plot(np.arange(0, 101, 1), np.array(p2[0]), label='MIGOc win 1')
    plt.plot(np.arange(0, 101, 1), np.array(p2[1]), label='MIGOc win 2')
    plt.plot(np.arange(0, 101, 1), np.array(p2[2]), label='MIGOc win 3')
    plt.plot(np.arange(0, 101, 1), np.array(p2[3]), label='MIGO win 1')
    plt.plot(np.arange(0, 101, 1), np.array(p2[4]), label='MIGO win 2')
    plt.plot(np.arange(0, 101, 1), np.array(p2[5]), label='MIGO win 3')
    plt.title('Run-time performance measured by logic inference')
    plt.xlabel('NO.Games')
    plt.ylabel('Cumulative NO. inference in Prolog')
    plt.legend()
    plt.show()


def plot_inference_graph():
    l = []
    with open('./output/inference.txt', 'r') as f:
        for line in f:
            l.append(list(map(float, line.strip('\n').strip().strip('[').strip(']').split(','))))

    a = l[:50]
    b = l[50:100]

    a = list(np.average(a, axis=0))
    a = [float(np.sum(a[:i + 1])) for i in range(0, len(a))]
    a.insert(0, 0)
    print(a)

    b = list(np.average(b, axis=0))
    b = [float(np.sum(b[:i + 1])) for i in range(0, len(b))]
    b.insert(0, 0)
    print(b)

    plt.plot(np.arange(0, 101, 1), np.array(a) / 1000, 'r', label='MIGOc')
    plt.plot(np.arange(0, 101, 1), np.array(b) / 1000, 'b', label='MIGO')
    # plt.title('Run-time performance measured by logic inference')
    plt.xlabel('NO.Games')
    plt.ylabel('Cumulative NO. inference in Prolog ( x 1000)')
    plt.legend()
    plt.show()


def get_regrets():
    open('./output/MIGO_with_features.txt', 'w').close()
    with open(os.devnull, "w") as f:
        for i in range(20):
            call(['swipl', '-s', 'backtrack.pl', '-g', 'goal(' + str(400) + ').', '-t', 'halt'], stdout=f)
            print('Round' + str(i + 1))


def plot_regret_graph():
    MIGO_C = []
    Q = []
    DQN = []
    MIGO = []
    with open('./output/MIGO_with_features.txt', 'r') as f:
        for line in f:
            MIGO_C.append([0] + list(map(float, line.strip('],\n').strip('\n').strip('[').strip(']').split(','))))

    with open('../nandc_MIGO/output/MIGO.txt', 'r') as f:
        for line in f:
            MIGO.append(list(map(float, line.strip('],\n').strip('\n').strip('[').strip(']').split(','))))

    with open('../Q_learning/output/q.txt', 'r') as f:
        for line in f:
            Q.append(list(map(float, line.strip(' ').strip('\n').strip('[').strip(']').split(','))))

    with open('../Deep_Q_learning/output/DQN.txt', 'r') as f:
        for line in f:
            DQN.append(list(map(float, line.strip(' ').strip('\n').strip('[').strip(']').split(','))))

    MIGO_C_a = np.average(MIGO_C, axis=0)
    MIGO_a = np.average(MIGO, axis=0)
    DQN_a = np.average(DQN, axis=0)
    Q_a = np.average(Q, axis=0)

    plt.errorbar(np.arange(0, 401, 1), MIGO_C_a, np.std(MIGO_C, axis=0), color='b', elinewidth=0.5, ecolor='#77c7f4',
                 label='MIGO_C')
    plt.errorbar(np.arange(0, 401, 1), MIGO_a, np.std(MIGO, axis=0), color='y', elinewidth=0.5, ecolor='#eef477',
                 label='MIGO')
    plt.errorbar(np.arange(0, 401, 1), DQN_a, np.std(DQN, axis=0), color='g', elinewidth=0.5, ecolor='#88fca3',
                 label='Deep Q-learning')
    plt.errorbar(np.arange(0, 401, 1), Q_a, np.std(Q, axis=0), color='r', elinewidth=0.5, ecolor='#f9928b',
                 label='Q-learning')
    plt.xlabel('NO.Games')
    plt.ylabel('Minimax Regrets')
    plt.legend()
    plt.show()


# get_inference()
# plot_inference_graph()
# plot_rule_inference_graph()
# get_regrets()
plot_regret_graph()
