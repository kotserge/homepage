"use strict";

/**
 * Page module for `js/create-page.js`: embeds every SciML card into the task map's
 * page as inline JSON (`#task-map-cards`, placed before `#task-map`). Each card is
 * the frontmatter of a `*\/*\/index.md` next to this file plus its `body`: the
 * `<main>` of the card's built `index.html`, with scripts dropped, in-page links
 * unwrapped, ids removed and the title linking to the card's page.
 *
 * The card pages must be built first. Throws when a card is off the scales, a card
 * page is not built, or the page holds `#task-map` other than once.
 *
 * Example:
 *   bun run js/create-page.js -m js/page-modules/math.js -m js/page-modules/chart.js \
 *     -m js/page-modules/style.js -m sciml-for-physics/cards.js templates/page.html \
 *     < sciml-for-physics/index.md > sciml-for-physics/index.html
 */

const fs = require("node:fs");
const path = require("node:path");

const matter = require("gray-matter@4.0.3");
const cheerio = require("cheerio@1.2.0");

const { CARDS_ID, checkCard } = require("./sciml-map.js");

// ─── Config ─────────────────────────────────────────────────────────────────

const SITE_ROOT = path.resolve(__dirname, "..");
const CARD_GLOB = "*/*/index.md";
const MAP = "#task-map";

// ─── Module ─────────────────────────────────────────────────────────────────

module.exports = { dom: embedCards };

// ─── Helpers ────────────────────────────────────────────────────────────────

function embedCards($) {
    const $map = $(MAP);
    if ($map.length !== 1)
        throw new Error(`page holds ${$map.length} '${MAP}' elements, expected one`);

    const cards = fs
        .globSync(CARD_GLOB, { cwd: __dirname })
        .sort()
        .map((file) => readCard(path.join(__dirname, file)));

    // `<` is escaped so no `</script>` inside a body can close the element
    const json = JSON.stringify(cards).replace(/</g, "\\u003c");
    $map.before(`<script type="application/json" id="${CARDS_ID}">${json}</script>\n`);
}

/** Card of the markdown `file`: its frontmatter, checked against the scales, plus its built body. */
function readCard(file) {
    const { data: card } = matter(fs.readFileSync(file, "utf8"));
    checkCard(card);
    return { ...card, body: cardBody(card.crumb) };
}

/** `<main>` of the built page at `crumb`, ready to embed into another page. */
function cardBody(crumb) {
    const file = path.join(SITE_ROOT, crumb, "index.html");
    if (!fs.existsSync(file))
        throw new Error(`card page '${file}' is not built; build the card pages first`);

    const $ = cheerio.load(fs.readFileSync(file, "utf8"));
    const $main = $("main");

    // In-page links and ids would point into or clash with the embedding page
    $main.find("script").remove();
    $main.find('a[href^="#"]').each((_, a) => {
        $(a).replaceWith($(a).contents());
    });
    $main.find("[id]").removeAttr("id");

    const $title = $main.find("h1").first();
    $title.html(`<a href="/${crumb}/" class="anchor">${$title.html()}</a>`);

    return $main.html();
}
