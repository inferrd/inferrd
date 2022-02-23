import { AsyncRouter } from "express-async-router";
import { assertCurrentUserIsPartOfTeam } from "../access";
import { Invite } from "../entity/Invite";
import { Team } from "../entity/Team";
import { serializeInvite } from "../utils/serializer";

const noAuthRouter = AsyncRouter()

noAuthRouter.get(
  '/invite/:id',
  async (req, res, next) => {
    const invite = await Invite.findOne({
      where: {
        id: req.params.id
      }
    })

    res.json(
      serializeInvite(invite)
    )
  }
)

noAuthRouter.get(
  '/github/oauth/callback',
  async (req, res, next) => {
    
  }
)

export default noAuthRouter