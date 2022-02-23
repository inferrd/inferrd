import { mutate, trigger } from "swr";
import { ApiJob, ApiJobRun } from "../api.types";
import { del, post } from "./api";

export async function intertupJob(jobId: string) {
  const job: ApiJob = await post(`/job/${jobId}/interupt`, {
    
  })

  await trigger(`/job/${jobId}/runs`, true)
}

export async function intertupJobRun(jobRunId: string) {
  const job: ApiJobRun = await post(`/run/${jobRunId}/interupt`, {
    
  })

  await trigger(`/job/${job.jobId}/runs`, true)
}

export async function restartJob(jobRunId: string) {
  const job: ApiJobRun = await post(`/run/${jobRunId}/restart`, {
    
  })

  await trigger(`/job/${job.jobId}/runs`, true)
}

export async function deleteJob(jobId: string) {
  await del(`/job/${jobId}`)

  await mutate(`/job/${jobId}`, null)
}