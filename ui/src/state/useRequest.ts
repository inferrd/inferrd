import useSWR from "swr";
import { ApiRequest } from "../api.types";
import { getFetcher } from "../api/api";

const useRequest = (requestId: string): { request: ApiRequest, isLoading: boolean } => {
  const { data: request, isValidating } = useSWR<ApiRequest>(`/request/${requestId}`, getFetcher)

  return {request, isLoading: isValidating}
}

export default useRequest