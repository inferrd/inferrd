import { AsyncRouter } from "express-async-router";
import { EntityManager } from "typeorm";
import { assertCurrentUserIsPartOfTeam } from "../access";
import { getRequestContext } from "../als";
import TeamController from "../controller/TeamController";
import { Team } from "../entity/Team";
import { User } from "../entity/User";
import { serializeTeam, serializeUser } from "../utils/serializer";

const teamsRouter = AsyncRouter()

teamsRouter.post(
  '/teams',
  async (req, res, next) => {
    const { user } = getRequestContext()

    const {
      name,
      emoji
    } = req.body

    const teamWithName = await Team.findOne({
      where: {
        name
      }
    })

    if(teamWithName) {
      throw new Error('This team name is already taken. Team names need to be unique.')
    }

    const team = await TeamController.createNewTeam(
      name,
      user
    )

    res.json(await serializeTeam(team))
  }
)

teamsRouter.get(
  '/team/find/:name',
  async (req, res, next) => {
    const teamName = req.params.name

    const { user } = getRequestContext()

    const teams = await user.teams

    const team = teams.find(
      team => team.name == teamName
    )

    if(!team) {
      throw new Error('Not found')
    }

    res.json(await serializeTeam(team))
  }
)

teamsRouter.get(
  '/teams',
  async (req, res, next) => {
    const { user } = getRequestContext()

    const teams = await user.teams

    res.json(
      await Promise.all(teams.map(serializeTeam))
    )
 }
)

teamsRouter.get(
  '/team/:id/members',
  async (req, res, next) => {
    const team = await Team.findOne({
      where: {
        id: req.params.id
      }
    })
    
    await assertCurrentUserIsPartOfTeam(team)

    const members = await team.users

    res.json(members.map(serializeUser))
  }
)

teamsRouter.post(
  '/team/:id/members',
  async (req, res, next) => {
    const team = await Team.findOne({
      where: {
        id: req.params.id
      }
    })
    
    await assertCurrentUserIsPartOfTeam(team)

    const {
      email
    } = req.body

    const user = await User.findOne({
      where: {
        email
      }
    })

    if(!user) {
      throw new Error('Could not find email.')
    }

    await team.addUserToTeam(user)

    res.json(serializeUser(user))
  }
)

teamsRouter.post(
  '/team/:id',
  async (req, res, next) => {
    const team = await Team.findOne({
      where: {
        id: req.params.id
      }
    })
    
    await assertCurrentUserIsPartOfTeam(team)

    const {
      name
    } = req.body

    if(name) {
      team.name = name
    }

    await team.save()

    res.json(await serializeTeam(team))
  }
)



export default teamsRouter