FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NONINTERACTIVE_SEEN=true

WORKDIR /usr/src/app

RUN apt-get update && apt-get install awscli unzip curl wget gnupg2 python3-pip python3.8 -y && apt-get clean
RUN python3 -m pip install --upgrade dill pandas sklearn joblib flask --no-cache-dir

COPY . .


CMD ["sh", "./run-model.sh"]