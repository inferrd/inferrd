import { DriftPeriod, Service, ServiceDesiredStatus } from "../entity/Service"
import { ServiceStatus } from "../entity/ServiceStatus"
import { Stack } from "../entity/Stack"
import { Team } from "../entity/Team"
import { Features, OnboardingState, User, UserAchievements } from "../entity/User"
import { Request } from '../entity/Request'
import { Version } from "../entity/Version"
import { Instance } from "../entity/Instances"
import { getRequestContext } from "../als"
import * as Stripe from 'stripe'
import { MetricRollup } from "../entity/MetricRollup"
import { Key } from "../entity/Key"

export type SerializedUser = {
  id: string;
  email: string;
  achievements?: UserAchievements;
  emailVerified: boolean;
  createdAt: string;
  features?: Features;
  apiKey?: string;
  onboardingState?: OnboardingState;
  isAdmin: boolean;
}

export function serializeUser(user: User): SerializedUser {
  if(!user) {
    return null
  }

  const isMe = getRequestContext()?.user?.id == user.id

  return {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt.toString(),
    emailVerified: user.emailVerified,
    ...(isMe && { 
      apiKey: user.apiKey, 
      achievements: {
        CREATE_MODEL: false,
        SUCCESSFULL_DEPLOY: false,
        FIRST_INFERENCE: false,
        INITIAL_CREDIT: false,
        PAYMENT_DETAILS: false,
        ...user.achievements 
      }, 
      features: user.features || {},
      onboardingState: user.onboardingState || {} })
  }
}

export type SerializedRollup = {
  id: string;
  day: string;
  rollup: Object;
}

export function serializeRollup(rollup: MetricRollup): SerializedRollup {
  return {
    id: rollup.id,
    day: rollup.day.toISOString(),
    rollup: rollup.rollup
  }
}

export type SerializedDriftTracker = {
  id: string;
  type: 'input' | 'output',
  distributionType: 'continuous' | 'discrete' | null;
  distribution: any;
  dataType: 'number' | 'text' | 'unknown';
  covariance: any;
  name: string;
}

export type SerializedTeam = {
  id: string;
  name: string;
  emoji: string;
  balance: number
  credits: number;
  createdAt: string;
  defaultPaymentId: string;
  owner: SerializedUser;
}

export async function serializeTeam(team: Team): Promise<SerializedTeam> {
  return {
    id: team.id,
    name: team.name,
    emoji: team.emoji,
    balance: team.balance,
    credits: team.credits,
    owner: serializeUser(await team.owner),
    defaultPaymentId: team.defaultPaymentId,
    createdAt: team.createdAt.toString()
  }
}

export type SerializedService = {
  id: string;
  name: string;
  key: string;
  desiredStatus: string;
  billingItemId: string;
  desiredStack: SerializedStack;
  createdBy: SerializedUser;
  desiredVersion?: SerializedVersion;
  isUp: boolean;
  allowUnAuthenticatedRequests: boolean;
  splitTrafficEnabled: boolean;
  promoCodeApplied: string;
  type: string;
  driftPeriod: DriftPeriod;
  gpuEnabled: boolean;
  readme: string;
  desiredCpuHz: number;
  desiredRamMb: number;
  isPaid: boolean;
  runningVersion: number;
  createdAt: string;
  updatedAt: string;
}

export async function serializeService(service: Service): Promise<SerializedService> {
  return {
    id: service.id,
    name: service.name,
    billingItemId: service.billingItemId,
    key: service.key,
    driftPeriod: service.driftPeriod,
    splitTrafficEnabled: service.splitTrafficEnabled,
    desiredRamMb: service.desiredRamMb,
    desiredCpuHz: service.desiredCpuHz,
    desiredStatus: service.desiredStatus,
    desiredStack: serializeStack(await service.desiredStack),
    createdBy: serializeUser(await service.createdBy),
    desiredVersion: await serializeVersion(await service.desiredVersion),
    isUp: service.lastHealtCheck != null && service.desiredStatus == ServiceDesiredStatus.UP,
    runningVersion: service.lastHealtCheckVersion,
    allowUnAuthenticatedRequests: service.allowUnAuthenticatedRequests,
    promoCodeApplied: service.promoCodeApplied,
    readme: service.readme,
    gpuEnabled: service.gpuEnabled != null,
    type: service.type,
    isPaid: service.isPaid,
    createdAt: service.createdAt.toString(),
    updatedAt: service.updatedAt.toString()
  }
}

export type SerializedStack = {
  id: string;
  name: string;
  humanReadableId: string;
  type: string;
  supportGpu: boolean;
}

