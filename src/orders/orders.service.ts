import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { User } from '../users/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Message } from '../chat/message.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Message) private readonly messages: Repository<Message>,
  ) {}

  async create(clientUserId: string, dto: CreateOrderDto) {
    const client = await this.users.findOne({ where: { id: clientUserId } });
    if (!client) throw new BadRequestException('Cliente inválido.');
    if (client.role !== 'client') throw new ForbiddenException('Apenas cliente cria pedido.');

    const provider = await this.users.findOne({ where: { id: dto.providerUserId } });
    if (!provider) throw new BadRequestException('Prestador não encontrado.');
    if (provider.role !== 'provider') throw new BadRequestException('Usuário não é prestador.');

    const scheduledFor = dto.scheduledForIso ? new Date(dto.scheduledForIso) : null;

    const order = this.orders.create({
      client,
      provider,
      categoryName: dto.categoryName,
      description: dto.description,
      city: dto.city,
      state: dto.state,
      scheduledFor,
      status: 'new',
    });

    const saved = await this.orders.save(order);
    return this.serialize(saved);
  }

  async myOrders(userId: string, role: 'client' | 'provider') {
    if (role === 'client') {
      const list = await this.orders.find({
        where: { client: { id: userId } as any },
        order: { createdAt: 'DESC' } as any,
      });
      const out = [] as any[];
      for (const o of list) {
        const lastReadAt = o.clientLastReadAt ?? null;
        const unreadCount = await this.countUnread(o.id, userId, lastReadAt);
        out.push(this.serialize(o, { unreadCount }));
      }
      return out;
    }

    const list = await this.orders.find({
      where: { provider: { id: userId } as any },
      order: { createdAt: 'DESC' } as any,
    });
    const out = [] as any[];
    for (const o of list) {
      const lastReadAt = o.providerLastReadAt ?? null;
      const unreadCount = await this.countUnread(o.id, userId, lastReadAt);
      out.push(this.serialize(o, { unreadCount }));
    }
    return out;
  }

  private async countUnread(orderId: string, viewerUserId: string, lastReadAt: Date | null) {
    const qb = this.messages
      .createQueryBuilder('m')
      .where('m.order_id = :orderId', { orderId })
      .andWhere('m.sender_user_id <> :viewerUserId', { viewerUserId });

    if (lastReadAt) {
      qb.andWhere('m.createdAt > :lastReadAt', { lastReadAt });
    }

    return await qb.getCount();
  }

  async accept(providerUserId: string, orderId: string) {
    const o = await this.orders.findOne({ where: { id: orderId } });
    if (!o) throw new BadRequestException('Pedido não encontrado.');
    if (o.provider.id !== providerUserId) throw new ForbiddenException('Pedido não pertence a este prestador.');
    if (o.status !== 'new') throw new BadRequestException('Pedido não está em aberto.');

    o.status = 'accepted';
    await this.orders.save(o);
    return this.serialize(o);
  }

  async refuse(providerUserId: string, orderId: string) {
    const o = await this.orders.findOne({ where: { id: orderId } });
    if (!o) throw new BadRequestException('Pedido não encontrado.');
    if (o.provider.id !== providerUserId) throw new ForbiddenException('Pedido não pertence a este prestador.');
    if (o.status !== 'new') throw new BadRequestException('Pedido não está em aberto.');

    o.status = 'canceled';
    await this.orders.save(o);
    return this.serialize(o);
  }

  async setStatus(userId: string, role: 'client' | 'provider', orderId: string, status: OrderStatus) {
    const o = await this.orders.findOne({ where: { id: orderId } });
    if (!o) throw new BadRequestException('Pedido não encontrado.');

    const isOwnerClient = o.client.id === userId;
    const isOwnerProvider = o.provider.id === userId;
    if (!isOwnerClient && !isOwnerProvider) throw new ForbiddenException('Sem permissão neste pedido.');

    const allowed = new Set<OrderStatus>(['accepted', 'in_progress', 'done', 'canceled']);
    if (!allowed.has(status)) throw new BadRequestException('Status inválido.');

    if (status !== 'canceled' && role !== 'provider') {
      throw new ForbiddenException('Apenas prestador altera este status.');
    }

    o.status = status;
    await this.orders.save(o);
    return this.serialize(o);
  }

  async getByIdForUser(userId: string, orderId: string) {
    const o = await this.orders.findOne({ where: { id: orderId } });
    if (!o) throw new BadRequestException('Pedido não encontrado.');
    if (o.client.id !== userId && o.provider.id !== userId) throw new ForbiddenException('Sem acesso.');
    return this.serialize(o);
  }

  serialize(o: Order, extra?: { unreadCount?: number }) {
    return {
      id: o.id,
      client: { id: o.client.id, name: o.client.name },
      provider: { id: o.provider.id, name: o.provider.name },
      categoryName: o.categoryName,
      description: o.description,
      city: o.city,
      state: o.state,
      scheduledFor: o.scheduledFor,
      status: o.status,
      createdAt: o.createdAt,
      unreadCount: extra?.unreadCount ?? 0,
    };
  }
}