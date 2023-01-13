#!/usr/bin/env sh

# cat manuscript/Book.txt | xargs pandoc -f markdown-smart \
pandoc manuscript/frontmatter.md manuscript/about-the-author.md manuscript/about-the-reviewers.md manuscript/about-the-book.md \
    manuscript/utilize-the-transport.md \
    -f markdown-smart \
    --table-of-contents \
    --top-level-division=chapter \
    --resource-path=/data/manuscript \
    --output=/data/local-preview.pdf