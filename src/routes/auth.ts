import { AsyncRouter } from "express-async-router";
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { AuthenticationService, User } from "../entity/User";
import { JWT_SECRET } from "./../utils/crypto";
import shortid from 'shortid'
import { Invite } from "../entity/Invite";
import { customAlphabet } from "nanoid";
import logger from "../logger";
import TeamController from "../controller/TeamController";

const authRouter = AsyncRouter()
const nanoid = customAlphabet('1234567890abcdef', 20)
const log = logger('routes/auth')

authRouter.post(
  '/auth/login',
  async (req, res, next) => {
    const {
      email,
      password,
    } = req.body

    const user = await User.findOne({
      where: {
        email
      }
    })

    if(!user) {
      throw new Error('Email not found')
    }

    if(!user.passwordHash) {
      throw new Error('User has not set a password')
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)

    if(!isValid) {
      throw new Error('Invalid password')
    }

    const token = jwt.sign({
      id: user.id,
    }, JWT_SECRET)

    res.json({
      token: jwt.sign({
        userId: user.id
      }, JWT_SECRET)
    })
  }
)

authRouter.post(
  '/auth/register',
  async (req, res, next) => {
    const {
      email,
      password,
    } = req.body

    if(!email) {
      throw new Error('Missing email')
    }

    if(!password) {
      throw new Error('Missing password')
    }

    const userWithEmail = await User.findOne({
      where: { email }
    })

    if(userWithEmail) {
      throw new Error('This email is taken.')
    }

    let invite = null

    if(req.body.inviteId) {
      const inviteId = req.body.inviteId

      invite = await Invite.findOne({
        where: {
          id: inviteId,
          redeemed: false
        }
      })

      if(!invite) {
        throw new Error('Could not find this invite. Maybe it expired?')
      }
    }

    const hash = await bcrypt.hash(password, 12)

    const user = User.create({
      email,
      passwordHash: hash,
      apiKey: `personal_${nanoid()}`
    })

    if(invite) {
      const team = await invite.team

      user.teams = Promise.resolve([team])

      invite.redeemed = true

      await invite.save()

      user.achievements = {
        ...user.achievements,
        INITIAL_CREDIT: true
      }

      await invite.remove()
    }

    await user.save()

    if(!invite) {
      // the user didn't join a team, so let's create one
      await TeamController.createFirstTeam(user)
    }

    res.json({
      token: jwt.sign({
        userId: user.id
      }, JWT_SECRET)
    })
  }
)

export default authRouter