import numpy as np
import matplotlib.pyplot as plt


def read_nth_line(file, n):
    file.seek(0, 0)
    for i in range(0, n - 1):
        file.readline()
    return str(file.readline())


def strip_arr_text(attr, text):
    return list(map(float, text.strip(attr + ':').strip('\n').strip(' ').strip('[').strip(']').split(',')))


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

for i in [502, 504, 506, 508, 510, 512]:
    with open('./records/Grade-5/' + str(i) + '.txt', 'r') as file:
        grade_5.append(strip_arr_text('scores', read_nth_line(file, 20)))
        # read_nth_line(file, 34)
        time_before.append(strip_arr_text('time', read_nth_line(file, 21)))
        time_exp.append(strip_arr_text('time on expl', read_nth_line(file, 36)))
        time_after.append(strip_arr_text('time', read_nth_line(file, 57)))
        grade_5_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

for i in [503, 505, 507, 509, 511, 513]:
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

for i in [701, 703, 707]:
    with open('./records/Grade-7/' + str(i) + '.txt', 'r') as file:
        t_grade_7.append(strip_arr_text('scores', read_nth_line(file, 20)))
        # read_nth_line(file, 34)
        t_time_before.append(strip_arr_text('time', read_nth_line(file, 21)))
        t_time_exp.append(strip_arr_text('time on expl', read_nth_line(file, 36)))
        t_time_after.append(strip_arr_text('time', read_nth_line(file, 57)))
        t_grade_7_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

print(grade_5_after + grade_6_after)

grade_5 = np.array(grade_5 + grade_6 + grade_7, dtype=np.float64)
grade_5 += np.ones(grade_5.shape) * 10
grade_5_after = np.array(grade_5_after + grade_6_after + grade_7_after, dtype=np.float64)
grade_5_after += np.ones(grade_5_after.shape) * 10
t_grade_5 = np.array(t_grade_5 + t_grade_6 + t_grade_7, dtype=np.float64)
t_grade_5 += np.ones(t_grade_5.shape) * 10
t_grade_5_after = np.array(t_grade_5_after + t_grade_6_after + t_grade_7_after, dtype=np.float64)
t_grade_5_after += np.ones(t_grade_5_after.shape) * 10

time_before = np.array(time_before)
time_exp = np.array(time_exp)
time_after = np.array(time_after)

t_time_before = np.array(t_time_before)
t_time_exp = np.array(t_time_exp)
t_time_after = np.array(t_time_after)

print(t_grade_5[:, 5:10])
print(t_grade_5_after[:, 5:10])
(grade_5_means, grade_5_std) = ((np.average(grade_5[:, :5].flat),
                                 np.average(grade_5[:, 5:10].flat),
                                 np.average(grade_5[:, 10:15].flat)),
                                (np.std(grade_5[:, :5].flat),
                                 np.std(grade_5[:, 5:10].flat),
                                 np.std(grade_5[:, 10:15].flat)))

grade_5_after_means, grade_5_after_std = ((np.average(grade_5_after[:, :5].flat),
                                           np.average(grade_5_after[:, 5:10].flat),
                                           np.average(grade_5_after[:, 10:15].flat)),
                                          (np.std(grade_5_after[:, :5].flat),
                                           np.std(grade_5_after[:, 5:10].flat),
                                           np.std(grade_5_after[:, 10:15].flat)))
print(grade_5_after_std)

(t_grade_5_means, t_grade_5_std) = ((np.average(t_grade_5[:, :5].flat),
                                     np.average(t_grade_5[:, 5:10].flat),
                                     np.average(t_grade_5[:, 10:15].flat)),
                                    (np.std(t_grade_5[:, :5].flat),
                                     np.std(t_grade_5[:, 5:10].flat),
                                     np.std(t_grade_5[:, 10:15].flat)))

