/**
 * Heat rod shared by the figures of this page: the one-dimensional heat equation
 *
 *     ∂t u − λ ∂xx u = f   on x ∈ (0, 1), t ∈ (0, T_END],
 *
 * its explicit finite-difference solver, the default scenario and the colour scale
 * of u. Every field is stored column-major on the (t, x) grid, index j·NX + i.
 *
 * Expects the global `d3` (v7).
 */

// === Discretization ===

export const NX = 65; // spatial nodes on x ∈ [0, 1]
export const NT = 161; // stored time columns on t ∈ [0, T_END]
export const T_END = 1;
export const DX = 1 / (NX - 1);
export const DT_COLUMN = T_END / (NT - 1);
const CFL = 0.4; // explicit Euler is stable for λ·dt/dx² ≤ 0.5

// === Physics knobs ===

export const LAMBDA_MIN = 1e-3;
export const LAMBDA_MAX = 1e-1;
const LAMBDA_DEFAULT = 1e-2;
const FLUX_MAX = 5; // Neumann strips span ∂n u ∈ [−FLUX_MAX, FLUX_MAX]
const SOURCE_SIGMA_X = 0.03;
const SOURCE_SIGMA_T = 0.015;
export const SOURCE_STEP = 10; // source amplitude per toolbar step; also the minimum amplitude
const SOURCE_CUTOFF = 1e-4; // Gaussian time weights below this are skipped

// === Colour ===

const FADE_END = 0.35; // opacity ramps linearly from 0 at u = 0 to 1 at u = FADE_END
const FADE_STOPS = 8; // gradient stops approximating the eased field fade

export const BC = Object.freeze({ DIRICHLET: "dirichlet", NEUMANN: "neumann" });

/** Colour of value u as a d3 RGB: magma (clamped to u ∈ [0, 1]) with opacity fading out towards u = 0. */
export function heatColor(u) {
    const c = d3.rgb(d3.interpolateMagma(Math.max(0, Math.min(1, u))));
    c.opacity = Math.max(0, Math.min(1, u / FADE_END));
    return c;
}

export const LUT = d3.range(256).map((k) => heatColor(k / 255));

/** Grid index `k` of a coordinate, clamped to [0, n). */
export function gridIndex(value, step, n) {
    return Math.max(0, Math.min(n - 1, Math.round(value / step)));
}

/**
 * CSS mask gradient along `direction` that rises from transparent to opaque over
 * `feather` px at both ends, eased with smootherstep so the ramp has no visible start or end.
 */
export function fadeGradient(direction, feather) {
    const ramp = d3.range(FADE_STOPS + 1).map((k) => {
        const w = k / FADE_STOPS;
        return { alpha: w ** 3 * (w * (6 * w - 15) + 10), offset: w * feather };
    });
    const head = ramp.map(({ alpha, offset }) => `rgb(0 0 0 / ${alpha.toFixed(3)}) ${offset}px`);
    const tail = ramp
        .toReversed()
        .map(({ alpha, offset }) => `rgb(0 0 0 / ${alpha.toFixed(3)}) calc(100% - ${offset}px)`);
    return `linear-gradient(${direction}, ${[...head, ...tail].join(", ")})`;
}

/**
 * Paints field `u` into `canvas` through the colour lookup table, using `buffer` (an
 * NT × NX canvas, t right and x up) as the one-pixel-per-node intermediate.
 */
export function paintField(u, canvas, buffer) {
    const bufferCtx = buffer.getContext("2d");
    const image = bufferCtx.createImageData(NT, NX);
    const { data } = image;
    for (let j = 0; j < NT; j++) {
        for (let i = 0; i < NX; i++) {
            const level = Math.max(0, Math.min(255, Math.round(u[j * NX + i] * 255)));
            const c = LUT[level];
            const p = 4 * ((NX - 1 - i) * NT + j);
            data[p] = c.r;
            data[p + 1] = c.g;
            data[p + 2] = c.b;
            data[p + 3] = Math.round(c.opacity * 255);
        }
    }
    bufferCtx.putImageData(image, 0, 0);

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
}

// === Model ===

