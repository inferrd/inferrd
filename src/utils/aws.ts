import { S3 } from 'aws-sdk'
import logger from '../logger';

let s3 = new S3()

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

export function getDownloadSignedUrlForPath(path: string): string {
  const url = s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: path,
    Expires: 3600
  })

  log('Signed url', url)

  return url
}

export async function getSizeOfAwsFile(filePath: string): Promise<number> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: filePath
  }

  const metadata = await s3.headObject(params).promise()

  return metadata.ContentLength
}