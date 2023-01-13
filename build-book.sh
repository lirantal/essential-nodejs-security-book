#!/usr/bin/env sh

docker run --rm --volume "`pwd`:/data" --user `id -u`:`id -g` --entrypoint "/data/build-pandoc-book.sh" pandoc/extra:edge
