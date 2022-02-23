import React from 'react'
import { ResponsiveContainer, ComposedChart, XAxis, Area, Line, Tooltip, Rectangle, YAxis } from 'recharts'
import useSWR from 'swr'
import { ApiDriftTracker, ApiMetricRollup, ApiService } from '../api.types'
import { getFetcher } from '../api/api'
import moment from 'moment'
import { useNormalize30DayRollup } from '../hooks/useNormalize30DayRollup'

type Props = {
  service: ApiService;
  tracker: ApiDriftTracker;
}

const DistrubtionTooltip: React.FC<{ active: any, payload: any, label: any }> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow rounded  px-3 py-2">
        <p className='text-sm text-gray-600'>{moment(payload[0].payload.day).format('Do of MMMM')}</p>
        { payload[0].payload.ranges[0] !== undefined && <p className="label text-sm">{`between ${payload[0].payload.ranges[0]} and ${payload[0].payload.ranges[1]}`}</p> }
        { payload[0].payload.ranges[0] === undefined && <p className="label text-sm">No data</p> }
      </div>
    );
  }

  return null;
};


const VarianceTooltip: React.FC<{ active: any, payload: any, label: any }> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow rounded  px-3 py-2">
        <p className='text-sm text-gray-600'>{moment(payload[0].payload.day).format('Do of MMMM')}</p>
        { payload[0].payload.variance !== undefined && <p className="label text-sm">{`variance is ${payload[0].payload.variance}`}</p> }
        { payload[0].payload.variance === undefined && <p className="label text-sm">No data</p> }
      </div>
    );
  }

  return null;
};

const DrifItem: React.FC<Props> = ({ tracker, service }) => {
  const { data: rollups } = useSWR<ApiMetricRollup[]>(`/drift/${tracker.id}/rollups`, getFetcher) 

  const normalized = useNormalize30DayRollup(rollups)

  const graphData = normalized.map(rollup => ({
    day: rollup.day,
    mean: rollup.rollup?.mean || 0,
    ranges: [
      rollup?.rollup?.highest || 0,
      rollup?.rollup?.lowest || 0,
    ],
    variance: rollup?.rollup?.variance || 0
  }))

  console.log(graphData)

  return (
    <div>
      <div className='flex items-center gap-5 text-sm'>
        <div><span className='text-gray-600'>Range</span></div>
      </div>

      <div className='flex gap-4 py-5 bg-gray-50 mt-1 rounded'>
        <ResponsiveContainer width={'100%'} height={100}>
          <ComposedChart
            data={graphData}>
            <YAxis width={30} type={'number'} domain={[(dataMin: number) => dataMin - dataMin * 0.1, (dataMax: number) => dataMax + 0.1 * dataMax]}/>
            <Tooltip content={DistrubtionTooltip} />
            <XAxis dataKey="day" hide axisLine={true}/>
            <Area stroke="rgba(0,0,250,0.1)" fill="rgba(0,0,250,0.05)" type="monotone" dataKey="ranges"/>
            <Line type="monotone" stroke="rgba(0,0,250,0.3)" dataKey="mean"/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className='flex items-center gap-5 mt-2 text-sm'>
        <div><span className='text-gray-600'>Variance</span></div>
      </div>

      <div className='flex gap-4 py-5 bg-gray-50 mt-1 rounded'>
        <ResponsiveContainer width={'100%'} height={100}>
          <ComposedChart 
            data={graphData}>
            <YAxis width={30} type={'number'} domain={[(dataMin: number) => dataMin - dataMin * 0.1, (dataMax: number) => dataMax + 0.1 * dataMax]}/>
            <Tooltip content={VarianceTooltip} />
            <XAxis dataKey="day" hide axisLine={true}/>
            <Line type="monotone" stroke="rgba(0,0,250,0.3)" dataKey="variance"/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default DrifItem