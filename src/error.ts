import {NextFunction, Request, Response} from "express";
import logger from "./logger";

const log = logger('middleware/error')

export function errorHandler(apiResult: any, req: Request, res: Response, next: NextFunction) {
  if(apiResult instanceof Error) {
    log(apiResult)

    const error = apiResult as Error

    res.status(500)

    return res.json({
      error: true,
      name: error.name,
      message: error.message
    })
  }

  res.json(apiResult)
}
