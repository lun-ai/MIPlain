:- user:use_module(library(lists)).
:- use_module(library(lists)).
:- use_module(library(random)).
:- use_module(library(system)).

:- ['./MIGO/METAOPT/metaopt'].
:- ['./MIGO/METAOPT/tree-costs'].
%:- ['./MIGO/METAGOL/metagol'].
:- ['./MIGO/dependent_learning'].
:- ['./MIGO/assign_labels'].
:- ['./MIGO/background'].
:- ['./MIGO/episode_learning'].
:- ['./MIGO/execute_strategy'].
:- ['./util'].
:- [playox].


%% ---------- METARULES ----------

metarule([P,R,Q],([P,A,B]:-[[R,A,B],[Q,B]])).
metarule([P,R,B,C,Q],([P,A]:-[[R,A,B,C],[Q,A]])).
metarule([P,R,Q],([P,A]:-[[R,A,B],[Q,B]])).
metarule([P,R,B,D,Q,C,E],([P,A]:-[[R,A,B,D],[Q,A,C,E]])).


%% ---------- METAGOL SETTINGS ----------

%% additional features

prim(count_strong_option/3).

prim(move/2).
prim(won/1).