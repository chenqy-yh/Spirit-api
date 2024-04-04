import { Injectable } from '@nestjs/common';
import * as fs from 'fs'
import * as readline from 'readline'

const READ_LIMIT = 1 * 1024 * 1024; // 1MB

@Injectable()
export class LogService {
    private log = new Map<string, string[]>()


    constructor() {
        this.initLog()
    }

    initLog() {
        this.initMysqlLog()
        this.initNginxLog()
    }

    async initMysqlLog() {
        this.handleLog('mysql', '/var/lib/mysql/VM-8-11-centos.log', 3)
    }

    async initNginxLog() {
        this.handleLog('nginx', '/usr/local/nginx/logs/access.log', 0)
    }


    async handleQueryLog(type: string, page: number, size: number) {
        const start = (page - 1) * size
        const end = page * size
        return {
            total: Math.ceil(this.log.get(type).length / size),
            data: this.log.get(type).slice(start, end)
        }
    }

    async handleLog(type, address, header_cnt) {
        const { size } = fs.statSync(address)
        const total = Math.ceil(size / READ_LIMIT)
        const fileStream = fs.createReadStream(address, {
            encoding: 'utf8',
            start: (total - 1) * READ_LIMIT,
            end: total * READ_LIMIT
        });

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        })
        const lines = []
        let drop_cnt = size < READ_LIMIT ? header_cnt : 1
        for await (const line of rl) {
            if (drop_cnt > 0) {
                drop_cnt--
                continue
            }
            lines.push(line)
        }
        this.log.set(type, lines.reverse())
    }

}
