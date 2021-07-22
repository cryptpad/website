#!/bin/sh

# a default URL is provided 
# invoke this script like `sh test-size.sh https://cryptpad.org` to use a different URL
URL=${1:-"http://0.0.0.0:8000"};

mkdir -p tmp;
wget -k -p -e robots=off $URL -P tmp;
du -chs tmp/;

