%%  MIPlain backtracks on lost / drawn games to generate negative examples
%%  for avoiding hypothesis over-generalization.
%%
%%  MIPlain uses a set of winnable 2-ply board positions for gameplay
%%  and backtracks each lost /  drawn game for replaying later
%%  Each replay generates at least one depth 1, depth i negative example
%%  or positive examples.


:- [learning].
:- [accessible_boards_1move].
:- [environment].
:- [minimaxoutput].
:- [playox].

:- dynamic(counter/1).
:- dynamic(backtrack/6).
:- dynamic(replay_regret/1).


%% generate random initial boards from the set of 1-move ahead positions
board(_,B):-
    set_random(seed(random)),
    all_accessible_boards(Bs),
    random_member(B,Bs).

max_time(60).
mark(learner,x).
mark(opponent,o).
depth_game(5).
replay_regret(0).

ref_counter(mixed,0).
ref_counter(separated,10).

initialisation(SwIni, SdIni, L) :-
    assert_program(SwIni),
    assert_program(SdIni),
    ref_counter(L,C1),
    asserta(ref_counter(C1)),
    asserta(counter(0)),
    asserta(learning(L)).

replay(O1,CurrentDepth,Game,O2) :-
    backtrack(K,I_,M_,G_,D1,D2),
    board(B),
    playing(P),
    player_mark(P,M),
    ((P is 1)
        ->
            %% branch on the backtrack point
            (append(_,[B],G_)
                ->
                    %% More efficient branching
                    make_move(branch,K,M,B,B1,I_)
                ;
                    make_move(learned_strategy,M,B,B1,V))
        ;
            make_move(minimax,M,B,B1,V)),
    board(B1),!,
    player_mark(P,M),
    next_player(P,P1),
    player_mark(P1,M1),
    replay_aux(O1,M,B,M1,B1,CurrentDepth,Game,O2),!,
    (V = default,mark(learner,M)
        ->
            backtrack(K,I_,M_,G_,D1,D3),
            retract(backtrack(K,I_,M_,G_,D1,D3)),
            NewDepth is D2 + 1,
            asserta(backtrack(K,I_,M_,G_,D1,NewDepth))
        ;
            true).

replay_aux(_,M,B,M1,B1,0,Game,O) :-
    won(s(M1,_,B1)),
    append([B1],[],Game),
    player_mark(P,M),
    write('Replay Player '), write(P), nl,
    get_outcome(win,P,O),
    (mark(opponent,M)
        ->
            set_replay_regret(2),
            backtrack(K,I_,M_,G_,D1,D2),
            (D2 = 0
                ->
                    retract(backtrack(K,I_,M_,G_,D1,D2)),
                    asserta(backtrack(K,I_,M_,G_,D1,1))
                ;true)
        ;
            set_replay_regret(0),
            true),!.
replay_aux(_,M,B,M1,B1,0,Game,O) :-
    drawn(s(M1,_,B1)),
    append([B1],[],Game),
    player_mark(P,M),
    write('Replay Drawn '),nl,
    get_outcome(draw,P,O),
    backtrack(K,I_,M_,G_,D1,D2),
    set_replay_regret(1),
    (D2 = 0
        ->
            retract(backtrack(K,I_,M_,G_,D1,D2)),
            asserta(backtrack(K,I_,M_,G_,D1,1))
        ;true),!.
replay_aux(O1,M,B,M1,B1,Depth,[B1|Game],O2) :-
    mark(learner,M),
    next_player,
    replay(O1,NewDepth,Game,O2),!,
    Depth is NewDepth + 1,
    %% learner does not win
    (M \= O2,backtrack(_,_,_,_,_,D2),!,Depth is D2
        ->
            tasks(Wd_,_),
            Wd is Wd_ - 1,
            update_ex_all_neg(s(M,_,B),s(M1,_,B1),win,Wd);true),!.
replay_aux(O1,M,B,M1,B1,Depth,[B1|Game],O2) :-
    mark(opponent,M),
    next_player,
    replay(O1,Depth,Game,O2),!.


set_replay_regret(N) :-
    retract(replay_regret(_)),
    asserta(replay_regret(N)).


%% game can be reused
game_backtrack(OutcomeBefore,I,FullGame,Outcome) :-
    reset,
    findall(backtrack(A,B,C,D,E,F), backtrack(A,B,C,D,E,F), Bs), format('Backtrack points: ~w\n',[Bs]),
    backtrack(K,I,OutcomeBefore,Game,D1,_),
    write('*** Replay ***\n'),
    %% B is the backtrack point
    append(_,[B],Game),
    initialisation_game(B),!,
    replay(OutcomeBefore,_,Game1,Outcome),!,
    write('*** Replay Done ***\n'),
    append(Game,Game1,FullGame),
    backtrack(K,I,OutcomeBefore,Game,D1,D2),
    retract(backtrack(K,I,OutcomeBefore,Game,D1,D2)),!,
    (\+ mark(learner,Outcome),D1 > D2
        ->
            asserta(backtrack(K,I,OutcomeBefore,Game,D1,D2))
        ;
            true).

get_example_backtrack(K,Sw,Sd,B,O) :-
    \+ backtrack(_,_,_,_,_,_),
    get_example(K,Sw,Sd,B,O,_),!,
    regret(B,O,R),
    set_replay_regret(R).
