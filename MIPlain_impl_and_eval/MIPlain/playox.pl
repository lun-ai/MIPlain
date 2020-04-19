%%  Provide the background knowledge for arithmetical features
%%  and for playing Noughts-and-Crosses
%%
%%  Empty mark has value 1
%%  Player 1 mark has value 2
%%  Player 2 mark has value 3
%%
%%  The arithmetical features describe conditions satisfied
%%  by the current board state. These features are introduced
%%  to MIGO for learning an hypothesis that does not use negation
%%  and invented predicates. The MIGO learned strategy performs
%%  a Minimax search over the game path tree.
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


%  MIGO and MIGOc have different definitions of line predicate
%
%  MIGO uses line/2 of arity 2 whereas MIGOc uses line/3 with
%  an additional id assigned to each line of the board
%
%  This line/2 definition is useful when comparing MIGOc to MIGO
line(b(A,_,_,B,_,_,C,_,_),[A,B,C]).
line(b(_,A,_,_,B,_,_,C,_),[A,B,C]).
line(b(_,_,A,_,_,B,_,_,C),[A,B,C]).
line(b(A,B,C,_,_,_,_,_,_),[A,B,C]).
line(b(_,_,_,A,B,C,_,_,_),[A,B,C]).
line(b(_,_,_,_,_,_,A,B,C),[A,B,C]).
line(b(A,_,_,_,B,_,_,_,C),[A,B,C]).
line(b(_,_,A,_,B,_,C,_,_),[A,B,C]).


%  There is a finite set of line combinations and values
%  we enumerate all of them below
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

%%  Arithmetical values of a given board position can also
%%  be computed using the followings
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

number_of_pairs(s(_,_,B),M,C) :-
    mark(M),
    value(M,N),
    findall(P,(between(1,8,I),line(I,B,L_),line_value(L_,P)),L),
    X is N * N,
    countall(L,X,C).

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

%%  move generator
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

%%  Define the win & draw condition
%%  The learner is assumed to know how to classify win terminals
won(s(M,_,B),M1) :- next_mark(M,M1),won_(M1,s(M,_,B)).
won(s(M,_,B)) :- next_mark(M,M1),won_(M1,s(M,_,B)).

drawn(s(M,_,B)) :- moves_left(s(M,_,B),0), \+(won(s(M,_,B))).

won_(X,s(_,_,B)) :-
    value(X,M),
    bvalue(B,Bv),
    between(1,8,L),
    line(L,Bv,Ms),
    forall(member(I,Ms),I is M).

