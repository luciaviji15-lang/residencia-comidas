import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealsService } from './meals.service.js';
import { MealsController } from './meals.controller.js';
import { MealSubmission } from './meal-submission.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([MealSubmission])],
  providers: [MealsService],
  controllers: [MealsController],
  exports: [MealsService],
})
export class MealsModule {}
