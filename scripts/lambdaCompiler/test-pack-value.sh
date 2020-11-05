#!/bin/sh
set -e
EXPRESSION="$1"
BYTES=`ligo interpret --syntax=reasonligo "Bytes.pack($EXPRESSION)"`

OUTPUT=$(cat <<-END
{
    "bytes": "${BYTES}"
}
END
)

echo $OUTPUT | jq