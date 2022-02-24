set -e

echo '=> Setting up environment'
echo '(1/3) Downloading model bundle'
wget -O model.zip $MODEL_DOWNLOAD

echo '(2/3) Unzipping model bundle'
unzip -o -qq ./model.zip -d . 2> /dev/null || true

if [ -e model.onnx ]
then
    echo "(3/3) model.onnx is here"
else
    # rename model to model.joblib
    mv *.onnx model.onnx
    echo "(3/3) Renaming onnx file to model.onnx"
fi

mkdir models
mkdir models/model
mkdir models/model/1

mv model.onnx models/model/1/model.onnx
mv config.pbtxt models/model/config.pbtxt

echo '=> Booting Model'
tritonserver --model-repository=./models --strict-model-config=false --http-port=9001 