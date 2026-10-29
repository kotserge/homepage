---
title: 'Parametric Operator Learning'
crumb: sciml-for-physics/problems/parametric-operator-learning
date: 2026-10-26
type: problem
description: In parametric operator learning we search for a solution map for a fixed, yet unknown operator.
needs:
  N: not needed
  lambda: per instance
  f: per instance
  u: a snapshot
  H: full field
tasks: [u_ahead]
scope: one family
answer: point
tags:
  - scientific-machine-learning
  - problem-definition
---

# Parametric Operator Learning
---
<div class="card-profile"></div>

In parametric operator learning, we approximate the solution operator of a differential equation by learning the ==map from the data that parametrize the problem== (coefficient fields, source terms, initial/boundary conditions, …) ==to the corresponding solution==. More formally, let $\mathcal A$ and $\mathcal U$ be function spaces of inputs and solutions, and $\mu$ a probability measure on pairs $(a,u)\in\mathcal A\times\mathcal U$. We seek

$$
\theta^\star = \arg\min_{\theta}\ \mathbb E_{(a,u)\sim\mu}\ \big\lVert \mathcal G_\theta(a) - u \big\rVert_{\mathcal U}^2 ,
$$

where $\lbrace \mathcal G_\theta:\mathcal A\to\mathcal U \rbrace_{\theta}$ is a parametrized family of operators, typically a neural operator such as a DeepONet or a Fourier Neural Operator. The main benefit is that once $\mathcal G_{\theta^\star}$ is found, the solution for a new input $a$ is a single forward pass, orders of magnitude cheaper than solving the [forward problem](/sciml-for-physics/problems/forward-problem) anew.

## Nearby problems
---

**[Reduced-order modeling](/sciml-for-physics/problems/reduced-order-modeling).** Approximates the same parameter-to-solution map, but factors it through a low-dimensional latent state $z$, i.e., $a\mapsto z\mapsto u=D(z)$, and evolves $z$ in time with a reduced model, whereas operator learning maps the input directly to the solution.

**[Parametric Emulation](/sciml-for-physics/problems/parametric-emulation/).** Takes the current state together with the parameters as input, but advances it by one step that is rolled out over a horizon, rather than mapping to the solution in one shot.

## Methods possible
---

No methods on the map yet.

## Reading
---
[\0]: Lu, L., Jin, P., Pang, G., Zhang, Z., & Karniadakis, G. E. (2021). Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators. _Nature Machine Intelligence_, 3(3), 218–229. [https://doi.org/10.1038/s42256-021-00302-5](https://doi.org/10.1038/s42256-021-00302-5)

[\1]: Li, Z., Kovachki, N., Azizzadenesheli, K., Liu, B., Bhattacharya, K., Stuart, A., & Anandkumar, A. (2021). Fourier neural operator for parametric partial differential equations. _ICLR_. [https://arxiv.org/abs/2010.08895](https://arxiv.org/abs/2010.08895)

[\2]: Kovachki, N. B., Lanthaler, S., & Stuart, A. M. (2024). Operator learning: Algorithms and analysis. _arXiv preprint_. [https://arxiv.org/abs/2402.15715](https://arxiv.org/abs/2402.15715)

[\3]: Huang, D. Z., & Stuart, A. M. (2026). Cost-accuracy trade-offs: Neural operator vs classical numerical solver. _arXiv preprint_. [https://arxiv.org/abs/2609.24021](https://arxiv.org/abs/2609.24021)
