import React, { useContext } from 'react'
import { ApiService } from '../api.types'
import DeployZone from './DeployZone'
import { UserContext } from '../context/UserManager';
import { tomorrowNight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import SyntaxHighlighter from 'react-syntax-highlighter'
import styled from 'styled-components'
import CodeBlock from './CodeBlock';

type Props = {
  service: ApiService;
}

const ConsolataWrapper = styled.div`
  * { 
    font-family: Inconsolata;
  }
`

const CustomEnvDeployManual: React.FC<Props> = ({ service }) => {
  const { user } = useContext(UserContext)

  const code = `# install inferrd package
!pip install inferrd
  
# import package and authenticate
import inferrd
inferrd.auth('${ user.apiKey }')
  
# define your model
def myModel(inputs):
  output = inputs[0] * 2
  return [output]
    
# deploy
inferrd.deploy('${service.name}', myModel)

# then call your model!
model = inferrd.get('${service.name}')
print(model([2])) # this should print [4]`
  
  return (
    <div className='rounded shadow px-10 py-10 mt-5 bg-white'>
      <div className='flex gap-10'>
        <div className='flex-1'>
          <div className='font-bold'>Custom Model Quickstart</div>

          <p className='mt-4 mb-2'>Starter code for this custom environment:</p>

          <CodeBlock code={code} language='python'/>

          <a className='text-indigo-600 mt-2 block text-sm' target='_blank' href='https://docs.inferrd.com/environments/custom-environment'>Learn More</a>
        </div>
      </div>
    </div>
  )
}

export default CustomEnvDeployManual