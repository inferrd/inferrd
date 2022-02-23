import React from 'react'
import useSWR from 'swr'
import { ApiPlan } from '../../api.types'
import { getFetcher } from '../../api/api'
import _ from 'lodash'

type Props = {
  onPick: (plan: ApiPlan) => void;
  currentPlan?: string;
}

const PlanPicker: React.FC<Props> = ({ onPick, currentPlan }) => {
  const { data: plans } = useSWR<ApiPlan[]>('/plans', getFetcher)

  if(!plans) {
    return <div className='flex gap-4'>
      <div className='shadow rounded bg-white'></div>
      <div className='shadow rounded bg-white'></div>
      <div className='shadow rounded bg-white'></div>
    </div>
  }

  const sorted = _.sortBy(plans, 'price')

  return (
    <div className='flex gap-4'>
      <div className='flex-1'></div>
      {
        sorted.map(
          (plan, index) => (
            <div className={`bg-white ${index == 1 && 'border-2 border-indigo-600'} flex flex-col rounded-lg mb-4 md:mb-0 shadow-lg md:w-1/4 py-4`}>
              <div className="flex flex-col px-4 flex-1">
                <div className={'text-gray-800 text-xl text-base'}>{ plan.name }</div>
                <div className={'text-3xl'}>${ plan.price/100 } <span className={'text-gray-600 text-sm'}>/month</span></div>

                <div className={'my-5'}>
                  <div className={'text-base text-gray-800 my-1'}>
                    {plan.features.models} hosted models
                  </div>
                  <div className={'text-base text-gray-600 my-1'}>
                    {plan.features.requests/1000000}M requests
                  </div>
                  <div className={'text-base text-gray-600 my-1'}>
                    Additional requests $15/M
                  </div>
                  <div className={'text-base text-gray-600 my-1'}>
                    24/7 Support
                  </div>
                  <div className={'text-base text-gray-600 my-1'}>
                    Monitoring
                  </div>
                  <div className={'text-base text-gray-600 my-1'}>
                    Full request history
                  </div>
                  <div className={'text-base text-gray-600 my-1'}>
                    Zero-downtime deployments
                  </div>
                  <div className={'text-base text-gray-600 my-1'}>
                    Auto Scaling
                  </div>
                  { plan.features.concierge && <div className={'text-base text-gray-600 my-1'}>
                    <p>Migration Concierge</p>

                    <p className='text-xs mt-1'>We'll help you migrate your models from other clouds.</p>
                  </div> }
                </div>

                <div className={'flex-1'}></div>

                { currentPlan == plan.id && <div  className="rounded bg-white py-2 text-sm transition-all duration-200 border-2 text-center">
                  Current Plan
                </div> }

                { currentPlan && currentPlan != plan.id && <div onClick={() => onPick(plan)} className="rounded bg-indigo-600 py-2 text-white text-sm cursor-pointer transition-all duration-200 hover:bg-indigo-800 text-center">
                  Select Plan
                </div> }

                { !currentPlan && <div onClick={() => onPick(plan)} className="rounded bg-indigo-600 py-2 text-white text-sm cursor-pointer transition-all duration-200 hover:bg-indigo-800 text-center">
                  { plan.trialDays ? 'Start ' + plan.trialDays + '-days trial' : 'Sign Up' }
                </div> }
              </div>
            </div>
          )
        )
      }
      <div className='flex-1'></div>
    </div>
  )
}

export default PlanPicker