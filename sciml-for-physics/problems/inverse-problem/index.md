---
title: Inverse Problem
crumb: sciml-for-physics/problems/inverse-problem
date: 2026-10-26
type: problem
description: The inverse problem is concerned with the recovery of the coefficients of a known equation from indirect, noisy observations of its solution.
needs:
  N: explicit
  lambda: prior only
  f: fixed
  u: a window
  H: sparse points
tasks: [lambda]
scope: one instance
answer: both
tags:
  - scientific-machine-learning
  - problem-definition
---

# Inverse Problem
---
<div class="card-profile"></div>

The inverse problem is (most commonly) associated with the ==recovery of the coefficients of a known equation== from indirect, noisy observations of its solution. Hence, the aim is to find $\lambda$ such that the solution $u_\lambda$ explains the observations. Under an observational model:

$$
y = \mathcal H(u) + \epsilon \quad \text{with} \quad \epsilon \sim \mathrm{N}(0, \Gamma),
$$

where $\mathrm N(0,\Gamma)$ is a Gaussian noise source with covariance $\Gamma$. Then we aim to find

$$
\lambda^\star=\arg_\lambda\ \min \|y-\mathcal H(u_\lambda)\|^2_{\Gamma^{-1}}+R(\lambda)
$$

where $\lambda$ are the coefficients, $u_\lambda$ the solution of the forward problem under $\lambda$ (calculated by some surrogate or exactly), $y$ the observations with operator $\mathcal H$, and $R$ a regularization term. This can also be learned similarly in Bayesian form:

$$
p(\lambda \mid y)\propto p(y\mid \lambda)p(\lambda),
$$

with $p(\lambda)$ being the prior, $p(y \mid \lambda)$ the likelihood of the observations under the forward map (and noise), and $p(\lambda \mid y)$ the posterior. The coefficient can represent scalars, vectors, but also functions, which (can) make the problem ill-posed, as the problem becomes not surjective. This is where the reguralization term replaces the problem with a well-posed one (restoring uniqueness and stability).

## Nearby problems
---

**[Forward Problem](/sciml-for-physics/problems/forward-problem/).** The inverse to the Inverse Problem. Assuming all information is given, learn the solution $u_\lambda$.

## Methods possible
---

**[Physics-Informed Neural Networks](/sciml-for-physics/methods/physics-informed-neural-networks/).** Physics-Informed Neural Networks can be extended by a parameter, representing the coefficient of the system. Therefore, the coefficient becomes an additional learnable parameter and can be jointly optimized with the parameters of the model.

## Reading
---

[\1]: Stuart, A. M. (2010). Inverse problems: A Bayesian perspective. _Acta Numerica_, 19, 451–559. [https://doi.org/10.1017/S0962492910000061](https://doi.org/10.1017/S0962492910000061)

[\2]: Arridge, S., Maass, P., Öktem, O., & Schönlieb, C.-B. (2019). Solving inverse problems using data-driven models. _Acta Numerica_, 28, 1–174. [https://doi.org/10.1017/S0962492919000059](https://doi.org/10.1017/S0962492919000059)

[\3]: Raissi, M., Yazdani, A., & Karniadakis, G. E. (2020). Hidden fluid mechanics: Learning velocity and pressure fields from flow visualizations. _Science_, 367(6481), 1026–1030. [https://doi.org/10.1126/science.aaw4741](https://doi.org/10.1126/science.aaw4741)

[\4]: Yang, L., Meng, X., & Karniadakis, G. E. (2021). B-PINNs: Bayesian physics-informed neural networks for forward and inverse PDE problems with noisy data. _Journal of Computational Physics_, 425, 109913. [https://doi.org/10.1016/j.jcp.2020.109913](https://doi.org/10.1016/j.jcp.2020.109913)

[\5]: Chung, H., Kim, J., McCann, M. T., Klasky, M. L., & Ye, J. C. (2023). Diffusion posterior sampling for general noisy inverse problems. _ICLR_. [https://arxiv.org/abs/2209.14687](https://arxiv.org/abs/2209.14687)
