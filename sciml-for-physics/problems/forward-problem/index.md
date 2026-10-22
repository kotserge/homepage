---
title: Forward problem
crumb: sciml-for-physics/problems/forward-problem
date: 2026-10-22
type: problem
description: The computation of the solution of one fully specified system, where the only unknown is the state itself.
needs:
  N: explicit
  lam: fixed
  f: fixed
  u: a snapshot
  H: full field
tasks: [u_ahead]
corpus: no training data
answer: point
tags:
  - scientific-machine-learning
  - problem-card
---

# Forward problem
---
<div class="card-profile"></div>

The forward problem is the computation of the solution of one fully specified system. Everything that defines the system is known, so the only unknown is the state itself. It is the problem every classical solver was built for, and the one a neural network can be trained on without any data.

$$
\mathcal N[u;\lambda]=f \ \ \text{in}\ \Omega\times(0,T],\qquad \mathcal B[u]=b \ \ \text{on}\ \partial\Omega,\qquad u(\cdot,0)=u_0
$$

$u$ is the state on the domain $\Omega$ over $(0,T]$, $\mathcal N$ the operator with coefficients $\lambda$, $f$ the forcing, $\mathcal B$ the boundary operator with data $b$, and $u_0$ the initial state. All of them are given, the operator in explicit form; nothing is observed and nothing is missing. The state is sought for this one instance, not for a family.

## Nearby problems
---
<div class="card-nearby"></div>

## Methods possible
---
<div class="card-cross"></div>

## Reading
---
- [Raissi, Perdikaris, Karniadakis (2019), PINNs, J. Comput. Phys.](https://arxiv.org/abs/1711.10561)
- [E & Yu (2018), Deep Ritz, Commun. Math. Stat.](https://arxiv.org/abs/1710.00211)
- [Rathore et al. (2024), loss landscape of PINNs, ICML](https://arxiv.org/abs/2402.01868)
- [Chatain et al. (2025), numerical vs. neural PDE solvers](https://arxiv.org/abs/2507.21269)

<script type="module" src="/sciml-for-physics/card-page.js"></script>
