import { AsyncRouter } from "express-async-router";
import { assertCurrentUserIsPartOfTeam } from "../access";
import { Request } from '../entity/Request'
import moment from 'moment'
import { Service } from "../entity/Service";
import { MoreThan, Not } from "typeorm";
import { Key } from "../entity/Key";
import { Team } from "../entity/Team";

const statsRouter = AsyncRouter()

statsRouter.get(
  '/service/:id/stats',
  async (req, res, next) => {
    const serviceId = req.params.id

    const service = await Service.findOne({
      where: {
        id: serviceId
      }
    })

    if(!service) {
      throw new Error('Not Found')
    }

    const team = await service.team

    await assertCurrentUserIsPartOfTeam(team)

    const requestsCount = await Request.count({
      where: {
        serviceId: service.id,
        createdAt: MoreThan(moment().subtract(30, 'days'))
      }
    })

    const requestErrors = await Request.count({
      where: {
        serviceId: service.id,
        responseStatus: Not(200),
        createdAt: MoreThan(moment().subtract(30, 'days'))
      }
    })

    const latency = await Request.find({
      select: ['timingMs'],
      where: {
        serviceId: service.id,
        createdAt: MoreThan(moment().subtract(30, 'days'))
      }
    })

    const totalLatency = latency.map(l => l.timingMs).reduce((a,b) => a+b, 0)
    const avgLatency = Math.floor(totalLatency/latency.length)

    res.json({
      requestsCount: {
        total: requestsCount || 0,
        errors: requestErrors
      },
      latency: avgLatency
    })
  }
)

statsRouter.get(
  '/team/:id/requests/graph',
  async (req, res, next) => {
    const teamId = req.params.id

    const team = await Team.findOne({
      where: {
        id: teamId
      }
    })

    if(!team) {
      throw new Error('Not Found')
    }

    await assertCurrentUserIsPartOfTeam(team)

    const services = await team.services

    const serviceIds = services.map(
      service => `'${service.id}'`
    )

    const query = `
     select
        count(*) as request_count,
        "serviceId",
        date_trunc('day', "createdAt") as day
     from request
     where "serviceId" IN (${serviceIds.join(',')})
     and "createdAt" > NOW() - '30 day'::INTERVAL
     group by day, "serviceId"
    `

    const requestsBucket = await Request.query(query)

    res.json({
      data: requestsBucket
    })
  }
)

statsRouter.get(
  '/service/:id/graph',
  async (req, res, next) => {
    const serviceId = req.params.id

    const service = await Service.findOne({
      where: {
        id: serviceId
      }
    })

    if(!service) {
      throw new Error('Not Found')
    }

    const team = await service.team

    await assertCurrentUserIsPartOfTeam(team)

    const query = `
     select
        count(*) as request_count,
        "versionId",
        ROUND(percentile_cont(0.95) within group (order by "timingMs")) as "95_percentile_response_time",
        ROUND(percentile_cont(0.90) within group (order by "timingMs")) as "90_percentile_response_time",
        ROUND(percentile_cont(0.99) within group (order by "timingMs")) as "99_percentile_response_time",
        ROUND(AVG("timingMs")) as average_response_time,
        date_trunc('day', "createdAt") as day
     from request
     where "serviceId" = '${service.id}'
     and "createdAt" > NOW() - '30 day'::INTERVAL
     group by day, "versionId"
    `

    const requestsBucket = await Request.query(query)

    res.json({
      data: requestsBucket
    })
  }
)

statsRouter.get(
  '/key/:id/requests',
  async (req, res, next) => {
    const keyId = req.params.id

    const key = await Key.findOne({
      where: {
        id: keyId
      }
    })

    const team = await key.team

    await assertCurrentUserIsPartOfTeam(team)

    const query = `
     select
        count(*) as request_count,
        "serviceId",
        ROUND(percentile_cont(0.95) within group (order by "timingMs")) as "95_percentile_response_time",
        ROUND(percentile_cont(0.90) within group (order by "timingMs")) as "90_percentile_response_time",
        ROUND(percentile_cont(0.99) within group (order by "timingMs")) as "99_percentile_response_time",
        ROUND(AVG("timingMs")) as average_response_time,
        date_trunc('day', "createdAt") as day
     from request
     where "keyId" = '${key.id}'
     and "createdAt" > NOW() - '30 day'::INTERVAL
     group by day, "serviceId"
    `

    const requestsBucket = await Request.query(query)

    res.json({
      data: requestsBucket
    })
  }
)

export default statsRouter