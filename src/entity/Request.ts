import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Service } from "./Service";
import { Version } from "./Version";

@Entity()
export class Request extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Service)
  service: Promise<Service>

  @Column()
  serviceId: string;

  @ManyToOne(() => Version)
  version: Promise<Version>
  
  @Column()
  versionId: string;

  @Column({ type: 'json' })
  requestBody: any;
  
  @Column({ type: 'json' })
  responseBody: any;

  @Column()
  responseStatus: number;

  @Column({ default: null, nullable: true })
  userId: string;

  @Column({ default: null, nullable: true })
  keyId: string;

  @Column()
  timingMs: number;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deletedAt: Date;
}