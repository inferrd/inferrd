import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Invite } from "./Invite";
import { Key } from "./Key";
import { Service } from "./Service";
import { User } from "./User";

@Entity()
export class Team extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  emoji: string;

  @OneToMany(() => Invite, invite => invite.team)
  invites: Promise<Invite[]>;

  @OneToMany(() => Service, service => service.team)
  services: Promise<Service[]>;
  
  @OneToMany(() => Key, key => key.team)
  keys: Promise<Key[]>;

  @ManyToMany(() => User, user => user.teams)
  @JoinTable()
  users: Promise<User[]>;

  @ManyToOne(() => User)
  owner: Promise<User>;

  @Column({ nullable: true })
  stripeId: string;

  @Column({ nullable: false, default: 0 })
  balance: number;

  @Column({ nullable: false, default: 0 })
  credits: number;

  @Column({ nullable: true })
  defaultPaymentId: string;

  @Column({ default: 0 })
  creditBalance: number;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deletedAt: Date;

  async addUserToTeam(user: User): Promise<void> {
    const currentMembers = await this.users

    this.users = Promise.resolve([
      ...currentMembers,
      user
    ])

    await this.save()
  }
}