import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module.js';
import { MealsModule } from './meals/meals.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'residencia',
      autoLoadEntities: true, // Esto carga automáticamente las entidades que tengas en los módulos
      synchronize: true,     // Crea las tablas en la BD automáticamente
    }),
    UsersModule,
    MealsModule,
    AuthModule,
  ],
})
export class AppModule {}