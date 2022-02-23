import React, { useContext, useEffect, useRef, useState } from 'react'
import Confetti from 'react-confetti'
import {
  BrowserRouter as Router, Route, Switch, useParams
} from "react-router-dom";
import { NavLink } from 'react-router-dom'
import useSWR from 'swr'
import { ApiService, ApiServiceStatus, ApiVersion } from '../api.types'
import { getFetcher } from '../api/api'
import DeployZone from '../components/DeployZone'
import TensorFlowDeployManual from '../components/TensorFlowDeployManual'
import { TeamContext } from '../context/TeamManager'
import moment from 'moment'
import CustomEnvDeployManual from '../components/CustomEnvDeployManual'
import ServiceMonitoring from './ServiceMonitoring'
import ServiceRequest from './ServiceRequests'
import ServiceSettings from './ServiceSettings';
import { Eye, BarChart2, Settings, Server, Package, AlertTriangle, Book, BookOpen, HelpCircle, Monitor, Archive, Clock, Divide, Shield, DollarSign, FastForward, Triangle } from 'react-feather'
import ServiceVersions from './ServiceVersions';
import ServiceActivity from './ServiceActivity';
import ServiceInsights from './ServiceInsights';
import usePrevious from '../hooks/usePrevious';
import Loader from '../assets/loader.svg'
import TestAPI from '../components/TestAPI';
import useOnClickOutside from '../hooks/useOnClickOutside';
import ServiceDeploy from './ServiceVersion';
import ServiceInstance from './ServiceInstances';
import Tippy from '@tippyjs/react';
import ServiceLogs from './ServiceLogs';
import { UserContext } from '../context/UserManager';
import useService from '../state/useService';
import useServiceStatus from '../state/useServiceStats';

