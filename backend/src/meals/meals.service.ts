import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealSubmission } from './meal-submission.entity.js'; // Asegúrate de quitar el .js si lo tenías
import * as crypto from 'crypto';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(MealSubmission)
    private readonly mealRepository: Repository<MealSubmission>,
  ) {}

  
  private getCurrentWeekId(): string { //Calcular semana actual
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil(days / 7);
    return `${now.getFullYear()}-W${weekNumber}`;
  }

  private checkDeadline() { //Ver si el plazo se ha pasado para hacer la ficha
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hours = now.getHours();

    if (dayOfWeek > 3 || (dayOfWeek === 3 && hours >= 0)) {
      throw new BadRequestException('El plazo de inscripción para este fin de semana está cerrado (Límite: Miércoles a las 00:00)');
    }
  }

  async submitMeal(userId: string, selection: any): Promise<MealSubmission> {
    //this.checkDeadline(); para probar y jugar lo voy a quitar

    const weekId = this.getCurrentWeekId();
    
    let submission = await this.mealRepository.findOne({ 
      where: { user: { id: userId }, weekId } 
    });
    
    const qrToken = crypto.randomBytes(16).toString('hex');

    if (submission) {
      submission.selection = selection;
      submission.qrCodeToken = qrToken; 
    } else {
      submission = this.mealRepository.create({
        user: { id: userId }, 
        weekId, 
        selection,
        qrCodeToken: qrToken,
      });
    }
    return this.mealRepository.save(submission);
  }

  async getUserHistory(userId: string): Promise<MealSubmission[]> {
    return this.mealRepository.find({
      where: { user: { id: userId } },
      order: { weekId: 'DESC' }
    });
  }

  async findAllSubmissions(): Promise<MealSubmission[]> {
    return this.mealRepository.find({
      relations: { user: true },
      order: { submittedAt: 'DESC' },
    });
  }

  async validateQr(qrToken: string): Promise<MealSubmission> {
    const submission = await this.mealRepository.findOne({
      where: { qrCodeToken: qrToken },
      relations: { user: true }
    });

    if (!submission) {
      throw new BadRequestException('Código QR no válido o no encontrado');
    }

    return submission;
  }

  
}