/** Normalised strip value s ∈ [0, 1] that a boundary strip of `type` starts from. */
export function stripDefault(type) {
    switch (type) {
        case BC.DIRICHLET:
            return 0;
        case BC.NEUMANN:
            return 0.5; // zero flux, an insulated wall
        default:
            throw new Error(`unsupported boundary type: ${type}`);
    }
}

/**
 * Next value of an end node under condition `type` with strip value `s`, given the
 * end node `end`, its interior neighbour `inner`, the diffusion number `r`, the
 * sub-step `dt` and the forcing `f` at the end node. Dirichlet takes `s` as the
 * value; Neumann maps `s` to g = ∂n u in ±FLUX_MAX and advances the PDE on the end
 * node with the ghost node inner + 2·DX·g (central difference at the wall).
 */
function boundaryNode(type, s, { end, inner, r, dt, f }) {
    switch (type) {
        case BC.DIRICHLET:
            return s;
        case BC.NEUMANN: {
            const g = (2 * s - 1) * FLUX_MAX;
            return end + r * (2 * inner - 2 * end + 2 * DX * g) + dt * f;
        }
        default:
            throw new Error(`unsupported boundary type: ${type}`);
    }
}

/** Heat rod scenario on first load and after a reset. */
export function defaultState() {
    return {
        lambda: LAMBDA_DEFAULT,
        ic: Float64Array.from({ length: NX }, (_, i) =>
            0.8 * Math.exp(-(((i * DX - 0.3) / 0.08) ** 2)),
        ),
        bc: {
            x1: {
                type: BC.DIRICHLET,
                values: Float64Array.from({ length: NT }, (_, j) =>
                    j * DT_COLUMN >= 0.4 ? 0.6 : 0,
                ),
            },
            x0: { type: BC.DIRICHLET, values: new Float64Array(NT) },
        },
        sources: [{ x: 0.7, t: 0.2, amp: 2 * SOURCE_STEP }],
    };
}

/** Forcing f on the (t, x) grid: one Gaussian bump per source. */
function forcingField(sources) {
    const f = new Float64Array(NX * NT);
    for (const { x, t, amp } of sources) {
        for (let j = 0; j < NT; j++) {
            const wt = Math.exp(-0.5 * ((j * DT_COLUMN - t) / SOURCE_SIGMA_T) ** 2);
            if (wt < SOURCE_CUTOFF) continue;

            for (let i = 0; i < NX; i++) {
                const wx = Math.exp(-0.5 * ((i * DX - x) / SOURCE_SIGMA_X) ** 2);
                f[j * NX + i] += amp * wt * wx;
            }
        }
    }
    return f;
}

/** Solution u of the heat equation for `state` on the (t, x) grid. */
export function solve({ lambda, ic, bc, sources }) {
    const f = forcingField(sources);
    const u = new Float64Array(NX * NT);

    // Sub-step every column interval so that λ·dt/dx² stays below CFL
    const substeps = Math.max(1, Math.ceil((lambda * DT_COLUMN) / (CFL * DX * DX)));
    const dt = DT_COLUMN / substeps;
    const r = (lambda * dt) / (DX * DX);

    // March forward in time, storing one column per interval
    let cur = Float64Array.from(ic);
    let next = new Float64Array(NX);
    u.set(cur, 0);
    for (let j = 1; j < NT; j++) {
        const fCol = (j - 1) * NX;
        for (let k = 0; k < substeps; k++) {
            for (let i = 1; i < NX - 1; i++) {
                const laplace = cur[i - 1] - 2 * cur[i] + cur[i + 1];
                next[i] = cur[i] + r * laplace + dt * f[fCol + i];
            }
            next[0] = boundaryNode(bc.x0.type, bc.x0.values[j], {
                end: cur[0],
                inner: cur[1],
                r,
                dt,
                f: f[fCol],
            });
            next[NX - 1] = boundaryNode(bc.x1.type, bc.x1.values[j], {
                end: cur[NX - 1],
                inner: cur[NX - 2],
                r,
                dt,
                f: f[fCol + NX - 1],
            });
            [cur, next] = [next, cur];
        }
        u.set(cur, j * NX);
    }
    return u;
}

// === Events ===

/** Document event the playground fires with `detail` = its latest solution u. */
export const SOLUTION_EVENT = "heat-rod:solution";
