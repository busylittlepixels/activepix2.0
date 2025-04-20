import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';
import { AndriiCodeDetector } from './AndriiDetector';
import { GPT4ODetector } from './gpt4oDetector';
// // import cv2 from 'opencv4nodejs';
// import { DetectionStrategies } from './DetectionStrategies';

const sizes: {
    size: number;
    name: string;
    overlayed?: boolean;
}[] = [
    { size: 500, name: 'thumbnail', overlayed:true},
    { size: 2000, name: 'large', overlayed:true},
    {
        size: 500, name: 'nooverlaythumb',
    },
    {
        size: 2000, name: 'nooverlaylarge',
    }
];

interface BasicContext {
    s3: AWS.S3;
    ddb: AWS.DynamoDB;
    processedBucket: string;
    ingressBucket: string;
    imageMetadataTable: string;
    participantMetadataTable: string;
    cmsEndpoint: string;
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
    //Fetch gallery configuration
    const galleryConfigReq = await fetch(ctx.cmsEndpoint + '/api/globals/galleryConfig?depth=3');
    const galleryConfig = await galleryConfigReq.json();

    // console.log('Gallery config fetched:', galleryConfig);

    let overlayPortraitMediaData:Buffer|null = null;
    let overlayLandscapeMediaData:Buffer|null = null;
    try {
        let overlayLandscapeMediaURL: string | undefined = ctx.cmsEndpoint + galleryConfig.overlayImageLandscape?.url
        let overlayPortraitMediaURL: string | undefined = ctx.cmsEndpoint + galleryConfig.overlayImagePortrait?.url
        console.log('Overlay landscape media URL:', overlayLandscapeMediaURL);
        console.log('Overlay portrait media URL:', overlayPortraitMediaURL);
        if(overlayLandscapeMediaURL) {
            let landscapeReq = await fetch(overlayLandscapeMediaURL).then(async res => {
                overlayLandscapeMediaData = Buffer.from(await res.arrayBuffer());
            })
        }
        if(overlayPortraitMediaURL) {
            let portraitReq = await fetch(overlayPortraitMediaURL).then(async res => {
                overlayPortraitMediaData = Buffer.from(await res.arrayBuffer());
            })
        }

        await Promise.all([overlayPortraitMediaData, overlayLandscapeMediaData])

        if(!overlayPortraitMediaData) {
            console.log('Failed to fetch portrait overlay media data, using landscape');
            overlayPortraitMediaData = overlayLandscapeMediaData;
        }
        if(!overlayLandscapeMediaData) {
            console.log('Failed to fetch landscape overlay media data, no overlay will be applied');
        }

    } catch(e) {
        console.error('Failed to fetch overlay media data', e)
        overlayPortraitMediaData = null;
    }
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
    console.log('Identifying image dimensions');
    let imageWidth = await sharp(data).metadata().then(metadata => metadata.width);
    let imageHeight = await sharp(data).metadata().then(metadata => metadata.height);

    if(!imageWidth || !imageHeight) {
        return {
            success: false,
            message: 'Could not get image dimensions',
        }
    }

    let isPortrait = imageHeight > imageWidth;
    console.log('Image dimensions:', imageWidth, imageHeight, isPortrait ? 'portrait' : 'landscape');

    console.log('Cropping source image to 1.5 aspect ratio');
    const landscapeAspectRatio = 1.5
    const portraitAspectRatio = 1.5

    let cropWidth = imageWidth;
    let cropHeight = imageHeight;

    
    if (isPortrait) {
        cropWidth = Math.round(imageHeight * portraitAspectRatio);
    } else {
        cropHeight = Math.round(imageWidth / landscapeAspectRatio);
    }

    // Ensure crop dimensions do not exceed original dimensions
        cropWidth = Math.min(cropWidth, imageWidth);
        cropHeight = Math.min(cropHeight, imageHeight);

    let cropX = Math.round((imageWidth - cropWidth) / 2);
    let cropY = Math.round((imageHeight - cropHeight) / 2);

    imageBuffer = await sharp(imageBuffer)
        .extract({ left: cropX, top: cropY, width: cropWidth, height: cropHeight })
        .toBuffer();

