"use strict";

/**
 * Page module for `create-page.js`: highlights fenced code with Prism, wraps each
 * highlighted block in a header showing its language, and fills `<!--CODE-->` with
 * the code stylesheet. A fence without a language, or with one Prism doesn't know,
 * is only escaped and gets no header.
 */

const PRISM = "prismjs@1.30.0";

const Prism = require(PRISM);

// ─── Config ─────────────────────────────────────────────────────────────────

const INCLUDE = `
        <!-- Syntax highlighting -->
        <link rel="stylesheet" href="/css/components/code.css" />
        `;

// Languages Prism preloads on its own — don't try to require them.
const PRISM_PRELOADED = new Set(["markup", "css", "clike", "javascript"]);

// ─── Module ─────────────────────────────────────────────────────────────────

module.exports = {
    template: { CODE: INCLUDE },
    markdown: (md) => md.set({ highlight: highlightCode }),
    dom: wrapCodeBlocks,
};

// ─── Highlighting ───────────────────────────────────────────────────────────

function loadPrismLanguage(lang) {
    if (PRISM_PRELOADED.has(lang)) return;
    try {
        require(`${PRISM}/components/prism-${lang}.js`);
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

// ─── DOM ────────────────────────────────────────────────────────────────────

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
