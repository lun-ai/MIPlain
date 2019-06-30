metarule([P,R,Q],([P,A,B]:-[[R,A,B],[Q,B]])).
metarule([P,R,Q],([P,A]:-[[R,A],[Q,A]])).
metarule([P,R,Q],([P,A]:-[[R,A,B],[Q,B]])).

prim(zero_strong_of_X/1).
prim(one_strong_of_X/1).
prim(two_strong_of_X/1).
prim(zero_strong_of_O/1).
prim(one_strong_of_O/1).
prim(two_strong_of_O/1).
prim(move/2).
prim(won/1).

%target(win_1).
%target(win_2).
%target(win_3).

primitive_explanation(move, 'move').
primitive_explanation(won, 'won').
primitive_explanation(zero_strong_of_X, 'X has no strong option').
primitive_explanation(one_strong_of_X, 'X has one strong option').
primitive_explanation(two_strong_of_X, 'X has two strong options').
primitive_explanation(zero_strong_of_O, 'O has no strong option').
primitive_explanation(one_strong_of_O, 'O has one strong option').
primitive_explanation(two_strong_of_O, 'O has two strong options').


sub(1,win_1,2,[win_1,move,won],[prim,prim]).

sub(2,win_2_1,1,[win_2_1,two_strong_of_X,zero_strong_of_O],[prim,prim]).
sub(1,win_2,2,[win_2,move,win_2_1],[prim,inv]).

sub(3,win_3_4,1,[win_3_4,win_2,win_2_1],[prim,prim]).
sub(2,win_3_3,1,[win_3_3,zero_strong_of_X,win_3_4],[prim,inv]).
sub(3,win_3_2,1,[win_3_2,move,win_3_3],[prim,inv]).
sub(2,win_3_1,1,[win_3_1,one_strong_of_X,win_3_2],[prim,inv]).
sub(1,win_3,2,[win_3,move,win_3_1],[prim,inv]).

%% Explanations obtained
%% winning first move for X = X moves + X has one strong option + O moves + X will be blocked by O
%%                    + X can force two more strong options than O
%% winning second move for X = X moves + X has two more strong options than O
%% winning third move for X = X moves + X has three pieces in a line
