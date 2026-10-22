/**
 * Shared scales and relations of the SciML problem and method cards: the levels each
 * component can take, the produced quantities, the groups of each card type, and
 * the relations derived from a card's placement (profile, nearby cards, the cards
 * of the other type it meets). Used by the task map and by the card pages.
 *
 * Cards are the entries of `cards.json`, generated from the card frontmatter by
 * `html-is-all-you-need/scripts/collect-cards.js`.
 *
 * Adapted from the "SciML Problem and Method Map" artifact.
 */

// === Scales ===

export const COMP = [
    {
        key: "N",
        sym: "𝒩",
        name: "operator",
        levels: ["not needed", "term library", "one term missing", "simulator", "explicit"],
    },
    { key: "lam", sym: "λ", name: "parameters", levels: ["not needed", "prior only", "per instance", "fixed"] },
    { key: "f", sym: "f", name: "forcing", levels: ["not needed", "prior only", "per instance", "fixed"] },
    { key: "u", sym: "u", name: "state", levels: ["none", "a snapshot", "a window", "trajectories"] },
    { key: "H", sym: "ℋ", name: "observed", levels: ["none", "sparse points", "coarse grid", "full field"] },
];
COMP.forEach((c) => {
    c.idx = Object.fromEntries(c.levels.map((l, i) => [l, i]));
});

export const TARGETS = [
    { key: "u_ahead", label: "Forward prediction", sub: "u on (0, T]" },
    { key: "u_now", label: "State estimation", sub: "u at t, from observations" },
    { key: "u_stat", label: "Stationary state", sub: "eigenstate, self-similar profile" },
    { key: "u_stats", label: "Long-time statistics", sub: "invariant measure, equilibrium" },
    { key: "lam", label: "Parameter estimation", sub: "λ" },
    { key: "f", label: "Source identification", sub: "f" },
    { key: "N", label: "Model discovery", sub: "𝒩, its form or a missing term" },
    { key: "choose", label: "Control & design", sub: "control, geometry" },
    { key: "sensors", label: "Experimental design", sub: "where and what to measure" },
    { key: "proc", label: "Solver learning", sub: "solver, preconditioner, code" },
];

const CORPUS = ["no training data", "one system", "one family", "many families"];
const PHYS = ["physics is the model", "physics in the loss", "physics in the model", "physics in the data"];

// Card types: the values of a card's `type` frontmatter field
export const TYPE = Object.freeze({ PROBLEM: "problem", METHOD: "method" });

// Per card type: its view on the map, the frontmatter field naming its group, how a card of
// the type is described next to another (`groupPhrase`), the last row of its profile, and the
// note shown when no card of the other type relates to it
export const VIEWS = {
    [TYPE.PROBLEM]: {
        label: "Problems",
        noun: "problems",
        groups: CORPUS,
        groupField: "corpus",
        groupHead: "trained on",
        groupPhrase: (card) => `trained on ${card.corpus}`,
        profileLast: (card) => ["answer", card.answer === "both" ? "point or distribution" : card.answer],
        noCross: "No method on the map meets this problem with what it gives.",
    },
    [TYPE.METHOD]: {
        label: "Methods",
        noun: "methods",
        groups: PHYS,
        groupField: "physics",
        groupHead: "physics enters",
        groupPhrase: (card) => card.physics,
        profileLast: (card) => ["physics", card.physics.replace("physics ", "")],
        noCross: "No problem on the map gives this method what it requires.",
    },
};

// Produced quantities that are themselves a component; sharing one, a method may need less of it than the problem gives
const TASK_COMP = { lam: "lam", f: "f", N: "N", choose: "f", sensors: "H" };

const CARDS_URL = new URL("./cards.json", import.meta.url);

/** View of card type `type`; `type` must be a key of VIEWS, otherwise throws. */
export function viewOf(type) {
    const view = VIEWS[type];
    if (!view) throw new Error(`sciml-map: unsupported card type "${type}"`);
    return view;
}

export const groupOf = (card) => card[viewOf(card.type).groupField];
export const targetLabel = (key) => TARGETS.find((t) => t.key === key).label;

// === Loading ===

/** Throw unless `card` sits on the scales: a known type, a level per component, known tasks and group. */
function checkCard(card) {
    if (!(card.type in VIEWS)) throw new Error(`sciml-map: unsupported type "${card.type}" in ${card.url}`);
    const view = VIEWS[card.type];

    for (const c of COMP) {
        const lvl = card.needs?.[c.key];
        if (!(lvl in c.idx)) throw new Error(`sciml-map: unsupported ${c.key} level "${lvl}" in ${card.url}`);
    }

    if (!card.tasks?.length) throw new Error(`sciml-map: no tasks in ${card.url}`);
    for (const t of card.tasks) {
        if (!TARGETS.some((x) => x.key === t)) throw new Error(`sciml-map: unsupported task "${t}" in ${card.url}`);
    }

    if (!view.groups.includes(groupOf(card)))
        throw new Error(`sciml-map: unsupported ${view.groupField} "${groupOf(card)}" in ${card.url}`);
}

