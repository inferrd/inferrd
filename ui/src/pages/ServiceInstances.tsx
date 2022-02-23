import React from 'react'
import useSWR from 'swr'
import { ApiAllocation, ApiService } from '../api.types'
import { getFetcher } from '../api/api'
import moment from 'moment'

type Props = {
  service: ApiService;
}



const ServiceInstance: React.FC<Props> = ({ service }) => {
  const { data: allocations } = useSWR<ApiAllocation[]>(`/service/${service.id}/allocations`, getFetcher, {
    refreshInterval: 10
  })

  return (
    <div className='mt-3 rounded bg-white shadow'>
      <div className='font-bold pt-4 px-4'>Instances</div>
      <div className={`text-sm text-gray-600 mt-1 px-4 ${allocations?.length == 0 && `pb-4`}`}>Instances currently running with your model.</div>

      <div className='mt-3'>
        {
          allocations?.map(
            (allocation: any) => (
              <div className='px-4 text-sm py-2 flex items-center' style={{
                borderTop: '1px solid rgba(0,0,0,0.1)'
              }}>
                <div style={{ height: 10, width: 10 }} className={`text-sm mr-2 rounded-full bg-${allocation.status == 'running' ? 'green' : 'gray'}-300`}></div>
                <div>{ allocation.status } - { allocation.version }</div>

                <div className='flex-1'></div>

                <div>
                  Started: {moment(allocation.startedAt).fromNow()}
                </div>
              </div>
            )
          )
        }
      </div>
    </div>
  )
}

export default ServiceInstance