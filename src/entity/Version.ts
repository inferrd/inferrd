import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Service } from "./Service";
import { Stack } from "./Stack";
import { RunStatus } from "./types";
import { User } from "./User";

enum VersionBuildStatus {
  WAITING = 'waiting',
  FAILED = 'failed',
  SUCCESS = 'success',
  STARTINB = 'starting'
}

export enum VersionDeploymentStatus {
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS'
}

@Entity()
export class Version extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  
  @Column()
  number: number;

  @ManyToOne(() => Stack)
  stack: Promise<Stack>;

  @Column()
  @Index()
  nomadEvaluationId: string;

  @Column({ nullable: true })
  @Index()
  deploymentId: string;

  @Column()
  storagePath: string;

  @Column({ nullable: true })
  buildStatus: VersionBuildStatus;

  @Column({ nullable: true })
  runStatus: RunStatus;

  @Column({ nullable: true })
  runStatusDescription: string;

  @Column({ nullable: true })
  lastLines: string;

  @ManyToOne(() => User)
  createdBy: Promise<User>;

  @ManyToOne(() => Service, service => service.versions)
  service: Promise<Service>;

  @Column()
  @Index()
  serviceId: string;

  @Column({ type: 'jsonb', nullable: true })
  testInstances: any[];

  @Column({ type: 'text', nullable: true })
  deploymentStatus: VersionDeploymentStatus;

  @Column({ nullable: true })
  deploymentStatusDescription: string;

  @Column({ nullable: true })
  bundleSize: number;

  @Column({ default: 0 })
  trafficPercentage: number;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deletedAt: Date;
}