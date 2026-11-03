#!/bin/bash
# usage: wiki.sh lang title outfile
t=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$2")
curl -s -m 60 -A "israel-elections-research/1.0 (research script)" "https://$1.wikipedia.org/w/index.php?title=$t&action=raw" -o "$3"
wc -c "$3"
