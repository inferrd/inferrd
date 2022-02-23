import { AsyncRouter } from "express-async-router"
import { Instance } from "../entity/Instances"
import { serializeInstance } from "../utils/serializer"

const instanceRouter = AsyncRouter()

instanceRouter.get(
  '/instances',
  async (req, res, next) => {
    const instances = await Instance.find({
      where: {
        available: true
      }
    })

    res.json(
      instances.map(serializeInstance)
    )
  }
)

export default instanceRouter