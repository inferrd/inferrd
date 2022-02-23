import React from 'react'
import { ApiService, ServiceType } from '../api.types'
import CustomEnvDeployManual from './CustomEnvDeployManual'
import KerasDeployManual from './KerasDeployManual'
import MLFlowDeployManual from './MLFlowDeployManual'
import ONNXDeployManual from './ONNXDeployManual'
import PyTorchDeployManual from './PyTorchDeployManual'
import ScikitDeployManual from './ScikitDeployManual'
import SpacyDeployManual from './SpacyDeployManual'
import TensorFlowDeployManual from './TensorFlowDeployManual'
import XGBoostDeployManual from './XGBoostDeployManual'

type Props = {
  service: ApiService;
}

const DeployManual: React.FC<Props> = ({ service }) => {
  const desiredStack = service.desiredStack

  switch(desiredStack?.humanReadableId.split(':')[0]) {
    case 'tensorflow':
      return <TensorFlowDeployManual service={service}/>;
    case 'custom':
      return <CustomEnvDeployManual service={service}/>;
    case 'xgboost':
      return <XGBoostDeployManual service={service}/>;
    case 'spacy':
      return <SpacyDeployManual service={service}/>;
    case 'keras':
      return <KerasDeployManual service={service}/>;
    case 'sklearn':
      return <ScikitDeployManual service={service}/>;
    case 'pytorch':
      return <PyTorchDeployManual service={service}/>;
    case 'onnx':
      return <ONNXDeployManual service={service}/>;
    case 'mlflow':
      return <MLFlowDeployManual service={service}/>;
  }

  return null
}

export default DeployManual