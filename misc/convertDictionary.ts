import * as fs from 'fs';
import * as yaml from 'yaml';

// Define the structure of the custom dictionary
interface CustomDictionary {
    nmarkers: number;
    markersize: number;
    maxCorrectionBits: number;
    [key: string]: any;
}

// Function to convert binary string to array of integers
const binaryStringToArray = (binaryString: string): number[] => {
    const byteArray: number[] = [];
    for (let i = 0; i < binaryString.length; i += 8) {
        const byte = binaryString.slice(i, i + 8);
        byteArray.push(parseInt(byte, 2));
    }
    return byteArray;
}

// Read and parse the YAML file
const filePath = 'customDictionary/old_code_dictionary.yaml';
const yamlContent = fs.readFileSync(filePath, 'utf8');
const parsedYaml: CustomDictionary = yaml.parse(yamlContent)['Custom Dictionary']

// Convert the parsed YAML to the desired format
const arucoDict = {
    nBits: parsedYaml.markersize * parsedYaml.markersize,
    tau: parsedYaml.maxCorrectionBits,
    codeList: [] as string[]
};

for (let i = 0; i < parsedYaml.nmarkers; i++) {
    const markerKey = `marker_${i}`;
    if (parsedYaml[markerKey]) {
        const markerBinaryString = parsedYaml[markerKey];
        //Convert binary string to hex string. Make sure 0x is included at the beginning
        const markerHex = '0x' + parseInt(markerBinaryString, 2).toString(16);
        arucoDict.codeList.push(markerHex);
        // console.log('Converted:', markerKey);
    } else {
        console.log('Key not found:', markerKey);
    }
}

// Output the result as a JSON string
const jsonString = JSON.stringify(arucoDict);
fs.writeFileSync('output.json', "'"+jsonString+"'");

console.log('Aruco dictionary converted and saved to output.json');