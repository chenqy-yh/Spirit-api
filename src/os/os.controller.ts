import { Controller, Get, Query } from '@nestjs/common';
import * as fs from 'fs';
import { OsService } from './os.service';

@Controller('os')
export class OsController {
  constructor(private readonly osService: OsService) {}

  @Get('grt')
  getServerCurrentRecievedAndTransmit(@Query('path') path: string) {
    return fs.readFileSync(path, 'utf-8');
  }
  @Get('info')
  async getServerInfo() {
    console.log('getServerInfo');
    const disk_t = await this.osService.getServerDiskInfo();
    const cpu_t = await this.osService.getServerCpuInfo();
    const load_t = await this.osService.getServerLoadInfo();
    const mem_t = await this.osService.getServerMemInfo();
    return {
      timestamp: new Date().getTime(),
      cpu: cpu_t,
      load: load_t,
      mem: mem_t,
      disk: disk_t,
    };
  }
}
