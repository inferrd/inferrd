import React, { useContext, useState } from 'react'
import { User } from 'react-feather'
import { NavLink } from 'react-router-dom'
import { logout } from '../api/auth'
import { updateUser } from '../api/user'
import { UserContext } from '../context/UserManager'

const Profile: React.FC = ({ }) => {
  const { user } = useContext(UserContext)

  const [newPassword, setNewPassword] = useState<string>()
  const [newPasswordConfirmed, setNewPasswordConfirmed] = useState<string>()

  const tryUpdatePassword = async () => {
    const isOk = await updateUser({
      password: newPassword
    })

    if(isOk) {
      alert('Password was updated')

      setNewPassword('')
      setNewPasswordConfirmed('')
    }
  }

  const handleLogout = () => {
    if(confirm('Are you sure?')) {
      logout()
    }
  }

  return (
    <div className=''>

      <div className='bg-white shadow'>
        <div className='container mx-auto'>
          <div className='flex items-center pt-5'>
            <div>
              <div className='text-xl font-bold'>{user?.email}</div>
            </div>

            <div className='flex-1'></div>

            <div className='w-40'>
              <div onClick={() => handleLogout()} className='bg-red-600 py-2 cursor-pointer rounded text-white text-center rounded '>Logout</div>
            </div>
          </div>
        </div>

        <div className='mt-3' style={{
          borderTop: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div className='container mx-auto flex'>
            <div className='flex-1 flex overflow-auto'>
              <NavLink activeClassName={'text-indigo-600'} to={`/profile`} className='flex items-center mr-2 py-2 px-2 text-gray-600 hover:text-black text-sm transition-colors'>
                <User height={15} width={15} className='mr-1' />
                Profile
              </NavLink>
            </div>
          </div>
        </div>
      </div>
      <div className='shadow p-4 container mt-2 mx-auto rounded bg-white'>
        <div>Email</div>

        <input disabled value={user.email} className='w-60 px-3 py-2 my-2 border border-gray-200 rounded'/>

        { !user.emailVerified && <div className='text-yellow-500 mb-2'>Email is not verified.</div> }

        <div className='mt-3'>Personal Api Key</div>

        <input disabled value={user.apiKey} className='w-60 px-3 py-2 my-2 border border-gray-200 rounded'/>
      </div>
    </div>
  )
}

export default Profile