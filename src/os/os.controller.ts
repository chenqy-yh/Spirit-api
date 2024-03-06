import { Controller, Get, Query } from '@nestjs/common';
import * as fs from 'fs';
import { OsService } from './os.service';

@Controller('os')
export class OsController {
  constructor(private readonly osService: OsService) {}

  @Get('grt')
  getServerCurrentRecievedAndTransmit(@Query('path') path: string) {
    return this.osService.getServerNetwork();
  }
  @Get('info')
  async getServerInfo() {
    const disk_t = this.osService.getServerDiskInfo();
    const cpu_t = this.osService.getServerCputInfo();
    const load_t = this.osService.getServerLoadInfo();
    const mem_t = this.osService.getServerMemInfo();
    const t_list = await Promise.all([cpu_t, load_t, mem_t, disk_t]);
    return {
      timestamp: new Date().getTime(),
      cpu: t_list[0],
      load: t_list[1],
      mem: t_list[2],
      disk: t_list[3],
    };
  }
}
