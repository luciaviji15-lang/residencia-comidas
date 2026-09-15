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

  
  private getCurrentWeekId(): string {
    const now = new Date(); // La fecha real
    const dayOfWeek = now.getDay();
   
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6); 

    const formatDate = (date: Date) => {
      const d = date.getDate().toString().padStart(2, '0');
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    };

    return `${formatDate(monday)} al ${formatDate(sunday)}`;
  }

  private checkDeadline() { 
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hours = now.getHours();


    if (dayOfWeek > 4 || (dayOfWeek === 4 && hours >= 0)) {
     
      throw new BadRequestException('El plazo de inscripción para este fin de semana está cerrado (Límite: Jueves a las 00:00)');
    } else {
      console.log("Aún está en plazo.");
    }
  }

  async submitMeal(userId: string, selection: any): Promise<MealSubmission> {
    this.checkDeadline(); 

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

  async getCurrentSubmission(userId: string): Promise<MealSubmission | null> {
    const weekId = this.getCurrentWeekId();
    
    return this.mealRepository.findOne({
      where: { user: { id: userId }, weekId }
    });
  }
  
}