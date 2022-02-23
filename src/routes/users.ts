import {AsyncRouter} from "express-async-router";
import {getRequestContext} from "../als";
import * as bcrypt from 'bcryptjs'
import { serializeUser } from "../utils/serializer";
import { User } from "../entity/User";

const userRouter = AsyncRouter()

userRouter.get(
  '/me',
  async (req, res, next) => {
    const { user } = getRequestContext()

    if(!user) {
      throw new Error('Not Found')
    }

    res.json(serializeUser(user))
  }
)

userRouter.post(
  '/me',
  async (req, res, next) => {
    const { user } = getRequestContext()

    const {
      password,
      onboardingState
    } = req.body

    if(password) {
      const hash = await bcrypt.hash(password, 12)

      user.passwordHash = hash

      await user.save()
    }

    if(onboardingState) {
      user.onboardingState = {
        ...user.onboardingState,
        ...onboardingState
      }

      await user.save()
    }

    res.json(serializeUser(user))
  }
)

export default userRouter
