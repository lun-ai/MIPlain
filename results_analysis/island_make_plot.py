import os
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

from results_analysis.utils import compute_mean_std, read_nth_line, strip_arr_text, get_answer_sums, \
    ttest, filter, compute_filtered_mean_std, plot_bar_graph_aux, list_map, integrated_ttest, ttest_ind

DATA_DIR = "./records"

COLORS = ["yellowgreen", "gold", "lightskyblue", "lightcoral", "orange", "deepskyblue"]
GENDER = {"other": 0,
          "male": 0,
          "female": 0}
AGE = {"18-24": 0,
       "25-34": 0,
       "35-44": 0,
       "45-54": 0,
       "55-64": 0,
       ">65": 0}
EDUCATION = {"no": 0,
             "highsch": 0,
             "college": 0,
             "bachelor": 0,
             "master": 0,
             "phd": 0,
             "other": 0}

pretest_scores = [[], []]
posttest_scores = [[], []]
examples_scores = [[], []]
pretest_time = [[], []]
example_time = [[], []]
posttest_time = [[], []]
gender_records = [[], []]
age_records = [[], []]
education_records = [[], []]
ids = [[], []]
c_size = 0
t_size = 0
used_vocab = [1572359790554,
              1572359824791,
              1572360316336,
              1572360855157,
              1572361174316,
              1572361729016,
              1572361751064,
              1572361957131,
              1572363106362,
              1572364056446,
              1572364097865,
              1572364559332,
              1572366826882,
              1572366848727,
              1572367806687,
              1572370358959,
              1572370673361,
              1572371073427,
              1572374337197]


def load_records(dirs):
    os_dirs = [f for d in dirs for f in os.listdir(d)]
    for file_name in os_dirs:
        if file_name.endswith(".txt"):
            ffptr = ""
            for d in dirs:
                try:
                    open(d + file_name, "r")
                except IOError:
                    continue
                else:
                    ffptr = d + file_name

            i = int(file_name.split(".")[0].split("_")[1])
            file = open(ffptr, "r")
            # if i not in used_vocab:
            # if i in used_vocab:
            if i not in []:
                i = i % 2
                age_ = read_nth_line(file, 71).strip("\n")
                age_records[i].append(age_)
                if age_ == "18-24" or age_ == "25-34":
                    ids[i].append(int(read_nth_line(file, 1).strip("\n")))
                    pretest_scores[i].append(strip_arr_text("scores", read_nth_line(file, 22)))
                    pretest_time[i].append(strip_arr_text("time", read_nth_line(file, 23)))
                    examples_scores[i].append(strip_arr_text("scores", read_nth_line(file, 43)))
                    example_time[i].append(strip_arr_text("time on expl", read_nth_line(file, 45)))
                    posttest_scores[i].append(strip_arr_text("scores", read_nth_line(file, 65)))
                    posttest_time[i].append(strip_arr_text("time", read_nth_line(file, 66)))
                    gender_records[i].append(read_nth_line(file, 69).strip("\n"))
                    education_records[i].append(read_nth_line(file, 73).strip("\n"))


def resT_graph_and_ttest(title):
    """

    Create a bar graph of response time with variance and run a paired one-side t test for both the control
    and treatment groups

    :param title:
    :return:
    """

    def id1(x): return x
    def id2(l, f): return list_map(f, list(l.flat))

    # treatment_pre_time[2].pop(28)
    # treatment_post[2].pop(28)

    control_pre_mean, control_pre_std = compute_mean_std(id1, control_pre_time, id2)
    control_post_mean, control_post_std = compute_mean_std(id1, control_post_time, id2)
    treatment_pre_mean, treatment_pre_std = compute_mean_std(id1, treatment_pre_time, id2)
    treatment_post_mean, treatment_post_std = compute_mean_std(id1, treatment_post_time,id2)

    integrated_ttest([control_pre_time, control_post_time], [treatment_pre_time, treatment_post_time], id1, id2)

    plot_bar_graph_aux([control_pre_mean, []],
                       [control_post_mean, []],
                       [treatment_pre_mean, []],
                       [treatment_post_mean, []],
                       "Time(sec)", title)


