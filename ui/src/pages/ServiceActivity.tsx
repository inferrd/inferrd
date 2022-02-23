import React from 'react'
import useSWR from 'swr'
import { ApiService, ApiServiceStatus } from '../api.types'
import { getFetcher } from '../api/api'
import moment from 'moment'

type Props = {
  service: ApiService;
}

const ServiceActivity: React.FC<Props> = ({ service }) => {

  const { data: statuses } = useSWR<ApiServiceStatus[]>(`/service/${service.id}/statuses?limit=10`, getFetcher, {
    refreshInterval: 2000
  })

  return (
    <div className='shadow rounded mt-3 pt-4 bg-white'>
      <div className='font-bold px-4'>Activity</div>

        {
          statuses && 
            <div className='mt-3'>
            {statuses.map(
              status => (
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }} className='px-4 py-2 text-sm flex items-center transition-colors'>
                  <div>
                    <div>{status.message}</div>
                    
                  </div>

                  <div className='flex-1'></div>

                  <div className='text-sm text-gray-700'>{moment(status.createdAt).fromNow()}</div>
                </div>
              )
            ) }
            </div>
        }

        {
          statuses && statuses.length == 0 && <div className='px-4 text-sm text-gray-700 pb-4 mt-2'>No activity</div>
        }
    </div>
  )
}

export default ServiceActivity