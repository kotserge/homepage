"use strict";

/**
 * Page module for `create-page.js`: renders `$…$` (inline) and `$$…$$` (display)
 * LaTeX with KaTeX before markdown, and fills `<!--MATH-->` with the math stylesheet.
 * A formula KaTeX cannot parse is logged and left as written.
 */

const katex = require("katex@0.16.27");

// ─── Config ─────────────────────────────────────────────────────────────────

const INCLUDE = `
        <!-- Math -->
        <link rel="stylesheet" href="/css/components/math.css" />
        `;

// ─── Module ─────────────────────────────────────────────────────────────────

module.exports = {
    template: { MATH: INCLUDE },
    // Runs on the raw text, so `$a_b$` doesn't get mangled by inline italics
    text: renderMath,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

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
