import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @UseGuards(JwtGuard)
  @Get(':orderId')
  list(@Req() req: any, @Param('orderId') orderId: string) {
    return this.chat.list(orderId, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Post(':orderId')
  send(@Req() req: any, @Param('orderId') orderId: string, @Body() dto: SendMessageDto) {
    return this.chat.send(orderId, req.user.id, dto.content);
  }
}