t_grade_5_after_means, t_grade_5_after_std = ((np.average(t_grade_5_after[:, :5].flat),
                                               np.average(t_grade_5_after[:, 5:10].flat),
                                               np.average(t_grade_5_after[:, 10:15].flat)),
                                              (np.std(t_grade_5_after[:, :5].flat),
                                               np.std(t_grade_5_after[:, 5:10].flat),
                                               np.std(t_grade_5_after[:, 10:15].flat)))
(time_means, time_std) = ((np.average(time_before.flat),
                           np.average(time_exp.flat),
                           np.average(time_after.flat)),
                          (np.std(time_before.flat),
                           np.std(time_exp.flat),
                           np.std(time_after.flat)))

(t_time_means, t_time_std) = ((np.average(t_time_before.flat),
                               np.average(t_time_exp.flat),
                               np.average(t_time_after.flat)),
                              (np.std(t_time_before.flat),
                               np.std(t_time_exp.flat),
                               np.std(t_time_after.flat)))

width = 0.35
fig, ax = plt.subplots()
ax.bar(np.arange(0, 3) - width / 2, grade_5_means, width, #yerr=grade_5_std,
       label='Control Pre-test', ecolor='black', capsize=4)
ax.bar(np.arange(0, 3) + width / 2, grade_5_after_means, width, #yerr=grade_5_after_std,
       label='Control Post-test', ecolor='black', capsize=4)
ax.bar(np.arange(3, 6) - width / 2, t_grade_5_means, width, #yerr=t_grade_5_std,
       label='Treatment Pre-test', ecolor='black', capsize=4)
ax.bar(np.arange(3, 6) + width / 2, t_grade_5_after_means, width, #yerr=t_grade_5_after_std,
       label='Treatment Post-test', ecolor='black', capsize=4)

# ax.boxplot([list(grade_5[:, :5].flat), list(grade_5[:, 5:10].flat), list(grade_5[:, 10:15].flat)], positions=list(np.arange(0, 3) - width / 2), widths=width)
# ax.boxplot([list(grade_5_after[:, :5].flat), list(grade_5_after[:, 5:10].flat), list(grade_5_after[:, 10:15].flat)], positions=list(np.arange(0, 3) - width / 2), widths=width)
# ax.boxplot([list(t_grade_5[:, :5].flat), list(t_grade_5[:, 5:10].flat), list(t_grade_5[:, 10:15].flat)],positions=list(np.arange(3, 6) - width / 2), widths=width)
# ax.boxplot([list(t_grade_5_after[:, :5].flat), list(t_grade_5_after[:, 5:10].flat), list(t_grade_5_after[:, 10:15].flat)],positions=list(np.arange(3, 6) - width / 2), widths=width)

ax.set_title('Test Scores (Won-20, Drawn-10,Loss-0)')
ax.set_ylabel('Test Scores')
ax.set_xticks(np.arange(6))
ax.set_xticklabels(('win 1', 'win 2', 'win 3', 'win 1', 'win 2', 'win 3'))
ax.legend()

fig2, ax2 = plt.subplots()
# ax2.bar(np.arange(0, 3) - width / 2, time_means, width, yerr=time_std,
#        label='Control Answer Time', ecolor='black', capsize=4)
# ax2.bar(np.arange(0, 3) + width / 2, t_time_means, width, yerr=t_time_std,
#        label='Treatment Answer Time', ecolor='black', capsize=4)

ax2.boxplot([list(time_before.flat), list(time_after.flat)], positions=list(np.arange(1,3) - width / 2), widths=0.35, showfliers=False)
ax2.boxplot([list(t_time_before.flat), list(t_time_after.flat)], positions=list(np.arange(1, 3) + width / 2), widths=0.35, showfliers=False)
ax2.set_title('Response time before and after Part2 training')
ax2.set_ylabel('Response time (sec)')
ax2.set_xticks(np.arange(0,4))
ax2.set_xticklabels(('','Pre-test', 'Post-test',''))

plt.show()
