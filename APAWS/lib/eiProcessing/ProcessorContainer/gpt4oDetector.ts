import * as fs from 'fs';
import * as path from 'path';
import { CodeDetector, CodeMap } from "./lib/CodeDetector";

import OpenAI from "openai";

export class GPT4ODetector extends CodeDetector {
    constructor(inputDirectory: string) {
        super('GPT4ODetector', inputDirectory)
    }

    async detectCodes() {
        console.log('Started detecting codes');
        console.log('key: ', process.env.OPENAI_API_KEY);
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('inputPath:', this.inputDirectory);

        // Get image files from directory
        const imageFiles = await this.getFilesFromDir(this.inputDirectory);
        console.log('Found image files:', imageFiles);

        const codeMap: CodeMap = {};

        // Process each image file
        for (const file of imageFiles) {
            const filePath = path.join(this.inputDirectory, file);
            const imageBuffer = fs.readFileSync(filePath);

            try {
                console.log(`Sending ${file} to GPT-4 for detection...`);
                //Convert to base64
                const base64Image = imageBuffer.toString('base64');
                const gpt4Response = await openai.chat.completions.create({
                    model:"gpt-4o-mini",
                    messages:[
                      {
                        "role": "user",
                        "content": [
                          {"type": "text", "text": "Your job is to detect the bib numbers in the provided image, returning them as a comma-separated list. Do not include any other information."},
                          {
                            "type": "image_url",
                            "image_url": {
                              "url": `data:image/png;base64,${base64Image}`,
                            },
                          },
                        ],
                      }
                    ],
                    max_tokens:1000,
                })

                // Parse GPT-4 response
                const gpt4Result = gpt4Response.choices[0]?.message?.content || '';
                const bibNumbers = gpt4Result
                    .split(',')
                    .map(num => parseInt(num.trim()))
                    .filter(num => !isNaN(num));

                // Save detected bib numbers in CodeMap
                codeMap[file] = bibNumbers;
                console.log(`Detected bib numbers in ${file}:`, bibNumbers);
                console.log(`From GPT response:`, gpt4Result);

            } catch (error) {
                console.error(`Failed to detect codes in ${file}:`, error);
            }
        }

        console.log('Detection complete');
        return codeMap;
    }

}