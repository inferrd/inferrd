import {mutate} from "swr";
import { ApiUser } from "../api.types";
import { post } from "./api";

export function setToken(token: string) {
  window.localStorage.setItem('user_token', token)

  mutate('/me', null, true)
}

export function logout() {
  window.localStorage.removeItem('user_token')

  mutate('/me', null)
}

export async function register(email: string, password: string): Promise<string> {
  const { token, error, message } = await post('/auth/register', {
    email,
    password,
  })

  if(error) {
    throw new Error(message);
  }

  return token
}

export async function login(email: string, password: string): Promise<string> {
  const { token, error, message } = await post('/auth/login', {
    email,
    password
  })

  if(error) {
    throw new Error(message);
  }

  return token
}