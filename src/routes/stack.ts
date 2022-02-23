import { AsyncRouter } from "express-async-router";
import { Stack } from "../entity/Stack";
import { serializeStack } from "../utils/serializer";

const stackRouter = AsyncRouter()

stackRouter.get(
  '/stacks',
  async (req, res, next) => {
    const stacks = await Stack.find({
      where: {
        available: true
      }
    })

    res.json(
      stacks.map(serializeStack)
    )
  }
)

export default stackRouter