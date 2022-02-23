import { AsyncRouter } from "express-async-router";
import { assertCurrentUserIsPartOfTeam } from "../access";
import { Key } from "../entity/Key";
import { Team } from "../entity/Team";
import { serializeKey } from "../utils/serializer";
import { customAlphabet } from "nanoid";
import { getRequestContext } from "../als";

const keysRouter = AsyncRouter()
const nanoid = customAlphabet('1234567890abcdef', 20)

keysRouter.get(
  '/team/:id/keys',
  async (req, res, next) => {
    const teamId = req.params.id

    const team = await Team.findOne({
      where: {
        id: teamId
      }
    })
    
    await assertCurrentUserIsPartOfTeam(team)

    let keys = await Key.find({
      where: {
        teamId: team.id,
      },
      order: {
        'createdAt': 'DESC'
      }
    })

    res.json(
      await Promise.all(keys.map(serializeKey))
    )
  }
)

keysRouter.post(
  '/team/:id/keys',
  async (req, res, next) => {
    const teamId = req.params.id
    const { user } = getRequestContext()

    const team = await Team.findOne({
      where: {
        id: teamId
      }
    })
    
    await assertCurrentUserIsPartOfTeam(team)

    const {
      name,
      roles = []
    } = req.body

    if(!name) {
      throw new Error('Name is required.')
    }

    let partialKey: Partial<Key> = {
      name,
      roles,
      hash: `inf_key_${nanoid()}`
    }

    const key = await Key.create(partialKey)

    key.createdBy = Promise.resolve(user)
    key.team = Promise.resolve(team)

    await key.save()

    res.json(
      await serializeKey(key)
    )
  }
)

keysRouter.get(
  '/key/:id',
  async (req, res, next) => {
    const keyId = req.params.id

    const key = await Key.findOne({
      where: {
        id: keyId
      }
    })

    if(!key) {
      throw new Error('Not found')
    }

    const team = await key.team

    await assertCurrentUserIsPartOfTeam(team)

    res.json(
      await serializeKey(key)
    )
  }
)

keysRouter.post(
  '/key/:id',
  async (req, res, next) => {
    const keyId = req.params.id

    const key = await Key.findOne({
      where: {
        id: keyId
      }
    })

    if(!key) {
      throw new Error('Not found')
    }

    const team = await key.team

    await assertCurrentUserIsPartOfTeam(team)

    const {
      name,
      roles,
      isDeactivated
    } = req.body

    if(name !== undefined) {
      key.name = name
    }

    if(roles !== undefined) {
      key.roles = roles
    }

    if(isDeactivated !== undefined) {
      key.isDeactivated = isDeactivated ? new Date() : null
    }

    await key.save()

    res.json(
      await serializeKey(key)
    )
  }
)

export default keysRouter