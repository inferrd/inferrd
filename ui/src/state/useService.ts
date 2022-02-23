import useSWR from "swr"
import { ApiService } from "../api.types"
import { getFetcher } from "../api/api"

const useService = (serviceId: string): ApiService => {
  const { data: service } = useSWR<ApiService>(`/service/${serviceId}`, getFetcher, {
    refreshInterval: 2000
  })

  return service
}

export default useService