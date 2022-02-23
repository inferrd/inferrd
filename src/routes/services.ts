import { AsyncRouter } from "express-async-router";
import { customAlphabet } from "nanoid";
import { assertCurrentUserIsPartOfTeam } from "../access";
import { getRequestContext } from "../als";
import { Service, ServiceDesiredStatus } from "../entity/Service";
import { Stack } from "../entity/Stack";
import { Team } from "../entity/Team";
import _ from 'lodash'
import superagent from 'superagent'
import { deployVersion, getAllocationsForJob, getEndpointForService, getJobNameForService, getLogsForAllocation, OutType, shutdownService, updateService } from "../services/nomad";
import { SerializedService, serializeService, serializeStack, serializeVersion } from "../utils/serializer";
import { Instance } from "../entity/Instances";
import { deployVersionToNomad } from "../utils/nomad";
import { ServiceType } from "../entity/types";
import logger from "../logger";
import { ServiceStatus } from "../entity/ServiceStatus";

const servicesRouter = AsyncRouter()
const log = logger('routes/service')
const nanoid = customAlphabet('1234567890abcdef', 20)

servicesRouter.get(
  '/team/:id/services',
  async (req, res, next) => {
    const team = await Team.findOne({
      where: {
        id: req.params.id
      }
    })
    
    await assertCurrentUserIsPartOfTeam(team)

    let services = await team.services

    services = _.sortBy(services, 'createdAt').reverse()

    res.json(
      await Promise.all(services.map(serializeService))
    )
  }
)

servicesRouter.get(
  '/service/:id',
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

    res.json(
      await serializeService(service)
    )
  }
)

servicesRouter.get(
  '/service/:id/allocations',
  async (req, res, next) => {
    const service = await Service.findOne({
      where: { id: req.params.id }
    })

    const team = await service.team

    await assertCurrentUserIsPartOfTeam(team)

    const jobName = getJobNameForService(service)
    const allocations = await getAllocationsForJob(jobName)
    
    const runningAllocations = allocations.filter((alloc: any) => alloc.ClientStatus == 'running')

    res.json(
      runningAllocations.map((alloc: any) => ({
        id: alloc.ID,
        healthy: alloc.DeploymentStatus?.Healthy,
        isCanary: alloc.DeploymentStatus?.Canary,
        version: alloc.TaskGroup,
        status: alloc.ClientStatus,
        startedAt: alloc.TaskStates?.server?.StartedAt
      }))
    )    
  }
)

servicesRouter.get(
  '/service/:id/logs/:type',
  async (req, res, next) => {
    const service = await Service.findOne({
      where: { id: req.params.id }
    })


    const type = req.params.type as OutType

    const team = await service.team

    await assertCurrentUserIsPartOfTeam(team)

    const jobName = getJobNameForService(service)
    const allocations = await getAllocationsForJob(jobName)
    
    const runningAllocation = allocations.filter((alloc: any) => alloc.ClientStatus == 'running')[0]

    if(!runningAllocation) {
      throw new Error('No intance running at this moment')
    }

    const logs = await getLogsForAllocation(
      runningAllocation.ID,
      'server',
      type
    )

    res.json(logs)
  }
)

servicesRouter.get(
  '/service/find/:name',
  async (req, res, next) => {
    const name = req.params.name
    const { user } = getRequestContext()

    const teams = await user.teams

    let allServices: Service[] = []

    for(let team of teams) {
      const services = await team.services

      allServices = [
        ...allServices,
        ...services
      ]
    }

    const namedService = allServices.find(service => service.name == name)

    if(!namedService) {
      throw new Error('Could not find service')
    }

    res.json(
      await serializeService(namedService)
    )
  }
)

