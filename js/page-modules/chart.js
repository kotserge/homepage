"use strict";

/**
 * Page module for `create-page.js`: expands `<chart id="…" type="…" …/>` into a
 * chart container holding a `<type id="…" …>` element and the script `<id>.js`
 * next to the page, and fills `<!--CHART-->` with d3, Plot and the chart stylesheet.
 */

// ─── Config ─────────────────────────────────────────────────────────────────

const INCLUDE = `
        <!-- Chart -->
        <script defer src="/js/d3.min.js"></script>
        <script defer src="/js/plot.min.js"></script>
        <link rel="stylesheet" href="/css/chart.css" />
        `;

// ─── Module ─────────────────────────────────────────────────────────────────

module.exports = {
    template: { CHART: INCLUDE },
    // Runs on the raw text: HTML5 has no self-closing `<chart …/>` for the DOM pass to read
    text: expandCharts,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

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
