import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Order, User])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}