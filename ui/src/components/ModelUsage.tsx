import React, { useContext } from 'react'
import { ApiService } from '../api.types'
import pythonlogo from '../assets/python.png'
import nodejslogo from '../assets/nodejs.png'
import { UserContext } from '../context/UserManager'

type Props = {
  service: ApiService;
}

const ModelUsage: React.FC<Props> = ({ service }) => {
  const { user } = useContext(UserContext)

  return (
    <div className='shadow rounded text-sm p-4 mt-3 bg-white'>
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          Model Id:
          <div style={{ fontFamily: 'Inconsolata' }} className='bg-gray-100 py-1 font-bold px-2 rounded'>{service?.key}</div>
        </div>
      </div>

      <div className='flex mt-2 gap-4'>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <img src={pythonlogo} style={{ height: 15, width: 15 }} /> Python
          </div>

          <div className='bg-black text-white p-4 rounded mt-2' style={{ fontFamily: 'Inconsolata' }}>
            <span style={{ fontFamily: 'Inconsolata' }} className='text-purple-300'>import</span> inferrd<br />
            inferrd.auth(<span style={{ fontFamily: 'Inconsolata' }} className='text-green-400'>'{user?.apiKey}'</span>)<br />
            model = inferrd.get(<span style={{ fontFamily: 'Inconsolata' }} className='text-green-400'>'{service?.name}'</span>)<br />
            prediction = model([1,2,3])
          </div>
        </div>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <img src={nodejslogo} style={{ height: 15, width: 15 }} /> Node.js
          </div>

          <div className='bg-black text-white p-4 rounded mt-2' style={{ fontFamily: 'Inconsolata' }}>
            <span style={{ fontFamily: 'Inconsolata' }} className='text-purple-300'>const</span> inferrd = require(<span style={{ fontFamily: 'Inconsolata' }} className='text-green-400'>'inferrd'</span>)<br />
            inferrd.auth(<span style={{ fontFamily: 'Inconsolata' }} className='text-green-400'>'{user?.apiKey}'</span>)<br />

            prediction = <span style={{ fontFamily: 'Inconsolata' }} className='text-purple-300'>await</span> inferrd.predict(<span className='text-green-400' style={{ fontFamily: 'Inconsolata' }}>'{service?.key}'</span>, [1,2,3])
          </div>
        </div>
        <div className='flex-1'>
          cURL

          <div className='bg-black text-white p-4 rounded mt-2' style={{ fontFamily: 'Inconsolata' }}>
            curl -H 'Content-Type: application/json' \ <br />
            -H 'Authorization: Token {user?.apiKey}' \ <br />
            -d '[1,2,3]' \ <br />
            -X POST \<br />
            {process.env.API_ENDPOINT}/infer/{service.key}/predict
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelUsage