/**
 * Interactive playground for the heat equation in one dimension,
 *
 *     ∂t u − λ ∂xx u = f   on x ∈ (0, 1), t ∈ (0, T_END],
 *
 * solved with explicit finite differences and rendered as u over (t, x). The
 * initial condition u0 and both boundary conditions b are drawn on strips
 * around the field. Clicking empty field space places a Gaussian heat source and
 * selects it; clicking a source selects it, and a toolbar beside the selection
 * changes its strength or removes it. Dragging a source moves it. With the mouse,
 * the wheel over the selected source changes its strength, Delete/Backspace
 * removes it and Escape deselects it.
 * Coefficient and boundary types are set in the controls below the figure.
 * Every re-solve is published on `document` as SOLUTION_EVENT.
 *
 * Expects the globals `d3` (v7) and a mount element `#heat-playground`.
 */

import {
    BC,
    DT_COLUMN,
    DX,
    LAMBDA_MAX,
    LAMBDA_MIN,
    NT,
    NX,
    SOLUTION_EVENT,
    SOURCE_STEP,
    T_END,
    defaultState,
    fadeGradient,
    gridIndex,
    heatColor,
    paintField,
    solve,
    stripDefault,
} from "./heat-rod.js";
import { controlField, dropdown, iconButton, setSliderValue, slider } from "/js/controls.js";
import { ICON } from "/js/icons.js";

// === Layout (px) ===

const LABEL_W = 16;
const STRIP = 40;
const STRIP_PAD = 4;
const AXIS_GAP = 34;
const ROW_GAP = 16;
const FIELD_H = 220;
const FIELD_MIN_W = 120;
const AXIS_H = 38; // t axis row between the field and the x = 0 strip: ticks, tick labels, axis label
const TICK_SIZE = 6;
const TICK_PADDING = 3;
const STRIP_FEATHER = 16; // width over which strip fills fade into the background
const FIELD_FEATHER = 6; // same for the field canvas; kept below a source's width so edge sources stay visible
const PICK_RADIUS = 12; // a press within this distance of a source targets it
const CLICK_DISTANCE = 3; // pointer travel up to which a press counts as a click, not a drag
const WHEEL_STEP_DELTA = 100; // accumulated wheel deltaY per strength step
const TOOLBAR_OFFSET = 18; // px between a source's centre and its toolbar
const MARKER_R_MIN = 3;
const MARKER_R_MAX = 14;
const TICKS = 5;

// === Vocabulary ===

const ROOT_ID = "heat-playground";
const BC_OPTIONS = [
    { value: BC.DIRICHLET, label: "Dirichlet (value u = b)", short: "value" },
    { value: BC.NEUMANN, label: "Neumann (flux ∂ₙu = b)", short: "flux" },
];
const SIDES = [
    { key: "x1", name: "x = 1" },
    { key: "x0", name: "x = 0" },
];


// === Geometry ===

/** Pixel layout and scales of the figure for a container `width`. */
function geometry(width) {
    const fx = LABEL_W + STRIP + AXIS_GAP;
    const fy = STRIP + ROW_GAP;
    const fw = Math.max(FIELD_MIN_W, width - fx - 1);
    const by = fy + FIELD_H + AXIS_H;

    return {
        width: fx + fw + 1,
        height: by + STRIP + 1,
        field: { x: fx, y: fy, w: fw, h: FIELD_H },
        strips: {
            ic: { x: LABEL_W, y: fy, w: STRIP, h: FIELD_H },
            x1: { x: fx, y: 0, w: fw, h: STRIP },
            x0: { x: fx, y: by, w: fw, h: STRIP },
        },
        t: d3.scaleLinear([0, T_END], [fx, fx + fw]),
        x: d3.scaleLinear([0, 1], [fy + FIELD_H, fy]),
        s: {
            ic: d3.scaleLinear([0, 1], [LABEL_W + STRIP_PAD, LABEL_W + STRIP - STRIP_PAD]).clamp(true),
            x1: d3.scaleLinear([0, 1], [STRIP - STRIP_PAD, STRIP_PAD]).clamp(true),
            x0: d3.scaleLinear([0, 1], [by + STRIP - STRIP_PAD, by + STRIP_PAD]).clamp(true),
        },
    };
}

// === Mount ===

