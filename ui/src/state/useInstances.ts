import useSWR from "swr"
import { ApiInstance } from "../api.types"
import { getFetcher } from "../api/api"

const useInstances = (): ApiInstance[] => {
  const { data: instances } = useSWR<ApiInstance[]>('/instances', getFetcher)

  return instances
}

export default useInstances