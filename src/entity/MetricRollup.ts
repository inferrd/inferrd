import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Metric } from "./Metric";

@Entity()
export class MetricRollup extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Metric)
  metric: Promise<Metric>;

  @Column()
  metricId: string;

  @Column({ type: 'timestamp' })
  day: Date;

  @Column({ type: 'json' })
  rollup: Object;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}