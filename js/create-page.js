#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("node:util");

const matter = require("gray-matter@4.0.3");
const MarkdownIt = require("markdown-it@15.0.3");
const markdownItMark = require("markdown-it-mark@4.0.0");
const cheerio = require("cheerio@1.2.0");

// ─── Config ─────────────────────────────────────────────────────────────────

// Zero-padded width of the section counter rendered in front of each <h2>.
const SECTION_NUMBER_WIDTH = 2;

// Hooks a page module may export; any other key is an error.
const MODULE_HOOKS = new Set(["template", "text", "markdown", "dom"]);

// A template placeholder: `<!--NAME-->`. Unfilled ones render empty.
const PLACEHOLDER = /<!--[A-Z_]+-->/g;

// ─── CLI ────────────────────────────────────────────────────────────────────

function showHelp() {
    const cmd = path.basename(process.argv[1]);
    process.stdout.write(`Usage: ${cmd} [OPTIONS] <template.html>

Read Markdown with YAML frontmatter from STDIN, render it to HTML, and
substitute the result into the given template.

Options:
  -m, --module <file>  Load a page module (repeatable; applied in the order given)
  -h, --help           Show this help

Page modules (CommonJS or ES, exporting an object with any of these hooks):
  template   { NAME: html }        fills <!--NAME--> in the template
  text       (markdown, page) → markdown, before rendering
  markdown   (md, page)            configures the markdown-it instance
  dom        ($, page)             transforms the cheerio DOM, after the built-in passes
  where page = { frontmatter }. A hook that throws stops the build.

General modules live in js/page-modules/: code.js (Prism), math.js (KaTeX),
chart.js (<chart id="..."/> tags).

Frontmatter (YAML, in the markdown file):
  ---
  title:       Page title (replaces <!--TITLE-->)
  crumb:       Site path of the page (replaces <!--CRUMB-->)
  description: Meta description (replaces <!--DESCRIPTION-->)
  tags:        Meta keywords (replaces <!--KEYWORDS-->)
  ---

Template placeholders:
  <!--MAIN-->            Rendered article HTML
  <!--TITLE-->           From frontmatter
  <!--CRUMB-->           From frontmatter
  <!--DESCRIPTION-->     From frontmatter
  <!--KEYWORDS-->        From frontmatter
  <!--NAME-->            From a module's template hook; empty without one

Example:
  cat content.md | bun run ${cmd} -m js/page-modules/math.js -m js/page-modules/chart.js \\
    templates/page.html > out.html
`);
}

let parsed;
try {
    parsed = parseArgs({
        options: {
            module: { type: "string", short: "m", multiple: true, default: [] },
            help: { type: "boolean", short: "h", default: false },
        },
        allowPositionals: true,
    });
} catch (err) {
    console.error(`Error: ${err.message}`);
    showHelp();
    process.exit(1);
}

const { values: flags, positionals } = parsed;

if (flags.help) {
    showHelp();
    process.exit(0);
}

const templatePath = positionals[0];
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

const modules = flags.module.map(loadModule);

// ─── Pipeline ───────────────────────────────────────────────────────────────

const stdin = fs.readFileSync(0, "utf8");
const { data: frontmatter, content: markdown } = matter(stdin);
const page = { frontmatter };

// 1. Pre-process the raw text through the modules' `text` hooks.
const text = modules.reduce(
    (acc, mod) => (mod.text ? runHook(mod, "text", acc, page) : acc),
    markdown,
);

// 2. Markdown → HTML.
const md = MarkdownIt({
    html: true,
    linkify: false,
    typographer: false,
}).use(markdownItMark);
// We use `[^N]` / `[\N]` for our own footnote/reference syntax. Disable
// the stock reference-link rule so `[^1]: foo` isn't consumed as a link
// definition before our DOM pass gets to see it.
md.disable(["reference"]);
for (const mod of modules) if (mod.markdown) runHook(mod, "markdown", md, page);

const html = md.render(text);

// 3. DOM transforms: the built-in passes, then the modules' `dom` hooks.
const $ = cheerio.load(html, null, false);

addHeadingAnchors($);
wrapSectionHeads($);
addBlockquoteCitations($);
addImageCaptions($);
linkAsides($, "^", "footnote");
linkAsides($, "\\", "reference", { inlineStyle: "bracket" });
for (const mod of modules) if (mod.dom) runHook(mod, "dom", $, page);

