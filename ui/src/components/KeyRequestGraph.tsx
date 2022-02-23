import React from 'react'
import { ApiKey, ApiService } from '../api.types'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Rectangle } from 'recharts';
import useSWR from 'swr';
import { getFetcher } from '../api/api';
import moment from 'moment'
import useGraphData from '../hooks/useGraphData';
import useServiceVersions from '../state/useServiceVersions';
import useKeyGraphData from '../hooks/useKeyGraphData';
import useServices from '../state/useServices';

type Props = {
  teamId: string;
  keyId: string;
}

const versionColors = [
  'rgba(79, 70, 229, 0.9)',
  'rgba(79, 70, 229, 0.6)',
  'rgba(79, 70, 229, 0.2)',
  '#4F64A6',
  '#2D1620',
  '#4C11DE',
  '#5BB2F1',
  '#BF555E'
]

const CustomTooltip: React.FC<{ active: any, payload: any, label: any }> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce(
      (acc: number, pay: any) => acc + pay.value, 0
    )

    return (
      <div className="bg-white shadow rounded  px-3 py-2">
        <p className='text-sm text-gray-600'>{moment(payload[0].payload.date).format('Do of MMMM')}</p>
        <p className="label text-sm">{`total: ${total} requests`}</p>

        {
          payload.map(
            (payloadValue: any) => (
              <p className="label text-sm">{payloadValue.dataKey.split('-')[1]}: {`${payloadValue.value} requests`}</p>
            )
          )
        }       
      </div>
    );
  }

  return null;
};

const CustomCursor = (props: any) => {
  const { x, y, width, height, stroke } = props;
  return <Rectangle fill="rgba(0,0,0,0.05)" stroke="rgba(0,0,0,0.06)" x={x} y={y} width={width} height={height} />;
};

const KeyRequestGraph: React.FC<Props> = ({ teamId, keyId }) => {
  const dataPoints = useKeyGraphData(teamId, keyId)
  const services = useServices(teamId)

  if(!dataPoints) return

  const max = Math.max(...dataPoints.map(d => d.requestCount))
  const min = Math.min(...dataPoints.map(d => d.requestCount))
  
  const avg = Math.floor(dataPoints.map(d => d.requestCount).reduce((a,b) => a+b, 0)/dataPoints.length)

  let servicesInGraph: ApiService[] = [] 

  for(let dataPoint of dataPoints) {
    for(let service of services || []) {
      if(`requests-v${service.name}` in dataPoint) {
        servicesInGraph.push(service)
      }
    }
  }

  return (
    <div className='bg-white shadow rounded mt-3 py-4'>
      <div className='flex items-center gap-2 px-4'>
        <div className='font-bold'>Requests per day</div>
        
        { servicesInGraph.map((service, i) => <div className='flex items-center'>
          <div className='w-2 h-2 rounded-full mr-1' style={{ backgroundColor: versionColors[i % versionColors.length] }}></div>

          <div className='text-sm text-gray-700'>{service.name}</div>
        </div> )}
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

            {
              servicesInGraph.map(
                (service, i) => (
                  <Bar minPointSize={2} dataKey={`requests-${service.name}`} stackId='a' fill={versionColors[i % versionColors.length]} radius={i == servicesInGraph.length-1 && [3, 3, 0, 0]}/>
                )
              )
            }
            {/* <Bar minPointSize={2} dataKey="requestCount" stackId='a' fill="rgba(79, 70, 229, 0.6)" radius={[3, 3, 0, 0]}/> */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default KeyRequestGraph