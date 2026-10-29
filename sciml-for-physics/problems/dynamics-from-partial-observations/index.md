---
title: 'Dynamics from Partial Observations'
crumb: sciml-for-physics/problems/dynamics-from-partial-observations
date: 2026-10-26
type: problem
description: 'Dynamics from partial observations is the joint learning of the dynamics and the state of a system that is only partly and noisily observed.'
needs:
  N: not needed
  lambda: not needed
  f: not needed
  u: a window
  H: sparse points
tasks: [N, u_now]
scope: one instance
answer: point
tags:
  - scientific-machine-learning
  - problem-definition
---

# Dynamics from Partial Observations
---
<div class="card-profile"></div>

Dynamics from partial observations encompasses the ==joint learning of a system's dynamics and state== when it is only partially, and possibly noisily, observed. In this sense, nothing about the operator, its coefficients, or the forcing is known; they are absorbed into $\Phi_\theta$, a learned approximation of the one-step map $\mathcal M$, which, together with the trajectory, must be consistent with the observations. Hence, we seek

$$
\big(\theta^\star,u_{0:K}^\star\big)=\arg\min_{\theta,\ u_{0:K}}\ \sum_{k=1}^{K}\big\|y_k-\mathcal H(u_k)\big\|^2_{\Gamma^{-1}}+\sum_{k=0}^{K-1}\big\|u_{k+1}-\Phi_\theta(u_k)\big\|^2_{Q^{-1}},
$$

with $\Phi_\theta$ as the one-step model, $u_{0:K}$ the trajectory, $y_k$ the observations under the observation model $\mathcal H$ with some noise covariance $\Gamma$, i.e., $\varepsilon_k\sim\mathsf N(0,\Gamma)$, and $Q$ as the model-error covariance, i.e., $u_{k+1}=\Phi_\theta(u_k)+\eta_k,\qquad \eta_k\sim\mathsf N(0,Q)$. Therefore, the first term ties the trajectory to the data, and the second ties it to the model. 

## Nearby problems
---

**[Data Assimilation](/sciml-for-physics/problems/data-assimilation/).** Unlike data assimilation, the model here is learned rather than given. Furthermore, the whole trajectory is unknown and must be estimated, whereas in data assimilation the estimation target is $u_0$.

**[Emulation & Time Stepping](/sciml-for-physics/problems/emulation-and-time-stepping/).** Learns the same one-step map, but from full, solved trajectories instead of sparse observations.

## Methods possible
---

No methods on the map yet.

## Reading
---

[\0]: Brajard, J., Carrassi, A., Bocquet, M., & Bertino, L. (2020). Combining data assimilation and machine learning to emulate a dynamical model from sparse and noisy observations: A case study with the Lorenz 96 model. _Journal of Computational Science_, 44, 101171. [https://arxiv.org/abs/2001.01520](https://arxiv.org/abs/2001.01520)

[\1]: Bocquet, M., Brajard, J., Carrassi, A., & Bertino, L. (2020). Bayesian inference of chaotic dynamics by merging data assimilation, machine learning and expectation-maximization. _Foundations of Data Science_, 2(1), 55–80. [https://arxiv.org/abs/2001.06270](https://arxiv.org/abs/2001.06270)
