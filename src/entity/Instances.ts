import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Instance extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  monthlyPrice: number;

  @Column()
  cpuHrtz: number;

  @Column({ default: false })
  enableGpu: boolean;

  @Column({ default: false })
  requiresPaymentMethod: boolean;

  @Column()
  ramMb: number;

  @Column({ default: true })
  available: boolean;

  @Column({ nullable: true })
  maxBundleSizeMb: number;

  @Column({ nullable: true })
  maxRequests: number;

  @Column({ nullable: true })
  priceId: string;

  @Column({ default: 0 })
  trialDays: number;

  @Column({ default: 'gpu1' })
  datacenter: string;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deletedAt: Date;
}