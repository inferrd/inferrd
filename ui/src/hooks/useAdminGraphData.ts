import useSWR from "swr"
import { getFetcher } from "../api/api"
import moment from 'moment'
import { useEffect, useState } from "react"

type ApiGraphDataPoint = {
  request_count: string;
  average_response_time: string;
  day: string;
}

type InferrdGraphPoint = {
  requestCount: number;
  latency: number;
  date: string;
}

const useAdminGraphData = () => {
  const { data: dataPoints } = useSWR<{ data: ApiGraphDataPoint[] }>(`/admin/requests`, getFetcher)

  const [buckets, setBuckets] = useState<InferrdGraphPoint[]>([])

  useEffect(() => {
    if(!dataPoints) return

    const buckets: InferrdGraphPoint[] = Array(30).fill(0).map((_, delta) => {
      const day = moment().subtract(29-delta, 'days')

      const iso = day.toISOString()
      const datePart = iso.substr(0,10)

      const dataPoint = dataPoints?.data.find(point => {
        return point.day.startsWith(datePart)
      })

      if(dataPoint) {
        return {
          date: iso,
          requestCount: Number(dataPoint.request_count),
          latency: Number(dataPoint.average_response_time)
        }
      }

      return {
        date: iso,
        requestCount: 0,
        latency: 0
      }
    }) 

    setBuckets(buckets) 
  }, [dataPoints])

  return buckets
}

export default useAdminGraphData