---
title: Physics-Informed Operator Learning
crumb: sciml-for-physics/methods/physics-informed-operator-learning
date: 2026-10-22
type: method
description: The generalization of the physics-informed loss signal towards many instances of a system.
needs:
  N: explicit
  lambda: per instance
  f: per instance
  u: a snapshot
  H: full field
tasks: [u_ahead]
scope: one family
component: loss
physics: in the loss
tags:
  - scientific-machine-learning
  - method-card
---

# Physics-Informed Operator Learning
---
<div class="card-profile"></div>

Similar to how a physics-aware loss can be used as a supervisory signal for training models for specific instances (e.g., [Physics-Informed Neural Networks](/sciml-for-physics/methods/physics-informed-neural-networks/)), we can generalize over the coefficients $\lambda$, forcing $f$, boundary data $b$ and initial state $u_0$, so that physics-informed'ness enters the training of an operator $\mathcal G_\theta$:

$$
\min_\theta\ \mathbb E_{a\sim\mu}\Big[\big\|\mathcal N[\mathcal G_\theta(a);\lambda_a]-f_a\big\|^2+\beta_b \big\|\mathcal B[\mathcal G_\theta(a)]-b_a\big\|^2+\beta_0 \big\|\mathcal G_\theta(a)(\cdot,0)-u_{0,a}\big\|^2\Big]
$$

where $a=(\lambda_a,f_a,b_a,u_{0,a})\sim\mu$ is an input of the family, i.e., the varying coefficients, forcing, boundary data and initial state drawn from a measure $\mu$ over the set of instances, and $\beta_b$, $\beta_0$ weight the boundary and initial terms as in the PINN loss.

## Nearby methods
---

**[Physics-Informed Neural Networks](/sciml-for-physics/methods/physics-informed-neural-networks/).** Physics-Residuals for training neural-networks for specific instances (i.e., fixed coefficients, forcing, boundary conditions) is then just a special case of this framework. 

## Problems addressed
---
No problem on the map yet.

## Reading
---
[\0]: Wang, S., Wang, H., & Perdikaris, P. (2021). Learning the solution operator of parametric partial differential equations with physics-informed DeepONets. _Science Advances_. [https://arxiv.org/abs/2103.10974](https://arxiv.org/abs/2103.10974)

[\1]: Li, Z., Zheng, H., Kovachki, N., Jin, D., Chen, H., Liu, B., Azizzadenesheli, K., & Anandkumar, A. (2024). Physics-informed neural operator for learning partial differential equations. _ACM/IMS Journal of Data Science_, 1(3), 1–27. [https://doi.org/10.1145/3648506](https://doi.org/10.1145/3648506)
