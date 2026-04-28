#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");

// ─── CLI ────────────────────────────────────────────────────────────────────

function showHelp() {
    const cmd = path.basename(process.argv[1]);
    process.stdout.write(`Usage: ${cmd} <template.html>

Read Markdown with YAML frontmatter from STDIN and substitute the
frontmatter fields into the given template. The markdown body is ignored.

Frontmatter fields:
  title        → <!--TITLE-->        (rendered as inline markdown)
  date         → <!--DATE-->         (DD.MM.YYYY if YAML-parsed as a date)
  description  → <!--DESCRIPTION-->  (rendered as inline markdown)
  keywords     → <!--KEYWORDS-->     (literal)

Example:
  cat post.md | bun run ${cmd} card-template.html > card.html
`);
}

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(0);
}

const templatePath = args[0];
if (!templatePath) {
    console.error("Error: template file is required");
    showHelp();
    process.exit(1);
}
if (!fs.existsSync(templatePath)) {
    console.error(`Error: template file '${templatePath}' not found`);
    process.exit(1);
}
if (process.stdin.isTTY) {
    console.error(
        "Error: no markdown on stdin (pipe a file or use redirection)",
    );
    process.exit(1);
}

// ─── Pipeline ───────────────────────────────────────────────────────────────

const stdin = fs.readFileSync(0, "utf8");
const { data: frontmatter } = matter(stdin);

const md = MarkdownIt({ html: true, linkify: false, typographer: false });

const template = fs.readFileSync(templatePath, "utf8");
const output = applyTemplate(template, {
    TITLE: md.renderInline(String(frontmatter.title ?? "")),
    DATE: formatDate(frontmatter.date),
    DESCRIPTION: md.renderInline(String(frontmatter.description ?? "")),
    KEYWORDS: String(frontmatter.keywords ?? ""),
});

process.stdout.write(output);

// ─── Helpers ────────────────────────────────────────────────────────────────

// YAML parses ISO-style dates (2026-04-28) into JS Date objects, but leaves
// other formats (28.04.2026) as strings. Normalise both to DD.MM.YYYY.
// Read in UTC to avoid timezone shifts pushing the day across midnight.
function formatDate(value) {
    if (value instanceof Date) {
        const d = String(value.getUTCDate()).padStart(2, "0");
        const m = String(value.getUTCMonth() + 1).padStart(2, "0");
        const y = value.getUTCFullYear();
        return `${d}.${m}.${y}`;
    }
    return String(value ?? "");
}

function applyTemplate(template, vars) {
    return Object.entries(vars).reduce(
        (acc, [name, value]) => acc.replaceAll(`<!--${name}-->`, value),
        template,
    );
}
