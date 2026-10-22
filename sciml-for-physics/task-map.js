/**
 * Task map: a heatmap of the problem and method cards by what they need to know of
 * each component of the system and what they produce. Columns are the levels of five
 * components (operator 𝒩, parameters λ, forcing f, state u, observation ℋ),
 * ordered from needing nothing to needing everything; rows are the produced
 * quantities, grouped by training corpus (problems) or by where the physics enters
 * (methods). A cell counts the cards placed exactly there.
 *
 * Clicking builds a query: a level keeps the cards that need that much or less of
 * its component, a row keeps its task and group; an empty query keeps every card
 * of the view. Below the map, arrows page through the kept cards one at a time,
 * each shown in full as the `<main>` of its own page, next to the switch between
 * problems and methods. A related-card link inside a card moves the query to that
 * card instead of leaving the page.
 *
 * The map is as wide as its columns need; wider than the text column it extends to
 * both sides, and scrolls once it reaches the viewport.
 *
 * Adapted from the "SciML Problem and Method Map" artifact.
 *
 * Expects the global `d3` (v7) and a mount element `#task-map`.
 */

import { ICON } from "./icons.js";
import { COMP, TARGETS, TYPE, VIEWS, fillRelations, groupOf, loadCards, targetLabel, viewOf } from "./sciml-map.js";

const ROOT_ID = "task-map";
const EMPTY_NOTE = "No card matches.";

// === Layout (px) ===

const PITCH = 28; // distance between neighbouring cells, along both axes
const CELL = 26; // side of a square cell
const INSET = (PITCH - CELL) / 2;
const RADIUS = 3; // cell corner radius
const GAP = 12; // between component blocks
const INDENT = 16; // offset of the task rows under their group header
const COL_TASK = 150; // task label column, labels right-aligned against the cells
const LEFT = INDENT + COL_TASK; // first cell column
const LABEL_PAD = 10; // between the task labels and the first cell column
const GROUP_GAP = 16; // between two groups; the group rule sits in its middle
const GROUP_H = 20; // group header line above its rows
const TOP = 120; // first row; the first group rule and the rotated level labels sit above it
const AXIS_Y = 12; // baseline of the axis titles
const HEAD_Y = 30; // baseline of the column headers; their rules sit HEAD_RULE below
const HEAD_RULE = 6;
const SYM_W = 16; // component symbol, before its name
const GROUP_LABEL_Y = 13; // group label baseline within its header line
const ROW_LABEL_Y = 13; // task label baseline within its row
const ROW_SUB_Y = 24; // task subtitle baseline within its row
const LEVEL_HIT = { x: -2, y: -9, w: 84, h: 16 }; // click area of a rotated level label, along the label
const BOTTOM_PAD = 8; // below the closing group rule
const RIGHT_PAD = 40; // room for the last rotated level label
const LEVEL_ANGLE = -55;
const MARK_PAD = 3; // horizontal padding of a highlighted label
const MIN_SHADE = 0.3; // accent opacity of a cell holding one card when the maximum is large

// === Query ===

// Query fields: the selected level per component, and the selected row's task and group
const QUERY_KEYS = [...COMP.map((c) => c.key), "target", "group"];

// Kinds of status chip: the selected row, a selected level, and the reset
const CHIP = Object.freeze({ ROW: "row", LEVEL: "level", CLEAR: "clear" });

/** Empty query: no level per component, no row. */
function emptyQuery() {
    return Object.fromEntries(QUERY_KEYS.map((k) => [k, null]));
}

/** Whether `card` needs no more than each selected level and lies in the selected row. */
function passes(q, card) {
    for (const c of COMP) {
        if (q[c.key] && c.idx[card.needs[c.key]] > c.idx[q[c.key]]) return false;
    }
    if (q.target && !card.tasks.includes(q.target)) return false;
    if (q.group && groupOf(card) !== q.group) return false;
    return true;
}

