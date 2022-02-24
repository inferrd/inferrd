import React, { useContext } from 'react'
import useSWR from 'swr'
import { ApiService, ApiVersion } from '../api.types'
import { getFetcher } from '../api/api'
import moment from 'moment'
import TensorFlowDeployManual from '../components/TensorFlowDeployManual'
import { deployVersion } from '../api/version'
import { Package, RefreshCcw } from 'react-feather'
import CustomEnvDeployManual from '../components/CustomEnvDeployManual'
import KerasDeployManual from '../components/KerasDeployManual'
import SpacyDeployManual from '../components/SpacyDeployManual'
import ScikitDeployManual from '../components/ScikitDeployManual'
import PyTorchDeployManual from '../components/PyTorchDeployManual'
import { TeamContext } from '../context/TeamManager'
import { Link } from 'react-router-dom'
import DeployManual from '../components/DeployManual'
import { formatBytes } from '../utils'
import ModelUsage from '../components/ModelUsage'

type Props = {
  service: ApiService;
}

const ServiceVersions: React.FC<Props> = ({ service }) => {
  const { team } = useContext(TeamContext)

  const { data: versions } = useSWR<ApiVersion[]>(`/service/${service.id}/versions?limit=15`, getFetcher, {
    refreshInterval: 2000
  })

  return (
    <>
      { service.isUp && <ModelUsage service={service}/> }
      <DeployManual service={service}/>

      <div className='bg-white shadow mt-3 rounded overflow-hidden'>
        <div className='font-bold px-4 py-4'>Versions</div>

        <div>
          {
            versions?.map(
              version => (
                <Link to={`/team/${team.id}/model/${service.id}/version/${version.id}`} style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }} className='px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer block'>
                  <div className='flex items-center gap-4' >
                      <div>v{version.number}</div>

                      {
                        version.runStatus == 'error' && <div className='text-sm flex items-center rounded'><div className='rounded-l bg-red-500 px-2 text-white'>Error</div> <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderLeft: 'none' }} className='px-1 rounded-r'>{ version.runStatusDescription }</div></div>
                      }
                      
                      <div className='flex-1'></div>
                      { version.bundleSize > 0 && <div className='text-sm text-gray-700 flex items-center gap-1'>
                        <Package height={15} width={15}/>
                        { formatBytes(version.bundleSize) }
                      </div> }
                      <div className='text-sm text-gray-700'>created {moment(version.createdAt).fromNow()}</div>
                            
                      {
                        service.runningVersion == version.number && service.isUp && <div><span className='text-xs bg-green-500 rounded px-2 text-white py-1 ml-3'>Running</span></div>
                      }

                      {
                        service.runningVersion != version.number && version.runStatus != 'error' && service.desiredVersion?.id == version.id && <div><span className='text-xs bg-green-500 rounded px-2 text-white py-1 ml-3'>Deploying</span></div>
                      }
                    </div>
                  </Link>
                  )
                )
            }

            {
              versions?.length == 0 && <div className='text-sm text-gray-700 px-4 pb-4'>
                Older deployments will show up here with an option to rollback.
              </div>
            }
          </div>
      </div>
    </>
  )
}

export default ServiceVersions