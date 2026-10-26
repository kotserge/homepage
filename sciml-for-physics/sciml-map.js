/**
 * Shared scales of the SciML problem and method cards: the levels each component can
 * take, the produced quantities and the groups of each card type, plus the checks and
 * the profile of a card drawn from its placement. Used by the task map in the browser
 * and by the build modules `profile.js` (card pages) and `cards.js` (the map's page).
 *
 * A card is the frontmatter of a card page, keyed by its `crumb`: the page's site path.
 *
 * Adapted from the "SciML Problem and Method Map" artifact.
 */

// === Scales ===

export const COMP = [
    {
        key: "N",
        sym: "𝒩",
        name: "operator",
        levels: [
            "not needed",
            "term library",
            "one term missing",
            "simulator",
            "explicit",
        ],
    },
    {
        key: "lambda",
        sym: "λ",
        name: "parameters",
        levels: ["not needed", "prior only", "per instance", "fixed"],
    },
    {
        key: "f",
        sym: "f",
        name: "forcing",
        levels: ["not needed", "prior only", "per instance", "fixed"],
    },
    {
        key: "u",
        sym: "u",
        name: "state",
        levels: ["none", "a snapshot", "a window", "trajectories"],
    },
    {
        key: "H",
        sym: "ℋ",
        name: "observed",
        levels: ["none", "sparse points", "coarse grid", "full field"],
    },
];
COMP.forEach((c) => {
    c.idx = Object.fromEntries(c.levels.map((l, i) => [l, i]));
});

export const TARGETS = [
    { key: "u_ahead", label: "forward prediction", sub: "u on (0, T]" },
    {
        key: "u_now",
        label: "state estimation",
        sub: "u at t, from observations",
    },
    {
        key: "u_stat",
        label: "stationary state",
        sub: "eigenstate, self-similar profile",
    },
    {
        key: "u_stats",
        label: "long-time statistics",
        sub: "invariant measure, equilibrium",
    },
    { key: "lambda", label: "parameter estimation", sub: "λ" },
    { key: "f", label: "source identification", sub: "f" },
    {
        key: "N",
        label: "model discovery",
        sub: "𝒩, its form or a missing term",
    },
    { key: "choose", label: "control & design", sub: "control, geometry" },
    {
        key: "sensors",
        label: "experimental design",
        sub: "where and what to measure",
    },
    {
        key: "proc",
        label: "solver learning",
        sub: "solver, preconditioner, code",
    },
];

// Scope: what one result covers, from one solution to many operators; an instance is a system with one u_0 (or one set of observations)
const SCOPE = [
    "one instance",
    "one system",
    "one family",
    "many families",
];
// Components of a learning setup (see the-framework-of-machine-learning); benchmarks are data, metrics are evaluation
const COMPS = ["data", "model", "loss", "optimization", "evaluation"];

// Card types: the values of a card's `type` frontmatter field
export const TYPE = Object.freeze({ PROBLEM: "problem", METHOD: "method" });

// Per card type: its view on the map, the frontmatter field naming its group, and the last rows of its profile as [label, field] pairs
export const VIEWS = {
    [TYPE.PROBLEM]: {
        label: "Problems",
        noun: "problems",
        groups: SCOPE,
        groupField: "scope",
        groupHead: "scope",
        profileLast: [["answer", "answer"]],
    },
    [TYPE.METHOD]: {
        label: "Methods",
        noun: "methods",
        groups: COMPS,
        groupField: "component",
        groupHead: "component",
        profileLast: [
            ["component", "component"],
            ["physics", "physics"],
        ],
    },
};

// Id of the inline JSON holding the cards on the map's page
export const CARDS_ID = "task-map-cards";

/** View of card type `type`; `type` must be a key of VIEWS, otherwise throws. */
export function viewOf(type) {
    const view = VIEWS[type];
    if (!view) throw new Error(`sciml-map: unsupported card type "${type}"`);
    return view;
}

export const groupOf = (card) => card[viewOf(card.type).groupField];
export const targetLabel = (key) => TARGETS.find((t) => t.key === key).label;

// === Checks ===

/** Throw unless `card` sits on the scales: a known type, a level per component, known tasks and group. */
export function checkCard(card) {
    if (!(card.type in VIEWS))
        throw new Error(
            `sciml-map: unsupported type "${card.type}" in ${card.crumb}`,
        );
    const view = VIEWS[card.type];

    for (const c of COMP) {
        const lvl = card.needs?.[c.key];
        if (!(lvl in c.idx))
            throw new Error(
                `sciml-map: unsupported ${c.key} level "${lvl}" in ${card.crumb}`,
            );
    }

    if (!card.tasks?.length)
        throw new Error(`sciml-map: no tasks in ${card.crumb}`);
    for (const t of card.tasks) {
        if (!TARGETS.some((x) => x.key === t))
            throw new Error(
                `sciml-map: unsupported task "${t}" in ${card.crumb}`,
            );
    }

    if (!view.groups.includes(groupOf(card)))
        throw new Error(
            `sciml-map: unsupported ${view.groupField} "${groupOf(card)}" in ${card.crumb}`,
        );
}

// === Rendering ===

const escapeHtml = (s) =>
    String(s).replace(
        /[&<>"]/g,
        (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch],
    );

/** Profile of `card` as `<dt>/<dd>` pairs: level per component, tasks, scope, and its type's last rows. */
export function profileHtml(card) {
    // Component rows are labelled by their symbol, marked `is-symbol` so CSS leaves its case alone
    const symbolRows = COMP.map(
        (c) => `<dt class="is-symbol">${escapeHtml(c.sym)}</dt><dd>${escapeHtml(card.needs[c.key])}</dd>`,
    );
    const rows = [
        ["task", card.tasks.map(targetLabel).join(", ")],
        ["scope", card.scope],
        ...viewOf(card.type).profileLast.map(([label, field]) => [label, card[field]]),
    ];
    return [
        ...symbolRows,
        ...rows.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v ?? "")}</dd>`),
    ].join("");
}
