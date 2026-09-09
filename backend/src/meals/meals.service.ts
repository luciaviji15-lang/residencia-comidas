import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealSubmission } from './meal-submission.entity.js';
import * as crypto from 'crypto';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(MealSubmission)
    private readonly mealRepository: Repository<MealSubmission>,
  ) {}

  private checkDeadline() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hours = now.getHours();

    if (dayOfWeek > 3 || (dayOfWeek === 3 && hours >= 0)) {
      throw new BadRequestException('El plazo de inscripción para este fin de semana está cerrado (Límite: Miércoles a las 00:00)');
    }
  }

  async submitMeal(userId: string, selection: any): Promise<MealSubmission> {
    this.checkDeadline();

    let submission = await this.mealRepository.findOne({ where: { userId } });
    const qrToken = crypto.randomBytes(16).toString('hex');

    if (submission) {
      submission.selection = selection;
      submission.qrCodeToken = qrToken;
    } else {
      submission = this.mealRepository.create({
        userId,
        selection,
        qrCodeToken: qrToken,
      });
    }

    return this.mealRepository.save(submission);
  }

async findAllSubmissions(): Promise<MealSubmission[]> {
    return this.mealRepository.find({
      relations: { user: true },
      order: { submittedAt: 'DESC' },
    });
  }
}
