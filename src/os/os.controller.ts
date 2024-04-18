/*
 * @Date: 2024-04-05 14:01:11
 * @LastEditors: Chenqy
 * @LastEditTime: 2024-04-05 14:01:12
 * @FilePath: /monitor_client/src/os/os.controller.ts
 * @Description: True or False
 */
import { Controller, Get, Query } from '@nestjs/common';
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
    const tasks = await Promise.all([
      this.osService.getServerDiskInfo(),
      this.osService.getDiskDetail(),
      this.osService.getServerCpuInfo(),
      this.osService.getServerLoadInfo(),
      this.osService.getServerMemInfo() as Object,
      this.osService.getMemDetail() as Object,
      this.osService.getServerNetwork(),
      this.osService.getServerName(),
      this.osService.getServerBitLen(),
      this.osService.getServerProcs()]);
    return {
      timestamp: new Date().getTime(),
      cpu: tasks[2],
      load: tasks[3],
      mem: { ...tasks[4], ...tasks[5] },
      disk: tasks[0],
      disk_name: (tasks[1] as any).name,
      network: tasks[6],
      sname: (tasks[7] as any).sname,
      bit: (tasks[8] as any).bit,
      procs: (tasks[9] as any).procs,
    };

  }
}
