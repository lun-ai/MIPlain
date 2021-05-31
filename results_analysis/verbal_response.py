import os
import numpy as np
from results_analysis.utils import read_nth_line, strip_arr_text
from results_analysis.find_wrong_literal import check_win_2, check_win_3
from scipy import stats

DATA_DIR = "../records"

# {id: [pre-score, pose-score], ...}
records = [{}, {}]
verbal_res = [{}, {}]
part4_records = [{}, {}]
answers = {}


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
            answers[id] = []
            for i in range(70, 76):
                depths.append(4 - int(len(list(filter(lambda x: x == '1' or x == '2',
                                                  read_nth_line(file, i).replace('[', '').replace(']', '').strip(
                                                      '\n').split(',')))) / 4))
                answers[id].append(list(map(int, read_nth_line(file, i).replace('[', '').replace(']', '').strip(
                                                      '\n').split(',')[-9:])))
            for i in range(76, 84):
                if read_nth_line(file, i).split(':')[0] == "scores":
                    part4_records[id%2][id] = strip_arr_text("scores", read_nth_line(file, i))
            verbal_res[id % 2][id] = depths


def check_quality_eval_consistency(path1, path2):
    file1 = open(path1, "r")
    file2 = open(path2, "r")
    lines1 = file1.readlines()
    lines2 = file2.readlines()

    # result => bad [d1, d2, d3], good [d1, d2, d3]
    file1_results = {}
    file2_results = {}

    assert len(lines1) == len(lines2)

    for l in range(0, len(lines1)):
        id1, res_type1 = read_nth_line(file1, l + 1).split('-')
        id2, res_type2 = read_nth_line(file2, l + 1).split('-')
        file1_results[id1] = res_type1
        file2_results[id2] = res_type2

    print("path 1 %s - path 2 %s mismatches" % (path1, path2))
    for key in file1_results.keys():
        if file2_results[key] != file1_results[key]:
            print("%s - %s / %s" % (key, file1_results[key], file2_results[key]))


# Compare the performance difference between pre and post test and sort by response quality
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
            # res_type[p] > 2 good verbal response, else bad
            m = res_depth[p]
            if res_type[p] > 2 and verbal_of_depth_good[m - 1] == 0:
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
            # res_type[p] <= 2 good verbal response, else bad
            if res_type[p] <= 2 and verbal_of_depth_good[m - 1] == 0:
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
    coverage_result = [[], [], [], [], []]

    for l in range(0, len(lines)):
        id, res_type = read_nth_line(file, l + 1).split('-')
        id = int(id)
        res_depth = verbal_res[int(id) % 2][id]
        print(id)
        print(res_depth)
        res_type_raw = list(map(int, res_type.split(',')))
        res_type = list(map(lambda x: int(int(x) >= 3), res_type.split(',')))
        print(res_type)
        part4_type = part4_records[int(id) % 2][id]

        for p in range(0, len(res_type)):
            # res_type[p] >= 3 good verbal response, else bad
            m = res_depth[p]
            ip, ir = part4_question_type_converter(part4_type[p])
            pre[res_type[p]][m - 1].append(ip)
            result[res_type[p]][m - 1].append(ir)

            if m == 3:
                print("Idx: %d - Depth: %d - Lv: %d - Correctness: %d" % (p + 1, m, res_type_raw[p], ir))
                coverage_result[res_type_raw[p]].append(ir)

    print("Pre: " + str(pre))
    print("Post: " + str(result))
    for i in coverage_result:
        print("Coverage: %d - %f" % (len(i), np.average(i)))


    print(
        "Good vs. bad response pre test performance \n(1) [%d] %f+\\-%f : [%d] %f+\\-%f \n(2) [%d] %f+\\-%f : [%d] %f+\\-%f \n(3) [%d] %f+\\-%f : [%d] %f+\\-%f" % (
            len(pre[1][0]), np.average(pre[1][0]), np.std(pre[1][0]),
            len(pre[0][0]), np.average(pre[0][0]), np.std(pre[0][0]),
            len(pre[1][1]), np.average(pre[1][1]), np.std(pre[1][1]),
            len(pre[0][1]), np.average(pre[0][1]), np.std(pre[0][1]),
            len(pre[1][2]), np.average(pre[1][2]), np.std(pre[1][2]),
            len(pre[0][2]), np.average(pre[0][2]), np.std(pre[0][2])))
    print(
        "Good vs. bad response post test performance \n(1) [%d] %f+\\-%f : [%d] %f+\\-%f \n(2) [%d] %f+\\-%f : [%d] %f+\\-%f \n(3) [%d] %f+\\-%f : [%d] %f+\\-%f" % (
            len(result[1][0]), np.average(result[1][0]), np.std(result[1][0]),
            len(result[0][0]), np.average(result[0][0]), np.std(result[0][0]),
            len(result[1][1]), np.average(result[1][1]), np.std(result[1][1]),
            len(result[0][1]), np.average(result[0][1]), np.std(result[0][1]),
            len(result[1][2]), np.average(result[1][2]), np.std(result[1][2]),
            len(result[0][2]), np.average(result[0][2]), np.std(result[0][2])))
    print(stats.ttest_ind(result[1][1], result[0][1]))
    return result


