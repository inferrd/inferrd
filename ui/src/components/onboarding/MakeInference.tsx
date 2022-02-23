import React, { useContext } from 'react'
import Loader from '../../assets/loader.svg'
import styled from 'styled-components'
import { UserContext } from '../../context/UserManager'
import CodeBlock from '../CodeBlock'
import useService from '../../state/useService'
import useServiceStatus from '../../state/useServiceStats'
import useRequest from '../../state/useRequest'

type Props = {
  serviceId: string;
  inferenceId?: string;
}

const GreenLoader = styled(Loader)`
  circle { stroke: rgb(16, 185, 129); }
`

const MakeInference: React.FC<Props> = ({ serviceId, inferenceId }) => {
  const { user } = useContext(UserContext)
  const service = useService(serviceId)
  const serviceStatus = useServiceStatus(serviceId)
  const { request: inference } = useRequest(inferenceId)

  // wait for model to be up
  if(serviceStatus?.status != 'UP') {
    return <div></div>
  }

  
  const inferenceCode = `# authenticate
import inferrd
inferrd.auth('${user.apiKey}')
  
# load the model
sentiment = inferrd.get('${service?.name}')

# run the inference
prediction = sentiment({
  "text": "Inferrd is such a great service"
})

print(prediction)`

  return (
    <div className='shadow p-4 mt-2 bg-white rounded'>
      <div className='flex gap-2 items-center'>
        <div className='bg-black text-center text-white inline-block' style={{ borderRadius: 9999, height: 27, width: 27, paddingTop: 1 }}>2</div>
        Make an inference
      </div>


      <div className='mt-4 relative'>
        <CodeBlock code={inferenceCode} />
      </div>

      <div>
        { !inference?.id && <div className='text-green-500 mt-3 gap-2 flex items-center'><GreenLoader style={{ height: 20, fill: 'green', width: 20 }} /> Waiting for your request</div> }
        { inference?.id && <>
          <div className='text-green-500 mt-3 gap-2 flex items-center'>Inference completed in {inference.timingMs}ms. Response:</div>
          <div className='mt-2'>
            <CodeBlock language={'json'} code={JSON.stringify(inference.responseBody || {}, null, 2)}/>
          </div>
        </> }
      </div>
    </div>
  )
}

export default MakeInference