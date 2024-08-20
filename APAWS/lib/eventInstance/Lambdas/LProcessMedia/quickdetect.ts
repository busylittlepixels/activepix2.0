// import * as sharp from 'sharp';
// import {AR} from "./vendor/js-aruco2/src/aruco.js"
// import {alphaDictionary} from './AlphaDictionary'
// AR.DICTIONARIES.Alpha = JSON.parse(alphaDictionary);
// //Convert the code strings to hex numbers
// for(let i = 0; i < AR.DICTIONARIES.Alpha.codeList.length; i++){
//     AR.DICTIONARIES.Alpha.codeList[i] = parseInt(AR.DICTIONARIES.Alpha.codeList[i], 16);
// }
// const testImage = './test2.png';

// export type TMediaDetectionData = {
//     [key: number]: { //participantCode detected
//         //Any metadata about the detection
//         score?: number; //Rough 'score' of this image for this participant. Higher is better.
//         locations?: [
//             [number, number],
//             [number, number],
//             [number, number],
//             [number, number]
//         ][] // Array of bounding boxes, each represented by an array of 4 points
        
//     }
// }
// async function test(){
//     console.log('Testing');
//     // console.log(sharp)
//     //@ts-ignore
//     const image = await sharp.default(testImage);
    
//     const iBuffer = await image.rotate().png().toBuffer();
//     const iWidth = await image.metadata().then(metadata => metadata.width);
//     const iHeight = await image.metadata().then(metadata => metadata.height);

//     console.log(
//         'Width:', iWidth,
//         'Height:', iHeight,
//         'Buffer:', iBuffer
//     );
    
//     // console.log('Alpha dictionary loaded:', AR.DICTIONARIES);
//     const detector = new AR.Detector({
//         dictionaryName: 'Alpha',
//     });
//     let markers;
//     try {
//         console.log('detecting..."')
//         markers = detector.detect({
//             width:iWidth,
//             height: iHeight,
//             data: Uint8Array.from(iBuffer)
//         }) as {
//             id: number,
//             corners: [
//                 [number, number],
//                 [number, number],
//                 [number, number],
//                 [number, number]
//             ]
//         }[];
//         console.log('detected.')
//     } catch (e) {
//         return {
//             success: false,
//             message: 'Detection failed',
//             data: e
//         }
//     }
//     console.log('Detecting markers:', markers);

//     const detectionData: TMediaDetectionData = {};
//     markers.forEach(marker => {
//         detectionData[marker.id] = {
//             locations: [marker.corners]
//         }
//     });

//     console.log(detectionData);

// }
// test();

// setTimeout(()=>{},10000)