/** Cards of `row` placed exactly at `lvl` of component `c` that the query keeps. */
function cellCount(state, row, c, lvl) {
    return state.items.filter(
        (p) =>
            p.needs[c.key] === lvl && p.tasks.includes(row.t.key) && groupOf(p) === row.group && passes(state.query, p),
    ).length;
}

/** Select `col`'s level for its component, or clear it when already selected. */
function toggleLevel(q, col) {
    q[col.comp.key] = q[col.comp.key] === col.lvl ? null : col.lvl;
}

/** Select row `r`, or clear the row when `r` is already selected. */
function toggleRow(q, r) {
    const isSelected = q.target === r.t.key && q.group === r.group;
    Object.assign(q, isSelected ? { target: null, group: null } : { target: r.t.key, group: r.group });
}

/** Add a cell's level and row to the query; on the selected cell remove its level, and the row once no level is left. */
function toggleCell(q, d) {
    const k = d.col.comp.key;
    const isSelected = q[k] === d.col.lvl && q.target === d.r.t.key && q.group === d.r.group;
    if (!isSelected) {
        Object.assign(q, { [k]: d.col.lvl, target: d.r.t.key, group: d.r.group });
        return;
    }
    q[k] = null;
    if (!COMP.some((c) => q[c.key])) Object.assign(q, { target: null, group: null });
}

/** Remove `chip`'s constraint from the query: its row, its component's level, or everything. */
function removeChip(q, chip) {
    switch (chip.kind) {
        case CHIP.ROW:
            Object.assign(q, { target: null, group: null });
            return;
        case CHIP.LEVEL:
            q[chip.key] = null;
            return;
        case CHIP.CLEAR:
            Object.assign(q, emptyQuery());
            return;
        default:
            throw new Error(`task-map: unsupported chip kind "${chip.kind}"`);
    }
}

/** The query that selects exactly `card`'s placement: its levels, first task and group. */
function queryOf(card) {
    return { ...card.needs, target: card.tasks[0], group: groupOf(card) };
}

// === Geometry ===

/**
 * Column positions: one column per level, and one block per component spanning its
 * levels from `x0` to `x1`; blocks are separated by GAP.
 */
function layoutCols() {
    const cols = [];
    const blocks = [];
    let x = LEFT;
    for (const c of COMP) {
        const x0 = x;
        for (const lvl of c.levels) {
            cols.push({ comp: c, lvl, x });
            x += PITCH;
        }
        blocks.push({ comp: c, x0, x1: x });
        x += GAP;
    }
    return { cols, blocks, right: x - GAP };
}

/** Rows: per group with any card, a header line, then one row per task some card of that group produces. */
function layoutRows(view, items) {
    const groups = [];
    const rows = [];
    let y = TOP;
    for (const group of view.groups) {
        const inGroup = items.filter((p) => groupOf(p) === group);
        if (!inGroup.length) continue;

        const g = { group, y, rows: [] };
        y += GROUP_H;
        for (const t of TARGETS) {
            if (!inGroup.some((p) => p.tasks.includes(t.key))) continue;
            const r = { group, t, y };
            rows.push(r);
            g.rows.push(r);
            y += PITCH;
        }
        groups.push(g);
        y += GROUP_GAP;
    }
    return { groups, rows, bottom: y - GROUP_GAP };
}

/**
 * Outlines of the query's level ranges: per selected component, one rounded box from
 * its first level to the selected one, over the selected row or else over each group's rows.
 */
function rangeBoxes(q, groups, blocks) {
    // Row spans the boxes cover: the selected row alone, or each group's rows
    const spans = q.target
        ? [groups.flatMap((g) => g.rows).filter((r) => r.t.key === q.target && r.group === q.group)]
        : groups.map((g) => g.rows);

    // One box per selected component and span, inset by half a pixel so the 1px stroke stays sharp
    const boxes = [];
    for (const { comp: c, x0 } of blocks) {
        if (!q[c.key]) continue;
        const levels = c.idx[q[c.key]] + 1;
        for (const rows of spans) {
            if (!rows.length) continue;
            boxes.push({ x: x0 + 0.5, y: rows[0].y + 0.5, w: levels * PITCH - 1, h: rows.length * PITCH - 1 });
        }
    }
    return boxes;
}

