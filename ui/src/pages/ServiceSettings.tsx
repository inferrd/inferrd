import React, { useContext, useState } from 'react'
import useSWR from 'swr'
import { ApiInstance, ApiService, ApiStack } from '../api.types'
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
  const [selectedInstance, setSelectedInstance] = useState<string>(service.instance.id)
  const [selectedStack, setSelectedStack] = useState<string>(service.desiredStack.id)
  const [name, setName] = useState<string>(service.name)
  const [promoCode, setPromoCode] = useState<string>()

  const [confirmName, setConfirmName] = useState<boolean>(false)
  const [confirmInstance, setConfirmInstance] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const history = useHistory()
  const { team } = useContext(TeamContext)

  const { data: instances } = useSWR<ApiInstance[]>('/instances', getFetcher)
  const { data: stacks } = useSWR<ApiStack[]>('/stacks', getFetcher)

  const instanceOptions = instances ? _.sortBy(instances, 'monthlyPrice').map(instance => ({
    value: instance.id,
    label: `${instance.name} - ${instance.cpuHrtz/1000} vCPUs, ${instance.ramMb/1000} GB RAM`
  })) : []

  const stackOptions = stacks ? stacks.map(instance => ({
    value: instance.id,
    label: instance.name
  })) : []

  const onUpdateName = (newValue: string) => {
    setName(newValue)
    setConfirmName(newValue != service.name)
  }

  const onUpdateInstance = (instanceId: string) => {
    setSelectedInstance(instanceId)
    setConfirmInstance(instanceId != service.instance.id)
  }

  const tryUpdateInstance = async () => {
    setIsLoading(true)

    await updateService(service.id, {
      instanceId: selectedInstance
    })

    alert('The instance has been updated!')

    setConfirmInstance(false)
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

  const upUpdateIsPaid = async (isPaid: boolean) => {
    setIsLoading(true)

    await updateService(service.id, {
      isPaid
    })

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

  const applyPromo = async () => {
    setIsLoading(true)

    await updateService(service.id, {
      promoCodeApplied: promoCode
    })

    setIsLoading(false)
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

          <div className='mt-2'>
            <Select onChange={e => onUpdateInstance(e.value)} options={instanceOptions} value={instanceOptions.find(option => option.value == selectedInstance)} />
          </div>

          {confirmInstance && <div onClick={tryUpdateInstance} className='px-2 py-2 rounded bg-indigo-600 text-white text-center w-40 mt-4 cursor-pointer hover:opacity-90 shadow transition-opacity'>
            Update Plan
          </div>}
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
            service.instance.allowGpu && <div>
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