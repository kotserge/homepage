---
title: 'Reduced-Order Modeling'
crumb: sciml-for-physics/problems/reduced-order-modeling
date: 2026-10-26
type: problem
description: 'Reduced-order modeling is the replacement of a large discretised system by a small one that is cheap to evolve.'
needs:
  N: simulator
  lambda: per instance
  f: fixed
  u: a snapshot
  H: full field
tasks: [u_ahead]
scope: one family
answer: point
tags:
  - scientific-machine-learning
  - problem-definition
---

# Reduced-Order Modeling
---
<div class="card-profile"></div>

In reduced-order modeling, we ==replace a large discretized system by a low-dimensional latent representation== in which the solution can be simulated cheaply. It thereby approximates the same parameter-to-solution map as [operator learning](/sciml-for-physics/problems/parametric-operator-learning), but through a compressed state rather than directly.

More formally, let $u(t;\lambda)\in\mathbb R^{N_h}$ be the full discretized state for parameters $\lambda$, drawn from a measure $\mu$ on the parameter range $\Lambda\subset\mathbb R^p$ of interest. We seek a decoder $D:\mathbb R^r\to\mathbb R^{N_h}$, an encoder $E:\mathbb R^{N_h}\to\mathbb R^r$ and reduced dynamics $g$ such that

$$
\min_{D,E,g}\ \mathbb E_{\lambda\sim\mu}\int_0^T \big\lVert u(t;\lambda)-D\big(z(t;\lambda)\big) \big\rVert^2 \, dt
\quad\text{s.t.}\quad \dot z=g(z;\lambda),\quad z(0)=E\big(u(0;\lambda)\big),
$$

with $z\in\mathbb R^{r}$ and $r\ll N_h$. The initial state is encoded once, $z$ is integrated entirely in the latent space, and the full state is decoded only when needed. Classically, $D(z)=Vz$ and $E(u)=V^\top u$ with an orthonormal basis $V\in\mathbb R^{N_h\times r}$ obtained by POD from snapshots, and $g$ follows by projecting the full-order dynamics $\dot u=F(u;\lambda)$, i.e., $g(z;\lambda)=V^\top F(Vz;\lambda)$. Alternatively, machine-learning techniques such as autoencoders can learn a nonlinear low-dimensional representation, with $g$ fitted to the projected snapshots.

## Nearby problems
---

**[Parametric operator learning](/sciml-for-physics/problems/parametric-operator-learning).** Approximates the same parameter-to-solution map, but end-to-end, i.e., the input is mapped directly to the solution, without a latent state.

## Methods possible
---

No methods on the map yet.

## Reading
---
[\0]: Benner, P., Gugercin, S., & Willcox, K. (2015). A survey of projection-based model reduction methods for parametric dynamical systems. _SIAM Review_, 57(4), 483–531. [https://doi.org/10.1137/130932715](https://doi.org/10.1137/130932715)

[\1]: Peherstorfer, B., & Willcox, K. (2016). Data-driven operator inference for nonintrusive projection-based model reduction. _Computer Methods in Applied Mechanics and Engineering_, 306, 196–215. [https://doi.org/10.1016/j.cma.2016.03.025](https://doi.org/10.1016/j.cma.2016.03.025)

[\2]: Lee, K., & Carlberg, K. T. (2020). Model reduction of dynamical systems on nonlinear manifolds using deep convolutional autoencoders. _Journal of Computational Physics_, 404, 108973. [https://doi.org/10.1016/j.jcp.2019.108973](https://doi.org/10.1016/j.jcp.2019.108973)
