/**
 * Builders of the figures' form controls, styled by `.chart-*` in
 * `css/chart.css`. Each takes a d3 selection to append to and returns the
 * appended element's selection, so callers can add classes or attributes.
 */

/** A `<label class="chart-control">` in `parent` headed by `name`; the control and an optional `<output>` go inside it. */
export function controlField(parent, name) {
    const field = parent.append("label").attr("class", "chart-control");
    field.append("span").attr("class", "chart-control-name").text(name);
    return field;
}

/**
 * A range slider in `parent` over `[min, max]` in steps of `step`, starting at `value`
 * (the browser's midpoint when omitted); `onInput` gets the new value as a number
 * after every user change.
 */
export function slider(parent, { min, max, step, value, onInput }) {
    const input = parent
        .append("input")
        .attr("class", "chart-slider")
        .attr("type", "range")
        .attr("min", min)
        .attr("max", max)
        .attr("step", step)
        .on("input", function () {
            setSliderFill(this);
            onInput(+this.value);
        });
    if (value !== undefined) input.property("value", value);
    setSliderFill(input.node());
    return input;
}

/** Set the slider `input` (a d3 selection) to `value` from code, keeping its track fill in step. */
export function setSliderValue(input, value) {
    input.property("value", value).each(function () {
        setSliderFill(this);
    });
}

/**
 * A dropdown in `parent` with one `<option>` per `{ value, label }` of `options`,
 * starting at `value` (the first option when omitted); `onChange` gets the chosen value.
 */
export function dropdown(parent, options, { value, onChange }) {
    const select = parent
        .append("select")
        .attr("class", "chart-select")
        .on("change", function () {
            onChange(this.value);
        });
    select
        .selectAll("option")
        .data(options)
        .join("option")
        .attr("value", (d) => d.value)
        .text((d) => d.label);
    if (value !== undefined) select.property("value", value);
    return select;
}

/** A square button in `parent` showing the SVG string `icon`, named `label` for screen readers and as its tooltip. */
export function iconButton(parent, { label, icon, onClick }) {
    return parent
        .append("button")
        .attr("type", "button")
        .attr("class", "chart-button is-icon")
        .attr("aria-label", label)
        .attr("title", label)
        .html(icon)
        .on("click", onClick);
}

// === Helpers ===

/**
 * Set `--fill` on the range input `node` to its value's share of its range, as a
 * percentage; WebKit fills the slider's track up to it.
 */
function setSliderFill(node) {
    const min = Number(node.min);
    const max = Number(node.max);
    const share = max > min ? (Number(node.value) - min) / (max - min) : 0;
    node.style.setProperty("--fill", `${share * 100}%`);
}
