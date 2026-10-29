---
title: 'Emulation & Time Stepping'
crumb: sciml-for-physics/problems/emulation-and-time-stepping
date: 2026-10-26
type: problem
description: 'Emulation and time stepping is the advancement of the state of one system in time.'
needs:
  N: not needed
  lambda: not needed
  f: not needed
  u: a snapshot
  H: full field
tasks: [u_ahead]
scope: one system
answer: both
tags:
  - scientific-machine-learning
  - problem-definition
---

# Emulation & Time Stepping
---
<div class="card-profile"></div>

In emulation and time stepping, the target is to learn a surrogate from trajectories that is able to ==advance the state of a system in time==. In contrast to the classical [forward problem](/sciml-for-physics/problems/forward-problem), where the system is fully specified, here that information is only implicit in the data: from solved trajectories alone we learn a time-stepper that ==maps the current state to the next one==. More formally, we seek

$$
\Phi^\star=\arg\min_{\Phi} \;\mathbb E_{u_{t:t+m}}\sum_{j=1}^{m}\big\|\Phi^{j}(u_t)-u_{t+j}\big\|^2 ,
$$

where $\Phi$ is a one-step map, $\Phi^{j}=\Phi\circ\cdots\circ\Phi$ its $j$-fold composition (a rollout over $j$ steps), and the expectation runs over trajectory segments $u_{t:t+m}$ of a single system with $\lambda$, $f$ and $b$ fixed. Importantly, the rollout over the horizon $m$ is part of the objective, since most applications require stability over many steps (compare to [classical discretization methods](/sciml-for-physics/methods/classical-discretization-methods/)). For chaotic systems in particular, a pointwise error over long horizons rewards blurring towards the mean, so the statistics of the rollout (e.g., invariant measure, spectra) become the target instead.

## Nearby problems
---

**[Forward Problem](/sciml-for-physics/problems/forward-problem/).** In contrast to learning an emulator from data, one has full knowledge and learns the solution to the fixed instance of a problem.

**[Parametric Emulation](/sciml-for-physics/problems/parametric-emulation/).** The generalization of this problem towards a family of systems, where the coefficients of the operator varies across trajectories.

**[Foundation Emulators](/sciml-for-physics/problems/foundation-emulators/).** The generalization of this problem towards learning a stepper over many dynamics/systems instead of a single fixed system.

**[Dynamics from Partial Observations](/sciml-for-physics/problems/dynamics-from-partial-observations/).** Learns the same one-step map, but from sparse, noisy observations instead of full trajectories.

## Methods possible
---

No methods on the map yet.

## Reading
---

[\0]: Sanchez-Gonzalez, A., Godwin, J., Pfaff, T., Ying, R., Leskovec, J., & Battaglia, P. W. (2020). Learning to simulate complex physics with graph networks. _ICML_. [https://arxiv.org/abs/2002.09405](https://arxiv.org/abs/2002.09405)

[\1]: Pfaff, T., Fortunato, M., Sanchez-Gonzalez, A., & Battaglia, P. W. (2021). Learning mesh-based simulation with graph networks. _ICLR_. [https://arxiv.org/abs/2010.03409](https://arxiv.org/abs/2010.03409)

[\2]: Lippe, P., Veeling, B. S., Perdikaris, P., Turner, R. E., & Brandstetter, J. (2023). PDE-Refiner: Achieving accurate long rollouts with neural PDE solvers. _NeurIPS_. [https://arxiv.org/abs/2308.05732](https://arxiv.org/abs/2308.05732)

[\3]: Koehler, F., Niedermayr, S., Westermann, R., & Thuerey, N. (2024). APEBench: A benchmark for autoregressive neural emulators of PDEs. _NeurIPS Datasets and Benchmarks_. [https://arxiv.org/abs/2411.00180](https://arxiv.org/abs/2411.00180)
