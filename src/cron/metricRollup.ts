import logger from "../logger"
import moment from 'moment'
import { Metric } from "../entity/Metric"
import { MetricDataPoint } from "../entity/MetricDataPoint"
import mean from 'lodash/mean'
import { MetricRollup } from "../entity/MetricRollup"
import { Between, LessThan, MoreThan } from "typeorm"

const log = logger('rollup')

const rollupMetricJob = async () => {
  // doing yesterday's rollup
  log('Rolling up metrics')
  for(let i = 0; i < 10; i++) {
    const day = moment().subtract(i, 'days')

    day.set('hour', 0)
    day.set('minute', 0)
    day.set('seconds', 0)

    //log('Rolling up metrics for ' + day.toString())

    const metrics = await Metric.find()

    //log(metrics.length + ' metrics to rollup')

    for(let metric of metrics) {
      const startDate = new Date(day.toString())
      const endDate = new Date(moment().subtract(i, 'days').add(1, 'day').toString())
      
      const values = await MetricDataPoint.find({
        where: {
          metricId: metric.id,
          createdAt: Between(startDate, endDate),
        }
      })

      //log('Metric ' + metric.name + ' has ' + values.length + ' values between ' + startDate + ' and ' + endDate)

      let dataValues = values.map(value => value.data as number).sort()

      if(dataValues.length > 0) {
        let computedMean = mean(values.map(value => value.data))
        let computedMedian = dataValues[Math.floor(dataValues.length / 2)]
        let lowestValue = dataValues[0]
        let highestValue = dataValues[dataValues.length - 1]

        let variance = getStandardDeviation(dataValues)

        let metricRoll = await MetricRollup.findOne({
          where: {
            metricId: metric.id,
            day: new Date(day.toString())
          }
        })

        if(!metricRoll) {
          metricRoll = MetricRollup.create()

          metricRoll.metric = Promise.resolve(metric)
          metricRoll.day = new Date(day.toString())
        }

        metricRoll.rollup = {
          mean: computedMean,
          median: computedMedian,
          lowest: lowestValue,
          highest: highestValue,
          variance
        }

        await metricRoll.save()
      }
    }
  }
}

function getStandardDeviation (array: number[]) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

export default rollupMetricJob