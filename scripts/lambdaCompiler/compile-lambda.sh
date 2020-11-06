#!/bin/sh
set -e

LAMBDA_CONTRACT="$2"
LAMBDA=`cat $2`
MOCK_CONTRACT="$1"
DOCKER_PATH="/usr/project"
MOCK_CONTRACT_PARAMETER_TYPE_JQ_PATH='.[0].args[0]'
LAMBDA_MICHELINE_CODE=`docker run -v $PWD:$DOCKER_PATH --rm -i ligolang/ligo:next compile-expression --init-file="$DOCKER_PATH/$MOCK_CONTRACT" --michelson-format=json reasonligo "$LAMBDA"`
LAMBDA_MICHELSON_CODE=`docker run -v $PWD:$DOCKER_PATH --rm -i ligolang/ligo:next compile-expression --init-file="$DOCKER_PATH/$MOCK_CONTRACT" reasonligo "$LAMBDA"`
LAMBDA_MICHELSON_CODE=${LAMBDA_MICHELSON_CODE//\"/\\\"}
LAMBDA_MICHELINE_TYPE=`docker run -v $PWD:$DOCKER_PATH --rm -i ligolang/ligo:next compile-contract --michelson-format=json "$DOCKER_PATH/$MOCK_CONTRACT" main`
LAMBDA_MICHELINE_TYPE_FORMATTED=`echo $LAMBDA_MICHELINE_TYPE | jq $MOCK_CONTRACT_PARAMETER_TYPE_JQ_PATH`
LAMBDA_PACKED_BYTES=`node scripts/lambdaCompiler/pack.js "$LAMBDA_MICHELINE_CODE" "$LAMBDA_MICHELINE_TYPE_FORMATTED" | xargs`
LAMBDA_PACKED_BYTES_SHA256=`printf $LAMBDA_PACKED_BYTES | shasum -a 256 | head -c 64`

LAMBDA_JSON=$(cat <<-END
{
    "bytes": "${LAMBDA_PACKED_BYTES}",
    "hash": "${LAMBDA_PACKED_BYTES_SHA256}",
    "michelson": {
        "code": "${LAMBDA_MICHELSON_CODE}"
    },
    "micheline": {
        "code": ${LAMBDA_MICHELINE_CODE},
        "type": ${LAMBDA_MICHELINE_TYPE_FORMATTED}
    }
}
END
)
echo $LAMBDA_JSON | jq