import 'reflect-metadata';
import express, { Request, Response } from "express";
import superagent from 'superagent'
import bodyParser from "body-parser"
import cors from 'cors'
import { connect } from './db';
import {errorHandler} from "./error";
import logger from "./logger";
import { asyncLocalStorageMiddleware } from './als'
import { authenticateClient, enforceAuth } from './auth';
import userRouter from './routes/users';
import authRouter from './routes/auth';
import teamsRouter from './routes/teams';
import servicesRouter from './routes/services';
import stackRouter from './routes/stack';
import versionRouter from './routes/versions';
import statusRouter from './routes/status';
import inferenceRouter from './routes/inference';
import requestRouter from './routes/requests';
import instanceRouter from './routes/instances';
import noAuthRouter from './routes/no-auth';
import tfRouter from './routes/tf';
import adminRouter from './routes/admin';
import statsRouter from './routes/stats';

import http from 'http'
import startCron from './cron';
import keysRouter from './routes/keys';
import metricsRouter from './routes/metrics';
import logsRouter from './routes/logs';
import internalRouter from './routes/internal';
import downloadRouter from './routes/download';

const log = logger('server')

log('Starting server')

const app = express()

const port = process.env.PORT || 3000

app.use('/healthcheck', (req, res, next) => {
  res.send({ up: true })
  res.end()
})

app.use(bodyParser.json({
  limit: '200mb'
}))
app.use(cors())

app.use(asyncLocalStorageMiddleware)

// before authentication
app.use(authenticateClient)
app.use(metricsRouter)
app.use(authRouter)
app.use(inferenceRouter)
app.use(downloadRouter)
app.use(noAuthRouter)
app.use(internalRouter)

// authentication enforced
app.use(enforceAuth)
app.use(userRouter)
app.use(servicesRouter)
app.use(stackRouter)
app.use(teamsRouter)
app.use(statsRouter)
app.use(versionRouter)
app.use(statusRouter)
app.use(requestRouter)
app.use(instanceRouter)
app.use(logsRouter)
app.use(tfRouter)
app.use(adminRouter)
app.use(keysRouter)

app.use(errorHandler)

const server = http.createServer(app)

log('Connecting to database..')
connect().then(connection => {
  log('Connected to db')

  server.listen(port, () => {
    log(`Server listening on port ${port}`)
  })

  log('Starting CRON jobs')
  startCron()
})