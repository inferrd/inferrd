import { AsyncRouter } from "express-async-router";
import { assertCurrentUserIsPartOfTeam } from "../access";
import { Team } from "../entity/Team";

const noAuthRouter = AsyncRouter()

noAuthRouter.get(
  '/github/oauth/callback',
  async (req, res, next) => {
    
  }
)

export default noAuthRouter