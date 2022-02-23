import useSWR from "swr"
import { getFetcher } from "../api/api"
import moment from 'moment'
import { useEffect, useState } from "react"
import useServiceVersions from "../state/useServiceVersions"
import useServices from "../state/useServices"

type ApiGraphDataPoint = {
  request_count: string;
  serviceId: string;
  average_response_time: string;
  day: string;
}

type InferrdGraphPoint = {
  requestCount: number;
  latency: number;
  date: string;
}

const useKeyGraphData = (teamId: string, keyId: string) => {
  const { data: dataPoints } = useSWR<{ data: ApiGraphDataPoint[] }>(`/key/${keyId}/requests`, getFetcher)
  const services = useServices(teamId)

  const [buckets, setBuckets] = useState<InferrdGraphPoint[]>([])

  useEffect(() => {
    if(!dataPoints) return

    const buckets: InferrdGraphPoint[] = Array(30).fill(0).map((_, delta) => {
      const day = moment().subtract(29-delta, 'days')

      const iso = day.toISOString()
      const datePart = iso.substr(0,10)

      // could be more than 1 data point (one per version)
      const dataPointsForday = dataPoints?.data.filter(point => {
        return point.day.startsWith(datePart)
      })

      if(dataPointsForday) {
        const totalRequestCount = dataPointsForday.reduce(
          (acc, point) => acc + Number(point.request_count), 0
        )

        let avgLatency = dataPointsForday.reduce(
          (acc, point) => acc + Number(point.average_response_time), 0
        ) / dataPointsForday.length

        if(dataPointsForday.length == 0) {
          avgLatency = 0
        }

        let dataPointToAdd: any = {
          date: iso,
          requestCount: totalRequestCount,
          latency: avgLatency
        }

        for(let serviceDataPoint of dataPointsForday) {
          const service = services?.find(v => v.id == serviceDataPoint.serviceId)

          if(!service) continue

          dataPointToAdd[`requests-${service.name}`] = Number(serviceDataPoint.request_count)
          dataPointToAdd[`latency-${service.name}`] = Number(serviceDataPoint.average_response_time)
        }

        return dataPointToAdd
      }

      return {
        date: iso,
        requestCount: 0,
        latency: 0
      }
    }) 

    setBuckets(buckets) 
  }, [dataPoints, services])

  return buckets
}

export default useKeyGraphData