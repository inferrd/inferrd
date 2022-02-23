import { AsyncRouter } from "express-async-router"
import { assertCurrentUserIsPartOfTeam } from "../access"
import _ from 'lodash'
import { Service } from "../entity/Service"
import { serializeServiceStatus } from "../utils/serializer"
import { ServiceStatus } from "../entity/ServiceStatus"

const statusRouter = AsyncRouter()

statusRouter.get(
  '/service/:id/last_status',
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

    let statuses = await service.statuses

    if(statuses.length == 0) {
      return res.json(null)
    }

    statuses = _.sortBy(statuses, 'createdAt').reverse()

    let status = statuses[0]

    res.json(
      serializeServiceStatus(status)
    )
  }
)

statusRouter.get(
  '/service/:id/statuses',
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

    let statuses = await ServiceStatus.find({
      where: {
        serviceId: service.id
      },
      order: {
        'createdAt': 'DESC'
      },
      take: req.query.limit ? Number(req.query.limit) : 30
    })

    res.json(
      statuses.map(serializeServiceStatus)
    )
  }
)

export default statusRouter