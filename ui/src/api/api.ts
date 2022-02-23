import { ApiError } from "../api.types"

export const apiEndpoint = process.env.API_ENDPOINT

export const getUserToken = (): string => {
  return window.localStorage.getItem('user_token')
}

export const getHeaders = () => {
  let headers: {[key: string]: string} = {
    'Content-Type': 'application/json'
  }

  let userToken = getUserToken()

  if(userToken) {
    headers['Authorization'] = 'Bearer ' + userToken
  }

  return headers
}

export const getFetcher = (url: string) => {
  return fetch(`${apiEndpoint}${url}`, {
    headers: getHeaders()
  }).then(r => r.json())
}

export const post = <T>(url: string, body: any): Promise<T & ApiError> => {
  return fetch(`${apiEndpoint}${url}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(r => r.json())
}


export const put = <T>(url: string, body: any): Promise<T & ApiError> => {
  return fetch(`${apiEndpoint}${url}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(r => r.json())
}

export const del = (url: string, body: any = {}): Promise<any> => {
  return fetch(`${apiEndpoint}${url}`, {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify(body)
  }).then(r => r.json())
}

export const get = (url: string) => {
  return fetch(`${apiEndpoint}${url}`, {
    method: 'GET',
    headers: getHeaders()
  }).then(r => r.json())
}
