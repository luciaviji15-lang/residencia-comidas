import { Controller, Post, Body, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UserRole } from './user.entity.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body('dni') dni: string,
    @Body('password') password: string,
    @Body('roomNumber') roomNumber?: string,
    @Body('role') role?: UserRole,
  ) {
    const user = await this.usersService.create(
      dni,
      password,
      roomNumber,
      role || UserRole.STUDENT,
    );

    return {
      message: 'Usuario registrado con éxito',
      userId: user.id,
      dni: user.dni,
      role: user.role,
    };
  }

  @Patch(':id/diet')
  async updateDiet(@Param('id') id: string, @Body() dietData: any) {
    return this.usersService.updateDiet(id, dietData);
  }
}