def resT_graph_and_ttest_with_threshold(title, f1, f2):
    """

    Create a bar graph of response time with variance and run a paired one-side t test for both the
    control and treatment groups after applying the filter f2

    :param f1:
    :param f2:
    :param title:
    :return:
    """

    # treatment_pre_time[1].pop(9)
    # treatment_post_time[1].pop(9)

    perfect_c_player, [c_pre_d1, c_pre_d2, c_pre_d3], control_pre_mean, control_pre_std \
        = compute_filtered_mean_std(f1, f2, control_pre, "Control group pre")
    perfect_t_player, [t_pre_d1, t_pre_d2, t_pre_d3], treatment_pre_mean, treatment_pre_std \
        = compute_filtered_mean_std(f1, f2, treatment_pre, "Treatment group pre")
    _, [c_post_d1, c_post_d2, c_post_d3], control_post_mean, control_post_std \
        = compute_filtered_mean_std(f1, f2, control_post, "Control group post", idxs=perfect_c_player)
    _, [t_post_d1, t_post_d2, t_post_d3], treatment_post_mean, treatment_post_std \
        = compute_filtered_mean_std(f1, f2, treatment_post, "Treatment group post", idxs=perfect_t_player)

    ttest([[c_pre_d1, c_pre_d2, c_pre_d3], [c_post_d1, c_post_d2, c_post_d3]],
          [[t_pre_d1, t_pre_d2, t_pre_d3], [t_post_d1, t_post_d2, t_post_d3]])

    plot_bar_graph_aux([control_pre_mean, control_pre_std],
                       [control_post_mean, control_post_std],
                       [treatment_pre_mean, treatment_pre_std],
                       [treatment_post_mean, treatment_post_std],
                       "Time (sec)", title)


def plot_bar_graph_for_depths(c_raw, t_raw, f):
    """

    Plot a bar graph with variance on processed data for 3 depths

    :param f:
    :return:

    """

    c_pre, c_post = c_raw
    t_pre, t_post = t_raw

    control_pre_mean, control_pre_std = compute_mean_std(f, c_pre)
    control_post_mean, control_post_std = compute_mean_std(f, c_post)
    treatment_pre_mean, treatment_pre_std = compute_mean_std(f, t_pre)
    treatment_post_mean, treatment_post_std = compute_mean_std(f, t_post)

    _, ax = plt.subplots()

    ax.hlines(1.7, -2.0, 6.0, label="random depth 1", color="darkviolet", linestyles="dashed")
    ax.hlines(1.4, -2.0, 6.0, label="random depth 2", color="b", linestyles="dashed")
    ax.hlines(2.3, -2.0, 6.0, label="random depth 3", color="darkslategrey", linestyles="dashed")

    plot_bar_graph_aux([control_pre_mean, control_pre_std],
                       [control_post_mean, control_post_std],
                       [treatment_pre_mean, treatment_pre_std],
                       [treatment_post_mean, treatment_post_std],
                       "NO. Correct Answers", "Mean Performance", ax=ax)


def perf_graph_and_ttest(f):
    """

    Plot bar graph of performance with variance and run a paired one-sided t test for control
    and treatment groups

    :param f:
    :return:
    """

    integrated_ttest([control_pre, control_post], [treatment_pre, treatment_post], f)
    plot_bar_graph_for_depths([control_pre, control_post], [treatment_pre, treatment_post], f)


def perf_graph_and_ttest_with_threshold(title, f1, f2):
    """

    Plot bar graph of performance with variance and run a paired one-sided t test for control
    and treatment groups after filtered with f2

    :param f1:
    :param f2:
    :param title:
    :return:
    """

    perfect_c_player, [c_pre_d1, c_pre_d2, c_pre_d3], control_pre_mean, control_pre_std \
        = compute_filtered_mean_std(f1, f2, control_pre, "Control group pre")
    perfect_t_player, [t_pre_d1, t_pre_d2, t_pre_d3], treatment_pre_mean, treatment_pre_std \
        = compute_filtered_mean_std(f1, f2, treatment_pre, "Treatment group pre")
    _, [c_post_d1, c_post_d2, c_post_d3], control_post_mean, control_post_std \
        = compute_filtered_mean_std(f1, f2, control_post, "Control group post", idxs=perfect_c_player)
    _, [t_post_d1, t_post_d2, t_post_d3], treatment_post_mean, treatment_post_std \
        = compute_filtered_mean_std(f1, f2, treatment_post, "Treatment group post", idxs=perfect_t_player)

    ttest([[c_pre_d1, c_pre_d2, c_pre_d3], [c_post_d1, c_post_d2, c_post_d3]], [[t_pre_d1, t_pre_d2, t_pre_d3], [t_post_d1, t_post_d2, t_post_d3]])

    control_all_depth = np.append(np.append(c_pre_d1, c_pre_d2), c_pre_d3)
    control_post_all_depth = np.append(np.append(c_post_d1, c_post_d2), c_post_d3)
    treatment_all_depth = np.append(np.append(t_pre_d1, t_pre_d2), t_pre_d3)
    treatment_post_all_depth = np.append(np.append(t_post_d1, t_post_d2), t_post_d3)

    print("Overall - control ttest: " + str(stats.ttest_rel(control_all_depth, control_post_all_depth)[1]))
    print("Overall - control ttest means: " + str(np.average(control_all_depth)) + ", "
          + str(np.average(control_post_all_depth)))
    print("Overall - treatment ttest: " + str(stats.ttest_rel(treatment_all_depth, treatment_post_all_depth)[1]))
    print("Overall - treatment ttest means: " + str(np.average(treatment_all_depth)) + ", "
          + str(np.average(treatment_post_all_depth)))

    plot_bar_graph_aux([control_pre_mean, control_pre_std],
                       [control_post_mean, control_post_std],
                       [treatment_pre_mean, treatment_pre_std],
                       [treatment_post_mean, treatment_post_std],
                       "NO. Correct Answers", title)