def check_missing_predicates(f):
    file = open(f, "r")
    lines = file.readlines()

    mistakes_depth2 = {'all failed': lambda x: x == 0,
                       'first primitive failed': lambda x: x == 1,
                       'second primitive failed': lambda x: x == 1, 'success': lambda x: x >= 2}
    mistakes_depth3 = {'all failed': lambda x: x == 0,
                       'second primitive failed': lambda x: x == 1, 'success': lambda x: x >= 2}
    correct_map_depth2 = {'all failed': 0,
                       'first primitive failed': 0,
                       'second primitive failed': 0, 'success': 0}
    correct_map_depth3 = {'all failed': 0,
                       'second primitive failed': 0, 'success': 0}

    for l in range(0, len(lines)):
        id, res_type = read_nth_line(file, l + 1).split('-')
        id = int(id)
        res_depth = verbal_res[int(id) % 2][id]
        res_type = list(map(int, res_type.split(',')))

        print(id)

        for p in range(0, len(res_type)):
            m = res_depth[p]

            if(m == 2):
                failure = check_win_2(answers[id][p])
                if mistakes_depth2[failure](res_type[p]):
                    correct_map_depth2[failure] += 1
            elif(m == 3):
                failure = check_win_3(answers[id][p])
                print(failure)
                print(answers[id][p])
                if mistakes_depth3[failure](res_type[p]):
                    correct_map_depth3[failure] += 1
    print("Depth 2")
    print(correct_map_depth2)
    print("Depth 3")
    print(correct_map_depth3)




# Bamberg cognitive course, load records first
# load_records([DATA_DIR + "/island3/records_10_12/"])
# check_sanity_of_post_test_answers(DATA_DIR + "/island3/records_10_12/verbal_res_info_final/verbal_response_quality_treatment.txt")
# check_sanity_of_part4_selected_answers(DATA_DIR + "/island3/records_10_12/verbal_res_info_final/verbal_response_quality_control.txt")
# check_sanity_of_part4_selected_answers(DATA_DIR + "/island3/records_10_12/verbal_res_info_final/verbal_response_quality_treatment.txt")
# check_missing_predicates(DATA_DIR + "/island3/records_10_12/verbal_res_info_final/verbal_response_quality_control.txt")
# check_missing_predicates(DATA_DIR + "/island3/records_10_12/verbal_res_info_final/verbal_response_quality_treatment.txt")

# check_quality_eval_consistency(DATA_DIR + "/island3/records_10_12/verbal_res_info_final/verbal_response_quality_treatment.txt",
#                                DATA_DIR + "/island3/records_10_12/verbal_res_info_celine/verbal_response_quality_treatment.txt")
# check_quality_eval_consistency(DATA_DIR + "/island3/records_10_12/verbal_res_info_final/verbal_response_quality_control.txt",
#                                DATA_DIR + "/island3/records_10_12/verbal_res_info_celine/verbal_response_quality_control.txt")




# Amazon Mechanical Turk, load records first
load_records([DATA_DIR + "/island2/"])
# check_sanity_of_part4_selected_answers(DATA_DIR + "/island2/verbal_res_info_final/verbal_response_quality_treatment.txt")
# check_sanity_of_part4_selected_answers(DATA_DIR + "/island2/verbal_res_info_final/verbal_response_quality_control.txt")
check_missing_predicates(DATA_DIR + "/island2/verbal_res_info_final/verbal_response_quality_control.txt")
check_missing_predicates(DATA_DIR + "/island2/verbal_res_info_final/verbal_response_quality_treatment.txt")
# check_quality_eval_consistency(DATA_DIR + "/island2/verbal_res_info_final/verbal_response_quality_treatment.txt",
#                                DATA_DIR + "/island2/verbal_res_info_celine/verbal_response_quality_treatment.txt")
# check_quality_eval_consistency(DATA_DIR + "/island2/verbal_res_info_final/verbal_response_quality_control.txt",
#                                DATA_DIR + "/island2/verbal_res_info_celine/verbal_response_quality_control.txt")