    //Apply new sizes
    imageWidth = cropWidth;
    imageHeight = cropHeight;

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
            overlayPortraitMediaData,
            overlayLandscapeMediaData,
            processedBucket: ctx.processedBucket,
            size: size.size,
            sizeName: size.name,
            overlayed: size.overlayed,
        });
    }))

    //Save metadata
    console.log('Saving media metadata');
    // let isPortrait = imageHeight > imageWidth;

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
        isPortrait,
        participantCodes: removeDuplicates(await participantCodesPromise),
        thumbnailKey: imageSizes.find(key => key.includes('thumbnail')) || '',
        fullsizeKey: imageSizes.find(key => key.includes('large')) || '',
    };
    // console.log()
    

    await ctx.ddb.putItem({
        TableName: ctx.imageMetadataTable,
        Item: {
            ingressKey: { S: ctx.ingressKey },
            isPortrait: { BOOL: metadataItem.isPortrait },
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
    overlayPortraitMediaData: Buffer | null;
    overlayLandscapeMediaData: Buffer | null;
    size: number; // Max width & height in px.
    sizeName: string; // E.g. 'thumbnail', 'fullsize', etc.
}
// This function will generate a new image with the specified size, upload it to the processed bucket, and return the key.
async function generateImageSize(
    ctx: GenerateImageSizeContext & { overlayed?: boolean }
): Promise<string> {
    // Resize the image to the target size
    let ibuffer = await sharp(ctx.ingressMediaData)
        .resize(ctx.size, ctx.size, {
            fit: 'inside',
        })
        .png({ quality: 70, force: true, compressionLevel: 8 })
        .toBuffer();

    // Apply the overlay if required
    if (ctx.overlayed && (ctx.overlayPortraitMediaData || ctx.overlayLandscapeMediaData)) {
        console.log(`Applying overlay for size: ${ctx.sizeName}`);

        // Get metadata of the resized image
        const imageMetadata = await sharp(ibuffer).metadata();

        if (!imageMetadata.width || !imageMetadata.height) {
            throw new Error("Unable to retrieve image dimensions for overlay application.");
        }

        // Determine orientation and select the appropriate overlay
        const isPortrait = imageMetadata.height > imageMetadata.width;
        const overlayBuffer = isPortrait
            ? ctx.overlayPortraitMediaData
            : ctx.overlayLandscapeMediaData;

        if (overlayBuffer) {
            console.log(`Overlay found for size: ${ctx.sizeName}`);
            const overlayMetadata = await sharp(overlayBuffer).metadata();

            if (overlayMetadata.width && overlayMetadata.height) {

                // Scale the overlay to match the image width while maintaining aspect ratio
                const overlayWidth = imageMetadata.width;
                const overlayHeight = Math.round(
                    (overlayMetadata.height / overlayMetadata.width) * overlayWidth
                );

                let overlayResized = await sharp(overlayBuffer)
                    .resize(overlayWidth, overlayHeight, {
                        fit: 'inside',
                    })
                    .toBuffer();

                //Resize the overlay to make sure it fits within the target image's bounds
                if (overlayHeight > imageMetadata.height) {
                    overlayResized = await sharp(overlayResized)
                        .resize({
                            height: imageMetadata.height,
                            fit: 'inside',
                        })
                        .toBuffer();
                }

                // Composite the overlay onto the resized image
                ibuffer = await sharp(ibuffer)
                    .composite([{ input: overlayResized, gravity: 'south' }])
                    .png({ quality: 70, compressionLevel: 8 })
                    .toBuffer();
            } else {
                console.warn('Overlay metadata missing; skipping overlay application');
            }
        } else {
            console.warn('No suitable overlay available; skipping overlay application');
        }
    } else {
        console.log('ctx.overlayed', ctx.overlayed)
        console.log(`No overlay required for size: ${ctx.sizeName}, or overlay data missing`);
    }

    // Upload the new image to the processed bucket
    const keyWithoutExtension = ctx.ingressMediaKey.split('.').slice(0, -1).join('.');
    const key = `${keyWithoutExtension}-${ctx.sizeName}.png`;
    const params = {
        Bucket: ctx.processedBucket,
        Key: key,
        Body: ibuffer,
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
    // const detectors = {
    //     'AndriiCodeDetector': new AndriiCodeDetector(ctx.workspacePath),
    //     'GPT4ODetector': new GPT4ODetector(ctx.workspacePath),
    // }
    // const detector = new AndriiCodeDetector(ctx.workspacePath)
    // const codeMap = await detector.detectCodes()
    const detector = new GPT4ODetector(ctx.workspacePath)
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
