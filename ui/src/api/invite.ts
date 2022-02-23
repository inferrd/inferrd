import { mutate } from "swr";
import { ApiInvite } from "../api.types";
import { post, del } from "./api";

export async function invite(teamId: string, email: string): Promise<ApiInvite> {
  const inviteObject = await post<ApiInvite>(`/team/${teamId}/invite`, {
    email
  })

  if(inviteObject.error) {
    alert(`Error! ${inviteObject.message}`)
    return
  }

  await mutate(`/team/${teamId}/invites`, null, true)
  await mutate(`/team/${teamId}/members`, null, true)

  return inviteObject
}

export async function deleteInvite(teamId: string, inviteId: string): Promise<void> {
  await del(`/invite/${inviteId}`)

  await mutate(`/team/${teamId}/invites`, (invites: ApiInvite[]) => [
    ...invites.filter(invite => invite.id != inviteId)
  ])
}