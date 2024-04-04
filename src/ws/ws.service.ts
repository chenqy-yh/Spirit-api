import { Injectable } from '@nestjs/common';
import * as net from 'net';
import * as pty from 'node-pty';
import * as WebSocket from 'ws';


const START_PORT = 4000;
const POOL_SIZE = 1000;

@Injectable()
export class WsService {
    private pool



    constructor() {
        this.init()
    }

    private init() {
        this.pool = Array.from({ length: POOL_SIZE }, (_, i) => i + START_PORT)
    }


    private checkPortUsed(port: number) {
        return new Promise((resolve, reject) => {
            let server = net.createServer().listen(port);
            server.on('listening', function () {
                server.close();
                resolve(false);
            });
            server.on('error', function (err: any) {
                if (err.code == 'EADDRINUSE') {
                    resolve(true);
                }
            });
        })
    }

    async getPort() {
        if (this.pool.length === 0) {
            return -1;
        }
        while (this.pool.length > 0) {
            const port = this.pool.shift();
            console.log('checkport:', port)
            // 检测本地端口是否被占用
            if (!await this.checkPortUsed(port)) {
                console.log('port:', port)
                this.createWsServer(port)
                return port
            }
        }
        return -1;
    }

    releasePort(port: number) {
        if (port < START_PORT || port > START_PORT + POOL_SIZE) {
            throw new Error('port must be between 4000 and 5000')
        }
        if (this.pool.includes(port)) {
            throw new Error('port already exists in pool')
        }
        if (this.pool.length > POOL_SIZE) {
            throw new Error('pool is full')
        }
        if (!/^\+?[1-9][0-9]*$/.test(port.toString())) {
            throw new Error('port must be a positive integer')
        }
        console.log('release port:', port)
        this.pool.push(port)
    }

    private createWsServer(port: number) {
        const wss = new WebSocket.Server({ port });
        wss.on('connection', (ws) => {
            ws.on('message', (res) => {
                shell.write(res);
            })

            ws.on('close', () => {
                this.releasePort(port)
                shell.kill()
            })


            const shell = pty.spawn('bash', [], {
                name: 'xterm-color',
                cwd: process.env.HOME,
                env: process.env
            });

            shell.onData((data) => {
                process.stdout.write(data);
                ws.send(data);
            });

            shell.onExit((code) => {
                console.log('Exited with code', code);

                shell.clear();
            });
        }
        )


    }

}
