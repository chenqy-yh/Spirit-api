import { Module } from '@nestjs/common';
import { WsController } from './ws.controller';
import { WsService } from './ws.service';

@Module({
  controllers: [WsController],
  providers: [WsService]
})
export class WsModule {}