// 4. Template substitution: frontmatter, then the modules' placeholders.
const template = fs.readFileSync(templatePath, "utf8");
const output = applyTemplate(template, {
    TITLE: String(frontmatter.title ?? ""),
    CRUMB: String(frontmatter.crumb ?? ""),
    DESCRIPTION: String(frontmatter.description ?? ""),
    KEYWORDS: Array(frontmatter.tags ?? ""),
    MAIN: $.html(),
    ...Object.assign({}, ...modules.map((mod) => mod.template ?? {})),
}).replace(PLACEHOLDER, "");

process.stdout.write(output);

// ─── Modules ────────────────────────────────────────────────────────────────

/** Page module at `file`, relative to the working directory; exits unless it exists and exports only known hooks. */
function loadModule(file) {
    if (!fs.existsSync(file)) {
        console.error(`Error: module '${file}' not found`);
        process.exit(1);
    }
    const loaded = require(path.resolve(file));
    const mod = loaded.default ?? loaded;

    const unknown = Object.keys(mod).filter((key) => !MODULE_HOOKS.has(key));
    if (unknown.length > 0) {
        const list = [...MODULE_HOOKS].join(", ");
        console.error(
            `Error: module '${file}' exports unsupported hooks: ${unknown.join(", ")} (expected: ${list})`,
        );
        process.exit(1);
    }
    return { ...mod, file };
}

/** Result of `mod[hook](...args)`; exits naming the module when the hook throws. */
function runHook(mod, hook, ...args) {
    try {
        return mod[hook](...args);
    } catch (err) {
        console.error(`Error: module '${mod.file}' (${hook}): ${err.message}`);
        process.exit(1);
    }
}

// ─── DOM transforms ─────────────────────────────────────────────────────────

function slugify(s) {
    return s
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
}

function addHeadingAnchors($) {
    $("h1, h2, h3, h4, h5, h6").each((_, el) => {
        const $h = $(el);
        const id = slugify($h.text());
        if (!id) return;
        const inner = $h.html();
        $h.attr("id", id);
        $h.html(`<a href="#${id}" class="anchor">${inner}</a>`);
    });
}

// Turn every top-level heading into a section head so all sections share one
// look. An <h2> gets a running number; an <h1> gets none and restarts the
// count, so a page with several parts (e.g. a bilingual legal notice) numbers
// each part from 01:
//
//   <div class="sec-head"><h1>…</h1><hr></div>
//   <div class="sec-head"><span class="sec-num">01</span><h2>…</h2><hr></div>
//
// Only direct children of the article count; a heading nested in a blockquote
// (e.g. a pasted license text) is left alone so it neither gets a number nor
// shifts the numbering. The <hr> an author writes as `---` directly under
// the heading is adopted into the head; when there is none, one is added so
// the rule is always present.
function wrapSectionHeads($) {
    let count = 0;
    const $headings = $.root().children("h1, h2");
    $headings.each((_, el) => {
        const $h = $(el);

        // An <h1> opens a new part: it carries no number and restarts the count.
        const isPart = $h.is("h1");
        count = isPart ? 0 : count + 1;
        const num = String(count).padStart(SECTION_NUMBER_WIDTH, "0");
        const label = isPart ? "" : `<span class="sec-num">${num}</span>`;

        // Adopt the author's `---` only if nothing but whitespace separates it
        // from the heading; anything else is content and stays where it is.
        const $next = $h.next();
        const hasRule = $next.is("hr") && areAdjacentSiblings(el, $next[0]);
        const $rule = hasRule ? $next.remove() : $("<hr>");

        // Swap the heading for the wrapper, then move heading and rule inside.
        const $head = $(`<div class="sec-head">${label}</div>`);
        $h.replaceWith($head);
        $head.append($h);
        $head.append($rule);
    });
}

function addBlockquoteCitations($) {
    $("blockquote[title]").each((_, el) => {
        const $bq = $(el);
        const title = $bq.attr("title");
        const cite = $bq.attr("cite");
        const inner = cite
            ? `<a href="${cite}">&mdash; ${title}</a>`
            : `&mdash; ${title}`;
        $bq.after(`\n<cite>${inner}</cite>`);
    });
}

