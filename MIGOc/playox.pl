%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Primitives for playing O+X. It is assumed
%	the board is a 9-vector
%  marks are 1 for e, 2 for o and 3 for x
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%% ---------- BACKGROUND KNOWLEDGE ----------

:- dynamic(n_move/1).

n_move(0).

is_board(B) :-
    functor(B,b,9),!.

value(e,1) :- !.
value(x,2) :- !.
value(o,3) :- !.
next_mark(x,o) :- !.
next_mark(o,x) :- !.

bvalue(b(A,B,C,D,E,F,G,H,I),b(Av,Bv,Cv,Dv,Ev,Fv,Gv,Hv,Iv)) :-
    value(A,Av), value(B,Bv), value(C,Cv), value(D,Dv), value(E,Ev), value(F,Fv),
    value(G,Gv), value(H,Hv), value(I,Iv).

%% there are 8 lines on a board which correspond to 8 ways of winning
line(1,b(A,_,_,B,_,_,C,_,_),[A,B,C]).
line(2,b(_,A,_,_,B,_,_,C,_),[A,B,C]).
line(3,b(_,_,A,_,_,B,_,_,C),[A,B,C]).
line(4,b(A,B,C,_,_,_,_,_,_),[A,B,C]).
line(5,b(_,_,_,A,B,C,_,_,_),[A,B,C]).
line(6,b(_,_,_,_,_,_,A,B,C),[A,B,C]).
line(7,b(A,_,_,_,B,_,_,_,C),[A,B,C]).
line(8,b(_,_,A,_,B,_,C,_,_),[A,B,C]).

line(b(A,_,_,B,_,_,C,_,_),[A,B,C]).
line(b(_,A,_,_,B,_,_,C,_),[A,B,C]).
line(b(_,_,A,_,_,B,_,_,C),[A,B,C]).
line(b(A,B,C,_,_,_,_,_,_),[A,B,C]).
line(b(_,_,_,A,B,C,_,_,_),[A,B,C]).
line(b(_,_,_,_,_,_,A,B,C),[A,B,C]).
line(b(A,_,_,_,B,_,_,_,C),[A,B,C]).
line(b(_,_,A,_,B,_,C,_,_),[A,B,C]).

line_value([e,e,e],0).
line_value([e,e,x],2).
line_value([e,e,o],3).
line_value([e,x,e],2).
line_value([e,o,e],3).
line_value([e,x,x],4).
line_value([e,x,o],6).
line_value([e,o,x],6).
line_value([e,o,o],9).

line_value([x,e,e],2).
line_value([x,e,x],4).
line_value([x,e,o],6).
line_value([x,x,e],4).
line_value([x,o,e],6).
line_value([x,x,x],8).
line_value([x,x,o],12).
line_value([x,o,x],12).
line_value([x,o,o],18).

line_value([o,e,e],3).
line_value([o,e,x],6).
line_value([o,e,o],9).
line_value([o,x,e],6).
line_value([o,o,e],9).
line_value([o,x,x],12).
line_value([o,x,o],18).
line_value([o,o,x],18).
line_value([o,o,o],27).

%% arithmetical considerations for a board
line_product(I,B,P) :- bvalue(B,Bv), line(I,Bv,L), prod_list(L,P).
line_product_v(I,Bv,P) :- line(I,Bv,L), prod_list(L,P).

rcd_product(s(_,_,B),P):-
    between(1,8,I),
    line_product(I,B,P).

rcd_product_list(s(_,_,B),Ps):-
    findall(P,(between(1,8,I),line_product(I,B,P)),Ps).

rcd_sum_product(s(M,_,B),S) :-
    next_mark(M,M1),value(M1,N),
    findall(P,(between(1,8,I),line_product(I,B,P),pow_of_N(N,_,P)),Ps),
    sum_list(Ps,S).

rcd_sum_product_opponent(s(M,_,B),S) :-
    value(M,N),
    findall(P,(between(1,8,I),line_product(I,B,P),pow_of_N(N,_,P)),Ps),
    sum_list(Ps,S).

%% Primitive definitions
%% Name of the primitive: number that represents how many time a line_product appears in a rcd_product_list
%% First argument: state
%% Second argument: power of the mark
%% these primitives are symetrical for o and x
one(s(M,_,B),I):-
    next_mark(M,M1),value(M1,N),
    rcd_product_list(s(M,_,B),L),
    countall(L,X,1),
    pow_of_N(N,I,X).

one_opponent(s(M,_,B),I):-
    value(M,N),
    rcd_product_list(s(M,_,B),L),
    countall(L,X,1),
    pow_of_N(N,I,X).

two(s(M,_,B),I):-
    next_mark(M,M1),value(M1,N),
    rcd_product_list(s(M,_,B),L),
    countall(L,X,2),
    pow_of_N(N,I,X).

two_opponent(s(M,_,B),I):-
    value(M,N),
    rcd_product_list(s(M,_,B),L),
    countall(L,X,2),
    pow_of_N(N,I,X).

