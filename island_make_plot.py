import os
import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats
import collections

pretest_scores = [[], []]
posttest_scores = [[], []]
examples_scores = [[], []]

pretest_time = [[], []]
example_time = [[], []]
posttest_time = [[], []]

colors = ['yellowgreen', 'gold', 'lightskyblue', 'lightcoral', 'orange', 'deepskyblue']

gender = {'other': 0,
          'male': 0,
          'female': 0}
age = {'18-24': 0,
       '25-34': 0,
       '35-44': 0,
       '45-54': 0,
       '55-64': 0,
       '>65': 0}
education = {'no': 0,
             'highsch': 0,
             'college': 0,
             'bachelor': 0,
             'master': 0,
             'phd': 0,
             'other': 0}
gender_records = [[], []]
age_records = [[], []]
education_records = [[], []]
ids = [[], []]

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
            ids[i].append(int(read_nth_line(file, 1).strip('\n')))
            pretest_scores[i].append(strip_arr_text('scores', read_nth_line(file, 22)))
            pretest_time[i].append(strip_arr_text('time', read_nth_line(file, 23)))
            examples_scores[i].append(strip_arr_text('scores', read_nth_line(file, 43)))
            example_time[i].append(strip_arr_text('time on expl', read_nth_line(file, 45)))
            posttest_scores[i].append(strip_arr_text('scores', read_nth_line(file, 65)))
            posttest_time[i].append(strip_arr_text('time', read_nth_line(file, 66)))
            gender_records[i].append(read_nth_line(file, 69).strip('\n'))
            age_records[i].append(read_nth_line(file, 71).strip('\n'))
            education_records[i].append(read_nth_line(file, 73).strip('\n'))

control_pre = np.array(pretest_scores[0], dtype=np.int)
control_post = np.array(posttest_scores[0], dtype=np.int)
treatment_pre = np.array(pretest_scores[1], dtype=np.int)
treatment_post = np.array(posttest_scores[1], dtype=np.int)

control_pre_time = np.array(pretest_time[0], dtype=np.float16)
control_post_time = np.array(posttest_time[0], dtype=np.float16)
treatment_pre_time = np.array(pretest_time[1], dtype=np.float16)
treatment_post_time = np.array(posttest_time[1], dtype=np.float16)

def create_bar_graph_overall(f):

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

    fig, ax1 = plt.subplots()
    ax1.bar(np.arange(0, 3) - width / 2, control_pre_mean, width,
           label='Control Pre-test', color='r')
    ax1.bar(np.arange(0, 3) + width / 2, control_post_mean, width,
           label='Control Post-test', color='g')
    ax1.bar(np.arange(3, 6) - width / 2, treatment_pre_mean, width,
           label='Treatment Pre-test', color='y')
    ax1.bar(np.arange(3, 6) + width / 2, treatment_post_mean, width,
           label='Treatment Post-test', color='c')

    ax1.text(0 - 0.3, np.array(control_pre_mean)[0] + 0.05, control_pre_mean[0], fontweight='bold')
    ax1.text(1 - 0.3, np.array(control_pre_mean)[1] + 0.05, control_pre_mean[1], fontweight='bold')
    ax1.text(2 - 0.3, np.array(control_pre_mean)[2] + 0.05, control_pre_mean[2], fontweight='bold')
    ax1.text(0 + 0.1, np.array(control_post_mean)[0] + 0.05, control_post_mean[0], fontweight='bold')
    ax1.text(1 + 0.1, np.array(control_post_mean)[1] + 0.05, control_post_mean[1], fontweight='bold')
    ax1.text(2 + 0.1, np.array(control_post_mean)[2] + 0.05, control_post_mean[2], fontweight='bold')

    ax1.text(3 - 0.3, np.array(treatment_pre_mean)[0] + 0.05, treatment_pre_mean[0], fontweight='bold')
    ax1.text(4 - 0.3, np.array(treatment_pre_mean)[1] + 0.05, treatment_pre_mean[1], fontweight='bold')
    ax1.text(5 - 0.3, np.array(treatment_pre_mean)[2] + 0.05, treatment_pre_mean[2], fontweight='bold')
    ax1.text(3 + 0.1, np.array(treatment_post_mean)[0] + 0.05, treatment_post_mean[0], fontweight='bold')
    ax1.text(4 + 0.1, np.array(treatment_post_mean)[1] + 0.05, treatment_post_mean[1], fontweight='bold')
    ax1.text(5 + 0.1, np.array(treatment_post_mean)[2] + 0.05, treatment_post_mean[2], fontweight='bold')

    ax1.set_ylabel('Mean')
    ax1.axhline(color='black')
    ax1.set_title('Mean No. Correct Answer')
    ax1.set_xticks(np.arange(0, 6), ('Depth 1', 'Depth 2', 'Depth 3', 'Depth 1', 'Depth 2', 'Depth 3'))
    ax1.legend(loc='lower left')

    plt.show()

