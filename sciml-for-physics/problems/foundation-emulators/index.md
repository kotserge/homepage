---
title: Foundation emulators
crumb: sciml-for-physics/problems/foundation-emulators
date: 2026-10-22
type: problem
description: Forecasting an unseen system with a model pretrained across many systems, given a short window of its states.
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

# Foundation emulators
---
<div class="card-profile"></div>

Foundation emulators are models pretrained across many systems that forecast an unseen one. Given a short window of the states of the new system, the model infers which system it is and how it behaves, and predicts the next states; fine-tuning adapts it further.

$$
\Phi^\star=\arg\min_\Phi\ \mathbb E_{s\sim w}\,\mathbb E_{u\sim\mu_s}\,\big\|\Phi(u_{t-k:t})-u_{t+1:t+m}\big\|^2
$$

$\Phi$ is the emulator, $s$ a family drawn with weight $w$ from the pretraining mixture, $\mu_s$ its distribution of trajectories, $u_{t-k:t}$ the window of $k+1$ states the model conditions on and $u_{t+1:t+m}$ the states to predict. Given are trajectories from many families, with coefficients and forcing varying and never recorded; at query time a window of an unseen system, sometimes with boundary masks. Missing is which system it is, its $\lambda$ and $f$, inferred from the window. Sought are the next states.

## Nearby problems
---
<div class="card-nearby"></div>

## Methods possible
---
<div class="card-cross"></div>

## Reading
---
- [McCabe et al. (2024), multiple physics pretraining, NeurIPS](https://arxiv.org/abs/2310.02994)
- [Herde et al. (2024), Poseidon, NeurIPS](https://arxiv.org/abs/2405.19101)
- [Chu et al. (2026), do physics foundation models generalize?](https://arxiv.org/abs/2605.29283)
- [Kotchourko et al. (2026), Residuals Are Not Enough, Discovery Science](https://arxiv.org/abs/2503.19081)

<script type="module" src="/sciml-for-physics/card-page.js"></script>
