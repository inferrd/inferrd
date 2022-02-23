import React, { useContext, useState } from 'react'
import { User } from 'react-feather'
import { NavLink } from 'react-router-dom'
import useSWR from 'swr'
import { ApiInvite, ApiUser } from '../api.types'
import { getFetcher } from '../api/api'
import { deleteInvite, invite } from '../api/invite'
import { addMember } from '../api/team'
import { TeamContext } from '../context/TeamManager'

const Members: React.FC = ({ }) => {
  const { team } = useContext(TeamContext)
  const [email, setEmail] = useState<string>()

  const { data: members } = useSWR<ApiUser[]>(`/team/${team.id}/members`, getFetcher, {
    refreshInterval: 10
  })

  const tryInvite = async () => {
    const isOk = await invite(team.id, email)

    if (isOk) {
      alert('Succesfully invited ' + email)
      setEmail('')
    }
  }

  return (
    <div>
      <div className='bg-white shadow'>
        <div className='container mx-auto'>
          <div className='flex items-center pt-5'>
            <div>
              <div className='text-xl font-bold'>{team?.name}</div>
              <div className='mt-2 text-sm text-gray-600'>Owner {team.owner.email}</div>
            </div>

            <div className='flex-1'></div>
          </div>

        </div>

        <div className='mt-3' style={{
          borderTop: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div className='container mx-auto flex'>
            <div className='flex-1 flex overflow-auto'>
              <NavLink activeClassName={'text-indigo-600'} to={`/team/${team.id}/members`} className='flex items-center mr-2 py-2 px-2 text-gray-600 hover:text-black text-sm transition-colors'>
                <User height={15} width={15} className='mr-1' />
                Members
              </NavLink>
            </div>
          </div>
        </div>
      </div>

    
      <div className='shadow container mt-2 mx-auto rounded bg-white'>
        <div className='font-bold px-4 py-4'>Members</div>

        {
          members?.map(
            (member, index) => (
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }} className='flex items-center px-4 py-3 block'>
                {member.email}

                <div className='flex-1'></div>

                {member.id == team.owner.id && <div className='text-gray-600'>Owner</div> }
                {member.id != team.owner.id && <div className='text-gray-600'>Member</div> }
              </div>
            )
          )
        }

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <div style={{ width: 350 }} className='px-4 py-3 flex'>
            <input
              placeholder='Email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='w-full px-2 py-1 border border-gray-200 rounded' />


            <div onClick={tryInvite} className='bg-indigo-600 rounded cursor-pointer hover:opacity-80 transition-opacity text-white px-3 ml-2 py-1'>
              Add
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Members