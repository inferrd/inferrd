import React, { useContext } from 'react'
import { ArrowRight, CheckCircle, Key, XCircle } from 'react-feather'
import { Link, NavLink, useHistory } from 'react-router-dom'
import { createKey } from '../api/keys'
import { TeamContext } from '../context/TeamManager'
import useKeys from '../state/useKeys'
import moment from 'moment'

const Security: React.FC = ({ }) => {
  const { team } = useContext(TeamContext)
  const keys = useKeys(team.id)
  const history = useHistory()

  const onCreateKey = async () => {
    const name = prompt('New key name:')

    if(!name) {
      return
    }

    const key = await createKey(
      team.id,
      {
        name
      }
    )

    history.push(`/team/${team.id}/key/${key.id}`)
  }

  return (
    <div>
      <div className='bg-white shadow'>
        <div className='container mx-auto'>
          <div className='flex items-center pt-5'>
            <div>
              <div className='text-xl font-bold'>API Keys</div>
              <div className='mt-2 text-sm text-gray-600'>API Keys are a great way to restrict inference to certain models. For example, if you are calling Inferrd from a customer's device or browser, you would want to have a key that can only call the models needed. API Keys can be used as a replacement for your personal key.</div>
            </div>

            <div className='flex-1'></div>
          </div>

        </div>

        <div className='mt-3' style={{
          borderTop: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div className='container mx-auto flex'>
            <div className='flex-1 flex overflow-auto'>
              <NavLink activeClassName={'text-indigo-600'} to={`/team/${team.id}/keys`} className='flex items-center mr-2 py-2 px-2 text-gray-600 hover:text-black text-sm transition-colors'>
                <Key height={15} width={15} className='mr-1' />
                Keys
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    
      <div className='shadow container mt-2 mx-auto rounded bg-white'>
        <div className='flex items-center px-4 py-4'>
          <div className='font-bold'>API Keys</div>

          <div className='flex-1'></div>

          <div onClick={onCreateKey} className='ml-3 gap-1 hover:opacity-80 transition-opacity text-sm text-white bg-indigo-600 rounded shadow cursor-pointer pr-2 pl-2 py-1 flex items-center'>
            <Key height={15} width={15}/> New Key
          </div>
        </div>

        {
          keys?.map(
            key => (
              <Link to={`/team/${team.id}/key/${key.id}`} style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }} className='px-4 gap-4 flex items-center py-3 block hover:bg-gray-50 focus:opacity-70 transition-colors cursor-pointer'>
                <div>{ key.name } <div className='text-sm text-gray-600'>created { moment(key.createdAt).fromNow() } by { key.createdBy.email }</div></div>
                

                <div className='flex-1'></div>

                { !key.isDeactivated && <div className='flex items-center text-sm text-green-600'>
                  Active <CheckCircle height={15}/>
                </div> }

                { key.isDeactivated && <div className='flex items-center text-sm text-gray-600'>
                  Inactive <XCircle height={15}/>
                </div> }

                <div className='text-sm text-gray-600'>
                  { key.roles.length } authorization{ key.roles.length > 1 ? 's' : '' }
                </div>

                <div className='flex items-center text-sm text-gray-600'>
                  Manage <ArrowRight height={15}/>
                </div>
              </Link>
            )
          )
        }

        { keys?.length == 0 && <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <div className='px-4 py-3 text-sm text-gray-600'>No keys</div>
        </div> }
      </div>
    </div>
  )
}

export default Security