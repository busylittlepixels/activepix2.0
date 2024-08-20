// import  './vendor/types/aruco'
import {AR} from "./vendor/js-aruco2/src/aruco.js"
//@ts-ignore



//Load alpha dictionary into AR
import {alphaDictionary} from './AlphaDictionary'
AR.DICTIONARIES.Alpha = JSON.parse(alphaDictionary);
export type TDetectionStrategyFailure = {
    message: string;
    success: false;
    data?: any;
}
export type TDetectionStrategySuccess = {
    message?: string;
    success: true;
    data?: TMediaDetectionData;
}
export type TDetectionStrategyResult = TDetectionStrategyFailure | TDetectionStrategySuccess;

export type TMediaDetectionData = {
    [key: number]: { //participantCode detected
        //Any metadata about the detection
        score?: number; //Rough 'score' of this image for this participant. Higher is better.
        locations?: [
            [number, number],
            [number, number],
            [number, number],
            [number, number]
        ][] // Array of bounding boxes, each represented by an array of 4 points
        
    }
}


export interface IDetectionStrategyContext {
    iWidth: number
    iHeight: number
    iBuffer: Buffer;
}

export type TDetectionStrategy = (ctx: IDetectionStrategyContext) => Promise<TDetectionStrategyResult>;



const DSTest = async (ctx: IDetectionStrategyContext): Promise<TDetectionStrategyResult> => {
    return {
        success: true,
        message: 'Test successful',
        data: {
            1: {
                score: 0,
                locations: [
                    [
                    [0, 0],
                    [0, 1],
                    [1, 1],
                    [1, 0]
                    ]
                ]
            },
            2: {
                score: 0,
                locations: [
                    [
                    [10, 0],
                    [10, 1],
                    [11, 1],
                    [11, 0]
                    ]
                ]
            },
            3: {
                score: 0,
                locations: [
                    [
                    [20, 0],
                    [20, 1],
                    [21, 1],
                    [21, 0]
                    ]
                ]
            },
            4: {
                score: 0,
                locations: [
                    [
                    [30, 0],
                    [30, 1],
                    [31, 1],
                    [31, 0]
                    ]
                ]
            },
            5: {
                score: 0,
                locations: [
                    [
                    [40, 0],
                    [40, 1],
                    [41, 1],
                    [41, 0]
                    ]
                ]
            },
        }
    }
}

//Used for most races, e.g. skoda
/*
** Alpha Detection Strategy
** Performs Aruco detection on the image using a custom dictionary.
*/
const DSAlpha = async (ctx: IDetectionStrategyContext): Promise<TDetectionStrategyResult> => {

    const {
        iWidth,
        iHeight,
        iBuffer
    } = ctx;

    const detector = new AR.Detector({
        dictionaryName: 'Alpha',
    });
    let markers;
    try {
        markers = detector.detect({
            width:iWidth,
            height: iHeight,
            data: Uint8Array.from(iBuffer)
        }) as {
            id: number,
            corners: [
                [number, number],
                [number, number],
                [number, number],
                [number, number]
            ]
        }[];
    } catch (e) {
        return {
            success: false,
            message: 'Detection failed',
            data: e
        }
    }

    const detectionData: TMediaDetectionData = {};
    markers.forEach(marker => {
        detectionData[marker.id] = {
            locations: [marker.corners]
        }
    });

    return {
        success: true,
        message: 'Detection successful',
        data: detectionData
    }
}
export const DetectionStrategies = {
    test: DSTest,
    alpha: DSAlpha
}
