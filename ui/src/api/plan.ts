import { get } from "./api"

export const getCheckoutSessionId = async (teamId: string, planId: string): Promise<string>  => {
  const {
    id
  } = await get(`/team/${teamId}/plan/${planId}/checkout-session`)

  return id
}