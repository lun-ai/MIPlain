%%  For comparing run-time performance of MIGO learned strategy and
%%  MIGOc learned strategy.
%%
%%  The efficiency of higher-level game features was taken into account
%%  and run-time performance of both strategies was measured by accumulative
%%  inference steps performed to play 100 games.

:- [playox].
:- [environment].
:- [experiment].

wina_1(A,B):-move(A,B),won(B).
wina_2(A,B):-move(A,B),win_2_1(B).
win_2_1(A):-count_double_mark_line(A,x,2),count_double_mark_line(A,o,0).
wina_3(A,B):-move(A,B),win_3_1(B).
win_3_1(A):-count_double_mark_line(A,x,1),win_3_2(A).
win_3_2(A):-move(A,B),win_3_3(B).
win_3_3(A):-count_double_mark_line(A,x,0),win_3_4(A).
win_3_4(A):-move(A,B),win_2_1(B).

winb_1(A,B):-move(A,B),won(B).
win_1_1_1(A,B):-move(A,B),won(B).
winb_2(A,B):-win_2_1_1(A,B),not(win_2_1_1(B,C)).
win_2_1_1(A,B):-move(A,B),not(winb_1(B,C)).
winb_3(A,B):-win_3_1_1(A,B),not(win_3_1_1(B,C)).
win_3_1_1(A,B):-win_2_1_1(A,B),not(winb_2(B,C)).


get_inference(_,0, [],[],[],[]).
get_inference(a,N, [I1_|Is1], [I2_|Is2], [I3_|Is3],[I|Is]) :-
    board(_,A),
    statistics(inferences,I1),
    wina_3(s(x,_,A),s(o,_,B)),!,
    statistics(inferences,I1_2),
    make_move(minimax,_,B,C,_),
    statistics(inferences,I2),
    wina_2(s(x,_,C),s(o,_,D)),!,
    statistics(inferences,I2_2),
    make_move(minimax,_,D,E,_),
    statistics(inferences,I3),
    wina_1(s(x,_,E),s(o,_,F)),!,
    statistics(inferences,I3_2),
    N1 is N-1,
    I1_ is I1_2-I1,
    I2_ is I2_2-I2,
    I3_ is I3_2-I3,
    I is I1_+I2_+I3_,
    get_inference(a,N1,Is1,Is2,Is3,Is).
get_inference(b, N, [I1_|Is1], [I2_|Is2], [I3_|Is3],[I|Is]) :-
    board(_,A),
    statistics(inferences,I1),
    winb_3(s(x,_,A),s(o,_,B)),!,
    statistics(inferences,I1_2),
    make_move(minimax,_,B,C,_),
    statistics(inferences,I2),
    winb_2(s(x,_,C),s(o,_,D)),!,
    statistics(inferences,I2_2),
    make_move(minimax,_,D,E,_),
    statistics(inferences,I3),
    winb_1(s(x,_,E),s(o,_,F)),!,
    statistics(inferences,I3_2),
    N1 is N-1,
    I1_ is I1_2-I1,
    I2_ is I2_2-I2,
    I3_ is I3_2-I3,
    I is I1_+I2_+I3_,
    get_inference(b,N1,Is1,Is2,Is3,Is).

get_rule_inference(a,N) :-
    open('./output/rule_inference_a.txt',append,Out),
    get_inference(a,N,Is1,Is2,Is3,_),!,
    reverse(Is1,Is1_r),
    reverse(Is2,Is2_r),
    reverse(Is3,Is3_r),
    writeln(Out,Is1_r),
    writeln(Out,Is2_r),
    writeln(Out,Is3_r),
    close(Out).

get_rule_inference(b,N) :-
    open('./output/rule_inference_b.txt',append,Out),
    get_inference(b,N,Is1,Is2,Is3,_),!,
    reverse(Is1,Is1_r),
    reverse(Is2,Is2_r),
    reverse(Is3,Is3_r),
    writeln(Out,Is1_r),
    writeln(Out,Is2_r),
    writeln(Out,Is3_r),
    close(Out).

get_strategy_inference(M,N) :-
    open('./output/inference.txt',append,Out),
    get_inference(M,N,_,_,_,Is),!,
    reverse(Is,Is_r),
    writeln(Out,Is_r),
    close(Out).