three(s(M,_,B),I):-
    next_mark(M,M1),value(M1,N),
    rcd_product_list(s(M,_,B),L),
    countall(L,X,3),
    pow_of_N(N,I,X).

three_opponent(s(M,_,B),I):-
    value(M,N),
    rcd_product_list(s(M,_,B),L),
    countall(L,X,3),
    pow_of_N(N,I,X).

four(s(M,_,B),I):-
    next_mark(M,M1),value(M1,N),
    rcd_product_list(s(M,_,B),L),
    countall(L,X,4),
    pow_of_N(N,I,X).

four_opponent(s(M,_,B),I):-
    value(M,N),
    rcd_product_list(s(M,_,B),L),
    countall(L,X,4),
    pow_of_N(N,I,X).

count([],_,0).
count([X|T],X,Y):- !,count(T,X,Z), Y is 1+Z.
count([X1|T],X,Z):- count(T,X,Z).

countall(List,X,C) :-
    count(List,X,C).

prod_list([], 1).
prod_list([H|T], Sum) :-
    prod_list(T, Rest),
    Sum is H*Rest.

pow_of_N(N,1,N).
pow_of_N(N,I,M):-
    M>N,
    0 is mod(M,N),
    M1 is M//N,
    pow_of_N(N,I1,M1),
    I is I1+1.

%% Count number of weak option
count_zero(0).
count_one(1).
count_two(2).
count_three(3).
count_four(4).

empty_triangle(s(_,_,B)) :-
    T = ([3,4,7];[1,4,8];[3,6,8];[1,6,7]),
    findall(P, (member(I,T), line_product(I,B,P)),L),
    sum_list(L,3).

draw_pattern(s(_,_,b(P1,P2,P3,P4,x,P6,P7,P8,P9))) :-
    findall(P,(between(7,8,I),line_product(I,b(P1,P2,P3,P4,x,P6,P7,P8,P9),P)),L),
    member(6,L).

draw_pattern(s(_,_,b(P1,P2,P3,P4,o,P6,P7,P8,P9))) :-
    findall(P,(between(7,8,I),line_product(I,b(P1,P2,P3,P4,o,P6,P7,P8,P9),P)),L),
    member(6,L).

count_unoccupied_diags(s(_,_,B),C) :-
    findall(P,(between(7,8,I),line_product(I,B,P)),L),
    countall(L,1,C).

count_unoccupied_cols(s(_,_,B),C) :-
    findall(P,(between(1,3,I),line_product(I,B,P)),L),
    countall(L,1,C).

count_unoccupied_rows(s(_,_,B),C) :-
    findall(P,(between(4,6,I),line_product(I,B,P)),L),
    countall(L,1,C).

count_weak_just_played(s(M,_,B),C) :-
    next_mark(M,M1),value(M1,N),
    rcd_product_list(s(M,_,B),L),
    countall(L,N,C).

count_weak_to_play(s(M,_,B),C) :-
    value(M,N),
    rcd_product_list(s(M,_,B),L),
    countall(L,N,C).

%% Count number of strong option
zero_strong_of_X(s(_,_,B)) :- count_strong_of_X(s(_,_,B), 0).
one_strong_of_X(s(_,_,B)) :- count_strong_of_X(s(_,_,B), 1).
two_strong_of_X(s(_,_,B)) :- count_strong_of_X(s(_,_,B), 2).

zero_strong_of_O(s(_,_,B)) :- count_strong_of_O(s(_,_,B), 0).
one_strong_of_O(s(_,_,B)) :- count_strong_of_O(s(_,_,B), 1).
two_strong_of_O(s(_,_,B)) :- count_strong_of_O(s(_,_,B), 2).

count_double_mark_line(s(_,_,B),M,C) :-
    mark(M),
    value(M,N),
    findall(P,(between(1,8,I),line(I,B,L_),line_value(L_,P)),L),
    X is N * N,
    countall(L,X,C).

count_single_mark_line(s(_,_,B),M,C) :-
    mark(M),
    value(M,N),
    findall(P,(between(1,8,I),line(I,B,L_),line_value(L_,P)),L),
    countall(L,N,C).

count_strong_of_X(s(_,_,B),C) :-
    value(x,N),
    findall(P,(between(1,8,I),line(I,B,L_),line_value(L_,P)),L),
    X is N * N,
    countall(L,X,C).

count_strong_of_O(s(_,_,B),C) :-
    value(o,N),
    findall(P,(between(1,8,I),line(I,B,L_),line_value(L_,P)),L),
    X is N * N,
    countall(L,X,C).

count_strong_of_X(s(_,_,B),C) :-
    value(x,N),
    findall(P,(between(1,8,I),line(I,B,L_),line_value(L_,P)),L),
    X is N * N,
    countall(L,X,C).

