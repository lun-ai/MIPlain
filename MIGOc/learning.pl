:- user:use_module(library(lists)).
:- use_module(library(lists)).
:- use_module(library(random)).
:- use_module(library(system)).

:- ['./MIGO/METAOPT/metaopt'].
:- ['./MIGO/METAOPT/tree-costs'].
:- ['./MIGO/dependent_learning'].
:- ['./MIGO/assign_labels'].
:- ['./MIGO/background'].
:- ['./MIGO/episode_learning'].
:- ['./MIGO/execute_strategy'].
:- ['./util'].
:- [playox].


%% ---------- METARULES ----------

metarule([P,Q,R],([P,A,B]:-[[Q,A,B],[R,B]])).
metarule([P,Q,B,C,R],([P,A]:-[[Q,A,B,C],[R,A]])).
metarule([P,Q,R],([P,A]:-[[Q,A,B],[R,B]])).
metarule([P,Q,B,D,R,C,E],([P,A]:-[[Q,A,B,D],[R,A,C,E]])).


%% ---------- METAGOL SETTINGS ----------

%% additional features
prim(count_double_mark_line/3).
%prim(count_single_mark_line/3).

prim(move/2).
prim(won/1).