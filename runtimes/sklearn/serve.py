import flask
import pandas as pd
import os
from sklearn.neighbors import NearestNeighbors
import sys
import numpy as np
from joblib import load
import traceback

# instantiate flask
app = flask.Flask(__name__)

# load the model, and pass in the custom metric function
clf = load('./model.joblib')

@app.route("/healthcheck", methods=['GET', 'POST'])
def healthcheck():
    return flask.jsonify({
      "version": str(os.environ.get('MODEL_VERSION'))
    })
    
# define a predict function as an endpoint
def make_prediction(x):
    isKneighbor = isinstance(clf, NearestNeighbors)

    if isKneighbor:
        return clf.kneighbors(x, return_distance=False)[0].tolist()

    pred = clf.predict(x)[0]  

    if isinstance(pred, np.ndarray):
      pred = pred.tolist()

    return pred

@app.route("/v1/models/model:predict", methods=["GET","POST"])
def predict():
    data = {"success": False}

    body = flask.request.json

    # if parameters are found, return a prediction
    try:
      data = make_prediction([body])
    except Exception as e:
      data["message"] = "There was an error while running your model: " + str(e)
      # printing stack trace
      traceback.print_exc()

    # return a response in json format
    return flask.jsonify(data)

# start the flask app, allow remote connections
app.run(host='0.0.0.0', threaded=True, port=os.environ.get('PORT'))