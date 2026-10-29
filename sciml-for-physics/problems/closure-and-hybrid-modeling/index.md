---
title: 'Closure & Hybrid Modeling'
crumb: sciml-for-physics/problems/closure-and-hybrid-modeling
date: 2026-10-26
type: problem
description: Closure and hybrid modeling is the completion of a solver that resolves only part of the physics.
needs:
  N: one term missing
  lambda: fixed
  f: fixed
  u: a snapshot
  H: coarse grid
tasks: [N, u_ahead]
scope: one family
answer: point
tags:
  - scientific-machine-learning
  - problem-definition
---

# Closure & Hybrid Modeling
---
<div class="card-profile"></div>

In closure & hybrid modeling, we ==search for surrogates that recover the effect of small-scale dynamics== that coarse solvers miss. Such fine-scale dynamics are quite common, yet resolving them directly by the solver would require meshes far beyond what is computationally feasible. Hence, we rely on coarse solvers, which evolve a filtered field $\bar u$ rather than the full field $u$ of $\mathcal N[u;\lambda]=f$. Filtering both sides gives $\overline{\mathcal N[u;\lambda]}=\bar f$, which is exact but not closed, since it requires the fine field $u$, while a coarse solver only stores $\bar u$ and can compute only $\mathcal N[\bar u;\lambda]$. We can, however, rewrite

$$\overline{\mathcal N[u;\lambda]} = \mathcal N[\bar u;\lambda] + \left(\overline{\mathcal N[u;\lambda]} - \mathcal N[\bar u;\lambda]\right) = \mathcal N[\bar u;\lambda] + \tau$$

so that $\tau = \overline{\mathcal N[u;\lambda]} - \mathcal N[\bar u;\lambda]$ is the commutation error between the filter and the nonlinear $\mathcal N$ — it is what must be added to the coarse side to make it exact. Dropping $\tau$ leaves an equation that is cheap to step but wrong. Instead, we learn $\tau$ from filtered high-resolution data so that the coarse solver tracks the resolved dynamics of new flows.

$$
\mathcal C^\star=\arg\min_{\mathcal C}\ \mathbb E \big\|\bar u_{t+1}-\bar{\mathcal M}_{\mathcal C}(\bar u_t)\big\|^2,\qquad \mathcal C\approx\tau
$$

$\bar u$ is the resolved state, $\bar{\mathcal M}_{\mathcal C}$ the coarse one-step map of the closed equation $\mathcal N[\bar u;\lambda]+\mathcal C(\bar u)=\bar f$, $\mathcal C$ the learned model of $\tau$, and the expectation runs over filtered high-resolution trajectories. $\mathcal C$ is judged in the loop rather than on $\tau$ alone.

## Nearby problems
---

No other problem on the map yet.

## Methods possible
---

No methods on the map yet.

## Reading
---
[\0]: Duraisamy, K., Iaccarino, G., & Xiao, H. (2019). Turbulence modeling in the age of data. _Annual Review of Fluid Mechanics_, 51, 357–377. [https://doi.org/10.1146/annurev-fluid-010518-040547](https://doi.org/10.1146/annurev-fluid-010518-040547)

[\1]: Kochkov, D., Smith, J. A., Alieva, A., Wang, Q., Brenner, M. P., & Hoyer, S. (2021). Machine learning–accelerated computational fluid dynamics. _Proceedings of the National Academy of Sciences_, 118(21), e2101784118. [https://doi.org/10.1073/pnas.2101784118](https://doi.org/10.1073/pnas.2101784118)

[\2]: Rackauckas, C., Ma, Y., Martensen, J., Warner, C., Zubov, K., Supekar, R., Skinner, D., Ramadhan, A., & Edelman, A. (2020). Universal differential equations for scientific machine learning. _arXiv preprint_. [https://arxiv.org/abs/2001.04385](https://arxiv.org/abs/2001.04385)

[\3]: Sanderse, B., Stinis, P., Maulik, R., & Ahmed, S. E. (2024). Scientific machine learning for closure models in multiscale problems: A review. _arXiv preprint_. [https://arxiv.org/abs/2403.02913](https://arxiv.org/abs/2403.02913)
