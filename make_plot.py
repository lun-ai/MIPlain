import numpy as np
import matplotlib.pyplot as plt


def read_nth_line(file, n):
    file.seek(0, 0)
    for i in range(0, n - 1):
        file.readline()
    return file.readline()


def strip_arr_text(attr, text):
    return list(map(int, text.strip('\n').strip(attr + ':').strip(' ').strip('[').strip(']').split(',')))


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
        grade_5_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

for i in [501, 503, 505, 507, 509, 511, 513]:
    with open('./records/Grade-5/' + str(i) + '.txt', 'r') as file:
        t_grade_5.append(strip_arr_text('scores', read_nth_line(file, 20)))
        # read_nth_line(file, 34)
        t_grade_5_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

for i in [602, 610]:
    with open('./records/Grade-6/' + str(i) + '.txt', 'r') as file:
        grade_6.append(strip_arr_text('scores', read_nth_line(file, 20)))
        # read_nth_line(file, 34)
        grade_6_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

for i in [601, 603, 609]:
    with open('./records/Grade-6/' + str(i) + '.txt', 'r') as file:
        t_grade_6.append(strip_arr_text('scores', read_nth_line(file, 20)))
        # read_nth_line(file, 34)
        t_grade_6_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

for i in [702, 704, 706, 708]:
    with open('./records/Grade-7/' + str(i) + '.txt', 'r') as file:
        grade_7.append(strip_arr_text('scores', read_nth_line(file, 20)))
        # read_nth_line(file, 34)
        grade_7_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

for i in [701, 703, 705, 707]:
    with open('./records/Grade-7/' + str(i) + '.txt', 'r') as file:
        t_grade_7.append(strip_arr_text('scores', read_nth_line(file, 20)))
        # read_nth_line(file, 34)
        t_grade_7_after.append(strip_arr_text('scores', read_nth_line(file, 56)))

print(grade_5)

(grade_5_means, grade_5_std) = ((np.average(np.array(grade_5[:][:5]).flat),
                                 np.average(np.array(grade_5[:][:10]).flat),
                                 np.average(np.array(grade_5[:][:15]).flat)),
                                (np.std(np.array(grade_5[:][:5])),
                                 np.std(np.array(grade_5[:][:10])),
                                 np.std(np.array(grade_5[:][:15]))))

grade_5_after_means, grade_5_after_std = ((np.average(np.array(grade_5_after[:][:5]).flat),
                                           np.average(np.array(grade_5_after[:][:10]).flat),
                                           np.average(np.array(grade_5_after[:][:15]).flat)),
                                          (np.std(np.array(grade_5_after[:][:5])),
                                           np.std(np.array(grade_5_after[:][:10])),
                                           np.std(np.array(grade_5_after[:][:15]))))

(t_grade_5_means, t_grade_5_std) = ((np.average(np.array(t_grade_5[:][:5]).flat),
                                     np.average(np.array(t_grade_5[:][:10]).flat),
                                     np.average(np.array(t_grade_5[:][:15]).flat)),
                                    (np.std(np.array(t_grade_5[:][:5])),
                                     np.std(np.array(t_grade_5[:][:10])),
                                     np.std(np.array(t_grade_5[:][:15]))))

t_grade_5_after_means, t_grade_5_after_std = ((np.average(np.array(t_grade_5_after[:][:5]).flat),
                                               np.average(np.array(t_grade_5_after[:][:10]).flat),
                                               np.average(np.array(t_grade_5_after[:][:15]).flat)),
                                              (np.std(np.array(t_grade_5_after[:][:5])),
                                               np.std(np.array(t_grade_5_after[:][:10])),
                                               np.std(np.array(t_grade_5_after[:][:15]))))

width = 0.35
fig, ax = plt.subplots()
rects1 = ax.bar(np.arange(0, 3) - width / 2, grade_5_means, width, yerr=grade_5_std,
                label='Control Pre-test')
rects2 = ax.bar(np.arange(0, 3) + width / 2, grade_5_after_means, width, yerr=grade_5_after_std,
                label='Control Post-test')
rects3 = ax.bar(np.arange(3, 6) - width / 2, t_grade_5_means, width, yerr=t_grade_5_std,
                label='Treatment Pre-test')
rects4 = ax.bar(np.arange(3, 6) + width / 2, t_grade_5_after_means, width, yerr=t_grade_5_after_std,
                label='Treatment Post-test')

ax.set_title('Mean scores before and after explanation')
ax.set_ylabel('Mean Scores')
ax.set_xticks(np.arange(6))
ax.set_xticklabels(('win 1', 'win 2', 'win 3', 'win 1', 'win 2', 'win 3'))
ax.legend()

plt.show()
