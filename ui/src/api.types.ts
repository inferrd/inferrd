export type ApiUser = {
  id: string;
  email: string;
  apiKey: string;
  isAdmin: boolean;
  createdAt: string;
  achievements: UserAchievements;
  emailVerified: boolean;
  features?: Features;
  onboardingState?: OnboardingState;
}

export type UserAchievements = {
  CREATE_MODEL: boolean;
  SUCCESSFULL_DEPLOY: boolean;
  INITIAL_CREDIT: boolean;
  FIRST_INFERENCE: boolean;
  PAYMENT_DETAILS: boolean;
}

export type Features = {
  featureDrift?: boolean;
  splitTraffic?: boolean;
  security?: boolean;
  jobs?: boolean;
}

export type ApiInvoice = {
  id: string;
  billingItems: ApiBillingItem[];
  status: 'PAID' | 'PAYMENT_FAILURE' | 'PENDING';
  totalPriceInCents: number;
  creditsAppliedInCents: number;
  createdAt: string;
}

export type ApiModelStats = {
  requestsCount: {
    total: number;
    errors: number;
  }
  latency: number;
}

export type ApiError = {
  error: boolean;
  name: string;
  message: string;
}

export type ApiTeam = {
  id: string;
  name: string;
  storageLimitBytes: string;
  emoji: string;
  defaultPaymentId: string;
  balance: number;
  credits: number;
  owner: ApiUser;
  plan?: ApiPlan;
}

export type ApiCard = {
  country: string;
  brand: string;
  last4: string;
  exp_year: number;
  exp_month: number;
  id: string;
  isDefault: boolean;
}

export type ApiStack = {
  name: string;
  id: string;
  type: ServiceType;
  icon: string;
  supportGpu: boolean;
  humanReadableId: string;
}

export enum ServiceStatus {
  UP = 'up',
  DOWN = 'down'
}

export enum InstanceType {
  SHARED = 'shared_cpu',
  DEDICATED_CPU = 'dedicated_cpu',
  SHARED_GPU = 'shared_gpu'
}

export type ApiInvite = {
  id: string;
  email: string;
  createdAt: string;
  team: ApiTeam;
  invitor: ApiUser;
}

export enum ServiceType {
  DOCKER = 'docker',
  BUILD_AND_SERVE = 'build_and_serve',
  ML = 'machine_learning'
}

export enum DriftPeriod {
  DAILY = 60 * 60 * 24,
  WEEKLY = 60 * 60 * 24 * 7,
  MONTHLY = 60 * 60 * 24 * 30
}

export type ApiService = {
  id: string;
  marketplaceItem?: ApiMarketplaceItem;
  name: string;
  key: string;
  desiredStatus: ServiceStatus;
  instance: ApiInstance;
  desiredStack: ApiStack;
  isSplitTraffic: boolean;
  driftPeriod: DriftPeriod;
  desiredVersion: ApiVersion;
  createdBy: ApiUser;
  readme: string;
  billingItemId: string;
  versions?: ApiVersion[];
  splitTrafficEnabled: boolean;
  gpuEnabled: boolean;
  isUp: boolean;
  type: ServiceType;
  promoCodeApplied: string;
  runningVersion: number;
  allowUnAuthenticatedRequests: boolean;
  createdAt: string;
  isPaid: boolean;
  updatedAt: string;
}

export type ApiVersion = {
  id: string;
  number: number;
  stack: ApiStack;
  createdBy: ApiUser;
  testInstances: string;
  runStatus: string;
  lastLines: string;
  downloadUrl: string;
  runStatusDescription: string;
  trafficPercentage: number;
  createdAt: string;
  bundleSize: number;
}

export type ApiServiceStatus = {
  id: string;
  status: string;
  message: string;
  createdAt: string;
}

export type ApiRequest = {
  id: string;
  versionId: string;
  requestBody: any;
  responseBody: any;
  responseStatus: number;
  createdAt: string;
  timingMs: number;
}

export type ApiInstance = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  maxRequests?: number;
  maxBundleSizeMb: number;
  cpuHrtz: number;
  trialDays: number;
  allowGpu: boolean;
  ramMb: number;
}

export type ApiPlan = {
  id: string;
  name: string;
  price: number;
  trialDays: number;
  features: {
    concierge: boolean;
    models: number;
    requests: number;
  };
}

export type ApiRegistryAccount = {
  username: string;
  password: string;
}

export type ApiDriftTracker = {
  id: string;
  type: 'input' | 'output',
  distributionType: 'continuous' | 'discrete';
  dataType: 'number' | 'text';
  name: string;
}

export type ApiMetricRollup = {
  id: string;
  day: string;
  rollup: any;
}

export type ApiAllocation = {
  healthy: boolean;
  version: string;
  id: string;
  isCanary: boolean;
  startedAt: string;
  status: 'running';
}

export type OnboardingState = {
  skippedAt?: Date;
  completedAt?: Date;
  serviceId?: string;
  versionId?: string;
  inferenceId?: string;
}

export type ApiJob = {
  id: string;
  name: string;
  jobStatus: string;
  gpuRamMb: number;
  cpuRamMb: number;
  createdBy: ApiUser;
  createdAt: string;
  updatedAt: string;
}

export type ApiJobRun = {
  id: string;
  jobId: string;
  gpuRamMb: number;
  cpuRamMb: number;
  runStatus: string;
  startedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApiKey = {
  id: string;
  name: string;
  roles: string[];
  hash: string;
  createdBy: ApiUser;
  isDeactivated?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApiBillingItem = {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  product: 'INSTANCE' | 'JOB';
  labels: Record<string, string>;
  startPeriod?: string;
  endPeriod?: string;
  invoiced?: boolean;
}

export type ApiCreditGrant = {
  id: string;
  originalAmountInCents: number;
  amountInCents: number;
  name: string;
  expiresAt: string;
  createdAt: string;
}

export type ApiLog = {
  text: string;
  timestamp: string;
  version_id: string;
  source: string;
}

export type ApiMarketplaceItem = {
  id: string;
  name: string;
  isOfficial: boolean;
  description: string;
  monthlyPrice: number;
  createdAt: string;
  available: boolean;
  author: string;
  versionId: string;
  versionNumber: number;

  // returned by the individual endpoint
  readme?: string;
  instance?: ApiInstance;
}

export type ApiDataset = {
  id: string;
  name: string;
  description: string;
  team: ApiTeam;
  latest: ApiDatasetVersion;
  createdAt: string;
  updatedAt: string;
}

export type ApiDatasetVersion = {
  id: string;
  format: string;
  size: number;
  number: number;
  createdBy: ApiUser;
  createdAt: string;
  updatedAt: string;
}