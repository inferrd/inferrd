import useSWR from "swr";
import { ApiVersion } from "../api.types";
import { getFetcher } from "../api/api";

const useServiceVersions = (id: string): ApiVersion[] => {
  const { data: versions } = useSWR<ApiVersion[]>(`/service/${id}/versions?limit=15`, getFetcher)

  return versions
}

export default useServiceVersions