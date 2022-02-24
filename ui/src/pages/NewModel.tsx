import _ from 'lodash'
import React, { useContext, useEffect, useState } from 'react'
import useSWR from 'swr'
import { ApiStack, ApiInstance } from '../api.types'
import { getFetcher } from '../api/api'
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';

const customConfig: Config = {
  dictionaries: [adjectives, colors],
  separator: '-',
  length: 2,
};

import TensorFlowImage from '../assets/tensorflow.png'
import SpacyImage from '../assets/spacy.png'
import skLearn from '../assets/sklearn-logo.png'
import Keras from '../assets/keras.png'
import PyTorch from '../assets/pytorch.png'
import XGBoost from '../assets/xgboost.png'
import MLFlow from '../assets/mlflow.png'
import Tippy from '@tippyjs/react';
import onnx from '../assets/onnx.png'
import { useHistory } from 'react-router'
import { createService } from '../api/services'
import { TeamContext } from '../context/TeamManager'
import { Cpu, HardDrive, Database, Globe, FastForward, Server, Package, Triangle, Lock } from 'react-feather'
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js'
import { formatRequestNumber } from './ServiceMonitoring'
import { getImageForFramework } from '../constants'

const NewService: React.FC = ({ }) => {
  const { data: stacks } = useSWR<ApiStack[]>('/stacks', getFetcher)

  const [selectedStackId, setSelectedStackId] = useState<string>()
  const [cpuValue, setCpuValue] = useState<string>('1')
  const [ramValue, setRamValue] = useState<string>('1')
  const [name, setName] = useState<string>(uniqueNamesGenerator(customConfig))
  const [isLoading, setIsLoading] = useState<boolean>()
  const history = useHistory()
  const { team } = useContext(TeamContext)

  useEffect(() => {
    setSelectedStackId(stacks?.find(stack => stack.humanReadableId.startsWith('tensorflow'))?.id)
  }, [stacks])

  const onCreate = async () => {
    if(isLoading) return

    if(!name) {
      return alert('Pick a name.')
    }

    setIsLoading(true)

    const service = await createService(
      team.id,
      name, 
      selectedStackId, 
      parseInt(cpuValue) * 1000,
      parseInt(ramValue) * 1024,
    )
    setIsLoading(false)

    if(service) {
      history.push(`/team/${team.id}/model/${service.id}/overview`)
    }
  }
  
  return (
    <div>
      <div className='bg-white shadow font-bold text-2xl mb-4'>
        <div className='pt-5 pb-4 container mx-auto'>
          New Model
        </div>
      </div>
      <div className='container mx-auto'>
        <div className='font-bold text-xl mb-2'>
          Stack
        </div>
        <div className='text-sm my mb-4 text-gray-500'>A stack is the environment in which your model will run.</div>

        <div className='flex gap-4'>
          { 
            stacks?.map(
              stack => {
                const img = getImageForFramework(stack.humanReadableId)
                const selected = stack.id == selectedStackId

                return (
                  <div onClick={() => setSelectedStackId(stack.id)} className={`px-2 py-2 ${!selected && `hover:bg-gray-50`} focus:opacity-70 transition-colors text-center w-32 h-32 flex flex-col justify-center cursor-pointer  items-center rounded pr-2 bg-white shadow ${selected && 'border-indigo-500 border-2 bg-indigo-50'}`}>
                    <div className='text-center'>
                      { img && <img style={{ height: 35 }} className='mx-auto mb-2' src={img} alt={stack.name}/> }

                      <div>{ stack.name }</div>
                    </div>
                  </div>
                )
              }
            )
          }
        </div>

        <div className='font-bold text-xl mb-2 mt-8'>
          Resources
        </div>
        <div className='text-sm my mb-4 text-gray-500'>Choose the minimum amount of resources your model needs. This can be changed later.</div>

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

        <div className='font-bold text-xl mb-2 mt-8'>
          Name
        </div>
        <div className='text-sm my mb-4 text-gray-500'>Give your model a memorable name. This can be changed later.</div>

        <input 
          style={{ width: 400 }}
          className='w-full px-3 py-2 border-2 rounded focus:border-indigo-600 outline-none transition-colors'
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={'Image Recognition'}/>

        <div onClick={onCreate} className='px-2 py-2 rounded bg-indigo-600 text-white text-center w-40 mt-4 cursor-pointer hover:opacity-90 shadow transition-opacity'>
          Create Model
        </div>
      </div>
    </div>
  )
}

export default NewService