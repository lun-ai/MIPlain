import numpy as np
from scipy import stats
from matplotlib import pyplot as plt


def read_nth_line(file, n):
    file.seek(0, 0)
    for i in range(0, n - 1):
        file.readline()
    return str(file.readline())


def strip_arr_text(attr, text):
    return list(map(float, text.strip(attr + ":").strip(" ").strip("[").split("]")[0].split(",")))


def list_map(f, l):
    return list(map(f, l))


def ttest_two_tailed_to_one_tailed(test):
    return test[0], test[1] / 2




def get_answer_sums(l, f):
    return np.sum(list_map(f, list(l)), axis=-1)


def compute_mean_std(f, raw_data, k=get_answer_sums):
    """

    Given answers in format, [1, 0, 0, 1, 0, ...] compute mean and std of each depth

    :param f:
    :param raw_data:
    :return:
    """
    mean = [round(np.average(k(raw_data[:, :5], f)), 2),
            round(np.average(k(raw_data[:, 5:10], f)), 2),
            round(np.average(k(raw_data[:, 10:15], f)), 2)]
    std = [round(np.std(k(raw_data[:, :5], f), ddof=1, dtype=np.float32), 2),
           round(np.std(k(raw_data[:, 5:10], f), ddof=1, dtype=np.float32), 2),
           round(np.std(k(raw_data[:, 10:15], f), ddof=1, dtype=np.float32), 2)]

    return mean, std


def compute_filtered_mean_std(f1, f2, raw_data, name, k=get_answer_sums, idxs=None):
    """

    Given answers in format, [1, 0, 0, 1, 0, ...]  compute mean and std of each depth for filtered
    subjects according to f2

    :param f1:
    :param f2:
    :param raw_data:
    :return:
    """

    idx_for_removal = idxs

    if (idxs == None):
        idx_for_removal, filtered_answers = filter_aux(f1, f2, raw_data, name, k=k)
        d1 = np.delete(filtered_answers[0], idx_for_removal)
        d2 = np.delete(filtered_answers[1], idx_for_removal)
        d3 = np.delete(filtered_answers[2], idx_for_removal)
    else:
        d1 = np.delete(k(raw_data[:, :5], f1), idxs)
        d2 = np.delete(k(raw_data[:, 5:10], f1), idxs)
        d3 = np.delete(k(raw_data[:, 10:15], f1), idxs)

    mean = [round(np.average(d1), 2),
            round(np.average(d2), 2),
            round(np.average(d3), 2)]
    std = [round(np.std(d1, ddof=1, dtype=np.float32), 2),
           round(np.std(d2, ddof=1, dtype=np.float32), 2),
           round(np.std(d3, ddof=1, dtype=np.float32), 2)]

    return idx_for_removal, [d1, d2, d3], mean, std


def integrated_ttest(c_raw_data, t_raw_data, f, k=get_answer_sums):
    c_pre, c_post = c_raw_data
    t_pre, t_post = t_raw_data

    c_pre_d1 = k(c_pre[:, :5], f)
    c_pre_d2 = k(c_pre[:, 5:10], f)
    c_pre_d3 = k(c_pre[:, 10:15], f)
    c_post_d1 = k(c_post[:, :5], f)
    c_post_d2 = k(c_post[:, 5:10], f)
    c_post_d3 = k(c_post[:, 10:15], f)

    t_pre_d1 = k(t_pre[:, :5], f)
    t_pre_d2 = k(t_pre[:, 5:10], f)
    t_pre_d3 = k(t_pre[:, 10:15], f)
    t_post_d1 = k(t_post[:, :5], f)
    t_post_d2 = k(t_post[:, 5:10], f)
    t_post_d3 = k(t_post[:, 10:15], f)

    print("depth 1 - control t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(stats.ttest_rel(c_pre_d1, c_post_d1)))
    print("depth 2 - control t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(stats.ttest_rel(c_pre_d2, c_post_d2)))
    print("depth 3 - control t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(stats.ttest_rel(c_pre_d3, c_post_d3)))
    print(
        "depth 1 - treatment t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(stats.ttest_rel(t_pre_d1, t_post_d1)))
    print(
        "depth 2 - treatment t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(stats.ttest_rel(t_pre_d2, t_post_d2)))
    print(
        "depth 3 - treatment t: %.3f - p: %.3f" % ttest_two_tailed_to_one_tailed(stats.ttest_rel(t_pre_d3, t_post_d3)))

    print("depth 1 - control vs. treatment pre t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(
        stats.ttest_ind(c_pre_d1, t_pre_d1)))
    print("depth 2 - control vs. treatment pre t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(
        stats.ttest_ind(c_pre_d2, t_pre_d2)))
    print("depth 3 - control vs. treatment pre t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(
        stats.ttest_ind(c_pre_d3, t_pre_d3)))


def ttest(c_data, t_data):
    """

    Given filtered control and treatment data, compute p-values and print to console

    :param c_data:
    :param t_data:
    :return:
    """

    [c_pre_d1, c_pre_d2, c_pre_d3], [c_post_d1, c_post_d2, c_post_d3] = c_data
    [t_pre_d1, t_pre_d2, t_pre_d3], [t_post_d1, t_post_d2, t_post_d3] = t_data

    print("depth 1 - control t: %.3f - p: %.5f " % ttest_two_tailed_to_one_tailed(stats.ttest_rel(c_pre_d1, c_post_d1)))
    print("depth 2 - control t: %.3f - p: %.5f " % ttest_two_tailed_to_one_tailed(stats.ttest_rel(c_pre_d2, c_post_d2)))
    print("depth 3 - control t: %.3f - p: %.5f " % ttest_two_tailed_to_one_tailed(stats.ttest_rel(c_pre_d3, c_post_d3)))
    print(
        "depth 1 - treatment t: %.3f - p: %.5f " % ttest_two_tailed_to_one_tailed(stats.ttest_rel(t_pre_d1, t_post_d1)))
    print(
        "depth 2 - treatment t: %.3f - p: %.5f " % ttest_two_tailed_to_one_tailed(stats.ttest_rel(t_pre_d2, t_post_d2)))
    print(
        "depth 3 - treatment t: %.3f - p: %.5f" % ttest_two_tailed_to_one_tailed(stats.ttest_rel(t_pre_d3, t_post_d3)))

    print("depth 1 - control vs. treatment pre t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(
        stats.ttest_ind(c_pre_d1, t_pre_d1)))
    print("depth 2 - control vs. treatment pre t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(
        stats.ttest_ind(c_pre_d2, t_pre_d2)))
    print("depth 3 - control vs. treatment pre t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(
        stats.ttest_ind(c_pre_d3, t_pre_d3)))

    print("depth 1 - control vs. treatment post t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(
        stats.ttest_ind(c_post_d1, t_post_d1)))
    print("depth 2 - control vs. treatment post t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(
        stats.ttest_ind(c_post_d2, t_post_d2)))
    print("depth 3 - control vs. treatment post t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(
        stats.ttest_ind(c_post_d3, t_post_d3)))


