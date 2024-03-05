import { Controller, Get, Query } from '@nestjs/common';
import * as fs from 'fs';

@Controller('os')
export class OsController {
  @Get('grt')
  getServerCurrentRecievedAndTransmit(@Query('path') path: string) {
    return fs.readFileSync(path, 'utf-8');
  }
}
