/**
 * Observation model y = H(u) + ε on the heat rod, drawn as three frames over (t, x):
 * the state u, the noise-free observations H(u) and the noisy data y. H reads u on
 * an n × n grid of cell centres over (t, x); ε is i.i.d. with zero mean and standard
 * deviation σ, from a selectable family. Each reading fills its whole cell, so H(u)
 * and y read as a coarse pixel image of u.
 *
 * Below the frames, a slider sets n and a panel shows the density of ε with a
 * histogram of the current draws. Dragging on the panel sets σ to the pointer's
 * distance from 0; clicking it draws new noise.
 *
 * u starts as the default heat rod scenario and follows the playground above,
 * which publishes every re-solve as SOLUTION_EVENT.
 *
 * Expects the globals `d3` (v7) and a mount element `#observation-model`.
 */

import {
    DT_COLUMN,
    DX,
    NT,
    NX,
    SOLUTION_EVENT,
    T_END,
    defaultState,
    fadeGradient,
    gridIndex,
    heatColor,
    paintField,
    solve,
} from "./heat-rod.js";
import { controlField, dropdown, slider } from "/js/controls.js";

// === Observation knobs ===

const N_OBS = { min: 2, max: 64, default: 16 }; // readings per axis: sensor positions in x and sample times in t
const SIGMA = { min: 0.005, max: 0.2, default: 0.05 };
const EPS_MAX = 0.4; // the distribution panel spans ε ∈ [−EPS_MAX, EPS_MAX]
const SEED_DEFAULT = 1;

// === Layout (px) ===

const AXIS_W = 30; // x axis column left of the field: ticks and tick labels
const LABEL_H = 16; // row above the field holding the x axis label
const FRAME_H = 150;
const FRAME_MIN_W = 80;
const AXIS_H = 30; // t axis row below the field: ticks, tick labels, axis label
const TICK_SIZE = 5;
const TICK_PADDING = 2;
const TICKS = 3;
const FIELD_FEATHER = 6; // width over which the field canvas fades into the background
const DIST_H = 64; // plot height of the distribution panel
const DIST_AXIS_H = AXIS_H; // ε axis row below it: ticks, tick labels, axis label
const DIST_PAD = 8; // horizontal inset of the ε axis
const DIST_HEADROOM = 1.2; // y extent as a multiple of the density's peak
const DIST_BINS = 32;
const DIST_POINTS = 161; // samples along the density curve
const CLICK_DISTANCE = 3; // pointer travel up to which a press counts as a click, not a drag

// === Vocabulary ===

const ROOT_ID = "observation-model";
const FRAME = Object.freeze({ STATE: "state", OBSERVED: "observed", DATA: "data" });
const FRAMES = [
    { key: FRAME.STATE, title: "u", note: "state" },
    { key: FRAME.OBSERVED, title: "H(u)", note: "observed" },
    { key: FRAME.DATA, title: "y = H(u) + ε", note: "with noise" },
];
const NOISE = Object.freeze({ GAUSSIAN: "gaussian", LAPLACE: "laplace", UNIFORM: "uniform" });
const NOISE_OPTIONS = [
    { value: NOISE.GAUSSIAN, label: "Gaussian" },
    { value: NOISE.LAPLACE, label: "Laplace" },
    { value: NOISE.UNIFORM, label: "Uniform" },
];

const fmtSigma = d3.format(".3f");

// === Model ===

/**
 * Uniform generator on [0, 1) seeded with the 32-bit integer `seed`.
 * Mulberry32 by Tommy Ettinger, https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
 */
function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** One draw of zero-mean noise of family `noise` with standard deviation `sigma`, from the uniform generator `uniform`. */
function noiseSample(noise, sigma, uniform) {
    switch (noise) {
        case NOISE.GAUSSIAN:
            return sigma * Math.sqrt(-2 * Math.log(1 - uniform())) * Math.cos(2 * Math.PI * uniform()); // Box–Muller
        case NOISE.LAPLACE: {
            const v = uniform() - 0.5; // inverse CDF with scale σ/√2
            return -(sigma / Math.SQRT2) * Math.sign(v) * Math.log(1 - 2 * Math.abs(v));
        }
        case NOISE.UNIFORM:
            return sigma * Math.sqrt(3) * (2 * uniform() - 1); // half-width σ√3
        default:
            throw new Error(`unsupported noise: ${noise}`);
    }
}

