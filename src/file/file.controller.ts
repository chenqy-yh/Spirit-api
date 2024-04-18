/*
 * @Date: 2024-03-31 12:32:48
 * @LastEditors: Chenqy
 * @LastEditTime: 2024-04-17 13:03:19
 * @FilePath: /monitor_client/src/file/file.controller.ts
 * @Description: True or False
 */
import { Body, Controller, Delete, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileService } from './file.service';
import { ExpressAdapter, FileInterceptor } from '@nestjs/platform-express';
import { File } from 'buffer';
import { Multer } from 'multer';

@Controller('file')
export class FileController {

    constructor(private readonly fileService: FileService) {
    }
    @Get('list')
    async fileList(@Query('path') path: string, @Query('filter') filter: string) {
        console.log('controller', path, filter)
        return await this.fileService.fileList(path, filter)
    }

    @Get('content')
    async fileContent(@Query('path') path: string) {
        return await this.fileService.fileContent(path)
    }

    @Post('save')
    async saveFile(@Body('path') path: string, @Body('content') content: string) {
        return await this.fileService.saveFile(path, content)
    }

    @Delete('del')
    async delFile(@Query('path') path: string) {
        return await this.fileService.delFile(path)
    }

    @Post('copy')
    async copyFile(@Body('src') src: string, @Body('dest') dest: string) {
        return await this.fileService.copyFile(src, dest)
    }

    @Post('move')
    async fileMove(@Body('src') src: string, @Body('dest') dest: string) {
        return await this.fileService.fileMove(src, dest)
    }

    @Post('mkdir')
    async mkdir(@Body('path') path: string) {
        return await this.fileService.mkdir(path)
    }

    @Post('mkfile')
    async mkfile(@Body('path') path: string) {
        return await this.fileService.createEmptyFile(path)
    }

    @Post('upload')
    // dest from query path
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file, @Query('path') path: string, @Body() body: any) {
        return await this.fileService.handleFileUpload(file, path, body)
    }

    @Post('chunkmerge')
    async chunkMerge(@Query('path') path, @Body() body: any) {
        return this.fileService.handleChunkMerge(path, body)
    }

    @Get('chunkcheck')
    async chunkCheck(@Query('path') path, @Query('hash') hash, @Query('total') total) {
        return this.fileService.handleChunkCheck(path, hash, total)
    }


}
