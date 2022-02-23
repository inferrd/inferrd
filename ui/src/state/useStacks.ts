import useSWR from "swr"
import { ApiStack } from "../api.types"
import { getFetcher } from "../api/api"

const useStacks = () => {
  const { data: stacks } = useSWR<ApiStack[]>('/stacks', getFetcher)

  return stacks
}

export default useStacks