---
title: Classical Discretization Methods
crumb: sciml-for-physics/methods/classical-discretization-methods
date: 2026-10-22
type: method
description: Classical Discretization Methods, which replace the continuous problem by a finite-dimensional system and solve it with a solver rather than learning anything from data.
needs:
  N: explicit
  lambda: fixed
  f: fixed
  u: a snapshot
  H: full field
tasks: [u_ahead]
scope: one instance
component: model
physics: as the model
tags:
  - scientific-machine-learning
  - method-card
---

# Classical Discretization Methods
---
<div class="card-profile"></div>

Classical methods, e.g., Finite Difference, Finite Element, Finite Volume or Spectral Methods, discretize the continuous problem into a finite-dimensional system

$$
\mathcal N_h[u_h;\lambda]=f_h
$$

where $\mathcal N_h$ and $f_h$ represent the operator and forcing function after discretization and  $u_h$ is the corresponding discrete solution (grid values, cell averages or basis coefficients) for the given system under its coefficients $\lambda$.

## Nearby methods
---

**[Physics-Informed Neural Networks](/sciml-for-physics/methods/physics-informed-neural-networks/).** Similar to the classical approach, the physics-informed method requires full knowledge about the physics. However, in contrast to the classical approach, where the equations are the model, here, they serve to inform the trained model of its accuracy.

## Problems addressed
---

**[Forward Problem](/sciml-for-physics/problems/forward-problem/).** The forward problem is the classical use-case for the classical discretization methodologies. 

## Reading
---
[\0]: Brenner, S. C., & Scott, L. R. (2008). _The Mathematical Theory of Finite Element Methods_ (3rd ed.). Springer.

[\1]: LeVeque, R. J. (2002). _Finite Volume Methods for Hyperbolic Problems_. Cambridge University Press.
