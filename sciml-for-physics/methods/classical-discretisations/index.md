---
title: Classical discretisations
crumb: sciml-for-physics/methods/classical-discretisations
date: 2026-10-22
type: method
description: Finite elements, finite volumes and spectral methods, which replace the continuous problem by a finite one and solve it up to discretisation error.
needs:
  N: explicit
  lam: fixed
  f: fixed
  u: a snapshot
  H: full field
tasks: [u_ahead]
corpus: no training data
physics: physics is the model
tags:
  - scientific-machine-learning
  - method-card
---

# Classical discretisations
---
<div class="card-profile"></div>

Finite elements, finite volumes and spectral methods replace the continuous problem by a finite one and solve it exactly up to discretisation error. Nothing is learned; the equations are the model and the solver drives their residual to zero.

$$
a(u_h,v_h)=\ell(v_h)\ \ \forall\,v_h\in V_h\qquad\text{or}\qquad \mathcal N_h[u_h;\lambda]=f_h
$$

$V_h$ is a finite-dimensional space of functions on a mesh, $u_h\in V_h$ the discrete solution, $a$ and $\ell$ the bilinear and linear forms of the weak formulation, and $\mathcal N_h$, $f_h$ the operator and forcing after discretisation. The method requires the operator explicitly, all coefficients, the forcing, the boundary data and the initial state; it uses no data. Accuracy is set by the mesh and the order, cost by the size of the linear or nonlinear systems.

<dl class="card-gmf">
  <dt>Data</dt><dd>None; collocation or quadrature points of the mesh.</dd>
  <dt>Model</dt><dd>A fixed basis of local or global functions; the equations hold in weak or strong form.</dd>
  <dt>Optimization</dt><dd>Linear solvers, Newton iterations, time steppers; preconditioning decides the cost.</dd>
</dl>

<p class="card-physics"><span>Where the physics enters</span> The model, exactly; the residual is the loss.</p>

## Nearby methods
---
<div class="card-nearby"></div>

## Problems addressed
---
<div class="card-cross"></div>

## Reading
---
- Brenner & Scott (2008), The Mathematical Theory of Finite Element Methods, Springer
- LeVeque (2002), Finite Volume Methods for Hyperbolic Problems, Cambridge

<script type="module" src="/sciml-for-physics/card-page.js"></script>
