---
title: 'Super-Resolution & Downscaling'
crumb: sciml-for-physics/problems/super-resolution-and-downscaling
date: 2026-10-26
type: problem
description: 'Super-resolution and downscaling is the recovery of the fine scales of a field from a coarse version of it.'
needs:
  N: not needed
  lambda: not needed
  f: not needed
  u: a snapshot
  H: coarse grid
tasks: [u_now]
scope: one system
answer: both
tags:
  - scientific-machine-learning
  - problem-definition
---


# Super-Resolution & Downscaling
---
<div class="card-profile"></div>

Super-resolution and downscaling concerns the ==recovery of the small-scale dynamics from a coarse view of a field==. Hence, one cares to learn a map or a conditional distribution from pairs of coarse and fine fields, to add these fine-scales consistent with the coarse view. More formally, let $\mathcal H(u)$ be the coarse field produced by a degradation $\mathcal H$ of the fine field $u$. Hence, we seek to estimate

$$
\mathcal S^\star=\arg\min_{\mathcal S}\ \mathbb E_{(\mathcal H(u),u)}\,\big\|\mathcal S(\mathcal H(u))-u\big\|^2 ,
$$

where $\mathcal S$ is the map back to the fine field. Since the preimage $\lbrace u:\mathcal H(u)\rbrace$ is large, the inverse is one-to-many, and the regressor above returns only the blurred mean $\mathbb E[u\mid \mathcal H(u)]$. The more faithful statement is therefore distributional,

$$
q^\star=\arg\min_{q}\ \mathbb E\big[-\log q(u\mid \mathcal H(u))\big],
$$

where $q$ approximates the conditional $p(u\mid \mathcal H(u))$ of fine fields consistent with one coarse field, and samples from it are sought rather than one field.

## Nearby problems
---

**[Closure & Hybrid Modeling](/sciml-for-physics/problems/closure-and-hybrid-modeling/).** Works with the same filtered field $\bar u$, but models the effect of the unresolved scales on its dynamics instead of reconstructing them.

## Methods possible
---

No methods on the map yet.

## Reading
---

[\0]: Fukami, K., Fukagata, K., & Taira, K. (2019). Super-resolution reconstruction of turbulent flows with machine learning. _Journal of Fluid Mechanics_, 870, 106–120. [https://arxiv.org/abs/1811.11328](https://arxiv.org/abs/1811.11328)

[\1]: Gao, H., Sun, L., & Wang, J.-X. (2021). Super-resolution and denoising of fluid flow using physics-informed convolutional neural networks without high-resolution labels. _Physics of Fluids_, 33(7), 073603. [https://doi.org/10.1063/5.0054312](https://doi.org/10.1063/5.0054312)

[\2]: Mardani, M., Brenowitz, N., Cohen, Y., Pathak, J., Chen, C.-Y., Liu, C.-C., Vahdat, A., Nabian, M. A., Ge, T., Subramaniam, A., Kashinath, K., Kautz, J., & Pritchard, M. (2023). Residual corrective diffusion modeling for km-scale atmospheric downscaling. _arXiv preprint_. [https://arxiv.org/abs/2309.15214](https://arxiv.org/abs/2309.15214)
