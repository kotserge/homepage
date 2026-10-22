/**
 * Helpers for the form controls of the figures on this page (see `.chart-slider` in
 * `css/components/chart.css`).
 */

/**
 * Set `--fill` on the range input `node` to its value's share of its range, as a
 * percentage; the slider's track is filled up to it. Call after every value change,
 * including ones made from code.
 */
export function setSliderFill(node) {
    const min = Number(node.min);
    const max = Number(node.max);
    const share = max > min ? (Number(node.value) - min) / (max - min) : 0;
    node.style.setProperty("--fill", `${share * 100}%`);
}
