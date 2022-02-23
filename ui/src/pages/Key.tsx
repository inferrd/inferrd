import React, { useContext } from 'react'
import { CheckCircle, XCircle } from 'react-feather'
import { useParams } from 'react-router'
import { TeamContext } from '../context/TeamManager'
import useKey from '../state/useKey'
import useServices from '../state/useServices'
import moment from 'moment'
import { updateKey } from '../api/keys'
import RequestGraph from '../components/RequestGraph'
import KeyRequestGraph from '../components/KeyRequestGraph'

const Key: React.FC = () => {
  const { team } = useContext(TeamContext)
  const params = useParams<{ kid: string }>()
  const key = useKey(params.kid)
  const services = useServices(team.id)

  if (!key) {
    return <div>loading..</div>
  }

  const hasRole = (role: string) => {
    return key.roles.includes(role)
  }

  const toggleRole = async (role: string) => {
    const isRoleOn = hasRole(role)

    let newRoles = key.roles

    if (!isRoleOn) {
      newRoles.push(role)
    } else {
      newRoles = newRoles.filter(r => r != role)
    }

    await updateKey(
      key.id,
      {
        roles: newRoles
      }
    )
  }

  const toggleActive = async () => {
    if (!confirm('Are you sure?')) {
      return
    }

    await updateKey(
      key.id,
      {
        // @ts-ignore
        isDeactivated: !key.isDeactivated
      }
    )
  }

  return (
    <div className='mx-auto container flex gap-4'>
      <div className='flex-0  mt-5' style={{ width: 300 }}>
        <div className='shadow rounded bg-white px-4 py-4'>
          <div className='font-bold'>{key.name}</div>

          <div className='mt-4 text-gray-600 tex-sm mb-1'>KEY</div>

          <div className='bg-gray-100 px-3 py-2 rounded' style={{ fontFamily: 'Inconsolata' }}>
            {key.hash}
          </div>

          <div className='mt-4 text-gray-600 tex-sm mb-1'>STATUS</div>

          {key.isDeactivated && <div className='flex items-center text-red-500 gap-1'>
            <XCircle height={15} width={15} /> Inactive
          </div>}
          {!key.isDeactivated && <div className='flex items-center text-green-500 gap-1'>
            <CheckCircle height={15} width={15} /> Active
          </div>}


          <div className='mt-4 text-gray-600 tex-sm mb-1'>CREATED BY</div>
          <div>{key.createdBy.email}</div>

          <div className='mt-4 text-gray-600 tex-sm mb-1'>CREATED</div>
          <div>{moment(key.createdAt).fromNow()}</div>

          {
            !key.isDeactivated && <div onClick={toggleActive} className='bg-red-500 cursor-pointer hover:opacity-80 transition-all text-white text-center mt-5 rounded py-2'>
              De-activate key
            </div>
          }

          {
            key.isDeactivated && <div className='text-sm text-gray-600 mt-5'>
              This key was de-activated {moment(key.isDeactivated).fromNow()}. <span onClick={toggleActive} className='text-indigo-600 transition-all cursor-pointer hover:opacity-60'>Re-activate.</span>
            </div>
          }
        </div>
      </div>
      <div className='flex-1 mt-2'>
        <KeyRequestGraph keyId={key.id} teamId={team.id} />

        <div className='shadow mt-5 rounded bg-white'>
          <div className='font-bold px-4 py-4'>Models</div>

          {
            services?.map(
              (service) => (
                <div key={service.id} style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }} className='px-4 gap-4 py-3 block flex items-center'>
                  <div>
                    {service.name}
                  </div>

                  <div className='flex-1'></div>

                  {/* <div className='flex gap-2 items-center'>
                    <input checked={hasRole(`model:${service.id}:deploy`)} onClick={() => toggleRole(`model:${service.id}:deploy`)} id={`${service.id}-depl`} type='checkbox'/>

                    <label htmlFor={`${service.id}-depl`} className='cursor-pointer'>Deploy</label>
                  </div> */}

                  <div className='flex gap-2 items-center'>
                    <input checked={hasRole(`model:${service.id}:inference`)} onClick={() => toggleRole(`model:${service.id}:inference`)} id={`${service.id}-inf`} type='checkbox' />

                    <label htmlFor={`${service.id}-inf`} className='cursor-pointer'>Inference</label>
                  </div>
                </div>
              )
            )
          }

          {
            services?.length == 0 && <div className='px-4 pb-4 text-gray-600 text-sm'>No models in this team</div>
          }
        </div>
      </div>
    </div>
  )
}

export default Key