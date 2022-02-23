import React, { useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import useSWR from 'swr'
import { ApiTeam } from '../api.types'
import { getFetcher } from '../api/api'
import { logout } from '../api/auth'
import { createTeam } from '../api/team'
import useLocalStorage from '../hooks/useLocalStorage'
import { UserContext } from './UserManager'

export type TeamContextProps = {
  team: ApiTeam;
  teams: ApiTeam[];
  changeTeam: (teamId: string) => void;
}

const OptionColumn = styled.div`
  width: 300px;
  padding: 40px 30px;
`

const OptionHeader = styled.div`
  font-weight: bold;
  font-size: 14px;
`

export const TeamContext = React.createContext<TeamContextProps>(null)

export const TeamManager: React.FC = (props) => {
  const { data: teams } = useSWR<ApiTeam[]>('/teams', getFetcher)
  const { user } = useContext(UserContext)
  const [teamName, setTeamName] = useState<string>('')
  const history = useHistory()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [teamId, setTeamId] = useLocalStorage('inferrd_team_id')

  useEffect(() => {
    if(teamId && window.location.href == '/') {
      history.push(`/team/${teamId}/models`)
    }
  }, [teamId])
 
  if(!teams) {
    return <div></div>
  }

  const handleCreateTeam = async () => {
    if(teamName == '' || !teamName) {
      return
    }

    setErrorMessage(null)
    setIsLoading(true)

    try {
      const team = await createTeam(teamName)

      if(team) {
        history.push(`/team/${team.id}/models`)
      }
    } catch(e) {
      setErrorMessage(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  if(teams.length == 0) {
    return (
      <div className='flex h-screen w-screen'>
        <div className='flex-1'></div>
        <div className='flex flex-col'>
          <div className='flex-1'></div>
  
          <div>
            <div className='mb-3 font-bold text-xl text-center'>Name your Team</div>
            <div className='shadow rounded px-4 py-4 bg-white' style={{ width: 300 }}>
              <p className='text-sm text-gray-600 mb-2'>We recommend using the website of your company.</p>
              <input 
                placeholder={'myawesomecompany.com'} 
                autoFocus 
                disabled={isLoading}
                className='w-full px-3 py-2 my-2 border border-gray-200 rounded'
                value={teamName}
                onChange={e => setTeamName(e.target.value)}/>

              { errorMessage && <p className='text-center px-4 py-4 text-red-600 pop-in'>{errorMessage}</p> }

              <div onClick={handleCreateTeam} className={`bg-indigo-600 text-white text-center rounded py-2 hover:opacity-80 transition-opacity cursor-pointer ${isLoading && 'opacity-80 pointer-events-none'}`}>{ isLoading ? 'Loading..' : 'Create Team' }</div>
            </div>
          </div>

          <div className='flex-1'></div>
        </div>
        <div className='flex-1'></div>
      </div>
    )
  }

  const changeTeam = (teamId: string) => {
    setTeamId(teamId)
  }

  const selectedTeam = teamId ? teams.find(team => team.id == teamId) || teams[0] : teams[0]

  return <TeamContext.Provider value={{
    team: selectedTeam,
    teams,
    changeTeam
  }}>
    { props.children }
  </TeamContext.Provider>
} 