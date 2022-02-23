import * as client from 'prom-client'
import { MoreThan, Not } from 'typeorm';
import { Service } from './entity/Service';
import { Team } from './entity/Team';
import { User } from './entity/User';
import { Version } from './entity/Version';

const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
export const registry = new Registry();
collectDefaultMetrics({ register: registry });

export const httpRequests = new client.Gauge({
  name: 'http_requests',
  help: 'number of requests',
  labelNames: ['method', 'path', 'hostname', 'userId'],
  registers: [registry]
})

export const modelRequests = new client.Counter({
  name: 'inferrd_model_requests',
  help: 'number of requests',
  labelNames: ['modelId', 'status'],
  registers: [registry]
})

export const modelLatency = new client.Histogram({
  name: 'inferrd_model_request_latency',
  help: 'latency of requests',
  labelNames: ['modelId', 'status'],
  buckets: [10, 100, 200, 400, 500, 800, 1000, 1200, 1500, 1700, 2000, 3000, 4000, 5000],
  registers: [registry]
})

export const userCounter = new client.Gauge({
  name: 'inferrd_users_counter',
  help: 'number of users',
  async collect() {
    const counter = await User.count()

    this.set(counter)
  },
  registers: [registry]
})

export const modelCounter = new client.Gauge({
  name: 'inferrd_models_counter',
  help: 'number of models',
  async collect() {
    const counter = await Service.count()

    this.set(counter)
  },
  registers: [registry]
})

export const versionCounter = new client.Gauge({
  name: 'inferrd_versions_counter',
  help: 'number of versions',
  async collect() {
    const counter = await Version.count()

    this.set(counter)
  },
  registers: [registry]
})

export const balanceGauge = new client.Gauge({
  name: 'inferrd_team_balance',
  help: 'balance of teams',
  labelNames: ['teamId', 'name'],
  async collect() {
    const teams = await Team.find({
      where: {
        balance: MoreThan(0)
      }
    })

    for(let team of teams) {
      this.labels(team.id, team.name).set(team.balance/100)
    }
  },
  registers: [registry]
})

export const creditsGauge = new client.Gauge({
  name: 'inferrd_team_credits',
  help: 'balance of teams',
  labelNames: ['teamId', 'name'],
  async collect() {
    const teams = await Team.find({
      where: {
        credits: MoreThan(0)
      }
    })

    for(let team of teams) {
      this.labels(team.id, team.name).set(team.credits/100)
    }
  },
  registers: [registry]
})

export default registry