// === Matrix ===

/** Column headers: axis titles, the group and task headings, and one symbol, name and rule per component. */
function drawHeaders(svg, view, blocks) {
    svg.append("text").attr("class", "task-map-axis").attr("x", 0).attr("y", AXIS_Y).text("What it produces");
    svg.append("text")
        .attr("class", "task-map-axis")
        .attr("x", LEFT)
        .attr("y", AXIS_Y)
        .text("What it needs to know, from nothing to everything");

    svg.append("text").attr("class", "task-map-head").attr("x", 0).attr("y", HEAD_Y).text(view.groupHead);
    svg.append("text")
        .attr("class", "task-map-head")
        .attr("x", LEFT - LABEL_PAD)
        .attr("y", HEAD_Y)
        .attr("text-anchor", "end")
        .text("task");
    svg.append("line")
        .attr("class", "task-map-rule")
        .attr("x1", 0)
        .attr("x2", LEFT - LABEL_PAD)
        .attr("y1", HEAD_Y + HEAD_RULE)
        .attr("y2", HEAD_Y + HEAD_RULE);
    for (const { comp: c, x0, x1 } of blocks) {
        svg.append("text").attr("class", "task-map-comp").attr("x", x0).attr("y", HEAD_Y).text(c.sym);
        svg.append("text")
            .attr("class", "task-map-head")
            .attr("x", x0 + SYM_W)
            .attr("y", HEAD_Y)
            .text(c.name);
        svg.append("line")
            .attr("class", "task-map-rule")
            .attr("x1", x0)
            .attr("x2", x1)
            .attr("y1", HEAD_Y + HEAD_RULE)
            .attr("y2", HEAD_Y + HEAD_RULE);
    }
}

