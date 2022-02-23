import useSWR from "swr"
import { ApiServiceStatus } from "../api.types"
import { getFetcher } from "../api/api"

const useServiceStatus = (serviceId: string): ApiServiceStatus => {
  const { data: status } = useSWR<ApiServiceStatus>(`/service/${serviceId}/last_status`, getFetcher, {
    refreshInterval: 1000
  }) 

  return status
}

export default useServiceStatus