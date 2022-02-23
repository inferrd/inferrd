import React, { useContext, useRef, useState } from 'react'
import { ChevronDown, Plus } from 'react-feather'
import { NavLink, useHistory } from 'react-router-dom'
import { createTeam } from '../api/team'
import { TeamContext } from '../context/TeamManager'
import useOnClickOutside from '../hooks/useOnClickOutside'

const TeamPicker = () => {
  const { team, teams, changeTeam } = useContext(TeamContext)
  const [showTeamDropdown, setShowTeamDropdown] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>()
  const history = useHistory()

  useOnClickOutside(dropdownRef, () => setShowTeamDropdown(false))

  const onClickCreate = async () => {
    const name = prompt('Name of the new team:')

    if(name) {
      const team = await createTeam(name)

      if(team) {
        changeTeam(team.id)
        history.push(`/team/${team.id}/models`)
        setShowTeamDropdown(false)
      }
    }
  }

  return (
    <div ref={dropdownRef} className='relative'>
      <div onClick={() => setShowTeamDropdown(!showTeamDropdown)} className='bg-gray-600 text-gray-300 cursor-pointer hover:opacity-80 transition-opacity pl-2 pr-1 items-center py-1 text-sm rounded shadow w-40 truncate flex'>
        <div>{ team.name }</div>

        <div className='flex-1'></div>

        <ChevronDown height={18}/>
      </div>

      {
        showTeamDropdown && <div className='absolute pop-in bg-gray-600 w-40 rounded shadow py-1' style={{ top: 30, zIndex: 99 }}>
          {
            teams.map(
              teamOption => (
                <NavLink activeClassName='bg-gray-500' onClick={() => {
                  setShowTeamDropdown(false)
                  changeTeam(teamOption.id)
                }} to={`/team/${teamOption.id}/models`} className='block px-2 text-gray-300 text-sm hover:bg-gray-500 transition-colors py-1 cursor-pointer'>{ teamOption.name }</NavLink>
              )
            )
          }

          <div onClick={() => onClickCreate()} className='items-center flex block px-2 text-sm text-gray-300 hover:bg-gray-500 transition-colors py-1 cursor-pointer'>
            <Plus height={13} width={13} className='mr-1'/>
            Add team
          </div>
        </div>
      }          
    </div>
  )
}

export default TeamPicker