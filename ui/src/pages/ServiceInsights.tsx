import React from 'react'
import { ApiService } from '../api.types'
import TensorFlowAutoDocs from '../components/TensorFlowAutoDocs'

type Props = {
  service: ApiService;
}

const ServiceInsights: React.FC<Props> = ({ service }) => {
  return (
    <>
      <div className='shadow rounded mt-3 py-4 bg-white'>
        <div className='font-bold px-4'>Insights</div>

        <p className='px-4 text-sm text-gray-700 mt-2'>Insights are a collection of metadata about your model. <a className='text-indigo-600' href='mailto:contact@inferrd.com'>Let us know what you'd be really interested in.</a></p>
      </div> 

      <div style={{ width: 500}}>
        {
          service.desiredStack.humanReadableId.startsWith('tensorflow') && <TensorFlowAutoDocs service={service}/>
        }
      </div>
    </>
  )
}

export default ServiceInsights