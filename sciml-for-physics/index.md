---
title: Scientific Machine Learning for Physics
crumb: sciml-for-physics
date: 2026-10-21
status: bit
kind: explainer
description: Scientific machine learning for physics starts from a governing system and an observation model. The problem space and approaches then depend on which components we can use and what we seek. 
tags:
  - scientific-machine-learning
  - background
  - basics
---

# Scientific Machine Learning for Physics
---
General-purpose machine learning (ML) models make only generic assumptions about their data (e.g., smoothness, locality, ...). Scientific machine learning (SciML) uses the very same methods but trades some of this generality by introducing domain knowledge. In physics, such domain knowledge can be highly specific, including a system's symmetries or its governing equations. It can enter the process at different places, for example in the architecture [\0] or as residuals in the training signal [\1] [\2] [\3].

<!--
A rewording could be something along the lines of:
- what ML and SciML makes different 
- in that introduce the concept of two systems
- next the system
-->

<!--
Currently, this is only introductionary and does not really have anything to do with the actual body.
I need to revisit this, after I have the main three parts: System/PDEs, Error in samples/solutions, table of tasks 
-->

## The System
---

For physics at the continuum scale, where the state of a system is described by fields such as velocity, temperature, or displacement, most problems can be framed as a set of [systems](#the-system) describing the ==dynamics of the system==. 

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
  <dd>state (solution field)<small>the quantity the physics determines, $u:\Omega\times[0,T]\to\mathbb R^m$, e.g., temperature, velocity, pressure or concentration; in ML often what a network is trained to approximate</small></dd>
</dl>
<p class="dl-label">Physics</p>
<dl>
  <dt>$\mathcal N$</dt>
  <dd>(differential) operator<small>the encoding the governing dynamics in the physical system, e.g., heat diffusion $\mathcal N[u;\lambda]=\partial_t u-\alpha\Delta u$; for time-dependent problems it defines how the state evolves, where every admissible $u$ must satisfy it at every point</small></dd>
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
  <dd>boundary operator and constraint<small>$\mathcal B$ sets the type of condition: Dirichlet $\mathcal B[u]=u$ (value), Neumann $\mathcal B[u]=\partial_n u$ (flux) or Robin $\mathcal B[u]=\alpha u+\beta\,\partial_n u$ (a mix); $b$ holds the values imposed, e.g., a wall held at $20\,^\circ\mathrm C$ or zero flux through an insulated wall</small></dd>
  <dt>$u_0$</dt>
  <dd>initial condition<small>the state at $t=0$; together with the boundary conditions it makes the solution unique (for well-posed problems)</small></dd>
</dl>

The operator, its coefficients, the forcing, the domain and the boundary conditions define the *system*; together with one initial condition $u_0$, it becomes an *instance* with a single solution.

A simple example is the heat diffusion in a rod, whose temperature $u(x,t)$ evolves as

$$
\begin{aligned}
\partial_t u-\alpha\,\partial_{xx}u &= f   && \text{in } (0,1)\times(0,1],\\
\mathcal B[u]                        &= b   && \text{at } x\in\{0,1\},\\
u(\cdot,0)                           &= u_0 && \text{in } (0,1),
\end{aligned}
$$

with thermal diffusivity $\alpha$. The playground below shows the solution in space and time: position $x$ runs vertically and time $t$ runs from left to right.

<chart id="heat-playground" type="figure"/>

Draw an initial temperature profile $u_0$ on the left strip and the boundary data $b$ on the strips above and below. Click inside the field to place heat sources $f$. Below the plot, you can adjust $\alpha$ and choose the type of each boundary condition. 

## The Observation Model
---
The system describes how the world behaves; however, observations of the state $u$ are rarely exact. Instead, what we have is an [observation model](#the-observation-model), modeling on one hand. e.g., what our sensor capture and on the other the measurement errors these introduce into our measurements.

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

$\mathcal H$ is our observation model, reading the temperature of our heat rod system from before at a few sensor positions at a few sample times. As with true sensors, we get some measurement error $\varepsilon$, which is sampled by some selectable distribution.

<chart id="observation-model" type="figure"/>

## The Tasks
---

From this perspective, our knowledge about parts of the problem and the desired form, quality and quantity of our prediction b  

Most tasks, from simulating a flow to inferring a property of the system, are then a question about one side given the other; i.e., predicting observations from a known system, or inferring the system from observations. Meaning, that the tasks **differ only in what is known and what is sought**.

The map places every problem and method by what it needs to know of the operator $\mathcal N$, the parameters $\lambda$, the forcing $f$, the state data $u$ and the observations $\mathcal H$, and by what it produces. Click a level, a row or a cell to keep only what needs that much or less; each card links to its own page.

<chart id="task-map" type="figure"/>

## References
---
[\0]: Cohen, T., & Welling, M. (2016). Group equivariant convolutional networks. _ICML_, PMLR 48, 2990–2999. [https://arxiv.org/abs/1602.07576](https://arxiv.org/abs/1602.07576)

[\1]: Raissi, M., Perdikaris, P., & Karniadakis, G. E. (2019). Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. _Journal of Computational Physics_, 378, 686–707. [https://doi.org/10.1016/j.jcp.2018.10.045](https://doi.org/10.1016/j.jcp.2018.10.045)

[\2]: Li, Z., Zheng, H., Kovachki, N., Jin, D., Chen, H., Liu, B., Azizzadenesheli, K., & Anandkumar, A. (2024). Physics-informed neural operator for learning partial differential equations. _ACM/IMS Journal of Data Science_, 1(3), 1–27. [https://doi.org/10.1145/3648506](https://doi.org/10.1145/3648506)

[\3]: Kotchourko, S., Totounferoush, A., Mahoney, M. W., & Staab, S. (2026). Residuals are not enough: Limits of physics-informed pre-training for scientific foundation models. _Discovery Science_. [https://arxiv.org/abs/2503.19081](https://arxiv.org/abs/2503.19081)