def create_time_graph_for_depth():

    control_pre_mean = [round(np.average(list(control_pre_time[:, :5].flat)), 2),
                        round(np.average(list(control_pre_time[:, 5:10].flat)), 2),
                        round(np.average(list(control_pre_time[:, 10:15].flat)), 2)]
    control_pre_std = [round(np.std(list(control_pre_time[:, :5].flat), ddof=1), 2),
                       round(np.std(list(control_pre_time[:, 5:10].flat), ddof=1), 2),
                       round(np.std(list(control_pre_time[:, 10:15].flat), ddof=1), 2)
                       ]

    control_post_mean = [round(np.average(list(control_post_time[:, :5].flat)), 2),
                         round(np.average(list(control_post_time[:, 5:10].flat)), 2),
                         round(np.average(list(control_post_time[:, 10:15].flat)), 2)]
    control_post_std = [round(np.std(list(control_post_time[:, :5].flat), ddof=1), 2),
                       round(np.std(list(control_post_time[:, 5:10].flat), ddof=1), 2),
                       round(np.std(list(control_post_time[:, 10:15].flat), ddof=1), 2)
                       ]

    treatment_pre_mean = [round(np.average(list(treatment_pre_time[:, :5].flat)), 2),
                          round(np.average(list(treatment_pre_time[:, 5:10].flat)), 2),
                          round(np.average(list(treatment_pre_time[:, 10:15].flat)), 2)]
    treatment_pre_std = [round(np.std(list(treatment_pre_time[:, :5].flat), ddof=1), 2),
                       round(np.std(list(treatment_pre_time[:, 5:10].flat), ddof=1), 2),
                       round(np.std(list(treatment_pre_time[:, 10:15].flat), ddof=1), 2)
                       ]

    treatment_post_mean = [round(np.average(list(treatment_post_time[:, :5].flat)), 2),
                           round(np.average(list(treatment_post_time[:, 5:10].flat)), 2),
                           round(np.average(list(treatment_post_time[:, 10:15].flat)), 2)]
    treatment_post_std = [round(np.std(list(treatment_post_time[:, :5].flat), ddof=1), 2),
                       round(np.std(list(treatment_post_time[:, 5:10].flat), ddof=1), 2),
                       round(np.std(list(treatment_post_time[:, 10:15].flat), ddof=1), 2)
                       ]
    width = 0.35
    fig, ax = plt.subplots()
    ax.bar(np.arange(0, 3) - width / 2, control_pre_mean, width,
           label='Control Pre-test', color='r', ecolor='black')
    ax.bar(np.arange(0, 3) + width / 2, control_post_mean, width,
           label='Control Post-test', color='g', ecolor='black')
    ax.bar(np.arange(3, 6) - width / 2, treatment_pre_mean, width,
           label='Treatment Pre-test', color='y', ecolor='black')
    ax.bar(np.arange(3, 6) + width / 2, treatment_post_mean, width,
           label='Treatment Post-test', color='c', ecolor='black')

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

    ax.set_ylabel('Mean Time(sec)')
    ax.set_title('Mean Time for Answer')
    ax.set_xticks(np.arange(6) + 0.17)
    ax.set_xticklabels(('Depth 1', 'Depth 2', 'Depth 3', 'Depth 1', 'Depth 2', 'Depth 3'))
    ax.legend(loc='lower left')

    plt.show()

