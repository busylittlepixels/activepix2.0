import * as fs from 'fs';

// Function to convert the JSON string to an object and extract the 'codeList'
function parseJsonString(jsonString: string): string[] {
    // Remove the surrounding quotes from the JSON string
    const cleanedJsonString = jsonString.slice(1, -1);

    // Parse the cleaned JSON string
    const parsedJson = JSON.parse(cleanedJsonString);

    // Return the codeList array
    return parsedJson.codeList;
}

// Function to convert hex to a byte array
function hexToByteArray(hex: string): number[] {
    // Remove the "0x" prefix
    hex = hex.replace(/^0x/, '');

    // Split the hex string into an array of bytes (2 hex digits per byte)
    let bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }

    return bytes;
}

// Function to convert the codeList to the old ArUco format
function convertArucoData(hexCodes: string[]): number[][][] {
    const convertedData: number[][][] = [];
    const gridSize = 5; // Assuming the grid is 5x4

    for (let hexCode of hexCodes) {
        let byteArray = hexToByteArray(hexCode);

        // Create a 2D array (5x4) filled with the byte values
        let matrix: number[][] = [];
        for (let i = 0; i < gridSize; i++) {
            matrix.push(byteArray.slice(i * 4, (i + 1) * 4));
        }

        convertedData.push(matrix);
    }

    return convertedData;
}

// Read the JSON string from the output file
const jsonString = fs.readFileSync('output.json', 'utf8');

// Parse the JSON string to extract the codeList
const hexCodes = parseJsonString(jsonString);

// Convert the codeList to the old ArUco format
const convertedArucoData = convertArucoData(hexCodes);

// Output the result (you can save it to a file or print it)
// console.log(JSON.stringify(convertedArucoData, null, 2));
//Output to file
fs.writeFileSync('numpyConversion.json', JSON.stringify(convertedArucoData, null, 2));
