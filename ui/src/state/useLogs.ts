import { useEffect, useRef, useState } from "react"
import { ApiLog } from "../api.types"
import { post } from "../api/api"

type LogsQuery = {
  serviceId: string;
  versionId: string;
  size?: number;
  query?: string;
  from?: number;
}

const useLogs = (query: LogsQuery) => {
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const refreshLogs = () => {
    setIsLoading(true)
    post<ApiLog[]>(`/service/${query.serviceId}/logs`, query).then(res => {
      setIsLoading(false)
      setLogs(res?.reverse())
    })
  }
  
  useEffect(() => {
    refreshLogs() 
  }, [JSON.stringify(query)])

  useEffect(() => {
    const intervalId = window.setInterval(refreshLogs, 5000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [refreshLogs])

  return { logs, isLoading }
}

export default useLogs