def filter(f1, f2):
    c_pre_d1 = get_correct_question(control_pre[:, :5], f1)
    c_pre_d2 = get_correct_question(control_pre[:, 5:10], f1)
    c_pre_d3 = get_correct_question(control_pre[:, 10:15], f1)
    c_pre_average = np.average(get_correct_question(control_pre[:, :], f1))
    c_pre_std = np.std(get_correct_question(control_pre[:, :], f1))
    perfect_c_player = [i for i in range(30) if f2(c_pre_d1[i] + c_pre_d2[i] + c_pre_d3[i])]
    print('Control group pretest average correct: ' + str(c_pre_average))
    print('Control group pretest std: ' + str(c_pre_std))
    print('Removed from control group data: ' + str(len(perfect_c_player)))

    t_pre_d1 = get_correct_question(treatment_pre[:, :5], f1)
    t_pre_d2 = get_correct_question(treatment_pre[:, 5:10], f1)
    t_pre_d3 = get_correct_question(treatment_pre[:, 10:15], f1)
    t_pre_average = np.average(get_correct_question(treatment_pre[:, :], f1))
    t_pre_std = np.std(get_correct_question(treatment_pre[:, :], f1))
    perfect_t_player = [i for i in range(30) if f2(t_pre_d1[i] + t_pre_d2[i] + t_pre_d3[i])]
    print('Treatment group pretest average correct: ' + str(t_pre_average))
    print('Treatment group pretest std: ' + str(t_pre_std))
    print('Removed from treatment group data: ' + str(len(perfect_t_player)))
    return perfect_c_player, perfect_t_player, [c_pre_d1, c_pre_d2, c_pre_d3], [t_pre_d1, t_pre_d2, t_pre_d3]

