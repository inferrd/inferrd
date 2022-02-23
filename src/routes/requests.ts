import { AsyncRouter } from "express-async-router";
import { assertCurrentUserIsPartOfTeam } from "../access";
import { Service } from "../entity/Service";
import { Request } from '../entity/Request'
import { serializeRequest } from "../utils/serializer";

const requestRouter = AsyncRouter()

requestRouter.get(
  '/service/:id/requests',
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

    let where: Partial<Request> = {
      serviceId
    }

    if(req.query.status) {
      where.responseStatus = Number(String(req.query.status))
    }

    if(req.query.version) {
      where.versionId = String(req.query.version)
    }

    const limit = req.query.limit ? Number(req.query.limit) : 20
    const offset = req.query.page ? Number(req.query.page) * limit : 0

    const requests = await Request.find({
      where: where,
      order: {
        createdAt: 'DESC'
      },
      select: [
        'id',
        'versionId',
        'serviceId',
        'responseStatus',
        'timingMs',
        'createdAt'
      ],
      take: limit,
      skip: offset,
    })

    res.json(
      requests.map(serializeRequest)
    )
  }
)

requestRouter.get(
  '/request/:rid',
  async (req, res, next) => {
    const request = (await Request.findByIds([req.params.rid]))[0]

    if(!request) {
      throw new Error('Not Found')
    }

    const service = await request.service
    const team = await service.team

    await assertCurrentUserIsPartOfTeam(team)

    res.json(
      serializeRequest(request)
    )
  }
)

export default requestRouter