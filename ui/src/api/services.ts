import { mutate, trigger } from "swr";
import { ApiService, ServiceType } from "../api.types";
import { post, del } from "./api";

export async function createService(teamId: string, name: string, stackId: string, instanceId?: string, type: ServiceType = ServiceType.ML): Promise<ApiService> {
  const result = await post<ApiService>(`/team/${teamId}/services`, {
    name,
    stackId,
    instanceId,
    type
  })

  if(result.error) {
    alert(result.message);
    return null
  }

  await mutate(`/team/${teamId}/services`, (services: ApiService[]) => ([
    result,
    ...(services || [])
  ]))

  return result
}

export async function updateService(serviceId: string, updates: Partial<ApiService & { instanceId: string }>): Promise<ApiService> {
  const result = await post<ApiService>(`/service/${serviceId}`, {
    ...updates
  })

  if(result.error) {
    alert(result.message);
    return null
  }

  await mutate(`/service/${serviceId}`, () => result)

  return result
}

export async function deleteService(teamId: string, serviceId: string) {
  await del(`/service/${serviceId}`)

  await mutate(`/service/${serviceId}`, null)

  await trigger(`/team/${teamId}/services`)
}

