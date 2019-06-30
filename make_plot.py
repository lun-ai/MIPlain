import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from scipy.stats import wilcoxon as wlc

time_before = []
time_exp = []
time_after = []

t_time_before = []
t_time_exp = []
t_time_after = []

grade_5 = []
grade_5_after = []
t_grade_5 = []
t_grade_5_after = []

grade_6 = []
t_grade_6 = []
grade_6_after = []
t_grade_6_after = []

grade_7 = []
t_grade_7 = []
grade_7_after = []
t_grade_7_after = []


def wilcoxon_test(d1, d2):
    z, p = wlc(d1, d2)
    print('Wilcoxon rank-sum, P-value is: %s' % (p))


def read_nth_line(file, n):
    file.seek(0, 0)
    for i in range(0, n - 1):
        file.readline()
    return str(file.readline())


def strip_arr_text(attr, text):
    return list(map(float, text.strip(attr + ':').strip('\n').strip(' ').strip('[').strip(']').split(',')))


def bar_graph(axis, data, t, total_participants):
    counts = (len(list(filter(lambda x: x == -10, data))) / total_participants,
              len(list(filter(lambda x: x == 0, data))) / total_participants,
              len(list(filter(lambda x: x == 10, data))) / total_participants)
    axis.set_title(t)
    axis.set_xticks(np.arange(0, 3))
    axis.set_ylabel('No. Answer')
    axis.set_ylim(0, 5.5)
    axis.set_xticklabels(('Loss', 'Draw', 'Win'))
    axis.bar(np.arange(0, 3), counts)
    axis.text(0 - 0.1, counts[0] + 0.1, str(round(counts[0], 2)), fontweight='bold')
    axis.text(1 - 0.1, counts[1] + 0.1, str(round(counts[1], 2)), fontweight='bold')
    axis.text(2 - 0.1, counts[2] + 0.1, str(round(counts[2], 2)), fontweight='bold')


def list_map(f, l):
    return list(map(f, l))


def population_pie_chart():
    fig = plt.figure()
    gs = gridspec.GridSpec(1, 2)
    gs.update(wspace=0.2, hspace=0.4)
    ax1 = plt.subplot(gs[0, 0])
    w1, t1, _ = ax1.pie([6, 2, 4],
                        autopct=lambda pct: "{:.1f}%\n({:d})".format(pct, int(pct / 100. * np.sum([6, 2, 4])),
                                                                     textprops=dict(color="w")))
    ax1.legend(w1, ['5th grader', '6th grader', '7th grader'])
    ax1.set_title('Control (O1) group')
    fig.add_subplot(ax1)

    ax2 = plt.subplot(gs[0, 1])
    w2, t2, _ = ax2.pie([7, 3, 4],
                        autopct=lambda pct: "{:.1f}%\n({:d})".format(pct, int(pct / 100. * np.sum([7, 3, 4])),
                                                                     textprops=dict(color="w")))
    ax2.legend(w1, ['5th grader', '6th grader', '7th grader'])
    ax2.set_title('Treatment (O2) group')
    fig.add_subplot(ax2)

    plt.show()


