import useSWR from "swr";
import { ApiKey, ApiService } from "../api.types";
import { getFetcher } from "../api/api";

const useKeys = (teamId: string): ApiKey[] => {
  const { data: keys } = useSWR<ApiKey[]>(`/team/${teamId}/keys`, getFetcher, {
    refreshInterval: 5000
  })

  return keys
}

export default useKeys