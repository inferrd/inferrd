#!/usr/bin/env bash

echo 'For any help, please open an issue on https://github.com/inferrd/inferrd'

ip=""

if [ "$(uname)" == "Darwin" ]; then
    ip='host.docker.internal'
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    ip=$(hostname -I)
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    echo 'Windows is not supported. Only Linux and Mac OS are supported platforms.'
    exit
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
    echo 'Windows is not supported. Only Linux and Mac OS are supported platforms.'
    exit
fi

export MACHINE_NETWORK_ROUTE=$ip

docker-compose up $@