const root = d3.select(`#${ROOT_ID}`).classed("pde-playground", true);
const stage = root.append("div").attr("class", "pde-stage");
const canvas = stage.append("canvas").attr("class", "pde-canvas");
const svg = stage.append("svg").attr("class", "pde-svg");
const toolbar = stage.append("div").attr("class", "pde-toolbar").property("hidden", true);
const controls = root.append("div").attr("class", "chart-controls");
// root.append("figcaption").text(
//     "Figure 1: Heat diffusion ∂ₜu − λ∂ₓₓu = f on x ∈ (0, 1), with drawable initial and boundary conditions and placeable sources",
// );

// Off-screen buffer holding one pixel per grid node (t right, x up)
const buffer = document.createElement("canvas");
buffer.width = NT;
buffer.height = NX;

let state = defaultState();
let geo = null;
let builtWidth = 0; // container width the figure was last built for
let solution = solve(state);
let pressed = null; // { source, x0, y0, moved } while the field is pressed; source is null on empty space
let selected = null; // source the toolbar edits
let wheelDelta = 0; // wheel deltaY accumulated towards the next strength step
let frame = 0;

// === Rendering ===

/** Schedules one solve-and-draw on the next animation frame. */
function requestRender() {
    if (!frame) frame = requestAnimationFrame(render);
}

/** Re-solves the system, publishes the solution as SOLUTION_EVENT and redraws every dynamic part of the figure. */
function render() {
    frame = 0;
    solution = solve(state);
    document.dispatchEvent(new CustomEvent(SOLUTION_EVENT, { detail: solution }));
    paintField(solution, canvas.node(), buffer);
    drawStrips();
    drawSources();
    drawToolbar();
}

/** Strip values and point mapping for strip `key`: IC runs along x, boundaries along t. */
function stripModel(key) {
    if (key === "ic") {
        return {
            values: state.ic,
            colored: true,
            point: (k, s) => [geo.s.ic(s), geo.x(k * DX)],
        };
    }
    const { type, values } = state.bc[key];
    return {
        values,
        colored: type === BC.DIRICHLET,
        point: (k, s) => [geo.t(k * DT_COLUMN), geo.s[key](s)],
    };
}

/** Redraws gradient colours, reference line and drawn curve of every strip. */
function drawStrips() {
    for (const key of ["ic", "x1", "x0"]) {
        const { values, colored, point } = stripModel(key);
        const g = svg.select(`.pde-strip-${key}`);

        g.select(".pde-fill").attr("visibility", colored ? "visible" : "hidden");
        svg.selectAll(`#pde-grad-${key} stop`)
            .attr("stop-color", (k) => heatColor(values[k]).copy({ opacity: 1 }).formatRgb())
            .attr("stop-opacity", (k) => heatColor(values[k]).opacity);
        g.select(".pde-midline").attr("visibility", colored ? "hidden" : "visible");
        g.selectAll(".pde-curve, .pde-curve-halo").attr("d", d3.line()(Array.from(values, (s, k) => point(k, s))));
    }

    for (const { key } of SIDES) {
        const short = BC_OPTIONS.find((o) => o.value === state.bc[key].type).short;
        svg.select(`.pde-side-${key} .pde-side-type`).text(short);
    }
}

/** Redraws one marker per source, sized by amplitude. */
function drawSources() {
    const radius = (amp) => Math.min(MARKER_R_MAX, MARKER_R_MIN + 1.5 * Math.sqrt(amp));
    svg.select(".pde-sources")
        .selectAll("g")
        .data(state.sources)
        .join((enter) => {
            const g = enter.append("g");
            g.append("circle").attr("class", "pde-marker-halo");
            g.append("circle").attr("class", "pde-marker");
            return g;
        })
        .classed("is-selected", (d) => d === selected)
        .attr("transform", (d) => `translate(${geo.t(d.t)},${geo.x(d.x)})`)
        .selectAll("circle")
        .attr("r", function () {
            return radius(d3.select(this.parentNode).datum().amp);
        });
}

/** Shows the toolbar above the selected source (below it near the top edge), or hides it. */
function drawToolbar() {
    toolbar.property("hidden", !selected);
    if (!selected) return;

    toolbar.select(".pde-strength").text(Math.round(selected.amp));
    toolbar.select(".pde-weaken").property("disabled", selected.amp <= SOURCE_STEP);

    const { offsetWidth: w, offsetHeight: h } = toolbar.node();
    const cx = geo.t(selected.t);
    const cy = geo.x(selected.x);
    const above = cy - TOOLBAR_OFFSET - h;
    toolbar
        .style("left", `${Math.max(0, Math.min(geo.width - w, cx - w / 2))}px`)
        .style("top", `${above >= 0 ? above : cy + TOOLBAR_OFFSET}px`);
}

// === Interaction ===