def create_time_graph_for_depth(f1, f2, title):

    perfect_c_player, perfect_t_player, _, _ = filter(f1, f2)

    c_pre_d1 = list(np.delete(control_pre_time[:, :5], perfect_c_player, axis=0).flat)
    c_pre_d2 = list(np.delete(control_pre_time[:, 5:10], perfect_c_player, axis=0).flat)
    c_pre_d3 = list(np.delete(control_pre_time[:, 10:15], perfect_c_player, axis=0).flat)
    c_post_d1 = list(np.delete(control_post_time[:, :5], perfect_c_player, axis=0).flat)
    c_post_d2 = list(np.delete(control_post_time[:, 5:10], perfect_c_player, axis=0).flat)
    c_post_d3 = list(np.delete(control_post_time[:, 10:15], perfect_c_player, axis=0).flat)

    t_pre_d1 = list(np.delete(treatment_pre_time[:, :5], perfect_t_player, axis=0).flat)
    t_pre_d2 = list(np.delete(treatment_pre_time[:, 5:10], perfect_t_player, axis=0).flat)
    t_pre_d3 = list(np.delete(treatment_pre_time[:, 10:15], perfect_t_player, axis=0).flat)
    t_post_d1 = list(np.delete(treatment_post_time[:, :5], perfect_t_player, axis=0).flat)
    t_post_d2 = list(np.delete(treatment_post_time[:, 5:10], perfect_t_player, axis=0).flat)
    t_post_d3 = list(np.delete(treatment_post_time[:, 10:15], perfect_t_player, axis=0).flat)

    print('depth 1 - control p: ' + str(stats.ttest_rel(c_pre_d1, c_post_d1)[1]))
    print('depth 2 - control p: ' + str(stats.ttest_rel(c_pre_d2, c_post_d2)[1]))
    print('depth 3 - control p: ' + str(stats.ttest_rel(c_pre_d3, c_post_d3)[1]))
    print('depth 1 - treatment p: ' + str(stats.ttest_rel(t_pre_d1, t_post_d1)[1]))
    print('depth 2 - treatment p: ' + str(stats.ttest_rel(t_pre_d2, t_post_d2)[1]))
    print('depth 3 - treatment p: ' + str(stats.ttest_rel(t_pre_d3, t_post_d3)[1]))

    print('depth 1 - control vs. treatment pre p: ' + str(stats.ttest_ind(c_pre_d1, t_pre_d1)[1]))
    print('depth 2 - control vs. treatment pre p: ' + str(stats.ttest_ind(t_pre_d2, c_pre_d1)[1]))
    print('depth 3 - control vs. treatment pre p: ' + str(stats.ttest_ind(c_pre_d3, t_pre_d3)[1]))

    print(c_pre_d2)
    print(t_pre_d2)

    control_pre_mean = [round(np.average(c_pre_d1), 2),
                        round(np.average(c_pre_d2), 2),
                        round(np.average(c_pre_d3), 2)]
    # control_pre_std = [round(np.std(c_pre_d1, ddof=1), 2),
    #                    round(np.std(c_pre_d2, ddof=1), 2),
    #                    round(np.std(c_pre_d3, ddof=1), 2)]

    control_post_mean = [round(np.average(c_post_d1), 2),
                         round(np.average(c_post_d2), 2),
                         round(np.average(c_post_d3), 2)]
    # control_post_std = [round(np.std(c_post_d1, ddof=1), 2),
    #                     round(np.std(c_post_d2, ddof=1), 2),
    #                     round(np.std(c_post_d3, ddof=1), 2)]

    treatment_pre_mean = [round(np.average(t_pre_d1), 2),
                          round(np.average(t_pre_d2), 2),
                          round(np.average(t_pre_d3), 2)]
    # treatment_pre_std = [round(np.std(t_pre_d1, ddof=1), 2),
    #                      round(np.std(t_pre_d2, ddof=1), 2),
    #                      round(np.std(t_pre_d3, ddof=1), 2)]

    treatment_post_mean = [round(np.average(t_post_d1), 2),
                           round(np.average(t_post_d2), 2),
                           round(np.average(t_post_d3), 2)]
    # treatment_post_std = [round(np.std(t_post_d1, ddof=1), 2),
    #                       round(np.std(t_post_d2, ddof=1), 2),
    #                       round(np.std(t_post_d3, ddof=1), 2)]

    width = 0.35
    fig, ax = plt.subplots()
    ax.bar(np.arange(0, 3) - width / 2, control_pre_mean, width,
           label='Control Pre-test', color='r', ecolor='black')
    ax.bar(np.arange(0, 3) + width / 2, control_post_mean, width,
           label='Control Post-test', color='g', ecolor='black')
    ax.bar(np.arange(3, 6) - width / 2, treatment_pre_mean, width,
           label='Treatment Pre-test', color='y', ecolor='black')
    ax.bar(np.arange(3, 6) + width / 2, treatment_post_mean, width,
           label='Treatment Post-test', color='c', ecolor='black')

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

    ax.set_ylabel('Mean Time(sec)')
    ax.set_title(title)
    ax.set_xticks(np.arange(6) + 0.17)
    ax.set_xticklabels(('Depth 1', 'Depth 2', 'Depth 3', 'Depth 1', 'Depth 2', 'Depth 3'))
    ax.legend(loc='lower left')

    plt.show()

