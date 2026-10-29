---
title: 'Joint State & Parameter Estimation'
crumb: sciml-for-physics/problems/joint-state-and-parameter-estimation
date: 2026-10-26
type: problem
description: 'Joint state and parameter estimation is the inference of both the initial state and the coefficients of a known model from sparse observations over a window.'
needs:
  N: explicit
  lambda: prior only
  f: fixed
  u: a window
  H: sparse points
tasks: [u_now, lambda]
scope: one instance
answer: both
tags:
  - scientific-machine-learning
  - problem-definition
---

# Joint State & Parameter Estimation
---
<div class="card-profile"></div>

Joint state and parameter estimation is the generalization of [Data Assimilation](/sciml-for-physics/problems/data-assimilation/) with additional unknown coefficients, i.e., the ==initial state as well as the coefficients== of a known model ==are inferred== from sparse, noisy observations over a window of the state. Hence, we seeks the following posterior of the state 

$$
p(u_0,\lambda\mid y_{1:T})\ \propto\ p(u_0)\,p(\lambda)\prod_{t=1}^{T}p\big(y_t\mid u_t\big),\qquad u_t=\mathcal M_t(u_0;\lambda),
$$

with priors $p(u_0)$ and $p(\lambda)$, $\mathcal M_t(\,\cdot\,;\lambda)$ the model that carries the state forward to time $t$ under the joint estimated coefficients $\lambda$, and $y_t$ of an observation model. The pair $(u_0,\lambda)$ determines the whole trajectory, so every observation in the window constrains both. However, $\lambda$ and $u_0$ might compensate each other in the fit, under which the observations may constrain only a combination of them. This is what makes the joint problem harder than either in vacuum.

## Nearby problems
---

**[Data Assimilation](/sciml-for-physics/problems/data-assimilation/).** The special case where $\lambda$ is known and only $u_0$ is sought. Conversely, appending the coefficients to the state, $\tilde u=(u,\lambda)$ with $\lambda$ constant in time, turns the joint problem into data assimilation on $\tilde u$.

**[Inverse Problem](/sciml-for-physics/problems/inverse-problem/).** The special case where the state is not an unknown of its own, so that only the coefficients $\lambda$ have to explain the observations.

**[Dynamics from Partial Observations](/sciml-for-physics/problems/dynamics-from-partial-observations/).** Replaces the coefficients of a known model by the model itself, so that the dynamics, not only their parameters, are learned alongside the state.

## Methods possible
---

No methods on the map yet.

## Reading
---

[\0]: Evensen, G. (2009). The ensemble Kalman filter for combined state and parameter estimation. _IEEE Control Systems_, 29(3), 83–104. [https://doi.org/10.1109/MCS.2009.932223](https://doi.org/10.1109/MCS.2009.932223)

[\1]: Bocquet, M., & Sakov, P. (2013). Joint state and parameter estimation with an iterative ensemble Kalman smoother. _Nonlinear Processes in Geophysics_, 20, 803–818. [https://doi.org/10.5194/npg-20-803-2013](https://doi.org/10.5194/npg-20-803-2013)
