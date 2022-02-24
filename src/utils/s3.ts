var AWSMock = require('mock-aws-s3')
import logger from '../logger';

AWSMock.config.basePath = './s3'

let s3 = new AWSMock.S3({
  params: { Bucket: 'inferrd-models' }
})

export let BUCKET_NAME = process.env.AWS_BUCKET_NAME

const log = logger('aws')

export function getUploadSignedUrlForPath(path: string): string {
  const url = s3.getSignedUrl('putObject', {
    Bucket: BUCKET_NAME,
    Key: path,
    ContentType: 'application/zip',
    Expires: 3600
  })

  log('Signed url', url)

  return url
}

export function uploadObject(fileContent: any, path: string): Promise<any> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: path,
    Body: fileContent,
    ContentType: 'application/zip',
  }

  const result = s3.upload(params).promise()

  return result
}

export function getObject(path: string): Promise<any> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: path,
  }

  const result = s3.getObject(params).promise()

  return result
}

export async function getSizeOfAwsFile(filePath: string): Promise<number> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: filePath
  }

  const metadata = await s3.headObject(params).promise()

  return metadata.ContentLength
}