def create_bar_graph_all(f):
    control_pre = np.array(grade_5 + grade_6 + grade_7, dtype=np.int)
    control_post = np.array(grade_5_after + grade_6_after + grade_7_after, dtype=np.int)
    treatment_pre = np.array(t_grade_5 + t_grade_6 + t_grade_7, dtype=np.int)
    treatment_post = np.array(t_grade_5_after + t_grade_6_after + t_grade_7_after, dtype=np.int)

    control_pre_mean = [round(np.average(list_map(f, list(control_pre[:, :5].flat))) * 5, 2),
                        round(np.average(list_map(f, list(control_pre[:, 5:10].flat))) * 5, 2),
                        round(np.average(list_map(f, list(control_pre[:, 10:15].flat))) * 5, 2)]
    control_pre_std = [round(np.std(list_map(f, list(control_pre[:, :5].flat))) * 5, 2),
                       round(np.std(list_map(f, list(control_pre[:, 5:10].flat))) * 5, 2),
                       round(np.std(list_map(f, list(control_pre[:, 10:15].flat))) * 5, 2)
                       ]

    control_post_mean = [round(np.average(list_map(f, list(control_post[:, :5].flat))) * 5, 2),
                         round(np.average(list_map(f, list(control_post[:, 5:10].flat))) * 5, 2),
                         round(np.average(list_map(f, list(control_post[:, 10:15].flat))) * 5, 2)]
    control_post_std = [round(np.std(list_map(f, list(control_post[:, :5].flat))) * 5, 2),
                        round(np.std(list_map(f, list(control_post[:, 5:10].flat))) * 5, 2),
                        round(np.std(list_map(f, list(control_post[:, 10:15].flat))) * 5, 2)
                        ]

    treatment_pre_mean = [round(np.average(list_map(f, list(treatment_pre[:, :5].flat))) * 5, 2),
                          round(np.average(list_map(f, list(treatment_pre[:, 5:10].flat))) * 5, 2),
                          round(np.average(list_map(f, list(treatment_pre[:, 10:15].flat))) * 5, 2)]
    treatment_pre_std = [round(np.std(list_map(f, list(treatment_pre[:, :5].flat))) * 5, 2),
                         round(np.std(list_map(f, list(treatment_pre[:, 5:10].flat))) * 5, 2),
                         round(np.std(list_map(f, list(treatment_pre[:, 10:15].flat))) * 5, 2)
                         ]

    treatment_post_mean = [round(np.average(list_map(f, list(treatment_post[:, :5].flat))) * 5, 2),
                           round(np.average(list_map(f, list(treatment_post[:, 5:10].flat))) * 5, 2),
                           round(np.average(list_map(f, list(treatment_post[:, 10:15].flat))) * 5, 2)]
    treatment_post_std = [round(np.std(list_map(f, list(treatment_post[:, :5].flat))) * 5, 2),
                          round(np.std(list_map(f, list(treatment_post[:, 5:10].flat))) * 5, 2),
                          round(np.std(list_map(f, list(treatment_post[:, 10:15].flat))) * 5, 2)
                          ]

    width = 0.35

    # print([sum(list(map(f, l[:5]))) for l in control_pre], [sum(list(map(f, l[:5]))) for l in control_post])
    # print([sum(list(map(f, l[5:10]))) for l in control_pre],
    #       [sum(list(map(f, l[5:10]))) for l in control_post])
    # print([sum(list(map(f, l[10:15]))) for l in control_pre],
    #       [sum(list(map(f, l[10:15]))) for l in control_post])

    fig, ax = plt.subplots()
    ax.bar(np.arange(0, 3) - width / 2, control_pre_mean, width,
           label='Control (O1) Pre-test', ecolor='black', capsize=4)
    ax.bar(np.arange(0, 3) + width / 2, control_post_mean, width,
           label='Control (O1) Post-test', ecolor='black', capsize=4)
    ax.bar(np.arange(3, 6) - width / 2, treatment_pre_mean, width,
           label='Treatment (O2) Pre-test', ecolor='black', capsize=4)
    ax.bar(np.arange(3, 6) + width / 2, treatment_post_mean, width,
           label='Treatment (O2) Post-test', ecolor='black', capsize=4)

    ax.text(0 - 0.3, np.array(control_pre_mean)[0] + 0.05, control_pre_mean[0], fontweight='bold')
    ax.text(1 - 0.3, np.array(control_pre_mean)[1] + 0.05, control_pre_mean[1], fontweight='bold')
    ax.text(2 - 0.3, np.array(control_pre_mean)[2] + 0.05, control_pre_mean[2], fontweight='bold')
    ax.text(0 + 0.1, np.array(control_post_mean)[0] + 0.05, control_post_mean[0], fontweight='bold')
    ax.text(1 + 0.1, np.array(control_post_mean)[1] + 0.05, control_post_mean[1], fontweight='bold')
    ax.text(2 + 0.1, np.array(control_post_mean)[2] + 0.05, control_post_mean[2], fontweight='bold')

    ax.text(3 - 0.3, np.array(treatment_pre_mean)[0] + 0.05, treatment_pre_mean[0], fontweight='bold')
    ax.text(4 - 0.3, np.array(treatment_pre_mean)[1] + 0.05, treatment_pre_mean[1], fontweight='bold')
    ax.text(5 - 0.3, np.array(treatment_pre_mean)[2] + 0.05, treatment_pre_mean[2], fontweight='bold')
    ax.text(3 + 0.1, np.array(treatment_post_mean)[0] + 0.05, treatment_post_mean[0], fontweight='bold')
    ax.text(4 + 0.1, np.array(treatment_post_mean)[1] + 0.05, treatment_post_mean[1], fontweight='bold')
    ax.text(5 + 0.1, np.array(treatment_post_mean)[2] + 0.05, treatment_post_mean[2], fontweight='bold')

    # ax.set_title('Mean No. Correct Answer for control and treatment, between Pre-test and Post-test')
    ax.set_ylabel('Mean No. Correct Answer')
    ax.set_xticks(np.arange(6))
    ax.set_xticklabels(('6-ply (Depth 1)', '4-ply (Depth 2)', '2-ply (Depth 3)', '6-ply (Depth 1)', '4-ply (Depth 2)',
                        '2-ply (Depth 3)'))
    ax.legend()

    print(control_pre_std)
    print(control_post_std)
    print(treatment_pre_std)
    print(treatment_post_std)
    # plt.show()