def create_bar_graph_for_depth(f):

    c_pre_d1 = get_correct_question(control_pre[:, :5], f)
    c_pre_d2 = get_correct_question(control_pre[:, 5:10], f)
    c_pre_d3 = get_correct_question(control_pre[:, 10:15], f)
    t_pre_d1 = get_correct_question(treatment_pre[:, :5], f)
    t_pre_d2 = get_correct_question(treatment_pre[:, 5:10], f)
    t_pre_d3 = get_correct_question(treatment_pre[:, 10:15], f)
    c_post_d1 = get_correct_question(control_post[:, :5], f)
    c_post_d2 = get_correct_question(control_post[:, 5:10], f)
    c_post_d3 = get_correct_question(control_post[:, 10:15], f)
    t_post_d1 = get_correct_question(treatment_post[:, :5], f)
    t_post_d2 = get_correct_question(treatment_post[:, 5:10], f)
    t_post_d3 = get_correct_question(treatment_post[:, 10:15], f)

    control_pre_mean = [round(np.average(c_pre_d1), 2),
                        round(np.average(c_pre_d2), 2),
                        round(np.average(c_pre_d3), 2)]
    control_pre_std = [round(np.std(c_pre_d1, ddof=1), 2),
                       round(np.std(c_pre_d2, ddof=1), 2),
                       round(np.std(c_pre_d3, ddof=1), 2)]

    control_post_mean = [round(np.average(c_post_d1), 2),
                         round(np.average(c_post_d2), 2),
                         round(np.average(c_post_d3), 2)]
    control_post_std = [round(np.std(c_post_d1, ddof=1), 2),
                        round(np.std(c_post_d2, ddof=1), 2),
                        round(np.std(c_post_d3, ddof=1), 2)]

    treatment_pre_mean = [round(np.average(t_pre_d1), 2),
                          round(np.average(t_pre_d2), 2),
                          round(np.average(t_pre_d3), 2)]
    treatment_pre_std = [round(np.std(t_pre_d1, ddof=1), 2),
                         round(np.std(t_pre_d2, ddof=1), 2),
                         round(np.std(t_pre_d3, ddof=1), 2)]

    treatment_post_mean = [round(np.average(t_post_d1), 2),
                           round(np.average(t_post_d2), 2),
                           round(np.average(t_post_d3), 2)]
    treatment_post_std = [round(np.std(t_post_d1, ddof=1), 2),
                          round(np.std(t_post_d2, ddof=1), 2),
                          round(np.std(t_post_d3, ddof=1), 2)]

    width = 0.35

    fig, ax = plt.subplots()
    ax.bar(np.arange(0, 3) - width / 2, control_pre_mean, width,
           label='Control Pre-test', color='r', yerr=control_pre_std, ecolor='black')
    ax.bar(np.arange(0, 3) + width / 2, control_post_mean, width,
           label='Control Post-test', color='g', yerr=control_post_std, ecolor='black')
    ax.bar(np.arange(3, 6) - width / 2, treatment_pre_mean, width,
           label='Treatment Pre-test', color='y', yerr=treatment_pre_std, ecolor='black')
    ax.bar(np.arange(3, 6) + width / 2, treatment_post_mean, width,
           label='Treatment Post-test', color='c', yerr=treatment_post_std, ecolor='black')

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

    ax.hlines(1.7, -2.0, 6.0, label='random depth 1', color='darkviolet', linestyles='dashed')
    ax.hlines(1.4, -2.0, 6.0, label='random depth 2', color='b', linestyles='dashed')
    ax.hlines(2.3, -2.0, 6.0, label='random depth 3', color='darkslategrey', linestyles='dashed')

    ax.set_ylabel('Mean')
    ax.set_title('Mean No. Correct Answer')
    ax.set_xticks(np.arange(6) + 0.17)
    ax.set_xticklabels(('Depth 1', 'Depth 2', 'Depth 3', 'Depth 1', 'Depth 2', 'Depth 3'))
    ax.legend(loc='lower left')

    plt.show()

def get_correct_question(l, f):
    return np.sum(list_map(f, list(l)), axis=-1)

