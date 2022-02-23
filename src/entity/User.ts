import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Team } from "./Team";

export type UserAchievements = {
  CREATE_MODEL: boolean;
  SUCCESSFULL_DEPLOY: boolean;
  FIRST_INFERENCE: boolean;
  PAYMENT_DETAILS: boolean;
  INITIAL_CREDIT: boolean;
}

export type Features = {
  featureDrift?: boolean;
  splitTraffic?: boolean;
}

export type OnboardingState = {
  skippedAt?: Date;
  completedAt?: Date;
  serviceId?: string;
  versionId?: string;
  inferenceId?: string;
}

export enum AuthenticationService {
  EMAIL = 'email',
  PASSWORD = 'password',
  GOOGLE = 'google'
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @ManyToMany(() => Team, team => team.users)
  teams: Promise<Team[]>;

  @Column()
  apiKey: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  googleId: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ nullable: true, type: 'json' })
  achievements: UserAchievements;

  @Column({ nullable: true, type: 'json' })
  features: Features;

  @Column({ default: {}, type: 'json' })
  onboardingState: OnboardingState;

  @Column({ default: null, nullable: true })
  authenticationService: AuthenticationService;

  @CreateDateColumn({type: "timestamp"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamp"})
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp" })
  deletedAt: Date;
}