/** Drag behaviour that writes the pointer position into strip `key`, filling gaps between events. */
function stripDrag(key) {
    let last = null;

    const write = (event) => {
        const { values } = stripModel(key);
        const [k, s] =
            key === "ic"
                ? [gridIndex(geo.x.invert(event.y), DX, NX), geo.s.ic.invert(event.x)]
                : [gridIndex(geo.t.invert(event.x), DT_COLUMN, NT), geo.s[key].invert(event.y)];

        // Linearly fill every index skipped since the previous event
        const [k0, s0] = last ?? [k, s];
        const span = Math.abs(k - k0);
        for (let step = 0; step <= span; step++) {
            const w = span === 0 ? 1 : step / span;
            values[Math.round(k0 + (k - k0) * w)] = s0 + (s - s0) * w;
        }
        last = [k, s];
        requestRender();
    };

    return d3
        .drag()
        .container(svg.node())
        .on("start", (event) => {
            last = null;
            write(event);
        })
        .on("drag", write);
}

/** Moves `source` to the pointer position, clamped to the domain. */
function placeSource(source, event) {
    source.t = Math.max(0, Math.min(T_END, geo.t.invert(event.x)));
    source.x = Math.max(0, Math.min(1, geo.x.invert(event.y)));
}

/** Source within PICK_RADIUS of pixel (px, py), or undefined. */
function sourceAt(px, py) {
    return state.sources.find((d) => Math.hypot(geo.t(d.t) - px, geo.x(d.x) - py) < PICK_RADIUS);
}

/** Places a new source of amplitude SOURCE_STEP at the pointer and returns it. */
function addSource(event) {
    const source = { x: 0, t: 0, amp: SOURCE_STEP };
    placeSource(source, event);
    state.sources.push(source);
    return source;
}

/** Changes the selected source's amplitude by `steps` × SOURCE_STEP, never below SOURCE_STEP. */
function adjustSelected(steps) {
    if (!selected) return;

    selected.amp = Math.max(SOURCE_STEP, selected.amp + steps * SOURCE_STEP);
    requestRender();
}

/** Removes the selected source and clears the selection. */
function removeSelected() {
    if (!selected) return;

    state.sources = state.sources.filter((d) => d !== selected);
    selected = null;
    requestRender();
}

/**
 * Drag behaviour on the field. A click (travel ≤ CLICK_DISTANCE) selects the source under
 * the pointer; on empty space it deselects, or places and selects a new source when nothing
 * is selected. A drag moves the source under the pointer (and selects it); no-op on empty space.
 */
function fieldDrag() {
    return d3
        .drag()
        .container(svg.node())
        .on("start", (event) => {
            pressed = { source: sourceAt(event.x, event.y) ?? null, x0: event.x, y0: event.y, moved: false };
        })
        .on("drag", (event) => {
            pressed.moved ||= Math.hypot(event.x - pressed.x0, event.y - pressed.y0) > CLICK_DISTANCE;
            if (!pressed.moved || !pressed.source) return;

            selected = pressed.source;
            placeSource(pressed.source, event);
            requestRender();
        })
        .on("end", (event) => {
            const { source, moved } = pressed;
            pressed = null;
            if (moved) return;

            selected = source ?? (selected ? null : addSource(event));
            requestRender();
        });
}

/** Wheel over the selected source changes its strength by one step per WHEEL_STEP_DELTA. */
function wheelStrength(event) {
    const [px, py] = d3.pointer(event, svg.node());
    if (!selected || sourceAt(px, py) !== selected) return;

    event.preventDefault();
    wheelDelta += event.deltaY;
    const steps = Math.trunc(wheelDelta / WHEEL_STEP_DELTA);
    if (steps === 0) return;

    wheelDelta -= steps * WHEEL_STEP_DELTA;
    adjustSelected(-steps); // wheel up (negative deltaY) strengthens
}

/** Delete/Backspace removes the selected source and Escape deselects it, unless a form control has focus. */
function keyCommand(event) {
    if (!selected || event.target.closest?.("input, select, textarea")) return;

    switch (event.key) {
        case "Delete":
        case "Backspace":
            removeSelected();
            break;
        case "Escape":
            selected = null;
            requestRender();
            break;
        default:
            return;
    }
    event.preventDefault();
}

// === Static figure ===

