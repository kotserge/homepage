---
title: 'Model Discrepancy & Sim-To-Real'
crumb: sciml-for-physics/problems/model-discrepancy-and-sim-to-real
date: 2026-10-26
type: problem
description: 'Model discrepancy and sim-to-real is the correction for the gap between a simulator and the real system it stands for.'
needs:
  N: one term missing
  lambda: prior only
  f: fixed
  u: a snapshot
  H: sparse points
tasks: [N, lambda]
scope: one family
answer: both
tags:
  - scientific-machine-learning
  - problem-definition
---

# Model Discrepancy & Sim-To-Real
---
<div class="card-profile"></div>

Model discrepancy captures the ==gap between a simulator and the real system== for which it stands in. Most problems use a large corpus originating from a simulator $\mathcal N_{\mathrm{sim}}$, while for real measurements $\mathcal N_{\mathrm{real}}=\mathcal N_{\mathrm{sim}}+\delta$, only a few samples are available. Estimating this $\delta$ under such settings becomes the target

$$
p(\lambda,\delta\mid y)\ \propto\ p\big(y\mid u_{\mathrm{sim},\lambda}+\delta\big)\,p(\lambda)\,p(\delta),
$$

where $\lambda$ are the coefficients, $u_{\mathrm{sim},\lambda}$ the solution of the simulator under them, $\delta$ the discrepancy to reality, and $y=\mathcal H(u_{\mathrm{real}})+\epsilon$ the real, sparse measurements with some noise $\epsilon$. The priors $p(\lambda)$ and $p(\delta)$ are part of the problem, since $\lambda$ and $\delta$ are confounded: a wrong coefficient and a missing term can explain the same measurements.


## Nearby problems
---

**[Closure & Hybrid Modeling](/sciml-for-physics/problems/closure-and-hybrid-modeling/).** Also learns a missing term, but from a finer simulation, i.e., with plenty of data from the operator it targets. Here the missing term has to be learned from reality, with far less data.

**[Inverse Problem](/sciml-for-physics/problems/inverse-problem/).** Assumes the model is exact, so that any misfit is attributed to $\lambda$ and the noise. With $\delta\neq0$, this attribution biases the recovered coefficients.

**[Policy Learning](/sciml-for-physics/problems/policy-learning/).** Trains in a simulator and acts in the experiment, so the same gap enters through the environment rather than through the measurements.

## Methods possible
---

No methods on the map yet.

## Reading
---

[\0]: Kennedy, M. C., & O’Hagan, A. (2001). Bayesian calibration of computer models. _Journal of the Royal Statistical Society Series B: Statistical Methodology_, 63(3), 425–464. [https://doi.org/10.1111/1467-9868.00294](https://doi.org/10.1111/1467-9868.00294)

[\1]: Wehenkel, A., Gamella, J. L., Sener, O., Behrmann, J., Sapiro, G., Jacobsen, J.-H., & Cuturi, M. (2025). Addressing misspecification in simulation-based inference through data-driven calibration. _ICML_. [https://arxiv.org/abs/2405.08719](https://arxiv.org/abs/2405.08719)

[\2]: Hu, P., Feng, H., Liu, H., Yan, T., Deng, W., Gao, T., Zheng, R., Zheng, H., Yu, C., Wang, C., Li, K., Ma, Z.-M., Zhou, D., Lu, X., Fan, D., & Wu, T. (2026). RealPDEBench: A benchmark for complex physical systems with real-world data. _ICLR_. [https://arxiv.org/abs/2601.01829](https://arxiv.org/abs/2601.01829)
