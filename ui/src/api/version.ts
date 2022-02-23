import { ApiVersion } from "../api.types";
import { post } from "./api";

export type ApiVersionWithUpload = ApiVersion & { signedUpload: string }

export async function createVersion(serviceId: string): Promise<ApiVersionWithUpload | null> {
  const result = await post<ApiVersionWithUpload>(`/service/${serviceId}/versions`, {

  })

  if(result.error) {
    alert(result.message)
    return null
  }

  return result
}

export async function deployVersion(versionId: string): Promise<ApiVersion> {
  const result = await post<ApiVersion>(`/version/${versionId}/deploy`, {

  })

  if(result.error) {
    alert(result.message)
    return null
  }

  return result
}

export async function updateVersion(versionId: string, version: Partial<ApiVersion>) {
  const result = await post<ApiVersion>(`/version/${versionId}`, version)

  return result
}