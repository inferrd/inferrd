import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import { ApiService } from '../api.types'
import { getFetcher } from '../api/api'
import Select from 'react-select'
import InlineCode from './InlineCode'

type Props = {
  service: ApiService;
}

const TensorFlowAutoDocs: React.FC<Props> = ({ service }) => {
  const [selectedSignatureName, setSelectedSignatureName] = useState<string>()

  const { data: tfMetadata } = useSWR(`/service/${service.id}/tf_metadata`, getFetcher)

  const signatureRef = tfMetadata?.metadata?.signature_def.signature_def

  const signatureNameOptions = signatureRef ? Object.keys(signatureRef).map(signatureName => { 
    const methodName = signatureRef[signatureName].method_name

    if(methodName == '') return

    return {
      label: signatureName,
      value: signatureName
    }
  }).filter(v => !!v) : []

  useEffect(() => {
    if(signatureNameOptions.length > 0 && !selectedSignatureName) {
      setSelectedSignatureName(signatureNameOptions[0].value)
    }
  }, [signatureNameOptions])

  const selectedSignature = signatureRef ? signatureRef[selectedSignatureName] : null

  if(!service.isUp) {
    return <div></div>
  }

  return (
    <div className='flex-1'>
      <div className='shadow rounded mt-3 px-4 py-4 bg-white'>
        <div className='font-bold'>Auto documentation</div>

        <p className='mt-3 text-gray-600 text-sm'>This documentation was generated using the TensorFlow compute graph.</p>

        { tfMetadata && !tfMetadata.error && 
          <>
            <p className='mt-3 text-gray-600 text-sm'>Model version: v{ tfMetadata.model_spec.version }</p>

            { signatureNameOptions.length > 1 && 
              <>
                <p className='mt-3 text-gray-600 text-sm mb-1'>Select the signature name:</p>

                <Select options={signatureNameOptions} value={signatureNameOptions.find(option => option.value == selectedSignatureName)}/> 
              </> 
            }

            {
              selectedSignature && 
                <>
                  <p className='mt-3 text-gray-600 text-sm mb-1'>Inputs</p>

                  <ul>
                    <li>
                      {
                        Object.keys(selectedSignature.inputs).map(
                          (inputName: any) => {
                            const input = selectedSignature.inputs[inputName]

                            return (
                              <div className='text-sm'><InlineCode className='text-sm'>{ inputName }</InlineCode>: data type is <InlineCode className='text-sm'>{input.dtype}</InlineCode>, shape is <InlineCode>({
                                input.tensor_shape.dim.map((dim: any) => dim.size).join(',')
                              })</InlineCode></div>
                            )
                          }
                        )
                      }
                    </li>
                  </ul>

                  <p className='mt-3 text-gray-600 text-sm mb-1'>Outputs</p>

                  <ul>
                    <li>
                      {
                        Object.keys(selectedSignature.outputs).map(
                          (outputName: any) => {
                            const output = selectedSignature.outputs[outputName]

                            return (
                              <div className='text-sm'><InlineCode className='text-sm'>{ outputName }</InlineCode>: data type is <InlineCode className='text-sm'>{output.dtype}</InlineCode>, shape is <InlineCode>({
                                output.tensor_shape.dim.map((dim: any) => dim.size).join(',')
                              })</InlineCode></div>
                            )
                          }
                        )
                      }
                    </li>
                  </ul>
                </>
            }
          </>
        }
      </div>
    </div>
  )
}

export default TensorFlowAutoDocs