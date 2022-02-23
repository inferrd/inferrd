import { BaseEntity, Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Metric } from "./Metric";

@Entity()
export class MetricDataPoint extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Metric)
  metric: Promise<Metric>;

  @Column()
  @Index()
  metricId: string;

  @Column({ type: 'json' })
  data: Object;

  @Column({ type: 'json' })
  tags: Object;

  @CreateDateColumn({ type: 'timestamp' })
  @Index()
  createdAt: Date;
}