servicesRouter.post(
  '/service/:id',
  async (req, res, next) => {
    const serviceId = req.params.id

    let service = await Service.findOne({
      where: {
        id: serviceId
      }
    })

    if(!service) {
      throw new Error('Not Found')
    }

    const team = await service.team

    await assertCurrentUserIsPartOfTeam(team)

    let deployNeeded = false;

    const {
      name,
      instanceId,
      splitTrafficEnabled,
      readme,
      gpuEnabled,
      allowUnAuthenticatedRequests
    } = req.body

    if(name) {
      service.name = name
    }

    if(splitTrafficEnabled !== undefined) {
      service.splitTrafficEnabled = splitTrafficEnabled

      if(!splitTrafficEnabled) {
        deployNeeded = true;
      }
    }

    if(readme) {
      service.readme = readme;
    }

    if(allowUnAuthenticatedRequests !== undefined) {
      service.allowUnAuthenticatedRequests = allowUnAuthenticatedRequests
    }

    const currentInstance = await service.instance

    if(instanceId) {
      const instance = await Instance.findOne({
        where: {
          id: instanceId
        }
      })

      if(!instance) {
        throw new Error('Instance id is wrong.')
      }

      // reload new date
      service = await Service.findOne({
        where: {
          id: serviceId
        }
      })

      // update the instance
      service.instance = Promise.resolve(instance)

      // save new instance
      await service.save()

      // deploy with new instance
      deployVersionToNomad(await service.desiredVersion)
    }

    if(gpuEnabled != null) {
      if(!service.gpuEnabled) {
        // add item to the bill
        const instance = await service.instance

        service.gpuEnabled = (new Date()).toISOString()

        await service.save()
      } else {
        service.gpuEnabled = null

        await service.save()
      }

      // re-deploy service if running
      // if the service is running
      if(service.lastHealtCheck != null && service.desiredStatus == ServiceDesiredStatus.UP) {
        // re-deploy
        deployVersionToNomad(await service.desiredVersion)
      }
    }

    await service.save()

    // create billing item if not there
    if(currentInstance.monthlyPrice > 0 && !service.billingItemId) {
      // reload new date
      service = await Service.findOne({
        where: {
          id: serviceId
        }
      })
    }

    if(deployNeeded) {
      await updateService(service)
    }

    res.json(
      await serializeService(service)
    )
  }
)

servicesRouter.delete(
  '/service/:id',
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

    // 1. shut down the job
    if(service.desiredStatus == ServiceDesiredStatus.UP) {
      await shutdownService(service)
    }

    service.deletedAt = new Date()

    await service.save()

    res.json({ ok: true })
  }
)

servicesRouter.post(
  '/team/:id/services',
  async (req, res, next) => {
    const team = await Team.findOne({
      where: {
        id: req.params.id
      }
    })
    
    await assertCurrentUserIsPartOfTeam(team)
    
    const services = await team.services

    const { user } = getRequestContext()

    const plan = await team.plan

    let maxServices = 8

    if(!user.emailVerified && services.length > 0) {
      throw new Error('Verify your email to create more than 1 service.')
    }

    if(plan) {
      maxServices = plan.features.models
    }

    if(services.length > maxServices) {
      throw new Error('You have reached your maximum of ' + maxServices + ' services. Change plans to deploy more models.')
    }

    let {
      name,
      stackId,
      instanceId,
      type
    } = req.body

    if(!name) {
      throw new Error('Name is required.')
    }

    const modelWithSameName = services.find(service => service.name == name)

    if(modelWithSameName) {
      throw new Error('A model with this name already exists.')
    }

    if(!stackId && type != ServiceType.DOCKER) {
      throw new Error('Stack is required.')
    }

    if(!instanceId) {
      // take the most expensive instance
      const instance = await Instance.findOne({
        order: {
          'monthlyPrice': 'DESC'
        }
      })

      instanceId = instance.id
    }

    const stack = await Stack.findOne({
      where: [
        { id: stackId },
        { humanReadableId: stackId }
      ]
    })

    if(!stack && type != ServiceType.DOCKER) {
      throw new Error('Could not find this stack.')
    }

    const instance = await Instance.findOne({
      where: {
        id: instanceId
      }
    })

    if(!instance) {
      throw new Error('Could not find this instance type.')
    }

    const serviceData: Partial<Service> = {
      name,
      instancesDesired: 0,
      type: type ?? ServiceType.ML,
      key: `model_${nanoid()}`,
      allowUnAuthenticatedRequests: false,
      desiredStatus: ServiceDesiredStatus.DOWN,
      gpuEnabled: instance.enableGpu ? (new Date()).toISOString() : null
    }

    const service = Service.create(serviceData)

    service.desiredStack = Promise.resolve(stack)
    service.instance = Promise.resolve(instance)
    service.team = Promise.resolve(team)
    service.createdBy = Promise.resolve(user)

    await service.save()

    user.achievements = {
      ...user.achievements,
      CREATE_MODEL: true
    }

    await user.save()

    res.json(
      await serializeService(service)
    )
  }
)

export default servicesRouter