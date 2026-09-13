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

  // Función que calcula la semana actual (Ej: "2026-W37")
  private getCurrentWeekId(): string {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil(days / 7);
    return `${now.getFullYear()}-W${weekNumber}`;
  }

  private checkDeadline() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hours = now.getHours();

    if (dayOfWeek > 3 || (dayOfWeek === 3 && hours >= 0)) {
      throw new BadRequestException('El plazo de inscripción para este fin de semana está cerrado (Límite: Miércoles a las 00:00)');
    }
  }

  async submitMeal(userId: string, selection: any): Promise<MealSubmission> {
    // this.checkDeadline(); // Sigue comentado para poder probar

    const weekId = this.getCurrentWeekId();
    
    // CAMBIO 1: Buscamos dentro de la relación "user"
    let submission = await this.mealRepository.findOne({ 
      where: { user: { id: userId }, weekId } 
    });
    
    const qrToken = crypto.randomBytes(16).toString('hex');

    if (submission) {
      submission.selection = selection;
      submission.qrCodeToken = qrToken; // Renovamos el QR por seguridad
    } else {
      submission = this.mealRepository.create({
        user: { id: userId }, // CAMBIO 2: Lo asignamos como objeto relacionado
        weekId, 
        selection,
        qrCodeToken: qrToken,
      });
    }

    // Asegúrate de que tienes esto al final para que guarde los cambios en la BD
    return this.mealRepository.save(submission);
  }

  async getUserHistory(userId: string): Promise<MealSubmission[]> {
    return this.mealRepository.find({
      where: { userId },
      order: { weekId: 'DESC' } // Ordenamos de más reciente a más antigua
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