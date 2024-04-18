import { HttpException, Injectable } from '@nestjs/common';
import * as fs from 'fs'
import { exec } from 'child_process'
import { } from 'stream'

const file_type = {
    '-': 'file',
    'd': 'dir',
    'l': 'link',
} as const

type ChunkInfo = {
    hash: string,
    index: number,
    chunk_hash: string,
    total: number
}

type MergeInfo = {
    hash: string,
    filename: string,
    total: number
    chunkSize: number
}


@Injectable()
export class FileService {


    /**
     * @description:  查询已完成的分片
     * @param {string} file_path
     * @param {string} file_hash
     * @param {number} total
     * @return {*}
     */
    async handleChunkCheck(file_path: string, file_hash: string, total: number) {
        const dir_path = file_path + '/' + file_hash
        if (!fs.existsSync(dir_path)) {
            return []
        }
        const finishedChunkList = fs.readdirSync(dir_path).map((chunk) => {
            const [_, index] = chunk.split('-')
            return parseInt(index)
        })
        return finishedChunkList
    }

    /**
     * @description:  处理分片合并
     * @param {string} path
     * @param {MergeInfo} content
     * @return {*}
     */
    async handleChunkMerge(path: string, content: MergeInfo) {
        // 将所有chunk读入到writeStream
        const tar_dir = path + '/' + content.hash
        const file_path = path + '/' + content.filename
        const chunkList = fs.readdirSync(tar_dir)
        const chunkSize = content.chunkSize
        chunkList.sort((a, b) => {
            return parseInt(a.split('-')[1]) - parseInt(b.split('-')[1])
        })
        const list = chunkList.map(async (path, i) => {
            const rpath = tar_dir + '/' + path
            const r = fs.readFileSync(rpath)
            const start = i * chunkSize
            const writeStream = fs.createWriteStream(file_path, {
                start: start,
            })
            writeStream.write(r)
        })
        await Promise.all(list)
        fs.rmSync(tar_dir, { recursive: true })
        return 'ok';
    }

    /**
     * @description:  处理文件上传
     * @param {Express.Multer.File} file
     * @param {string} path
     * @param {ChunkInfo} content
     * @return {*}
     */
    async handleFileUpload(file: Express.Multer.File, path: string, content: ChunkInfo) {
        const dir = path + '/' + content.hash
        if (!fs.existsSync(dir)) {
            await this.mkdir(dir)
        }
        return new Promise((resolve, reject) => {
            // 将file 写入path
            fs.writeFile(dir + '/' + content.chunk_hash, file.buffer, (err) => {
                if (err) {
                    console.log(err)
                    return reject(new HttpException('file path error', 400))
                }
                resolve('upload success')
            })
        })
    }

    /**
     * @description:  创建空文件
     * @param {string} path
     * @return {*}
     */
    async createEmptyFile(path: string) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, '', (err) => {
                if (err) return reject(new HttpException('file path error', 400))
                resolve('create success')
            })
        })
    }

    /**
     * @description:  创建文件夹
     * @param {string} path
     * @return {*}
     */
    async mkdir(path: string) {
        // 递归创建dir
        return new Promise((resolve, reject) => {
            fs.mkdir(path, { recursive: true }, (err) => {
                if (err) return reject(new HttpException('file path error', 400))
                resolve('mkdir success')
            })
        })
    }

    /**
     * @description:  移动文件
     * @param {string} src
     * @param {string} dest
     * @return {*}
     */
    async fileMove(src: string, dest: string) {
        // 检查目标路径是否存在
        if (!fs.existsSync(dest)) {
            return this.execShellCommand(`mv ${src} ${dest
                }`)
        } else {
            return new Error('目标路径已存在')
        }
    }


    /**
     * @description:  删除文件
     * @param {string} path
     * @return {*}
     */
    async delFile(path: string) {
        return new Promise((resolve, reject) => {
            fs.unlink(path, (err) => {
                if (err) return reject(new HttpException('file path error', 400))
                resolve('delete success')
            })
        })
    }

    /**
     * @description:  复制文件
     * @param {string} src
     * @param {string} dest
     * @return {*}
     */
    async copyFile(src: string, dest: string) {
        return new Promise((resolve, reject) => {
            fs.copyFile(src, dest, (err) => {
                if (err) return reject(new HttpException('file path error', 400))
                resolve('copy success')
            })
        })
    }


    /**
     * @description:  保存文件
     * @param {string} path
     * @param {string} content
     * @return {*}
     */
    async saveFile(path: string, content: string) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, content, (err) => {
                if (err) return reject(new HttpException('file path error', 400))
                resolve('save success')
            })
        })
    }

    /**
     * @description:  读取文件内容
     * @param {string} path
     * @return {*}
     */
    async fileContent(path: string) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    console.log(err)
                    return reject(new HttpException('file path error', 400))
                }
                resolve(data.toString())
            }
            )
        }
        )
    }


    /**
     * @description:  获取文件列表
     * @param {string} dir_path
     * @param {string} filter
     * @return {*}
     */
    async fileList(dir_path: string, filter: string = '') {
        console.log(dir_path, filter)
        return await this.readDir(dir_path, filter)
    }

    /**
     * @description:   读取文件夹
     * @param {string} path
     * @param {string} filter
     * @return {*}
     */
    readDir(path: string, filter: string): Promise<any[]> {
        console.log(path, filter)
        return this.execShellCommand(`ls -lA ${path} --time-style=long-iso`).then((stdout: string) => {
            const line = stdout.split('\n').slice(1, -1)
            const allFiles = line.map((l) => {
                const parts = l.split(/\s+/)
                return {
                    dir: parts[0].startsWith('d'),
                    type: file_type[parts[0][0]],
                    name: parts[7],
                    mode: parts[0],
                    owner: parts[2],
                    group: parts[3],
                    size: parts[0].startsWith('d') ? 0 : parseInt(parts[4]),
                    mtime: parts[5] + ' ' + parts[6],
                }
            })
            if (filter === '') return allFiles
            const filter_case = filter.trim().split(/\s+/)
            return allFiles.filter((f) => {
                return filter_case.every((fc) => {
                    return f.name.includes(fc)
                })
            })
        })
    }

    /**
     * @description:  获取文件信息
     * @param {string} path
     * @return {*}
     */
    lstat(path: string): Promise<fs.Stats> {
        return new Promise((resolve, reject) => {
            fs.lstat(path, (err, stats) => {
                if (err) return reject(new Error('file pathh error'))
                resolve(stats)
            })
        })
    }



    /**
     * @description:  执行shell命令
     * @param {string} cmd
     * @return {*}
     */
    execShellCommand = (cmd: string) => {
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) return reject(error)
                if (stderr) return reject(stderr)
                resolve(stdout)
            })
        })
    }


}
