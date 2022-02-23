import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { User } from "./User";

enum AccountType {
  Github = 'github'
}

@Entity()
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ })
  type: AccountType;

  @OneToOne(() => User)
  createdBy: Promise<User>;

  @Column()
  authToken: string;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deletedAt: Date;
}