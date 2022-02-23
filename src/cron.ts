import {CronJob} from 'cron'
import checkThatServicesAreUp from './cron/healthcheck'
import rollupMetricJob from './cron/metricRollup'
import checkNomadStatus from './cron/nomad'
import { connect } from './db'
import logger from './logger'

const log = logger('cron')


const syncCron = '*/5 * * * * *'
const tenMinutes = '0 */10 * * * *'
const dailyCron = '0 0 0 * * *'

// every first day of month at noon
const monthly = '0 0 12 1 * *' 

const healthCheck = new CronJob(
  syncCron,
  checkThatServicesAreUp
)

const nomadCheck = new CronJob(
  syncCron,
  checkNomadStatus
)

const rollupJob = new CronJob(
  tenMinutes,
  rollupMetricJob
)

const startCron = () => {
  log('Setting up CRON')
  
  connect().then(() => { 
    nomadCheck.start()
    healthCheck.start()
    rollupJob.start()
    //freezeCheck.start()
  })
}

export default startCron