import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { OrdersModule } from './orders/orders.module';
import { ChatModule } from './chat/chat.module';

import { User } from './users/user.entity';
import { ProviderProfile } from './providers/provider-profile.entity';
import { Category } from './providers/category.entity';
import { ProviderCategory } from './providers/provider-category.entity';
import { Order } from './orders/order.entity';
import { Message } from './chat/message.entity';
import { Review } from './orders/review.entity';

import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '.env'),
        resolve(__dirname, '..', '..', '.env'),
        resolve(__dirname, '..', '..', '..', '.env'),
      ],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        // Render costuma usar DATABASE_URL (e às vezes algo como DATABASE_URL_INTERNAL)
        const databaseUrl =
          cfg.get<string>('DATABASE_URL') ||
          cfg.get<string>('DATABASE_URL_INTERNAL') ||
          cfg.get<string>('DATABASE_PUBLIC_URL');

        const entities = [
          User,
          ProviderProfile,
          Category,
          ProviderCategory,
          Order,
          Message,
          Review,
        ];

        // ✅ Se tiver DATABASE_URL, usa URL (Render / produção)
        if (databaseUrl) {
          const shouldUseSsl =
            cfg.get<string>('DB_SSL') === 'true' ||
            cfg.get<string>('NODE_ENV') === 'production' ||
            cfg.get<string>('RENDER') === 'true';

          console.log('[DB] Using DATABASE_URL (Render/Prod). SSL:', shouldUseSsl);

          return {
            type: 'postgres' as const,
            url: databaseUrl,
            // SSL só se necessário (na prática, Render geralmente precisa)
            ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
            entities,
            synchronize: true, // MVP. Produção ideal: migrations
            logging: false,
          };
        }

        // ✅ Local (vars antigas)
        const host = cfg.get<string>('DB_HOST') || 'localhost';
        const port = Number(cfg.get<string>('DB_PORT') || 5432);
        const username = cfg.get<string>('DB_USER') || 'postgres';
        const password = String(cfg.get<string>('DB_PASS') ?? '');
        const database = cfg.get<string>('DB_NAME') || 'postgres';

        console.log('[DB] Using local env vars:', { host, port, username, database });

        return {
          type: 'postgres' as const,
          host,
          port,
          username,
          password,
          database,
          entities,
          synchronize: true,
          logging: false,
        };
      },
    }),

    AuthModule,
    UsersModule,
    ProvidersModule,
    OrdersModule,
    ChatModule,
  ],

  // ✅ Aqui estava faltando no seu arquivo
  controllers: [HealthController],
})
export class AppModule {}