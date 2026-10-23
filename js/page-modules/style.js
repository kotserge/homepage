"use strict";

/**
 * Page module for `create-page.js`: fills `<!--STYLE-->` with a link to every
 * `style.css` in the page's directory (its frontmatter `crumb`) and in each parent
 * directory below the site root, outermost first, so a section's stylesheet applies
 * to all pages under it and a page's own one overrides it.
 *
 * Stylesheets are looked up at build time: a page whose directories gain or lose a
 * `style.css` must be rebuilt. Throws when the page has no `crumb` or none of its
 * directories holds a `style.css`.
 */

const fs = require("node:fs");
const path = require("node:path");

// ─── Config ─────────────────────────────────────────────────────────────────

const SITE_ROOT = path.resolve(__dirname, "../..");
const STYLESHEET = "style.css";

// ─── Module ─────────────────────────────────────────────────────────────────

module.exports = { template: (page) => ({ STYLE: include(stylesheets(page)) }) };

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Site paths of the `style.css` files that apply to `page`, outermost first. */
function stylesheets({ frontmatter }) {
    const crumb = String(frontmatter.crumb ?? "").trim();
    if (!crumb) throw new Error("page has no 'crumb' to look up its style.css");

    const hrefs = ancestors(crumb)
        .map((dir) => `${dir}/${STYLESHEET}`)
        .filter((file) => fs.existsSync(path.join(SITE_ROOT, file)))
        .map((file) => `/${file}`);
    if (hrefs.length === 0)
        throw new Error(`no ${STYLESHEET} in '${crumb}' or its parent directories`);
    return hrefs;
}

/** Directories from the outermost to `crumb` itself: `a/b/c` → `a`, `a/b`, `a/b/c`. */
function ancestors(crumb) {
    const parts = crumb.split("/");
    return parts.map((_, i) => parts.slice(0, i + 1).join("/"));
}

/** Head include linking the stylesheets at `hrefs`, laid out like the other modules' includes. */
function include(hrefs) {
    const links = hrefs.map((href) => `        <link rel="stylesheet" href="${href}" />\n`).join("");
    return `\n        <!-- Style -->\n${links}        `;
}
