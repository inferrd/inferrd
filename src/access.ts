import { getRequestContext } from "./als";
import { Team } from "./entity/Team";
import { User } from "./entity/User";

export enum Actions {
  COMMENT = 'comment',
  UPLOAD = 'upload',
  DELETE = 'delete',
  UPDATE = 'update'
}

/**
 * Returns whether this user is part
 * of the team.
 */
export async function isUserPartOfTeam(user: User, team: Team): Promise<boolean> {
  const teamMembers = await team.users

  return teamMembers.find(member => member.id == user.id) !== null
}

export async function assertCurrentUserIsPartOfTeam(team: Team): Promise<void> {
  const { user } = getRequestContext()

  const isPartOfTeam = await isUserPartOfTeam(user, team)

  if(!isPartOfTeam) {
    throw new Error('Cannot access this team')
  }
}