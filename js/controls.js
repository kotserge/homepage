
export function controlField(parent, name) {
    const field = parent.append("label").attr("class", "chart-control");
    field.append("span").attr("class", "chart-control-name").text(name);
    return field;
}

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

export function setSliderValue(input, value) {
    input.property("value", value).each(function () {
        setSliderFill(this);
    });
}

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

function setSliderFill(node) {
    const min = Number(node.min);
    const max = Number(node.max);
    const share = max > min ? (Number(node.value) - min) / (max - min) : 0;
    node.style.setProperty("--fill", `${share * 100}%`);
}