/** Draw the empty matrix of `state.view` into `svg`; returns the selections and layout `paintMatrix` updates. */
function drawMatrix(svg, box, state, onChange) {
    const { cols, blocks, right } = layoutCols();
    const { groups, rows, bottom } = layoutRows(state.view, state.items);
    const width = right + RIGHT_PAD;
    const height = bottom + BOTTOM_PAD;
    const q = state.query;

    svg.selectAll("*").remove();
    svg.attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("aria-label", `Heatmap of ${state.view.noun} by required information and produced quantity`);
    box.style("--map-w", `${width}px`);
    drawHeaders(svg, state.view, blocks);

    // Rotated level labels; a click selects that level, a second click clears it
    const levels = svg
        .append("g")
        .selectAll("g")
        .data(cols)
        .join("g")
        .attr("class", "task-map-level")
        .attr(
            "transform",
            (col) => `translate(${col.x + PITCH / 2}, ${TOP - GROUP_GAP / 2 - 6}) rotate(${LEVEL_ANGLE})`,
        )
        .on("click", (_, col) => {
            toggleLevel(q, col);
            onChange();
        });
    levels
        .append("rect")
        .attr("class", "task-map-hit")
        .attr("x", LEVEL_HIT.x)
        .attr("y", LEVEL_HIT.y)
        .attr("width", LEVEL_HIT.w)
        .attr("height", LEVEL_HIT.h);
    levels.append("rect").attr("class", "task-map-mark");
    levels
        .append("text")
        .attr("x", 0)
        .attr("y", 4)
        .text((col) => col.lvl);

    // Group rules above each group, the closing rule below the last, and the group label on its header line
    const gr = svg.append("g");
    gr.selectAll("line")
        .data(groups)
        .join("line")
        .attr("class", "task-map-rule")
        .attr("x1", 0)
        .attr("x2", right)
        .attr("y1", (g) => g.y - GROUP_GAP / 2)
        .attr("y2", (g) => g.y - GROUP_GAP / 2);
    gr.append("line")
        .attr("class", "task-map-rule")
        .attr("x1", 0)
        .attr("x2", right)
        .attr("y1", bottom + GROUP_GAP / 2)
        .attr("y2", bottom + GROUP_GAP / 2);
    gr.selectAll("text")
        .data(groups)
        .join("text")
        .attr("class", "task-map-group")
        .attr("x", 0)
        .attr("y", (g) => g.y + GROUP_LABEL_Y)
        .text((g) => g.group);

    // Task labels, right-aligned against the cells; a click selects the row, a second click clears it
    const rowSel = svg
        .append("g")
        .selectAll("g")
        .data(rows)
        .join("g")
        .attr("class", "task-map-row")
        .on("click", (_, r) => {
            toggleRow(q, r);
            onChange();
        });
    rowSel
        .append("rect")
        .attr("class", "task-map-hit")
        .attr("x", INDENT)
        .attr("y", (r) => r.y)
        .attr("width", COL_TASK - LABEL_PAD)
        .attr("height", PITCH);
    rowSel.append("rect").attr("class", "task-map-mark");
    rowSel
        .append("text")
        .attr("class", "task-map-rowlab")
        .attr("x", LEFT - LABEL_PAD)
        .attr("y", (r) => r.y + ROW_LABEL_Y)
        .text((r) => r.t.label);
    rowSel
        .append("text")
        .attr("class", "task-map-rowsub")
        .attr("x", LEFT - LABEL_PAD)
        .attr("y", (r) => r.y + ROW_SUB_Y)
        .text((r) => r.t.sub);

    // Cells: a grey base with the accent on top at an opacity set by the count; a click (or Enter/Space)
    // adds the cell's level and row to the query, on the selected cell it removes them
    const toggle = (d) => {
        toggleCell(q, d);
        onChange();
    };
    const cells = svg
        .append("g")
        .selectAll("g")
        .data(cols.flatMap((col) => rows.map((r) => ({ col, r }))))
        .join("g");
    const square = (sel, cls) =>
        sel
            .append("rect")
            .attr("class", cls)
            .attr("x", (d) => d.col.x + INSET)
            .attr("y", (d) => d.r.y + INSET)
            .attr("width", CELL)
            .attr("height", CELL)
            .attr("rx", RADIUS);
    square(cells, "task-map-cell")
        .attr("tabindex", 0)
        .on("click", (_, d) => toggle(d))
        .on("keydown", (e, d) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            toggle(d);
        })
        .append("title");
    square(cells, "task-map-fill");
    cells
        .append("text")
        .attr("class", "task-map-count")
        .attr("x", (d) => d.col.x + PITCH / 2)
        .attr("y", (d) => d.r.y + PITCH / 2 + 4);

    // Range outlines go on top and let clicks through to the cells
    const ranges = svg.append("g").attr("class", "task-map-ranges");

    return { cells, levels, rowSel, ranges, groups, blocks };
}

/** Recount the cells and set their accent opacity, outline the selected ranges, and mark the selected levels and row. */
function paintMatrix(state, { cells, levels, rowSel, ranges, groups, blocks }) {
    const q = state.query;

    // Count per cell, and the largest count, which sets full opacity
    cells.each((d) => (d.n = cellCount(state, d.r, d.col.comp, d.col.lvl)));
    const max = Math.max(1, ...cells.data().map((d) => d.n));

    // Accent opacity, tooltip and count text of each cell
    cells
        .select(".task-map-fill")
        .style("fill-opacity", (d) => (d.n === 0 ? 0 : MIN_SHADE + (1 - MIN_SHADE) * (d.n / max)));
    cells
        .select(".task-map-cell title")
        .text((d) => `${d.r.t.label}, ${d.r.group}, ${d.col.comp.sym} = ${d.col.lvl}: ${d.n}`);
    cells
        .select("text")
        .text((d) => d.n || "")
        .classed("is-zero", (d) => d.n === 0);

    // Outlines of the selected level ranges
    ranges
        .selectAll("rect")
        .data(rangeBoxes(q, groups, blocks))
        .join("rect")
        .attr("x", (b) => b.x)
        .attr("y", (b) => b.y)
        .attr("width", (b) => b.w)
        .attr("height", (b) => b.h)
        .attr("rx", RADIUS + 1);

    // Bold levels up to the selected one; highlight the selected level and row
    levels
        .classed("is-on", (col) => q[col.comp.key] && col.comp.idx[col.lvl] <= col.comp.idx[q[col.comp.key]])
        .classed("is-selected", (col) => q[col.comp.key] === col.lvl);
    rowSel.classed("is-selected", (r) => q.target === r.t.key && q.group === r.group);
    fitMarks(levels.filter(".is-selected"));
    fitMarks(rowSel.filter(".is-selected"));
}

