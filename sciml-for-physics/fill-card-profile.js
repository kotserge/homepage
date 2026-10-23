#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const matter = require("gray-matter@4.0.3");

const { checkCard, profileHtml } = require("../../sciml-for-physics/sciml-map.js");

// ─── Config ─────────────────────────────────────────────────────────────────

// Empty profile slot in the card markdown, replaced by the filled one
const SLOT = '<div class="card-profile"></div>';

// ─── CLI ────────────────────────────────────────────────────────────────────

function showHelp() {
    const cmd = path.basename(process.argv[1]);
    process.stdout.write(`Usage: ${cmd} <card.md>

Print the Markdown card with its profile slot, ${SLOT},
filled with the card's profile as a <dl>: the level per component, tasks, corpus
and the last row of its type, drawn from its frontmatter on the scales of
sciml-for-physics/sciml-map.js. The working directory must be the site root.

Errors when the card is off the scales or holds the slot other than exactly once.

Example:
  bun run ${cmd} sciml-for-physics/problems/forward-problem/index.md \\
    | bun run create-page.js -m -g page.html > sciml-for-physics/problems/forward-problem/index.html
`);
}

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(0);
}

const file = args[0];
if (!file) {
    console.error("Error: card file is required");
    showHelp();
    process.exit(1);
}
if (!fs.existsSync(file)) {
    console.error(`Error: card file '${file}' not found`);
    process.exit(1);
}

// ─── Pipeline ───────────────────────────────────────────────────────────────

const text = fs.readFileSync(file, "utf8");
const card = { url: cardUrl(file), ...matter(text).data };

const slots = text.split(SLOT).length - 1;
if (slots !== 1) {
    console.error(`Error: '${file}' holds the profile slot ${slots} times, expected once`);
    process.exit(1);
}

try {
    checkCard(card);
} catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
}

// The filled slot stays on one line: markdown-it ends an HTML block at the first blank line
const filled = `<div class="card-profile"><dl>${profileHtml(card)}</dl></div>`;
process.stdout.write(text.replace(SLOT, () => filled));

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Site URL of a card: `a/b/index.md` → `/a/b/`. */
function cardUrl(file) {
    const dir = path.relative(process.cwd(), path.dirname(path.resolve(file)));
    return `/${dir.split(path.sep).join("/")}/`;
}
