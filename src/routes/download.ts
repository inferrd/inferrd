import { AsyncRouter } from "express-async-router";
import { Version } from "../entity/Version";
import { getObject } from "../utils/s3";

const downloadRouter = AsyncRouter()

downloadRouter.get(
  '/version/:id/download',
  async (req, res, next) => {
    // returns the version 
    const { id } = req.params

    const version = await Version.findOne({
      where: {
        id
      }
    })

    if(!version) {
      throw new Error('Could not find version')
    }

    const model = await getObject(version.storagePath)

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename=model.zip`)

    res.send(model.Body)
  }
)

export default downloadRouter