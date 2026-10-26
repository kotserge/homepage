"use strict";

const fs = require("node:fs");
const path = require("node:path");

const SITE_ROOT = path.resolve(__dirname, "../..");
const STYLESHEET = "style.css";

module.exports = { template: (page) => ({ STYLE: include(stylesheets(page)) }) };

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

function ancestors(crumb) {
    const parts = crumb.split("/");
    return parts.map((_, i) => parts.slice(0, i + 1).join("/"));
}

function include(hrefs) {
    const links = hrefs.map((href) => `        <link rel="stylesheet" href="${href}" />\n`).join("");
    return `\n        <!-- Style -->\n${links}        `;
}
