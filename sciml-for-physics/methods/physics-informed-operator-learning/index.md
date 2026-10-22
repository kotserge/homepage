---
title: Physics-informed operator learning
crumb: sciml-for-physics/methods/physics-informed-operator-learning
date: 2026-10-22
type: method
description: PI-DeepONet and PINO, which train an operator network on the residual over a family of inputs rather than on one instance.
needs:
  N: explicit
  lam: per instance
  f: per instance
  u: a snapshot
  H: full field
tasks: [u_ahead]
corpus: one family
physics: physics in the loss
tags:
  - scientific-machine-learning
  - method-card
---

# Physics-informed operator learning
---
<div class="card-profile"></div>

PI-DeepONet and PINO train an operator network on the residual over a family of inputs rather than on one instance. The equations hold for every input drawn from the family, so sampling inputs and enforcing the residual on each trains the solution map without any solved data; in PINO a few solutions can be mixed in.

$$
\min_\theta\ \mathbb E_{a\sim\mu}\Big[\big\|\mathcal N[\mathcal G_\theta(a);a]-f_a\big\|^2+\beta\,\big\|\mathcal B[\mathcal G_\theta(a)]-b_a\big\|^2\Big]
$$

$\mathcal G_\theta$ is the operator network, $a\sim\mu$ an input of the family (the varying coefficients, forcing or boundary data), and $f_a$, $b_a$ the forcing and boundary data of that input. The method requires the operator explicitly and the input distribution; derivatives of $\mathcal G_\theta(a)$ come from automatic differentiation or, in PINO, from Fourier differentiation on the grid.

<dl class="card-gmf">
  <dt>Data</dt><dd>Sampled inputs $a_i\sim\mu$; no solutions, or a few.</dd>
  <dt>Model</dt><dd>DeepONet or FNO; the residual is evaluated on the output.</dd>
  <dt>Optimization</dt><dd>Adam on the expected residual; instance-wise fine-tuning at test time in PINO.</dd>
</dl>

<p class="card-physics"><span>Where the physics enters</span> The loss, as the residual over the family.</p>

## Nearby methods
---
<div class="card-nearby"></div>

## Problems addressed
---
<div class="card-cross"></div>

## Reading
---
- [Wang, Wang, Perdikaris (2021), physics-informed DeepONets, Sci. Adv.](https://arxiv.org/abs/2103.10974)
- [Li et al. (2024), physics-informed neural operator, ACM/IMS J. Data Sci.](https://arxiv.org/abs/2111.03794)

<script type="module" src="/sciml-for-physics/card-page.js"></script>
