const penguins = await d3.csv("penguins.csv", d3.autoType);

const [xMin, xMax] = d3.extent(penguins, (d) => d.flipper_length_mm);
const [yMin, yMax] = d3.extent(penguins, (d) => d.body_mass_g);

const plot = Plot.plot({
    width: 600,
    height: 360,
    caption:
        "Figure 2: A possible (linear) model for predicting penguin body mass from flipper length",
    marks: [
        Plot.axisX({ label: "Flipper length (mm)" }),
        Plot.axisY({ label: "Body mass (g)" }),
        Plot.dot(penguins, {
            x: "flipper_length_mm",
            y: "body_mass_g",
            stroke: "#ebdbb3",
        }),
        Plot.line(
            [
                [xMin, 42 * xMin - 4000],
                [xMax, 42 * xMax - 4000],
            ],
            { stroke: "#a0a0a0" },
        ),
    ],
});

document.querySelector("#plot-penguins-linear-model").append(plot);
