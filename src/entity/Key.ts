import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Team } from "./Team";
import { User } from "./User";

@Entity()
export class Key extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Team, team => team.keys)
  team: Promise<Team>;
  
  @Column()
  teamId: string;

  @ManyToOne(() => User)
  createdBy: Promise<User>;

  @Column({ nullable: true })
  isDeactivated: Date;

  @Column()
  name: string;

  @Column()
  hash: string;

  @Column("text", { array: true })
  roles: string[];

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deletedAt: Date;
}