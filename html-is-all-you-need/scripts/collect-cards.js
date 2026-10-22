#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const matter = require("gray-matter@4.0.3");

// ─── CLI ────────────────────────────────────────────────────────────────────

function showHelp() {
    const cmd = path.basename(process.argv[1]);
    process.stdout.write(`Usage: ${cmd} <card.md>...

Read the YAML frontmatter of each Markdown card and print them as one JSON
array, in the order given. Each entry is the card's frontmatter plus its
\`url\`: the card's directory relative to the working directory, which must
be the site root, written as an absolute path with a trailing slash.
The markdown body is ignored.

Example:
  bun run ${cmd} sciml-for-physics/*/*/index.md > sciml-for-physics/cards.json
`);
}

const files = process.argv.slice(2);
if (files.includes("-h") || files.includes("--help")) {
    showHelp();
    process.exit(0);
}
if (files.length === 0) {
    console.error("Error: at least one card file is required");
    showHelp();
    process.exit(1);
}

// ─── Pipeline ───────────────────────────────────────────────────────────────

const cards = files.map((file) => {
    if (!fs.existsSync(file)) {
        console.error(`Error: card file '${file}' not found`);
        process.exit(1);
    }
    const { data } = matter(fs.readFileSync(file, "utf8"));
    return { url: cardUrl(file), ...data };
});

process.stdout.write(JSON.stringify(cards, null, 2) + "\n");

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Site URL of a card: `a/b/index.md` → `/a/b/`. */
function cardUrl(file) {
    const dir = path.relative(process.cwd(), path.dirname(path.resolve(file)));
    return `/${dir.split(path.sep).join("/")}/`;
}
