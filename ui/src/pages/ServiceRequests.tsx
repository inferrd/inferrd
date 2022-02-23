import React, { useContext, useState } from 'react'
import useSWR from 'swr'
import { ApiRequest, ApiService, ApiVersion } from '../api.types'
import { getFetcher } from '../api/api'
import moment from 'moment'
import Select from 'react-select'
import { UserContext } from '../context/UserManager'
import RequestGraph from '../components/RequestGraph'
import useRequest from '../state/useRequest'
import ReactJson from 'react-json-view'

type Props = {
  service: ApiService;
}

const ServiceRequest: React.FC<Props> = ({ service }) => {
  const { user } = useContext(UserContext)

  const [page, setPage] = useState<number>(0)

  const [showSuccess, setShowSuccess] = useState<boolean>(true)
  const [showErrors, setShowError] = useState<boolean>(true)

  const [selectedVersion, setSelectedVersion] = useState<string>('all')

  const { data: requests } = useSWR<ApiRequest[]>(
    `/service/${service.id}/requests?limit=100&offset=${page * 100}` + (showSuccess != showErrors ? (showSuccess ? '&status=200' : '&status=400') : '') + (selectedVersion != 'all' ? '&version=' + selectedVersion : ''),
    getFetcher
  )

  const { data: versions } = useSWR<ApiVersion[]>(
    `/service/${service.id}/versions`,
    getFetcher
  )

  const [selectedRequestId, setSelectedRequestId] = useState<string>()
  const {request: requestObject, isLoading} = useRequest(selectedRequestId)

  if (!versions) {
    return <p></p>
  }

  const versionOptions = [
    { label: 'All versions', value: 'all' },
    ...versions.map(v => ({
      label: `v${v.number}`,
      value: v.id
    }))
  ]

  return (
    <>
      {versions.length == 0 && <div className='shadow text-sm text-gray-700 text-center py-4 rounded mt-3 bg-white'>
        After deploying your model, you can see all requests here.
      </div>}

      <div className={`${versions?.length == 0 && 'pointer-events-none opacity-50'} mt-3 pb-10`}>
        <div className='flex-none'>
          <div className='bg-white rounded items-center shadow px-4 py-2 mt-3 flex px-4'>
            <div className='text-gray-600'>Status</div>

            <div className='flex gap-2 mr-6 ml-4'>
              <div className='flex items-center'>
                <input checked={showSuccess} onChange={e => setShowSuccess(!showSuccess)} type='checkbox' className='mr-1' />
                <div>Successfull</div>
              </div>

              <div className='flex items-center'>
                <input checked={showErrors} onChange={e => setShowError(!showErrors)} type='checkbox' className='mr-1' />
                <div>Errors</div>
              </div>
            </div>

            <div className='text-gray-600 mr-4'>Versions</div>

            <div style={{ width: 300 }}>
              <Select options={versionOptions} onChange={v => setSelectedVersion(v.value)} value={versionOptions.find(v => v.value == selectedVersion)} />
            </div>

            <div className='flex-1'></div>

            <div className='text-gray-600'>
              Found {requests?.length} requests
            </div>
          </div>

          {/* <div className='bg-white mt-2 rounded shadow px-4 py-4'>
          <div className='mb-2 font-bold'>In your notebook</div>

          <p className='text-gray-600 text-sm my-2'>Retrieve requests in your notebook:</p>

          <div style={{ fontFamily: 'Inconsolata' }}  className='overflow-auto text-sm bg-black text-white rounded py-3 px-4'>
           <span className='text-pink-600' style={{ fontFamily: 'Inconsolata' }}>import</span> inferrd<br/>
            inferrd.auth(<span className='text-green-600' style={{ fontFamily: 'Inconsolata' }}>'{user.apiKey}'</span>)<br/>
            inferrd.get_requests(<span className='text-green-600' style={{ fontFamily: 'Inconsolata' }}>'{service.name}'</span>)
          </div>
      </div>  */}
        </div>
        <RequestGraph service={service} />
        <div className='flex gap-2 w-full mt-2'>
          <div className='flex-none' style={{ width: 300 }}>
            <div className='bg-white rounded shadow pt-2'>

              <div className='flex flex-col gap-0'>
                <div className='text-gray-600 px-4 text-xs mb-3 font-bold mt-2'>REQUESTS</div>

                {
                  requests && requests.map(
                    req => (
                      <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }} onClick={() => setSelectedRequestId(req.id)} className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${requestObject?.id == req.id && 'bg-gray-50'}`}>
                        <div className={`bg-${req.responseStatus == 200 ? 'gray' : 'red'}-400 rounded px-2 py-1 inline text-xs text-white`}>
                          {req.responseStatus == 200 ? 'OK' : 'ERROR'}
                        </div>

                        <div className='text-sm'>
                          {req.timingMs}ms
                        </div>

                        <div style={{ flex: 1 }}></div>

                        <div className='text-sm text-gray-600'>
                          {moment(req.createdAt).fromNow()}
                        </div>
                      </div>
                    )
                  )
                }

                {
                  requests && requests.length == 0 && <div className='text-gray-600 text-sm px-4 pb-2'>No request found, requests sent to this model will appear here.</div>
                }
              </div>
            </div>
          </div>

          <div className='flex-1'>
            <div className='bg-white rounded shadow px-4 py-4'>
              <div className='text-gray-600 text-xs mb-2 font-bold'>DETAILS</div>
              {
                isLoading && <div className='text-sm'>Loading...</div>
              }

              {
                !selectedRequestId && <div className='text-gray-600 text-sm'>Select a request to view more.</div>
              }

              {
                selectedRequestId && requestObject?.id &&
                <>
                  <div className='text-sm pb-3'>Model version: v{versions.find(version => requestObject.versionId == version.id)?.number}</div>

                  <div className='text-gray-600 text-sm mb-2'>Request Body</div>

                  <code className='text-sm w-full mt-1 bg-gray-200 block mb-3 rounded px-2 py-2 text-black' style={{ maxHeight: 600, maxWidth: '100%', overflow: 'auto' }}>
                    <pre style={{ fontFamily: 'Inconsolata' }}>
                      { typeof requestObject.requestBody == 'object' &&  <ReactJson quotesOnKeys={false} displayObjectSize={false} enableClipboard={false} displayDataTypes={false} name={false} src={requestObject.requestBody}/> }
                      { typeof requestObject.requestBody != 'object' && JSON.stringify(requestObject.requestBody, null, 2) }
                    </pre>
                  </code>

                  <div className='text-gray-600 text-sm mb-2'>Response Body</div>

                  <code className='text-sm w-full mt-1 bg-gray-200 block mb-3 rounded px-2 py-2 text-black' style={{ maxHeight: 600, maxWidth: '100%', overflow: 'auto' }}>
                    <pre style={{ fontFamily: 'Inconsolata' }}>
                      { typeof requestObject.responseBody == 'object' &&  <ReactJson quotesOnKeys={false} displayObjectSize={false} enableClipboard={false} displayDataTypes={false} name={false} src={requestObject.responseBody}/> }
                      { typeof requestObject.responseBody != 'object' && JSON.stringify(requestObject.responseBody, null, 2) }
                    </pre>
                  </code>
                </>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ServiceRequest