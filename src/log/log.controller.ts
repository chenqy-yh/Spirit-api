import { Controller, Get, Query } from '@nestjs/common';
import { LogService } from './log.service';

@Controller('log')
export class LogController {

    constructor(private readonly logService: LogService) { }

    @Get('get')
    getLog(@Query('type') type: string, @Query('p') page: number, @Query('s') size: number) {
        return this.logService.handleQueryLog(type, page, size)
    }


}
