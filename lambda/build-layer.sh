#!/bin/bash
# Build Lambda layer with Python dependencies using Docker
# This ensures dependencies are compiled for Amazon Linux 2 (Lambda runtime)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAYER_DIR="${SCRIPT_DIR}/layer"

echo "=== Building Lambda Layer ==="

# Clean previous build
rm -rf "${LAYER_DIR}"
mkdir -p "${LAYER_DIR}/python"

# Build using Docker with Amazon Linux 2 base
# This ensures native dependencies (like orjson) are compiled for Lambda
docker run --rm \
    -v "${SCRIPT_DIR}:/var/task" \
    -w /var/task \
    public.ecr.aws/lambda/python:3.12 \
    pip install -r requirements.txt -t layer/python --no-cache-dir

# Create zip for Lambda layer
cd "${LAYER_DIR}"
zip -r python.zip python

echo "=== Layer built: ${LAYER_DIR}/python.zip ==="
echo "Size: $(du -h python.zip | cut -f1)"
