import { Service } from "../entity/Service";
import { Version } from "../entity/Version";
import * as superagent from 'superagent'
import logger from "../logger";
import _, { sortBy } from 'lodash'
import moment from 'moment'

const log = logger('nomad')

const API_ENDPOINT = process.env.NOMAD_SERVER
const API_TOKEN = process.env.NOMAD_TOKEN

export enum OutType {
  STDOUT = 'stdout',
  STDERR = 'stderr'
}

function clamp(x: number, lower: number, higher: number): number {
  return x <= lower ? lower : (x >= higher ? higher : x);
}

export async function getHCL(service: Service): Promise<string> {
  const stack = await service.desiredStack
  const team = await service.team

  // zero downtime only for paying customers
  const isZeroDowntime = false//instance.monthlyPrice > 0

  const fluentdLogging = true
  const versions = [await service.desiredVersion]

  const activateGpu = service.gpuEnabled && stack.supportGpu

  const jobDescription = `
  job "service-${service.id}" {
    type = "service"
    datacenters = ["dc1"]

    meta {
      teamId = "${team.id}"
      modelId = "${service.id}"
      stackId = "${stack.id}"
      generatedAt = "${moment().toString()}"
    }

    update {
      max_parallel      = 1
      canary            = 1
      healthy_deadline  = "15m"
      min_healthy_time = "10s"
      auto_promote      = true
      progress_deadline = "0"
      stagger           = "10s"
      health_check      = "${isZeroDowntime ? 'checks' : 'task_states'}"
    }
    
    ${(await Promise.all(versions.map(async version => {
      const stack = await version.stack
      let healthcheckEndpoint = '/healthcheck'

      if (stack.humanReadableId.startsWith('tensorflow')) {
        healthcheckEndpoint = '/v1/models/model'
      }

      const isProd = process.env.NODE_ENV === 'production'

  return `
    group "v${version.number}" {
      count = 1

      reschedule {
        attempts = 0
        unlimited = false
      }
      
      restart {
        attempts = 1
        mode = "fail"
      }
      
      network {
        port "http" {
          to = 9001
        }
      }

      service {
        port = "http"
        task = "server"
        name = "model-${service.id}"
      
        check {
          name     = "http_healthcheck"
          type     = "http"
          path     = "${healthcheckEndpoint}"
          method   = "get"
          interval = "5s"
          timeout  = "2s"
        }
      }

      task "server" {
        driver = "docker"
        
        config {
          image = "${stack.dockerUrl}"
          ports = ["http"]
          image_pull_timeout = "15m"

          ${isProd && activateGpu ? 'runtime = "nvidia"' : ''}

          ${isProd && fluentdLogging ? `logging {
            type = "fluentd"

            config {
              fluentd-address = "localhost:24224"
              fluentd-buffer-limit = 1
              tag = "docker.${service.id}.${version.id}"
            }
          }` : ``}
        }
      
        restart {
          attempts = 0
          mode = "fail"
          interval = "5m"
          delay    = "15s"
        }
        
        env {
          MODEL_DOWNLOAD = "${process.env.DOCKER_HOST}/version/${version.id}/download"
          MODEL_VERSION = "${version.number}"
          CUDA_LAUNCH_BLOCKING = 1
          PYTHONUNBUFFERED = "1"
          TOKENIZERS_PARALLELISM = "false"
          PORT = 9001
        }

        meta {
          versionId = "${version.id}"
          versionNumber = "${version.number}"
        }
        
        resources {
          cpu = ${service.desiredCpuHz}
          memory = ${service.desiredRamMb}
          memory_max = ${2 * service.desiredRamMb}
        }
      }
    }
    `
  }
  ))).join('\n')}
  }
`

  return jobDescription
}

export enum FailureCode {
  UNKNOWN,
  OOM
}

export async function getEvalFailureCode(evalId: string): Promise<FailureCode> {
  const allocs = await superagent.get(`${API_ENDPOINT}/v1/evaluation/${evalId}/allocations`).set('X-Nomad-Token', API_TOKEN)

  const reason = allocs.body[0]?.TaskStates?.server?.Events?.find((ev: any) => ev.Type == 'Terminated')?.Message

  if (reason == 'OOM Killed') {
    return FailureCode.OOM
  }

  return FailureCode.UNKNOWN
}

export async function getEvalFailureReason(evalId: string): Promise<string> {
  const failureCode = await getEvalFailureCode(evalId)

  if (failureCode == FailureCode.OOM) {
    return `Your model consumed more memory than allocated. Use a bigger instance.`
  }

  return `An error happened while running your model.`
}

export async function deployVersion(version: Version): Promise<string> {
  const service = await version.service
  const jobHCL = await getHCL(service)

  const jsonDescription = await parseHCL(jobHCL)

  if (jsonDescription.job == null) {
    throw new Error('Invalid job description')
  }

  const job = await superagent.post(`${API_ENDPOINT}/v1/jobs`).set('X-Nomad-Token', API_TOKEN).send({
    Job: jsonDescription
  })

  return job.body.EvalID
}

