#!/bin/bash

js=$(find ./components/ -type f -name '*.js' | wc -l)
ts=$(find ./components/ -type f -name '*.ts' | wc -l)

echo "JavaScript: ${js}"
echo "TypeScript: ${ts}"