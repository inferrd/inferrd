import React, { useContext, useRef, useState } from 'react'
import { Link, NavLink, useHistory } from 'react-router-dom'
import { ChevronDown, MessageCircle, Plus } from 'react-feather'
import { logout } from '../api/auth'
import { TeamContext } from '../context/TeamManager'
import useOnClickOutside from '../hooks/useOnClickOutside'
import { createTeam } from '../api/team'
import { Mail } from 'react-feather'
import blackLogo from '../assets/inferrd-logo.png'
import { UserContext } from '../context/UserManager'
import TeamPicker from './TeamPicker'
import * as Tooltip from '@radix-ui/react-tooltip';
import styled from 'styled-components'

const StyledContent = styled.div`
  background-color: black;
`

const AppMenu = ({ }) => {
  const { user } = useContext(UserContext)
  const { team } = useContext(TeamContext)

  const openCrisp = () => {
    // @ts-ignore
    $crisp.push(['do', 'chat:open'])
  }

  return (
    <div className='bg-gray-900 shadow py-3'>
      <div className='container mx-auto flex items-center gap-2'>
        <Link className='font-bold block text-white' to={`/team/${team.id}/models`}><img style={{ height: 30, width: 30 }} className='rounded' src={blackLogo}/></Link>
        <div className=''>
          <TeamPicker/>
        </div>

        <NavLink activeClassName={'bg-white text-gray-800'} className='px-2 py-1  rounded hover:bg-gray-700 transition-opacity text-gray-400 text-sm' to={`/team/${team.id}/models`}>Models</NavLink>

        <div className='flex-1'></div>
  
        <NavLink activeClassName={'bg-white text-gray-800'} className='px-2 py-1 rounded hover:bg-gray-700 transition-all text-gray-400 text-sm' to={`/profile`}>Profile</NavLink>
        <NavLink activeClassName={'bg-white text-gray-800'} className='px-2 py-1 rounded hhover:bg-gray-700 transition-opacity text-gray-400 text-sm' to={`/team/${team.id}/keys`}>API Keys</NavLink>
        <NavLink activeClassName={'bg-white text-gray-800'} className='px-2 py-1 rounded hover:bg-gray-700 transition-all text-gray-400 text-sm' to={`/team/${team.id}/members`}>Team</NavLink>
      </div>
    </div>
  )
}

export default AppMenu