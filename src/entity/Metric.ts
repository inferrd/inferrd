import { BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column, ManyToOne, PrimaryGeneratedColumn, Entity } from "typeorm";
import { Service } from "./Service";

@Entity()
export class Metric extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: 'json' })
  tags: Object;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deletedAt: Date;
}