count_strong_of_O(s(_,_,B),C) :-
    value(o,N),
    findall(P,(between(1,8,I),line(I,B,L_),line_value(L_,P)),L),
    X is N * N,
    countall(L,X,C).

count_strong_just_played(s(M,_,B),C) :-
    next_mark(M,M1),value(M1,N),
    rcd_product_list(s(M,_,B),L),
    X is N * N,!,
    countall(L,X,C).

count_strong_to_play(s(M,_,B),C) :-
    value(M,N),
    rcd_product_list(s(M,_,B),L),
    X is N * N,!,
    countall(L,X,C).

int(I) :-
    count_zero(I).
int(I) :-
    count_one(I).
int(I) :-
    count_two(I).
int(I) :-
    count_three(I).
int(I) :-
    count_four(I).

greater_than(N1, N2) :-
    int(N1),
    int(N2),
    N2 >= 0,
    N1 > N2.

greater_equal_than(N1, N2) :-
    int(N1),
    int(N2),
    N2 >= 0,
    N1 >= N2.

less_than(N1, N2) :-
    int(N1),
    int(N2),
    N1 >= 0,
    N1 < N2.

less_equal_than(N1, N2) :-
    int(N1),
    int(N2),
    N1 >= 0,
    N1 =< N2.

pos(1).   pos(2).   pos(3).   pos(4).   pos(5).   pos(6).   pos(7).   pos(8).    pos(9).

mark_on_pos(B,P,M) :-
    pos(P),
    arg(P,B,M).

toplay(o,S) :- toplayO(S).
toplay(x,S) :- toplayX(S).

toplayO(S):- moves_left(S,N), odd(N),!.
toplayX(S):- moves_left(S,N), even(N),!.

moves_left(s(_,_,B),N) :-
    findall(P,(pos(P),mark_on_pos(B,P,e)),Ps),!,
    length(Ps,N).

compatible(s(_,_,B),s(_,_,B1)) :-
     moves_left(s(_,_,B),N),
     moves_left(s(_,_,B1),N1),
     N = N1.

% move generator
move_X(s(x,_,B1),s(o,_,B2)) :- move(x,B1,B2).
move_O(s(o,_,B1),s(x,_,B2)) :- move(o,B1,B2).
move(s(M,_,B1),s(M1,_,B2)):- next_mark(M,M1), move(M,B1,B2).

move(X,B1,B2) :- is_board(B1),!, pos(P), move(X,P,B1,B2).

add_move_count :-
    n_move(N), retract(n_move(N)), N1 is N+1, assert(n_move(N1)).

move(X,1,b(e,B,C,D,E,F,G,H,I),b(X,B,C,D,E,F,G,H,I)) :-!.
move(X,2,b(A,e,C,D,E,F,G,H,I),b(A,X,C,D,E,F,G,H,I)) :-!.
move(X,3,b(A,B,e,D,E,F,G,H,I),b(A,B,X,D,E,F,G,H,I)) :-!.
move(X,4,b(A,B,C,e,E,F,G,H,I),b(A,B,C,X,E,F,G,H,I)) :-!.
move(X,5,b(A,B,C,D,e,F,G,H,I),b(A,B,C,D,X,F,G,H,I)) :-!.
move(X,6,b(A,B,C,D,E,e,G,H,I),b(A,B,C,D,E,X,G,H,I)) :-!.
move(X,7,b(A,B,C,D,E,F,e,H,I),b(A,B,C,D,E,F,X,H,I)) :-!.
move(X,8,b(A,B,C,D,E,F,G,e,I),b(A,B,C,D,E,F,G,X,I)) :-!.
move(X,9,b(A,B,C,D,E,F,G,H,e),b(A,B,C,D,E,F,G,H,X)) :-!.

% drawn classifier
drawn(s(M,_,B)) :- moves_left(s(M,_,B),0), \+(won(s(M,_,B))).

% win classifier
won(s(M,_,B),M1) :- next_mark(M,M1),won_(M1,s(M,_,B)).
won(s(M,_,B)) :- next_mark(M,M1),won_(M1,s(M,_,B)).

won_(X,s(_,_,B)) :-
    value(X,M),
    bvalue(B,Bv),
    between(1,8,L),
    line(L,Bv,Ms),
    forall(member(I,Ms),I is M).

% representation
space :- write(' ').
bar :- write('|').
pos(X,B) :- space, val(X,B,Y), write(Y), space.
val(X,B,' ') :- arg(X,B,e).
val(X,B,'o') :- arg(X,B,o).
val(X,B,'x') :- arg(X,B,x).
hline :- write('---------').


printstate(s(_,_,B)):- printboard(B).
printboard(B) :- nl,
    pos(1,B), bar, pos(2,B), bar, pos(3,B), nl, hline, nl,
    pos(4,B), bar, pos(5,B), bar, pos(6,B), nl, hline, nl,
    pos(7,B), bar, pos(8,B), bar, pos(9,B), nl, nl, !.

