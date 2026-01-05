const katex = require("katex");

const doubleDollar = /\$\$(?:\r?\n)?([\s\S]*?)(?:\r?\n)?\$\$/g;
const singleDollar = /(?<!\$)\$(?!\$)([\s\S]*?)(?<!\$)\$(?!\$)/g;

function processLatex(html) {
    // Process display math ($$...$$) first
    html = html.replace(doubleDollar, (match, latex) => {
        // Replace all html tags back to their original form
        try {
            return katex.renderToString(latex.trim(), {
                displayMode: true,
                throwOnError: false,
                output: "html",
            });
        } catch (e) {
            console.error("Display math error:", e.message);
            return match;
        }
    });

    // Process inline math ($...$)
    html = html.replace(singleDollar, (match, latex) => {
        try {
            return katex.renderToString(latex.trim(), {
                displayMode: false,
                throwOnError: false,
                output: "html",
            });
        } catch (e) {
            console.error("Inline math error:", e.message);
            return match;
        }
    });

    return html;
}

// Usage
process.stdin.setEncoding("utf8");

let input = "";
process.stdin.on("data", (chunk) => {
    input += chunk;
});

process.stdin.on("end", () => {
    const processed = processLatex(input);
    process.stdout.write(processed);
});
