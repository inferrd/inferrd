/**
 * Checks the state of all services
 * on nomad.
 */

import { Service, ServiceDesiredStatus } from "../entity/Service"
import { ServiceStatus, ServiceStatusEnum } from "../entity/ServiceStatus"
import logger from "../logger"
import _ from 'lodash'
import { deployService, deployVersion, FailureCode, getAllocationsForJob, getCanaryForDeployment, getDeployment, getDeploymentId, getEvalFailureCode, getEvalFailureReason, getJobDeployments, getLatestDeployment, getLogsForAllocation, isThereABlockedEvaluation, OutType } from "../services/nomad"
import { Version, VersionDeploymentStatus } from "../entity/Version"
import { RunStatus } from "../entity/types"
import { IsNull, Not } from "typeorm"

const log = logger('cron/nomad')

// utility to create statuses easily
export async function makeStatus(statusType: ServiceStatusEnum, message: string, service: Service) {
  const serviceStatusData: Partial<ServiceStatus> = {
    status: statusType,
    message: message,
  }

  const status = await ServiceStatus.create(serviceStatusData)
  
  status.service = Promise.resolve(service)

  await status.save()

  //log('Status created:', status.status)
}

export async function checkNomadStatus() {
  //log('Syncing with nomad')

  // grap deployment id
  const noDeployId = await Version.find({
    where: {
      nomadEvaluationId: Not(IsNull()),
      deploymentId: IsNull()
    }
  })

  for(let noDeploy of noDeployId) {
    const deploymentId = await getDeploymentId(noDeploy.nomadEvaluationId)

    if(deploymentId) {
      noDeploy.deploymentId = deploymentId
      await noDeploy.save()
    }
  }

  // check deployment status
  const activeDeployments = await Version.find({
    where: {
      deploymentStatus: VersionDeploymentStatus.RUNNING,
      deploymentId: Not(IsNull())
    }
  })

  for(let version of activeDeployments) {
      try {
      const deployment = await getDeployment(version.deploymentId)

      const taskGroups = Object.keys(deployment.TaskGroups ?? {})

      console.log('taskgroups=', taskGroups)

      let statusMap: Record<string, VersionDeploymentStatus> = {
        'running': VersionDeploymentStatus.RUNNING,
        'failed': VersionDeploymentStatus.FAILED,
        'pending': VersionDeploymentStatus.PENDING,
        'successful': VersionDeploymentStatus.SUCCESS,
        'cancelled': VersionDeploymentStatus.CANCELLED
      }

      const newStatus = statusMap[deployment?.Status] || VersionDeploymentStatus.RUNNING

      version.deploymentStatus = newStatus
      version.deploymentStatusDescription = deployment?.StatusDescription

      await version.save()

      if(newStatus == VersionDeploymentStatus.SUCCESS) {
        version.runStatus = RunStatus.SUCCESS;

        await version.save()

        const service = await version.service
        const user = await version.createdBy
        const team = await service.team
      }

      // deployment failed
      if(newStatus == VersionDeploymentStatus.FAILED) {
        //log('Getting canary id for deployment ' + version.deploymentId)
        const canaryId = await getCanaryForDeployment(version.deploymentId)

        let logs = null,
            reasonForFailure = null

        if(canaryId) {
          const stdErr = await getLogsForAllocation(canaryId, 'server', OutType.STDERR)
          const stdOut = await getLogsForAllocation(canaryId, 'server', OutType.STDOUT)
          //log('Getting logs')
          reasonForFailure = await getEvalFailureReason(version.nomadEvaluationId)

          logs = `${stdErr}\n\n${stdOut}`
        }

        version.lastLines = logs;
        version.runStatus = RunStatus.ERROR;
        version.runStatusDescription = reasonForFailure;

        await version.save()

        const user = await version.createdBy
        const service = await version.service

        user.achievements = {
          ...user.achievements,
          SUCCESSFULL_DEPLOY: true
        }

        await user.save()
      }
    } catch(e) {
      //log(`There was an error updating the status of deployment ${version.deploymentId} on version ${version.id}`, e)
    }
  }

  // check service status
  const upServices = await Service.find({
    where: {
      desiredStatus: ServiceDesiredStatus.UP
    }
  })

  for(let service of upServices) {
    try {
      //log('Checking service ' + service.name)
      const name = `service-${service.id}`

      const allocations = await getAllocationsForJob(name)
      const deployments = await getJobDeployments(name)

      // there is at least one deployment running
      const runningDeployment = deployments.find(deploy => deploy.Status == 'running')
      const hasRunningDeployment = runningDeployment != null

      // all jobs
      const runningJobs = allocations.filter((alloc: any) => alloc.ClientStatus == 'running' && alloc.DesiredStatus == 'run')

      // find the current status of the model
      let statuses = await service.statuses
      statuses = _.sortBy(statuses, 'createdAt').reverse()
      let lastStatus = statuses[0]

      // log(`Running deployment: ${hasRunningDeployment}`)
      // log(`Last status: ${lastStatus.status}`)
      // log(`Running jobs: ${runningJobs.length}`)

      const desiredVersion = await service.desiredVersion

      // if there is a deployment running but the model's status is not showing it
      if(hasRunningDeployment) {
        const deployingVersions = Object.keys(runningDeployment.TaskGroups ?? {}).sort()

        const isThereAblockedEval = await isThereABlockedEvaluation(name)

        log('Model has a running deployment')

        let message = `Deploying version${deployingVersions.length > 1 ? 's' : ''} ${deployingVersions.join(', ')}`
        let code = ServiceStatusEnum.DEPLOYING_NEW_VERSION

        if(isThereAblockedEval) {
          message = 'Inferrd is currently out of capacity, your deployment will start once capacity is available'
          code = ServiceStatusEnum.BLOCKED
        }

        if(lastStatus?.message != message) {
          await makeStatus(code, message, service)
        }
      }

      if(!hasRunningDeployment && runningJobs.length >= 1 && lastStatus?.status != ServiceStatusEnum.UP) {
        //log('No running deploy')
        const evalId = runningJobs[0]?.EvalID

        if(!evalId) {
          //log(`Could not find eval ID`)
          continue
        }

        const deploymentId = await getDeploymentId(evalId)

        const runningVersion = await Version.findOne({
          where: {
            deploymentId: deploymentId
          }
        })

        if(!runningVersion) {
          //log('Could not find version?', deploymentId, 'for', service.name)
          continue
        }
        
        if(runningVersion?.id != desiredVersion.id) {
          // got rolled back
          //log('Model was rolled back')
          await makeStatus(ServiceStatusEnum.UP, 'Model has been rolled back to version v' +runningVersion.number, service)
        } else {
          // the right version is up
          //log('Model is up')
          await makeStatus(ServiceStatusEnum.UP, 'Version v' +runningVersion.number + ' deployed', service)
        }
      }

      if(!hasRunningDeployment && runningJobs.length == 0 && lastStatus?.status == ServiceStatusEnum.DEPLOYING_NEW_VERSION) {
        // no deployment and no running jobs
        // and we were deploying
        await makeStatus(ServiceStatusEnum.DOWN, 'Could not deploy version', service)
      }
    } catch(e) {
      log(`There was an error checking the status of model:${service.id}`, e)
    }
  }
}

export default checkNomadStatus