/**
 * All cards of `cards.json`, each checked against the scales. Throws when `cards.json`
 * answers with a non-OK status or a card is off the scales.
 */
export async function loadCards() {
    const response = await fetch(CARDS_URL);
    if (!response.ok) throw new Error(`sciml-map: ${CARDS_URL} answered ${response.status}`);
    const cards = await response.json();
    cards.forEach(checkCard);
    return cards;
}

// === Relations ===

/**
 * Whether method `m` applies to problem `p`: it needs no more than the problem gives
 * in every component, produces one of its tasks, and trains on no more than it has.
 */
function applies(m, p) {
    const shared = m.tasks.filter((k) => p.tasks.includes(k));
    const skip = new Set(shared.map((k) => TASK_COMP[k]).filter(Boolean));
    return (
        shared.length > 0 &&
        COMP.every((c) => skip.has(c.key) || c.idx[m.needs[c.key]] <= c.idx[p.needs[c.key]]) &&
        CORPUS.indexOf(m.corpus) <= CORPUS.indexOf(p.corpus)
    );
}

/** Cards of the other type that `card` meets: methods for a problem, problems for a method. */
function crossCards(card, cards) {
    switch (card.type) {
        case TYPE.PROBLEM:
            return cards.filter((m) => m.type === TYPE.METHOD && applies(m, card));
        case TYPE.METHOD:
            return cards.filter((p) => p.type === TYPE.PROBLEM && applies(card, p));
        default:
            throw new Error(`sciml-map: unsupported card type "${card.type}"`);
    }
}

/**
 * Cards of the same type within two steps of `card`, nearest first. A step is a
 * component at another level, another group, or no shared task; `how` lists the
 * steps, and the tasks the other card asks for in addition.
 */
function nearby(card, cards) {
    const lower = (k) => targetLabel(k).toLowerCase();
    const out = [];
    for (const q of cards) {
        if (q === card || q.type !== card.type) continue;

        // Steps between the two placements; more than two is not nearby
        const diffs = COMP.filter((c) => card.needs[c.key] !== q.needs[c.key]).map((c) => `${c.sym} ${q.needs[c.key]}`);
        if (groupOf(card) !== groupOf(q)) diffs.push(viewOf(q.type).groupPhrase(q));
        const shared = card.tasks.some((k) => q.tasks.includes(k));
        if (!shared) diffs.push(`asks for ${q.tasks.map(lower).join(" and ")}`);
        if (diffs.length > 2) continue;

        // Description of the steps, plus the tasks `q` asks for in addition
        const extra = q.tasks.filter((k) => !card.tasks.includes(k));
        const how = shared && extra.length ? [...diffs, `also asks for ${extra.map(lower).join(" and ")}`] : diffs;
        out.push({ card: q, steps: diffs.length, how: how.length ? how.join(", ") : "same information and task" });
    }
    return out.sort((a, b) => a.steps - b.steps);
}

// === Rendering ===

const escapeHtml = (s) =>
    String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);

/** Linked list item for a related card; `data-card` carries its url for in-map navigation. */
const relatedItem = (q, how) =>
    `<li><a href="${q.url}" data-card="${q.url}">${escapeHtml(q.title)}</a> <span class="card-how">${escapeHtml(how)}</span></li>`;

/** Profile of `card` as `<dt>/<dd>` pairs: level per component, tasks, corpus, and its type's last row. */
function profileHtml(card) {
    const rows = [
        ...COMP.map((c) => [c.sym, card.needs[c.key]]),
        ["task", card.tasks.map(targetLabel).join(", ")],
        ["trained on", card.corpus],
        viewOf(card.type).profileLast(card),
    ];
    return rows.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v ?? "")}</dd>`).join("");
}

/**
 * Fill the relation slots inside `root` for `card`: `.card-profile` gets its profile,
 * `.card-nearby` the nearby cards of its type, `.card-cross` the cards of the other
 * type it meets. Slots that are absent are skipped.
 */
export function fillRelations(root, card, cards) {
    const profile = root.querySelector(".card-profile");
    if (profile) profile.innerHTML = `<dl>${profileHtml(card)}</dl>`;

    const near = root.querySelector(".card-nearby");
    if (near) {
        const items = nearby(card, cards).map((n) => relatedItem(n.card, n.how));
        near.innerHTML = items.length
            ? `<ul>${items.join("")}</ul>`
            : `<p class="card-none">None within two steps.</p>`;
    }

    const cross = root.querySelector(".card-cross");
    if (cross) {
        const items = crossCards(card, cards).map((q) => relatedItem(q, viewOf(q.type).groupPhrase(q)));
        cross.innerHTML = items.length
            ? `<ul>${items.join("")}</ul>`
            : `<p class="card-none">${viewOf(card.type).noCross}</p>`;
    }
}
