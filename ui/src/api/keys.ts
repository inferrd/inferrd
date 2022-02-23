import { mutate } from "swr";
import { ApiKey } from "../api.types";
import { post } from "./api";

export async function createKey(teamId: string, keyData: Partial<ApiKey>): Promise<ApiKey> {
  const key: ApiKey = await post<ApiKey>(`/team/${teamId}/keys`, keyData)

  await mutate(`/team/${teamId}/keys`, (keys: ApiKey[]) => [
    ...keys,
    key
  ]) 

  return key
}

export async function updateKey(keyId: string, keyData: Partial<ApiKey>): Promise<ApiKey> {
  const key: ApiKey = await post<ApiKey>(`/key/${keyId}`, keyData)

  await mutate(`/key/${keyId}`, key, true) 

  return key
}