def ttest_ind(c_data, t_data):
    """

    Given filtered control and treatment data, compute p-values and print to console

    :param c_data:
    :param t_data:
    :return:
    """

    [c_pre_d1, c_pre_d2, c_pre_d3], [c_post_d1, c_post_d2, c_post_d3] = c_data
    [t_pre_d1, t_pre_d2, t_pre_d3], [t_post_d1, t_post_d2, t_post_d3] = t_data

    print("depth 1 - control t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(stats.ttest_ind(c_pre_d1, c_post_d1)))
    print("depth 2 - control t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(stats.ttest_ind(c_pre_d2, c_post_d2)))
    print("depth 3 - control t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(stats.ttest_ind(c_pre_d3, c_post_d3)))
    print(
        "depth 1 - treatment t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(stats.ttest_ind(t_pre_d1, t_post_d1)))
    print(
        "depth 2 - treatment t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(stats.ttest_ind(t_pre_d2, t_post_d2)))
    print(
        "depth 3 - treatment t: %.3f - p: %.3f" % ttest_two_tailed_to_one_tailed(stats.ttest_ind(t_pre_d3, t_post_d3)))

    print("depth 1 - control vs. treatment pre t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(
        stats.ttest_ind(c_pre_d1, t_pre_d1)))
    print("depth 2 - control vs. treatment pre t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(
        stats.ttest_ind(c_pre_d2, t_pre_d2)))
    print("depth 3 - control vs. treatment pre t: %.3f - p: %.3f " % ttest_two_tailed_to_one_tailed(
        stats.ttest_ind(c_pre_d3, t_pre_d3)))


def filter_aux(f1, f2, data, name, k=get_answer_sums):
    size = len(data)
    d1 = k(data[:, :5], f1)
    d2 = k(data[:, 5:10], f1)
    d3 = k(data[:, 10:15], f1)
    average = np.average(k(data[:, :], f1))
    std = np.std(k(data[:, :], f1), dtype=np.float32)
    idx_for_removal = [i for i in range(size) if
                       f2(d1[i] + d2[i] + d3[i], average, std)]
    print("***************************")
    print(name + " mean: " + str(average))
    print(name + " std: " + str(std))
    print("Removed / remaining group data: %d / %d \n" % (
        len(idx_for_removal), size - len(idx_for_removal)))

    return idx_for_removal, [d1, d2, d3]


def filter(c, t, f1, f2, k=get_answer_sums):
    """

    Filter pre-test performance according to f2

    :param f1:
    :param f2:
    :return:
    """

    perfect_c_player, [c_d1, c_d2, c_d3] = filter_aux(f1, f2, c, "Control group", k=k)
    perfect_t_player, [t_d1, t_d2, t_d3] = filter_aux(f1, f2, t, "Treatment group", k=k)

    print("Total subject number: " + str(len(c_d1) + len(t_d1) - len(perfect_t_player) - len(perfect_c_player)))
    print("***************************")

    return perfect_c_player, perfect_t_player, [c_d1, c_d2, c_d3], [t_d1, t_d2, t_d3]


def filter_t(x, mean, std):
    return [i for i in range(len(x)) if (mean + std) <= x[i] or x[i] <= (mean - std)]


def plot_bar_graph_aux(a1, a2, a3, a4, ylabel, title, ax=None):
    """

    Plot a bar graph from provided subjects" mean performance and std

    :param f:
    :return:
    """

    c_pre_mean, c_pre_std = a1
    c_post_mean, c_post_std = a2
    t_pre_mean, t_pre_std = a3
    t_post_mean, t_post_std = a4

    plt.style.use('ggplot')

    if ax == None:
        _, ax = plt.subplots()

    width = 0.35
    ax.bar(np.arange(0, 3) - width / 2, c_pre_mean, width,
           label="MS pre-test", yerr=c_pre_std, alpha=0.7, capsize=5, edgecolor="black", hatch="/")
    ax.bar(np.arange(0, 3) + width / 2, c_post_mean, width,
           label="MS post-test", yerr=c_post_std, alpha=0.7, capsize=5, edgecolor="black", hatch=".")
    ax.bar(np.arange(3, 6) - width / 2, t_pre_mean, width,
           label="MM pre-test", yerr=t_pre_std, alpha=0.7, capsize=5, edgecolor="black", hatch="\\")
    ax.bar(np.arange(3, 6) + width / 2, t_post_mean, width,
           label="MM post-test", yerr=t_post_std, alpha=0.7, capsize=5, edgecolor="black", hatch="o")

    # ax.bar(np.arange(0, 3) - width / 2, c_pre_mean, width,
    #        label="SS pre-test", yerr=c_pre_std, alpha=0.7, capsize=5, edgecolor="black", hatch="/")
    # ax.bar(np.arange(0, 3) + width / 2, c_post_mean, width,
    #        label="SS post-test", yerr=c_post_std, alpha=0.7, capsize=5, edgecolor="black", hatch=".")
    # ax.bar(np.arange(3, 6) - width / 2, t_pre_mean, width,
    #        label="SM pre-test", yerr=t_pre_std, alpha=0.7, capsize=5, edgecolor="black", hatch="\\")
    # ax.bar(np.arange(3, 6) + width / 2, t_post_mean, width,
    #        label="SM post-test", yerr=t_post_std, alpha=0.7, capsize=5, edgecolor="black", hatch="o")

    ax.text(0 - 0.3, np.array(c_pre_mean)[0] + 0.05, c_pre_mean[0], fontweight="bold")
    ax.text(1 - 0.3, np.array(c_pre_mean)[1] + 0.05, c_pre_mean[1], fontweight="bold")
    ax.text(2 - 0.3, np.array(c_pre_mean)[2] + 0.05, c_pre_mean[2], fontweight="bold")
    ax.text(0 + 0.1, np.array(c_post_mean)[0] + 0.05, c_post_mean[0], fontweight="bold")
    ax.text(1 + 0.1, np.array(c_post_mean)[1] + 0.05, c_post_mean[1], fontweight="bold")
    ax.text(2 + 0.1, np.array(c_post_mean)[2] + 0.05, c_post_mean[2], fontweight="bold")

    ax.text(3 - 0.3, np.array(t_pre_mean)[0] + 0.05, t_pre_mean[0], fontweight="bold")
    ax.text(4 - 0.3, np.array(t_pre_mean)[1] + 0.05, t_pre_mean[1], fontweight="bold")
    ax.text(5 - 0.3, np.array(t_pre_mean)[2] + 0.05, t_pre_mean[2], fontweight="bold")
    ax.text(3 + 0.1, np.array(t_post_mean)[0] + 0.05, t_post_mean[0], fontweight="bold")
    ax.text(4 + 0.1, np.array(t_post_mean)[1] + 0.05, t_post_mean[1], fontweight="bold")
    ax.text(5 + 0.1, np.array(t_post_mean)[2] + 0.05, t_post_mean[2], fontweight="bold")

    hl = np.max([c_pre_mean[0] + c_pre_std[0],
                 c_pre_mean[1] + c_pre_std[1],
                 c_pre_mean[2] + c_pre_std[2],
                 c_post_mean[0] + c_post_std[0],
                 c_post_mean[1] + c_post_std[1],
                 c_post_mean[2] + c_post_std[2],
                 t_pre_mean[0] + t_pre_std[0],
                 t_pre_mean[1] + t_pre_std[1],
                 t_pre_mean[2] + t_pre_std[2],
                 t_post_mean[0] + t_post_std[0],
                 t_post_mean[1] + t_post_std[1],
                 t_post_mean[2] + t_post_std[2]])

    ax.tick_params(labelsize='xx-large')
    ax.set_ylabel(ylabel, fontsize=20)
    ax.set_ylim(0.0, np.round(1.5 * hl))
    plt.xticks(np.arange(0, 6), ('win1', 'win2', 'win3', 'win1', 'win2', 'win3'))
    plt.setp(ax.get_xticklabels(), rotation='45', fontsize=20)
    plt.yticks(rotation='90')
    ax.legend(loc="best", fontsize="xx-large")

    plt.tight_layout()
    plt.show()