def population_pie_chart(f1, f2):
    perfect_c_player, perfect_t_player, _, _ = filter(control_pre, treatment_pre, f1, f2)

    for g in np.delete(gender_records[0], perfect_c_player):
        GENDER[g] += 1
    for a in np.delete(age_records[0], perfect_c_player):
        AGE[a] += 1
    for e in np.delete(education_records[0], perfect_c_player):
        EDUCATION[e] += 1
    for g in np.delete(gender_records[1], perfect_t_player):
        GENDER[g] += 1
    for a in np.delete(age_records[1], perfect_t_player):
        AGE[a] += 1
    for e in np.delete(education_records[1], perfect_t_player):
        EDUCATION[e] += 1

    for g in GENDER.keys():
        if GENDER[g] == 0:
            GENDER.pop(g)
    for a in AGE.keys():
        if AGE[a] == 0:
            AGE.pop(a)
    for e in EDUCATION.keys():
        if EDUCATION[e] == 0:
            EDUCATION.pop(e)

    fig1, ax1 = plt.subplots()
    # w1, _, _ = ax1.pie(gender.values(),
    #                    autopct=lambda pct: "{:.1f}%\n({:d})".format(pct, int(round(pct / 100. * np.sum(gender.values()))),
    #                                                                  textprops=dict(color="w")),
    #                    colors=colors)
    # ax1.legend(w1, gender.keys())
    # ax1.set_title("Gender proportion after filtering")

    # age_sorted = collections.OrderedDict(sorted(age.items()))
    # w1, _, _ = ax1.pie(age_sorted.values(),
    #                    autopct=lambda pct: "{:.1f}%\n({:d})".format(pct, int(round(pct / 100. * np.sum(age_sorted.values()))),
    #                                                                  textprops=dict(color="w")),
    #                    colors=colors)
    # ax1.legend(w1, age_sorted.keys())
    # ax1.set_title("Age group after filtering")
    #
    w1, _, _ = ax1.pie(EDUCATION.values(),
                       autopct=lambda pct: "{:.1f}%\n({:d})".format(pct, int(
                           round(pct / 100. * np.sum(EDUCATION.values())))),
                       colors=COLORS)
    ax1.legend(w1, ["High School", "Less than high school", "Bachelor degree", "Graduate or professional degree",
                    "Some college no degree"])
    ax1.set_title("Education level after filtering")

    plt.show()


def population_pie_original(f):
    c_pre_average = np.average(get_answer_sums(control_pre[:, :], f))
    c_pre_std = np.std(get_answer_sums(control_pre[:, :], f))
    t_pre_average = np.average(get_answer_sums(treatment_pre[:, :], f))
    t_pre_std = np.std(get_answer_sums(treatment_pre[:, :], f))

    for g in gender_records[0]:
        GENDER[g] += 1
    for a in age_records[0]:
        AGE[a] += 1
    for e in education_records[0]:
        EDUCATION[e] += 1
    for g in gender_records[1]:
        GENDER[g] += 1
    for a in age_records[1]:
        AGE[a] += 1
    for e in education_records[1]:
        EDUCATION[e] += 1

    fig1, ax1 = plt.subplots()
    for g in GENDER.keys():
        if GENDER[g] == 0:
            GENDER.pop(g)
    for a in AGE.keys():
        if AGE[a] == 0:
            AGE.pop(a)
    for e in EDUCATION.keys():
        if EDUCATION[e] == 0:
            EDUCATION.pop(e)

    # w1, _, _ = ax1.pie(gender.values(),
    #                     autopct=lambda pct: "{:.1f}%\n({:d})".format(pct, int(round(pct / 100. * np.sum(gender.values()))),
    #                                                                  textprops=dict(color="w")),
    #                     colors=colors)
    # ax1.legend(w1, gender.keys())
    # ax1.set_title("Gender proportion before filtering")

    # age_sorted = collections.OrderedDict(sorted(age.items()))
    # w1, _, _ = ax1.pie(age_sorted.values(),
    #                    autopct=lambda pct: "{:.1f}%\n({:d})".format(pct, int(round(pct / 100. * np.sum(age_sorted.values()))),
    #                                                                  textprops=dict(color="w")),
    #                    colors=colors)
    # ax1.legend(w1, age_sorted.keys())
    # ax1.set_title("Age group before filtering")

    w1, _, _ = ax1.pie(EDUCATION.values(),
                       autopct=lambda pct: "{:.1f}%\n({:d})".format(pct,
                                                                    int(round(pct / 100. * np.sum(EDUCATION.values()))),
                                                                    textprops=dict(color="w")),
                       colors=COLORS)
    ax1.legend(w1,
               ["High School", "Less than high school", "Bachelor degree", "Other", "Graduate or professional degree",
                "Some college no degree"])
    ax1.set_title("Education level before filtering")

    plt.show()


