/**
 * Icons of the figures on this page, as inline SVG strings stroked in `currentColor`, so
 * an icon follows the text colour of the button it sits in (hover, disabled).
 *
 * Paths from Iconoir (MIT), https://github.com/iconoir-icons/iconoir: `nav-arrow-left`,
 * `nav-arrow-right`, `minus`, `plus` and `xmark`.
 */

/** A 24 × 24 Iconoir icon drawing `path` with the set's stroke. */
const iconoir = (path) =>
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;

export const ICON = Object.freeze({
    PREV: iconoir("M15 6L9 12L15 18"),
    NEXT: iconoir("M9 6L15 12L9 18"),
    MINUS: iconoir("M6 12H18"),
    PLUS: iconoir("M6 12H12M18 12H12M12 12V6M12 12V18"),
    CLOSE: iconoir("M6.758 17.243L12.001 12M17.243 6.757L12.001 12M12.001 12L6.758 6.757M12.001 12L17.243 17.243"),
});
