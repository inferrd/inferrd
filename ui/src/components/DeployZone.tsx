import React, { useCallback, useRef, useState } from 'react'
import JSZip from 'jszip'
import _ from 'lodash'
import {FileWithPath, useDropzone} from 'react-dropzone'
import { createVersion, deployVersion } from '../api/version'
import { ApiService } from '../api.types'
import superagent from 'superagent'

const uploadVerifier = (stackName: string, acceptFiles: File[]): string | null => {
  // check extension is joblib
  if(stackName.startsWith('sklearn')) {
    if(acceptFiles.length != 1 || !acceptFiles[0].name.endsWith('.joblib')) {
      return `Make you sure you only uploaded one file with extension .joblib.`
    }
  }

  // check extension is keras
  if(stackName.startsWith('keras')) {
    if(acceptFiles.length != 1 || !acceptFiles[0].name.endsWith('.h5')) {
      return `Make you sure you only uploaded one file with extension .h5.`
    }
  }

  // check one file
  if(stackName.startsWith('xgboost')) {
    if(acceptFiles.length != 1 || !acceptFiles[0].name.endsWith('.xgb')) {
      return `Make you sure you only uploaded one file with extension .xgb.`
    }
  }

  // check extension is pt
  if(stackName.startsWith('pytorch')) {
    if(acceptFiles.length != 1 || !acceptFiles[0].name.endsWith('.pt')) {
      return `Make you sure you only uploaded one file with extension .pt.`
    }
  }

  // check extension is onnx
  if(stackName.startsWith('onnx')) {
    if(acceptFiles.length != 1 || !acceptFiles[0].name.endsWith('.onnx')) {
      return `Make you sure you only uploaded one file with extension .onnx.`
    }
  }

  // check no zip and multiple files
  if(stackName.startsWith('spacy')
  || stackName.startsWith('tensorflow')
  || stackName.startsWith('custom')
  || stackName.startsWith('mlflow')) {
    if(acceptFiles[0].name.endsWith('.zip')
    || acceptFiles[0].name.endsWith('.gz')) {
      return `Make sure you upload the unzipped folder.`
    }

    // if(acceptFiles.length == 1) {
    //   return `Make sure you drag and dropped the entire folder.`
    // }
  }

  // check tensorflow has the right files

  return null
}

type Props = {
  title: string;
  service: ApiService;
}

const DeployZone: React.FC<Props> = ({ title, service }) => {
  const [status, setStatus] = useState<string>(null)
  const [isError, setIsError] = useState<boolean>(false)

  const onUploadProgress = useCallback(progress => {
    setStatus(Math.floor(progress.percent * 100) / 100 + '%')
  }, [])

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setIsError(false)
    setStatus('Zipping files, please wait..')

    let zip = new JSZip()

    if(acceptedFiles.length == 0) {
      setStatus('Error! Not files found. Make sure you dragged a folder.')
      setIsError(true)
      return
    }


    if(acceptedFiles.length == 1 && acceptedFiles[0].path.endsWith('zip')) {
      setStatus('Error! It looks like you dragged a zip file. Please drag the unzipped files.')
      setIsError(true)
      return
    }

    // @ts-ignore
    const error = uploadVerifier(service.desiredStack.humanReadableId, acceptedFiles)

    if(error) {
      setStatus(error)
      setIsError(true)
      return
    }

    try {
      let firstPart = acceptedFiles[0].path.split('/')[1]

      if(acceptedFiles[1]?.path.split('/')[1] != firstPart) {
        firstPart = ''
      } else {
        firstPart = '/' +firstPart + '/'
      }

      // Loop through the filelist to get each filename and pass each file to zip object
      for(let file of acceptedFiles) { 
          let filename = file.path.replace(firstPart, '')
          zip.file(filename, file)
      }

      zip.generateAsync({type:'blob'}).then(async (blobdata)=>{
        // first set version
        setStatus('Creating version')
        const version = await createVersion(service.id)

        setStatus('Uploading version')
        // uploading zip package
        const uploadRequest = superagent.put(version.signedUpload)

        uploadRequest.set('Content-Type', 'application/zip')
        uploadRequest.send(blobdata)

        uploadRequest.on('progress', onUploadProgress)

        uploadRequest.then(async () => {
          setStatus('Triggering deploy')
          await deployVersion(version.id)
      
          setStatus(null)
        })
      })
    } catch(e) {
      setStatus('An error happened while deploying this version.')
      setIsError(true)

      console.error(e)
      return
    }
  }, [])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div>
      <div {...getRootProps()} className={`w-full h-20 cursor-pointer border-gray-300 mt-2 text-center bg-gray-100 border-2 rounded ${isDragActive ? 'border-solid' : 'border-dashed'} ${status && !isError && 'opacity-50'}`}>
        <input {...getInputProps()}/>

        <div className={`mt-7 text-sm ${isError && 'text-red-600'}`}>{ status ? status : isDragActive ? 'Drop here' : title }</div>
      </div>
    </div>
  )
}

export default DeployZone