export function serializeStack(stack: Stack): SerializedStack {
  if(!stack) {
    return null
  }

  return {
    id: stack.id,
    name: stack.name,
    supportGpu: stack.supportGpu,
    humanReadableId: stack.humanReadableId,
    type: stack.type
  }
}

export type SerializedVersion = {
  id: string;
  number: number;
  createdBy: SerializedUser;
  runStatus: string;
  runStatusDescription: string;
  trafficPercentage: number;
  stack: SerializedStack;
  downloadUrl: string;
  testInstances: any[];
  createdAt: string;
  bundleSize: number;
  lastLines: string;
}

export async function serializeVersion(version?: Version): Promise<SerializedVersion> {
  if(!version) {
    return null
  }

  return {
    id: version.id,
    testInstances: version.testInstances,
    number: version.number,
    createdBy: serializeUser(await version.createdBy),
    stack: serializeStack(await version.stack),
    runStatus: version.runStatus,
    trafficPercentage: version.trafficPercentage,
    bundleSize: version.bundleSize,
    runStatusDescription: version.runStatusDescription,
    downloadUrl: `${process.env.API_HOST}/version/${version.id}/download`,
    lastLines: version.lastLines,
    createdAt: version.createdAt.toString()
  }
}

export type SerializedStatus = {
  id: string;
  status: string;
  message: string;
  createdAt: string;
}

export function serializeServiceStatus(status: ServiceStatus): SerializedStatus {
  return {
    id: status.id,
    status: status.status,
    message: status.message,
    createdAt: status.createdAt.toString()
  }
}

export type SerializedRequest = {
  id: string;
  versionId: string;
  requestBody: any;
  responseBody: any;
  responseStatus: number;
  createdAt: string;
  timingMs: number;
}

export function serializeRequest(request: Request): SerializedRequest {
  return {
    id: request.id,
    versionId: request.versionId,
    requestBody: request.requestBody,
    responseBody: request.responseBody,
    responseStatus: request.responseStatus,
    createdAt: request.createdAt.toString(),
    timingMs: request.timingMs
  }
}

export type SerializedInstance = {
  id: string;
  name: string;
  description: string;
  maxRequests?: number;
  monthlyPrice: number;
  allowGpu: boolean;
  cpuHrtz: number;
  maxBundleSizeMb: number;
  ramMb: number;
}

export function serializeInstance(instance: Instance): SerializedInstance {
  return {
    id: instance.id,
    name: instance.name,
    description: instance.description,
    monthlyPrice: instance.monthlyPrice,
    maxRequests: instance.maxRequests,
    allowGpu: instance.enableGpu,
    cpuHrtz: instance.cpuHrtz,
    maxBundleSizeMb: instance.maxBundleSizeMb,
    ramMb: instance.ramMb
  }
}

export type SerializedStripeInvoice = {
  amount: number;
  period_start: string;
  period_end: string;
  status: string;
  pdf_link: string;
  id: string;
}

export function serializeStripeInvoice(invoice: Stripe.Stripe.Invoice): SerializedStripeInvoice {
  return {
    amount: invoice.total,
    period_start: invoice.period_start.toString(),
    period_end: invoice.period_end.toString(),
    status: invoice.status,
    pdf_link: invoice.hosted_invoice_url,
    id: invoice.id
  }
}

export type SerializedCard = {
  country: string;
  brand: string;
  last4: string;
  exp_year: number;
  exp_month: number;
  id: string;
  isDefault: boolean;
}

export function serializedPaymentMethod(id: string, paymentMethod: Stripe.Stripe.PaymentMethod.Card): SerializedCard {
  return {
    id,
    last4: paymentMethod.last4,
    brand: paymentMethod.brand,
    exp_year: paymentMethod.exp_year,
    exp_month: paymentMethod.exp_month,
    isDefault: true,
    country: paymentMethod.country
  }
}

export type SerializedKey = {
  id: string;
  name: string;
  roles: string[];
  hash: string;
  createdBy: SerializedUser;
  isDeactivated?: string;
  createdAt: string;
  updatedAt: string;
}

export async function serializeKey(key?: Key): Promise<SerializedKey> {
  if(!key) return null
  
  return {
    id: key.id,
    name: key.name,
    roles: key.roles,
    hash: key.hash,
    createdBy: serializeUser(await key.createdBy),
    createdAt: key.createdAt.toString(),
    isDeactivated: key.isDeactivated?.toString(),
    updatedAt: key.updatedAt?.toString()
  }
}