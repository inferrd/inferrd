import React, { useEffect, useState } from 'react'
import { login, register } from './api/auth'
import { ArrowLeft, CheckCircle } from 'react-feather'
import networkImage from './assets/network.png'
import googleImage from './assets/google.png'
import { Mail, ArrowRight } from 'react-feather'
import queryString from 'query-string'
import { Link, useHistory } from 'react-router-dom'

const RegisterPage: React.FC = ({ }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [email, setEmail] = useState<string>()
  const [password, setPassword] = useState<string>()
  const history = useHistory()

  const query = queryString.parse(window.location.search)

  if(query?.token) {
    window.localStorage.setItem('user_token', String(query.token))
    window.location.href = '/'

    return <div></div>
  }

  const tryLogin = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const token = await login(email, password)

      console.log('token is ', token)

      window.localStorage.setItem('user_token', token)

      window.location.href = '/'
    } catch(e) {
      setErrorMessage(e.message)
    } finally {
      setIsLoading(false)
    }
  }
  const tryRegister = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const token = await register(email, password)

      window.localStorage.setItem('user_token', token)

      window.location.href = '/'
    } catch(e) {
      setErrorMessage(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex h-screen w-screen'>
      <div className='flex-1'></div>
      <div className='flex flex-col'>
        <div className='flex-1'></div>

        <div>
          <div className="flex items-center justify-center mb-5">
            <img className="h-12 w-auto sm:h-12" src={networkImage}/>
            <div className='px-2 font-bold text-2xl'>
                Inferrd
              </div>
          </div>
          <div className='mx-auto fade-in shadow bg-white flex flex-col gap-2 rounded p-5' style={{ width: 300 }}>
              <div>Email</div>

                      <input 
                        placeholder={'Email'} 
                        autoFocus 
                        disabled={isLoading}
                        onKeyDown={e => e.key == 'Enter' && tryLogin()}
                        className='w-full px-3 py-2 border border-gray-200 rounded'
                        value={email}
                        onChange={e => setEmail(e.target.value)}/>


              <div>Password</div>

<input 
  placeholder={'Password'} 
  type='password'
  disabled={isLoading}
  onKeyDown={e => e.key == 'Enter' && tryLogin()}
  className='w-full px-3 py-2 border border-gray-200 rounded'
  value={password}
  onChange={e => setPassword(e.target.value)}/>

              { errorMessage && <div className='text-red-500 py-2'>{errorMessage}</div> }

              <div onClick={() => tryLogin()} className={`${isLoading && 'opacity-70 pointer-events-none'} bg-indigo-600 text-white text-center rounded py-2 hover:opacity-80 transition-opacity cursor-pointer`}>{ isLoading ? 'Loading..' : 'Login' }</div>
              <div onClick={() => tryRegister()} className={`${isLoading && 'opacity-70 pointer-events-none'} shadow bg-gray-50 text-center rounded py-2 hover:opacity-80 transition-opacity cursor-pointer`}>{ isLoading ? 'Loading..' : 'Register' }</div>
          </div>
        </div>
        
        <div className='text-center text-sm text-gray-700 mt-4'>©2022 Inferrd Software Inc.</div>

        <div className='flex-1'></div>
      </div>
      <div className='flex-1'></div>
    </div>
  )
}

export default RegisterPage