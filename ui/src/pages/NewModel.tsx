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
  const { data: instances } = useSWR<ApiInstance[]>('/instances', getFetcher)

  const [selectedStackId, setSelectedStackId] = useState<string>()
  const [selectedInstanceType, setSelectedInstanceType] = useState<string>()
  const [name, setName] = useState<string>(uniqueNamesGenerator(customConfig))
  const [isLoading, setIsLoading] = useState<boolean>()
  const history = useHistory()
  const { team } = useContext(TeamContext)

  useEffect(() => {
    setSelectedStackId(stacks?.find(stack => stack.humanReadableId.startsWith('tensorflow'))?.id)
  }, [stacks])

  useEffect(() => {
    if(instances) {
      let cheapest = _.sortBy(instances, 'monthlyPrice')

      setSelectedInstanceType(cheapest[0].id)
    }
  }, [instances])

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
      selectedInstanceType
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

        <div className='flex gap-4'>
          {
            _.sortBy(instances || [], 'monthlyPrice').map(
              instance => {
                const selected = instance.id == selectedInstanceType
                const locked = false;//instance.monthlyPrice > 50 * 100 && !team.defaultPaymentId

                return (
                  <Tippy hideOnClick={false} disabled={!locked} content={`Add a payment method to unlock bigger plans`}>
                    <div onClick={() => locked ? _.noop : setSelectedInstanceType(instance.id)} className={`relative px-4 py-4 w-52 ${!selected && `hover:bg-gray-50`} border-2 border-white focus:opacity-70 transition-colors flex flex-col cursor-pointer rounded bg-white shadow ${selected && 'border-indigo-500 border-2 bg-indigo-50'}`}>
                      { locked && <Lock style={{
                        height: 40,
                        color: 'black',
                        width: 40,
                        position: 'absolute',
                        top: 48,
                        left: 80
                      }}/> }

                      <div className={`${locked && 'opacity-20'}`}>
                        <div className='text-sm font-bold mb-2'>{ instance.ramMb/2/1000 }GB GPU</div>

                        <div className='text-sm'>
                          <div className='flex mt-1 items-center'><Cpu className='mr-1' height={13} width={13}/> 1 CPU</div>
                          <div className='flex mt-1 items-center'><HardDrive className='mr-1' height={13} width={13}/> { instance.ramMb >= 1000 ? `${instance.ramMb/1000}GB` : `${instance.ramMb}MB` } RAM</div>
                          
                          {/* <div className='flex mt-1 items-center'><Database className='mr-1' height={13} width={13}/> { instance.ramMb < 1000 ? `${instance.ramMb}MB` : `${instance.ramMb/1000}GB` } RAM</div>
                          <div className='flex mt-1 items-center'><Cpu className='mr-1' height={13} width={13}/> { instance.cpuHrtz < 1000 ? `Shared` : `${instance.cpuHrtz/1000}` } CPU (3.9 GHz)</div>
                          */}
                        </div>
                      </div>
                      </div>
                  </Tippy>
                )
              }
            )
          }
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