def ttest(f):
    print(get_correct_question(treatment_pre[:, :5], f))
    print(get_correct_question(treatment_pre[:, 5:10], f))
    print(get_correct_question(treatment_pre[:, 10:15], f))
    print(get_correct_question(treatment_post[:, 10:15], f))
    print('depth 1 - control p: ' + str(stats.ttest_rel(get_correct_question(control_pre[:, :5], f), get_correct_question(control_post[:, :5], f))[1]))
    print('depth 2 - control p: ' + str(stats.ttest_rel(get_correct_question(control_pre[:, 5:10], f), get_correct_question(control_post[:, 5:10], f))[1]))
    print('depth 3 - control p: ' + str(stats.ttest_rel(get_correct_question(control_pre[:, 10:15], f), get_correct_question(control_post[:, 10:15], f))[1]))
    print('depth 1 - treatment p: ' + str(stats.ttest_rel(get_correct_question(treatment_pre[:, :5], f), get_correct_question(treatment_post[:, :5], f))[1]))
    print('depth 2 - treatment p: ' + str(stats.ttest_rel(get_correct_question(treatment_pre[:, 5:10], f), get_correct_question(treatment_post[:, 5:10], f))[1]))
    print('depth 3 - treatment p: ' + str(stats.ttest_rel(get_correct_question(treatment_pre[:, 10:15], f), get_correct_question(treatment_post[:, 10:15], f))[1]))
    print('overall - treatment p: ' + str(stats.ttest_rel(get_correct_question(treatment_pre[:, :], f),
                          get_correct_question(treatment_post[:, :], f))[1]))
    create_bar_graph_for_depth(f)

def ttest_with_threshold(f1, f2, title):
    perfect_c_player, perfect_t_player, c_pre, t_pre = filter(f1, f2)

    c_pre_d1 = np.delete(c_pre[0], perfect_c_player)
    c_pre_d2 = np.delete(c_pre[1], perfect_c_player)
    c_pre_d3 = np.delete(c_pre[2], perfect_c_player)
    c_post_d1 = np.delete(get_correct_question(control_post[:, :5], f1), perfect_c_player)
    c_post_d2 = np.delete(get_correct_question(control_post[:, 5:10], f1), perfect_c_player)
    c_post_d3 = np.delete(get_correct_question(control_post[:, 10:15], f1), perfect_c_player)

    t_pre_d1 = np.delete(t_pre[0], perfect_t_player)
    t_pre_d2 = np.delete(t_pre[1], perfect_t_player)
    t_pre_d3 = np.delete(t_pre[2], perfect_t_player)
    t_post_d1 = np.delete(get_correct_question(treatment_post[:, :5], f1), perfect_t_player)
    t_post_d2 = np.delete(get_correct_question(treatment_post[:, 5:10], f1), perfect_t_player)
    t_post_d3 = np.delete(get_correct_question(treatment_post[:, 10:15], f1), perfect_t_player)

    print('depth 1 - control p: ' + str(stats.ttest_rel(c_pre_d1, c_post_d1)[1]))
    print('depth 2 - control p: ' + str(stats.ttest_rel(c_pre_d2, c_post_d2)[1]))
    print('depth 3 - control p: ' + str(stats.ttest_rel(c_pre_d3, c_post_d3)[1]))
    print('depth 1 - treatment p: ' + str(stats.ttest_rel(t_pre_d1, t_post_d1)[1]))
    print('depth 2 - treatment p: ' + str(stats.ttest_rel(t_pre_d2, t_post_d2)[1]))
    print('depth 3 - treatment p: ' + str(stats.ttest_rel(t_pre_d3, t_post_d3)[1]))

    print('depth 1 - control vs. treatment pre p: ' + str(stats.ttest_ind(c_pre_d1, t_pre_d1)[1]))
    print('depth 2 - control vs. treatment pre p: ' + str(stats.ttest_ind(c_pre_d2, t_pre_d2)[1]))
    print('depth 3 - control vs. treatment pre p: ' + str(stats.ttest_ind(c_pre_d3, t_pre_d3)[1]))

    control_all_depth = np.append(np.append(c_pre_d1, c_pre_d2), c_pre_d3)
    control_post_all_depth = np.append(np.append(c_post_d1, c_post_d2), c_post_d3)
    treatment_all_depth = np.append(np.append(t_pre_d1, t_pre_d2), t_pre_d3)
    treatment_post_all_depth = np.append(np.append(t_post_d1, t_post_d2), t_post_d3)
    print(control_all_depth)
    print(control_post_all_depth)
    print('overall - control ttest: ' + str(stats.ttest_rel(control_all_depth, control_post_all_depth)))
    print('overall - control ttest means: ' + str(np.average(control_all_depth)) + ', '
          + str(np.average(control_post_all_depth)))
    print('overall - treatment ttest: ' + str(stats.ttest_rel(treatment_all_depth, treatment_post_all_depth)))
    print('overall - treatment ttest means: ' + str(np.average(treatment_all_depth)) + ', '
                                              + str(np.average(treatment_post_all_depth)))

    control_pre_mean = [round(np.average(c_pre_d1), 2),
                        round(np.average(c_pre_d2), 2),
                        round(np.average(c_pre_d3), 2)]
    control_pre_std = [round(np.std(c_pre_d1, ddof=1), 2),
                        round(np.std(c_pre_d2, ddof=1), 2),
                        round(np.std(c_pre_d3, ddof=1), 2)]

    control_post_mean = [round(np.average(c_post_d1), 2),
                         round(np.average(c_post_d2), 2),
                         round(np.average(c_post_d3), 2)]
    control_post_std = [round(np.std(c_post_d1, ddof=1), 2),
                        round(np.std(c_post_d2, ddof=1), 2),
                        round(np.std(c_post_d3, ddof=1), 2)]

    treatment_pre_mean = [round(np.average(t_pre_d1), 2),
                          round(np.average(t_pre_d2), 2),
                          round(np.average(t_pre_d3), 2)]
    treatment_pre_std = [round(np.std(t_pre_d1, ddof=1), 2),
                        round(np.std(t_pre_d2, ddof=1), 2),
                        round(np.std(t_pre_d3, ddof=1), 2)]

    treatment_post_mean = [round(np.average(t_post_d1), 2),
                           round(np.average(t_post_d2), 2),
                           round(np.average(t_post_d3), 2)]
    treatment_post_std = [round(np.std(t_post_d1, ddof=1), 2),
                        round(np.std(t_post_d2, ddof=1), 2),
                        round(np.std(t_post_d3, ddof=1), 2)]
    width = 0.35

    fig, ax = plt.subplots()
    ax.bar(np.arange(0, 3) - width / 2, control_pre_mean, width,
           label='Control Pre-test', yerr=control_pre_std, color='r', ecolor='black')
    ax.bar(np.arange(0, 3) + width / 2, control_post_mean, width,
           label='Control Post-test', yerr=control_post_std, color='g', ecolor='black')
    ax.bar(np.arange(3, 6) - width / 2, treatment_pre_mean, width,
           label='Treatment Pre-test', yerr=treatment_pre_std, color='y', ecolor='black')
    ax.bar(np.arange(3, 6) + width / 2, treatment_post_mean, width,
           label='Treatment Post-test', yerr=treatment_post_std, color='c', ecolor='black')

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

    ax.set_ylabel('Mean')
    ax.set_ylim(0.0, 6.0)
    ax.set_title(title)
    ax.set_xticks(np.arange(6) + 0.17)
    ax.set_xticklabels(('Depth 1', 'Depth 2', 'Depth 3', 'Depth 1', 'Depth 2', 'Depth 3'))
    ax.legend(loc='lower left')
    plt.show()

