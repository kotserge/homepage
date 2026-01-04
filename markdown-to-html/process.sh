#!/usr/bin/env bash

show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Process HTML from STDIN and write the result to STDOUT.

Options:
  -hh, --hr-headings    Append <hr /> after each heading level 1-4
  -h, --help            Show this help message

Example:
  cat input.html | $0 -hh > output.html
EOF
}

# Parse command line arguments
hr_headings=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -hh|--hr-headings)
            hr_headings=true
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

# Output the result
printf '%s' "$body"
