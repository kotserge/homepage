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
    { key: "u_ahead", label: "Forward prediction", sub: "u on (0, T]" },
    {
        key: "u_now",
        label: "State estimation",
        sub: "u at t, from observations",
    },
    {
        key: "u_stat",
        label: "Stationary state",
        sub: "eigenstate, self-similar profile",
    },
    {
        key: "u_stats",
        label: "Long-time statistics",
        sub: "invariant measure, equilibrium",
    },
    { key: "lambda", label: "Parameter estimation", sub: "λ" },
    { key: "f", label: "Source identification", sub: "f" },
    {
        key: "N",
        label: "Model discovery",
        sub: "𝒩, its form or a missing term",
    },
    { key: "choose", label: "Control & design", sub: "control, geometry" },
    {
        key: "sensors",
        label: "Experimental design",
        sub: "where and what to measure",
    },
    {
        key: "proc",
        label: "Solver learning",
        sub: "solver, preconditioner, code",
    },
];

const CORPUS = [
    "no training data",
    "one system",
    "one family",
    "many families",
];
const PHYS = ["as the model", "in the loss", "in the model", "in the data"];

// Card types: the values of a card's `type` frontmatter field
export const TYPE = Object.freeze({ PROBLEM: "problem", METHOD: "method" });

// Per card type: its view on the map, the frontmatter field naming its group, and the last row of its profile as [label, field]
export const VIEWS = {
    [TYPE.PROBLEM]: {
        label: "Problems",
        noun: "problems",
        groups: CORPUS,
        groupField: "corpus",
        groupHead: "trained on",
        profileLast: ["answer", "answer"],
    },
    [TYPE.METHOD]: {
        label: "Methods",
        noun: "methods",
        groups: PHYS,
        groupField: "physics",
        groupHead: "physics enters",
        profileLast: ["physics", "physics"],
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

/** Profile of `card` as `<dt>/<dd>` pairs: level per component, tasks, corpus, and its type's last row. */
export function profileHtml(card) {
    const [lastLabel, lastField] = viewOf(card.type).profileLast;
    const rows = [
        ...COMP.map((c) => [c.sym, card.needs[c.key]]),
        ["task", card.tasks.map(targetLabel).join(", ")],
        ["trained on", card.corpus],
        [lastLabel, card[lastField]],
    ];
    return rows
        .map(
            ([k, v]) =>
                `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v ?? "")}</dd>`,
        )
        .join("");
}
