import useSWR from "swr";
import { ApiService } from "../api.types";
import { getFetcher } from "../api/api";

const useServices = (teamId: string): ApiService[] => {
  const { data: services } = useSWR<ApiService[]>(`/team/${teamId}/services`, getFetcher)

  return services
}

export default useServices