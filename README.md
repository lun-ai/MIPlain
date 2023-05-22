# Machine learning of Noughts-and-Crosses using MIL

We have devised a symbolic machine learning framework for learning to win the game of Noughts and Crosses. 
The purpose of this framework is to learn a logic theory which we can use to teach human beings such that their out-of-sample performance is improved as the result of teaching. 
This beneficial aspect of using machine learned model to aid human comprehension is known as one key criteria of the Ultra-Strong Machine Learning described by Donald Michie.
This work is described in a Machine Learning Journal publication, ["Beneficial and harmful explanatory machine learning"](https://link.springer.com/article/10.1007/s10994-020-05941-0).

We incorporated the learned theory of this framework in empirical studies and investigated the explanatory effects of machine learned theory.
The explanatory effects of machine learned theory are defined by us as being beneficial or harmful. 
An operation definition relates to improvement or degradation of human out-of-sample performance after being provided a logic theory as an explanation.

**Meta-Interpretive Learning** (MIL) is an Inductive Logic Programming (ILP) approach in which recursive logic programs can be induced incrementally from a small number of examples together with background predicates and metarules.

MIPlain stands for **M**eta-**I**nterpretive ex**Plain**able game learner and is based on the Meta-interpretive game learning system MIGO (Muggleton and Hocquette 2019). 
In addition to learning from positive examples which MIGO does, MIPlain identifies moves which are negative examples for the task of winning. When a game is drawn or lost for the learner, the corresponding path in the game tree is saved for later backtracking following the most updated strategy. 
A selection of hypotheses is performed by MIPlain based on the efficiency of hypothesised programs using Metaopt (Cropper and Muggleton 2019).

MIPlain learns a Noughts-and-Crosses winning strategy which is more runtime efficient than the one learned by MIGO. MIPlain also achieves more efficient cumulative regrets during learning than MIGO, Deep Q-learning and classic Q-learning.

The following figure shows the logic program learned by MIPlain.
![MIPlain_strategy](MIPlain_impl_and_eval/results/MIPlain_strategy.png)

## MIPlain

MIPlain uses three primitives (highlighted in the above figure):
1. move/2 for generating a valid Noughts and Crosses move
2. won/1 for deciding a win of Noughts and Crosses
3. number_of_pairs/3 for specifying the number of attacks for a player (X or O) on a given board. We have name such a game pattern "pair" because an attack involves two pieces of the same player but none of the opponent.

(win_1) winning third move for X = X moves + X has three pieces in a line

```prolog
win_1(A,B):-move(A,B),won(B).
```

(win_2) winning second move for X = X moves + X has two attacks + O has no attack

```prolog
win_2(A,B):-move(A,B),win_2_1(B).
win_2_1(A):-number_of_pairs(A,x,2),number_of_pairs(A,o,0).
```

(win_3) winning first move for X = X moves + X has one attack + O moves + X will be blocked by O
                         + X then makes two attacks + O has no attack

```prolog
win_3(A,B):-move(A,B),win_3_1(B).
win_3_1(A):-number_of_pairs(A,x,1),win_3_2(A).
win_3_2(A):-move(A,B),win_3_3(B).
win_3_3(A):-number_of_pairs(A,x,0),win_3_4(A).
win_3_4(A):-move(A,B),win_2_1(B).
```

### Learning the target programs

Requirement:

- SWI-Prolog

```bash
cd MIPlain_impl_and_eval/MIPlain/
swipl -s backtrack_and_replay.pl -g goal -t halt
```

## MIPlain implementation and evaluation

### Backtrack algorithm
- MIPlain_impl_and_eval/MIPlain/backtrack_and_replay.pl

### MIPlain meta-rules and feature primitives
- MIPlain_impl_and_eval/MIPlain/learning.pl

### MIPlain game playing enviroment
- MIPlain_impl_and_eval/MIPlain/environment.pl

### MIPlain learning (Metaopt and episode learning) extending MIGO
- MIPlain_impl_and_eval/MIPlain/MIGO/episode_learning.pl

- MIPlain_impl_and_eval/MIPlain/MIGO/assign_labels.pl

- MIPlain_impl_and_eval/MIPlain/MIGO/execute_strategy.pl

- MIPlain_impl_and_eval/MIPlain/MIGO/METAOPT/metaopt.pl

- MIPlain_impl_and_eval/MIPlain/MIGO/METAOPT/tree-costs.pl

### Learning efficiency evaluation
Q-Learing, DQN and MIGO are compared with MIPlain.

An implementation of Q-learning (Q-learning tic-tac-toe accessed 14 April, 2019) and an implementation of Deep Q-learning (Solving tic-tac-toe using deep reinforcement learning. accessed  14  April,  2019) were used to learn how to win Noughts-and-Crosses as the player ”X” from the same set of 2-ply winnable boards as MIGO and MIPlain. For each of the methods, we accumulated regrets from each game, and the regret for each won, drawn, lost game is 0, 1, 2 respectively.

For Q-learning and Deep Q-learning, an illegal move is treated as a lost and the regret is 2. We set the state space to include a state for each cell of the board and an action is a move made by player ”X”. The DQN learner and the classical Q-Learning assume an optimal opponent for gameplay. We defined reward functions that heavily penalize invalid moves for both Q-Learning and DQN. We set discount factor to 0.9 for Q-learning and 0.8 for DQN. For DQN, we used a small learning rate  to  avoid  over-fitting and a simple fully-connected network (256,  64)  as  the  value  network. Both Q-Learning and DQN were given a set of initial boards for learning to ensure the best achievable outcome of gameplay is win.

- MIPlain_impl_and_eval/Deep_Q_learning/output/DQN.txt

- MIPlain_impl_and_eval/nandc_MIGO/output/MIGO.txt

- MIPlain_impl_and_eval/Q_learning/output/q.txt

- MIPlain_impl_and_eval/MIPlain/output/MIPlain.txt

![cumulative_regrets](MIPlain_impl_and_eval/results/cumulative_regrets_comparison.png)


### Run-time efficiency evaluation
The number of inference performed by MIGO and MIPlain learned program in 100 games (50 runs).
- MIPlain_impl_and_eval/MIPlain/output/inference.txt

![run-time](MIPlain_impl_and_eval/results/MIPlain_MIGO_inference_comparison.png)

The number of inference performed by win1, win2 and win3 predicates in MIGO learned program in 100 games (50 runs).
- MIPlain_impl_and_eval/MIPlain/output/rule_wise_inference_MIGO.txt

The number of inference performed by win1, win2 and win3 predicates in MIPlain learned program in 100 games (50 runs).
- MIPlain_impl_and_eval/MIPlain/output/rule_wise_inference_MIPlain.txt

![run-time](MIPlain_impl_and_eval/results/MIPlain_MIGO_rule_wise_inference_comparison.png)

## Repository composition
In the following section, we describe the compositions of this repository for reader reference.
Details of the arrangement are be discussed. If interested about additional information and raw empirical data of experiments, please find the contact of author at the page bottom.

### Minimax database (not required to reproduce for MIPlain local use)
- minimax/canonical_map.m

- minimax/data.m

- minimax/minimax_DB.py (functions for creating database, visualization and conversion to JS)

## Experiment interfaces
This sub folder is consisted of experiment interfaces realised by HTML and JavaScript.
We have used different versions for multiple experiment setups and progressively improved the interfaces.
- Version 1: Test Experiment
- Version 2 - 3: Noughts and Crosses experiments
- Version 4 - 5: Experiments concerning a two players game that is isomorphic to Noughts and Crosses.

We have introduced an isomorphic two players game to increase the difficulty of the gameplay by preventing analogical access to past experience of Noughts and Crosses.
The Island Game contains three islands, each with three territories on which one or more resources are marked. 

The winning condition is met when a player either controls all territories on one island or three instances of the same resource.
The nine territories resemble the nine fields in Noughts and Crosses and the structure of the original game is maintained in regard to players’ turns, possible moves, board states and win conditions. 
This isomorphism masks a number of spatial relations representing the membership of a field to a win condition. In this way, the fields canbe rearranged in an arbitrary order without changing the structure of the game.

### Generating explanation

User inputs are required for generating explanations of learned programs.

Learned programs have been wrapped and default text mappings from primitives have been provided.

```commandline
swipl -s experiment_interfaces/explanation/explanation.pl
```

Add the rule to be explained and then start the interactive mode.

Default rule names are win_1, win_2, and win_3 which correspond to the program sub-goals learned.

```prolog
?- add_target(rule_name).
true.

?- interpret_program.
```

The output of an interactive session is presented below. The prompts produce the exemplary explanation of win_3
in experiment_interfaces/explanation/expl_MIPlain.pl.

```prolog
?- interpret_program.
*** Please press ENTER key for submitting explanations ***


*** Explanation one target win_3 ***

how do you want to express, zero_strong_of_O (default: O has no pair), in rule,
win_2_1(A):-two_strong_of_X(A),zero_strong_of_O(A).

|: O has no pair

how do you want to express, two_strong_of_X (default: X has two pairs), in rule,
win_2_1(A):-two_strong_of_X(A),zero_strong_of_O(A).

|: X has two pairs

how do you want to express, X has two pairs + O has no pair, according to rule,
win_2_1(A):-two_strong_of_X(A),zero_strong_of_O(A).

|: X has two more pairs than O

how do you want to express, win_2_1 (from previous: X has two more pairs than O), in rule,
win_2(A,B):-move(A,B),win_2_1(B).

|: X has two more pairs than O

how do you want to express, move (default: move), in rule,
win_2(A,B):-move(A,B),win_2_1(B).

|: X moves

how do you want to express, X moves + X has two more pairs than O, according to rule,
win_2(A,B):-move(A,B),win_2_1(B).

|: X can force two more pairs than O

how do you want to express, win_2_1 (from previous: X has two more pairs than O), in rule,
win_3_4(A):-win_2(A,B),win_2_1(B).

|: X has two more pairs than O

how do you want to express, win_2 (from previous: X can force two more pairs than O), in rule,
win_3_4(A):-win_2(A,B),win_2_1(B).

|: X can force two more pairs than O

how do you want to express, X can force two more pairs than O + X has two more pairs than O, according to rule,
win_3_4(A):-win_2(A,B),win_2_1(B).

|: X can force two more pairs than O

how do you want to express, win_3_4 (from previous: X can force two more pairs than O), in rule,
win_3_3(A):-zero_strong_of_X(A),win_3_4(A).

|: X can force two more pairs than O

how do you want to express, zero_strong_of_X (default: X has no pair), in rule,
win_3_3(A):-zero_strong_of_X(A),win_3_4(A).

|: X has no pair 

how do you want to express, X has no pair + X can force two more pairs than O, according to rule,
win_3_3(A):-zero_strong_of_X(A),win_3_4(A).

|: X has no pair + X can force two more pairs than O

how do you want to express, win_3_3 (from previous: X has no pair + X can force two more pairs than O), in rule,
win_3_2(A):-move(A,B),win_3_3(B).

|: X will be blocked by O + X can force two more pairs than O

how do you want to express, move (default: move), in rule,
win_3_2(A):-move(A,B),win_3_3(B).

|: O moves

how do you want to express, O moves + X will be blocked by O + X can force two more pairs than O, according to rule,
win_3_2(A):-move(A,B),win_3_3(B).

|: O moves + X will be blocked by O + X can force two more pairs than O

how do you want to express, win_3_2 (from previous: O moves + X will be blocked by O + X can force two more pairs than O), in rule,
win_3_1(A):-one_strong_of_X(A),win_3_2(A).

|: O moves + X will be blocked by O + X can force two more pairs than O

how do you want to express, one_strong_of_X (default: X has one pair), in rule,
win_3_1(A):-one_strong_of_X(A),win_3_2(A).

|: X has a pair

how do you want to express, X has a pair + O moves + X will be blocked by O + X can force two more pairs than O, according to rule,
win_3_1(A):-one_strong_of_X(A),win_3_2(A).

|: X has one pair + O moves + X will be blocked by O + X can force two more pairs than O

how do you want to express, win_3_1 (from previous: X has one pair + O moves + X will be blocked by O + X can force two more pairs than O), in rule,
win_3(A,B):-move(A,B),win_3_1(B).

|: X has one pair + O moves + X will be blocked by O + X can force two more pairs than O

how do you want to express, move (default: move), in rule,
win_3(A,B):-move(A,B),win_3_1(B).

|: X moves

how do you want to express, X moves + X has one pair + O moves + X will be blocked by O + X can force two more pairs than O, according to rule,
win_3(A,B):-move(A,B),win_3_1(B).

|: winning first move for X

winning first move for X = X moves + X has one pair + O moves + X will be blocked by O + X can force two more pairs than O
true .

```

## Author contact
For any question or query, please email **lun.ai15@imperial.ac.uk**.
The author will try to reply as soon as available.

## References

Ai, L. and Muggleton, S. H. and Hocquette, C. amd Gromowski, M. and Schmid, U. (2021). Beneficial and harmful explanatory machine
learning. Machine Learning, 110:695-721.

Muggleton, S. H. and Hocquette, C. (2019). Machine Discovery of Comprehensible Strategies for Simple Games Using Meta-
interpretive Learning. In: New Generation Computing 37.2, pp. 203–217.

Cropper, A. and Muggleton, S. H. (2019). Learning efficient logic programs. In: Machine Learning, 108:1063–1083.

Q-learning tic-tac-toe(accessed 14 April, 2019). url:https://gist.github.com/fheisler/430e70fa249ba30e707f.

Solving  tic-tac-toe  using  deep  reinforcement  learning.(accessed 14 April, 2019).url:https://github.com/yanji84/tic-tac-toe-rl.