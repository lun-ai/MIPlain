
:- ['./MIGO/migo'].
:- ['../util'].
:- [accessible_boards_1move].
:- [environment].
:- [menace].
:- [minimaxoutput].
:- [playox].
:- [training_games_pos_only].

:- dynamic(counter/1).

%% ---------- LEARNING TASK ----------

%% generate random initial boards from the set of 1-move ahead positions
board(_,B):-
    all_accessible_boards(Bs),
    random_member(B,Bs).


learn_from_play :- false.

mark(learner,x).
mark(opponent,o).
depth_game(5).

ref_counter(mixed,0).
ref_counter(separated,10).

initialisation(L) :-
    set_rand,
    ref_counter(L,C1),
    asserta(ref_counter(C1)),
    asserta(counter(0)),
    asserta(learning(L)).

% N number of iterations
% Learning type: mixed or separated
% SwIni, SdIni winning and drawing strategies if transfer learning
test(SwIni, SdIni,N,L):-
    initialisation(L),
    write('START'),nl,
    T1 is cputime,
    format('cpu time: ~w\n',[T1]),
    (learn_from_play
        ->
            (get_example(0,[],[],B,O1,1),
            regret(B,O1,R),
            format('regret: ~w \n',[R]))
        ;
            (get_example(0,[],[],1))),
    dependent_learning(Sw,Sd),!,
    pprint(Sw),
    pprint(Sd),nl,
    prog_equivalent([],Sw,E),
    merge(SwIni,Sw,SwIni2),
    merge(SdIni,Sd,SdIni2),
    T2 is cputime,
    format('cpu time: ~w\n',[T2]),
    test(1,N,SwIni2,SdIni2,Sw,Sd,SwF,SdF,E),
    write('Sw = '), pprint(SwF), nl,
    write('Sd = '), pprint(SdF), nl,
    write('end').

test(N,N,_,_,Sw,Sd,Sw,Sd,_).
test(I,N,SwIni,SdIni,Sw,Sd,SwF,SdF,E):-
    (learn_from_play
        ->
            (get_example(I,Sw,Sd,B,O1,E),
            regret(B,O1,R),
            format('regret: ~w \n',[R]))
        ;
            (get_example(I,Sw,Sd,E))),
    dependent_learning(Sw2,Sd2),!,
    pprint(Sw2),
    pprint(Sd2),nl,
    merge(SwIni,Sw2,SwIni2),
    merge(SdIni,Sd2,SdIni2),
    prog_equivalent(Sw,Sw2,E1),
    update_counter(E1,Sw2),
    T1 is cputime,
    format('cpu time: ~w\n',[T1]),
    I1 is I+1,
    test(I1,N,SwIni2,SdIni2,Sw2,Sd2,SwF,SdF,E1).