// Add lazy-loading attrs to every <img>. When an image carries a `title`
// attribute, wrap it in a <figure> with a <figcaption>. A `ref` attribute
// (only present if the user wrote raw HTML) wraps the caption text in an <a>.
//
// Markdown-it puts `![alt](src "title")` inside a <p>. Wrapping the <img>
// alone would produce <p><figure>...</figure></p>, which is invalid (figure
// is block-level). So when the <img> is the sole non-whitespace content of
// a <p>, the whole <p> is replaced by the <figure>.
function addImageCaptions($) {
    $("img").each((_, el) => {
        const $img = $(el);
        $img.attr("loading", "lazy");
        $img.attr("fetchpriority", "low");

        const title = $img.attr("title");
        if (!title) return;

        const ref = $img.attr("ref");
        if (ref) $img.removeAttr("ref");

        const captionInner = ref
            ? `<a href="${ref}">&mdash; ${title}</a>`
            : `&mdash; ${title}`;
        const figcaption = `\n<figcaption>${captionInner}</figcaption>`;

        const $parent = $img.parent();
        const aloneInP =
            $parent.is("p") &&
            $parent.contents().filter(function () {
                return !(this.type === "text" && /^\s*$/.test(this.data));
            }).length === 1;

        if (aloneInP) {
            const $figure = $("<figure></figure>");
            $figure.append($img.clone());
            $figure.append(figcaption);
            $parent.replaceWith($figure);
        } else {
            $img.wrap("<figure></figure>");
            $img.after(figcaption);
        }
    });
}

// Footnotes:  `[^1]` (inline) and `[^1]: ...` (definition, alone in a paragraph).
// References: same shape with `\` instead of `^`.
//
// Definitions are replaced in place — keeping them where the author wrote
// them lets you put a "References" / "Footnotes" heading above and have the
// rows fall under it. Consecutive sibling definitions are merged into a
// single <table> with multiple rows, so each list renders as one table
// rather than a stack of one-row tables.
function linkAsides($, marker, prefix, { inlineStyle = "sup" } = {}) {
    const m = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const defRe = new RegExp(`^\\[${m}(\\d+)\\]:\\s*([\\s\\S]+)$`);
    const refRe = new RegExp(`\\[${m}(\\d+)\\]`, "g");

    // 1. Collect definition <p>s and group consecutive siblings into runs.
    const runs = [];
    let cur = null;
    $("p").each((_, el) => {
        const $p = $(el);
        const match = ($p.html() ?? "").trim().match(defRe);
        if (!match) return;

        const def = { el, id: match[1], content: match[2].trim() };
        if (cur && areAdjacentSiblings(cur.last.el, el)) {
            cur.items.push(def);
        } else {
            cur = { items: [def] };
            runs.push(cur);
        }
        cur.last = def;
    });

    if (runs.length === 0) return;

    // 2. Replace each run with a single multi-row table at the position of
    //    its first paragraph; drop the rest.

    const wrap_table =
        inlineStyle === "bracket" ? (link) => `[${link}]` : (link) => `${link}`;

    for (const { items } of runs) {
        const rows = items
            .map(
                ({ id, content }) =>
                    `<tr id="${prefix}-${id}" class="${prefix}-target">` +
                    `<td class="${prefix}-target-id">` +
                    wrap_table(
                        `<a href="#${prefix}-${id}-backlink">${id}</a>`,
                    ) +
                    `</td>` +
                    `<td>${content}</td>` +
                    `</tr>`,
            )
            .join("");
        $(items[0].el).replaceWith(
            `<table class="${prefix}-table">${rows}</table>`,
        );
        for (let i = 1; i < items.length; i++) $(items[i].el).remove();
    }

    // 3. Linkify inline references throughout the doc.
    const wrap_inline =
        inlineStyle === "bracket"
            ? (link) => `[${link}]`
            : (link) => `<sup>${link}</sup>`;

    $("*")
        .contents()
        .each(function () {
            if (this.type !== "text") return;
            const replaced = this.data.replace(refRe, (_, id) =>
                wrap_inline(
                    `<a id="${prefix}-${id}-backlink" href="#${prefix}-${id}" class="${prefix}">${id}</a>`,
                ),
            );
            if (replaced !== this.data) $(this).replaceWith(replaced);
        });
}

// Two element nodes are adjacent siblings if they share a parent and have
// only whitespace text nodes (or nothing) between them.
function areAdjacentSiblings(a, b) {
    if (a.parent !== b.parent) return false;
    let n = a.next;
    while (n && n !== b) {
        if (n.type !== "text" || !/^\s*$/.test(n.data)) return false;
        n = n.next;
    }
    return n === b;
}

// ─── Template ───────────────────────────────────────────────────────────────

function applyTemplate(template, vars) {
    return Object.entries(vars).reduce(
        (acc, [name, value]) => acc.replaceAll(`<!--${name}-->`, value),
        template,
    );
}
