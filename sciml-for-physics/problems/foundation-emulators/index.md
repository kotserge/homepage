---
title: 'Foundation Emulators'
crumb: sciml-for-physics/problems/foundation-emulators
date: 2026-10-22
type: problem
description: 'Foundation emulators forecast an unseen system from a short window of its states, using a model pretrained across many systems.'
needs:
  N: not needed
  lambda: not needed
  f: not needed
  u: a window
  H: full field
tasks: [u_ahead]
scope: many families
answer: point
tags:
  - scientific-machine-learning
  - problem-definition
---

# Foundation Emulators
---
<div class="card-profile"></div>

Foundation emulators seek to ==generalize across many systems and their dynamics== (i.e., over  $\mathcal N$, $\lambda$, $f$, …) to allow for ==predictions in unobserved systems== and in new families of systems. Given a short window of states of a new target system, such emulators infer its dynamics (implicitly $\mathcal N$, $\lambda$, $f$, …) and predict the subsequent states, in either zero-shot (i.e., direct application) settings or by further adapting it to the new problem space (e.g., via fine-tuning). More formally, we seek

$$\Phi^\star=\arg\min_\Phi\ \mathbb E_{s\sim w}\,\mathbb E_{u\sim\mu_s}\,\mathbb E_{t}\,\big\|\Phi(u_{t-k:t})-u_{t+1:t+m}\big\|^2 ,$$

where $\Phi$ is the emulator, $s$ a family drawn from the pretraining mixture with weights $w$, $\mu_s$ its distribution of trajectories (over many $\mathcal N$, $\lambda$, $f$, initial conditions, …), $t$ a window position along the trajectory, $u_{t-k:t}$ the window of $k+1$ states the model conditions on, and $u_{t+1:t+m}$ the states to predict. In practice, $\Phi$ is often trained with $m=1$ and applied autoregressively to roll out longer horizons. However, similar to [emulation & time stepping](/sciml-for-physics/problems/emulation-and-time-stepping/) and [parametric emulation](/sciml-for-physics/problems/parametric-emulation/), the leading window must be large enough to infer the dynamics of the system in question.

## Nearby problems
---

**[In-Context Operator Learning](/sciml-for-physics/problems/in-context-operator-learning/).** Instead of conditioning on the leading window, in-context operator learning conditions on demonstrations of the new operator, i.e., multiple examples of the system.

**[Parametric Emulation](/sciml-for-physics/problems/parametric-emulation/).** The special case, where an emulator is searched for exactly one family.

**[Emulation & Time Stepping](/sciml-for-physics/problems/emulation-and-time-stepping/).** The same task for one specific system.

## Methods possible
---

No methods on the map yet.

## Reading
---

[\0]: McCabe, M., Régaldo-Saint Blancard, B., Parker, L., Ohana, R., Cranmer, M., Bietti, A., Eickenberg, M., Golkar, S., Krawezik, G., Lanusse, F., Pettee, M., Tesileanu, T., Cho, K., & Ho, S. (2024). Multiple physics pretraining for spatiotemporal surrogate models. _NeurIPS_. [https://arxiv.org/abs/2310.02994](https://arxiv.org/abs/2310.02994)

[\1]: Herde, M., Raonić, B., Rohner, T., Käppeli, R., Molinaro, R., de Bézenac, E., & Mishra, S. (2024). Poseidon: Efficient foundation models for PDEs. _NeurIPS_. [https://arxiv.org/abs/2405.19101](https://arxiv.org/abs/2405.19101)

[\2]: Chu, M., Liu, Y., Biswas, A., & Shen, H.-W. (2026). Do physics foundation models learn generalizable physics? A bias-aware benchmark across physical regimes and distribution shifts. _arXiv preprint_. [https://arxiv.org/abs/2605.29283](https://arxiv.org/abs/2605.29283)

[\3]: Kotchourko, S., Totounferoush, A., Mahoney, M. W., & Staab, S. (2026). Residuals are not enough: Limits of physics-informed pre-training for scientific foundation models. _Discovery Science_. [https://arxiv.org/abs/2503.19081](https://arxiv.org/abs/2503.19081)
