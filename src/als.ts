import {User} from "./entity/User";

const { AsyncLocalStorage } = require('async_hooks')
import { Request, Response, NextFunction } from 'express'
import { Key } from "./entity/Key";

export const ctxStateALS = new AsyncLocalStorage()

export type RequestContext = Partial<{
  user: User;
  key?: Key;
}>

/**
 * This middleware adds a reference to the req.$ (context)
 * of the request. This makes the context accessible from any
 * function down in the stack (further into the request) by a simple
 * getRequestContext() (see below). This makes the code clearer because
 * you don't need to pass a userId around down in the function calls.
 */
export async function asyncLocalStorageMiddleware(req: any, res: Response, next: NextFunction) {
  ctxStateALS.enterWith(req.$)

  next()
}

export function updateContext(context: RequestContext) {
  ctxStateALS.enterWith({
    ...ctxStateALS.getStore(),
    ...context
  })
}

/**
 * Get the current context of a request. See type at the top
 * of the file for the available resources.
 */
export function getRequestContext(): RequestContext {
  const requestContext = ctxStateALS.getStore() as RequestContext

  return requestContext || {}
}
