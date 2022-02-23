import moment from "moment";
import { useEffect, useState } from "react";
import { ApiMetricRollup } from "../api.types";

export function useNormalize30DayRollup(rollups: ApiMetricRollup[]): Partial<ApiMetricRollup>[] {
  const [normalized, setNormalized] = useState<Partial<ApiMetricRollup>[]>([])

  useEffect(() => {
    const buckets: Partial<ApiMetricRollup>[] = Array(30).fill(0).map((_, delta) => {
      const day = moment().subtract(29-delta, 'days')

      const iso = day.toISOString()
      const datePart = iso.substr(0,10)

      const dataPoint = rollups?.find(rollup => {
        return rollup.day.startsWith(datePart)
      })

      if(dataPoint) {
        return {
          day: iso,
          found: true,
          ...dataPoint
        }
      }

      return {
        day: iso,
      }
    }) 

    setNormalized(buckets)
  }, [rollups])

  return normalized
}