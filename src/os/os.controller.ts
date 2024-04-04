import { Controller, Get, Query } from '@nestjs/common';
import * as fs from 'fs';
import { OsService } from './os.service';

@Controller('os')
export class OsController {
  constructor(private readonly osService: OsService) { }

  @Get('grt')
  getServerCurrentRecievedAndTransmit(@Query('path') path: string) {
    return this.osService.getServerNetwork();
  }
  @Get('info')
  async getServerInfo() {
    const disk_t = await this.osService.getServerDiskInfo();
    const disk_name = await this.osService.getDiskDetail();
    const cpu_t = await this.osService.getServerCpuInfo();
    const load_t = await this.osService.getServerLoadInfo();
    const mem_t = await this.osService.getServerMemInfo() as Object;
    const mem_info = await this.osService.getMemDetail() as Object;
    const network_t = await this.osService.getServerNetwork();
    const sname = await this.osService.getServerName();
    const bit_len = await this.osService.getServerBitLen();
    const procs = await this.osService.getServerProcs();
    return {
      timestamp: new Date().getTime(),
      cpu: cpu_t,
      load: load_t,
      mem: { ...mem_t, ...mem_info },
      disk: disk_t,
      disk_name: (disk_name as any).name,
      network: network_t,
      sname: (sname as any).sname,
      bit: (bit_len as any).bit,
      procs: (procs as any).procs,
    };
  }
}
