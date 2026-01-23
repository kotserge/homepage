#!/usr/bin/env bash

show_help() {
    cat << EOF
Usage: $0 [OPTIONS] <template.html>

Process HTML from STDIN markdown and replace placeholders in the template file.

Options:
  -t, --title TEXT     Replace <!--TITLE--> with TEXT
  -d, --desc TEXT      Replace <!--DESCRIPTION--> with TEXT
  -k, --keywords TEXT  Replace <!--KEYWORDS--> with TEXT
  -c, --code           Replace <!--CODE--> with code syntax highlighting includes
  -g, --chart          Replace <!--CHART--> with charts
  -m, --math           Replace <!--MATH--> with math symbols
  -h, --help           Show this help message

Arguments:
  template.html        HTML file containing the placeholders (must be last argument)

Placeholders:
  <!--MAIN-->          Where the HTML main content (from STDIN) will be inserted
  <!--TITLE-->         Optional; replaced if --title is provided
  <!--DESCRIPTION-->   Optional; replaced if --desc is provided
  <!--KEYWORDS-->      Optional; replaced if --keywords is provided
  <!--CODE-->          Optional; replaced with code includes if --code flag is set
  <!--CHART-->         Optional; replaced with chart includes if --chart flag is set
  <!--MATH-->          Optional; replaced with math includes if --math flag is set

Example:
  cat content.md | $0 -t "My Page" -d "A description" -c template.html > output.html
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
template_file=""

# Substitute
title=""
description=""
keywords=""

# Flags
code_flag=false
math_flag=false
code_blocks=false
chart_flag=false
anchor_flag=true # in most cases I want this
footnotes_flag=true # in most cases I want this
reference_flag=true # in most cases I want this

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
        -g|--chart)
            chart_flag=true
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


# Export variables
export NODE_PATH=$(npm root -g)

# Math processing
if [[ "$math_flag" == true ]]; then
    path=$(dirname "$0")
    main=$(printf '%s' "$main" | node "$path/process-math.js")
fi

# Markdown processing
main=$(printf '%s' "$main" | md2html --ftables)

# Charts processing
if [[ "$chart_flag" == true ]]; then
    main=$(printf '%s' "$main" | sed -E 's#<chart id="([^"]+)"/>#<div class="chart-container">\n<canvas id="chart-\1"></canvas>\n<script type="module" src="chart-\1.js"></script>\n</div>#g')
fi

# Blockquotes processing
main=$(printf '%s' "$main" | perl -0777 -pe 's#<blockquote(?:\s+cite="([^"]+)")?(?:\s+title="([^"]+)")?>(.+?)</blockquote>#"<blockquote" . (defined($1) ? " cite=\"$1\"" : "") . (defined($2) ? " title=\"$2\"" : "") . ">$3</blockquote>" . (defined($2) ? "\n<cite>" . (defined($1) ? "<a href=\"$1\">" : "") . "&mdash; $2" . (defined($1) ? "</a>" : "") . "</cite>" : "")#gse')

# Image processing
main=$(printf '%s' "$main" | perl -0777 -pe 's#<img(?:\s+class="([^"]+)")?\s+src="([^"]+)"\s+alt="([^"]+)"(?:\s+title="([^"]+)")?(?:\s+ref="([^"]+)")?>#"<img" . (defined($1) ? " class=\"$1\"" : "") . " src=\"$2\" alt=\"$3\"" . (defined($4) ? " title=\"$4\"" : "") . " loading=\"lazy\" fetchpriority=\"low\">" . (defined($4) ? "\n<figcaption>" . (defined($5) ? "<a href=\"$5\">" : "") . "&mdash; $4" . (defined($5) ? "</a>" : "") . "</figcaption>" : "")#gse')

# Code Blocks
if [[ "$code_blocks" == true ]]; then
    main=$(printf '%s' "$main" | sed -E '
        # Match <pre><code class="language-LANG"> and wrap with div
        s#<pre><code class="language-([^"]+)">#<div class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header-lang">\1</span><div class="code-block-header-controls"><span></span><span></span><span></span></div></div><pre><code class="language-\1">#g
        # Close the wrapper div after </code></pre>
        s#</code></pre>#</code></pre></div>#g
    ')
fi

# Anchors
if [[ "$anchor_flag" == true ]]; then
    main=$(echo "$main" | perl -pe '
        if (/<h([1-6])>(.+?)<\/h\1>/i) {
            my $level = $1;
            my $content = $2;
            my $id = lc($content);
            $id =~ s/\s+/-/g;
            $id =~ s/[^a-z0-9-]//g;
            $_ = "\n<h$level id=\"$id\">\n    <a href=\"#$id\" class=\"anchor\">$content</a>\n</h$level>\n";
        }
    ')
fi

# Footnotes
if [[ "$footnotes_flag" == true ]]; then
    # Convert footnotes to HTML
    main=$(echo "$main" | perl -pe '
        if (/\[\^(\d+)\]:(.+)<\/p>/m) {
            my $id = $1;
            my $content = $2;
            $_ = "<tr id=\"footnote-$id\" class=\"footnote-target\"><td class=\"footnote-target-id\"><a href=\"#footnote-$id-backlink\">$id</a></td><td>$content</td></tr>";
        }

        s/\[\^(\d+)\]/<sup><a id="footnote-$1-backlink" href="#footnote-$1" class="footnote">$1<\/a><\/sup>/g;
    ')

    # Surround footnotes with <ol> (works, because all are in one line)
    main=$(echo "$main" | perl -pe '
        if (/<tr id=\"footnote-\d+\" class=\"footnote-target\">/m) {
            $_ = "<table class=\"footnote-table\">\n$_</table>";
        }
    ')
fi

# References
if [[ "$reference_flag" == true ]]; then
    # Convert references to HTML
    main=$(echo "$main" | perl -pe '
        if (/\[\^(\S+)\]:(.+)<\/p>/m) {
            my $id = $1;
            my $content = $2;
            # $_ = "<li id=\"reference-$id\" class=\"reference-target\">$content</li>";
            $_ = "<tr id=\"reference-$id\" class=\"reference-target\"><td class=\"reference-target-id\"><a href=\"#reference-$id-backlink\">$id</a></td><td>$content</td></tr>";
        }

        s/\[\^(\S+)\]/<sup><a id="reference-$1-backlink" href="#reference-$1" class="reference">$1<\/a><\/sup>/g;
    ')

    # Surround references with <table>
    main=$(echo "$main" | perl -pe '
        if (/<tr id=\"reference-\S+\" class=\"reference-target\">/m) {
            $_ = "<table class=\"reference-table\">\n$_</table>";
        }
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

# Replace <!--CHART--> with chart includes if flag is set, otherwise empty string
if [[ "$chart_flag" == true ]]; then
    chart="
        <!-- Chart -->
        <script async src=\"/js/chart.umd.min.js\"></script>
        <link rel=\"stylesheet\" href=\"/css/components/chart.css\" />
        "
else
    chart=""
fi
substitute_placeholder "$tmp" "<!--CHART-->" "$chart"

# Output result and cleanup
cat "$tmp"
rm -f "$tmp"
