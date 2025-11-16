#!/bin/bash
# This script creates placeholder icon files
# For production, use the generate-icons.html to create proper icons

# Create a simple 1x1 transparent PNG as base
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > temp.png

# Copy to all required sizes (ImageMagick would be better but we'll use simple copy)
for size in 72 96 128 144 152 192 384 512; do
    cp temp.png icon-${size}x${size}.png
done

rm temp.png
echo "Placeholder icons created. Use generate-icons.html to create proper icons."