/** Size the mark of each element in `sel` to the box around its texts, padded like the site's `<mark>`. */
function fitMarks(sel) {
    sel.each(function () {
        const boxes = [...this.querySelectorAll("text")].map((t) => t.getBBox());
        const x0 = Math.min(...boxes.map((b) => b.x));
        const y0 = Math.min(...boxes.map((b) => b.y));
        const x1 = Math.max(...boxes.map((b) => b.x + b.width));
        const y1 = Math.max(...boxes.map((b) => b.y + b.height));
        d3.select(this)
            .select(".task-map-mark")
            .attr("x", x0 - MARK_PAD)
            .attr("y", y0 - 1)
            .attr("width", x1 - x0 + 2 * MARK_PAD)
            .attr("height", y1 - y0 + 2)
            .attr("rx", RADIUS);
    });
}

// === Status and cards ===

/** Status line in `bar`: the count, one removable chip per constraint, and a reset. */
function paintStatus(state, bar, count, onChange) {
    const q = state.query;

    // One chip per constraint, then the reset once there is any
    const chips = [];
    if (q.target) chips.push({ kind: CHIP.ROW, text: `${targetLabel(q.target)}, ${q.group} ×` });
    for (const c of COMP) if (q[c.key]) chips.push({ kind: CHIP.LEVEL, key: c.key, text: `${c.sym} ≤ ${q[c.key]} ×` });
    if (chips.length) chips.push({ kind: CHIP.CLEAR, text: "clear" });

    // Count, the hint when nothing is selected, and the chips; a chip click removes its constraint
    bar.selectAll("*").remove();
    bar.append("span").html(`<b>${count}</b> of ${state.items.length} ${state.view.noun}`);
    if (chips.length === 0) bar.append("span").text("click cells, levels or rows to filter");
    bar.selectAll("button")
        .data(chips)
        .join("button")
        .attr("type", "button")
        .attr("class", "chart-button task-map-chip")
        .text((d) => d.text)
        .on("click", (_, d) => {
            removeChip(q, d);
            onChange();
        });
}

/**
 * The `<main>` of a card page, ready to embed: scripts dropped, the title linking to
 * the page, and the section anchors and ids removed so they cannot clash with this page's.
 * Throws when the page answers with a non-OK status.
 */
async function fetchCardBody(card) {
    const response = await fetch(card.url);
    if (!response.ok) throw new Error(`task-map: ${card.url} answered ${response.status}`);
    const main = new DOMParser().parseFromString(await response.text(), "text/html").querySelector("main");

    main.querySelectorAll("script").forEach((el) => el.remove());
    main.querySelectorAll("h2 a.anchor").forEach((a) => a.replaceWith(...a.childNodes));
    main.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    const title = main.querySelector("h1 a");
    if (title) title.setAttribute("href", card.url);
    return main.innerHTML;
}

/** Show the one card at `url` in full, or the empty note when `url` is null; each card's element is built once. */
function paintCard(list, url, cards, bodies) {
    const current = url ? [cards.find((c) => c.url === url)] : [];
    list.selectAll("article")
        .data(current, (d) => d.url)
        .join((enter) =>
            enter
                .append("article")
                .attr("class", "task-map-card")
                .each(function (d) {
                    this.innerHTML = bodies.get(d.url);
                    fillRelations(this, d, cards);
                }),
        );
    list.selectAll("p.task-map-empty")
        .data(url ? [] : [EMPTY_NOTE])
        .join("p")
        .attr("class", "task-map-empty")
        .text((d) => d);
}

