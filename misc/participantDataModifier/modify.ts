//Take data.csv
//For each row, run modify(row)
import fs from 'fs';
import CsvReadableStream from 'csv-reader';
import qs from 'querystring';

const filepath = 'data.csv';=


let cmsurl = 'https://cms.naas10k.races.activepix.com/api';
async function modify(row) {
    //Get B64 encoded participant number from 'participantCode' URL parameter
    const participantCode = atob(decodeURIComponent(row.participantCode));
    //Parse participant number to integer
    const participantNumber = parseInt(participantCode);

    if(isNaN(participantNumber)){
        throw new Error("Invalid participant code");
    }

    try{
        //Get current participant data if it exists:
        const query = qs.stringify({
            where: {
                participantCode: {
                    equals: participantNumber
                }
            }
        });
        const participantData = await fetch(cmsurl + '/participantdata?' + query).then(res => res.json()).then(data => data?.docs[0]);
        console.log('participantData', participantData);
        if(participantData) {
            
        }


}

const promises = [];

let inputStream = fs.createReadStream(filepath, 'utf8')
inputStream
    .pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
    .on('data', function (row) {
        promises.push(modify(row));
    })
    .on('end', function (data) {
        console.log('No more rows!');
    });
//Wait for all promises to resolve
await Promise.all(promises);

