"use strict";

/**
 * Page module for `js/create-page.js`: fills the one `.card-profile` element of a
 * SciML problem or method card with the card's profile as a `<dl>`, drawn from its
 * frontmatter on the scales of `sciml-map.js`. The card's URL is `/<crumb>/`.
 * Throws when the card is off the scales or the page holds the slot other than once.
 *
 * Example:
 *   bun run js/create-page.js -m js/page-modules/math.js -m js/page-modules/chart.js \
 *     -m sciml-for-physics/card-profile.js templates/page.html \
 *     < sciml-for-physics/problems/forward-problem/index.md \
 *     > sciml-for-physics/problems/forward-problem/index.html
 */

const { checkCard, profileHtml } = require("./sciml-map.js");

// ─── Config ─────────────────────────────────────────────────────────────────

const SLOT = ".card-profile";

// ─── Module ─────────────────────────────────────────────────────────────────

module.exports = { dom: fillProfile };

// ─── Helpers ────────────────────────────────────────────────────────────────

function fillProfile($, { frontmatter }) {
    const card = { url: `/${frontmatter.crumb}/`, ...frontmatter };

    const $slot = $(SLOT);
    if ($slot.length !== 1)
        throw new Error(`${card.url} holds ${$slot.length} '${SLOT}' slots, expected one`);

    checkCard(card);
    $slot.html(`<dl>${profileHtml(card)}</dl>`);
}
