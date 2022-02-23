import { post } from "./api"

export type VersionSplit = {
  id: string;
  trafficPercentage: number;
}

export async function updateSplit(serviceId: string, versions: VersionSplit[]) {
  const result = await post(`/split/${serviceId}/versions`, { versions })

  return result
}