import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ServiceType } from "./types";

@Entity()
export class Stack extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column()
  available: boolean;

  @Column({ nullable: true })
  humanReadableId: string;

  @Column({ default: ServiceType.ML })
  type: ServiceType;

  @Column()
  dockerUrl: string;

  @Column({ nullable: true })
  buildDockerUrl: string;

  @Column({ default: true })
  supportGpu: boolean;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deletedAt: Date;
}