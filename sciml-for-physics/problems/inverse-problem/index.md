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
y = \mathcal H(u) + \varepsilon \quad \text{with} \quad \varepsilon \sim \mathsf N(0, \Gamma),
$$

where $\mathsf N(0,\Gamma)$ is a Gaussian noise source with covariance $\Gamma$. Then we aim to find

$$
\lambda^\star=\arg\min_\lambda\ \|y-\mathcal H(u_\lambda)\|^2_{\Gamma^{-1}}+R(\lambda)
$$

where $\lambda$ are the coefficients, $u_\lambda$ the solution of the forward problem under $\lambda$ (calculated by some surrogate or exactly), $y$ the observations with operator $\mathcal H$, and $R$ a regularization term. This can also be learned similarly in Bayesian form:

$$
p(\lambda \mid y)\propto p(y\mid \lambda)p(\lambda),
$$

with $p(\lambda)$ being the prior, $p(y \mid \lambda)$ the likelihood of the observations under the forward map (and noise), and $p(\lambda \mid y)$ the posterior. The coefficient can represent scalars, vectors, but also functions, which (can) make the problem ill-posed, as the problem becomes not surjective. This is where the reguralization term replaces the problem with a well-posed one (restoring uniqueness and stability).

## Nearby problems
---

**[Forward Problem](/sciml-for-physics/problems/forward-problem/).** The inverse to the Inverse Problem. Assuming all information is given, learn the solution $u_\lambda$.

**[Data Assimilation](/sciml-for-physics/problems/data-assimilation/).** Starts from the same observation model, but $\lambda$ is known and the initial state $u_0$ is sought instead.

**[Joint State & Parameter Estimation](/sciml-for-physics/problems/joint-state-and-parameter-estimation/).** Seeks the initial state $u_0$ together with the coefficients $\lambda$, rather than $\lambda$ alone.

**[Equation Discovery](/sciml-for-physics/problems/equation-discovery/).** Drops the known form of $\mathcal N$, so that the operator itself, not only its coefficients, is sought.

**[Model Discrepancy & Sim-To-Real](/sciml-for-physics/problems/model-discrepancy-and-sim-to-real/).** Drops the assumption that the model is exact, so that a missing term $\delta$ competes with $\lambda$ in explaining the observations.

**[Control & Design](/sciml-for-physics/problems/control-and-design/).** Also optimizes an input of the system, but for an objective $J$ rather than to explain observations, so there is no true value to recover.

## Methods possible
---

**[Physics-Informed Neural Networks](/sciml-for-physics/methods/physics-informed-neural-networks/).** Physics-Informed Neural Networks can be extended by a parameter, representing the coefficient of the system. Therefore, the coefficient becomes an additional learnable parameter and can be jointly optimized with the parameters of the model.

## Reading
---

[\0]: Stuart, A. M. (2010). Inverse problems: A Bayesian perspective. _Acta Numerica_, 19, 451–559. [https://doi.org/10.1017/S0962492910000061](https://doi.org/10.1017/S0962492910000061)

[\1]: Arridge, S., Maass, P., Öktem, O., & Schönlieb, C.-B. (2019). Solving inverse problems using data-driven models. _Acta Numerica_, 28, 1–174. [https://doi.org/10.1017/S0962492919000059](https://doi.org/10.1017/S0962492919000059)

[\2]: Yang, L., Meng, X., & Karniadakis, G. E. (2021). B-PINNs: Bayesian physics-informed neural networks for forward and inverse PDE problems with noisy data. _Journal of Computational Physics_, 425, 109913. [https://doi.org/10.1016/j.jcp.2020.109913](https://doi.org/10.1016/j.jcp.2020.109913)