def create_bar_graph_all2(data, data_after, group_name):
    fig = plt.figure()
    gs = gridspec.GridSpec(3, 2)
    gs.update(wspace=0.2, hspace=0.4)

    ax1 = plt.subplot(gs[0, 0])
    bar_graph(ax1, list(np.array(data)[:, :5].flat), group_name + ' on Depth 1, Pre-test', len(data))
    fig.add_subplot(ax1)
    ax2 = plt.subplot(gs[1, 0])
    bar_graph(ax2, list(np.array(data)[:, 5:10].flat), group_name + ' on Depth 2, Pre-test', len(data))
    fig.add_subplot(ax2)
    ax3 = plt.subplot(gs[2, 0])
    bar_graph(ax3, list(np.array(data)[:, 10:15].flat), group_name + ' on Depth 3, Pre-test', len(data))
    fig.add_subplot(ax3)

    ax4 = plt.subplot(gs[0, 1])
    bar_graph(ax4, list(np.array(data_after)[:, :5].flat), group_name + ' on Depth 1, Post-test', len(data_after))
    fig.add_subplot(ax4)
    ax5 = plt.subplot(gs[1, 1])
    bar_graph(ax5, list(np.array(data_after)[:, 5:10].flat), group_name + ' on Depth 2, Post-test', len(data_after))
    fig.add_subplot(ax5)
    ax6 = plt.subplot(gs[2, 1])
    bar_graph(ax6, list(np.array(data_after)[:, 10:15].flat), group_name + ' on Depth 3, Post-test', len(data_after))
    fig.add_subplot(ax6)

    plt.show()