def population_pie_chart(f1, f2):

    perfect_c_player, perfect_t_player, _, _ = filter(f1, f2)

    for g in np.delete(gender_records[0], perfect_c_player):
        gender[g] += 1
    for a in np.delete(age_records[0], perfect_c_player):
        age[a] += 1
    for e in np.delete(education_records[0], perfect_c_player):
        education[e] += 1
    for g in np.delete(gender_records[1], perfect_t_player):
        gender[g] += 1
    for a in np.delete(age_records[1], perfect_t_player):
        age[a] += 1
    for e in np.delete(education_records[1], perfect_t_player):
        education[e] += 1

    for g in gender.keys():
        if gender[g] == 0:
            gender.pop(g)
    for a in age.keys():
        if age[a] == 0:
            age.pop(a)
    for e in education.keys():
        if education[e] == 0:
            education.pop(e)

    fig1, ax1 = plt.subplots()
    # w1, _, _ = ax1.pie(gender.values(),
    #                    autopct=lambda pct: "{:.1f}%\n({:d})".format(pct, int(round(pct / 100. * np.sum(gender.values()))),
    #                                                                  textprops=dict(color="w")),
    #                    colors=colors)
    # ax1.legend(w1, gender.keys())
    # ax1.set_title('Gender proportion after filtering')

    # age_sorted = collections.OrderedDict(sorted(age.items()))
    # w1, _, _ = ax1.pie(age_sorted.values(),
    #                    autopct=lambda pct: "{:.1f}%\n({:d})".format(pct, int(round(pct / 100. * np.sum(age_sorted.values()))),
    #                                                                  textprops=dict(color="w")),
    #                    colors=colors)
    # ax1.legend(w1, age_sorted.keys())
    # ax1.set_title('Age group after filtering')
    #
    w1, _, _ = ax1.pie(education.values(),
                        autopct=lambda pct: "{:.1f}%\n({:d})".format(pct, int(round(pct / 100. * np.sum(education.values())))),
                       colors=colors)
    ax1.legend(w1, ['High School', 'Less than high school', 'Bachelor degree', 'Graduate or professional degree', 'Some college no degree'])
    ax1.set_title('Education level after filtering')

    plt.show()

