require('dotenv').config()

import logger from './logger'

const log = logger('dev')

log('Starting Dev SERVER')
import './server'

//log('Starting Dev WORKER')
//import './worker'