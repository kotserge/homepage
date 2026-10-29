---
title: Scientific Machine Learning for Physics
crumb: sciml-for-physics
date: 2026-10-29
status: byte
kind: explainer
description: Scientific machine learning for physics starts from a governing system and an observation model. The problem space and approaches then depend on which components we can use and what we seek. 
tags:
  - scientific-machine-learning
  - background
  - basics
---

# Scientific Machine Learning for Physics
---

In classical [statistical learning](/the-framework-of-machine-learning), we minimize empirical risk over independent and identically distributed draws from an unknown distribution. Hence, all structure must be inferred from this finite set of samples, and the central tension becomes balancing estimation error versus approximation error (i.e., bias–variance / making overly simple assumptions or missing key patterns vs. a model being too sensitive to small fluctuations, underfitting vs. overfitting).

In physics, when describing the governing dynamics of a system, e.g., heat diffusing in a rod or, more recently, the flow of (in/compressible) fluids, we commonly use a system of equations to capture these dynamics. Therefore, in Scientific Machine Learning, the data-generating mechanism is (at least partly) known in closed form. This allows for domain knowledge to seep into the construction of models, such as

- Supervision to come from the equation itself (most notably the physics-informed loss [\0] [\1] [\2]), not only from observed pairs
- Prior knowledge can be used as an inductive bias via, e.g., losses capturing conservation laws [\3] [\4], symmetries [\5], boundary conditions, or on the architecture [\6], restricting the hypothesis class to only physically admissible functions

Unlike general-purpose machine learning, scientific machine learning often aims to extrapolate to new parameters or longer time horizons, or to solve ill-posed initial-condition and coefficient-recovery problems, rather than interpolate within a stationary distribution.