export async function deployService(service: Service): Promise<string> {
  const jobHCL = await getHCL(service)

  const jsonDescription = await parseHCL(jobHCL)

  if (jsonDescription.job == null) {
    throw new Error('Invalid job description')
  }

  const job = await superagent.post(`${API_ENDPOINT}/v1/jobs`).set('X-Nomad-Token', API_TOKEN).send({
    Job: jsonDescription
  })

  return job.body.EvalID
}

export async function getLogsForAllocation(allocId: string, taskName: string, outType: OutType) {
  const logs = await superagent.get(`${API_ENDPOINT}/v1/client/fs/logs/${allocId}?task=${taskName}&type=${outType}&origin=end&offset=20000`).set('X-Nomad-Token', API_TOKEN)

  const data = logs.body.Data

  try {
    if (!data || data?.length == 0) return null

    return Buffer.from(data, 'base64').toString('ascii')
  } catch (e) {
    return null
  }
}

export async function getDeploymentId(evalId: string): Promise<string> {
  if (!evalId) return null

  const evals = await superagent.get(`${API_ENDPOINT}/v1/evaluations?prefix=${evalId}`).set('X-Nomad-Token', API_TOKEN)

  return evals.body?.[0]?.DeploymentID
}

export async function getDeployment(deployId: string): Promise<any> {
  if (!deployId) return null

  const evals = await superagent.get(`${API_ENDPOINT}/v1/deployment/${deployId}`).set('X-Nomad-Token', API_TOKEN)

  return evals.body
}

/**
 * This will force a deployment to fail
 * @param deploymentId The id of the nomad deployment
 */
export async function failDeployment(deploymentId: string): Promise<void> {
  await superagent.post(
    `${API_ENDPOINT}/v1/deployment/fail/${deploymentId}`
  )
}

export function getNomadServiceName(service: Service): string {
  return `service-${service.id}`
}

export async function getRunningDeploymentId(service: Service): Promise<string> {
  const deployments = await getJobDeployments(getNomadServiceName(service))

  const runningDeployment = deployments.find(
    deploy => deploy.Status == 'running'
  )

  return runningDeployment?.ID
}

export async function hasADeploymentInProgress(service: Service): Promise<boolean> {
  const deployId = await getRunningDeploymentId(service)

  return deployId != null
}

export async function getEval(evalId: string): Promise<any> {
  if (!evalId) return null

  const evals = await superagent.get(`${API_ENDPOINT}/v1/evaluations?prefix=${evalId}`).set('X-Nomad-Token', API_TOKEN)

  return evals.body?.[0]
}

export async function getEvalAllocations(evalId: string): Promise<any[]> {
  if (!evalId) return null

  const evals = await superagent.get(`${API_ENDPOINT}/v1/evaluation/${evalId}/allocations`).set('X-Nomad-Token', API_TOKEN)

  return evals.body
}

export function getJobNameForService(service: Service) {
  return `service-${service.id}`
}

export async function getJobDeployments(jobId: string): Promise<NomadDeployment[]> {
  const deploymentRequest = await superagent.get(`${API_ENDPOINT}/v1/job/${jobId}/deployments`).set('X-Nomad-Token', API_TOKEN)

  return deploymentRequest.body as NomadDeployment[]
}

export async function updateVersion(version: Version): Promise<string> {
  const service = await version.service
  const jobHCL = await getHCL(service)

  const jsonDescription = await parseHCL(jobHCL)
  const jobName = getNomadServiceName(service)

  const hasRunningDeployment = await hasADeploymentInProgress(service)

  if (hasRunningDeployment) {
    const runningDeploymentId = await getRunningDeploymentId(service)

    // there is already a version getting deployed.
    // we first need to cancel the current deployment
    log(`Failing deployment ${runningDeploymentId}`)
    //await failDeployment(runningDeploymentId)
  }

  const jobUrl = `${API_ENDPOINT}/v1/job/${jobName}`

  try {
    const job = await superagent.post(jobUrl).set('X-Nomad-Token', API_TOKEN).send({
      Job: jsonDescription
    })

    log(job.body)

    return job.body.EvalID
  } catch (e) {
    log('Error while updating service', e.response?.text)
  }
}

