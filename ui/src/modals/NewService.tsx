import React, { useContext, useEffect, useState } from 'react'
import Modal from '../components/Modal'
import Select from 'react-select'
import useSWR from 'swr'
import _ from 'lodash'
import { getFetcher } from '../api/api'
import { ApiInstance, ApiStack } from '../api.types'
import { createService } from '../api/services'
import { TeamContext } from '../context/TeamManager'
import { useHistory } from 'react-router'
import { ChevronDown } from 'react-feather'

type Props = {
  onClose: () => void;
}

const NewService: React.FC<Props> = ({ onClose }) => {
  const [selectedStackId, setSelectedStackId] = useState<string>()
  const [selectedInstanceType, setSelectedInstanceType] = useState<string>()
  const [name, setName] = useState<string>()
  const [isLoading, setIsLoading] = useState<boolean>()
  const [showMore, setShowMore] = useState<boolean>(false)
  const history = useHistory()

  const { team } = useContext(TeamContext)

  const { data: stacks } = useSWR<ApiStack[]>('/stacks', getFetcher)
  const { data: instances } = useSWR<ApiInstance[]>('/instances', getFetcher)

  const stackOptions = stacks ? stacks.map(stack => ({
    label: stack.name,
    value: stack.id
  })) : []

  useEffect(() => {
    setSelectedStackId(stacks?.find(stack => stack.humanReadableId.startsWith('tensorflow'))?.id)
  }, [stacks])

  useEffect(() => {
    if(instances) {
      let cheapest = _.sortBy(instances, 'monthlyPrice')

      setSelectedInstanceType(cheapest[0].id)
    }
  }, [instances])

  const instanceOptions = instances ? instances.map(instance => ({
    value: instance.id,
    label: instance.name + ` - ${instance.cpuHrtz/1000} vCPU, ${instance.ramMb/1000}GB RAM`
  })) : []

  const handleCreate = async () => {
    if(isLoading) return

    if(!selectedStackId) {
      return alert('Select a stack first.')
    }

    if(!name) {
      return alert('Pick a name.')
    }

    setIsLoading(true)
    const service = await createService(
      team.id,
      name, 
      selectedStackId, 
      selectedInstanceType
    )
    setIsLoading(false)

    if(service) {
      onClose()

      history.push(`/team/${team.id}/model/${service.id}/overview`)
    }
  }
 
  return (
    <Modal onClickCurtain={onClose}>
      <div className='px-5 py-5' style={{ width: 300 }}>
        <div className='font-bold mb-3 text-xl'>New Model</div>

        <div className='mt-5 my-1'>Name</div>
        <input
          autoFocus
          disabled={isLoading}
          placeholder={'Model Name'}
          value={name}
          onChange={e => setName(e.target.value)}
          className='w-full px-3 py-2 mb-3 border border-gray-200 rounded'/>

        <div onClick={() => setShowMore(!showMore)} className='bg-blue-100 mb-2 text-sm px-1 py-2 rounded cursor-pointer flex text-blue-600 items-center'><ChevronDown height={18} style={{
          transform: showMore ? 'rotate(0deg)' : 'rotate(-90deg)',
          transition: 'all 140ms ease-in'
        }}/> Show more options</div>

        {
          showMore && 
            <>
              <div className=''>Stack</div>
              <div className='text-sm my mb-2 text-gray-500'>A stack is the environment in which your model will run. We support TensorFlow out of the box, use a Custom Environment for everything else.</div>
              <Select 
                placeholder={stacks ? 'Pick a Stack' : 'Loading..'}
                options={stackOptions} 
                isDisabled={isLoading}
                value={stackOptions.find(stack => stack.value == selectedStackId)}
                onChange={option => setSelectedStackId(option.value)}
                className='mb-5'/>

              <div className='mt-2'>Instance</div>
              <div className='text-sm my mb-2 text-gray-500'>Choose the instance on which the model will run. A more powerful model needs a dedicated CPU.</div>
              <Select 
                placeholder={instances ? 'Pick a Instance' : 'Loading..'}
                options={instanceOptions} 
                isDisabled={isLoading}
                value={instanceOptions.find(stack => stack.value == selectedInstanceType)}
                onChange={option => setSelectedInstanceType(option.value)}
                className='mb-5'/>  
            </>
        }

        <div onClick={handleCreate} className='bg-indigo-600 text-white text-center rounded py-2 hover:opacity-80 transition-opacity cursor-pointer'>Create</div>
      </div>
    </Modal>
  )
}

export default NewService