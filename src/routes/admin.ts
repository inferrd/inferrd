import { AsyncRouter } from "express-async-router";
import moment from "moment";
import { MoreThan, Not } from "typeorm";
import { getRequestContext } from "../als";
import { Service } from "../entity/Service";
import * as jwt from 'jsonwebtoken'
import { Request } from "../entity/Request";
import { User } from "../entity/User";
import { JWT_SECRET } from "./../utils/crypto";
import { serializeService, serializeTeam, serializeUser, serializeVersion } from "../utils/serializer";
import { Team } from "../entity/Team";
import { Version } from "../entity/Version";
import TeamController from "../controller/TeamController";

const adminRouter = AsyncRouter()

adminRouter.use('/admin', async (req, res, next) => {
  const { user } = getRequestContext()

  if(!user.isAdmin) {
    throw new Error('Not found')
  } else {
    next()
  }
})

adminRouter.get(
  '/admin/user/:id',
  async (req, res) => {
    const id = req.params.id

    const user = await User.findOne({
      where: {
        id
      }
    })

    res.json(serializeUser(user))
  }
)

adminRouter.get(
  '/admin/user/:id/teams',
  async (req, res) => {
    const id = req.params.id

    const user = await User.findOne({
      where: {
        id
      }
    })

    const teams = await user.teams

    res.json(
      await Promise.all(teams.map(serializeTeam))
    )
  }
)

adminRouter.get(
  '/admin/services',
  async (req, res, next) => {
    const services = await Service.find({
      order: {
        createdAt: 'DESC'
      }
    })

    res.json(
      await Promise.all(services.map(serializeService))
    )
  }
)

adminRouter.get(
  '/admin/users',
  async (req, res, next) => {
    const users = await User.find({
      order: {
        createdAt: 'DESC'
      }
    })

    res.json(
      users.map(serializeUser)
    )
  }
)

adminRouter.get(
  '/admin/deploys',
  async (req, res, next) => {
    const deploys = await Version.find({
      where: {
        createdAt: MoreThan(moment().subtract(30, 'days'))
      },
      order: {
        createdAt: 'DESC'
      }
    })

    res.json(
      await Promise.all(deploys.map(async deploy => {
        let serialized = await serializeVersion(deploy)

        const service = await deploy.service
        
        if(service) {
          // @ts-ignore 
          serialized.model = await serializeService(service)
        }

        return serialized
      }))
    )
  }
)

adminRouter.get(
  '/admin/team/:id',
  async (req, res, next) => {
    const { id } = req.params

    const team = await TeamController.findById(id)

    if(!team) {
      throw new Error('not found')
    }

    res.json(
      await serializeTeam(team)
    )
  }
)

adminRouter.get(
  '/admin/team/:id/models',
  async (req, res, next) => {
    const { id } = req.params

    const team = await TeamController.findById(id)

    if(!team) {
      throw new Error('not found')
    }

    const services = await team.services

    res.json(
      await Promise.all(services.map(serializeService))
    )
  }
)

adminRouter.get(
  '/admin/team/:id/users',
  async (req, res, next) => {
    const { id } = req.params

    const team = await TeamController.findById(id)

    if(!team) {
      throw new Error('not found')
    }

    const users = await team.users

    res.json(
      await Promise.all(users.map(serializeUser))
    )
  }
)

adminRouter.get(
  '/admin/teams',
  async (req, res, next) => {
    const teams = await Team.find({
      order: {
        balance: 'DESC'
      }
    })

    res.json(
      await Promise.all(teams.map(serializeTeam))
    )
  }
)

adminRouter.get(
  '/admin/requests',
  async (req, res, next) => {
    const query = `
     select
        count(*) as request_count,
        ROUND(percentile_cont(0.95) within group (order by "timingMs")) as "95_percentile_response_time",
        ROUND(percentile_cont(0.90) within group (order by "timingMs")) as "90_percentile_response_time",
        ROUND(percentile_cont(0.99) within group (order by "timingMs")) as "99_percentile_response_time",
        ROUND(AVG("timingMs")) as average_response_time,
        date_trunc('day', "createdAt") as day
     from request
     where "createdAt" > NOW() - '30 day'::INTERVAL
     group by day
    `

    const requestsBucket = await Request.query(query)

    res.json({
      data: requestsBucket
    })
  }
)

adminRouter.post(
  '/admin/login',
  async (req, res, next) => {
    const user = await User.findOne({
      where: {
        id: req.body.id
      }
    })
  
    if(!user) {
      throw new Error('No user found')
    }

    res.json({
      token: jwt.sign({
        userId: user.id
      }, JWT_SECRET)
    })
  }
)

export default adminRouter