/** Density at `e` of zero-mean noise of family `noise` with standard deviation `sigma`; every family peaks at e = 0. */
function noiseDensity(noise, sigma, e) {
    switch (noise) {
        case NOISE.GAUSSIAN:
            return Math.exp(-0.5 * (e / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
        case NOISE.LAPLACE: {
            const b = sigma / Math.SQRT2;
            return Math.exp(-Math.abs(e) / b) / (2 * b);
        }
        case NOISE.UNIFORM: {
            const a = sigma * Math.sqrt(3);
            return Math.abs(e) <= a ? 1 / (2 * a) : 0;
        }
        default:
            throw new Error(`unsupported noise: ${noise}`);
    }
}

/**
 * Point observations H(u) of field `u` at the centres of an n × n grid of equal
 * cells over (t, x), snapped to the nearest grid node. Returns one { k, m, value }
 * per reading, with k the sensor (x) and m the sample (t) index.
 */
function observe(u, n) {
    const readings = [];
    for (let k = 0; k < n; k++) {
        const i = gridIndex((k + 0.5) / n, DX, NX);
        for (let m = 0; m < n; m++) {
            const j = gridIndex(((m + 0.5) / n) * T_END, DT_COLUMN, NT);
            readings.push({ k, m, value: u[j * NX + i] });
        }
    }
    return readings;
}

/** `count` noise draws ε from family `noise` with deviation `sigma`, seeded with `seed`. */
function drawNoise(count, { noise, sigma, seed }) {
    const uniform = mulberry32(seed);
    return Float64Array.from({ length: count }, () => noiseSample(noise, sigma, uniform));
}

// === Geometry ===

/** Pixel layout and scales of one frame for a frame `width`. */
function geometry(width) {
    const fw = Math.max(FRAME_MIN_W, width - AXIS_W - 1);

    return {
        width: AXIS_W + fw + 1,
        height: LABEL_H + FRAME_H + AXIS_H,
        field: { x: AXIS_W, y: LABEL_H, w: fw, h: FRAME_H },
        t: d3.scaleLinear([0, T_END], [AXIS_W, AXIS_W + fw]),
        x: d3.scaleLinear([0, 1], [LABEL_H + FRAME_H, LABEL_H]),
    };
}

// === Mount ===

const root = d3.select(`#${ROOT_ID}`).classed("pde-playground", true);
const row = root.append("div").attr("class", "obs-frames");
const frames = Object.fromEntries(
    FRAMES.map(({ key, title, note }) => {
        const el = row.append("div").attr("class", `obs-frame obs-frame-${key}`);
        const head = el.append("div").attr("class", "obs-title");
        head.append("span").text(title);
        head.append("span").attr("class", "obs-note").text(note);
        const stage = el.append("div").attr("class", "pde-stage");
        const canvas = key === FRAME.STATE ? stage.append("canvas").attr("class", "pde-canvas") : null;
        const svg = stage.append("svg").attr("class", "pde-svg");
        return [key, { el, canvas, svg }];
    }),
);
const controls = root.append("div").attr("class", "chart-controls");

// Off-screen buffer holding one pixel per grid node (t right, x up)
const buffer = document.createElement("canvas");
buffer.width = NT;
buffer.height = NX;

const settings = { n: N_OBS.default, noise: NOISE.GAUSSIAN, sigma: SIGMA.default, seed: SEED_DEFAULT };
let solution = solve(defaultState());
let geo = null;
let dist = null; // { svg, e, y } of the distribution panel; build() sets the scales
let builtWidth = 0; // frame width the figure was last built for
let frame = 0;

// === Rendering ===

/** Schedules one draw on the next animation frame. */
function requestRender() {
    if (!frame) frame = requestAnimationFrame(render);
}

/** Recomputes H(u), ε and y from `solution` and redraws the frames and the distribution panel. */
function render() {
    frame = 0;
    const observed = observe(solution, settings.n);
    const eps = drawNoise(observed.length, settings);
    const data = observed.map((r, k) => ({ ...r, value: r.value + eps[k] }));

    paintField(solution, frames[FRAME.STATE].canvas.node(), buffer);
    drawCells(FRAME.OBSERVED, observed);
    drawCells(FRAME.DATA, data);
    drawDistribution(eps);
}

/** Draws one block per reading in frame `key`, tiling the field and coloured by value. */
function drawCells(key, readings) {
    const t = (m) => geo.t((m / settings.n) * T_END);
    const x = (k) => geo.x(k / settings.n);
    frames[key].svg
        .select(".obs-cells")
        .selectAll("rect")
        .data(readings)
        .join("rect")
        .attr("class", "obs-cell")
        .attr("x", (d) => t(d.m))
        .attr("y", (d) => x(d.k + 1))
        .attr("width", (d) => t(d.m + 1) - t(d.m))
        .attr("height", (d) => x(d.k) - x(d.k + 1))
        .attr("fill", (d) => heatColor(d.value).formatRgb());
}

/**
 * Draws the density of ε and a histogram of the draws `eps`, both divided by the
 * density's peak so the panel keeps its height as σ changes, plus markers at ±σ.
 */
function drawDistribution(eps) {
    const { noise, sigma } = settings;
    const peak = noiseDensity(noise, sigma, 0);
    const { svg, e, y } = dist;
    const binWidth = (2 * EPS_MAX) / DIST_BINS;

    // Histogram of the draws as a density; draws outside the panel are dropped
    const bins = d3.bin()
        .domain(e.domain())
        .thresholds(d3.range(1, DIST_BINS).map((k) => -EPS_MAX + k * binWidth))(eps);
    const height = (b) => Math.min(DIST_HEADROOM, b.length / (eps.length * binWidth * peak));
    svg.select(".obs-dist-bars")
        .selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("class", "obs-dist-bar")
        .attr("x", (b) => e(b.x0) + 0.5)
        .attr("width", (b) => Math.max(0, e(b.x1) - e(b.x0) - 1))
        .attr("y", (b) => y(height(b)))
        .attr("height", (b) => y(0) - y(height(b)));

    // Density curve and ±σ markers
    const curve = d3.range(DIST_POINTS).map((k) => {
        const v = -EPS_MAX + (2 * EPS_MAX * k) / (DIST_POINTS - 1);
        return [e(v), y(noiseDensity(noise, sigma, v) / peak)];
    });
    svg.selectAll(".pde-curve, .pde-curve-halo").attr("d", d3.line()(curve));
    svg.select(".obs-dist-sigma")
        .selectAll("line")
        .data([-sigma, sigma])
        .join("line")
        .attr("class", "pde-midline")
        .attr("x1", (v) => e(v))
        .attr("x2", (v) => e(v))
        .attr("y1", y(0))
        .attr("y2", y(DIST_HEADROOM));
    controls.select(".obs-sigma-out").text(`σ ${fmtSigma(sigma)}`);
}

// === Interaction ===

/** Drag behaviour on the distribution panel: a drag sets σ to the pointer's |ε|, a click draws new noise. */
function distributionDrag() {
    let pressed = null; // { x0, y0, moved } while the panel is pressed

    return d3
        .drag()
        .container(() => dist.svg.node())
        .on("start", (event) => {
            pressed = { x0: event.x, y0: event.y, moved: false };
        })
        .on("drag", (event) => {
            pressed.moved ||= Math.hypot(event.x - pressed.x0, event.y - pressed.y0) > CLICK_DISTANCE;
            if (!pressed.moved) return;

            settings.sigma = Math.max(SIGMA.min, Math.min(SIGMA.max, Math.abs(dist.e.invert(event.x))));
            requestRender();
        })
        .on("end", () => {
            const { moved } = pressed;
            pressed = null;
            if (moved) return;

            settings.seed += 1;
            requestRender();
        });
}

// === Static figure ===

/** Axis styling in the manner of Observable Plot: inherited font, no domain line. */
function plotAxis(g) {
    g.attr("font-family", null).attr("font-size", null).call((g) => g.select(".domain").remove());
}

/** Appends the axes of one frame to `svg`. */
function buildAxes(svg) {
    const { field } = geo;

    // Tick axes, with the axis name and an arrow at the end
    svg.append("g")
        .attr("class", "pde-axis")
        .attr("transform", `translate(${field.x - 2},0)`)
        .call(d3.axisLeft(geo.x).ticks(TICKS).tickSize(TICK_SIZE).tickPadding(TICK_PADDING))
        .call(plotAxis);
    svg.append("g")
        .attr("class", "pde-axis")
        .attr("transform", `translate(0,${field.y + field.h + 2})`)
        .call(d3.axisBottom(geo.t).ticks(TICKS).tickSize(TICK_SIZE).tickPadding(TICK_PADDING))
        .call(plotAxis);
    svg.append("text")
        .attr("class", "pde-axis-label")
        .attr("x", 0)
        .attr("y", field.y - 7)
        .text("↑ x");
    svg.append("text")
        .attr("class", "pde-axis-label")
        .attr("x", field.x + field.w)
        .attr("y", field.y + field.h + AXIS_H - 4)
        .attr("text-anchor", "end")
        .text("t →");
}

/** Rebuilds the distribution panel's SVG for a panel `width`. */
function buildDistribution(width) {
    const { svg } = dist;
    const height = DIST_H + DIST_AXIS_H;
    dist.e = d3.scaleLinear([-EPS_MAX, EPS_MAX], [DIST_PAD, width - DIST_PAD]);
    dist.y = d3.scaleLinear([0, DIST_HEADROOM], [DIST_H, 0]);

    // Plot layers: histogram, ±σ markers, density curve
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height).attr("viewBox", [0, 0, width, height]);
    svg.append("g").attr("class", "obs-dist-bars");
    svg.append("g").attr("class", "obs-dist-sigma");
    svg.append("path").attr("class", "pde-curve-halo");
    svg.append("path").attr("class", "pde-curve");

    // ε axis
    svg.append("g")
        .attr("class", "pde-axis")
        .attr("transform", `translate(0,${DIST_H + 2})`)
        .call(d3.axisBottom(dist.e).ticks(2 * TICKS).tickSize(TICK_SIZE).tickPadding(TICK_PADDING))
        .call(plotAxis);
    svg.append("text")
        .attr("class", "pde-axis-label")
        .attr("x", width - DIST_PAD)
        .attr("y", height - 4)
        .attr("text-anchor", "end")
        .text("ε →");

    // Transparent hit area on top
    svg.append("rect")
        .attr("class", "pde-hit obs-dist-hit")
        .attr("width", width)
        .attr("height", DIST_H)
        .call(distributionDrag());
}

/** Rebuilds every frame's SVG, the state canvas and the distribution panel for the current widths. */
function build() {
    builtWidth = frames[FRAME.STATE].el.node().getBoundingClientRect().width;
    geo = geometry(builtWidth);
    const { field } = geo;
    const dpr = window.devicePixelRatio || 1;

    // Size the state canvas under its field
    frames[FRAME.STATE].canvas
        .attr("width", Math.round(field.w * dpr))
        .attr("height", Math.round(field.h * dpr))
        .style("left", `${field.x}px`)
        .style("top", `${field.y}px`)
        .style("width", `${field.w}px`)
        .style("height", `${field.h}px`)
        .style("mask-image", `${fadeGradient("to right", FIELD_FEATHER)}, ${fadeGradient("to bottom", FIELD_FEATHER)}`);

    // Axes under the reading cells
    for (const { svg } of Object.values(frames)) {
        svg.selectAll("*").remove();
        svg.attr("width", geo.width).attr("height", geo.height).attr("viewBox", [0, 0, geo.width, geo.height]);
        buildAxes(svg);
        svg.append("g").attr("class", "obs-cells");
    }

    buildDistribution(dist.svg.node().parentNode.getBoundingClientRect().width);
    render();
}

// === Controls ===

/** Appends the n slider, the noise family select and the distribution panel. */
function buildControls() {

    // Readings per axis
    const n = controlField(controls, "Readings per axis");
    slider(n, {
        min: N_OBS.min,
        max: N_OBS.max,
        step: 1,
        value: settings.n,
        onInput: (value) => {
            settings.n = value;
            n.select("output").text(`${settings.n} × ${settings.n}`);
            requestRender();
        },
    });
    n.append("output").text(`${settings.n} × ${settings.n}`);

    // Noise family
    const family = controlField(controls, "Noise ε");
    dropdown(family, NOISE_OPTIONS, {
        value: settings.noise,
        onChange: (noise) => {
            settings.noise = noise;
            requestRender();
        },
    });

    // Distribution panel: drag to set σ, click to resample
    const panel = controls.append("div").attr("class", "chart-control obs-dist");
    const head = panel.append("div").attr("class", "obs-title");
    head.append("output").attr("class", "obs-sigma-out chart-control-name");
    head.append("span").attr("class", "obs-note").text("drag to set σ · click to resample");
    dist = { svg: panel.append("svg").attr("class", "pde-svg"), e: null, y: null };
}

buildControls();
document.addEventListener(SOLUTION_EVENT, (event) => {
    solution = event.detail;
    if (geo) requestRender();
});
build();
new ResizeObserver(() => {
    if (Math.abs(frames[FRAME.STATE].el.node().getBoundingClientRect().width - builtWidth) > 1) build();
}).observe(row.node());
