#!/usr/bin/env bash

show_help() {
    cat << EOF
Usage: $0 <template.html> [OPTIONS]

Replace placeholders in the template file with provided content from STDIN.

Arguments:
  template.html        HTML file containing the placeholders

Options:
  -t, --title TEXT     Replace <!--TITLE--> with TEXT
  -d, --desc TEXT      Replace <!--DESCRIPTION--> with TEXT
  -k, --keywords TEXT  Replace <!--KEYWORDS--> with TEXT
  -c, --code           Replace <!--CODE--> with code syntax highlighting includes
  -h, --help           Show this help message

Placeholders:
  <!--MAIN-->          Where the HTML main content (from STDIN) will be inserted
  <!--TITLE-->         Optional; replaced if --title is provided
  <!--DESCRIPTION-->   Optional; replaced if --desc is provided
  <!--KEYWORDS-->      Optional; replaced if --keywords is provided
  <!--CODE-->          Optional; replaced with code includes if --code flag is set

Example:
  cat content.html | $0 template.html -t "My Page" -d "A description" -c > output.html
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

# Check for minimum arguments
if [[ $# -lt 1 ]]; then
    echo "Error: Template file required" >&2
    echo "Use --help for usage information" >&2
    exit 1
fi

# First argument must be the template file
template_file=$1
shift

# Initialize variables
title=""
description=""
keywords=""
code_flag=false

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
            shift
            ;;
        *)
            echo "Unknown option: $1" >&2
            echo "Use --help for usage information" >&2
            exit 1
            ;;
    esac
done

# Verify template file exists
if [[ ! -f $template_file ]]; then
    echo "Error: Template file '$template_file' not found" >&2
    exit 1
fi

# Read main content from STDIN
main=$(cat)

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
        <script src="/js/prism.js"></script>
        <link rel="stylesheet" href="/css/components/code.css" />
        "
else
    code=""
fi
substitute_placeholder "$tmp" "<!--CODE-->" "$code"

# Output result and cleanup
cat "$tmp"
rm -f "$tmp"
