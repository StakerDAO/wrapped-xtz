#!/bin/bash
DOCKER_PATH="/usr/project"
CONTRACT="$1"
CONTRACT_MICHELINE_TYPE=`docker run -v $PWD:$DOCKER_PATH --rm -i ligolang/ligo:next compile-contract --michelson-format=json "$DOCKER_PATH/$CONTRACT" main`
echo $CONTRACT_MICHELINE_TYPE | jq .