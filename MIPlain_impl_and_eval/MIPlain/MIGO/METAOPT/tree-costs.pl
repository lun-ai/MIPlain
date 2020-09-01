%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% metaopt
%% A. Cropper and S. H. Muggleton. Learning efficient logic programs.Machine Learning,108:1063–1083, 2019.
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

pos_cost(Goal,Cost):-
  (functor(Goal,_,1) -> pos_cost_monadic(Goal,Cost); pos_cost_general(Goal,Cost)).
  %format('% Pos Goal: ~w - Cost:~w\n',[Goal,Cost]).
neg_cost(Goal,Cost):-
  (functor(Goal,_,1) -> neg_cost_monadic(Goal,Cost); neg_cost_general(Goal,Cost)).
  %format('% Neg Goal: ~w - Cost:~w\n',[Goal,Cost]).

pos_cost_monadic(Goal,Cost):-
  Goal=.. [P|Args],
  statistics(inferences,I1),
  (user:primcall(P,Args) -> true; true),
  statistics(inferences,I2),
  Cost is I2-I1.

pos_cost_general(Goal,Cost):-
  Goal=.. [P|Args],
  statistics(inferences,I1),
  (user:primcall(P,Args) -> true; true),
  statistics(inferences,I2),
  Cost is I2-I1.

neg_cost_monadic(Goal,Cost):-
  statistics(inferences,I1),
  (call(Goal) -> true; true),
  statistics(inferences,I2),
  Cost is I2-I1.

neg_cost_general(Goal,Cost):-
  statistics(inferences,I1),
  (call(Goal) -> true; true),
  statistics(inferences,I2),
  Cost is I2-I1.
