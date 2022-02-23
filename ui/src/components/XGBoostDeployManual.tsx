import React, { useContext } from 'react'
import { ApiService } from '../api.types'
import { UserContext } from '../context/UserManager'
import DeployZone from './DeployZone'
import InlineCode from './InlineCode'

type Props = {
  service: ApiService;
}

const XGBoostDeployManual: React.FC<Props> = ({ service }) => {
  const { user } = useContext(UserContext)

  return (
    <div className='rounded shadow px-10 py-10 mt-5 bg-white'>
      <div className='flex gap-8'>
        <div className='flex-1'>
          <div className=''>
            <div className='font-bold'>Deploy from Notebook</div>

            <div className='text-gray-600 my-3'>Deploy your model straight from your notebook. First, install the inferrd python package:</div>

            <div style={{ fontFamily: 'Inconsolata' }}  className='bg-black text-white rounded py-3 px-4'>
              python -m pip install inferrd
            </div>
            
            <div className='text-gray-600 my-3'>Add this cell at the bottom of your Notebook to automatically deploy new versions.</div>

            <div style={{ fontFamily: 'Inconsolata' }}  className='bg-black text-white rounded py-3 px-4'>
             <span className='text-pink-600' style={{ fontFamily: 'Inconsolata' }}>import</span> inferrd<br/>
              inferrd.auth(<span className='text-green-600' style={{ fontFamily: 'Inconsolata' }}>'{user.apiKey}'</span>)<br/>
              inferrd.deploy_xgboost(model, <span className='text-green-600' style={{ fontFamily: 'Inconsolata' }}>'{service.name}'</span>)
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

          <div className='text-gray-600 my-3'>Save your XGBoost model using the <a className='text-blue-600' target='_blank' href='https://xgboost.readthedocs.io/en/latest/tutorials/saving_model.html'><InlineCode>.save_model</InlineCode> method</a> format. Exporting a model will create a file, upload that file to deploy the model.</div>

          <div className='text-gray-600 my-3'>Run this cell in your notebook to export your model to a folder. Replace <InlineCode>model</InlineCode> with the variable containing the XGBoost model.</div>

          <div style={{ fontFamily: 'Inconsolata' }} className='bg-black text-white rounded py-3 px-4'>
            bst.save_model(<span className='text-green-600' style={{ fontFamily: 'Inconsolata' }}>'model.xgb'</span>)
          </div>

          <DeployZone service={service} title='Drag and drop the model.xgb here'/>
        </div>
      </div>
    </div>
  )
}

export default XGBoostDeployManual