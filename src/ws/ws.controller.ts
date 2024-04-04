import { Controller, Get, Query } from '@nestjs/common';
import { WsService } from './ws.service';

@Controller('ws')
export class WsController {

    constructor(
        private readonly wsService: WsService
    ) { }

    @Get('cws')
    createWebSocket() {
        return this.wsService.getPort()
    }

    // @Get('close')
    // closeWebSocket(@Query('port') port: number) {
    //     console.log('close port:', port);
    //     return this.wsService.closeWebSocket(port)
    // }

}
