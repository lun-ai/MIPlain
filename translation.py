import re


class TEMPLATE:
    def __init__(self, func, arity):
        self.func = func
        self.arity = arity

    def translate(self, args):
        return self.func(*args)


class VAR:
    def __init__(self, name):
        self.name = name

    def translate(self):
        return self.name


''' A collection of templates used for translation '''
dict = {
    'predicate': TEMPLATE(lambda x: x, 1),
    'predicate_neg': TEMPLATE(lambda x: 'such that no ' + x, 1),
    'metarule_neg': TEMPLATE(lambda x, y: x + ' and such that no ' + y, 2),
    'metarule_chain': TEMPLATE(lambda x, y: x + ' and ' + y, 2),
    'metarule_neg_chain': TEMPLATE(lambda x, y: x + ' and such that no ' + y, 2),
    'metarule_double_neg': TEMPLATE(lambda x, y: 'for ' + x + ', ' + y, 2),
    'metarule_double_neg_3': TEMPLATE(lambda x, y, z: 'for ' + x + ', ' + y + ' or ' + z, 3),

    'won': TEMPLATE(lambda x: x + ' has one three-pieces line', 1),
    'move': TEMPLATE(lambda x, y: 'move ' + y + ' from ' + x, 2),
    'win_1': TEMPLATE(lambda x, y: y + ' is won in one move from ' + x, 2),
    'win_2': TEMPLATE(lambda x, y: y + ' is won in two moves from ' + x, 2),

    'A': VAR('A (Initial)'),
    'B': VAR('B'),
    'C': VAR('C (opponent\'s)'),
    'D': VAR('D')
}


def parse(str):
    return list(filter(lambda x: x != '', re.split(r'\,|\s|\(|\)|\\\+|\.', str)))


def translate_predicate(str, template):

    """
        Translating single predicate using a template
    """

    parsed = parse(str)
    parsed = [dict[substr] for substr in parsed]
    str_values = []

    for i in range(len(parsed)):
        if not isinstance(parsed[i], TEMPLATE):
            str_values.append(parsed[i].translate())
        else:
            str_values.append('')

    return dict[template].translate([parsed[0].translate(str_values[1: parsed[0].arity + 1])])


def translate_predicates(str, template):

    """
        Translation two predicates using a template
    """

    translation = []
    str_values = []
    parsed = parse(str)
    parsed = [dict[substr] for substr in parsed]

    for i in range(len(parsed)):
        if not isinstance(parsed[i], TEMPLATE):
            str_values.append(parsed[i].translate())
        else:
            str_values.append('')

    for i in range(len(str_values)):
        if isinstance(parsed[i], TEMPLATE):
            translation.append(parsed[i].translate(str_values[i + 1: i + parsed[i].arity + 1]))

    return dict[template].translate(translation)


def translate_multi(str1, str2, template):
    return dict[template].translate((str1, str2))


print('There is ' +
      translate_predicates('move(A,B), won(B)', 'metarule_chain'))
print('There is ' +
      translate_multi(
          translate_predicates('move(A,B), \+(win_1(B,C))', 'metarule_neg_chain'),
          translate_predicates('\+(move(B,C), \+(win_1(C,D)))', 'metarule_double_neg'),
          'metarule_chain')
      )

print('There is ' +
      translate_multi(
          translate_multi(
              translate_predicates('move(A,B), \+(win_1(B,C))', 'metarule_neg_chain'),
              translate_predicate('\+(win_2(B,C))', 'predicate_neg'),
              'metarule_chain'),
          translate_predicates('\+(move(B,C), \+(win_1(C,D)), \+(win_2(C,D)))', 'metarule_double_neg_3'),
          'metarule_chain')
      )

# print(translate('win_1_1_1(A,B), won(B).'))
# print(translate('win_1(A,B) :- move(A,B), won(B).'))
# print(translate('win_2(A,B) :- move(A,B), \+(win_1(B,C)), \+((move(B,C), \+(win_1(C,D)))).'))
