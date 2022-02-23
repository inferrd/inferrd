import useSWR from "swr";
import { ApiKey } from "../api.types";
import { getFetcher } from "../api/api";

const useKey = (keyId: string): ApiKey => {
  const { data: key } = useSWR<ApiKey>(`/key/${keyId}`, getFetcher, {
    refreshInterval: 5000
  })

  return key
}

export default useKey