import TensorFlowImage from './assets/tensorflow.png'
import SpacyImage from './assets/spacy.png'
import skLearn from './assets/sklearn-logo.png'
import Keras from './assets/keras.png'
import PyTorch from './assets/pytorch.png'
import XGBoost from './assets/xgboost.png'
import MLFlow from './assets/mlflow.png'
import onnx from './assets/onnx.png'

export const frameworkNameToImage: {[key: string]: any} = {
  'tensorflow': TensorFlowImage,
  'keras': Keras,
  'sklearn': skLearn,
  'spacy': SpacyImage,
  'xgboost': XGBoost,
  'mlflow': MLFlow,
  'onnx': onnx,
  'pytorch': PyTorch
}

export function getImageForFramework(frameworkName: string) {
  const key = Object.keys(frameworkNameToImage).find(key => frameworkName.startsWith(key))

  if(key) {
    return frameworkNameToImage[key]
  }

  return null
}
