import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Service } from "./Service";

export enum ServiceStatusEnum {
  UP = 'UP',
  DOWN = 'DOWN',
  DEPLOYING_NEW_VERSION = 'DEPLOYING_NEW_VERSION',
  BLOCKED = 'BLOCKED',
  SPLIT_TRAFFIC = 'SPLIT_TRAFFIC'
}

@Entity()
export class ServiceStatus extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  status: ServiceStatusEnum;

  @Column()
  message: string;

  @ManyToOne(() => Service, service => service.statuses)
  service: Promise<Service>;

  @Column()
  @Index()
  serviceId: string;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deletedAt: Date;
}