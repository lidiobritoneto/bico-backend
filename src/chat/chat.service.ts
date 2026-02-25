import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private readonly messages: Repository<Message>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async list(orderId: string, userId: string) {
    const order = await this.orders.findOne({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Pedido não encontrado.');
    if (order.client.id !== userId && order.provider.id !== userId) throw new ForbiddenException('Sem acesso ao chat.');

    // Marca como lido para o usuário que abriu o chat
    const now = new Date();
    if (order.client.id === userId) {
      order.clientLastReadAt = now;
    } else if (order.provider.id === userId) {
      order.providerLastReadAt = now;
    }
    await this.orders.save(order);

    const list = await this.messages.find({
      where: { order: { id: orderId } as any },
      order: { createdAt: 'ASC' } as any,
    });

    return list.map((m) => ({
      id: m.id,
      orderId: m.order.id,
      sender: { id: m.sender.id, name: m.sender.name },
      type: m.type,
      content: m.content,
      createdAt: m.createdAt,
    }));
  }

  async send(orderId: string, userId: string, content: string) {
    const order = await this.orders.findOne({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Pedido não encontrado.');
    if (order.client.id !== userId && order.provider.id !== userId) throw new ForbiddenException('Sem acesso ao chat.');

    const sender = await this.users.findOne({ where: { id: userId } });
    if (!sender) throw new BadRequestException('Usuário inválido.');

    const msg = this.messages.create({
      order,
      sender,
      type: 'text',
      content,
    });
    const saved = await this.messages.save(msg);

    return {
      id: saved.id,
      orderId: saved.order.id,
      sender: { id: saved.sender.id, name: saved.sender.name },
      type: saved.type,
      content: saved.content,
      createdAt: saved.createdAt,
    };
  }
}