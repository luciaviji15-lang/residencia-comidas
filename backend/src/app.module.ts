import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module.js';
import { MealsModule } from './meals/meals.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://postgres.tyetcudedinqqzcdimkx:confiaEstrellaDorada@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false, // 👈 Esto desactiva el bloqueo del certificado
      },
    }),
    UsersModule,
    MealsModule,
    AuthModule,
  ],
})
export class AppModule {}