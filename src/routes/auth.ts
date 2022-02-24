import { AsyncRouter } from "express-async-router";
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { AuthenticationService, User } from "../entity/User";
import { JWT_SECRET } from "./../utils/crypto";
import shortid from 'shortid'
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

    const teams = await user.teams
  
    if (teams?.length == 0) {
      // doesn't have a team, let's create one
      await TeamController.createFirstTeam(user)
    }

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

    const hash = await bcrypt.hash(password, 12)

    const user = User.create({
      email,
      passwordHash: hash,
      apiKey: `personal_${nanoid()}`
    })

    await TeamController.createFirstTeam(user)

    res.json({
      token: jwt.sign({
        userId: user.id
      }, JWT_SECRET)
    })
  }
)

export default authRouter