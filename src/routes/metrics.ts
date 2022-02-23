import { AsyncRouter } from "express-async-router";
import registry, { httpRequests } from './../prometheus'
import os from 'os'
import { getRequestContext } from "../als";

const metricsRouter = AsyncRouter()

metricsRouter.get(
  '/metrics',
  async (req, res) => {
    const metrics = await registry.metrics()

    res.set('Content-Type', 'text/plain')
    res.send(metrics)
    res.end()
  }
)

metricsRouter.use(
  '*',
  async (req, res) => {
    const context = getRequestContext()
    httpRequests.labels(req.method, req.originalUrl, os.hostname(), context?.user?.id).inc(1)
  }
)

export default metricsRouter