import React, { useContext } from 'react'
import Loader from '../../assets/loader.svg'
import styled from 'styled-components'
import { UserContext } from '../../context/UserManager'
import CodeBlock from '../CodeBlock'
import useService from '../../state/useService'
import { AlertTriangle, Triangle } from 'react-feather'
import useServiceStatus from '../../state/useServiceStats'

const GreenLoader = styled(Loader)`
  circle { stroke: rgb(16, 185, 129); }
`

type Props = {
  serviceId: string;
}

const DeployModel: React.FC<Props> = ({ serviceId }) => {
  const { user } = useContext(UserContext)
  const service = useService(serviceId)
  const serviceStatus = useServiceStatus(serviceId)

  const installCode = `# install inferrd & hugging face package
!pip install inferrd transformers`

  const deployCode = `# import package and authenticate
import inferrd
from transformers import pipeline
inferrd.auth('${ user.apiKey }')

# define your model, device=0 tells HG to use the GPU
classifier = pipeline('sentiment-analysis', device=0)
  
def hgSentimentAnalysis(payload):
  score = classifier(payload['text'])
  return { 
    "label": score[0]['label'], 
    "score":  str(round(score[0]['score'], 2))
  }
    
# deploy
inferrd.deploy(hgSentimentAnalysis, 
  name='${service?.name}',
  setup='python3.7 -m pip install transformers'
)`

  return (
    <div className='shadow p-4 mt-2 bg-white rounded'>
      <div className='flex gap-2 items-center'>
        <div className='bg-black text-center text-white inline-block' style={{ borderRadius: 9999, height: 27, width: 27, paddingTop: 1 }}>1</div>
        Deploy a GPU-Accelerated HuggingFace sentiment analysis
      </div>

      <div className='mt-4 relative'>
        <CodeBlock code={installCode} />
        <CodeBlock className='mt-2' code={deployCode} />
      </div>

      <div className='text-sm mt-2 px-3 py-2 flex gap-2 items-center bg-gray-100 rounded'>
        <AlertTriangle style={{ height: 17, width: 17}}/> Make sure to run this in a GPU-powered notebook (ex: Google Colab), or remove the "device=0", which activates the GPU.
      </div>

      <div className='text-green-500 mt-3 gap-1 flex items-center'>
        { serviceStatus?.status != 'UP' && <><GreenLoader style={{ height: 17, width: 17 }} /> { serviceStatus ? serviceStatus.message : 'Waiting for your deployment' }</> }
        { serviceStatus?.status == 'UP' && <>Model deployed</> }
      </div>
    </div>
  )
}

export default DeployModel