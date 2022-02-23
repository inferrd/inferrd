import { AsyncRouter } from "express-async-router"
import { assertCurrentUserIsPartOfTeam } from "../access"
import { getRequestContext } from "../als"
import { Invite } from "../entity/Invite"
import { Team } from "../entity/Team"
import { User } from "../entity/User"
import { serializeInvite, serializeUser } from "../utils/serializer"

const inviteRouter = AsyncRouter()

inviteRouter.post(
  '/team/:id/invite',
  async (req, res, next) => {
    const {
      email
    } = req.body

    const { user } = getRequestContext()

    const team = await Team.findOne({
      where: {
        id: req.params.id
      }
    })

    await assertCurrentUserIsPartOfTeam(team)

    const users = await team.users

    const isAlreadyInTeam = users.find(user => user.email == email)

    if(isAlreadyInTeam) {
      throw new Error('This person is already in the team.')
    }

    const userAlreadyExists = await User.findOne({
      where: {
        email
      }
    })

    if(userAlreadyExists) {
      // add them to the team
      await team.addUserToTeam(userAlreadyExists)
    
      return res.json(serializeUser(userAlreadyExists))
    }

    throw new Error('User not found')
  }
)

export default inviteRouter