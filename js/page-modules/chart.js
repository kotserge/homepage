"use strict";

const INCLUDE = `
        <!-- Chart -->
        <script defer src="/js/d3.min.js"></script>
        <script defer src="/js/plot.min.js"></script>
        <link rel="stylesheet" href="/css/chart.css" />
        `;

module.exports = {
    template: { CHART: INCLUDE },
    text: expandCharts,
};

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
