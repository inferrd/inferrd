#!/usr/bin/env bash

echo 'For any help, please open an issue on https://github.com/inferrd/inferrd'

ip=""
nomad_ip=""

if [ "$(uname)" == "Darwin" ]; then
    ip='host.docker.internal'
    nomad_ip='0.0.0.0'
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    ip='172.17.0.1'
    nomad_ip=$(dig TXT +short o-o.myaddr.l.google.com @ns1.google.com | awk -F'"' '{ print $2}')
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    echo 'Windows is not supported. Only Linux and Mac OS are supported platforms.'
    exit
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
    echo 'Windows is not supported. Only Linux and Mac OS are supported platforms.'
    exit
fi

if ! command -v docker-compose &> /dev/null
then
    echo "docker-compose could not be found. Please install it."
    exit
fi

export MACHINE_NETWORK_ROUTE=$ip
export NOMAD_IP=$nomad_ip

docker-compose up $@