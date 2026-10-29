---
title: 'Parametric Emulation'
crumb: sciml-for-physics/problems/parametric-emulation
date: 2026-10-28
type: problem
description: 'Parametric emulation is the advancement of the state of a family of systems in time.'
needs:
  N: not needed
  lambda: per instance
  f: per instance
  u: a window
  H: full field
tasks: [u_ahead]
scope: one family
answer: point
tags:
  - scientific-machine-learning
  - problem-definition
---

# Parametric Emulation
---
<div class="card-profile"></div>

In parametric emulation, a surrogate is learned for a family of systems, which can ==advance the state of any instance of the family in time==. In comparison to [emulation & time stepping](/sciml-for-physics/problems/emulation-and-time-stepping/), where the coefficients are fixed and implicit in the data, they now vary across trajectories. Hence, we seek

$$
\Phi^\star=\arg\min_{\Phi}\ \mathbb E_{\lambda\sim\mu} \mathbb E\ \sum_{j=1}^{m}\big\|\Phi^{j}(u_t)-u_{t+j}\big\|^2 ,
$$

where $\Phi$ is the time-stepper, $\mu$ the measure on the parameter range of interest, $u_t, \dots, u_{t+m}$ consecutive states of a trajectory with coefficients $\lambda$, and $\Phi^{j}$ the $j$-fold rollout with $\lambda$ held fixed. Depending on what information is available about the parameters of the system, $\Phi$ needs to implicitly identify these from either a given history window $u_{t:t-k}$ or could be explicitly conditioned on $\lambda$ and possibly the he forcing $f$ or the boundary data $b$. However, an indentification from a history window requires that these parameters are actually identifiable from $k$ steps. Slow or weakly observable parameters may require long windows, and parameters that do not affect the observed dynamics at all cannot be recovered.

## Nearby problems
---

**[Emulation & Time Stepping](/sciml-for-physics/problems/emulation-and-time-stepping/).** The special case of a single member of the family, where $\lambda$ is fixed.

**[Parametric Operator Learning](/sciml-for-physics/problems/parametric-operator-learning/).** Learns the map from the same kind of input to the solution in one shot, rather than as a step that is rolled out over a horizon.

**[Foundation Emulators](/sciml-for-physics/problems/foundation-emulators/).** Drops $\lambda$ from the input and widens the family to many, so that the coefficients have to be inferred from a window of states instead of being given.

## Methods possible
---

No methods on the map yet.

## Reading
---

[\0]: Brandstetter, J., Worrall, D., & Welling, M. (2022). Message passing neural PDE solvers. _ICLR_. [https://arxiv.org/abs/2202.03376](https://arxiv.org/abs/2202.03376)

[\1]: Gupta, J. K., & Brandstetter, J. (2022). Towards multi-spatiotemporal-scale generalized PDE modeling. _arXiv preprint_. [https://arxiv.org/abs/2209.15616](https://arxiv.org/abs/2209.15616)

[\2]: Takamoto, M., Praditia, T., Leiteritz, R., MacKinlay, D., Alesiani, F., Pflüger, D., & Niepert, M. (2022). PDEBench: An extensive benchmark for scientific machine learning. _NeurIPS Datasets and Benchmarks_. [https://arxiv.org/abs/2210.07182](https://arxiv.org/abs/2210.07182)
