import { Injectable } from '@nestjs/common';
import * as osu from 'os-utils';
import * as di from 'node-disk-info';
import * as si from 'systeminformation';
import * as fs from 'fs';

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

  async getServerMemInfo() {
    const mem_info: si.Systeminformation.MemData = await si.mem();
    return {
      total: mem_info.total,
      free: mem_info.free,
      used: mem_info.used,
      available: mem_info.available,
    };
  }

  async getServerDiskInfo() {
    return di.getDiskInfo();
  }

  // "upTotal": 506490584,
  // "downTotal": 405200998,
  // "up": 0.97,
  // "down": 1.73,
  // "downPackets": 953271,
  // "upPackets": 991508,

  getServerNetwork() {
    const str = fs.readFileSync('/proc/net/dev', 'utf-8');
    const list = str
      .split('\n')
      .splice(2)
      .map((x) => {
        const rs = x.split(/\s+/);
        if(!rs[0]) rs.shift();
        if(!rs.length) return;        
        return {
          name: rs[0].slice(0,-1),
          downT: +rs[1],
          upT: +rs[9],
        }
      });
    return list.filter(x=>x);
  }
}
