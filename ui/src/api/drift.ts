import { mutate } from "swr";
import { ApiDriftTracker } from "../api.types";
import { post } from "./api";

export async function updateDrift(serviceId: string, driftId: string, drift: Partial<ApiDriftTracker>) {
  const result = await post<ApiDriftTracker>(`/drift/${driftId}`, drift)

  if(result.error) {
    alert(result.message)
    return null
  }

  await mutate(`/service/${serviceId}/drift`, null, true)

  return result
}