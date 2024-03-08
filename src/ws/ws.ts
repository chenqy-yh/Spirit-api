import { Logger } from '@nestjs/common';
import * as pty from 'node-pty';
import * as WebSocket from 'ws';

export const setupWsServer = () => {
    const wss = new WebSocket.Server({ port: 4001 });


    wss.on('connection', (ws) => {
        Logger.log('ws connected');

        ws.on('message', (res) => {
            shell.write(res);
        })

        // 创建一个伪终端
        const shell = pty.spawn('bash', [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.env.HOME,
            env: process.env
        });

        shell.onData((data) => {
            process.stdout.write(data);
            ws.send(data);
        });

        shell.onExit((code) => {
            console.log('Exited with code', code);
        });

    })


}

