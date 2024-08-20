import * as fs from 'fs'
import * as path from 'path'
export type CodeMap = {
    [key:string]: number[]
}
export class CodeDetector{
    constructor(
        private name:string,
        public inputDirectory: string,
    ){}

    async detectCodes() : Promise<CodeMap>{
        console.error('detectCodes() not implemented for', this.name)
        return {}
    }

    protected async getFilesFromDir(dirPath: string): Promise<string[]> {
        const files = fs.readdirSync(dirPath)
        const allowedExtensions = ['.png', '.jpg', '.jpeg']
        return files.filter(file => allowedExtensions.includes(path.extname(file).toLowerCase()))
    }
}