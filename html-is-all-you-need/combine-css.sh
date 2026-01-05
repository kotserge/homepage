#!/bin/bash
output_file="base.css"
cd "css/base"
cat _reset.css _layout.css _defaults.css > "$output_file"
