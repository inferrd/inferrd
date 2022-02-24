import { ApiVersion } from "../api.types";
import { post, getHeaders, apiEndpoint } from "./api";
import superagent from 'superagent'


export async function createVersion(serviceId: string, version: Blob, onUploadProgress: (p: number) => void): Promise<ApiVersion | null> {
  const auth = getHeaders()['Authorization']

  const uploadRequest = superagent.post(`${apiEndpoint}/service/${serviceId}/versions`)
  uploadRequest.set('Authorization', auth)
  uploadRequest.attach('model', version, {
    contentType: 'application/zip',
  })
  uploadRequest.on('progress', onUploadProgress)

  const res = await uploadRequest

  return res.body as ApiVersion
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