/** Appends strip `key` (clipped gradient fill, reference line, curve, hit area) for rectangle `r`. */
function buildStrip(defs, key, r) {
    const g = svg.append("g").attr("class", `pde-strip pde-strip-${key}`);
    const clipId = `pde-clip-${key}`;
    defs.append("clipPath")
        .attr("id", clipId)
        .append("rect")
        .attr("x", r.x)
        .attr("y", r.y)
        .attr("width", r.w)
        .attr("height", r.h);

    // Feathered mask: an inset rectangle blurred so the fill fades out over STRIP_FEATHER
    const maskId = `pde-mask-${key}`;
    defs.append("mask")
        .attr("id", maskId)
        .attr("maskUnits", "userSpaceOnUse")
        .attr("x", r.x)
        .attr("y", r.y)
        .attr("width", r.w)
        .attr("height", r.h)
        .append("rect")
        .attr("x", r.x + STRIP_FEATHER / 2)
        .attr("y", r.y + STRIP_FEATHER / 2)
        .attr("width", r.w - STRIP_FEATHER)
        .attr("height", r.h - STRIP_FEATHER)
        .attr("fill", "white")
        .attr("filter", "url(#pde-feather)");

    // Gradient with one stop per grid node, along x (IC) or t (boundaries)
    const along = key === "ic";
    const n = along ? NX : NT;
    defs.append("linearGradient")
        .attr("id", `pde-grad-${key}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", along ? 0 : geo.t(0))
        .attr("x2", along ? 0 : geo.t(T_END))
        .attr("y1", along ? geo.x(0) : 0)
        .attr("y2", along ? geo.x(1) : 0)
        .selectAll("stop")
        .data(d3.range(n))
        .join("stop")
        .attr("offset", (k) => k / (n - 1));

    // Fill and curve, clipped to the rounded strip
    const inner = g.append("g").attr("clip-path", `url(#${clipId})`);
    inner.append("rect")
        .attr("class", "pde-fill")
        .attr("x", r.x)
        .attr("y", r.y)
        .attr("width", r.w)
        .attr("height", r.h)
        .attr("fill", `url(#pde-grad-${key})`)
        .attr("mask", `url(#${maskId})`);
    if (!along) {
        const mid = geo.s[key](0.5);
        inner.append("line")
            .attr("class", "pde-midline")
            .attr("x1", r.x)
            .attr("x2", r.x + r.w)
            .attr("y1", mid)
            .attr("y2", mid);
    }
    inner.append("path").attr("class", "pde-curve-halo");
    inner.append("path").attr("class", "pde-curve");

    // Transparent hit area on top
    g.append("rect")
        .attr("class", "pde-hit pde-hit-strip")
        .attr("x", r.x)
        .attr("y", r.y)
        .attr("width", r.w)
        .attr("height", r.h)
        .call(stripDrag(key));
}

/** Appends axes and the labels naming the field, strips and boundaries. */
function buildLabels() {
    const { field, strips } = geo;

    // Axes in the style of Observable Plot: no domain line, axis name with an arrow at the end
    const axis = (g) => g.attr("font-family", null).attr("font-size", null).call((g) => g.select(".domain").remove());
    svg.append("g")
        .attr("class", "pde-axis")
        .attr("transform", `translate(${field.x - 2},0)`)
        .call(d3.axisLeft(geo.x).ticks(TICKS).tickSize(TICK_SIZE).tickPadding(TICK_PADDING))
        .call(axis);
    svg.append("g")
        .attr("class", "pde-axis")
        .attr("transform", `translate(0,${field.y + field.h + 2})`)
        .call(d3.axisBottom(geo.t).ticks(TICKS).tickSize(TICK_SIZE).tickPadding(TICK_PADDING))
        .call(axis);
    svg.append("text")
        .attr("class", "pde-axis-label")
        .attr("x", field.x - AXIS_GAP + 4)
        .attr("y", field.y - 6)
        .text("↑ x");
    svg.append("text")
        .attr("class", "pde-axis-label")
        .attr("x", field.x + field.w)
        .attr("y", field.y + field.h + AXIS_H - 6)
        .attr("text-anchor", "end")
        .text("t →");

    // Rotated initial-condition label beside its strip
    const icMid = strips.ic.y + strips.ic.h / 2;
    svg.append("text")
        .attr("class", "pde-label")
        .attr("transform", `translate(${LABEL_W - 4},${icMid}) rotate(-90)`)
        .attr("text-anchor", "middle")
        .text("IC · u₀(x)");

    // Boundary labels left of each boundary strip: side and condition type
    for (const { key, name } of SIDES) {
        const r = strips[key];
        const text = svg.append("text")
            .attr("class", `pde-label pde-side-${key}`)
            .attr("text-anchor", "end")
            .attr("x", field.x - 8)
            .attr("y", r.y + r.h / 2 - 2);
        text.append("tspan").text(`BC ${name}`);
        text.append("tspan")
            .attr("class", "pde-side-type")
            .attr("x", field.x - 8)
            .attr("dy", "1.2em");
    }
}

/** Rebuilds the whole SVG and canvas for the current container width. */
function build() {
    builtWidth = root.node().getBoundingClientRect().width;
    geo = geometry(builtWidth);
    const { field } = geo;
    const dpr = window.devicePixelRatio || 1;

    // Size the drawing surfaces
    svg.selectAll("*").remove();
    svg.attr("width", geo.width).attr("height", geo.height).attr("viewBox", [0, 0, geo.width, geo.height]);
    canvas
        .attr("width", Math.round(field.w * dpr))
        .attr("height", Math.round(field.h * dpr))
        .style("left", `${field.x}px`)
        .style("top", `${field.y}px`)
        .style("width", `${field.w}px`)
        .style("height", `${field.h}px`)
        .style("mask-image", `${fadeGradient("to right", FIELD_FEATHER)}, ${fadeGradient("to bottom", FIELD_FEATHER)}`);

    // Strips, then the source markers and the field's hit area
    const defs = svg.append("defs");
    defs.append("filter")
        .attr("id", "pde-feather")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%")
        .append("feGaussianBlur")
        .attr("stdDeviation", STRIP_FEATHER / 4);
    for (const [key, r] of Object.entries(geo.strips)) buildStrip(defs, key, r);
    svg.append("g").attr("class", "pde-sources");
    svg.append("rect")
        .attr("class", "pde-hit pde-hit-field")
        .attr("x", field.x)
        .attr("y", field.y)
        .attr("width", field.w)
        .attr("height", field.h)
        .on("wheel", wheelStrength, { passive: false })
        .call(fieldDrag());

    buildLabels();
    render();
}

// === Controls ===

const lambdaScale = d3.scaleLog([LAMBDA_MIN, LAMBDA_MAX], [0, 1]);
const fmtLambda = d3.format(".4f"); // α with four decimals: 0.0010 to 0.1000

/** Writes `state` into the form controls. */
function syncControls() {
    setSliderValue(controls.select(".pde-lambda"), lambdaScale(state.lambda));
    controls.select(".pde-lambda-out").text(fmtLambda(state.lambda));
    for (const { key } of SIDES) {
        controls.select(`.pde-bc-${key}`).property("value", state.bc[key].type);
    }
}

/** Appends the selection toolbar's buttons: weaken, strength readout, strengthen, remove. */
function buildToolbar() {
    const button = (cls, label, icon, onClick) => iconButton(toolbar, { label, icon, onClick }).classed(cls, true);

    button("pde-weaken", "Weaken source", ICON.MINUS, () => adjustSelected(-1));
    toolbar.append("output").attr("class", "pde-strength");
    button("pde-strengthen", "Strengthen source", ICON.PLUS, () => adjustSelected(1));
    button("pde-remove", "Remove source", ICON.CLOSE, removeSelected);
}

/** Appends the boundary selects (first row), then the coefficient slider and colour legend. */
function buildControls() {

    // Boundary type per side; switching resets that strip to the type's neutral value
    for (const { key, name } of SIDES) {
        const side = controlField(controls, `BC at ${name}`);
        dropdown(side, BC_OPTIONS, {
            onChange: (type) => {
                state.bc[key].type = type;
                state.bc[key].values.fill(stripDefault(type));
                requestRender();
            },
        }).classed(`pde-bc-${key}`, true);
    }

    // Diffusivity on a log scale
    const lambda = controlField(controls, "Diffusivity α");
    slider(lambda, {
        min: 0,
        max: 1,
        step: 0.001,
        onInput: (value) => {
            state.lambda = lambdaScale.invert(value);
            controls.select(".pde-lambda-out").text(fmtLambda(state.lambda));
            requestRender();
        },
    }).classed("pde-lambda", true);
    lambda.append("output").attr("class", "pde-lambda-out");

    // Colour legend
    const legend = controlField(controls, "Temperature u").append("div").attr("class", "chart-legend");
    legend.append("span").text("0");
    legend.append("span")
        .attr("class", "chart-legend-bar")
        .style("background", `linear-gradient(to right, ${d3.quantize(heatColor, 11).map((c) => c.formatRgb()).join(", ")})`);
    legend.append("span").text("1");

    syncControls();
}

buildControls();
buildToolbar();
d3.select(document).on("keydown.pde", keyCommand);
build();
new ResizeObserver(() => {
    if (Math.abs(root.node().getBoundingClientRect().width - builtWidth) > 1) build();
}).observe(root.node());
