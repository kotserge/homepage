"use strict";

const fs = require("node:fs");
const path = require("node:path");

const matter = require("gray-matter@4.0.3");
const cheerio = require("cheerio@1.2.0");

const { CARDS_ID, checkCard } = require("./sciml-map.js");

const SITE_ROOT = path.resolve(__dirname, "..");
const CARD_GLOB = "*/*/index.md";
const MAP = "#task-map";

module.exports = { dom: embedCards };

function embedCards($) {
    const $map = $(MAP);
    if ($map.length !== 1)
        throw new Error(`page holds ${$map.length} '${MAP}' elements, expected one`);

    const cards = fs
        .globSync(CARD_GLOB, { cwd: __dirname })
        .sort()
        .map((file) => readCard(path.join(__dirname, file)));

    const json = JSON.stringify(cards).replace(/</g, "\\u003c");
    $map.before(`<script type="application/json" id="${CARDS_ID}">${json}</script>\n`);
}

function readCard(file) {
    const { data: card } = matter(fs.readFileSync(file, "utf8"));
    checkCard(card);
    return { ...card, body: cardBody(card.crumb) };
}

function cardBody(crumb) {
    const file = path.join(SITE_ROOT, crumb, "index.html");
    if (!fs.existsSync(file))
        throw new Error(`card page '${file}' is not built; build the card pages first`);

    const $ = cheerio.load(fs.readFileSync(file, "utf8"));
    const $main = $("main");

    $main.find("script").remove();
    $main.find('a[href^="#"]').each((_, a) => {
        $(a).replaceWith($(a).contents());
    });
    $main.find("[id]").removeAttr("id");

    const $title = $main.find("h1").first();
    $title.html(`<a href="/${crumb}/" class="anchor">${$title.html()}</a>`);

    return $main.html();
}