const Service: React.FC = ({ }) => {
  const params = useParams<{ mid: string }>()
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [showTestingDropdown, setShowTestingDropdown] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>()

  useOnClickOutside(dropdownRef, () => setShowTestingDropdown(false))

  const { team } = useContext(TeamContext)
  const { user } = useContext(UserContext)

  const service = useService(params.mid)
  const status = useServiceStatus(params.mid)

  const previousService = usePrevious<ApiService>(service)

  useEffect(() => {
    if(service && previousService && !previousService.desiredVersion && service.desiredVersion) {
      setShowConfetti(true)

      setTimeout(() => setShowConfetti(false), 10000)
    }
  }, [service?.desiredVersion])

  if(!service) {
    return <div className='container mx-auto mt-5'>Loading..</div>
  }

  const timeOfShutdown = moment(service.desiredVersion?.createdAt).add(7, 'days')

  const accelerationIsSupported = service.desiredStack?.humanReadableId.startsWith('sk')
  const driftIsSupported = service.desiredStack?.humanReadableId.startsWith('sk')

  return (
    <div>
      { showConfetti && <Confetti/> }

      <div className='bg-white shadow'>
        <div className='container mx-auto'>
          <div className='flex items-center pt-5'>
            <div className='text-xl font-bold'>{ service.name }</div>

            {
              status && status.status != 'UP' && <p className='ml-3 px-2 flex items-center gap-1 py-1 bg-gray-600 rounded shadow text-white text-sm'>{ status.status == 'DEPLOYING_NEW_VERSION' && <Loader style={{
                height: 15,
                width: 15,
              }}/> } { status.status == 'BLOCKED' && <AlertTriangle style={{ height: 15, width: 15 }}/> } {status.message}</p>
            }

            <div className='flex-1'></div>

            { service.isUp && 
              <div style={{ position: 'relative' }}>
                <div className='flex items-center text-xs text-gray-600 bg-gray-100 py-1 pl-2 pr-1 rounded' style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
                  <div className='h-2 w-2 bg-green-400 rounded-full mr-2'></div>
                  <div style={{ fontFamily: 'Inconsolata' }}>{process.env.API_HOST}/infer/{service.key}/predict</div>

                  <div onClick={e => {
                    setShowTestingDropdown(true)
                    e.preventDefault()
                    e.stopPropagation()
                  }} className='text-xs bg-white rounded py-0 shadow ml-2 cursor-pointer px-1'>Test</div>
                </div> 

                {
                  showTestingDropdown && 
                    <div className='rounded shadow-lg bg-white pop-in' style={{
                      position: 'absolute',
                      top: 30,
                      border: '1px solid rgba(0,0,0,0.1)',
                      zIndex: 9,
                      right: 0
                    }}>
                      <TestAPI ref={dropdownRef} service={service}/>
                    </div>
                }
              </div>
            }
          </div>
        </div>

        <div className='mt-3' style={{
          borderTop: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div className='container mx-auto flex'>
            <div className='flex-1 flex overflow-auto'>
              <NavLink activeClassName={'text-indigo-600'} to={`/team/${team.id}/model/${params.mid}/deploys`} className='flex items-center mr-2 py-2 px-2 text-gray-600 hover:text-black text-sm transition-colors'>
                <Package height={15} width={15} className='mr-1'/>
                Versions
              </NavLink>
              <NavLink activeClassName={'text-indigo-600'} to={`/team/${team.id}/model/${params.mid}/monitoring`} className='flex items-center mr-2 py-2 px-2 text-gray-600 hover:text-black text-sm transition-colors'> 
                <Monitor height={15} width={15} className='mr-1'/>
                Monitoring
              </NavLink>
              <NavLink activeClassName={'text-indigo-600'} to={`/team/${team.id}/model/${params.mid}/logs`} className='flex items-center mr-2 py-2 px-2 text-gray-600 hover:text-black text-sm transition-colors'> 
                <Archive height={15} width={15} className='mr-1'/>
                Logs
              </NavLink>
              <NavLink activeClassName={'text-indigo-600'} to={`/team/${team.id}/model/${params.mid}/requests`} className='flex items-center mr-2 py-2 px-2 text-gray-600 hover:text-black text-sm transition-colors'>
                <BarChart2 height={15} width={15} className='mr-1'/>
                Requests
              </NavLink>
              {/* <NavLink activeClassName={'text-indigo-600'} to={`/team/${team.id}/model/${params.mid}/insights`} className='flex items-center mr-2 py-2 px-2 text-gray-600 hover:text-black text-sm transition-colors'>
                <HelpCircle height={15} width={15} className='mr-1'/>
                Insights
              </NavLink> */}
              <NavLink activeClassName={'text-indigo-600'} to={`/team/${team.id}/model/${params.mid}/events`} className='flex items-center mr-2 py-2 px-2 text-gray-600 hover:text-black text-sm transition-colors'>
                <BookOpen height={15} width={15} className='mr-1'/>
                Activity
              </NavLink>
            </div>

            <NavLink activeClassName={'text-indigo-600'} to={`/team/${team.id}/model/${params.mid}/settings`} className='flex items-center py-2 px-2 text-gray-600 hover:text-black text-sm transition-colors'>
              <Settings height={15} width={15} className='mr-1'/>
              Settings
            </NavLink>
          </div>
        </div>
      </div>

      <div className='container mx-auto'>
        <Switch>
          <Route path='/team/:tid/model/:mid/requests'>
            <ServiceRequest service={service}/>
          </Route>
          <Route path='/team/:tid/model/:mid/version/:vid'>
            <ServiceDeploy service={service}/>
          </Route>
          <Route path='/team/:tid/model/:mid/deploys'>
            <ServiceVersions service={service}/>
          </Route>
          <Route path='/team/:tid/model/:mid/instances'>
            <ServiceInstance service={service}/>
          </Route>
          <Route path='/team/:tid/model/:mid/settings'>
            <ServiceSettings service={service}/>
          </Route>
          <Route path='/team/:tid/model/:mid/events'>
            <ServiceActivity service={service}/>
          </Route>
          <Route path='/team/:tid/model/:mid/insights'>
            <ServiceInsights service={service}/>
          </Route>
          <Route path='/team/:tid/model/:mid/logs'>
            <ServiceLogs service={service}/>
          </Route>
          <Route path='/team/:tid/model/:mid/monitoring'>
            <ServiceMonitoring/>
          </Route>
          <Route path='/team/:tid/model/:mid'>
            <ServiceVersions service={service}/>
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export default Service