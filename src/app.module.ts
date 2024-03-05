import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OsModule } from './os/os.module';

@Module({
  imports: [OsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
