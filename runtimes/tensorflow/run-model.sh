set -e

echo '=> Setting up environment'
echo '(1/2) Downloading model bundle'
wget $MODEL_DOWNLOAD

echo '(2/2) Unzipping model bundle'
mkdir -p ./model/$MODEL_VERSION
unzip ./model-$MODEL_VERSION.zip -d ./model/$MODEL_VERSION

echo '=> Starting TF Serving'
tensorflow_model_server --port=9000 --rest_api_port=9001 --model_name=model --model_base_path=/usr/src/app/model