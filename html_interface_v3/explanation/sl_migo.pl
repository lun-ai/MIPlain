metarule([P,R,Q],([P,A,B]:-[[R,A,B],[Q,B]])).
metarule([P,R,not,Q],([P,A,B]:-[[R,A,B],[not,[Q,B,_]]])).

prim(move/2).
prim(won/1).

%target(win_1).
%target(win_2).
%target(win_3).

primitive_explanation(move, 'move').
primitive_explanation(won, 'won').

sub(1,win_1_1_1,2,[win_1_1_1,move,won],[prim,prim]).
sub(2,win_2_1_1,2,[win_2_1_1,move,not,win_1],[prim,prim]).
sub(2,win_3_1_1,2,[win_3_1_1,win_2_1_1,not,win_2],[prim,prim]).
sub(1,win_1,2,[win_1,win_1_1_1,won],[prim,prim]).
sub(2,win_2,2,[win_2,win_2_1_1,not,win_2_1_1],[prim,prim]).
sub(2,win_3,2,[win_3,win_3_1_1,not,win_3_1_1],[prim,prim]).

%% Explanation
%% win in three moves for X = X moves + O cannot win in two moves + O moves + X forces a win in two moves while O does not win
%% win in two moves for X = X moves + O cannot win in one move + X forces win in one move
%% win in one move for X = X moves + X has three pieces in a line
