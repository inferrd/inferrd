import React from 'react'
import { ApiService } from '../api.types'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Rectangle } from 'recharts';
import useSWR from 'swr';
import { getFetcher } from '../api/api';
import moment from 'moment'
import useGraphData from '../hooks/useGraphData';
import useAdminGraphData from '../hooks/useAdminGraphData';

type Props = {
}

const CustomTooltip: React.FC<{ active: any, payload: any, label: any }> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow rounded  px-3 py-2">
        <p className='text-sm text-gray-600'>{moment(payload[0].payload.date).format('Do of MMMM')}</p>
        <p className="label text-sm">{`${payload[0].value} requests`}</p>
      </div>
    );
  }

  return null;
};

const CustomCursor = (props: any) => {
  const { x, y, width, height, stroke } = props;
  return <Rectangle fill="rgba(0,0,0,0.05)" stroke="rgba(0,0,0,0.06)" x={x} y={y} width={width} height={height} />;
};

const AdminRequestGraph: React.FC<Props> = ({ }) => {
  const dataPoints = useAdminGraphData()

  if(!dataPoints) return

  const max = Math.max(...dataPoints.map(d => d.requestCount))
  const min = Math.min(...dataPoints.map(d => d.requestCount))
  
  const avg = Math.floor(dataPoints.map(d => d.requestCount).reduce((a,b) => a+b, 0)/dataPoints.length)

  return (
    <div className='bg-white shadow rounded mt-3 py-4'>
      <div className='flex items-center gap-2 px-4'>
        <div className='font-bold'>Requests per day</div>
        
        <div className='flex-1'></div>

        <div className='text-sm text-gray-700'>Max: {max}rq</div>
        <div className='text-sm text-gray-700'>Min: {min}rq</div>
        <div className='text-sm text-gray-700'>Avg: {avg}rq</div>
      </div>

      <div className='px-4 mt-2'>
        <ResponsiveContainer width={'100%'} height={100}>
          <BarChart data={dataPoints} height={100}>
            <Tooltip cursor={<CustomCursor />} content={CustomTooltip} />
            <XAxis hide dataKey='time'/>
            <Bar minPointSize={2} dataKey="requestCount" stackId='a' fill="rgba(79, 70, 229, 0.6)" radius={[3, 3, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AdminRequestGraph