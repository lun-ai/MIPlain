:- user:use_module(library(lists)).
:- use_module(library(lists)).
:- use_module(library(random)).
:- use_module(library(system)).

:- ['./MIGO/metagol'].
:- ['./MIGO/assign_labels'].
:- ['./MIGO/background'].
:- ['./MIGO/dependent_learning'].
:- ['./MIGO/execute_strategy'].
:- ['./util'].
:- [playox].


%% ---------- METARULES ----------

metarule([P,R,Q],([P,A,B]:-[[R,A,B],[Q,B]])).
metarule([P,R,Q],([P,A]:-[[R,A],[Q,A]])).
metarule([P,R,Q],([P,A]:-[[R,A,B],[Q,B]])).

%% ---------- METAGOL SETTINGS ----------

%% additional features
prim(zero_strong_of_X/1).
prim(one_strong_of_X/1).
prim(two_strong_of_X/1).
prim(zero_strong_of_O/1).
prim(one_strong_of_O/1).
prim(two_strong_of_O/1).

prim(move/2).
prim(won/1).

% Perform sequential learning
% uses a minimum set of examples to learn optimal strategy of winning for noughts and crosses

a :-
    T1 =
        [
            win_1(s(x,_,b(e,e,x,e,x,o,o,o,x)), s(o,_,b(x,e,x,e,x,o,o,o,x))),

            win_1(s(x,_,b(x,o,x,e,o,e,o,e,x)), s(o,_,b(x,o,x,e,o,x,o,e,x))),
            win_1(s(x,_,b(e,e,x,o,x,x,o,o,e)), s(o,_,b(e,e,x,o,x,x,o,o,x))),

            win_1(s(x,_,b(x,e,x,o,o,e,x,e,o)), s(o,_,b(x,x,x,o,o,e,x,e,o))),
            win_1(s(x,_,b(o,e,e,x,x,o,x,e,o)), s(o,_,b(o,e,x,x,x,o,x,e,o)))
        ]/[
            win_1(s(x,_,b(x,e,x,o,o,e,x,e,o)), s(o,_,b(x,e,x,o,o,e,x,x,o)))
        ],
    T2 =
        [
            win_2(s(x,_,b(e,e,x,e,x,e,o,o,e)),s(o,_,b(e,e,x,e,x,e,o,o,x))),

            win_2(s(x,_,b(x,e,e,e,o,e,o,e,x)),s(o,_,b(x,e,x,e,o,e,o,e,x))),
            win_2(s(x,_,b(e,e,e,o,x,x,e,o,e)),s(o,_,b(e,e,x,o,x,x,e,o,e))),

            win_2(s(x,_,b(x,e,e,o,e,e,x,e,o)),s(o,_,b(x,e,x,o,e,e,x,e,o))),
            win_2(s(x,_,b(o,e,e,x,e,e,x,e,o)),s(o,_,b(o,e,e,x,x,e,x,e,o)))
        ]/[
            win_2(s(x,_,b(e,e,e,o,e,e,x,x,o)),s(o,_,b(e,e,e,o,e,x,x,x,o))),
            win_2(s(x,_,b(e,e,x,o,x,e,o,e,e)),s(o,_,b(e,e,x,o,x,e,o,e,x)))
        ],
    T3 =
        [
            win_3(s(x,_,b(e,e,x,e,e,e,e,o,e)),s(o,_,b(e,e,x,e,x,e,e,o,e))),

            win_3(s(x,_,b(e,e,e,e,e,e,o,e,x)),s(o,_,b(x,e,e,e,e,e,o,e,x))),
            win_3(s(x,_,b(e,e,e,e,e,x,e,o,e)),s(o,_,b(e,e,e,e,x,x,e,o,e))),

            win_3(s(x,_,b(e,e,e,e,e,e,x,e,o)),s(o,_,b(x,e,e,e,e,e,x,e,o))),
            win_3(s(x,_,b(e,e,e,x,e,e,e,e,o)),s(o,_,b(e,e,e,x,e,e,x,e,o)))
        ]/[
            win_3(s(x,_,b(e,e,x,e,e,e,o,e,e)),s(o,_,b(e,e,x,e,e,e,o,x,e))),
            win_3(s(x,_,b(e,e,e,x,e,e,e,e,o)),s(o,_,b(e,e,e,x,x,e,e,e,o)))
        ],
    learn_task(T1,P1),
    Time1 is cputime,
    format('\ncpu: ~w\n', [Time1]),
    pprint(P1),
    format('~w', [P1]),
    learn_task(T2,P2),
    Time2 is cputime,
    format('\ncpu: ~w\n', [Time2]),
    pprint(P2),
    format('~w', [P2]),
    learn_task(T3,P3),
    Time3 is cputime,
    format('\ncpu: ~w\n', [Time3]),
    pprint(P3),
    format('~w', [P3]).
