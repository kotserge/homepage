const penguins = await d3.csv("penguins.csv", d3.autoType);

const plot = Plot.plot({
    width: 600,
    height: 360,
    caption: "Figure 1: Penguins flipper length vs body mass",
    marks: [
        Plot.axisX({ label: "Flipper length (mm)" }),
        Plot.axisY({ label: "Body mass (g)" }),
        Plot.dot(penguins, {
            x: "flipper_length_mm",
            y: "body_mass_g",
            stroke: "#ebdbb3",
        }),
    ],
});

document.querySelector("#plot-penguins-measurements").append(plot);
