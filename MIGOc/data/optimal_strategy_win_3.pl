:- [playox].

%%%%%%%% learned strategy %%%%%%%%

win_3(A,B):-move(A,B),win_3_1(B).
win_3_1(A):-one_strong_of_X(A),win_3_2(A).
win_3_2(A):-move(A,B),win_3_3(B).
win_3_3(A):-zero_strong_of_X(A),win_3_4(A).
win_3_4(A):-win_2(A,B),win_2_1(B).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


check_strategy(Not_sat_P, Sat_N) :-
Pos = [
win_3(s(x,_,b(e,e,e,o,e,e,e,e,x)), s(o,_,b(e,e,e,o,x,e,e,e,x))),
win_3(s(x,_,b(e,e,e,o,e,e,e,e,x)), s(o,_,b(e,e,x,o,e,e,e,e,x))),
win_3(s(x,_,b(e,e,e,o,e,e,e,e,x)), s(o,_,b(e,e,e,o,e,e,x,e,x))),
win_3(s(x,_,b(e,e,e,o,e,e,e,x,e)), s(o,_,b(e,e,e,o,x,e,e,x,e))),
win_3(s(x,_,b(e,e,e,o,e,e,e,x,e)), s(o,_,b(e,e,e,o,e,e,x,x,e))),
win_3(s(x,_,b(e,e,e,e,e,e,o,e,x)), s(o,_,b(x,e,e,e,e,e,o,e,x))),
win_3(s(x,_,b(e,e,e,e,e,e,o,e,x)), s(o,_,b(e,e,x,e,e,e,o,e,x))),
win_3(s(x,_,b(e,e,e,e,e,e,o,e,x)), s(o,_,b(e,e,e,e,e,x,o,e,x))),
win_3(s(x,_,b(e,e,e,o,x,e,e,e,e)), s(o,_,b(x,e,e,o,x,e,e,e,e))),
win_3(s(x,_,b(e,e,e,o,x,e,e,e,e)), s(o,_,b(e,x,e,o,x,e,e,e,e))),
win_3(s(x,_,b(e,e,e,o,x,e,e,e,e)), s(o,_,b(e,e,x,o,x,e,e,e,e))),
win_3(s(x,_,b(e,e,e,o,x,e,e,e,e)), s(o,_,b(e,e,e,o,x,e,e,e,x))),
win_3(s(x,_,b(e,e,e,o,x,e,e,e,e)), s(o,_,b(e,e,e,o,x,e,e,x,e))),
win_3(s(x,_,b(e,e,e,o,x,e,e,e,e)), s(o,_,b(e,e,e,o,x,e,x,e,e))),
win_3(s(x,_,b(e,e,e,o,e,e,x,e,e)), s(o,_,b(e,e,e,o,x,e,x,e,e))),
win_3(s(x,_,b(e,e,e,o,e,e,x,e,e)), s(o,_,b(e,e,e,o,e,e,x,e,x))),
win_3(s(x,_,b(e,e,e,o,e,e,x,e,e)), s(o,_,b(e,e,e,o,e,e,x,x,e))),
win_3(s(x,_,b(e,e,e,x,e,e,e,e,o)), s(o,_,b(e,e,e,x,e,e,x,e,o))),
win_3(s(x,_,b(e,e,x,e,e,e,o,e,e)), s(o,_,b(x,e,x,e,e,e,o,e,e))),
win_3(s(x,_,b(e,e,x,e,e,e,o,e,e)), s(o,_,b(e,e,x,e,e,e,o,e,x)))
],
Neg = [
win_3(s(x,_,b(e,e,e,o,e,e,e,e,x)), s(o,_,b(x,e,e,o,e,e,e,e,x))),
win_3(s(x,_,b(e,e,e,o,e,e,e,e,x)), s(o,_,b(e,x,e,o,e,e,e,e,x))),
win_3(s(x,_,b(e,e,e,o,e,e,e,e,x)), s(o,_,b(e,e,e,o,e,x,e,e,x))),
win_3(s(x,_,b(e,e,e,o,e,e,e,e,x)), s(o,_,b(e,e,e,o,e,e,e,x,x))),
win_3(s(x,_,b(e,e,e,o,e,e,e,x,e)), s(o,_,b(x,e,e,o,e,e,e,x,e))),
win_3(s(x,_,b(e,e,e,o,e,e,e,x,e)), s(o,_,b(e,x,e,o,e,e,e,x,e))),
win_3(s(x,_,b(e,e,e,o,e,e,e,x,e)), s(o,_,b(e,e,x,o,e,e,e,x,e))),
win_3(s(x,_,b(e,e,e,o,e,e,e,x,e)), s(o,_,b(e,e,e,o,e,x,e,x,e))),
win_3(s(x,_,b(e,e,e,o,e,e,e,x,e)), s(o,_,b(e,e,e,o,e,e,e,x,x))),
win_3(s(x,_,b(e,e,e,e,e,e,o,e,x)), s(o,_,b(e,e,e,e,x,e,o,e,x))),
win_3(s(x,_,b(e,e,e,e,e,e,o,e,x)), s(o,_,b(e,x,e,e,e,e,o,e,x))),
win_3(s(x,_,b(e,e,e,e,e,e,o,e,x)), s(o,_,b(e,e,e,e,e,e,o,x,x))),
win_3(s(x,_,b(e,e,e,e,e,e,o,e,x)), s(o,_,b(e,e,e,x,e,e,o,e,x))),
win_3(s(x,_,b(e,e,e,o,x,e,e,e,e)), s(o,_,b(e,e,e,o,x,x,e,e,e))),
win_3(s(x,_,b(e,e,e,o,e,e,x,e,e)), s(o,_,b(x,e,e,o,e,e,x,e,e))),
win_3(s(x,_,b(e,e,e,o,e,e,x,e,e)), s(o,_,b(e,x,e,o,e,e,x,e,e))),
win_3(s(x,_,b(e,e,e,o,e,e,x,e,e)), s(o,_,b(e,e,x,o,e,e,x,e,e))),
win_3(s(x,_,b(e,e,e,o,e,e,x,e,e)), s(o,_,b(e,e,e,o,e,x,x,e,e))),
win_3(s(x,_,b(e,e,e,x,e,e,e,e,o)), s(o,_,b(e,e,e,x,x,e,e,e,o))),
win_3(s(x,_,b(e,e,e,x,e,e,e,e,o)), s(o,_,b(x,e,e,x,e,e,e,e,o))),
win_3(s(x,_,b(e,e,e,x,e,e,e,e,o)), s(o,_,b(e,x,e,x,e,e,e,e,o))),
win_3(s(x,_,b(e,e,e,x,e,e,e,e,o)), s(o,_,b(e,e,x,x,e,e,e,e,o))),
win_3(s(x,_,b(e,e,e,x,e,e,e,e,o)), s(o,_,b(e,e,e,x,e,x,e,e,o))),
win_3(s(x,_,b(e,e,e,x,e,e,e,e,o)), s(o,_,b(e,e,e,x,e,e,e,x,o))),
win_3(s(x,_,b(e,e,x,e,e,e,o,e,e)), s(o,_,b(e,e,x,e,x,e,o,e,e))),
win_3(s(x,_,b(e,e,x,e,e,e,o,e,e)), s(o,_,b(e,x,x,e,e,e,o,e,e))),
win_3(s(x,_,b(e,e,x,e,e,e,o,e,e)), s(o,_,b(e,e,x,e,e,x,o,e,e))),
win_3(s(x,_,b(e,e,x,e,e,e,o,e,e)), s(o,_,b(e,e,x,e,e,e,o,x,e))),
win_3(s(x,_,b(e,e,x,e,e,e,o,e,e)), s(o,_,b(e,e,x,x,e,e,o,e,e)))
],
findall(A/B, (member(win_3(A,B), Pos), not(win(A,B))), Not_sat_P),
findall(A/B, (member(win_3(A,B), Neg), win(A,B)), Sat_N).
