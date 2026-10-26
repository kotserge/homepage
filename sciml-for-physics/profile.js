"use strict";

const { checkCard, profileHtml } = require("./sciml-map.js");

const SLOT = ".card-profile";

module.exports = { dom: fillProfile };

function fillProfile($, { frontmatter: card }) {
    const $slot = $(SLOT);
    if ($slot.length !== 1)
        throw new Error(`${card.crumb} holds ${$slot.length} '${SLOT}' slots, expected one`);

    checkCard(card);
    $slot.html(`<dl>${profileHtml(card)}</dl>`);
}
