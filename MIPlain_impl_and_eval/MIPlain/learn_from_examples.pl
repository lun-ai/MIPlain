:- user:use_module(library(lists)).
:- use_module(library(lists)).
:- use_module(library(random)).
:- use_module(library(system)).

:- ['./MIGO/METAOPT/metaopt'].
:- ['./MIGO/METAOPT/tree-costs'].
:- ['./MIGO/assign_labels'].
:- ['./MIGO/background'].
:- ['./episode_learning'].
:- ['./MIGO/execute_strategy'].
:- [util].
:- [environment].
:- [playox].

:- dynamic backtrack/6, episode/4.

depth_game(5).
max_time(60).
mark(learner,x).
mark(opponent,o).

episode(win_1,
        [
            win_1(s(x,_,b(e,e,o,o,x,x,o,e,x)),s(o,_,b(x,e,o,o,x,x,o,e,x))),
            win_1(s(x,_,b(x,o,x,e,o,e,o,e,x)),s(o,_,b(x,o,x,e,o,x,o,e,x))),
            win_1(s(x,_,b(x,o,o,o,x,e,x,e,e)),s(o,_,b(x,o,o,o,x,e,x,e,x)))
        ],
        [
            win_1(s(x,_,b(e,e,o,o,x,x,o,e,x)),s(o,_,b(e,x,o,o,x,x,o,e,x))),
            win_1(s(x,_,b(x,o,x,e,o,e,o,e,x)),s(o,_,b(x,o,x,e,o,e,o,x,x))),
            win_1(s(x,_,b(x,o,o,o,x,e,x,e,e)),s(o,_,b(x,o,o,o,x,x,x,e,e)))
        ],_).

episode(win_2,
        [
            win_2(s(x,_,b(e,e,e,o,x,x,e,o,e)),s(o,_,b(e,e,x,o,x,x,e,o,e))),
            win_2(s(x,_,b(x,e,e,o,e,e,x,e,o)),s(o,_,b(x,e,x,o,e,e,x,e,o))),
            win_2(s(x,_,b(o,e,e,x,e,e,x,e,o)),s(o,_,b(o,e,e,x,x,e,x,e,o)))
        ],
        [
            win_2(s(x,_,b(e,e,e,o,x,x,e,o,e)),s(o,_,b(e,e,e,o,x,x,x,o,e))),
            win_2(s(x,_,b(x,e,e,o,e,e,x,e,o)),s(o,_,b(x,e,e,o,x,e,x,e,o))),
            win_2(s(x,_,b(x,e,e,e,o,e,e,o,x)),s(o,_,b(x,e,x,e,o,e,e,o,x)))
        ],_).

episode(win_3,
        [
            win_3(s(x,_,b(e,x,e,e,e,e,e,e,o)),s(o,_,b(e,x,x,e,e,e,e,e,o))),
            win_3(s(x,_,b(e,o,e,e,e,e,e,e,x)),s(o,_,b(e,o,e,e,e,e,x,e,x))),
            win_3(s(x,_,b(e,e,e,e,e,e,o,e,x)),s(o,_,b(x,e,e,e,e,e,o,e,x)))
        ],
        [
            win_3(s(x,_,b(e,x,e,e,e,e,e,e,o)),s(o,_,b(e,x,e,e,x,e,e,e,o))),
            win_3(s(x,_,b(e,o,e,e,e,e,e,e,x)),s(o,_,b(e,o,e,x,e,e,e,e,x))),
            win_3(s(x,_,b(e,e,e,e,e,e,o,e,x)),s(o,_,b(e,e,e,e,x,e,o,e,x)))
        ],_).

%% ---------- METARULES ----------

metarule([P,Q,R],([P,A,B]:-[[Q,A,B],[R,B]])).
metarule([P,Q,B,C,R],([P,A]:-[[Q,A,B,C],[R,A]])).
metarule([P,Q,R],([P,A]:-[[Q,A,B],[R,B]])).
metarule([P,Q,B,D,R,C,E],([P,A]:-[[Q,A,B,D],[R,A,C,E]])).


%% ---------- METAGOL SETTINGS ----------

%%  additional feature primitives
prim(number_of_pairs/3).

%%  move & win classifiers
prim(move/2).
prim(won/1).

%% produces the target program
%% based on the examples in episodes
learn_from_examples :-
    episode_learning([],[]).