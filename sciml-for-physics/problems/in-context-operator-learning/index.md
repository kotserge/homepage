---
title: 'In-Context Operator Learning'
crumb: sciml-for-physics/problems/in-context-operator-learning
date: 2026-10-22
type: problem
description: "In-context operator learning is the prediction of the output of an unseen operator from a few demonstrations of it, without updating the model's weights."
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

# In-Context Operator Learning
---
<div class="card-profile"></div>

In-context operator learning aims, similar as in [foundational emulators](/sciml-for-physics/problems/foundation-emulators), to ==generalize across many system's dynamics==, allowing for predictions of the behavior of a new operator the model has not seen, ==from just a few demonstration of it==. However, in contrast to foundational emulators, given these demonstrations of the new operator, such model predicts this without the need for re-calibration. More formally, one seeks

$$
\mathcal G^\star=\arg\min_{\mathcal G}\ \mathbb E\,\big\|\mathcal G(a\mid C)-u(a)\big\|^2,\qquad C=\lbrace(a_j,u_j)\rbrace_{j=1}^{k},
$$

where $\mathcal G(a\mid C)$ is the output of the model for the input $a$ given the context $C$, a set of $k$ input–output pairs from the same operator, and $u(a)$ the true output. At query time, only $C$ and $a$ are given and the operator as well as its coefficients have to be inferred from these demonstrations.

## Nearby problems
---

**[Foundation Emulators](/sciml-for-physics/problems/foundation-emulators/).** Instead of conditioning on demonstrations of the new operator, i.e., multiple examples of the system, foundational emulators condition on a window of the new system's states instead.

## Methods possible
---

No methods on the map yet.

## Reading
---

[\0]: Yang, L., Liu, S., Meng, T., & Osher, S. J. (2023). In-context operator learning with data prompts for differential equation problems. _Proceedings of the National Academy of Sciences_, 120(39), e2310142120. [https://doi.org/10.1073/pnas.2310142120](https://doi.org/10.1073/pnas.2310142120)

[\1]: Liu, Y., Zhang, Z., & Schaeffer, H. (2023). PROSE: Predicting operators and symbolic expressions using multimodal transformers. _arXiv preprint_. [https://arxiv.org/abs/2309.16816](https://arxiv.org/abs/2309.16816)

[\2]: Serrano, L., Kassaï Koupaï, A., Wang, T. X., Erbacher, P., & Gallinari, P. (2024). Zebra: In-context generative pretraining for solving parametric PDEs. _arXiv preprint_. [https://arxiv.org/abs/2410.03437](https://arxiv.org/abs/2410.03437)
