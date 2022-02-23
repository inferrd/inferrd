import { ApiCreditGrant, ApiInvoice } from "../api.types";
import { post } from "./api";

export async function getUserToken(userId: string): Promise<string> {
  const result = await post<{ token: string }>(`/admin/login`, {
    id: userId
  })

  return result.token
}

export async function invoiceTeam(teamId: string): Promise<ApiInvoice> {
  const result = await post<ApiInvoice>(`/admin/team/${teamId}/invoice`, {
    
  })

  return result
}

export async function createTeamGrant(teamId: string, amountInCents: number, reason: string): Promise<ApiCreditGrant> {
  const result = await post<ApiCreditGrant>(`/admin/team/${teamId}/grant`, {
    amountInCents,
    reason
  })

  return result
}