%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%  MIGO
%%  S. H. Muggleton and C. Hocquette. Machine discovery of comprehensible strategies for
%% simple games using meta-interpretive learning.New Generation Computing, 37:203–217,2019.
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

:- user:use_module(library(lists)).
:- use_module(library(lists)).
:- use_module(library(random)).
:- use_module(library(system)).

:- [assign_labels].
:- [background].
:- [dependent_learning].
:- [execute_strategy].
:- [metagol].

%% ---------- METARULES ----------

metarule([P,R,Q],([P,A,B]:-[[R,A,B],[Q,B]])).
metarule([P,R,not,Q],([P,A,B]:-[[R,A,B],[not,[Q,B,_]]])).

%% ---------- METAGOL SETTINGS ----------

prim(move/2).
prim(drawn/1).
prim(won/1).

user:min_clauses(1).
user:max_clauses(4).
