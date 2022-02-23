import React, { useContext } from 'react'
import { ApiService } from '../api.types'
import { UserContext } from '../context/UserManager'
import DeployZone from './DeployZone'
import InlineCode from './InlineCode'

type Props = {
  service: ApiService;
}

const ScikitDeployManual: React.FC<Props> = ({ service }) => {
  const { user } = useContext(UserContext)

  return (
    <div className='rounded shadow px-10 py-10 mt-5 bg-white'>
      <div className='flex gap-8'>
        <div className='flex-1'>
          <div className=''>
            <div className='font-bold'>Let's deploy your Scikit model</div>

            <div className='text-gray-600 my-3'>First, install the inferrd python package:</div>

            <div style={{ fontFamily: 'Inconsolata' }}  className='bg-black text-white rounded py-3 px-4'>
              python -m pip install inferrd
            </div>
            
            <div className='text-gray-600 my-3'>Add this cell at the bottom of your Notebook to automatically deploy new versions.</div>

            <div style={{ fontFamily: 'Inconsolata' }}  className='bg-black text-white rounded py-3 px-4'>
             <span className='text-pink-600' style={{ fontFamily: 'Inconsolata' }}>import</span> inferrd<br/>
              inferrd.auth(<span className='text-green-600' style={{ fontFamily: 'Inconsolata' }}>'{user.apiKey}'</span>)<br/>
              inferrd.deploy_scikit(model, <span className='text-green-600' style={{ fontFamily: 'Inconsolata' }}>'{service.name}'</span>)
            </div>
          </div>
        </div>
        <div className='flex flex-col justify-center items-center'>
          <div className='flex-1 bg-gray-200' style={{ width: 1 }}></div>
          <div className='py-2'>
            <div className='bg-gray-100 text-sm rounded px-2 py-1 font-bold'>OR</div>
          </div>
          <div className='flex-1 bg-gray-200' style={{ width: 1 }}></div>
        </div>
        <div className='flex-1'>
          <div className='font-bold'>Deploy by Upload</div>

          <div className='text-gray-600 my-3'>Save your Scikit pipeline using the <a className='text-blue-600' target='_blank' href='https://scikit-learn.org/stable/modules/model_persistence.html'>joblib</a> library. Exporting a model will create a file with a <code>.h5</code> extension, upload that file to deploy the model.</div>

          <div style={{ fontFamily: 'Inconsolata' }}  className='bg-black text-white rounded py-3 px-4'>
              python -m pip install joblib
            </div>

          <div className='text-gray-600 my-3'>Run this cell in your notebook to export your model to a folder. Replace <InlineCode>model</InlineCode> with the variable containing the Scikit model.</div>

          <div style={{ fontFamily: 'Inconsolata' }} className='bg-black text-white rounded py-3 px-4'>
             <span className='text-pink-600' style={{ fontFamily: 'Inconsolata' }}>from</span> joblib <span className='text-pink-600' style={{ fontFamily: 'Inconsolata' }}>import</span> dump<br/>
            dump(model, <span className='text-green-600' style={{ fontFamily: 'Inconsolata' }}>'scikit-model.joblib'</span>)
          </div>

          <DeployZone service={service} title='Drag and drop the exported Scikit model here'/>
        </div>
      </div>
    </div>
  )
}

export default ScikitDeployManual