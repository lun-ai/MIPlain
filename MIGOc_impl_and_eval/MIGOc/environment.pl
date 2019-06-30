
:- [menace].

:- dynamic(board/1).
:- dynamic(playing/1).
:- dynamic(bead/1).
:- dynamic(example/1).

player(1).
player(2).

next_player(1, 2).
next_player(2, 1).

next_mark(x,o) :-!.
next_mark(o,x) :-!.

player_mark(1, x) :- !.
player_mark(2, o) :- !.

marks([x,o]).

mark(M) :- marks(Ms), member(M,Ms).

initial_board([e,e,e,e,e,e,e,e,e]) :- !.

reset :-
    retractall(board(_)),
    retractall(playing(_)),
    retractall(strategy(_)).

initialisation_game(B) :-
    asserta(board(B)),
    asserta(playing(1)),!.

game(S1,S2,Game,Outcome) :-
    initial_board(B),
    game(B,S1,S2,Game,Outcome).

game(B,S1,S2,Game,Outcome):-
    reset,
    initialisation_game(B),!,
    write('*** Normal game *** \n'),
    play(S1,S2,Game1,Outcome),
    append([B],Game1,Game).

%% play against menace
make_move(current,M,B,B2,Bead):-play_menace(current,M,B,B2,Bead).
make_move(last,M,B,B2,Bead):-play_menace(last,M,B,B2,Bead).

%% play with optimal strategy = minimax algorithm
make_move(minimax,_,B,B2,none):- !,
    board_to_list(B,L),
    next_pos(L,L2,_,_),
    list_to_board(L2,B2),!,
    retractall(board(_)),
    asserta(board(B2)).

%% play with random strategy
make_move(random,M,B,B2,none):-
    findall(s(M1,_,B1),(move(s(M,_,B),s(M1,_,B1))),Ps),!,
    random_member(s(M1,_,B2),Ps),
    retractall(board(_)),
    asserta(board(B2)).


%% Normal gameplay, each game has an ID associated with it
make_move(default,M,B,B2,default):-
    example(K),!,
    next_mark(M,M1),
    findall(B1,move(s(M,_,B),s(M1,_,B1)),Bs),
    set_random(seed(K)),
    random_member(B2,Bs),
    retractall(board(_)),
    asserta(board(B2)).
%% Replaying, each replay uses ID of the original game
make_move(default,M,B,B2,default):-
    backtrack(K,_,M,_,_,_),!,
    next_mark(M,M1),
    findall(B1,move(s(M,_,B),s(M1,_,B1)),Bs),
    set_random(seed(K)),
    random_member(B2,Bs),
    retractall(board(_)),
    asserta(board(B2)).
%% Replay move when there is only one available move to be made
make_move(branch,_,M,B,B2,_):-
    next_mark(M,M1),
    findall(B1,move(s(M,_,B),s(M1,_,B1)),[B2|[]]),
    retractall(board(_)),
    asserta(board(B2)).
%% Replaying and pick a different game branch
make_move(branch,K,M,B,B2,B2):-
    next_mark(M,M1),
    move(s(M,_,B),s(M1,_,B1)),
    retractall(board(_)),
    asserta(board(B2)).
%make_move(branch,K,M,B,B2,D):-
%    next_mark(M,M1),
%    newpred(win,P,D),
%    current_predicate(P/2),
%    findall(B1,call(P,s(M,_,B),s(M1,_,B1)),[B_|Bs]),!,
%    set_random(seed(K)),
%    random_member(B2,Bs),
%    retractall(board(_)),
%    asserta(board(B2)).
%% Replaying and pick a different game branch
make_move(branch,K,M,B,B3,_):-
    next_mark(M,M1),
    findall(B1,move(s(M,_,B),s(M1,_,B1)),Bs),
    set_random(seed(K)),
    random_member(B2,Bs),
    delete(Bs,B2,Bs1),
    random_member(B3,Bs1),
    retractall(board(_)),
    asserta(board(B3)).

%% play with a strategy described by a logic program LP
%% default - semi-random with fix seed move
make_move(learned_strategy,x,B1,B2,default) :-
    \+ execute_strategy(s(x,_,B1),_,s(o,_,B2)),
    make_move(default,x,B1,B2,default),!.
make_move(learned_strategy,x,B1,B2,none) :-
    execute_strategy(s(x,_,B1),_,s(o,_,B2)),
    retract(board(_)),
    asserta(board(B2)).


%% play a game until termination
play(S1,S2,Game,Outcome) :-
    board(B),
    playing(P),
    player_mark(P,M),
    ((P is 1) -> make_move(S1,M,B,B2,_); make_move(S2,M,B,B2,_)),
    board(B2),
    playing(P),
    player_mark(P,M),
    next_player(P,P2),
    player_mark(P2,M2),
    (won(s(M2,_,B2))
        ->
            append([B2],[],Game),
            write('Player '), write(P), nl,
            get_outcome(win,P,Outcome)
        ;
            (drawn(s(M2,_,B2))
                ->
                    append([B2],[],Game),
                    write('Drawn '),nl,
                    get_outcome(draw,P,Outcome)
                ;
                    next_player,
                    play(S1,S2,Game2,Outcome),!,
                    append([B2],Game2,Game))).

get_outcome(win,1,x).
get_outcome(win,2,o).
get_outcome(draw,_,d).

next_player :-
    playing(P),
    next_player(P,P2),
    retract(playing(_)),
    asserta(playing(P2)).

switch(B,N,M,B1):-
    B =.. L,
    N1 is N+1,
    switch_(L,N1,M,L1),
    B1 =.. L1.

switch_([_|R],0,M,[M|R]) :- !.
switch_([X|R],N,M,[X|R2]):-
    N > 0,
    N1 is N-1,
    switch_(R,N1,M,R2),!.

positions(B,M,N) :-
    findall(N1,(between(1,9,N),arg(N,B,M),N1 is N-1),Indexes),
    length(Indexes,N).

empty_positions(B,Indexes):-
    findall(N1,(between(1,9,N),arg(N,B,e),N1 is N-1),Indexes).


empty(Pos,Board):-
    arg(Pos,Board,e).
