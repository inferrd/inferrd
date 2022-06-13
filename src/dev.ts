const nodeVersion = parseInt(process.versions.node.split('.')[0])

if (nodeVersion < 18) {
    throw new Error('You must use Node 18 or higher to use this app.')
}

// load environment from .env file
require('dotenv').config()

import logger from './logger'

const log = logger('dev')

log('Starting Dev SERVER')
import './server'

//log('Starting Dev WORKER')
//import './worker'