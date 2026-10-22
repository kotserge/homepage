---
title: In-context operator learning
crumb: sciml-for-physics/problems/in-context-operator-learning
date: 2026-10-22
type: problem
description: Predicting the output of an unseen operator from a few demonstrations of it, without updating the model's weights.
needs:
  N: not needed
  lam: not needed
  f: not needed
  u: a window
  H: full field
tasks: [u_ahead]
corpus: many families
answer: point
tags:
  - scientific-machine-learning
  - problem-card
---

# In-context operator learning
---
<div class="card-profile"></div>

In-context operator learning is the prediction of the behaviour of an operator the model has never seen, from a few examples of it. Given demonstrations of the new operator and a new input, one pretrained model returns the output without updating its weights.

$$
\mathcal G^\star=\arg\min_{\mathcal G}\ \mathbb E\,\big\|\mathcal G(a\mid C)-u(a)\big\|^2,\qquad C=\{(a_j,u_j)\}_{j=1}^{k}
$$

$\mathcal G(a\mid C)$ is the output of the model for the input $a$ given the context $C$, a set of $k$ input–output pairs from the same new operator, and $u(a)$ the true output. Given are prompts of demonstrations per operator, from many families; at query time $C$ and $a$. Missing are the operator and its coefficients, inferred from the demonstrations. Sought is $u(a)$.

## Nearby problems
---
<div class="card-nearby"></div>

## Methods possible
---
<div class="card-cross"></div>

## Reading
---
- [Yang, Liu, Meng, Osher (2023), ICON, PNAS](https://arxiv.org/abs/2304.07993)
- [Liu et al. (2023), PROSE](https://arxiv.org/abs/2309.16816)
- [Serrano et al. (2025), Zebra](https://arxiv.org/abs/2410.03437)

<script type="module" src="/sciml-for-physics/card-page.js"></script>
