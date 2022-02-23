import { Team } from "../entity/Team";
import { User } from "../entity/User";

class TeamController {
  static async findById(id: string): Promise<Team> {
    const team = await Team.findOne({
      where: {
        id
      }
    })

    return team
  }

  static async createFirstTeam(user: User): Promise<Team> {
    return await this.createNewTeam(`First Team`, user)
  }

  static async createNewTeam(name: string, user: User): Promise<Team> {
    const teamData: Partial<Team> = {
      name
    }
    
    const team = Team.create(teamData)

    team.users = Promise.resolve([user])
    team.owner = Promise.resolve(user)

    await team.save()

    return team
  }
}

export default TeamController