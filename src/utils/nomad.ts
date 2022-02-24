import { Version, VersionDeploymentStatus } from "../entity/Version";
import { deployVersion, getDeploymentId } from "../services/nomad";

export async function deployVersionToNomad(version: Version): Promise<void> {
  if (!version) {
    return
  }

  const evalId = await deployVersion(version)
  const deploymentId = await getDeploymentId(evalId)

  // update eval and deployment id
  version.nomadEvaluationId = evalId
  version.deploymentId = deploymentId
  version.deploymentStatus = VersionDeploymentStatus.RUNNING;

  await version.save()

  const service = await version.service

  service.desiredVersion = Promise.resolve(version)

  await service.save()
}