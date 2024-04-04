import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as osu from 'os-utils';
import * as si from 'systeminformation';

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

  getServerLoadInfo() {
    return this.execCommand('cat /proc/loadavg', (stdout) => {
      const lines = stdout.split('\n');
      const load_info = lines[0].split(/\s+/);
      return {
        one: load_info[0],
        five: load_info[1],
        fifteen: load_info[2],
        process: load_info[3],
        last_pid: load_info[4]
      }
    });
  }

  async getServerMemInfo() {
    return this.execCommand('free -m', (stdout) => {
      const lines = stdout.split('\n');
      const memory_info = lines[1].split(/\s+/);
      return {
        total: memory_info[1],
        used: memory_info[2],
        free: memory_info[3],
        shared: memory_info[4],
        buff_cache: memory_info[5],
        available: memory_info[6]
      }
    });
  }

  getServerDiskInfo() {
    return this.execCommand('df -h', (stdout) => {
      const lines = stdout.split('\n');
      // 去掉第一行和最后一行
      lines.shift(); lines.pop();
      const drive_info_list = lines.map(line => {
        const [filesystem,
          size,
          used,
          available,
          capacity,
          mountedOn]
          = line.split(/\s+/);

        return {
          filesystem,
          size,
          used,
          available,
          capacity,
          mountedOn
        }
      });
      return drive_info_list;
    });
  }

  getServerNetwork() {
    return this.execCommand('ifconfig | grep -v "inet6"', (stdout) => {
      const lines = stdout.split('\n');
      const nic_list = lines.reduce((acc, _, i, arr) => {
        if (!(i % 8)) {
          acc.push(arr.slice(i, i + 8));
        }
        return acc;
      }, []);
      nic_list.pop();
      let downT = 0;
      let upT = 0;
      const nic_info_list = nic_list.map(nic => {
        const rx = {
          packets: +nic[3].split(/\s+/)[3],
          bytes: +nic[3].split(/\s+/)[5],
        }
        const tx = {
          packets: +nic[5].split(/\s+/)[3],
          bytes: +nic[5].split(/\s+/)[5],
        }
        downT += rx.bytes;
        upT += tx.bytes;
        return {
          inet: nic[1].split(/\s+/)[2],
          mask: nic[1].split(/\s+/)[4],
          RX: rx,
          TX: tx,
        }
      })
      return {
        list: nic_info_list,
        downT,
        upT,
      };
    });
  }

  // 获取系统信息
  getServerName() {
    return this.execCommand('uname -a', (stdout) => {
      const lines = stdout.split('\n');
      lines.pop();
      const info = lines[0].split(/\s+/);
      return {
        sname: info[0] + ' ' + info[1]
      }
    })
  }

  getServerBitLen() {
    return this.execCommand('getconf LONG_BIT', (stdout) => {
      return {
        bit: stdout.slice(0, -1)
      }
    })
  }

  getServerProcs() {
    return this.execCommand('ps -e | wc -l', (stdout) => {
      return {
        procs: stdout.slice(0, -1)
      }
    })
  }

  getMemDetail() {
    return this.execCommand('dmidecode -t 17', (stdout) => {
      const lines = stdout.split('\n');
      lines.pop();
      return {
        size: lines.find(line => line.includes('Size')).split(/\s+/).reduce((acc, cur, i) => {
          if (i === 2 || i == 3) {
            return acc + cur
          }
          return acc
        }),
        type: lines.find(line => line.includes('Type')).split(/\s+/)[2]
      }
    })
  }

  getDiskDetail() {
    return this.execCommand('lshw -class disk', (stdout) => {
      const lines = stdout.split('\n');
      lines.pop();
      const info = lines[2].split(/\s+/);
      return {
        name: info[2] + lines[3],
      }
    })
  }


  execCommand(command: string, callback: (stdout: string) => void) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) return reject(error);
        if (stderr) return reject(stderr);
        resolve(callback(stdout));
      });
    });
  }
}
