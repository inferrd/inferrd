import superagent from 'superagent'
import logger from '../logger'

type LogsQuery = {
  serviceId: string;
  versionId: string;
  size?: number;
  query?: string;
  from?: number;
}

const log = logger(`service/logs`)

export const fetchLogs = async (input: LogsQuery) => {
  const {
    serviceId,
    versionId,
    size = 50,
    query,
    from = 0
  } = input

  let body = {
    from,
    size,
    sort : [
      { "@timestamp" : "desc" }
    ],
    query: {
      bool: {
        must: [
          {
            match: {
              service_id: serviceId
            }
          },
          {
            match: {
             version_id: versionId
            }
          }
        ],
        must_not: {
          // remove healtcheck lines
          "query_string": {
            "default_field": "log",
            "query": "healtcheck"
          }
        }
      }
    }
  }

  if(query != null) {
    // @ts-ignore
    body.query.bool.filter = {
      multi_match: {
        lenient: true,
        query,
        fields: ["log"]
      }
    }
  }

  try {
    const request = await superagent.post(
      `${process.env.LOGS_ES}/logstash-*/_search`
    ).send(body)

    return request.body?.hits?.hits?.map(
      (hit: any) => ({
        text: hit._source?.log,
        timestamp: hit._source?.["@timestamp"],
        version_id: hit._source?.version_id,
        source: hit._source?.source
      })
    )
  } catch(e) {
    log(`There was an error fetch logs`, e)
  }
}