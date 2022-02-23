import { job } from "cron";
import { AsyncRouter } from "express-async-router";
import { assertCurrentUserIsPartOfTeam } from "../access";
import TeamController from "../controller/TeamController";
import { Service } from "../entity/Service";
import { fetchLogs } from "../services/logs";

const logsRouter = AsyncRouter()

logsRouter.post(
  '/service/:id/logs',
  async (req, res, next) => {
    const serviceId = req.params.id
    
    const {
      versionId,
      size = 50,
      from = 0,
      query
    } = req.body

    const service = await Service.findOne({
      where: {
        id: serviceId
      }
    })

    if(!service) {
      throw new Error('NotFound')
    }

    const team = await TeamController.findById(service.teamId)

    await assertCurrentUserIsPartOfTeam(team)

    const logEntries = await fetchLogs({
      serviceId: serviceId,
      versionId,
      size,
      from,
      query
    })

    res.json(logEntries)
  }
)

export default logsRouter