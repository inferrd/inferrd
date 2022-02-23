import { AsyncRouter } from "express-async-router";
import { Version } from "../entity/Version";

const internalRouter = AsyncRouter()

internalRouter.get(
  '/internal/version/:id/instances',
  async (req, res, next) => {
    const version = await Version.findOne({
      where: {
        id: req.params.id
      }
    })

    res.json(version.testInstances)
  }
)

export default internalRouter