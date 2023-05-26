#!/bin/bash

current_tag=$(git describe --match "v[0-9]*" --tags --abbrev=0 HEAD)
last_tag=$(git describe --match "v[0-9]*" --tags --abbrev=0 HEAD^)

if [[ "$current_tag" == "$last_tag" ]]; then current_tag=main
fi

echo "Changes since ${last_tag}

$(git log ${last_tag}..${current_tag} --first-parent --pretty="* %s" | sort | uniq)

Authors:

$(git log v0.7.2...main --pretty='* %an' | sort | uniq)
"