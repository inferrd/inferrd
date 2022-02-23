import { AsyncRouter } from "express-async-router";
import { assertCurrentUserIsPartOfTeam } from "../access";
import { Service } from "../entity/Service";
import superagent from 'superagent'
import { getEndpointForService } from "../services/nomad";

// these routes only apply to services running
// tfserving

const tfRouter = AsyncRouter()

tfRouter.get(
  '/service/:id/tf_metadata',
  async (req, res, next) => {
    const servceId = req.params.id

    const service = await Service.findOne({
      where: {
        id: servceId
      }
    })

    const team = await service.team

    await assertCurrentUserIsPartOfTeam(team)

    const endpoint = await getEndpointForService(service)

    const metadataEndpoint = `${endpoint}/v1/models/model/metadata`

    const metadataRequest = await superagent.get(metadataEndpoint)

    res.json(
      metadataRequest.body
    )
  }
)

export default tfRouter