get_example_backtrack(K,Sw,Sd,B,O) :-
    assert_program(Sw),assert_win,
    assert_program(Sd),assert_draw,
    mark(learner,M),
    game_backtrack(M,B,FullGame,O),!,
    (M = O -> update_exs_pos(FullGame);true),
    retract_win, retract_draw,
    retract_program(Sw),
    retract_program(Sd).


update_backtrack(_,_,[]).
update_backtrack(negative,G,[B1,B2|[B3]]) :-
    depth([B1,B2|[B3]],Depth),
    mark(learner,M),
    mark(opponent,M1),
    tasks(Wd,_),
    update_ex_all_neg(s(M,M1,B1),s(M1,M1,B2),win,Wd).
update_backtrack(negative,G,[B1,B2|[]]) :-
    depth([B1,B2|[]],Depth),
    mark(learner,M),
    mark(opponent,M1),
    tasks(Wd,_),
    update_ex_all_neg(s(M,d,B1),s(M1,d,B2),win,Wd).
update_backtrack(negative,G,[B1,B2|Game]):-
    depth([B1,B2|Game],Depth),
    mark(learner,M),
    mark(opponent,M1),
    example(K),
    append(G_head,[B2|Game],G),
    (\+ backtrack(_,_,_,G_head,Depth,_)
        ->
            asserta(backtrack(K,B2,M,G_head,Depth,0))
        ;
            true),
    update_backtrack(negative,G,Game).

test_backtrack(SwIni,SdIni,N,L,[CR1|CR_]):-
    initialisation(SwIni,SdIni,L),
    write('START'),nl,
    T1 is cputime,
    %format('cpu time: ~w\n',[T1]),
    N1 is N-1,
    get_example(N1,[],[],B,O1,1),
    regret(B,O1,R),
    format('regret: ~w \n',[R]),
    retract_program(SwIni),
    retract_program(SdIni),
    episode_learning(Sw,Sd),!,
    pprint(Sw),
    pprint(Sd),nl,
    merge(SwIni,Sw,SwIni2),
    merge(SdIni,Sd,SdIni2),
    T2 is cputime,
    %format('cpu time: ~w\n',[T2]),
    test_backtrack(N1,SwIni2,SdIni2,Sw,Sd,SwF,SdF,E,[R],[CR1|CR_]),
    write('Sw = '), pprint(SwF), nl,
    write('Sd = '), pprint(SdF), nl,
    format('regret: ~w \n',[CR1]),
    write('end'),!.

test_backtrack(0,_,_,Sw,Sd,Sw,Sd,_,CR,CR).
test_backtrack(N,SwIni,SdIni,Sw,Sd,SwF,SdF,E,[CR1|CR_In],CR_Out):-
    N >= 2,
    format('No. Game left:~w\n',[N]),
    N1 is N-1,
    N2 is N1-1,
    assert_program(SwIni),
    assert_program(SdIni),
    get_example(N1,Sw,Sd,B1,O1,E),
    regret(B1,O1,R1),
    format('regret: ~w\n',[R1]),
    get_example_backtrack(N2,Sw,Sd,B2,_),
    replay_regret(R2),
    format('Replay regret: ~w\n',[R2]),
    retract_program(SwIni),
    retract_program(SdIni),
    episode_learning(Sw2,Sd2),!,
    pprint(Sw2),
    pprint(Sd2),nl,
    merge(SwIni,Sw2,SwIni2),
    merge(SdIni,Sd2,SdIni2),
    update_counter(E1,Sw2),
    T1 is cputime,
    %format('cpu time: ~w\n',[T1]),
    CR2 is CR1+R1,
    CR3 is CR2+R2,
    test_backtrack(N2,SwIni2,SdIni2,Sw2,Sd2,SwF,SdF,E1,[CR3,CR2,CR1|CR_In],CR_Out).
test_backtrack(N,SwIni,SdIni,Sw,Sd,SwF,SdF,E,[CR1|CR_In],CR_Out):-
    N < 2,
    format('No. Game left:~w\n',[N]),
    N1 is N-1,
    assert_program(SwIni),
    assert_program(SdIni),
    get_example(N1,Sw,Sd,B,O1,E),!,
    regret(B,O1,R),
    format('regret: ~w\n',[R]),
    retract_program(SwIni),
    retract_program(SdIni),
    episode_learning(Sw2,Sd2),!,
    pprint(Sw2),
    pprint(Sd2),nl,
    merge(SwIni,Sw2,SwIni2),
    merge(SdIni,Sd2,SdIni2),
    update_counter(E1,Sw2),
    T1 is cputime,
    %format('cpu time: ~w\n',[T1]),
    CR is CR1+R,
    test_backtrack(N1,SwIni2,SdIni2,Sw2,Sd2,SwF,SdF,E1,[CR,CR1|CR_In],CR_Out).

regret_record(Out,MaxGames) :-
    test_backtrack([],[],MaxGames,separated,CR),!,
    reverse(CR,CR_r),
    write(Out,CR_r).

goal(N) :-
    open('./output/MIPlain.txt',append,Out),
    regret_record(Out,N),
    write(Out,',\n'),close(Out).

goal :- test_backtrack([],[],200,separated,CR).
