import { mutate } from "swr";
import { ApiUser } from "../api.types";
import { post } from "./api";

export async function updateUser(user: Partial<ApiUser & { password: string }>): Promise<boolean> {
  const userResponse = await post<ApiUser>('/me', {
    ...user
  })

  if(userResponse.error) {
    alert(userResponse.message)
    return false
  }

  await mutate(`/me`, userResponse)

  return true
}