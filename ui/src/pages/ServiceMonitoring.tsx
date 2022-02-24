import moment, { version } from 'moment'
import React, { useContext } from 'react'
import { useParams } from 'react-router'
import useSWR from 'swr'
import { ApiService, ApiVersion, ApiServiceStatus, ApiModelStats, ServiceType } from '../api.types'
import { getFetcher } from '../api/api'
import RequestGraph from '../components/RequestGraph'
import RequestLatencyGraph from '../components/RequestLatencyGraph'
import { TeamContext } from '../context/TeamManager'
import { UserContext } from '../context/UserManager'
import { formatMilliseconds } from '../utils'

export function formatRequestNumber(requests: number): string {
  if (requests === undefined) return

  if (requests < 1_000) {
    return `${requests}`
  }

  if (requests < 10_000) {
    return `${Math.floor(requests / 100) / 10}k`
  }

  if (requests < 1_000_000) {
    return `${Math.floor(requests / 1000)}k`
  }

  return `${Math.floor(requests / 1_000_000)}M`
}

const ServiceOverview: React.FC = ({ }) => {
  const params = useParams<{ mid: string }>()

  const { team } = useContext(TeamContext)
  const { user } = useContext(UserContext)

  const { data: service } = useSWR<ApiService>(`/service/${params.mid}`, getFetcher, {
    refreshInterval: 2000
  })

  const { data: versions } = useSWR<ApiVersion[]>(`/service/${params.mid}/versions?limit=3`, getFetcher, {
    refreshInterval: 2000
  })

  const { data: stats } = useSWR<ApiModelStats>(`/service/${params.mid}/stats`, getFetcher, {
    refreshInterval: 10000
  })

  if (!service || !versions) {
    return <div className='container mx-auto mt-5'>Loading..</div>
  }

  return (
    <>
      {versions.length == 0 && <div className='shadow text-sm text-gray-700 text-center py-4 rounded mt-3 bg-white'>
        After deploying your model, you can see live monitoring here.
      </div>}

      <div className={`${versions?.length == 0 && 'pointer-events-none opacity-50'}`}>
        <div className='flex justify-start gap-4'>
          <div className='flex-1'>
            <div className='shadow rounded mt-3 pt-4 bg-white'>
              <div className='font-bold px-4'>Model Stats</div>

              <div className='px-4 flex mt-3 gap-2' style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }} >
                <div className='flex-1 py-4' style={{ borderRight: '1px solid rgba(0,0,0,0.1)' }}>
                  <div className='text-5xl font-bold'>{service.desiredVersion?.number ?? 0}</div>
                  <div className='text-gray-700'>Version</div>
                </div>

                <div className='flex-1 py-4 pl-4' style={{ borderRight: '1px solid rgba(0,0,0,0.1)' }}>
                  <div className='text-5xl font-bold'>{service.isUp ? 1 : 0}</div>
                  <div className='text-gray-700'>Instance</div>
                </div>

                <div className='flex-1 py-4 pl-4' style={{ borderRight: '1px solid rgba(0,0,0,0.1)' }}>
                  <div className='text-5xl font-bold'>{stats?.latency ? formatMilliseconds(stats.latency) : '-'}</div>
                  <div className='text-gray-700'>Latency</div>
                </div>

                <div className='flex-1 py-4 pl-4' style={{ borderRight: '1px solid rgba(0,0,0,0.1)' }}>
                  <div className='text-5xl font-bold'>{formatRequestNumber(stats?.requestsCount.total)}</div>
                  <div className='text-gray-700'>Requests</div>
                </div>

                <div className='flex-1 py-4 pl-4' style={{ borderRight: '1px solid rgba(0,0,0,0.1)' }}>
                  <div className='text-5xl font-bold'>{stats?.requestsCount.errors}</div>
                  <div className='text-gray-700'>Errors</div>
                </div>

                <div className='flex-1 py-4 pl-4'>
                  <div className='text-5xl font-bold'>{service.isSplitTraffic ? 'Yes' : 'No'}</div>
                  <div className='text-gray-700'>A/B Split</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <RequestGraph service={service} />
        <RequestLatencyGraph service={service} />
      </div>
    </>
  )
}

export default ServiceOverview