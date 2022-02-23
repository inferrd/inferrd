import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router, Route, Switch
} from "react-router-dom";
import useSWR from 'swr';
import { ApiUser } from './api.types';
import { getFetcher } from './api/api';
import Authenticated from './Authenticated';
import { TeamManager } from './context/TeamManager';
import UserManager from './context/UserManager';
import RegisterPage from './RegisterPage';

const mountEl = document.getElementById('app-container')

const App = () => {
  const { data, error, mutate } = useSWR<ApiUser | any>('/me', getFetcher, {
    refreshInterval: 10000
  })

  useEffect(() => {
    // @ts-ignore
    if(data && typeof FS != 'undefined') {
      // @ts-ignore
      FS.identify?.(data.id, {
        email: data.email
      });
    }
  }, [data])

  if(!data && !error) {
    return <p></p>
  }

  if(error || data?.error) {
    return <Router>
      <Switch>
        <Route path='/'>
          <RegisterPage/>
        </Route>
      </Switch>
    </Router>
  }
  
  return (
    <UserManager user={data}>
      <Router>
        <TeamManager>
            <Authenticated/>
        </TeamManager>
      </Router>
    </UserManager>
  )
}

ReactDOM.render(<App />, mountEl)
