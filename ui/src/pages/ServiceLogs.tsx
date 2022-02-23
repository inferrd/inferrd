import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import useSWR from 'swr'
import { ApiAllocation, ApiService, ApiVersion } from '../api.types'
import { getFetcher } from '../api/api'
import useLogs from '../state/useLogs'
import moment from 'moment'

type Props = {
  service: ApiService;
}

const ServiceLogs: React.FC<Props> = ({ service }) => {
  const [selectedVersion, setSelectedVersion] = useState<string>()
  const [query, setQuery] = useState<string>()
  const [size, setSize] = useState<number>(30)

  const { logs, isLoading } = useLogs({
    serviceId: service.id,
    versionId: selectedVersion,
    query: query?.length == 0 ? null : query,
    size
  })

  const { data: versions } = useSWR<ApiVersion[]>(
    `/service/${service.id}/versions`,
    getFetcher
  )

  useEffect(() => {
    if (versions?.length > 0) {
      setSelectedVersion(versions[0].id)
    }
  }, [versions])

  useEffect(() => {
    const container = document.querySelector('#scroll-container')
    if (container) {
      container?.scrollTo({
        top: 1000000
      });
    }
  }, [logs])


  if (!versions) {
    return <p></p>
  }

  const versionOptions = [
    ...versions?.map(v => ({
      label: `v${v.number}`,
      value: v.id
    }))
  ]
  return (
    <>
      {versions.length == 0 && <div className='shadow text-sm text-gray-700 text-center py-4 rounded mt-3 bg-white'>
        After deploying your model, you can see live logs here.
      </div>}
      
      <div className={`${versions?.length == 0 && 'pointer-events-none opacity-50'} mt-3 pb-10`}>
        <div className='bg-white rounded items-center shadow gap-2 px-4 py-2 mt-3 flex px-4'>
          <div className='text-gray-600'>Search</div>
          <div>
            <input value={query} style={{ width: 400 }} className='border-2 px-2 py-1 rounded' placeholder='Type to search' onChange={e => setQuery(e.target.value)} />
          </div>
          <div className='text-gray-600'>5s auto-refresh</div>

          <div className='flex-1'></div>
          <div className='text-gray-600'>Versions</div>

          <div style={{ width: 300 }}>
            <Select options={versionOptions} onChange={v => setSelectedVersion(v.value)} value={versionOptions.find(v => v.value == selectedVersion)} />
          </div>
        </div>

        <div className='flex w-full mt-2'>
          <div className='bg-white w-full shadow rounded' style={{
            maxHeight: 700,
            overflow: 'auto'
          }} id='scroll-container'>
            {isLoading && <div className='text-sm p-4'>Fetching logs...</div>}

            {
              !isLoading && logs?.map(
                log => (
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }} className='p-2 flex gap-2'>
                    <div style={{ flexShrink: 0, fontFamily: 'Inconsolata' }} className='text-sm text-gray-600'>[{moment(log.timestamp).format("MMMM Do YYYY, h:mm:ss a")}]:</div>
                    <pre style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      fontFamily: 'Inconsolata'
                    }} className='text-sm'>{log.text}</pre>
                  </div>
                )
              )
            }

            {
              !isLoading && logs?.length == 0 && <div className='text-sm p-4'>No log entries found</div>
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default ServiceLogs