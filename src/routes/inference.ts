import { AsyncRouter } from "express-async-router";
import { Service } from "../entity/Service";
import superagent from 'superagent'
import { getEndpointForService, getEndpointForVersion } from "../services/nomad";
import { Request } from "../entity/Request";
import { getRequestContext } from "../als";
import { assertCurrentUserIsPartOfTeam } from "../access";
import { modelLatency, modelRequests } from "../prometheus";
import { Version } from "../entity/Version";

const inferenceRouter = AsyncRouter()

inferenceRouter.post(
  '/infer/:id/:type?',
  async (req, res, next) => {
    const id = req.params.id
    let body = req.body
    const { user, key } = getRequestContext()

    const service = await Service.findOne({
      where: {
        key: id
      }
    })

    const version = await service.desiredVersion
    const stack = await service.desiredStack
  
    if(!service) {
      throw new Error('Could not find model')
    }

    if(!service.allowUnAuthenticatedRequests) {
      if(user) {
        const team = await service.team

        await assertCurrentUserIsPartOfTeam(team)
      } else if (key) {
        const roleNeeded = `model:${service.id}:inference`
        const hasRole = key.roles.includes(roleNeeded)

        if(!hasRole) {
          throw new Error('Key does not have authorization')
        }
      } else {
        throw new Error('Missing key or personal token')
      }
    }

    let endpoint = null

    if(service.splitTrafficEnabled) {
      endpoint = await getEndpointForVersion(version)
    } else {
      endpoint = await getEndpointForService(service)
    }

    const requestLogData: Partial<Request> = {
      requestBody: body
    }

    const requestLog = await Request.create(requestLogData)

    requestLog.service = Promise.resolve(service)
    requestLog.version = Promise.resolve(version)

    const startTime = Date.now()

    try {
      // set format to match tensorflow api, mlflow follows the same thing
      if((stack.humanReadableId.startsWith('tensorflow') || stack.humanReadableId.startsWith('mlflow'))
      && !body.instances) {
        body = {
          instances: [body]
        }
      }

      let url = `${endpoint}/v1/models/model:${req.params.type}`

      if(stack.humanReadableId.startsWith('mlflow')) {
        url = `${endpoint}/invocations`
      }

      if(stack.humanReadableId.startsWith('onnx')) {
        url = `${endpoint}/v2/models/model/infer`
      }

      const result = await superagent.post(url).send(body)

      const endTime = Date.now()

      res.json(result.body)

      let isSuccesfull = result.status === 200

      if(result.body?.success == false) {
        isSuccesfull = false;
      }

      requestLog.responseBody = result.body
      requestLog.responseStatus = isSuccesfull ? 200 : 400
      requestLog.timingMs = endTime - startTime
      requestLog.userId = user?.id

      modelRequests.labels(service.id, `${result.status}`).inc(1)
      modelLatency.labels(service.id, `${result.status}`).observe(endTime - startTime)

      await requestLog.save()

      setImmediate(async () => {
        const user = await version.createdBy

        user.achievements = {
          ...user.achievements,
          FIRST_INFERENCE: true
        }

        await user.save()
      })

      setImmediate(async () => {
        // only log succesfull attempts
        if(result.status == 200 && requestLog.requestBody.success != false) {
          // if it's the onboarding and the user is logged in
          if(user && user.onboardingState?.serviceId == service.id
            && !user.onboardingState?.inferenceId) {
            // update the version
            user.onboardingState.inferenceId = requestLog.id

            await user.save()
          }
        }
      })
    } catch(e) {
      if(e.response?.body) {
        const endTime = Date.now()

        requestLog.responseBody = e.response.body
        requestLog.responseStatus = e.response.status
        requestLog.timingMs = endTime - startTime
  
        await requestLog.save()

        return res.status(400).json(e.response.body)
      }

      res.json({
        error: true,
        name: e.name,
        message: e.message
      })
    }
  }
)

export default inferenceRouter