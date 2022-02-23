import React from 'react'
import { ResponsiveContainer, BarChart, Tooltip, XAxis, Bar, Line, Rectangle, LineChart } from 'recharts'
import { ApiService } from '../api.types'
import useGraphData from '../hooks/useGraphData';
import moment from 'moment'
import { sortBy, uniqBy } from 'lodash';
import useServiceVersions from '../state/useServiceVersions';

type Props = {
  service: ApiService;
}

const versionColors = [
  '#003f5c',
  '#58508d',
  '#bc5090',
  '#ff6361',
  '#ffa600'
]

const CustomTooltip: React.FC<{ active: any, payload: any, label: any }> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow rounded  px-3 py-2">
        <p className='text-sm text-gray-600'>{moment(payload[0].payload.date).format('Do of MMMM')}</p>
        <p className="label text-sm">{`${payload[0].value}ms`}</p>
      </div>
    );
  }

  return null;
};

const RequestLatencyGraph: React.FC<Props> = ({ service }) => {
  const dataPoints = useGraphData(service.id)
  const versions = useServiceVersions(service.id)

  if(!dataPoints) return
  
  const max = Math.max(...dataPoints.map(d => d.latency))

  const nonZero = dataPoints.filter(d => d.latency != 0)

  const min = nonZero.length == 0 ? 0 : Math.min(...nonZero.map(d => d.latency))
  const avg = Math.floor((nonZero.map(d => d.latency).reduce((a,b) => a+b, 0)/nonZero.length)*10)/10

  let versionsInGraph = [] 

  for(let dataPoint of dataPoints) {
    for(let version of versions || []) {
      if(`latency-v${version.number}` in dataPoint) {
        versionsInGraph.push(version)
      }
    }
  }

  versionsInGraph = sortBy(uniqBy(versionsInGraph, 'id'), 'number')

  return (
    <div className='bg-white shadow rounded mt-3 py-4'>
      <div className='flex items-center gap-2 px-4'>
        <div className='font-bold'>Latency per day</div>
        
        { versionsInGraph.map((version, i) => <div className='flex items-center'>
          <div className='w-2 h-2 rounded-full mr-1' style={{ backgroundColor: versionColors[i % versionColors.length] }}></div>

          <div className='text-sm text-gray-700'>v{version?.number}</div>
        </div> )}
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
            {
              versionsInGraph.map(
                (version, i) => (
                  <Line type="monotone" dataKey={`latency-v${version.number}`} stroke={versionColors[i % versionColors.length]}/>
                )
              )
            }
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RequestLatencyGraph