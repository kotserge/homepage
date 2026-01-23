#!/usr/bin/env node
const Prism = require("prismjs");

// Track which languages we've loaded
const loadedLanguages = new Set(["markup", "css", "clike", "javascript"]);

function loadLanguage(lang) {
    if (loadedLanguages.has(lang)) return;

    try {
        require(`prismjs/components/prism-${lang}.js`);
        loadedLanguages.add(lang);
    } catch (e) {
        // Silently ignore missing languages
    }
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function processContent(content) {
    // Replace code fences with highlighted HTML
    return content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        if (!lang) {
            return `<pre><code>${escapeHtml(code)}</code></pre>`;
        }

        // Load language on-demand
        loadLanguage(lang);

        if (!Prism.languages[lang]) {
            return `<pre><code>${escapeHtml(code)}</code></pre>`;
        }

        const html = Prism.highlight(code, Prism.languages[lang], lang);
        return `<pre class="language-${lang}"><code class="language-${lang}">${html}</code></pre>`;
    });
}

// Read from stdin
let content = "";
process.stdin.setEncoding("utf8");

process.stdin.on("data", (chunk) => {
    content += chunk;
});

process.stdin.on("end", () => {
    const highlighted = processContent(content);
    process.stdout.write(highlighted);
});
