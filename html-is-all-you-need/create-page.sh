#!/usr/bin/env bash

show_help() {
    cat << EOF
Usage: $0 [OPTIONS] <template.html>

Process HTML from STDIN and replace placeholders in the template file.

Options:
  -t, --title TEXT     Replace <!--TITLE--> with TEXT
  -d, --desc TEXT      Replace <!--DESCRIPTION--> with TEXT
  -k, --keywords TEXT  Replace <!--KEYWORDS--> with TEXT
  -c, --code           Replace <!--CODE--> with code syntax highlighting includes
  -m, --math           Replace <!--MATH--> with math syntax highlighting includes
  -h, --help           Show this help message

Arguments:
  template.html        HTML file containing the placeholders (must be last argument)

Placeholders:
  <!--MAIN-->          Where the HTML main content (from STDIN) will be inserted
  <!--TITLE-->         Optional; replaced if --title is provided
  <!--DESCRIPTION-->   Optional; replaced if --desc is provided
  <!--KEYWORDS-->      Optional; replaced if --keywords is provided
  <!--CODE-->          Optional; replaced with code includes if --code flag is set
  <!--MATH-->          Optional; replaced with math includes if --math flag is set

Example:
  cat content.html | $0 -t "My Page" -d "A description" -c template.html > output.html
EOF
}

# Substitute placeholder in file with value
# Args: $1=file, $2=placeholder, $3=value
substitute_placeholder() {
    local file=$1
    local placeholder=$2
    local value=$3

    # Check if value contains newlines (multiline content)
    if [[ "$value" == *$'\n'* ]]; then
        # Use sed read command for multiline content
        sed -i "/$placeholder/{
            r /dev/stdin
            d
        }" "$file" <<<"$value"
    else
        # Escape special characters for sed and do simple substitution
        local escaped_value
        escaped_value=$(printf '%s' "$value" | sed 's/[\/&]/\\&/g')
        sed -i "s/$placeholder/$(printf '%s' "$escaped_value")/g" "$file"
    fi
}

# Check for help flag first
if [[ ${1:-} == "--help" || ${1:-} == "-h" ]]; then
    show_help
    exit 0
fi

# Initialize variables
title=""
description=""
keywords=""
code_flag=false
math_flag=false
code_blocks=false
template_file=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--title)
            if [[ -z ${2:-} ]]; then
                echo "Error: --title requires an argument" >&2
                exit 1
            fi
            title=$2
            shift 2
            ;;
        -d|--desc|--description)
            if [[ -z ${2:-} ]]; then
                echo "Error: --desc requires an argument" >&2
                exit 1
            fi
            description=$2
            shift 2
            ;;
        -k|--keywords)
            if [[ -z ${2:-} ]]; then
                echo "Error: --keywords requires an argument" >&2
                exit 1
            fi
            keywords=$2
            shift 2
            ;;
        -c|--code)
            code_flag=true
            code_blocks=true
            shift
            ;;
        -m|--math)
            math_flag=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        -*)
            echo "Unknown option: $1" >&2
            echo "Use --help for usage information" >&2
            exit 1
            ;;
        *)
            # This should be the template file (last argument)
            template_file=$1
            shift
            ;;
    esac
done

# Check if template file was provided
if [[ -z "$template_file" ]]; then
    echo "Error: Template file required" >&2
    echo "Use --help for usage information" >&2
    exit 1
fi

# Export variables
export NODE_PATH=$(npm root -g)

# Verify template file exists
if [[ ! -f $template_file ]]; then
    echo "Error: Template file '$template_file' not found" >&2
    exit 1
fi

# Read main content from STDIN
main=$(cat)

if [[ -z "$main" ]]; then
    echo "Error: No input provided" >&2
    exit 1
fi

# Math processing
if [[ "$math_flag" == true ]]; then
    path=$(dirname "$0")
    main=$(printf '%s' "$main" | node "$path/process-math.js")
fi

# Markdown processing
main=$(printf '%s' "$main" | md2html)

if [[ "$code_blocks" == true ]]; then
    main=$(printf '%s' "$main" | sed -E '
        # Match <pre><code class="language-LANG"> and wrap with div
        s#<pre><code class="language-([^"]+)">#<div class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header-lang">\1</span><div class="code-block-header-controls"><span></span><span></span><span></span></div></div><pre><code class="language-\1">#g
        # Close the wrapper div after </code></pre>
        s#</code></pre>#</code></pre></div>#g
    ')
fi

# Create temporary file and copy template
tmp=$(mktemp)
cp "$template_file" "$tmp"

# Replace <!--MAIN--> with content from STDIN
substitute_placeholder "$tmp" "<!--MAIN-->" "$main"

# Replace <!--TITLE--> with title or empty string
substitute_placeholder "$tmp" "<!--TITLE-->" "$title"

# Replace <!--DESCRIPTION--> with description or empty string
substitute_placeholder "$tmp" "<!--DESCRIPTION-->" "$description"

# Replace <!--KEYWORDS--> with keywords or empty string
substitute_placeholder "$tmp" "<!--KEYWORDS-->" "$keywords"

# Replace <!--CODE--> with code includes if flag is set, otherwise empty string
if [[ "$code_flag" == true ]]; then
    code="
        <!-- Syntax highlighting -->
        <script defer src=\"/js/prism.js\"></script>
        <link rel=\"stylesheet\" href=\"/css/components/code.css\" />
        "
else
    code=""
fi
substitute_placeholder "$tmp" "<!--CODE-->" "$code"

# Replace <!--MATH--> with math includes if flag is set, otherwise empty string
if [[ "$math_flag" == true ]]; then
    math="
        <!-- Math -->
        <link rel=\"stylesheet\" href=\"/css/components/math.css\" />
        "
else
    math=""
fi
substitute_placeholder "$tmp" "<!--MATH-->" "$math"

# Output result and cleanup
cat "$tmp"
rm -f "$tmp"
