#!/bin/bash
set -e
EXPRESSION="$1"
BYTES=`docker run -v $PWD:/usr/project --rm -i ligolang/ligo:next interpret --syntax=reasonligo "Bytes.pack($EXPRESSION)"`

OUTPUT=$(cat <<-END
{
    "bytes": "${BYTES}"
}
END
)

echo $OUTPUT | jq .