/** Pager: position of the shown card among `shown`, and the arrows, disabled at either end. */
function paintPager(pager, shown, url) {
    const k = shown.findIndex((c) => c.url === url);
    pager.select(".task-map-page").text(shown.length ? `${k + 1} / ${shown.length}` : "0 / 0");
    pager.select(".task-map-prev").property("disabled", k <= 0);
    pager.select(".task-map-next").property("disabled", k < 0 || k >= shown.length - 1);
}

// === Mount ===

const root = d3.select(`#${ROOT_ID}`).classed("task-map", true);
const cards = await loadCards();
const bodies = new Map(await Promise.all(cards.map(async (c) => [c.url, await fetchCardBody(c)])));

// The query object is shared with the matrix handlers, so it is only ever mutated, never replaced
const state = { view: null, items: [], query: emptyQuery(), current: null };
const box = root.append("div").attr("class", "task-map-box");
const svg = box.append("svg").attr("class", "task-map-svg").attr("role", "img");
const statusBar = root.append("div").attr("class", "task-map-status");
const pager = root.append("div").attr("class", "task-map-pager");
const switcher = pager.append("div").attr("class", "task-map-switch");
const list = root.append("div").attr("class", "task-map-list");

pager
    .append("button")
    .attr("type", "button")
    .attr("class", "chart-button is-icon task-map-prev")
    .attr("aria-label", "Previous card")
    .html(ICON.PREV);
pager.append("span").attr("class", "task-map-page");
pager
    .append("button")
    .attr("type", "button")
    .attr("class", "chart-button is-icon task-map-next")
    .attr("aria-label", "Next card")
    .html(ICON.NEXT);

let matrix;
let shown = [];
function repaint() {
    shown = state.items.filter((p) => passes(state.query, p));
    if (!shown.some((c) => c.url === state.current)) state.current = shown[0]?.url ?? null;

    paintMatrix(state, matrix);
    paintStatus(state, statusBar, shown.length, repaint);
    paintPager(pager, shown, state.current);
    paintCard(list, state.current, cards, bodies);
}

/** Show the card `step` places away from the current one among the shown cards, if there is one. */
function page(step) {
    const next = shown[shown.findIndex((c) => c.url === state.current) + step];
    if (!next) return;
    state.current = next.url;
    repaint();
}

/** Switch to the view of card type `type`, clearing the query; `type` must be a key of VIEWS, otherwise throws. */
function setView(type) {
    const view = viewOf(type);
    if (state.view === view) return;
    Object.assign(state, { view, items: cards.filter((p) => p.type === type), current: null });
    Object.assign(state.query, emptyQuery());
    switcher.selectAll("button").classed("is-on", (d) => d === type);
    list.selectAll("*").remove();
    matrix = drawMatrix(svg, box, state, repaint);
    repaint();
}

/** Show the card at `url` in its view, with the query set to its placement, and scroll to it; throws for a url of no card. */
function goTo(url) {
    const card = cards.find((c) => c.url === url);
    if (!card) throw new Error(`task-map: no card at ${url}`);
    setView(card.type);
    Object.assign(state.query, queryOf(card));
    state.current = url;
    repaint();
    pager.node().scrollIntoView({ behavior: "smooth", block: "start" });
}

switcher
    .selectAll("button")
    .data(Object.keys(VIEWS))
    .join("button")
    .attr("type", "button")
    .attr("class", "chart-button")
    .text((type) => VIEWS[type].label)
    .on("click", (_, type) => setView(type));

pager.select(".task-map-prev").on("click", () => page(-1));
pager.select(".task-map-next").on("click", () => page(1));

// Related-card links inside a card move the map instead of leaving the page
list.on("click", (e) => {
    const link = e.target.closest("a[data-card]");
    if (!link) return;
    e.preventDefault();
    goTo(link.dataset.card);
});

setView(TYPE.PROBLEM);
