import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OsModule } from './os/os.module';
import { WsModule } from './ws/ws.module';
import { LogModule } from './log/log.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [OsModule, WsModule, LogModule, FileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
