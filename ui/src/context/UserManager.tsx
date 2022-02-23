import React from 'react'
import { ApiUser } from '../api.types'

export type UserContextProps = {
  user: ApiUser;
}

export const UserContext = React.createContext<UserContextProps>(null)

export type UserManagerProps = {
  user: ApiUser;
}

const UserManager: React.FC<UserManagerProps> = (props) => {
  return (
    <UserContext.Provider value={{
      user: props.user
    }}>
      { props.children }
    </UserContext.Provider>
  )
}

export default UserManager