---
title: Physics-informed neural networks
crumb: sciml-for-physics/methods/physics-informed-neural-networks
date: 2026-10-22
type: method
description: A network of the coordinates trained on the residual of the equations, with the equations, boundary data and initial state as the whole supervision.
needs:
  N: explicit
  lam: fixed
  f: fixed
  u: a snapshot
  H: full field
tasks: [u_ahead]
corpus: no training data
physics: physics in the loss
tags:
  - scientific-machine-learning
  - method-card
---

# Physics-informed neural networks
---
<div class="card-profile"></div>

A PINN represents the solution by a network of the coordinates and trains it on the residual of the equations, evaluated by automatic differentiation at sampled points. No solved data are needed; the equations, the boundary data and the initial state are the whole supervision. With a few observations and the coefficients left free, the same loss solves an inverse problem.

$$
\min_\theta\ \big\|\mathcal N[u_\theta;\lambda]-f\big\|^2_{\Omega\times(0,T]}+\beta_b\,\big\|\mathcal B[u_\theta]-b\big\|^2_{\partial\Omega}+\beta_0\,\big\|u_\theta(\cdot,0)-u_0\big\|^2
$$

$u_\theta$ is the network, $\theta$ its weights, the norms are Monte Carlo sums over collocation points in the interior, on the boundary and at $t=0$, and $\beta_b$, $\beta_0$ weight the terms. The method requires the operator explicitly, with its coefficients and forcing, and the initial state. Its difficulty is the conditioning of the residual, not a lack of data.

<dl class="card-gmf">
  <dt>Data</dt><dd>Collocation points, resampled; no solutions.</dd>
  <dt>Model</dt><dd>An MLP on $(x,t)$ with smooth activations; hard constraints can build in boundary conditions.</dd>
  <dt>Optimization</dt><dd>Adam then L-BFGS; second-order or curvature-aware methods for stiff problems.</dd>
</dl>

<p class="card-physics"><span>Where the physics enters</span> The loss, as the residual; the model, when constraints are built in.</p>

## Nearby methods
---
<div class="card-nearby"></div>

## Problems addressed
---
<div class="card-cross"></div>

## Reading
---
- [Raissi, Perdikaris, Karniadakis (2019), PINNs, J. Comput. Phys.](https://arxiv.org/abs/1711.10561)
- [Krishnapriyan et al. (2021), characterizing possible failure modes of PINNs, NeurIPS](https://arxiv.org/abs/2109.01050)
- [Rathore et al. (2024), challenges in training PINNs: a loss landscape perspective, ICML](https://arxiv.org/abs/2402.01868)

<script type="module" src="/sciml-for-physics/card-page.js"></script>
