import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  KTICHEN = 'KITCHEN'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  dni: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  roomNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ default: false })
  isVegan: boolean;

  @Column({ default: false })
  isCeliac: boolean;

  @Column({ default: false })
  lactoseIntolerant: boolean;

  @Column({ default: false })
  eggAlergic: boolean;

  @Column({ nullable: true })
  allergiesInfo: string; 

  @Column({ nullable: true })
  avatarUrl: string; // Aquí guardaremos el enlace a su foto

  @CreateDateColumn()
  createdAt: Date;
}
