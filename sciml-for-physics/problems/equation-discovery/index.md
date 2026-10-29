---
title: 'Equation Discovery'
crumb: sciml-for-physics/problems/equation-discovery
date: 2026-10-26
type: problem
description: 'Equation discovery is the identification of the governing equation itself from dense measurements of the state.'
needs:
  N: term library
  lambda: not needed
  f: not needed
  u: trajectories
  H: full field
tasks: [N, lambda]
scope: one instance
answer: point
tags:
  - scientific-machine-learning
  - problem-definition
---

# Equation Discovery
---
<div class="card-profile"></div>

Under equation discovery, we try to ==identify the governing equation itself from dense measurements of the state==. In the most general case, we have no insight into the operator itself, beyond an assumption about the hypothesis class $\mathcal F$ spanning it, and we aim for the simplest operator in it that reproduces the measured dynamics. More formally, what we seek is

$$
\mathcal N^\star=\arg\min_{\mathcal N\in\mathcal F}\ \big\|\partial_t u-\mathcal N(u)\big\|^2+\alpha\,C(\mathcal N),
$$

where $u$ are the state measurements in space and time, $\partial_t u$ is their time derivative, and $C$ is the operator's complexity, weighted by some $\alpha$. Most commonly, $\mathcal F$ is a library of candidate terms, where one searches a sparse combination of

$$
\mathcal N(u)=\Theta(u)\,\xi,\qquad \Theta(u)=\big[\,1,\ u,\ u^2,\ u_x,\ uu_x,\ u_{xx},\ \dots\big],\qquad C(\mathcal N)=\|\xi\|_0,
$$

with $\xi$ the vector of coefficients and $\|\xi\|_0$ its number of nonzero entries. The goal is to find the support of $\xi$ and its values, i.e., the equation.

## Nearby problems
---

**[Inverse Problem](/sciml-for-physics/problems/inverse-problem/).** The inverse problem is a special case, where either the form is known or guessed and one tries to recover the coefficients that fit the data best.

## Methods possible
---

No methods on the map yet.

## Reading
---

[\0]: Brunton, S. L., Proctor, J. L., & Kutz, J. N. (2016). Discovering governing equations from data by sparse identification of nonlinear dynamical systems. _Proceedings of the National Academy of Sciences_, 113(15), 3932–3937. [https://arxiv.org/abs/1509.03580](https://arxiv.org/abs/1509.03580)

[\1]: Rudy, S. H., Brunton, S. L., Proctor, J. L., & Kutz, J. N. (2017). Data-driven discovery of partial differential equations. _Science Advances_, 3(4), e1602614. [https://arxiv.org/abs/1609.06401](https://arxiv.org/abs/1609.06401)

[\2]: Messenger, D. A., & Bortz, D. M. (2021). Weak SINDy for partial differential equations. _Journal of Computational Physics_, 443, 110525. [https://doi.org/10.1016/j.jcp.2021.110525](https://doi.org/10.1016/j.jcp.2021.110525)

[\3]: Shojaee, P., Meidani, K., Gupta, S., Farimani, A. B., & Reddy, C. K. (2025). LLM-SR: Scientific equation discovery via programming with large language models. _ICLR_. [https://arxiv.org/abs/2404.18400](https://arxiv.org/abs/2404.18400)
