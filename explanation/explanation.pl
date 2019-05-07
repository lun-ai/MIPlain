:- ['./MIGO/metagol'].
:- [sl_migo].

explanation_operator(or, ' / ').
explanation_operator(and,' + ').
explanation_operator(not,'not').

info :-
    write('*** Please press ENTER key\"\" for submitting explanations ***\n\n').

interpret_program :-
    \+ current_predicate(target/1),
    write('*** Target for explanation not specified ***\n\n').
interpret_program :-
    info,nl,
    target(T),
    format('*** Explanation one target ~w ***\n\n', [T]),
    interpret_program(T,I),
    writeln(I).
interpret_program(Target,I) :-
    interpret_rule(Target),
    format_interpretation(Target,I).

interpret_rule(Pred) :-
    \+ multi_rule_definitions(Pred),
    current_predicate(rule_explanation/4),
    rule_explanation(Pred,_,_,_).
interpret_rule(Pred) :-
    \+ multi_rule_definitions(Pred),
    sub(Name,Pred,_,[Pred|Body],_),
    interpret_rule_(Name,[Pred|Body],Body,Exp_),
    format('how do you want to express, ~w, according to rule,\n', [Exp_]),
    pprint([sub(Name,Pred,_,[Pred|Body],_)]),nl,
    explanation_from_input(PredExp),
    add_rule_explanation(Pred,PredExp,Body,Exp_).


interpret_rule_(_,_,[],'').
interpret_rule_(Name,[Pred|Body],[B|[]],Exp1) :-
    interpret_rule_body(Name,[Pred|Body],[B|[]],Exp1,'').
interpret_rule_(Name,[Pred|Body],Bs,Exp) :-
    interpret_rule_body(Name,[Pred|Body],Bs,Exp1,Exp2),
    concat_explanations(and,Exp1,Exp2,Exp).

interpret_rule_body(Name,[Pred|Body],[B|Bs],Exp1,Exp2) :-
    primitive_explanation(B,Exp),
    interpret_rule_(Name,[Pred|Body],Bs,Exp2),
    format('how do you want to express, ~w (default: ~w), in rule,\n', [B,Exp]),
    pprint([sub(Name,Pred,_,[Pred|Body],_)]),nl,
    explanation_from_input(Exp1).
interpret_rule_body(Name,[Pred|Body],[Op,B|Bs],Exp1,none) :-
    explanation_operator(Op,OpExp),
    interpret_rule_(Name,[Pred|Body],[B|Bs],Exp2),
    format('how do you want to express, ~w(~w) (~w from previous: ~w), in rule,\n', [OpExp,B,B,Exp2]),
    pprint([sub(Name,Pred,_,[Pred|Body],_)]),nl,
    explanation_from_input(Exp1).
interpret_rule_body(Name,[Pred|Body],[B|Bs],Exp1,Exp2) :-
    \+ primitive_explanation(B,_),
    interpret_rule(B),
    rule_explanation(B,Exp,_,_),
    interpret_rule_(Name,[Pred|Body],Bs,Exp2),
    format('how do you want to express, ~w (from previous: ~w), in rule,\n', [B,Exp]),
    pprint([sub(Name,Pred,_,[Pred|Body],_)]),nl,
    explanation_from_input(Exp1).

%format_interpretation_aux([],I).
%format_interpretation_aux([B|Bs],I) :-
%    rule_explanation(B,PredExp,_,_),
%    format_interpretation_aux(Bs,I_)
%    concat_explanations(and,I_,PredExp,I).
format_interpretation(Pred,I) :-
    rule_explanation(Pred,PredExp,_,BodyExp),
    string_concat(PredExp,' = ',Exp1),
    string_concat(Exp1,BodyExp,I),!.

concat_explanations(Op,none,Exp,Exp) :-
    explanation_operator(Op,_).
concat_explanations(Op,Exp,none,Exp) :-
    explanation_operator(Op,_).
concat_explanations(Op,Exp1,Exp2,Exp_) :-
    explanation_operator(Op,Op_),
    string_concat(Exp1,Op_ ,Exp3),
    string_concat(Exp3,Exp2,Exp_).

remove_rule_explanation(Pred) :-
    retractall(rule_explanation(Pred,_,_,_)).

add_rule_explanation(Pred,PredExp,Body,BodyExp) :-
    assertz(rule_explanation(Pred,PredExp,Body,BodyExp)).

format_input([],'').
format_input([W],W).
format_input([W|Ws],S) :-
    string_concat(W,' ',W1),
    format_input(Ws,S_),
    string_concat(W1,S_,S),!.

explanation_from_input(Userexp) :-
    readln(Input),
    format_input(Input,Userexp),
    writeln(Userexp),nl.

multi_rule_definitions(Pred) :-
    findall(Pred,sub(_,Pred,_,_,_),Preds),
    length(Preds,L),
    L > 1.

add_target(T) :-
    asserta(target(T)).

