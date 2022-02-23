import { mutate } from "swr";
import { ApiDataset } from "../api.types";
import { post } from "./api";

export async function createDataset(teamId: string, dataset: Partial<ApiDataset>): Promise<ApiDataset> {
  const datasetResponse = await post<ApiDataset>(`/team/${teamId}/datasets`, dataset)

  await mutate(`/team/${teamId}/datasets`, (datasets: ApiDataset[]) => [...datasets, datasetResponse], true)

  return datasetResponse
}