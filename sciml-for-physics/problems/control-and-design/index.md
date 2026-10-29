---
title: 'Control & Design'
crumb: sciml-for-physics/problems/control-and-design
date: 2026-10-26
type: problem
description: 'Control and design is the choice of the inputs of a known system so that its response optimizes an objective.'
needs:
  N: explicit
  lambda: fixed
  f: not needed
  u: a snapshot
  H: full field
tasks: [choose]
scope: one instance
answer: point
tags:
  - scientific-machine-learning
  - problem-definition
---

# Control & Design
---
<div class="card-profile"></div>

In control and design, we ==choose the inputs of a known system== (e.g., distributed control, boundary data, coefficients, or the domain shape) ==such that its response is as “good” as possible==, meaning it minimizes a cost $J$ that encodes the corresponding goal. This goal might represent an airfoil design with less drag or a field that keeps a plasma confined. Classically, this requires experts predicting a sufficient candidate and expensive trials (e.g., simulations or experiments). More formally, we seek

$$
c^\star=\arg\min_{c\in\mathcal C}\ J(u,c)\qquad\text{s.t.}\qquad \mathcal N[u;\lambda]=f(c),\quad \mathcal B[u]=b(c),\quad u(\cdot,0)=u_0,
$$

where $c$ is the input, $J$ the objective, $\mathcal C$ the admissible set, and $f(c)$ and $b(c)$ the forcing and boundary data determined by the input. Since the state follows from the input, this is equivalent to minimizing the reduced objective $\hat J(c)=J\big(u(c),c\big)$ over $c$ alone, with $c\mapsto u(c)$ as the forward map. However, if this map is a surrogate instead of an exact solver, the optimization process might run into the surrogate-exploitation problem.

## Nearby problems
---

**[Inverse Problem](/sciml-for-physics/problems/inverse-problem/).** While the Inverse Problem seeks a parameter $\lambda$ which explains the observations, there is no true $c$ to recover, only one to fit $J$ better. The question is therefore not identifiability, but constraints and robustness under uncertainty.

**[Policy Learning](/sciml-for-physics/problems/policy-learning/).** The same task in closed loop, with $\mathcal N$ reduced to a black-box environment and the full state replaced by sensor readings; a reward replaces the adjoint.

## Methods possible
---

**[Physics-Informed Neural Networks](/sciml-for-physics/methods/physics-informed-neural-networks/).** The state $u_\theta$ and the input $c$ become jointly trainable, with the governing equations as a penalty or a hard constraint, similar to how we can jointly train $u_\theta$ with the parameter $\lambda$ for identifying the coefficient of the [inverse problem](/sciml-for-physics/problems/inverse-problem/).

## Reading
---

[\0]: Hinze, M., Pinnau, R., Ulbrich, M., & Ulbrich, S. (2009). _Optimization with PDE constraints_. Springer. [https://doi.org/10.1007/978-1-4020-8839-1](https://doi.org/10.1007/978-1-4020-8839-1)

[\1]: Holl, P., Koltun, V., & Thuerey, N. (2020). Learning to control PDEs with differentiable physics. _ICLR_. [https://arxiv.org/abs/2001.07457](https://arxiv.org/abs/2001.07457)

[\2]: Lu, L., Pestourie, R., Yao, W., Wang, Z., Verdugo, F., & Johnson, S. G. (2021). Physics-informed neural networks with hard constraints for inverse design. _SIAM Journal on Scientific Computing_, 43(6), B1105–B1132. [https://arxiv.org/abs/2102.04626](https://arxiv.org/abs/2102.04626)
