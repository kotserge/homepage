#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("node:util");

const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");
const cheerio = require("cheerio");
const Prism = require("prismjs");
const katex = require("katex");

// ─── Config ─────────────────────────────────────────────────────────────────

const INCLUDES = {
    code: `
        <!-- Syntax highlighting -->
        <link rel="stylesheet" href="/css/components/code.css" />
        `,
    math: `
        <!-- Math -->
        <link rel="stylesheet" href="/css/components/math.css" />
        `,
    chart: `
        <!-- Chart -->
        <script defer src="/js/d3.min.js"></script>
        <script defer src="/js/plot.min.js"></script>
        <link rel="stylesheet" href="/css/components/chart.css" />
        `,
};

// Languages Prism preloads on its own — don't try to require them.
const PRISM_PRELOADED = new Set(["markup", "css", "clike", "javascript"]);

// ─── CLI ────────────────────────────────────────────────────────────────────

function showHelp() {
    const cmd = path.basename(process.argv[1]);
    process.stdout.write(`Usage: ${cmd} [OPTIONS] <template.html>

Read Markdown with YAML frontmatter from STDIN, render it to HTML, and
substitute the result into the given template.

Options:
  -c, --code     Process code fences with Prism and include code CSS
  -g, --chart    Process <chart id="..."/> tags and include chart assets
  -m, --math     Process LaTeX math with KaTeX and include math CSS
  -h, --help     Show this help

Frontmatter (YAML, in the markdown file):
  ---
  title:       Page title (replaces <!--TITLE-->)
  description: Meta description (replaces <!--DESCRIPTION-->)
  keywords:    Meta keywords (replaces <!--KEYWORDS-->)
  ---

Template placeholders:
  <!--MAIN-->            Rendered article HTML
  <!--TITLE-->           From frontmatter
  <!--CRUMB-->           From frontmatter
  <!--DESCRIPTION-->     From frontmatter
  <!--KEYWORDS-->        From frontmatter
  <!--CODE-->            Code includes (-c)
  <!--MATH-->            Math includes (-m)
  <!--CHART-->           Chart includes (-g)

Example:
  cat content.md | bun run ${cmd} -c -m template.html > out.html
`);
}

let parsed;
try {
    parsed = parseArgs({
        options: {
            code: { type: "boolean", short: "c", default: false },
            math: { type: "boolean", short: "m", default: false },
            chart: { type: "boolean", short: "g", default: false },
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

// ─── Pipeline ───────────────────────────────────────────────────────────────

const stdin = fs.readFileSync(0, "utf8");
const { data: frontmatter, content: markdown } = matter(stdin);

// 1. Pre-process the raw text:
//    - Math first, so `$a_b$` doesn't get mangled by inline italics.
//    - Charts second, so we don't have to wrestle parse5 over the
//      self-closing `<chart id="..."/>` form (HTML5 has no such thing).
let text = markdown;
if (flags.math) text = renderMath(text);
if (flags.chart) text = expandCharts(text);

// 2. Markdown → HTML.
const md = MarkdownIt({
    html: true,
    linkify: false,
    typographer: false,
    highlight: flags.code ? highlightCode : undefined,
});
// We use `[^N]` / `[\N]` for our own footnote/reference syntax. Disable
// the stock reference-link rule so `[^1]: foo` isn't consumed as a link
// definition before our DOM pass gets to see it.
md.disable(["reference"]);

const html = md.render(text);

// 3. DOM transforms (the bits that used to be perl/sed regex hacks).
const $ = cheerio.load(html, null, false);

addHeadingAnchors($);
addBlockquoteCitations($);
addImageCaptions($);
if (flags.code) wrapCodeBlocks($);
linkAsides($, "^", "footnote");
linkAsides($, "\\", "reference", { inlineStyle: "bracket" });

// 4. Template substitution.
const template = fs.readFileSync(templatePath, "utf8");
const output = applyTemplate(template, {
    TITLE: String(frontmatter.title ?? ""),
    CRUMB: String(frontmatter.crumb ?? ""),
    DESCRIPTION: String(frontmatter.description ?? ""),
    KEYWORDS: Array(frontmatter.tags ?? ""),
    MAIN: $.html(),
    CODE: flags.code ? INCLUDES.code : "",
    MATH: flags.math ? INCLUDES.math : "",
    CHART: flags.chart ? INCLUDES.chart : "",
});

process.stdout.write(output);

// ─── Math (KaTeX) ───────────────────────────────────────────────────────────

function renderMath(text) {
    const display = /\$\$(?:\r?\n)?([\s\S]*?)(?:\r?\n)?\$\$/g;
    const inline = /(?<!\$)\$(?!\$)([\s\S]*?)(?<!\$)\$(?!\$)/g;

    const render = (latex, displayMode) => {
        try {
            return katex.renderToString(latex.trim(), {
                displayMode,
                throwOnError: false,
                output: "html",
            });
        } catch (e) {
            const where = displayMode ? "display" : "inline";
            console.error(`KaTeX error (${where}):`, e.message);
            return null;
        }
    };

    return text
        .replace(display, (m, l) => render(l, true) ?? m)
        .replace(inline, (m, l) => render(l, false) ?? m);
}

// ─── Code (Prism) ───────────────────────────────────────────────────────────

function loadPrismLanguage(lang) {
    if (PRISM_PRELOADED.has(lang)) return;
    try {
        require(`prismjs/components/prism-${lang}.js`);
        PRISM_PRELOADED.add(lang);
    } catch {
        /* unknown language; fall through to escape-only */
    }
}

function escapeHtml(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// markdown-it `highlight` callback. Returning a complete `<pre><code>...</code></pre>`
// makes markdown-it emit it verbatim instead of wrapping again.
function highlightCode(code, lang) {
    if (!lang) return `<pre><code>${escapeHtml(code)}</code></pre>`;

    loadPrismLanguage(lang);
    if (!Prism.languages[lang]) {
        return `<pre><code>${escapeHtml(code)}</code></pre>`;
    }

    const highlighted = Prism.highlight(code, Prism.languages[lang], lang);
    return `<pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`;
}

// ─── Charts ─────────────────────────────────────────────────────────────────

function expandCharts(text) {
    return text.replace(
        /<chart\s+id="([^"]+)"\s+type="([^"]+)"\s?(.+)\/?>/g,
        (_, id, type, additionalProperties) =>
            `<div class="chart-container">\n` +
            `    <${type} id="${id}" ${additionalProperties}></${type}>\n` +
            `    <script type="module" src="${id}.js"></script>\n` +
            `</div>`,
    );
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

function wrapCodeBlocks($) {
    $('pre[class^="language-"]').each((_, el) => {
        const $pre = $(el);
        const lang =
            ($pre.attr("class") ?? "").match(/language-(\S+)/)?.[1] ?? "";
        const $wrapper = $(
            `<div class="code-block-wrapper">` +
                `<div class="code-block-header">` +
                `<span class="code-block-header-lang">${lang}</span>` +
                `<div class="code-block-header-controls">` +
                `<span></span><span></span><span></span>` +
                `</div>` +
                `</div>` +
                `</div>`,
        );
        $pre.replaceWith($wrapper);
        $wrapper.append($pre);
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
