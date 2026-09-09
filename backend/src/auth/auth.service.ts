import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(dni: string, pass: string): Promise<any> {
    const user = await this.usersService.findByDni(dni);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(dni: string, pass: string) {
    const user = await this.validateUser(dni, pass);
    if (!user) {
      throw new UnauthorizedException('DNI o contraseña incorrectos');
    }

    const payload = { sub: user.id, dni: user.dni, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        dni: user.dni,
        role: user.role,
        roomNumber: user.roomNumber,
      },
    };
  }
}
