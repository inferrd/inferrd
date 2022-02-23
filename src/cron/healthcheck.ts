/**
 * Checks that all services that are supposed to be
 * up are up.
 */

import { Service, ServiceDesiredStatus } from "../entity/Service"
import logger from "../logger"
import { getEndpointForService } from "../services/nomad"
import superagent from 'superagent'
import axios from 'axios'
import moment from 'moment'
import { ServiceStatus, ServiceStatusEnum } from "../entity/ServiceStatus"

const log = logger('cron/healtcheck')

const checkThatServicesAreUp = async () => {
  const upServices = await Service.find({
    where: {
      desiredStatus: ServiceDesiredStatus.UP
    }
  })

  if(upServices.length == 0) {
    //log('No services to check')
  }

  for(let service of upServices) {
    //log('Healthcheck for service ' + service.id)

    const desiredVersion = await service.desiredVersion

    if(!desiredVersion) {
      //log('No desired version for service ' + service.id)
      continue
    }

    const stack = await desiredVersion.stack

    try {
      const endpoint = await getEndpointForService(service)

      let fragment = `/v1/models/model`

      if(stack.humanReadableId.startsWith('spacy')
      || stack.humanReadableId.startsWith('sklearn')
      || stack.humanReadableId.startsWith('keras')
      || stack.humanReadableId.startsWith('pytorch')
      || stack.humanReadableId.startsWith('xgboost')
      || stack.humanReadableId.startsWith('custom')) {
        fragment = '/healthcheck'
      }

      if(stack.humanReadableId.startsWith('onnx')) {
        fragment = '/v2/models/model'
      }

      if(stack.humanReadableId.startsWith('mlflow')) {
        fragment = '/ping'
      }
      
      const result = await axios.get(`${endpoint}${fragment}`)

      const model_version_status = result.data?.model_version_status

      let modelVersion = null

      if(stack.humanReadableId.startsWith('spacy')
      || stack.humanReadableId.startsWith('xgboost')
      || stack.humanReadableId.startsWith('sklearn')
      || stack.humanReadableId.startsWith('keras')
      || stack.humanReadableId.startsWith('pytorch')
      || stack.humanReadableId.startsWith('custom')) {
        modelVersion = Number(result.data.version)
      } else if(stack.humanReadableId.startsWith('onnx')) {
        modelVersion = Number(result.data.versions[0])
      } else if(stack.humanReadableId.startsWith('mlflow')) {
        modelVersion = desiredVersion.number
      } else {
        modelVersion = model_version_status?.[0]?.version
      }

      const wasDown = !service.lastHealtCheck

      await Service.update({
        id: service.id
      }, {
        lastHealtCheckVersion: parseInt(modelVersion),
        lastHealtCheck: new Date()
      })
      //log('Service is up')

      // set status as down
      if(wasDown) {
        const serviceStatusData: Partial<ServiceStatus> = {
          status: ServiceStatusEnum.UP,
          message: 'Model is up'
        }
    
        const serviceStatus = await ServiceStatus.create(serviceStatusData)

        serviceStatus.service = Promise.resolve(service)
    
        await serviceStatus.save()
      }
    } catch(e) {
      //log('There was an error', e)

      // wait 60 seconds to declare dead
      const lastCheckDate = moment(service.lastHealtCheck)
      const sinceLastCheck = moment.duration(moment().diff(lastCheckDate))

      const secondsDiff = sinceLastCheck.asSeconds()

      if(secondsDiff > 60) {
        service.lastHealtCheck = null
        service.lastHealtCheckVersion = null
      
        await Service.update({
          id: service.id
        }, {
          lastHealtCheckVersion: null,
          lastHealtCheck: null
        })

        // set status as down
        const serviceStatusData: Partial<ServiceStatus> = {
          status: ServiceStatusEnum.DOWN,
          message: 'Model is down'
        }
    
        const serviceStatus = await ServiceStatus.create(serviceStatusData)

        serviceStatus.service = Promise.resolve(service)
    
        await serviceStatus.save()
      }
    }
  }
}

export default checkThatServicesAreUp