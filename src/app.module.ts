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
        const databaseUrl = cfg.get<string>('DATABASE_URL');

        // 🔥 SE ESTIVER NO RENDER -> USA DATABASE_URL
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: {
              rejectUnauthorized: false,
            },
            entities: [
              User,
              ProviderProfile,
              Category,
              ProviderCategory,
              Order,
              Message,
              Review,
            ],
            synchronize: true,
            logging: false,
          };
        }

        // 🔥 SE ESTIVER LOCAL -> USA VARIÁVEIS ANTIGAS
        return {
          type: 'postgres',
          host: cfg.get('DB_HOST'),
          port: Number(cfg.get('DB_PORT')),
          username: cfg.get('DB_USER'),
          password: String(cfg.get('DB_PASS') ?? ''),
          database: cfg.get('DB_NAME'),
          entities: [
            User,
            ProviderProfile,
            Category,
            ProviderCategory,
            Order,
            Message,
            Review,
          ],
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
})
export class AppModule {}