def create_bar_graph_all3(f):
    control_pre = np.array(grade_5 + grade_6 + grade_7, dtype=np.int)
    control_post = np.array(grade_5_after + grade_6_after + grade_7_after, dtype=np.int)
    treatment_pre = np.array(t_grade_5 + t_grade_6 + t_grade_7, dtype=np.int)
    treatment_post = np.array(t_grade_5_after + t_grade_6_after + t_grade_7_after, dtype=np.int)

    control_pre_mean = [np.average(list_map(f, list(control_pre[:, :5].flat))) * 5,
                        np.average(list_map(f, list(control_pre[:, 5:10].flat))) * 5,
                        np.average(list_map(f, list(control_pre[:, 10:15].flat))) * 5]

    control_post_mean = [np.average(list_map(f, list(control_post[:, :5].flat))) * 5,
                         np.average(list_map(f, list(control_post[:, 5:10].flat))) * 5,
                         np.average(list_map(f, list(control_post[:, 10:15].flat))) * 5]

    control_diff = np.subtract(control_post_mean, control_pre_mean) * 100 / 5
    control_diff[1] += 0.1

    treatment_pre_mean = [np.average(list_map(f, list(treatment_pre[:, :5].flat))) * 5,
                          np.average(list_map(f, list(treatment_pre[:, 5:10].flat))) * 5,
                          np.average(list_map(f, list(treatment_pre[:, 10:15].flat))) * 5]

    treatment_post_mean = [np.average(list_map(f, list(treatment_post[:, :5].flat))) * 5,
                           np.average(list_map(f, list(treatment_post[:, 5:10].flat))) * 5,
                           np.average(list_map(f, list(treatment_post[:, 10:15].flat))) * 5]

    treatment_diff = np.subtract(treatment_post_mean, treatment_pre_mean) * 100 / 5

    width = 0.35
    fig, ax = plt.subplots()
    ax.bar(np.arange(0, 3) - width / 2, control_diff, width,
           label='Control (O1) Group', ecolor='black', capsize=4)
    ax.bar(np.arange(0, 3) + width / 2, treatment_diff, width,
           label='Treatment (O2) Group', ecolor='black', capsize=4)
    ax.axhline(color='black')
    ax.set_ylabel('% Wrong Answer Diff')
    ax.set_xticks(np.arange(3))
    ax.set_xticklabels(('6-ply (Depth 1)', '4-ply (Depth 2)', '2-ply (Depth 3)'))
    ax.legend()

    ax.text(0 - 0.25, np.array(control_diff)[0] + 0.05, str(round(control_diff[0], 2)) + '%', fontweight='bold')
    ax.text(1 - 0.25, np.array(control_diff)[1] + 0.05, str(round(0.0, 2)) + '%', fontweight='bold')
    ax.text(2 - 0.25, np.array(control_diff)[2] + 0.05, str(round(control_diff[2], 2)) + '%', fontweight='bold')

    ax.text(0 + 0.1, np.array(treatment_diff)[0] - 0.5, str(round(treatment_diff[0], 2)) + '%', fontweight='bold')
    ax.text(1 + 0.1, np.array(treatment_diff)[1] + 0.05, str(round(treatment_diff[1], 2)) + '%', fontweight='bold')
    ax.text(2 + 0.1, np.array(treatment_diff)[2] + 0.05, str(round(treatment_diff[2], 2)) + '%', fontweight='bold')

    plt.show()


