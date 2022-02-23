import { mutate, trigger } from "swr";
import { ApiTeam } from "../api.types";
import { post } from "./api";

export async function addPaymentMethod(teamId: string, methodId: string): Promise<void> {
  const teamUpdates = await post(`/team/${teamId}/payment_methods`, {
    methodId
  })
  
  await trigger('/teams')

  await mutate(`/teams`, (teams: ApiTeam[]) => [
    ...teams.map(
      team => {
        if(team.id == teamId) {
          return {
            ...team,
            ...teamUpdates
          }
        }

        return team
      }
    )
  ])

  await mutate(`/team/${teamId}/payment_methods`, null, true)
}