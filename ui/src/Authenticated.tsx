import React, { useContext } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link, useHistory, NavLink
} from "react-router-dom"
import AppMenu from './components/AppMenu'
import Members from './pages/Members'
import Models from './pages/Models'
import NewModel from './pages/NewModel'
import Profile from './pages/Profile'
import Service from './pages/Service'
import Security from './pages/Security'
import Key from './pages/Key'

const Authenticated: React.FC = ({ }) => {
  return (
    <Router>
      <AppMenu/>

      <Switch>
        <Route path='/team/:id/models'>
          <Models/>
        </Route>
        <Route path='/team/:id/keys'>
          <Security/>
        </Route>
        <Route path='/team/:id/key/:kid'>
          <Key/>
        </Route>
        <Route path='/team/:tid/model/:mid'>
          <Service/>
        </Route>
        <Route path='/team/:tid/members'>
          <Members/>
        </Route>
        <Route path='/profile'>
          <Profile/>
        </Route>
        <Route path='/new-model'>
          <NewModel/>
        </Route>
        <Route path='/'>
          <Models/>
        </Route>
      </Switch>
    </Router>
  )
}

export default Authenticated