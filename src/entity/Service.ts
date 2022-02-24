import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Instance } from "./Instances";
import { ServiceStatus } from "./ServiceStatus";
import { Stack } from "./Stack";
import { Team } from "./Team";
import { User } from "./User";
import { Version } from "./Version";
import { ServiceType } from "./types";

export enum ServiceDesiredStatus {
  UP = 'up',
  DOWN = 'down'
}

export type BuildStageConfig = {
  command: string;
  artifactDirectory?: string;
  timeout?: number;
}

export enum DriftPeriod {
  DAILY = 60 * 60 * 24,
  WEEKLY = 60 * 60 * 24 * 7,
  MONTHLY = 60 * 60 * 24 * 30
}

@Entity()
export class Service extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  key: string;

  @Column({ nullable: true })
  billingItemId: string;

  @ManyToOne(() => Team, team => team.services)
  team: Promise<Team>;

  @Column()
  teamId: string;

  @OneToMany(() => ServiceStatus, status => status.service, { onDelete: 'CASCADE' })
  statuses: Promise<ServiceStatus[]>;

  @Column({ type: "timestamp", nullable: true })
  lastHealtCheck: Date;
  
  @Column({ nullable: true })
  lastHealtCheckVersion: number;

  @Column()
  desiredStatus: ServiceDesiredStatus;

  @ManyToOne(() => Version, { nullable: true })
  desiredVersion?: Promise<Version>;

  @Column({ nullable: true })
  desiredRamMb: number;

  @Column({ nullable: true })
  desiredCpuHz: number;

  @ManyToOne(() => Stack)
  desiredStack: Promise<Stack>;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ default: null, type: 'json' })
  buildConfig: BuildStageConfig;

  @Column({ default: false })
  splitTrafficEnabled: boolean;

  @Column({ default: ServiceType.ML })
  type: ServiceType;

  @Column()
  instancesDesired: number;

  @Column({ nullable: true })
  readme: string;

  @Column({ nullable: true })
  gpuEnabled: string;

  @Column({ nullable: true })
  subscriptionId: string;

  @Column({ nullable: true })
  promoCodeApplied: string;

  @ManyToOne(() => Instance)
  instance: Promise<Instance>

  @OneToMany(() => Version, version => version.service, { onDelete: 'CASCADE' })
  versions: Promise<Version[]>;
  
  @Column({ default: true })
  allowUnAuthenticatedRequests: boolean;

  @ManyToOne(() => User)
  createdBy: Promise<User>;

  @Column({ default: DriftPeriod.WEEKLY })
  driftPeriod: DriftPeriod;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deletedAt: Date;
}