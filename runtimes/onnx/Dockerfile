FROM nvcr.io/nvidia/tritonserver:21.11-py3

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NONINTERACTIVE_SEEN=true

#CMD tritonserver --model-repository=./models --strict-model-config=false

RUN apt-get update \
    && apt-get install -y awscli unzip curl wget

COPY . .

CMD ["sh", "./run-model.sh"]