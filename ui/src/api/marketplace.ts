import { mutate } from "swr";
import { ApiMarketplaceItem, ApiService, ApiVersion } from "../api.types";
import { post } from "./api";

export async function updateMarketplace(serviceId: string, data: Partial<ApiMarketplaceItem>): Promise<ApiMarketplaceItem> {
  const res = await post<ApiMarketplaceItem>(
    `/service/${serviceId}/marketplace`,
    data
  )

  await mutate(`/service/${serviceId}/marketplace`, res)

  return res
}

export async function deployMarketplaceEntry(teamId: string, marketplaceEntryId: string): Promise<string> {
  const res = await post<ApiService>(
    `/team/${teamId}/marketplace/${marketplaceEntryId}`,
    {}
  )

  return res.id
}

export async function upgradeService(serviceId: string): Promise<string> {
  const res = await post<ApiVersion>(
    `/service/${serviceId}/market-upgrade`,
    {}
  )

  await mutate(`/service/${serviceId}`, null, true)

  return res.id
}