def multiple_thresholds(title, y_axis_name, c_raw, t_raw, f1, f2, f3, k=get_answer_sums):
    """

    Partition the pre-test and post-test results of control and treatment separately by f2 and f3
    pre-test by f2
    post-test by f3

    :param f1:
    :param f2:
    :param f3:
    :return:
    """

    c_pre, c_post = c_raw
    t_pre, t_post = t_raw

    c_idxs, [c_post_d1, c_post_d2, c_post_d3], control_post_mean, control_post_std \
        = compute_filtered_mean_std(f1, f3, c_post, "Control group post", k=k)
    t_idxs, [t_post_d1, t_post_d2, t_post_d3], treatment_post_mean, treatment_post_std \
        = compute_filtered_mean_std(f1, f3, t_post, "Treatment group post", k=k)

    # f2 not used when idxs is given
    _, [c_pre_d1, c_pre_d2, c_pre_d3], control_pre_mean, control_pre_std \
        = compute_filtered_mean_std(f1, f2, c_pre, "Control group pre", k=k, idxs=c_idxs)
    _, [t_pre_d1, t_pre_d2, t_pre_d3], treatment_pre_mean, treatment_pre_std \
        = compute_filtered_mean_std(f1, f2, t_pre, "Treatment group pre", k=k, idxs=t_idxs)

    ttest([[c_pre_d1, c_pre_d2, c_pre_d3], [c_post_d1, c_post_d2, c_post_d3]],
          [[t_pre_d1, t_pre_d2, t_pre_d3], [t_post_d1, t_post_d2, t_post_d3]])

    # control_all_depth = np.append(np.append(c_pre_d1, c_pre_d2), c_pre_d3)
    # control_post_all_depth = np.append(np.append(c_post_d1, c_post_d2), c_post_d3)
    # treatment_all_depth = np.append(np.append(t_pre_d1, t_pre_d2), t_pre_d3)
    # treatment_post_all_depth = np.append(np.append(t_post_d1, t_post_d2), t_post_d3)

    # print("Overall - control ttest: " + str(stats.ttest_rel(control_all_depth, control_post_all_depth)[1]))
    # print("Overall - control ttest means: " + str(np.average(control_all_depth)) + ", "
    #       + str(np.average(control_post_all_depth)))
    # print("Overall - treatment ttest: " + str(stats.ttest_rel(treatment_all_depth, treatment_post_all_depth)[1]))
    # print("Overall - treatment ttest means: " + str(np.average(treatment_all_depth)) + ", "
    #       + str(np.average(treatment_post_all_depth)))

    plot_bar_graph_aux([control_pre_mean, control_pre_std],
                       [control_post_mean, control_post_std],
                       [treatment_pre_mean, treatment_pre_std],
                       [treatment_post_mean, treatment_post_std],
                       y_axis_name, title)


