import { AsyncRouter } from "express-async-router";
import { assertCurrentUserIsPartOfTeam } from "../access";
import { getRequestContext } from "../als";
import { Service, ServiceDesiredStatus } from "../entity/Service";
import { Version, VersionDeploymentStatus } from "../entity/Version";
import { deployVersion, getDeploymentId, updateVersion } from "../services/nomad";
import { getSizeOfAwsFile, getUploadSignedUrlForPath } from "../utils/aws";
import _ from 'lodash'
import { serializeVersion } from "../utils/serializer";
import { ServiceStatus, ServiceStatusEnum } from "../entity/ServiceStatus";
import logger from "../logger";

const versionRouter = AsyncRouter()
const log = logger('route/versions')

versionRouter.get(
  '/service/:id/versions',
  async (req, res, next) => {
    const serviceId = req.params.id

    const service = await Service.findOne({
      where: {
        id: serviceId
      }
    })

    if(!service) {
      throw new Error('Not Found')
    }

    const team = await service.team

    await assertCurrentUserIsPartOfTeam(team)

    let versions = await service.versions

    versions = _.sortBy(versions, 'number').filter(v => !!v.bundleSize).reverse()

    if(req.query.limit) {
      versions = versions.slice(0, Number(String(req.query.limit)))
    }

    res.json(
      await Promise.all(versions.map(serializeVersion))
    )
  }
)

versionRouter.post(
  `/version/:id`,
  async (req, res, next) => {
    const versionId = req.params.id

    const version = await Version.findOne({
      where: {
        id: versionId
      }
    })

    if(!version) {
      throw new Error('Not Found')
    }

    const service = await version.service
    const team = await service.team

    await assertCurrentUserIsPartOfTeam(team)

    const {
      trafficPercentage
    } = req.body

    if(trafficPercentage) {
      version.trafficPercentage = trafficPercentage
    }

    await version.save()

    res.json(
      await serializeVersion(version)
    )
  }
)

versionRouter.get(
  '/service/:id/versions/find/:number',
  async (req, res, next) => {
    const number = req.params.number
    const serviceId = req.params.id

    const service = await Service.findOne({
      where: {
        id: serviceId
      }
    })

    if(!service) {
      throw new Error('Not Found')
    }

    const team = await service.team

    await assertCurrentUserIsPartOfTeam(team)

    const desiredVersion = await service.desiredVersion
    let versions = await service.versions

    const versionWithNumber = versions.find(
      version => number == 'latest' ? version.number == desiredVersion.number : version.number == Number(number)
    )

    if(!versionWithNumber) {
      throw new Error('Not Found')
    }

    res.json(
      await serializeVersion(versionWithNumber)
    )
  }
)

versionRouter.post(
  '/service/:id/versions',
  async (req, res, next) => {
    const serviceId = req.params.id

    const {
      testInputs
    } = req.body

    const service = await Service.findOne({
      where: {
        id: serviceId
      }
    })

    if(!service) {
      throw new Error('Not Found')
    }

    const team = await service.team

    await assertCurrentUserIsPartOfTeam(team)

    const { user } = getRequestContext()

    const existingVersions = await service.versions

    const maxVersions = user.emailVerified ? 1000 : 20

    if(existingVersions.length > maxVersions) {
      throw new Error('You have reached your maximum of ' + maxVersions + ' versions. Get in touch with us to raise the limit.')
    }

    const nextNumber = existingVersions.length + 1

    const versionData: Partial<Version> = {
      number: nextNumber
    }

    const newVersion = await Version.create(versionData)

    newVersion.stack = Promise.resolve(await service.desiredStack)
    newVersion.storagePath = `${process.env.NODE_ENV}/${serviceId}/${nextNumber}.zip`
    newVersion.service = Promise.resolve(service)
    newVersion.createdBy = Promise.resolve(user)
    // if split traffic is enabled, don't give traffic to this version
    newVersion.trafficPercentage = service.splitTrafficEnabled ? 0 : 100;
    newVersion.nomadEvaluationId = ''
    // can be empty
    newVersion.testInstances = testInputs

    await newVersion.save()

    res.json({
      ...(await serializeVersion(newVersion)),
      signedUpload: getUploadSignedUrlForPath(newVersion.storagePath)
    })
  }
)

versionRouter.get(
  '/version/:id',
  async (req, res, next) => {
    const id = req.params.id

    const version = await Version.findOne({
      where: {
        id
      }
    })

    const service = await Service.findOne({
      where: {
        id: version.serviceId
      }
    })

    const team = await service.team

    await assertCurrentUserIsPartOfTeam(team)

    res.json(await serializeVersion(version))
  }
)

versionRouter.post(
  '/version/:id/deploy',
  async (req, res, next) => {
    const id = req.params.id
    const { user } = getRequestContext()

    const version = await Version.findOne({
      where: {
        id
      }
    })

    const service = await Service.findOne({
      where: {
        id: version.serviceId
      }
    })

    const team = await service.team

    await assertCurrentUserIsPartOfTeam(team)

    service.desiredStatus = ServiceDesiredStatus.UP
    service.desiredVersion = Promise.resolve(version)

    if(service.instancesDesired == 0) {
      service.instancesDesired = 1
    }

    await service.save()

    // if it's the onboarding
    if(user.onboardingState?.serviceId == service.id
      && !user.onboardingState?.versionId) {
      // update the version
      user.onboardingState.versionId = version.id

      await user.save()
    }

    let evalId

    if(version.number == 0) {
      evalId = await deployVersion(version)
    } else {
      // don't auto deploy versions if slit traffic is enabled
      if(!service.splitTrafficEnabled) {
        evalId = await updateVersion(version)
      }
    }

    log('Eval id is ', evalId)

    // get size of bundle
    const bundleSize = await getSizeOfAwsFile(version.storagePath)

    version.bundleSize = bundleSize

    if(!service.splitTrafficEnabled) {
      version.nomadEvaluationId = evalId
      version.deploymentId = await getDeploymentId(evalId)
      version.deploymentStatus = VersionDeploymentStatus.RUNNING;
    }

    await version.save()

    res.json(
      await serializeVersion(version)
    )
  }
)

export default versionRouter