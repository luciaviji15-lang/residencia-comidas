import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MealsService } from './meals.service.js';

@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post('submit')
  async submitMeal(@Body() body: { userId: string; selection: any }) {
    return this.mealsService.submitMeal(body.userId, body.selection);
  }

  @Get('admin/summary')
  async getMealSummary() {
    return this.mealsService.findAllSubmissions();
  }

  @Get('history/:userId')
  async getUserHistory(@Param('userId') userId: string) {
    return this.mealsService.getUserHistory(userId);
  }

  @Get('admin/all')
  async getAllSubmissions() {
    return this.mealsService.findAllSubmissions();
  }

  @Get('validate/:qrToken')
  async validateQr(@Param('qrToken') qrToken: string) {
    return this.mealsService.validateQr(qrToken);
  }
}