if __name__ == "__main__":

    """

    There are a total of five experiments
    1) Imperial NNC
    2) Children NNC
    3) Amazon NNC
    4) Amazon Island 1
    5) Amazon Island 2
    6) College student Island (need further analysis from data)
    
    """

    # (4)
    # load_records(["./records/island1/"])

    # (5)
    # load_records(["./records/island2/"])

    # (4) and (5)
    # load_records([DATA_DIR + "/island1/", DATA_DIR + "/island2/"])

    # (6)
    # load_records(["./records/island3/records_9_12/"])
    # load_records(["./records/island3/records_10_12/"])
    load_records(["./records/island3/records_9_12/", "./records/island3/records_10_12/"])

    c_size = len(pretest_scores[0])
    t_size = len(pretest_scores[1])

    control_pre = np.array(pretest_scores[0], dtype=np.int)
    control_post = np.array(posttest_scores[0], dtype=np.int)
    treatment_pre = np.array(pretest_scores[1], dtype=np.int)
    treatment_post = np.array(posttest_scores[1], dtype=np.int)
    control_pre_time = np.array(pretest_time[0], dtype=np.float16)
    control_post_time = np.array(posttest_time[0], dtype=np.float16)
    treatment_pre_time = np.array(pretest_time[1], dtype=np.float16)
    treatment_post_time = np.array(posttest_time[1], dtype=np.float16)

    c_raw = [control_pre, control_post]
    t_raw = [treatment_pre, treatment_post]
    c_raw_T = [control_pre_time, control_post_time]
    t_raw_T = [treatment_pre_time, treatment_post_time]

    """
        
    Define function to pre-process / filter data
    
`   """

    def correct(x): return x == 10
    def id1(x): return x
    def id2(l, f): return list_map(f, list(l.flat))


    """
    
    Demography
    
    """
    # population_pie_chart((lambda x: x == 10), (lambda x: x >= 12))
    # population_pie_original((lambda x: x == 10))

    """
    
    Whole processed data performance
    
    """
    # perf_graph_and_ttest((lambda x: x == 10))

    """
    
    Filtered processed data performance
    
    """
    perf_graph_and_ttest_with_threshold("Mean No. correct answer of participants,  u - sigma <= initial accuracy < u + sigma",
                                        (lambda x: x == 10), (lambda x, u, std: x >= u + std or x <= u - std))
    # perf_graph_and_ttest_with_threshold((lambda x: x == 10), (lambda x, u, std: x < u + std), "Mean No. correct answer of participants, u + sigma <= initial accuracy")
    # perf_graph_and_ttest_with_threshold((lambda x: x == 10), (lambda x, u, std: x >= u - std), "Mean No. correct answer of participants, initial accuracy < u - sigma")

    """
    
    Whole processed data response time
    
    """
    # resT_graph_and_ttest("Mean Time for Answer, used vocab")
    # resT_graph_and_ttest("Mean Time for Answer, did not use vocab")

    """
    
    Filtered processed data response time
    
    """
    # resT_graph_and_ttest_with_threshold("Mean response time of participants, u - sigma <= initial accuracy < u + sigma",
    #                                     (lambda x: x == 10), (lambda x, u, std: x >= u + std or x <= u - std))
    # resT_graph_and_ttest_with_threshold("Mean response time of participants, u + sigma <= initial accuracy",
    #                                     (lambda x: x == 10), (lambda x, u, std: x < u + std))
    # resT_graph_and_ttest_with_threshold("Mean response time of participants, initial accuracy < u - sigma",
    #                                     (lambda x: x == 10), (lambda x, u, std: x > u - std))

    """
    
    Multiple partitions performance
    
    """
    # multiple_thresholds("Performance", "NO. correct answer", c_raw, t_raw, correct, (lambda x, u, std: x > u), (lambda x, u, std: x > u))
    # multiple_thresholds("Performance", "NO. correct answer", c_raw, t_raw, correct, (lambda x, u, std: x > u),
    #                     (lambda x, u, std: x <= u))
    # multiple_thresholds("Performance", "NO. correct answer", c_raw, t_raw, correct, (lambda x, u, std: x <= u),
    #                     (lambda x, u, std: x > u))
    # multiple_thresholds("Performance", "NO. correct answer", c_raw, t_raw, correct, (lambda x, u, std: x <= u),
    #                     (lambda x, u, std: x <= u))

    # multiple_thresholds("Response time", "Time (sec)", c_raw_T, t_raw_T, id1,
    #                     (lambda x, u, std: x > u), (lambda x, u, std: x > u), k=id2)
    # multiple_thresholds("Response time", "Time (sec)", c_raw_T, t_raw_T, id1,
    #                     (lambda x, u, std: x > u),
    #                     (lambda x, u, std: x <= u), k=id2)
    # multiple_thresholds("Response time", "Time (sec)", c_raw_T, t_raw_T, id1,
    #                     (lambda x, u, std: x <= u),
    #                     (lambda x, u, std: x > u), k=id2)
    # multiple_thresholds("Response time", "Time (sec)", c_raw_T, t_raw_T, id1,
    #                     (lambda x, u, std: x <= u),
    #                     (lambda x, u, std: x <= u), k=id2)

