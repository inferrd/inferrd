import React from 'react'
import { ResponsiveContainer, BarChart, Tooltip, XAxis, Bar, Line, Rectangle, LineChart } from 'recharts'
import { ApiService } from '../api.types'
import useGraphData from '../hooks/useGraphData';
import moment from 'moment'
import useAdminGraphData from '../hooks/useAdminGraphData';

type Props = {
}

const CustomTooltip: React.FC<{ active: any, payload: any, label: any }> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    console.log(payload)

    return (
      <div className="bg-white shadow rounded  px-3 py-2">
        <p className='text-sm text-gray-600'>{moment(payload[0].payload.date).format('Do of MMMM')}</p>
        <p className="label text-sm">{`${payload[0].value}ms`}</p>
      </div>
    );
  }

  return null;
};

const AdminLatencyGraph: React.FC<Props> = ({ }) => {
  const dataPoints = useAdminGraphData()

  if(!dataPoints) return
  
  const max = Math.max(...dataPoints.map(d => d.latency))
  const min = Math.min(...dataPoints.map(d => d.latency))

  const nonZero = dataPoints.filter(d => d.latency != 0)
  const avg = Math.floor((nonZero.map(d => d.latency).reduce((a,b) => a+b, 0)/nonZero.length)*10)/10

  return (
    <div className='bg-white shadow rounded mt-3 py-4'>
      <div className='flex items-center gap-2 px-4'>
        <div className='font-bold'>Latency per day</div>
        <div className='flex-1'></div>

        <div className='text-sm text-gray-700'>Max: {max}ms</div>
        <div className='text-sm text-gray-700'>Min: {min}ms</div>
        <div className='text-sm text-gray-700'>Avg: {avg}ms</div>
      </div>

      <div className='px-4 mt-2'>
        <ResponsiveContainer width={'100%'} height={100}>
          <LineChart data={dataPoints} height={100}>
            <Tooltip content={CustomTooltip} />
            <XAxis hide dataKey='time'/>
            <Line type="monotone" dataKey="latency" stroke="rgba(79, 70, 229, 0.6)"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AdminLatencyGraph