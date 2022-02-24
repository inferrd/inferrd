FROM tensorflow/serving:latest-gpu

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NONINTERACTIVE_SEEN=true

WORKDIR /usr/src/app
COPY . .

RUN apt-get update && apt install unzip curl wget gnupg2 -y

ENTRYPOINT ["sh", "./run-model.sh"]