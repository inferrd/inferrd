import {NextFunction, Request, Response} from "express";
import * as jwt from 'jsonwebtoken'
import {JWT_SECRET} from "./utils/crypto";
import {getRequestContext, updateContext} from "./als";
import {User} from "./entity/User";
import logger from "./logger";
import { Key } from "./entity/Key";

const log = logger('authentication')

export async function authenticateClient(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization')
  let authToken = req.query.token as string

  if(authHeader) {
    const [authType, tokenValue] = authHeader.split(' ')

    if(authType == 'Token') {
      const user = await User.findOne({
        where: {
          apiKey: tokenValue
        }
      })

      const key = await Key.findOne({
        where: {
          hash: tokenValue
        }
      })
    
    
      if(user) {
        updateContext({
          user
        })

        // @ts-ignore
        req.headers.user = user;
      
        return next()
      } else if(key) {
        updateContext({
          key
        })

        return next()
      } else {
        // token is unknown
        return next(new Error('Could not find this token.'))
      }
    } else {
      authToken = tokenValue

      try {
        if(!jwt.verify(authToken, JWT_SECRET)) {
          // skip
          return next()
        }

        const userData: any = jwt.decode(authToken)
      
        const user = await User.findOne({
          where: {
            id: userData.userId
          }
        })
      
        updateContext({
          user
        })

        // @ts-ignore
        req.headers.user = user;

        return next()
      } catch(e) {
        // skip
        return next()
      }
    }
  } else if(authToken) {
    try {
      if(!jwt.verify(authToken, JWT_SECRET)) {
        // skip
        return next()
      }

      const userData: any = jwt.decode(authToken)
    
      const user = await User.findOne({
        where: {
          id: userData.userId
        }
      })
    
      updateContext({
        user
      })
      
      // @ts-ignore
      req.headers.user = user;

      return next()
    } catch(e) {
      // skip
      return next()
    }
  } else {
    next()
  }
}

export function enforceAuth(req: Request, res: Response, next: NextFunction) {
  const { user } = getRequestContext()

  if(!user) {
    throw new Error('UnAuthenticated')
  }

  next()
}