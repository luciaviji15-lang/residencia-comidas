import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dni: string, password: string, roomNumber?: string, role: UserRole = UserRole.STUDENT): Promise<User> {
    const existingUser = await this.findByDni(dni);
    if (existingUser) {
      throw new ConflictException('El DNI ya está registrado en el sistema');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = this.userRepository.create({
      dni,
      passwordHash,
      roomNumber,
      role,
    });

    return this.userRepository.save(newUser);
  }

  async findByDni(dni: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { dni } });
  }

  async updateDiet(id: string, dietData: any) {
    // 1. EL CHIVATO: Vemos qué le está llegando de React
    console.log(`🛠️ ACTUALIZANDO USUARIO: ${id}`);
    console.log(`📦 DATOS RECIBIDOS:`, dietData);

    // 2. Guardamos en base de datos
    await this.userRepository.update(id, {
      isVegan: dietData.isVegan,
      isCeliac: dietData.isCeliac,
      lactoseIntolerant: dietData.lactoseIntolerant,
      eggAlergic : dietData.eggAlergic
 
    });

    // 3. Comprobamos cómo se ha quedado realmente en la base de datos
    const userUpdated = await this.userRepository.findOne({ where: { id } });
    console.log(`✅ USUARIO TRAS GUARDAR:`, userUpdated);
    
    return userUpdated;
  }
}
