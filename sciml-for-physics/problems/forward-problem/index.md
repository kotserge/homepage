---
title: Forward Problem
crumb: sciml-for-physics/problems/forward-problem
date: 2026-10-22
type: problem
description: The computation of the solution of one fully specified system.
needs:
  N: explicit
  lambda: fixed
  f: fixed
  u: a snapshot
  H: full field
tasks: [u_ahead]
scope: one instance
answer: point
tags:
  - scientific-machine-learning
  - problem-definition
---

# Forward Problem
---
<div class="card-profile"></div>

The forward problem captures the space of ==computing the solution== of one ==fully specified system==. Under this setting, everything that defines the system is known (i.e., the operator and its coefficients, the external forces acting on the system), and the only unknown is the state itself. This is the problem every classical solver targets, and the one a neural network can be trained on without any data (e.g., the classical [PINN](/sciml-for-physics/methods/physics-informed-neural-networks) setting).

$$
\begin{aligned}
\mathcal N[u;\lambda] &= f   && \text{in } \Omega\times(0,T],\\
\mathcal B[u]         &= b   && \text{on } \partial\Omega\times(0,T],\\
u(\cdot,0)            &= u_0 && \text{in } \Omega,
\end{aligned}
$$

$u$ is the state on the domain $\Omega$ over $(0,T]$, $\mathcal N$ the operator with coefficients $\lambda$, $f$ the forcing, $\mathcal B$ the boundary operator with data $b$, and $u_0$ the initial state. An important distinction from a more general solution is that here we seek the state for this one instance.

## Nearby problems
---

**[Inverse Problem](/sciml-for-physics/problems/forward-problem/).** The inverse problem trades the knowledge of the coefficient for some knowledge about the trajectory of this instance and ask what coefficients of the system produced this.

## Methods possible
---

**[Classical Discretization Methods](/sciml-for-physics/methods/classical-discretization-methods/).** This is the classical problem domain for numerical methods, where the solution for a fully known system is needed to be simulated.

**[Physics-Informed Neural Networks](/sciml-for-physics/methods/physics-informed-neural-networks/).** Neural Networks aim to learn the solution of the instance, guided by the physics-informed residuals.   


## Reading
---
[\0]: Raissi, M., Perdikaris, P., & Karniadakis, G. E. (2019). Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. _Journal of Computational Physics_, 378, 686–707. [https://doi.org/10.1016/j.jcp.2018.10.045](https://doi.org/10.1016/j.jcp.2018.10.045)

[\1]: E, W., & Yu, B. (2018). The Deep Ritz method: A deep learning-based numerical algorithm for solving variational problems. _Communications in Mathematics and Statistics_. [https://arxiv.org/abs/1710.00211](https://arxiv.org/abs/1710.00211)

[\2]: Krishnapriyan, A. S., Gholami, A., Zhe, S., Kirby, R. M., & Mahoney, M. W. (2021). Characterizing possible failure modes in physics-informed neural networks. _NeurIPS_. [https://arxiv.org/abs/2109.01050](https://arxiv.org/abs/2109.01050)

[\3]: Rathore, P., Lei, W., Frangella, Z., Lu, L., & Udell, M. (2024). Challenges in training PINNs: A loss landscape perspective. _ICML_. [https://arxiv.org/abs/2402.01868](https://arxiv.org/abs/2402.01868)