def create_time_bar_graph():
    control_pre_mean = list(map(lambda x: round(x, 2), [np.average(list(time_before[:, :5].flat)),
                                                        np.average(list(time_before[:, 5:10].flat)),
                                                        np.average(list(time_before[:, 10:15].flat))]))

    control_post_mean = list(map(lambda x: round(x, 2), [np.average(list(time_after[:, :5].flat)),
                                                         np.average(list(time_after[:, 5:10].flat)),
                                                         np.average(list(time_after[:, 10:15].flat))]))

    treatment_pre_mean = list(map(lambda x: round(x, 2), [np.average(list(t_time_before[:, :5].flat)),
                                                          np.average(list(t_time_before[:, 5:10].flat)),
                                                          np.average(list(t_time_before[:, 10:15].flat))]))

    treatment_post_mean = list(map(lambda x: round(x, 2), [np.average(list(t_time_after[:, :5].flat)),
                                                           np.average(list(t_time_after[:, 5:10].flat)),
                                                           np.average(list(t_time_after[:, 10:15].flat))]))
    control_pre_std = [round(np.std(list(time_before[:, :5].flat)), 2),
                       round(np.std(list(time_before[:, 5:10].flat)), 2),
                       round(np.std(list(time_before[:, 10:15].flat)), 2)
                       ]
    control_post_std = [round(np.std(list(time_after[:, :5].flat)), 2),
                        round(np.std(list(time_after[:, 5:10].flat)), 2),
                        round(np.std(list(time_after[:, 10:15].flat)), 2)
                        ]
    treatment_pre_std = [round(np.std(list(t_time_before[:, :5].flat)), 2),
                         round(np.std(list(t_time_before[:, 5:10].flat)), 2),
                         round(np.std(list(t_time_before[:, 10:15].flat)), 2)
                         ]
    treatment_post_std = [round(np.std(list(t_time_after[:, :5].flat)), 2),
                          round(np.std(list(t_time_after[:, 5:10].flat)), 2),
                          round(np.std(list(t_time_after[:, 10:15].flat)), 2)
                          ]
    width = 0.35
    fig, ax = plt.subplots()
    ax.bar(np.arange(0, 3) - width / 2, control_pre_mean, width,
           label='Control (O1) Pre-test', ecolor='black', capsize=4)
    ax.bar(np.arange(0, 3) + width / 2, control_post_mean, width,
           label='Control (O1) Post-test', ecolor='black', capsize=4)
    ax.bar(np.arange(3, 6) - width / 2, treatment_pre_mean, width,
           label='Treatment (O2) Pre-test', ecolor='black', capsize=4)
    ax.bar(np.arange(3, 6) + width / 2, treatment_post_mean, width,
           label='Treatment (O2) Post-test', ecolor='black', capsize=4)
    ax.axhline(color='black')
    ax.set_ylabel('Mean Question Response Time (sec)')
    ax.set_xticks(np.arange(6))
    ax.set_xticklabels(('6-ply (Depth 1)', '4-ply (Depth 2)', '2-ply (Depth 3)', '6-ply (Depth 1)', '4-ply (Depth 2)',
                        '2-ply (Depth 3)'))
    ax.legend()

    ax.text(0 - 0.3, np.array(control_pre_mean)[0] + 0.05, control_pre_mean[0], fontweight='bold')
    ax.text(1 - 0.3, np.array(control_pre_mean)[1] + 0.05, control_pre_mean[1], fontweight='bold')
    ax.text(2 - 0.3, np.array(control_pre_mean)[2] + 0.05, control_pre_mean[2], fontweight='bold')
    ax.text(0 + 0.1, np.array(control_post_mean)[0] + 0.05, control_post_mean[0], fontweight='bold')
    ax.text(1 + 0.1, np.array(control_post_mean)[1] + 0.05, control_post_mean[1], fontweight='bold')
    ax.text(2 + 0.1, np.array(control_post_mean)[2] + 0.05, control_post_mean[2], fontweight='bold')

    ax.text(3 - 0.3, np.array(treatment_pre_mean)[0] + 0.05, treatment_pre_mean[0], fontweight='bold')
    ax.text(4 - 0.3, np.array(treatment_pre_mean)[1] + 0.05, treatment_pre_mean[1], fontweight='bold')
    ax.text(5 - 0.3, np.array(treatment_pre_mean)[2] + 0.05, treatment_pre_mean[2], fontweight='bold')
    ax.text(3 + 0.1, np.array(treatment_post_mean)[0] + 0.05, treatment_post_mean[0], fontweight='bold')
    ax.text(4 + 0.1, np.array(treatment_post_mean)[1] + 0.05, treatment_post_mean[1], fontweight='bold')
    ax.text(5 + 0.1, np.array(treatment_post_mean)[2] + 0.05, treatment_post_mean[2], fontweight='bold')

    # print(list(map(lambda x: round(x, 2), list(map(lambda x: np.average(x), time_before[:, 10:15])))))
    print(list(map(lambda x: round(x, 2), list(map(lambda x: np.average(x), time_after[:, 10:15])))))
    # print(list(map(lambda x: round(x, 2), list(map(lambda x: np.average(x), t_time_before[:, 10:15])))))
    print(list(map(lambda x: round(x, 2), list(map(lambda x: np.average(x), t_time_after[:, 10:15])))))
    plt.show()

''' Parse collected data '''
for i in [502, 504, 506, 508, 510, 512]:
    with open('./records/Grade-5/' + str(i) + '.txt', 'r') as file:
        grade_5.append(strip_arr_text('scores', read_nth_line(file, 20)))
        # read_nth_line(file, 34)
        time_before.append(strip_arr_text('time', read_nth_line(file, 21)))
        time_exp.append(strip_arr_text('time on expl', read_nth_line(file, 36)))
        time_after.append(strip_arr_text('time', read_nth_line(file, 57)))
        grade_5_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

