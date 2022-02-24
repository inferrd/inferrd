set -e

echo '=> Setting up environment'
echo '(1/2) Downloading model bundle'
wget $MODEL_DOWNLOAD

echo '(2/3) Unzipping model bundle'
unzip ./model-$MODEL_VERSION.zip -d .

if [ -e model.joblib ]
then
    echo "(3/3) model.joblib is here"
else
    # rename model to model.joblib
    mv *.joblib model.joblib
    echo "(3/3) Renaming joblib file to model.joblib"
fi

echo '=> Starting Scikit Server'
python3 serve.py