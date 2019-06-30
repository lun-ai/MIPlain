%%  MIGOc performs episode learning and constructs a winning strategy program
%%  by learning sub-tasks first. Negative examples are used to ensure hypothesis
%%  learned cannot be over-generalized, and MIGOc backtracks on lost / drawn games
%%  to generate negative examples from gameplay.

episode_learning(Sw,[]) :-
    tasks(K1,K2),
    episode_learning_aux(win,1,K1,Primw,Invw,Gw),!,
    retract_win,
    flatten(Gw,Sw),
    forall((backtrack(K,I,M,G,D1,D2),
                    append(_,[B],G),
                    \+ win_pos(K1,Sw,s(x,_,B))),
                    retract(backtrack(K,I,M,G,D1,D2))),
    retractall(Primw,Invw,Gw,Sw).

episode_learning_aux(_,_,1,[],[],[]):-!.
episode_learning_aux(_,M,M,[],[],[]).
episode_learning_aux(Name,M1,M,[Prim1|Prim],[[]|Prog],[G|G1]):-
    newpred(Name,P,M1),
    episode(P,Pos,Neg,_),
    format('Pos: ~w, Neg: ~w\n',[Pos, Neg]),
    learn_efficient(Pos/Neg,G),!,
    flatten(G,S),
    metagol:assert_prog_prims(S),
    find_prims(G,Prim1),
    M2 is M1+1,
    episode_learning_aux(Name,M2,M,Prim,Prog,G1).

learn_efficient(Pos/Neg,G) :-
    max_time(MaxTime),
    catch(call_with_time_limit(MaxTime,
                               (metagol:metaopt(Pos,Neg),metagol:get_best_program(G))),
          time_limit_exceeded,
          (writeln('% timeout'),metagol:get_best_program(G))).

flatten_retract_strategy(S,FS) :-
    flatten(Prim,Prim2),
    retractall_prim(Prim2),
    flatten(S,FS),
    retract_program(FS).

tasks(N1,N):-
    depth_game(N),
    N1 is N-1,
    tasks(win,1,N1),
    tasks(draw,1,N), !.
tasks(K1,K3):-
    tasks(win,1,K1),
    tasks(draw,1,K2),
    K3 is min(K1,K2).

tasks(_,N1,N1) :- depth_game(N),N1 is N-1.
tasks(Name,N,M):-
    newpred(Name,Ep2,N),
    episode(Ep2,Pos,_,_),
    \+(Pos = []),!,
    N1 is N+1,
    tasks(Name,N1,M).
tasks(_,M,M):- !.

assert_program(Prog) :-
    metagol:assert_program(Prog).

retract_program(Prog) :-
    metagol:retract_program(Prog).

pprint(Prog) :-
    metagol:pprint(Prog).

compatible_with_pos(Pos,Neg) :-
    Pos=..[P,s(M,_,B),_],
    Neg=..[P,s(M,_,B1),_],
    compatible(s(_,_,B),s(_,_,B1)).

retractall_prim(Prims):-
    maplist(retract_prim,Prims).

retract_prim(Prim):-
    Prim = P/_,
    retractall(user:prim(Prim)),
    retractall(user:primcall(P,_)).

