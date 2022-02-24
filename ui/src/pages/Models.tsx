import React, { useContext, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import useSWR from 'swr'
import { ApiService, ApiStack, ServiceType } from '../api.types'
import { getFetcher } from '../api/api'
import { TeamContext } from '../context/TeamManager'
import { Plus } from 'react-feather'
import moment from 'moment'
import { UserContext } from '../context/UserManager'
import { AlertTriangle, Check, Square } from 'react-feather'
import { createService } from '../api/services'
import { getImageForFramework } from '../constants'

const Models: React.FC = ({ }) => {
  const { team } = useContext(TeamContext)
  const { user } = useContext(UserContext)
  const history = useHistory()

  const { data: services } = useSWR<ApiService[]>(`/team/${team.id}/services`, getFetcher, {
    refreshInterval: 5000
  })

  const models = services?.filter(
    service => service.type == ServiceType.ML
  )

  return (
    <div className='container flex mx-auto gap-4'>

    { !user.achievements?.FIRST_INFERENCE && user.achievements.CREATE_MODEL && models?.length > 1 && <div className='mt-5' style={{ width: 250 }}><div className=' rounded shadow px-5 py-4 bg-white'>
          <div className='font-bold'>Get Started</div>

          <div className='text-gray-600 py-1 text-sm'>Here are a few steps to get you started.</div>

          <div className='flex flex-col gap-1 mt-3'>
            <div className={`flex items-center`}>
              <div className='font-bold'>{user.achievements.CREATE_MODEL ? <Check height={18} width={18} className='text-green-600 mr-1'/> : <Square height={18} width={18} className='text-gray-600 mr-1'/> }</div>
              <div className='text-sm'>Create a model</div>
            </div>
            <div className='flex-1 bg-gray-300' style={{ height: 1 }}></div>
            <div className={`flex items-center`}>
              <div className='font-bold'>{user.achievements.SUCCESSFULL_DEPLOY ? <Check height={18} width={18} className='text-green-600 mr-1'/> : <Square height={18} width={18} className='text-gray-600 mr-1'/> }</div>
              <div className='text-sm'>Deploy a version</div>
            </div>
            <div className='flex-1 bg-gray-300' style={{ height: 1 }}></div>
            <div  className={`flex items-center`}>
              <div className='font-bold'>{user.achievements.FIRST_INFERENCE ? <Check height={18} width={18} className='text-green-600 mr-1'/> : <Square height={18} width={18} className='text-gray-600 mr-1'/> }</div>
              <div className='text-sm'>First inference</div>
            </div>
          </div>
        </div></div> }

      <div className='flex-1'>
        { models &&  
          <>

            <div className='flex mt-5 items-center'>
              <div className='text-xl font-bold'>Models</div>

              <div className='flex-1'></div>

              <div className='ml-3 hover:opacity-80 transition-opacity text-sm text-white bg-indigo-600 rounded shadow cursor-pointer pr-2 pl-1 py-1 flex items-center' onClick={() => history.push('/new-model')}>
                <Plus height={14}/>
                <div>New Model</div>
              </div>
            </div>

            <div className='mt-4 shadow rounded bg-white overflow-hidden'>
              { 
                models.map((model, index) => {
                  const img = getImageForFramework(model.desiredStack.humanReadableId)

                  return (<Link style={{
                    borderBottom: index != models.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none'
                  }} to={`/team/${team.id}/model/${model.id}/overview`} className='block flex items-center hover:bg-gray-50 focus:opacity-70 transition-colors px-3 py-3'>
                    <div className='flex items-center gap-2'>
                      <div>
                        <div style={{ height: 10, width: 10 }} className={`text-sm rounded-full bg-${model.isUp ? 'green' : (model.desiredStatus == 'up' ? 'red' : 'gray')}-300`}></div>
                      </div>

                      <div>
                        <img src={img} style={{ maxHeight: 15, maxWidth: 15 }}/>
                      </div>
                      <div className='text-sm'>{ model.name } { model.marketplaceItem ? <span className='text-gray-600'>· From Library</span> : `` } { model.marketplaceItem && model.marketplaceItem?.versionNumber != model.desiredVersion?.number ? <span className='text-gray-600'>· <span className='text-green-500'>Ugrade available (v{model.marketplaceItem.versionNumber})</span></span> : `` }</div>
                    </div>

                    <div className='flex-1'></div>

                      {
                        model.desiredVersion ? <div className='text-gray-700 ml-2 text-sm'>updated { moment(model.desiredVersion.createdAt).fromNow() }</div> : <div className='text-gray-700 ml-2 text-sm'>No version</div>
                      }
                  </Link>
                  )
                })
              }

              {
                models?.length == 0 && <div className='text-center my-10 text-gray-700'>
                  No models yet. <Link className='text-blue-500 cursor-pointer' to='/new-model'>Create one</Link> or <Link className='text-blue-500 cursor-pointer' to='/marketplace'>import one</Link> from the library.
                </div>
              }
            </div>
          </>}
        </div>
    </div>
  )
}

export default Models