import React, { useEffect, useState } from 'react'
import { Download, RefreshCcw } from 'react-feather'
import { useParams } from 'react-router'
import useSWR from 'swr'
import { ApiService, ApiVersion } from '../api.types'
import { getFetcher } from '../api/api'
import { deployVersion } from '../api/version'
import useLogs from '../state/useLogs'
import { formatBytes } from '../utils'
import moment from 'moment'

type Props = {
  service: ApiService;
}

const ServiceVersion: React.FC<Props> = ({ service }) => {
  const { vid: versionId } = useParams<{ vid: string; }>()

  const { data: version } = useSWR<ApiVersion>(`/version/${versionId}`, getFetcher)

  const [troubleShootMessage, setTroubleShootMessage] = useState<string>(null)

  const { logs, isLoading } = useLogs({
    serviceId: service.id,
    versionId,
    query: null,
    size: 100
  })

  // find error in logs
  useEffect(() => {
    setTroubleShootMessage(null)
    
    if(logs) {
      for(let log of logs) {
        if(log?.text?.indexOf('ModuleNotFoundError: No module named') !== -1) {
          const moduleName = log.text?.split(' ')?.pop()

          setTroubleShootMessage(`It looks like your model encountered an error related to a missing module named ${moduleName}. Try using the setup option while deploying. Here is a tutorial on how to add missing modules: https://docs.inferrd.com/guides/add-module-to-custom-environments. This error can also happen if you forgot to upload some files with your model.`)
        }
      }
    }
  }, [logs, setTroubleShootMessage])

  const onDeploy = () => {
    if (confirm('Are you sure you want to depoy v' + version.number + '?')) {
      deployVersion(version.id)
    }
  }

  if (!version) {
    return <div></div>
  }

  return (
    <div className='mt-3 pb-10'>
      <div className='flex w-full'>
        <div className='bg-white p-4 w-64 rounded shadow' style={{ width: 400 }}>
          <div className='font-bold'>v{version.number}</div>
          <div className='text-sm text-gray-600'>created by {version.createdBy.email}</div>

          {
            version.runStatus == 'success' && <div className='p-1 rounded text-center text-white text-xs bg-green-600 mt-2'>DEPLOYED SUCCESSFULLY</div>
          }

          {
            version.runStatus == 'error' && <div className='p-1 rounded text-center text-white text-xs bg-red-600 mt-2'>{version.runStatusDescription}</div>
          }

          <div className='flex'>
            <div className='flex-1'></div>
            <div onClick={onDeploy} className='inline-block mr-2 text-sm hover:bg-indigo-700 mt-2 transition-colors text-white cursor-pointer bg-indigo-600 rounded mt-1 px-3 py-2 flex items-center gap-2'>
              <RefreshCcw height={13} width={13} />
              Deploy
            </div>

            {!service.marketplaceItem && <a className='inline-block text-sm hover:bg-gray-300 mt-2 transition-colors cursor-pointer bg-gray-200 rounded mt-1 px-3 py-2 flex items-center gap-2' href={version.downloadUrl}>
              <Download height={15} width={15} />
              Download Package {version.bundleSize > 0 && `(${formatBytes(version.bundleSize)})`}
            </a>}
          </div>
        </div>
        <div className='flex-1'></div>
      </div>

      {
        troubleShootMessage && 
          <div className='bg-white rounded shadow mt-3 mb-2'>
            <div className='px-3 py-2 text-red-500'>
              { troubleShootMessage }
            </div>
          </div>
      }

      <div className='bg-white rounded shadow mt-3 mb-10'>
        <div className='border-b-2 px-3 py-2'>
          Logs
        </div>

        {isLoading && <div className='text-sm p-4'>Fetching logs...</div>}

        {
          !isLoading && logs?.map(
            log => {
              const isModuleNotFound = log.text?.indexOf('ModuleNotFoundError') !== -1

              return <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }} className='p-2 flex gap-2'>
                <div style={{ flexShrink: 0, fontFamily: 'Inconsolata' }} className='text-sm text-gray-600'>[{moment(log.timestamp).format("MMMM Do YYYY, h:mm:ss a")}]:</div>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontFamily: 'Inconsolata',
                  ...isModuleNotFound && {
                    color: 'red'
                  }
                }} className='text-sm'>{log.text}</pre>
              </div>
            }
          )
        }

        {
          !isLoading && logs?.length == 0 && <div className='text-sm p-4'>No log entries found</div>
        }
      </div>
    </div>
  )
}

export default ServiceVersion