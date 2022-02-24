import React, { useContext, useState } from 'react'
import useSWR from 'swr'
import { ApiService, ApiStack } from '../api.types'
import { getFetcher } from '../api/api'
import Select from 'react-select'
import { deleteService, updateService } from '../api/services'
import Switch from '../components/Switch'
import * as _ from 'lodash'
import { useHistory } from 'react-router'
import { TeamContext } from '../context/TeamManager'
import { formatRequestNumber } from './ServiceMonitoring'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Triangle } from 'react-feather'
import Tippy from '@tippyjs/react';

type Props = {
  service: ApiService;
}

const ServiceSettings: React.FC<Props> = ({ service }) => {
  const [selectedStack, setSelectedStack] = useState<string>(service.desiredStack.id)
  const [name, setName] = useState<string>(service.name)
  const [promoCode, setPromoCode] = useState<string>()

  const [confirmName, setConfirmName] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [cpuValue, setCpuValue] = useState<string>((service.desiredCpuHz/1000) + '')
  const [ramValue, setRamValue] = useState<string>((service.desiredRamMb/1024) + '')
  const history = useHistory()
  const { team } = useContext(TeamContext)

  const { data: stacks } = useSWR<ApiStack[]>('/stacks', getFetcher)

  const stackOptions = stacks ? stacks.map(stack => ({
    value: stack.id,
    label: stack.name
  })) : []

  const onUpdateName = (newValue: string) => {
    setName(newValue)
    setConfirmName(newValue != service.name)
  }

  const tryUpdateResources = async () => {
    setIsLoading(true)

    await updateService(service.id, {
      desiredCpuHz: parseInt(cpuValue) * 1000,
      desiredRamMb: parseInt(ramValue) * 1024,
    })

    alert('The resources has been updated!')

    setIsLoading(false)
  }

  const tryUpdateName = async () => {
    setIsLoading(true)

    await updateService(service.id, {
      name: name
    })

    setConfirmName(false)
    setIsLoading(false)
  }

  const tryDeleteModel = async () => {
    const name = prompt(`Please enter the name of the model to delete (${service.name}):`)

    if (name == service.name) {
      setIsLoading(true)

      history.push(`/team/${team.id}/models`)

      await deleteService(team.id, service.id)
    }
  }

  const toggleGpu = async () => {
    if (!confirm('Are you sure?')) {
      return
    }

    await updateService(
      service.id,
      {
        gpuEnabled: !service.gpuEnabled
      }
    )
  }

  const toggleUnauthenticatedRequest = async () => {
    if (!confirm('Are you sure?')) {
      return
    }

    await updateService(
      service.id,
      {
        allowUnAuthenticatedRequests: !service.allowUnAuthenticatedRequests
      }
    )
  }

  return (
    <div className='flex gap-4'>

      <div className='flex-1'>
        <div className='bg-white rounded shadow px-4 py-4 mt-3'>
          <div className='font-bold'>Settings</div>

          <div>Name</div>
          <input
            placeholder={'Model Name'}
            value={name}
            disabled={isLoading}
            onChange={e => onUpdateName(e.target.value)}
            className='w-full mt-1 px-3 py-2 border border-gray-200 rounded' />

          {
            confirmName && !isLoading && <div onClick={() => tryUpdateName()} className='bg-indigo-600 mt-2 text-white text-center rounded py-2 hover:opacity-80 transition-opacity cursor-pointer'>Update name</div>
          }

          <div className='mt-4'>
            <div className='text-red-600'>Danger Zone</div>

            <div onClick={() => tryDeleteModel()} className='bg-red-600 mt-2 text-white text-center rounded py-2 hover:opacity-80 transition-opacity cursor-pointer'>Stop and delete model</div>
          </div>
        </div>
      </div>
      <div className='flex-1'>
        <div className='bg-white rounded shadow px-4 py-4 mt-3'>
          <div className='font-bold'>Resources</div>

          <div className='flex-col gap-2'>
          <div className='flex gap-2 items-center'>
              <div>RAM</div>
              <div>
                <input
                  value={ramValue}
                  type='number'
                  onChange={e => setRamValue(e.target.value)}
                  className='text-right w-full px-3 py-2 border-2 rounded focus:border-indigo-600 outline-none transition-colors'/>
              </div>
              <div>GBs</div>
            </div>
            <div className='mt-2 flex gap-2 items-center'>
              <div>CPU</div>
              <div>
                <input
                  value={cpuValue}
                  type='number'
                  onChange={e => setCpuValue(e.target.value)}
                  className='text-right w-full px-3 py-2 border-2 rounded focus:border-indigo-600 outline-none transition-colors'/>
              </div>
              <div>CPUs</div>
            </div>
          </div>

          <div onClick={tryUpdateResources} className='px-2 py-2 rounded bg-indigo-600 text-white text-center w-40 mt-4 cursor-pointer hover:opacity-90 shadow transition-opacity'>
            Update Resources
          </div>
        </div>
      </div>
      <div className='flex-1'>
        <div className='bg-white rounded shadow px-4 py-4 mt-3'>
          <div className='font-bold'>Stack</div>

          <Tippy content={'The environment cannot be changed'}>
            <div className='mt-2'>
                <Select isDisabled={true} options={stackOptions} value={stackOptions.find(option => option.value == selectedStack)} />
            </div>
          </Tippy>

          <div className='font-bold mt-4'>GPU Acceleration</div>
          {
            service.desiredStack.supportGpu && <div>
              {
                !service.desiredStack.supportGpu && <div className='pt-2 text-sm text-gray-700'>{service.desiredStack.name} does not support GPU.</div>
              }

              <div className={`${!service.desiredStack.supportGpu && 'opacity-50'}`}>
                <div className={`flex align-items gap-2 mt-4`}>
                  <Switch on={service.gpuEnabled && service.desiredStack.supportGpu} onChange={toggleGpu} /> GPU Access
                </div>
                <p className='text-sm mt-1 text-gray-700 mt-2'>If for some reason you want to disable GPU access, you can.</p>
              </div>
            </div>
          }
        </div>
      </div>
      <div className='flex-1'>
        <div className='bg-white rounded shadow px-4 py-4 mt-3'>
          <div className='font-bold'>Security</div>

          <div className='font-bold mt-4'>Require authentication</div>
          <div>
            <div className='flex align-items gap-2 mt-4'>
              <Switch on={!service.allowUnAuthenticatedRequests} onChange={toggleUnauthenticatedRequest} /> Require authentication
            </div>
            <p className='text-sm mt-1 text-gray-700 mt-2'>By default Inferrd protects your model by rejecting any unauthenticated inference.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceSettings