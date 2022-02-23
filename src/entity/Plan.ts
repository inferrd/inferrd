import { BaseEntity, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column, OneToMany } from "typeorm";
import { Team } from "./Team";

export type PlanFeatures = {
  concierge: boolean;
  models: number;
  requests: number;
}

@Entity()
export class Plan extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  priceId: string;

  @Column({ type: 'json' })
  features: PlanFeatures;

  @OneToMany(() => Team, team => team.plan)
  teams: Promise<Team[]>;

  @Column({ nullable: true })
  trialDays: number;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deletedAt: Date;
}