def population_pie_original(f):

    c_pre_average = np.average(get_correct_question(control_pre[:, :], f))
    c_pre_std = np.std(get_correct_question(control_pre[:, :], f))
    t_pre_average = np.average(get_correct_question(treatment_pre[:, :], f))
    t_pre_std = np.std(get_correct_question(treatment_pre[:, :], f))

    for g in gender_records[0]:
        gender[g] += 1
    for a in age_records[0]:
        age[a] += 1
    for e in education_records[0]:
        education[e] += 1
    for g in gender_records[1]:
        gender[g] += 1
    for a in age_records[1]:
        age[a] += 1
    for e in education_records[1]:
        education[e] += 1

    fig1, ax1 = plt.subplots()
    for g in gender.keys():
        if gender[g] == 0:
            gender.pop(g)
    for a in age.keys():
        if age[a] == 0:
            age.pop(a)
    for e in education.keys():
        if education[e] == 0:
            education.pop(e)

    # w1, _, _ = ax1.pie(gender.values(),
    #                     autopct=lambda pct: "{:.1f}%\n({:d})".format(pct, int(round(pct / 100. * np.sum(gender.values()))),
    #                                                                  textprops=dict(color="w")),
    #                     colors=colors)
    # ax1.legend(w1, gender.keys())
    # ax1.set_title('Gender proportion before filtering')


    # age_sorted = collections.OrderedDict(sorted(age.items()))
    # w1, _, _ = ax1.pie(age_sorted.values(),
    #                    autopct=lambda pct: "{:.1f}%\n({:d})".format(pct, int(round(pct / 100. * np.sum(age_sorted.values()))),
    #                                                                  textprops=dict(color="w")),
    #                    colors=colors)
    # ax1.legend(w1, age_sorted.keys())
    # ax1.set_title('Age group before filtering')


    w1, _, _ = ax1.pie(education.values(),
                        autopct=lambda pct: "{:.1f}%\n({:d})".format(pct, int(round(pct / 100. * np.sum(education.values()))),
                                                                     textprops=dict(color="w")),
                       colors=colors)
    ax1.legend(w1, ['High School', 'Less than high school', 'Bachelor degree', 'Other', 'Graduate or professional degree', 'Some college no degree'])
    ax1.set_title('Education level before filtering')

    plt.show()

# ttest((lambda x: x == 10))
# ttest_with_threshold((lambda x: x == 10), (lambda x: x >= 12), 'Mean No. correct answer of selected participants')
# ttest_with_threshold((lambda x: x == 10), (lambda x: x < 12), 'Mean No. correct answer of filtered participants')
# population_pie_chart((lambda x: x == 10), (lambda x: x >= 12))
# population_pie_original((lambda x: x == 10))
# create_time_graph_for_depth()
create_time_graph_for_depth((lambda x: x == 10), (lambda x: x >= 12), 'Mean response time of selected participants')
# create_time_graph_for_depth((lambda x: x == 10), (lambda x: x < 12),'Mean response time of filtered participants')