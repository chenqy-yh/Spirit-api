import { Injectable } from '@nestjs/common';
import * as osu from 'os-utils';
import * as di from 'node-disk-info';
import * as si from 'systeminformation';
import * as fs from 'fs';

// Intel(R) Xeon(R) Platinum 8255C CPU @ 2.50GHz * 1
// 1个物理CPU，4个物理核心，4个逻辑核心

@Injectable()
export class OsService {
  //cpu info
  async getServerCpuInfo() {
    const t1 = new Promise((res) => {
      osu.cpuUsage((v) => {
        res(v);
      });
    });
    const t2: Promise<si.Systeminformation.CpuData> = si.cpu();
    const query_task = await Promise.all([t1, t2]);
    const cpu_usage = query_task[0];
    const cpu_info = query_task[1];
    return {
      manufacturer: cpu_info.manufacturer,
      brand: cpu_info.brand,
      speed: cpu_info.speed,
      processors: cpu_info.processors,
      physical: cpu_info.physicalCores,
      performance: cpu_info.performanceCores,
      usage: cpu_usage,
    };
  }

  //   最近1/5/15分钟平均负载：
  // 0.55 / 0.29 / 0.18
  // 活动进程数 / 总进程数:
  // 1 / 124
  // load info
  async getServerLoadInfo() {
    const load_info_list = fs
      .readFileSync('/proc/loadavg', 'utf-8')
      .split(/\s+/);
    return {
      avload_1: load_info_list[0],
      avload_5: load_info_list[1],
      avload_15: load_info_list[2],
      active_total_per: load_info_list[3],
    };
  }

  //   可用：252 MB
  //   已用：2351 MB
  //   总内存：3693 MB
  //   available：1051MB

  async getServerMemInfo() {
    const mem_info: si.Systeminformation.MemData = await si.mem();
    return {
      total: mem_info.total,
      free: mem_info.free,
      used: mem_info.used,
      available: mem_info.available,
    };
  }

  //    * 挂载点：/
  // 共：68.78G，可用：45.66G，已用：20.22G
  // 未分配：48.56G
  // 文件系统：/dev/vda1
  // 类型：ext4，系统占用：2.9G
  async getServerDiskInfo() {
    return di.getDiskInfo(); 
  }
}
