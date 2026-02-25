import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.orders.create(req.user.id, dto);
  }

  @UseGuards(JwtGuard)
  @Get('my')
  my(@Req() req: any) {
    return this.orders.myOrders(req.user.id, req.user.role);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.orders.getByIdForUser(req.user.id, id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/accept')
  accept(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'provider') throw new Error('Somente prestador.');
    return this.orders.accept(req.user.id, id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/refuse')
  refuse(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'provider') throw new Error('Somente prestador.');
    return this.orders.refuse(req.user.id, id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/status/:status')
  setStatus(@Req() req: any, @Param('id') id: string, @Param('status') status: any) {
    return this.orders.setStatus(req.user.id, req.user.role, id, status);
  }
}