export async function updateService(service: Service): Promise<string> {
  const jobHCL = await getHCL(service)

  const jsonDescription = await parseHCL(jobHCL)
  const jobName = getNomadServiceName(service)

  const hasRunningDeployment = await hasADeploymentInProgress(service)

  if (hasRunningDeployment) {
    const runningDeploymentId = await getRunningDeploymentId(service)

    // there is already a version getting deployed.
    // we first need to cancel the current deployment
    log(`Failing deployment ${runningDeploymentId}`)
    //await failDeployment(runningDeploymentId)
  }

  const jobUrl = `${API_ENDPOINT}/v1/job/${jobName}`

  try {
    const job = await superagent.post(jobUrl).set('X-Nomad-Token', API_TOKEN).send({
      Job: jsonDescription
    })

    log(job.body)

    return job.body.EvalID
  } catch (e) {
    log('Error while updating service', e.response?.text)
  }
}

export async function shutdownService(service: Service) {
  const jobName = `service-${service.id}`

  await superagent.delete(`${API_ENDPOINT}/v1/job/${jobName}`).set('X-Nomad-Token', API_TOKEN)
}

export async function parseHCL(hcl: string) {
  log('Parsing HCL')

  const url = `${API_ENDPOINT}/v1/jobs/parse`

  try {
    const response = await superagent.post(url).set('X-Nomad-Token', API_TOKEN).send({
      JobHCL: hcl
    })

    return response.body
  } catch (e) {
    log('Error when parsing HCL', hcl, e.response?.text)
    return null
  }
}

export async function getAllocationsForJob(name: string) {
  const allocations = await superagent.get(`${API_ENDPOINT}/v1/job/${name}/allocations`).set('X-Nomad-Token', API_TOKEN)

  return allocations.body
}

export async function getCanaryForDeployment(deployId: string): Promise<string> {
  try {
    const deploymentData = await superagent.get(`${API_ENDPOINT}/v1/deployment/${deployId}`).set('X-Nomad-Token', API_TOKEN)

    const canaryId = deploymentData.body.TaskGroups?.http?.PlacedCanaries?.[0]

    return canaryId
  } catch (e) {
    return null
  }
}

export async function getAllocation(id: string) {
  const allocations = await superagent.get(`${API_ENDPOINT}/v1/allocation/${id}`).set('X-Nomad-Token', API_TOKEN)

  return allocations.body
}

export async function getNode(id: string) {
  const node = await superagent.get(`${API_ENDPOINT}/v1/node/${id}`).set('X-Nomad-Token', API_TOKEN)

  return node.body
}

export async function getEndpointForVersion(version: Version) {
  const service = await version.service
  const name = `service-${service.id}`

  const allocs = await getAllocationsForJob(name)

  const runningAlloc = allocs.find((alloc: any) => 
    alloc.ClientStatus == 'running'
    && alloc.TaskGroup == `v${version.number}`
  )

  if (!runningAlloc) {
    throw new Error('No instances of this version are running. Check the dashboard for more details.')
  }

  const allocId = runningAlloc.ID

  const alloc = await this.getAllocation(allocId)

  const nodeId = alloc.NodeID

  const node = await getNode(nodeId)

  let ip = node?.HTTPAddr.split(':')[0]

  const port = alloc?.AllocatedResources?.Shared?.Networks[0]?.DynamicPorts[0].Value

  return `http://${ip}:${port}`
}  

export async function getEndpointForService(service: Service) {
  const name = `service-${service.id}`

  const allocs = await getAllocationsForJob(name)

  const runningAlloc = allocs.find((alloc: any) => alloc.ClientStatus == 'running')

  if (!runningAlloc) {
    throw new Error('No instances of this model are running. Check the dashboard for more details.')
  }

  const allocId = runningAlloc.ID

  const alloc = await this.getAllocation(allocId)

  const nodeId = alloc.NodeID

  const node = await getNode(nodeId)

  let ip = '172.17.0.1'

  const port = alloc?.AllocatedResources?.Shared?.Networks[0]?.DynamicPorts[0].Value

  return `http://${ip}:${port}`
}

export type NomadDeployment = {
  ID: string;
  Namespace: string;
  JobID: string;
  JobVersion: number;
  IsMultiregion: boolean;
  TaskGroups: {
    [name: string]: {
      Promoted: boolean;
      PlacedCanaries: number;
      DesiredCanaries: number;
      DesiredTotal: number;
      PlacedAllocs: number;
      HealthyAllocs: number;
      UnhealthyAllocs: number;
    }
  },
  Status: "successful" | "failed" | "running" | "cancelled",
  StatusDescription: string;
}

export async function getEvaluations(jobId: string) {
  const evaluations = await superagent.get(`${API_ENDPOINT}/v1/job/${jobId}/evaluations`).set('X-Nomad-Token', API_TOKEN)

  return evaluations.body
}

export async function isThereABlockedEvaluation(jobId: string) {
  const evaluations = await getEvaluations(jobId)

  return evaluations.some((evaluation: any) => evaluation.Status == 'blocked')
}

export async function getLatestDeployment(jobId: string) {
  const deployments = await getJobDeployments(jobId)

  return sortBy(deployments, 'JobVersion').reverse()[0]
}