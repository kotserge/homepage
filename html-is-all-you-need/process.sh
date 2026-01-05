#!/usr/bin/env bash

show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Process HTML from STDIN and write the result to STDOUT.

Options:
  -hh, --hr-headings    Append <hr /> after each heading level 1-4
  -c, --code-blocks     Wrap <pre><code> blocks in div with language label
  -h, --help            Show this help message

Example:
  cat input.html | $0 -hh -c > output.html
EOF
}

# Parse command line arguments
hr_headings=false
code_blocks=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -hh|--hr-headings)
            hr_headings=true
            shift
            ;;
        -c|--code-blocks)
            code_blocks=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            echo "Use --help for usage information" >&2
            exit 1
            ;;
    esac
done

# Read input from STDIN
body=$(cat)

if [[ -z "$body" ]]; then
    echo "No input provided" >&2
    exit 1
fi

# Apply processing based on flags
if [[ "$hr_headings" == true ]]; then
    # Append <hr /> after each heading level 1-4
    body=$(printf '%s' "$body" | sed -E 's#</h([1-4])>#</h\1><hr />#g')
fi

if [[ "$code_blocks" == true ]]; then
    body=$(printf '%s' "$body" | sed -E '
        # Match <pre><code class="language-LANG"> and wrap with div
        s#<pre><code class="language-([^"]+)">#<div class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header-lang">\1</span><div class="code-block-header-controls"><span></span><span></span><span></span></div></div><pre><code class="language-\1">#g
        # Close the wrapper div after </code></pre>
        s#</code></pre>#</code></pre></div>#g
    ')
fi

# Output the result
printf '%s' "$body"
