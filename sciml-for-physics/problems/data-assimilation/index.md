---
title: 'Data Assimilation'
crumb: sciml-for-physics/problems/data-assimilation
date: 2026-10-26
type: problem
description: 'Data assimilation is the estimation of the state of a system seen only through sparse, noisy observations, using a known model of its dynamics.'
needs:
  N: explicit
  lambda: fixed
  f: fixed
  u: a window
  H: sparse points
tasks: [u_now]
scope: one instance
answer: both
tags:
  - scientific-machine-learning
  - problem-definition
---


# Data Assimilation
---

<div class="card-profile"></div>

Data assimilation ==estimates a system's state at the start of a window from sparse, noisy observations==, using a known model of its dynamics. Under an observational model $y_t=\mathcal H(u_t)+\varepsilon_t$ with $\varepsilon_t\sim\mathsf N(0,\Gamma)$, we seek the posterior

$$
p(u_{0}\mid y_{1:T})\ \propto\ p(u_0)\prod_{t=1}^{T}p\big(y_t\mid u_t\big),\qquad u_t=\mathcal M_t(u_0),
$$

with prior $p(u_0)$, $\mathcal M_t$ the model that carries the state forward to time $t$, and $y_t$ the observations under $\mathcal H$. The targeted unknown is the state $u_0$ at the start of an assimilation window, and we estimate it from the observations in that window and a prior, so the trajectory it generates is consistent with both. Since the trajectory follows from this initial state, observations in the window constrain it, allowing us to determine the full field from these sparse observations.

## Nearby problems
---

**[Inverse Problem](/sciml-for-physics/problems/inverse-problem/).** While the Inverse Problem starts from the same observational model, it seeks the coefficients $\lambda$ that explain the observations, whereas here $\lambda$ is known and the state $u_0$ is sought.

**[Dynamics from Partial Observations](/sciml-for-physics/problems/dynamics-from-partial-observations/).** The model $\mathcal M$ becomes an additional unknown alongside the (initial window) state. The windowed observations then have to constrain both the state and the dynamics.

**[Super-Resolution & Downscaling](/sciml-for-physics/problems/super-resolution-and-downscaling/).** In super-resolution the observational model becomes a coarse view on the problem with just one observation, from which the original state explaining this observation is sought.

## Methods possible
---

No methods on the map yet.

## Reading
---

[\0]: Asch, M., Bocquet, M., & Nodet, M. (2016). _Data assimilation: Methods, algorithms, and applications_. SIAM. [https://doi.org/10.1137/1.9781611974546](https://doi.org/10.1137/1.9781611974546)

[\1]: Rozet, F., & Louppe, G. (2023). Score-based data assimilation. _NeurIPS_. [https://arxiv.org/abs/2306.10574](https://arxiv.org/abs/2306.10574)

[\2]: Hodyss, D., & Morzfeld, M. (2025). Using diffusion models to do data assimilation. _arXiv preprint_. [https://arxiv.org/abs/2506.02249](https://arxiv.org/abs/2506.02249)

[\3]: Raissi, M., Yazdani, A., & Karniadakis, G. E. (2020). Hidden fluid mechanics: Learning velocity and pressure fields from flow visualizations. _Science_, 367(6481), 1026–1030. [https://doi.org/10.1126/science.aaw4741](https://doi.org/10.1126/science.aaw4741)
