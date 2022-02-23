import { Between } from "typeorm";
import moment from 'moment'
import { MetricDataPoint } from "../entity/MetricDataPoint";

export async function getMetricValues<T = number>(metricId: string, startDate?: Date, endDate?: Date): Promise<T[]> {
  startDate = startDate ?? new Date(moment().subtract(30, 'days').toString())
  endDate = endDate ?? new Date()

  const values = await MetricDataPoint.find({
    where: {
      metricId: metricId,
      createdAt: Between(startDate, endDate),
    }
  })

  return values.map(value => value.data as T)
}

