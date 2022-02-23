import { mutate } from "swr";
import { ApiTeam, ApiUser } from "../api.types";
import { post } from "./api";

export async function addMember(teamId: string, email: string): Promise<ApiUser> {
  const member: ApiUser = await post(`/team/${teamId}/members`, {
    email
  })

  await mutate(`/team/${teamId}/members`, (members: ApiUser[]) => [
    ...(members || []), 
    member
  ])

  return member
}

export async function createTeam(name: string): Promise<ApiTeam> {
  const team = await post<ApiTeam>('/teams', {
    name,
    emoji: '📼'
  })

  if(team.error) {
    throw new Error(team.message)
  }

  await mutate('/teams', (teams: ApiTeam[]) => [
    ...teams,
    team
  ]) 

  return team
}

export async function updateTeam(teamId: string, teamData: Partial<ApiTeam>): Promise<ApiTeam> {
  const updatedTeam = await post<ApiTeam>(`/team/${teamId}`, teamData)

  await mutate(`/teams`, (teams: ApiTeam[]) => [
    ...teams.map(
      team => {
        if(team.id == teamId) {
          return updatedTeam
        }

        return team
      }
    )
  ])

  return updatedTeam
}