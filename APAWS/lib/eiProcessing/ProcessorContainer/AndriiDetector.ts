import { CodeDetector, CodeMap } from "./lib/CodeDetector";
import { spawn } from 'child_process'
import * as path from "path";
import * as fs from "fs";
export class AndriiCodeDetector extends CodeDetector {
    private pythonEntryPoint: string = './vendor/AndriiAruco/detect_code.py'
    constructor(inputDirectory: string) {
        const absInputPath = path.resolve(inputDirectory)
        super('AndriiCodeDetector', absInputPath)
        console.log('AndriiCodeDetector created')
    }
    async detectCodes() {
        let inputPath = this.inputDirectory
        let workingDir = path.resolve(path.dirname(this.pythonEntryPoint))
        console.log('Started detecting codes')
        console.log('inputPath', inputPath)
        console.log('pythonEntryPoint', this.pythonEntryPoint)
        console.log('workingDir', workingDir)
        const isPyProcessFinished = new Promise((resolve, reject) => {
            console.log('Starting python process')
            const pyprocess = spawn('python', [this.pythonEntryPoint, inputPath, workingDir])
            pyprocess.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });
            pyprocess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
            pyprocess.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
                resolve(true)
            });
        })
        
        await isPyProcessFinished
        //Detector process finished, read the file from inputDirectory
        const outputFilePath = path.join(this.inputDirectory, 'AndriiDetectorOutput.json')
        //if the file does not exist, return empty object
        if(!fs.existsSync(outputFilePath)) {
            console.error('Output file does not exist')
            return {}
        }
        const outputFile = fs.readFileSync(outputFilePath, 'utf8')
        let output;
        try {
            output = JSON.parse(outputFile)
        } catch(e) {
            console.error('Failed to parse output file', e)
        }
        console.log('Finished detecting codes')
        if(!output.error || output.error === "undefined") {
            console.log('No error!')
        }
        console.log('output:', output)
        const codemap:CodeMap = {}
        output.scannedImages.forEach((image:any) => {
            const key = Object.keys(image)[0]
            const value = image[key]
            codemap[key] = value
        })
        return codemap
    }
}