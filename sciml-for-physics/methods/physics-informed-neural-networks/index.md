---
title: Physics-Informed Neural Networks
crumb: sciml-for-physics/methods/physics-informed-neural-networks
date: 2026-10-22
type: method
description: A supervisory signal for models based on the physics residuals.
needs:
  N: explicit
  lambda: fixed
  f: fixed
  u: a snapshot
  H: full field
tasks: [u_ahead]
scope: one instance
component: loss
physics: in the loss
tags:
  - scientific-machine-learning
  - methodology
---

# Physics-Informed Neural Networks
---
<div class="card-profile"></div>

Physics-Informed'ness in training models acts as a supervisory signal for these models, based on the physics residuals of the predicted solution with respect to the underlying equation, boundary data, and initial state:

$$
\min_\theta\ \big\|\mathcal N[u_\theta;\lambda]-f\big\|^2_{\Omega\times(0,T]}+\beta_b \big\|\mathcal B[u_\theta]-b\big\|^2_{\partial\Omega}+\beta_0 \big\|u_\theta(\cdot,0)-u_0\big\|^2,
$$

on the domain $\Omega$ over $(0,T]$, $\mathcal N$ the operator with coefficients $\lambda$, $f$ the forcing, $\mathcal B$ the boundary operator with data $b$, and $u_0$ the initial state. While $u_\theta$ is the network learning the solution, the key point is that the definition of physics-informed'ness is independent of the choice of $u$, but it enforces the governing dynamics on the model choice through the loss definition.


## Nearby methods
---

**[Classical Discretization Methods](/sciml-for-physics/methods/classical-discretization-methods/).** In Physics-Informed Neural Networks, the learned solver’s correctness is enforced via the governing equations, whereas in a classical view, the solver enforces the physical constraints.

**[Physics-Informed Operator Learning](/sciml-for-physics/methods/physics-informed-operator-learning/).** Because physics-informedness is a supervisory signal, it can be extended to enforce correctness over a family of coefficients and forcings rather than a single fixed instance, allowing the training of so-called Neural Operators.

## Problems addressed
---

**[Forward Problem](/sciml-for-physics/problems/forward-problem/).** The Physics-Informed signal in combination with a neural network for point prediction is historically the classical approach on solving the forward problem by neural networds. It gives everything the method needs.

**[Inverse Problem](/sciml-for-physics/problems/inverse-problem/)** Next to the network, one can learn the coefficient of the system while learning the solution $u$. However, this requires data of the instance in question, else the probelm becomes ill-defined.

## Reading
---
[\0]: Raissi, M., Perdikaris, P., & Karniadakis, G. E. (2019). Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. _Journal of Computational Physics_, 378, 686–707. [https://doi.org/10.1016/j.jcp.2018.10.045](https://doi.org/10.1016/j.jcp.2018.10.045)

[\1]: Krishnapriyan, A. S., Gholami, A., Zhe, S., Kirby, R. M., & Mahoney, M. W. (2021). Characterizing possible failure modes in physics-informed neural networks. _NeurIPS_. [https://arxiv.org/abs/2109.01050](https://arxiv.org/abs/2109.01050)

[\2]: Rathore, P., Lei, W., Frangella, Z., Lu, L., & Udell, M. (2024). Challenges in training PINNs: A loss landscape perspective. _ICML_. [https://arxiv.org/abs/2402.01868](https://arxiv.org/abs/2402.01868)
