import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity.js';

@Entity('meal_submissions')
export class MealSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  // ¡ESTA ES LA ÚNICA COLUMNA NUEVA!
  @Column({ default: '2026-W00' })
  weekId: string;

  @Column({ type: 'jsonb' })
  selection: {
    fridayDinner: boolean;
    saturdayLunch: boolean;
    saturdayDinner: boolean;
    sundayLunch: boolean;
    sundayDinner: boolean;
  };

  @Column({ unique: true })
  qrCodeToken: string;

  @CreateDateColumn()
  submittedAt: Date;
}