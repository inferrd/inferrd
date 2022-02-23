import React, { useState, useContext } from 'react'
import useInstances from '../../state/useInstances'
import sortBy from 'lodash/sortBy'
import { createService } from '../../api/services'
import { TeamContext } from '../../context/TeamManager'
import useStacks from '../../state/useStacks'
import { updateUser } from '../../api/user'

type Props = {
  serviceId?: string;
}

const CreateModel: React.FC<Props> = ({ serviceId }) => {
  const instances = useInstances()
  const stacks = useStacks()
  const { team } = useContext(TeamContext)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onCreateModel = async () => {
    if(!instances || !stacks) {
      console.warn('Instances and stacks have not loaded yet.')
      return
    }

    setIsLoading(true)

    try {
      const chepeastPlan = sortBy(instances, 'monthlyPrice')[0]
      const customStack = stacks.find(stack => stack.humanReadableId.startsWith('custom'))

      const service = await createService(team.id, 'HuggingFace Sentiment Analysis', customStack.id, chepeastPlan.id)

      await updateUser({
        onboardingState: {
          serviceId: service.id
        }
      })
    } catch(e) {
      
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='shadow p-4 bg-white rounded'>
      <p className='text-gray-800'>Inferrd offers Custom Environment, which allow you to deploy any kind of model you want easily. This tutorial will guide you through using a Custom Environment to deploy a HuggingFace model.</p>
      
      {
        !serviceId && <div className='flex'>
          <div className='flex-1'></div>
          <div onClick={onCreateModel} className={`px-2 py-1 cursor-pointer hover:bg-blue-400 transition-all bg-blue-500 rounded text-white mt-2 inline-block ${isLoading && 'opacity-50'}`}>{ isLoading ? 'Working ...' : 'Get started' }</div>
        </div>
      }
    </div>
  )
}

export default CreateModel