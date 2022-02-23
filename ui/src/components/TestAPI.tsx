import React, { useContext, useEffect, useState } from 'react'
import { ApiService } from '../api.types'
import { ArrowDown, RefreshCw } from 'react-feather'
import { UserContext } from '../context/UserManager'

type Props = {
  service: ApiService;
}

const TestAPI = React.forwardRef<HTMLDivElement, Props>(({ service }, ref: React.Ref<HTMLDivElement>) => {
  const apiEndpoint = `${process.env.API_HOST}/infer/${service.key}/predict`
  const { user } = useContext(UserContext)

  const [body, setBody] = useState<string>()
  const [isLoading, setIsLoading] = useState<boolean>()
  const [response, setResponse] = useState<any>()
  const [requestStatus, setRequestStatus] = useState<boolean | null>(null)

  useEffect(() => {
    if(service.desiredVersion?.testInstances) {
      setBody(JSON.stringify(service.desiredVersion.testInstances[0]))
    }
  }, [!service])

  const runInference = async (event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    if(isLoading) return
    
    setIsLoading(true)
    setResponse(null)
    setRequestStatus(null)

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          // @ts-ignore
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + user.apiKey
        },
        cache: 'no-cache',
        // @ts-ignore
        body
      })

      let requestStatus = response.status == 200

      const jsonResponse = await response.json()

      if(jsonResponse?.success === false) {
        requestStatus = false;
      }

      setRequestStatus(requestStatus)

      setResponse(jsonResponse)
      setIsLoading(false)
    } catch(error) {
      setIsLoading(false)
      setResponse(null)
      setRequestStatus(false)
    }
  }

  return (
    <div ref={ref}>
      <div className='py-2 flex items-center px-3 border-b-2 bg-gray-50'>
        <div className='h-2 w-2 bg-green-400 rounded-full mr-2'></div>
        <div className='text-xs' style={{ fontFamily: 'Inconsolata' }}>{ apiEndpoint }</div>
      </div>

      <div>
        <textarea value={body} placeholder='Request Body' onChange={e => setBody(e.target.value)} className='text-sm w-full h-full p-4' style={{ fontFamily: 'Inconsolata', height: 150 }}>

        </textarea>
      </div>

      <div onClick={runInference} className='flex hover:bg-indigo-600 transition-colors items-center bg-indigo-500 text-white px-2 py-1 text-sm text-center cursor-pointer justify-center'>
        {
          !isLoading && 
          <>
            <div>Run inference</div>
            <ArrowDown height={13} width={13} className='ml-1'/>
          </>
        }
        {
          isLoading &&
            <div className='infinitespin'>
              <RefreshCw height={13} width={13} className='my-1'/>
            </div>
        }
      </div>

      <div className='border-t-2 p-4 text-sm' style={{ height: 210 }}>
        { !response && <div className='text-gray-600 text-sm'> Send the request to display the result</div> }

        {
          requestStatus !== null && 
            <div>
              { requestStatus && <div><span className='bg-green-500 text-white rounded text-sm px-1'>Success</span></div> }
              { !requestStatus && <div><span className='bg-red-500 text-white rounded text-sm px-1'>Error</span></div> }
            </div>
        }

        {
          response && <pre style={{ fontFamily: 'Inconsolata', overflow: 'auto', maxHeight: '150px' }}>
            {JSON.stringify(response, null, 2)}
            </pre>
        }
      </div>
    </div>
  )
})

export default TestAPI