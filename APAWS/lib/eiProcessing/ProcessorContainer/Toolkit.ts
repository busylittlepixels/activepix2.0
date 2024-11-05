import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';
import { AndriiCodeDetector } from './AndriiDetector';
// // import cv2 from 'opencv4nodejs';
// import { DetectionStrategies } from './DetectionStrategies';

const sizes: {
    size: number;
    name: string;
}[] = [
    { size: 500, name: 'thumbnail' },
    { size: 2000, name: 'large' },
];

interface BasicContext {
    s3: AWS.S3;
    ddb: AWS.DynamoDB;
    processedBucket: string;
    ingressBucket: string;
    imageMetadataTable: string;
    participantMetadataTable: string;
}


interface ProcessImageContext extends BasicContext {
    ingressKey: string;
    workspacePath: string;
}
type ProcessImageFailure = {
    success: false;
    message: string;
    data?: any;
}
type ProcessImageSuccess = {
    success: true;
    message: string;
    data?: any;
}
type ProcessImageResult = ProcessImageFailure | ProcessImageSuccess;
export async function processImage(ctx: ProcessImageContext) : Promise<ProcessImageResult> {
    const params = {
        Bucket: ctx.ingressBucket,
        Key: ctx.ingressKey,
    };
    console.log('Getting object from S3', params);
    const data = await ctx.s3.getObject(params).promise()
    .then(data => {
        return data.Body
    })
    //Check data is a buffer
    if (!Buffer.isBuffer(data)) {
        return {
            success: false,
            message: 'Data is not a buffer',
            data
        }
    }

    //Convert to PNG and fix orientation
    console.log('Performing rotation fix and conversion to PNG');
    let imageBuffer = await sharp(data).rotate().png().toBuffer();
    let imageWidth = await sharp(data).metadata().then(metadata => metadata.width);
    let imageHeight = await sharp(data).metadata().then(metadata => metadata.height);


    if(!imageWidth || !imageHeight) {
        return {
            success: false,
            message: 'Could not get image dimensions',
        }
    }


    //Process the image while generating sizes
    //to be implemented.
    let participantCodesPromise = getParticipantCodes({
        // ibuffer: imageBuffer,
        // iWidth : imageWidth,
        // iHeight : imageHeight
        workspacePath: ctx.workspacePath,
    });

    //Generate sizes
    console.log('Generating image sizes');
    let imageSizes = await Promise.all(sizes.map(size => {
        return generateImageSize({
            s3: ctx.s3,
            ingressMediaKey: ctx.ingressKey,
            ingressMediaData: imageBuffer,
            processedBucket: ctx.processedBucket,
            size: size.size,
            sizeName: size.name,
        });
    }))

    //Save metadata
    console.log('Saving media metadata');

    function removeDuplicates(arr: number[]) {
        return Array.from(new Set(arr));
    }
    if(!(await participantCodesPromise).length) {
        // return {
        //     success: false,
        //     message: 'No participants detected in image',
        // }
        participantCodesPromise = Promise.resolve([-1]);
    }
    let metadataItem = {
        ingressKey: ctx.ingressKey,
        participantCodes: removeDuplicates(await participantCodesPromise),
        thumbnailKey: imageSizes.find(key => key.includes('thumbnail')) || '',
        fullsizeKey: imageSizes.find(key => key.includes('large')) || '',
    };
    // console.log()

    await ctx.ddb.putItem({
        TableName: ctx.imageMetadataTable,
        Item: {
            ingressKey: { S: ctx.ingressKey },
            participantCodes: { NS: metadataItem.participantCodes.map(code => code.toString()) },
            thumbnailKey: { S: metadataItem.thumbnailKey },
            fullsizeKey: { S: metadataItem.fullsizeKey },
        }
    }).promise();

    //Update participant data:
    /*
    PARTICIPANT DATA:
    {
        participantCode: number,
        ingressKeys: string[], // A list of ingress keys that the participant has been detected in.
    }
    */
    console.log('Updating participant data');
    let participantCodes = metadataItem.participantCodes;
    await Promise.all(participantCodes.map(async code => {
        let participantData = await ctx.ddb.getItem({
            TableName: ctx.participantMetadataTable,
            Key: { participantCode: { N: code.toString() } }
        }).promise();
        let ingressKeys = participantData?.Item?.ingressKeys.SS
            ? participantData.Item.ingressKeys.SS
            : [];
        ingressKeys.push(ctx.ingressKey);
        //Clear duplicates
        ingressKeys = Array.from(new Set(ingressKeys));
        
        await ctx.ddb.putItem({
            TableName: ctx.participantMetadataTable,
            Item: {
                participantCode: { N: code.toString() },
                ingressKeys: { SS: ingressKeys },
            }
        }).promise();
    }));
    


    console.log('Finishing up')
    return {
        success: true,
        message: 'Image processed successfully',
        data: {
            sizes: sizes.map(size => {
                return `${size.name}: ${size.size}px`;
            }),
            processedImages: imageSizes,
        }
    }
    

}


interface GenerateImageSizeContext {
    s3: AWS.S3;
    ingressMediaKey: string;
    ingressMediaData: Buffer;
    processedBucket: string;
    size: number; // Max width & height in px.
    sizeName: string; // E.g. 'thumbnail', 'fullsize', etc.
}
// This function will generate a new image with the specified size, upload it to the processed bucket, and return the key.
async function generateImageSize(ctx: GenerateImageSizeContext): Promise<string> {
    // Do the image resizing here.
    // Return the new image data.
    let ibuffer = sharp(ctx.ingressMediaData).resize(ctx.size, ctx.size, {
        fit: 'inside',
    }).png({quality: 70, force: true, compressionLevel: 8}).toBuffer();
    // Upload the new image to the processed bucket.
    let keyWithoutExtension = ctx.ingressMediaKey.split('.').slice(0, -1).join('.');
    let key = `${keyWithoutExtension}-${ctx.sizeName}.png`;
    let params = {
        Bucket: ctx.processedBucket,
        Key: key,
        Body: await ibuffer,
    };
    await ctx.s3.putObject(params).promise();
    return key;
}





// //DETECTION

interface GetParticipantCodesContext {
    // ibuffer: Buffer;
    // iWidth: number;
    // iHeight: number;
    workspacePath: string;
}

export async function getParticipantCodes(ctx: GetParticipantCodesContext): Promise<number[]> {
    // let detectionStrategy:keyof typeof DetectionStrategies = "alpha"
    // console.log('Running detection strategy :' + detectionStrategy);
    // const detectionResult = await DetectionStrategies[detectionStrategy]({
    //     iBuffer: ctx.ibuffer,
    //     iWidth: ctx.iWidth,
    //     iHeight: ctx.iHeight,
    // });

    // if (!detectionResult.success) {
    //     console.log('Detection failed:', detectionResult);
    //     throw new Error('Detection failed');
    // }

    // let participantCodes = Object.keys(detectionResult.data ?? []).map(key => parseInt(key));
    // console.log('Detected participant codes:', participantCodes);
    // return participantCodes;

    const detector = new AndriiCodeDetector(ctx.workspacePath)
    const codeMap = await detector.detectCodes()
    //TODO: Change for paralell processing
    try {
        let participantCodesForOnlyImage = codeMap[Object.keys(codeMap)[0]]
        if(!participantCodesForOnlyImage.length) {
            return [-1]
        }
        return participantCodesForOnlyImage
    } catch(e) {
        console.error('Failed to get participant codes from codeMap', e)
        return []
    }
}