for i in [501, 503, 505, 507, 509, 511, 513]:
    with open('./records/Grade-5/' + str(i) + '.txt', 'r') as file:
        t_grade_5.append(strip_arr_text('scores', read_nth_line(file, 20)))
        # read_nth_line(file, 34)
        t_time_before.append(strip_arr_text('time', read_nth_line(file, 21)))
        t_time_exp.append(strip_arr_text('time on expl', read_nth_line(file, 36)))
        t_time_after.append(strip_arr_text('time', read_nth_line(file, 57)))
        t_grade_5_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

for i in [602, 610]:
    with open('./records/Grade-6/' + str(i) + '.txt', 'r') as file:
        grade_6.append(strip_arr_text('scores', read_nth_line(file, 20)))
        # read_nth_line(file, 34)
        time_before.append(strip_arr_text('time', read_nth_line(file, 21)))
        time_exp.append(strip_arr_text('time on expl', read_nth_line(file, 36)))
        time_after.append(strip_arr_text('time', read_nth_line(file, 57)))
        grade_6_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

for i in [601, 603, 609]:
    with open('./records/Grade-6/' + str(i) + '.txt', 'r') as file:
        t_grade_6.append(strip_arr_text('scores', read_nth_line(file, 20)))
        # read_nth_line(file, 34)
        t_time_before.append(strip_arr_text('time', read_nth_line(file, 21)))
        t_time_exp.append(strip_arr_text('time on expl', read_nth_line(file, 36)))
        t_time_after.append(strip_arr_text('time', read_nth_line(file, 57)))
        t_grade_6_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

for i in [702, 704, 706, 708]:
    with open('./records/Grade-7/' + str(i) + '.txt', 'r') as file:
        grade_7.append(strip_arr_text('scores', read_nth_line(file, 20)))
        # read_nth_line(file, 34)
        time_before.append(strip_arr_text('time', read_nth_line(file, 21)))
        time_exp.append(strip_arr_text('time on expl', read_nth_line(file, 36)))
        time_after.append(strip_arr_text('time', read_nth_line(file, 57)))
        grade_7_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

for i in [701, 703, 705, 707]:
    with open('./records/Grade-7/' + str(i) + '.txt', 'r') as file:
        t_grade_7.append(strip_arr_text('scores', read_nth_line(file, 20)))
        # read_nth_line(file, 34)
        t_time_before.append(strip_arr_text('time', read_nth_line(file, 21)))
        t_time_exp.append(strip_arr_text('time on expl', read_nth_line(file, 36)))
        t_time_after.append(strip_arr_text('time', read_nth_line(file, 57)))
        t_grade_7_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

time_before = np.array(time_before)
time_exp = np.array(time_exp)
time_after = np.array(time_after)

t_time_before = np.array(t_time_before)
t_time_exp = np.array(t_time_exp)
t_time_after = np.array(t_time_after)

# create_bar_graph_all2(grade_5, grade_5_after, 'Control (O1) 5th Grader')
# create_bar_graph_all2(t_grade_5, t_grade_5_after, 'Treatment (O2) 5th Grader')
# create_bar_graph_all2(grade_6, grade_6_after, 'Control 6th (O1) Grader')
# create_bar_graph_all2(t_grade_6, t_grade_6_after, 'Treatment (O2) 6th Grader')
# create_bar_graph_all2(grade_7, grade_7_after, 'Control 7th (O1) Grader')
create_bar_graph_all2(t_grade_7, t_grade_7_after, 'Treatment (O2) 7th Grader')
# create_bar_graph_all2(t_grade_5 + t_grade_7, t_grade_5_after + t_grade_7_after, 'Treatment (O2) 5,7th Grader')
#
# create_bar_graph_all((lambda x: x == 10))
# create_bar_graph_all3((lambda x: x != 10))
# population_pie_chart()
# create_time_bar_graph()
