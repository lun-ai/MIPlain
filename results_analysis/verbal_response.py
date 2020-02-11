import os
import numpy as np
from results_analysis.utils import read_nth_line, strip_arr_text
from scipy import stats

DATA_DIR = "../records"

# {id: [pre-score, pose-score], ...}
records = [{}, {}]
verbal_res = [{}, {}]
part4_records = [{}, {}]


def load_records(dirs):
    '''

    Even participant id is control group
    Odd participant id is treatment group

    :param dirs:
    :return:
    '''
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

            file = open(ffptr, "r")
            id = int(read_nth_line(file, 1).strip("\n"))
            records[id % 2][id] = [strip_arr_text("scores", read_nth_line(file, 22)),
                                   strip_arr_text("scores", read_nth_line(file, 65))]
            depths = []
            for i in range(70, 76):
                depths.append(4 - int(len(list(filter(lambda x: x == '1' or x == '2',
                                                  read_nth_line(file, i).replace('[', '').replace(']', '').strip(
                                                      '\n').split(',')))) / 4))
            for i in range(76, 84):
                if read_nth_line(file, i).split(':')[0] == "scores":
                    part4_records[id%2][id] = strip_arr_text("scores", read_nth_line(file, i))
            verbal_res[id % 2][id] = depths


def check_sanity_of_post_test_answers(f):
    file = open(f, "r")
    lines = file.readlines()
    # result => bad [d1, d2, d3], good [d1, d2, d3]
    pre = [[[], [], []], [[], [], []]]
    result = [[[], [], []], [[], [], []]]
    for l in range(0, len(lines)):
        id, res_type = read_nth_line(file, l + 1).split('-')
        id = int(id)
        res_depth = verbal_res[int(id) % 2][id]
        res_type = list(map(int, res_type.split(',')))
        verbal_of_depth_good = [0, 0, 0]

        for p in range(0, len(res_type)):
            # res_type[p] == 1 good verbal response, else bad
            m = res_depth[p]
            if res_type[p] == 1 and verbal_of_depth_good[m - 1] == 0:
                verbal_of_depth_good[m - 1] = 1
                begin = (m - 1) * 5
                end = (m * 5)
                ans_pre = records[int(id) % 2][id][0][begin:end]
                ans_post = records[int(id) % 2][id][1][begin:end]
                pre_avg = np.average(list(map(lambda x: x == 10, ans_pre)))
                post_avg = np.average(list(map(lambda x: x == 10, ans_post)))
                pre[res_type[p]][m - 1].append(pre_avg)
                result[res_type[p]][m - 1].append(post_avg)

        for p in range(0, len(res_type)):
            m = res_depth[p]
            # res_type[p] == 1 good verbal response, else bad
            if res_type[p] == 0 and verbal_of_depth_good[m - 1] == 0:
                begin = (m - 1) * 5
                end = (m * 5)
                ans_pre = records[int(id) % 2][id][0][begin:end]
                ans_post = records[int(id) % 2][id][1][begin:end]
                pre_avg = np.average(list(map(lambda x: x == 10, ans_pre)))
                post_avg = np.average(list(map(lambda x: x == 10, ans_post)))
                pre[res_type[p]][m - 1].append(pre_avg)
                result[res_type[p]][m - 1].append(post_avg)

    print(result)
    print(
        "Good vs. bad response pre test performance \n(1) %f+\\-%f : %f+\\-%f \n(2) %f+\\-%f : %f+\\-%f \n(3) %f+\\-%f : %f+\\-%f" % (
            np.average(pre[1][0]), np.std(pre[1][0]),
            np.average(pre[0][0]), np.std(pre[0][0]),
            np.average(pre[1][1]), np.std(pre[1][1]),
            np.average(pre[0][1]), np.std(pre[0][1]),
            np.average(pre[1][2]), np.std(pre[1][2]),
            np.average(pre[0][2]), np.std(pre[0][2])))
    print(
        "Good vs. bad response post test performance \n(1) %f+\\-%f : %f+\\-%f \n(2) %f+\\-%f : %f+\\-%f \n(3) %f+\\-%f : %f+\\-%f" % (
            np.average(result[1][0]), np.std(result[1][0]),
            np.average(result[0][0]), np.std(result[0][0]),
            np.average(result[1][1]), np.std(result[1][1]),
            np.average(result[0][1]), np.std(result[0][1]),
            np.average(result[1][2]), np.std(result[1][2]),
            np.average(result[0][2]), np.std(result[0][2])))
    return result

def part4_question_type_converter(i):
    if i == 0:
        return 0, 0
    if i == 1:
        return 0, 1
    if i == 2:
        return 1, 0
    else:
        return 1, 1

def check_sanity_of_part4_selected_answers(f):
    file = open(f, "r")
    lines = file.readlines()
    # result => bad [d1, d2, d3], good [d1, d2, d3]
    pre = [[[], [], []], [[], [], []]]
    result = [[[], [], []], [[], [], []]]

    for l in range(0, len(lines)):
        id, res_type = read_nth_line(file, l + 1).split('-')
        id = int(id)
        res_depth = verbal_res[int(id) % 2][id]
        print(id)
        print(res_depth)
        res_type = list(map(int, res_type.split(',')))
        part4_type = part4_records[int(id) % 2][id]

        for p in range(0, len(res_type)):
            # res_type[p] == 1 good verbal response, else bad
            m = res_depth[p]
            ip, ir = part4_question_type_converter(part4_type[p])
            pre[res_type[p]][m - 1].append(ip)
            result[res_type[p]][m - 1].append(ir)
    print(pre)
    print(result)
    print(
        "Good vs. bad response pre test performance \n(1) %f+\\-%f : %f+\\-%f \n(2) %f+\\-%f : %f+\\-%f \n(3) %f+\\-%f : %f+\\-%f" % (
            np.average(pre[1][0]), np.std(pre[1][0]),
            np.average(pre[0][0]), np.std(pre[0][0]),
            np.average(pre[1][1]), np.std(pre[1][1]),
            np.average(pre[0][1]), np.std(pre[0][1]),
            np.average(pre[1][2]), np.std(pre[1][2]),
            np.average(pre[0][2]), np.std(pre[0][2])))
    print(
        "Good vs. bad response post test performance \n(1) %f+\\-%f : %f+\\-%f \n(2) %f+\\-%f : %f+\\-%f \n(3) %f+\\-%f : %f+\\-%f" % (
            np.average(result[1][0]), np.std(result[1][0]),
            np.average(result[0][0]), np.std(result[0][0]),
            np.average(result[1][1]), np.std(result[1][1]),
            np.average(result[0][1]), np.std(result[0][1]),
            np.average(result[1][2]), np.std(result[1][2]),
            np.average(result[0][2]), np.std(result[0][2])))
    print(stats.ttest_ind(result[1][1], result[0][1]))
    return result


load_records([DATA_DIR + "/island3/records_10_12/"])
# check_sanity_of_post_test_answers(DATA_DIR + "/island3/records_10_12/verbal_res_info/verbal_response_quality_treatment.txt")
check_sanity_of_part4_selected_answers(DATA_DIR + "/island3/records_10_12/verbal_res_info/verbal_response_quality_treatment.txt")
check_sanity_of_part4_selected_answers(DATA_DIR + "/island3/records_10_12/verbal_res_info/verbal_response_quality_control.txt")