However, these [tasks](#the-task) depend heavily on how much of this mechanism is known. For this, we first need to introduce a general description of our [system](#the-system) and how we [observe](#the-observation-model) it.

## The System
---

For physics at the continuum scale, where the state of a system is described by fields such as velocity, temperature, or displacement, most problems can be framed as a [system](#the-system) of partial differential equations describing the ==dynamics of the state==. 

$$
\begin{aligned}
\mathcal N[u;\lambda] &= f   && \text{in } \Omega\times(0,T],\\
\mathcal B[u]         &= b   && \text{on } \partial\Omega\times(0,T],\\
u(\cdot,0)            &= u_0 && \text{in } \Omega,
\end{aligned}
$$

<p class="dl-label">State</p>
<dl>
  <dt>$u$</dt>
  <dd>state (solution field)<small>the state under the governing physics, $u:\Omega\times[0,T]\to\mathbb R^m$, e.g., temperature, velocity, pressure or concentration; in ML often what a network is trained to approximate</small></dd>
</dl>
<p class="dl-label">Physics</p>
<dl>
  <dt>$\mathcal N$</dt>
  <dd>(differential) operator<small>encodes the governing dynamics of the physical system, e.g., heat diffusion $\mathcal N[u;\lambda]=\partial_t u-\alpha\Delta u$; for time-dependent problems it defines how the state evolves, where every admissible $u$ must satisfy it at every point</small></dd>
  <dt>$\lambda$</dt>
  <dd>coefficients, physical parameters<small>knobs on the properties of the system, such as diffusivity, viscosity or permeability; changing them can change the dynamics observed, e.g., flow stays laminar below a certain Reynolds number and turns turbulent above it</small></dd>
  <dt>$f$</dt>
  <dd>source, forcing term<small>an external driving force, such as a heat source, a body force or an injection well; with $f=0$ the system evolves only through its own dynamics</small></dd>
</dl>
<p class="dl-label">Domain and conditions</p>
<dl>
  <dt>$\Omega$, $(0,T]$</dt>
  <dd>domain and time horizon<small>$\Omega\subset\mathbb R^d$ is the region in which the system acts, including its geometry (irregular shapes, holes, moving parts); its boundary $\partial\Omega$ is where the system interacts with its surroundings</small></dd>
  <dt>$\mathcal B$, $b$</dt>
  <dd>boundary operator and constraint<small>$\mathcal B$ sets the type of condition: Dirichlet $\mathcal B[u]=u$ (value), Neumann $\mathcal B[u]=\partial_n u$ (flux) Robin $\mathcal B[u]=\alpha u+\beta \partial_n u$ (a mix), or a periodic condition; $b$ holds the values imposed, e.g., a wall held at $20 ^\circ\mathrm C$ or zero flux through an insulated wall</small></dd>
  <dt>$u_0$</dt>
  <dd>initial condition<small>the state at $t=0$; together with the boundary conditions it makes the solution unique (for well-posed problems)</small></dd>
</dl>

The operator, its coefficients, the forcing, the domain and the boundary conditions define the *system*; together with one initial condition $u_0$, it becomes an *instance* with a single solution.

Many tasks work in discrete time, on states $u_t$ at time steps $t=0,1,\dots$ spaced by $\Delta t$. The system then advances the state by its solution map over one step, $u_{t+1}=\mathcal M(u_t)$, and $\mathcal M_t$ denotes the map from $u_0$ to $u_t$. A learned approximation of this one-step map is written $\Phi$ (or $\Phi_\theta$ with weights $\theta$).

A simple example for such a system is the heat diffusion in a rod, whose temperature $u(x,t)$ evolves as

$$
\begin{aligned}
\partial_t u-\alpha \partial_{xx}u &= f   && \text{in } (0,1)\times(0,1],\\
\mathcal B[u]                        &= b   && \text{at } x\in\{0,1\},\\
u(\cdot,0)                           &= u_0 && \text{in } (0,1),
\end{aligned}
$$

with thermal diffusivity $\alpha$. The playground below shows the solution in space and time: position $x$ runs vertically and time $t$ runs from left to right.

<chart id="heat-playground" type="figure"/>

Draw an initial temperature profile $u_0$ on the left strip and the boundary data $b$ on the strips above and below. Click inside the field to place heat sources $f$. Below the plot, you can adjust $\alpha$ and choose the type of each boundary condition. 

## The Observation Model
---
The system describes how the world behaves; however, observations of the state $u$ are rarely exact. Instead, what we have is an [observation model](#the-observation-model), which describes on one hand what our sensors capture and on the other the errors they introduce into our measurements.

$$
y=\mathcal H(u)+\varepsilon,
$$

<p class="dl-label">Observation</p>
<dl>
  <dt>$\mathcal H$</dt>
  <dd>observation operator<small>maps the full state to what the sensors record, e.g., point values $\mathcal H(u)=\big(u(x_i,t_j)\big)_{i,j}$, local averages, or only some components of $u$</small></dd>
  <dt>$y$</dt>
  <dd>observations, data<small>what is actually measured, such as sensor readings, images or satellite data; typically sparse, partial and indirect</small></dd>
  <dt>$\varepsilon$</dt>
  <dd>measurement noise<small>sensor and modeling errors, often assumed Gaussian, $\varepsilon\sim\mathsf N(0,\Gamma)$ with covariance $\Gamma$</small></dd>
</dl>

$\mathcal H$ is our observation model, reading the temperature of our heat rod system from before at a few sensor positions and times. As with real sensors, each reading carries a measurement error $\varepsilon$.

<chart id="observation-model" type="figure"/>

## The Tasks
---

From this perspective, we define a task by what we know about the problem's parts and by the form, quality, and quantity of the prediction we want. Most tasks, from simulating a flow to inferring a system property, are then a question of one side given the other; i.e., predicting observations from a known system, or inferring the system from observations. That is, tasks **differ only in what is known and what is sought**. The map places every problem and method (still in progress) in relation to how much information it has or needs about the operator $\mathcal N$, the parameters $\lambda$, the forcing $f$, the state data $u$, and the observations $\mathcal H$, and what it produces.

<chart id="task-map" type="figure"/>

## References
---
[\0]: Raissi, M., Perdikaris, P., & Karniadakis, G. E. (2019). Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. _Journal of Computational Physics_, 378, 686–707. [https://doi.org/10.1016/j.jcp.2018.10.045](https://doi.org/10.1016/j.jcp.2018.10.045)

[\1]: Li, Z., Zheng, H., Kovachki, N., Jin, D., Chen, H., Liu, B., Azizzadenesheli, K., & Anandkumar, A. (2024). Physics-informed neural operator for learning partial differential equations. _ACM/IMS Journal of Data Science_, 1(3), 1–27. [https://doi.org/10.1145/3648506](https://doi.org/10.1145/3648506)

[\2]: Kotchourko, S., Totounferoush, A., Mahoney, M. W., & Staab, S. (2026). Residuals are not enough: Limits of physics-informed pre-training for scientific foundation models. _Discovery Science_. [https://arxiv.org/abs/2503.19081](https://arxiv.org/abs/2503.19081)

[\3]: Jagtap, A. D., Kharazmi, E., & Karniadakis, G. E. (2020). Conservative physics-informed neural networks on discrete domains for conservation laws: Applications to forward and inverse problems. _Computer Methods in Applied Mechanics and Engineering_, 365, 113028. [https://doi.org/10.1016/j.cma.2020.113028](https://doi.org/10.1016/j.cma.2020.113028)

[\4]: Hansen, D., Maddix, D. C., Alizadeh, S., Gupta, G., & Mahoney, M. W. (2023). Learning physical models that can respect conservation laws. _ICML_; _Physica D: Nonlinear Phenomena_, 457 (2024), 133952. [https://arxiv.org/abs/2302.11002](https://arxiv.org/abs/2302.11002)

[\5]: Cohen, T., & Welling, M. (2016). Group equivariant convolutional networks. _ICML_, PMLR 48, 2990–2999. [https://arxiv.org/abs/1602.07576](https://arxiv.org/abs/1602.07576)

[\6]: Richter-Powell, J., Lipman, Y., & Chen, R. T. Q. (2022). Neural conservation laws: A divergence-free perspective. _NeurIPS_. [https://arxiv.org/abs/2210.01741](https://arxiv.org/abs/2210.01741)
