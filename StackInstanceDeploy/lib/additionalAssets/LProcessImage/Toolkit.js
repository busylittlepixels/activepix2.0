"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImage = void 0;
const sharp = require("sharp");
const sizes = [
    { size: 500, name: 'thumbnail' },
    { size: 2000, name: 'large' },
];
async function processImage(ctx) {
    const params = {
        Bucket: ctx.ingressBucket,
        Key: ctx.ingressKey,
    };
    console.log('Getting object from S3', params);
    const data = await ctx.s3.getObject(params).promise()
        .then(data => {
        return data.Body;
    });
    //Check data is a buffer
    if (!Buffer.isBuffer(data)) {
        return {
            success: false,
            message: 'Data is not a buffer',
            data
        };
    }
    //Convert to PNG and fix orientation
    console.log('Performing rotation fix and conversion to PNG');
    let imageBuffer = await sharp(data).rotate().png().toBuffer();
    //Process the image while generating sizes
    //to be implemented.
    let participantCodesPromise = getParticipantCodes({
        ibuffer: imageBuffer
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
    }));
    //Save metadata
    console.log('Saving metadata');
    let metadataItem = {
        ingressKey: ctx.ingressKey,
        participantCodes: await participantCodesPromise,
        thumbnailKey: imageSizes.find(key => key.includes('thumbnail')) || '',
        fullsizeKey: imageSizes.find(key => key.includes('large')) || '',
    };
    await ctx.ddb.putItem({
        TableName: ctx.metadataTable,
        Item: {
            ingressKey: { S: ctx.ingressKey },
            participantCodes: { NS: metadataItem.participantCodes.map(code => code.toString()) },
            thumbnailKey: { S: metadataItem.thumbnailKey },
            fullsizeKey: { S: metadataItem.fullsizeKey },
        }
    }).promise();
    //Save participant metadata
    console.log('Saving participant metadata');
    await Promise.all(metadataItem.participantCodes.map(async (code) => {
        //Update/create entries so that their current list of ingressKeys includes the new key.
        let currentKeys = [];
        try {
            let result = await ctx.ddb.updateItem({
                TableName: ctx.participantTable,
                Key: {
                    participantCode: { N: code.toString() },
                },
                UpdateExpression: 'ADD ingressKeys :newKey',
                ExpressionAttributeValues: {
                    ':newKey': { SS: [ctx.ingressKey] },
                },
                ReturnValues: 'UPDATED_NEW',
            }).promise();
            currentKeys = result.Attributes?.ingressKeys?.SS || [];
        }
        catch (e) {
            console.error('Failed to update participant metadata', e);
            return;
        }
        console.log(`Updated participant metadata for code ${code} to include ${ctx.ingressKey}. Current keys: ${currentKeys}`);
    }));
    console.log('All Metadata saved');
    console.log('Finishing up');
    return {
        success: true,
        message: 'Image processed successfully',
        data: {
            sizes: sizes.map(size => {
                return `${size.name}: ${size.size}px`;
            }),
            processedImages: imageSizes,
        }
    };
}
exports.processImage = processImage;
// This function will generate a new image with the specified size, upload it to the processed bucket, and return the key.
async function generateImageSize(ctx) {
    // Do the image resizing here.
    // Return the new image data.
    let ibuffer = sharp(ctx.ingressMediaData).resize(ctx.size, ctx.size).png({ quality: 80 }).toBuffer();
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
async function getParticipantCodes(ctx) {
    // Do the OCR here.
    // Return the participant codes.
    return [1, 2, 3, 4, 5];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9vbGtpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRvb2xraXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsK0JBQStCO0FBRS9CLE1BQU0sS0FBSyxHQUdMO0lBQ0YsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7SUFDaEMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7Q0FDaEMsQ0FBQztBQTJCSyxLQUFLLFVBQVUsWUFBWSxDQUFDLEdBQXdCO0lBQ3ZELE1BQU0sTUFBTSxHQUFHO1FBQ1gsTUFBTSxFQUFFLEdBQUcsQ0FBQyxhQUFhO1FBQ3pCLEdBQUcsRUFBRSxHQUFHLENBQUMsVUFBVTtLQUN0QixDQUFDO0lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM5QyxNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRTtTQUNwRCxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDVCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUE7SUFDcEIsQ0FBQyxDQUFDLENBQUE7SUFDRix3QkFBd0I7SUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUN6QixPQUFPO1lBQ0gsT0FBTyxFQUFFLEtBQUs7WUFDZCxPQUFPLEVBQUUsc0JBQXNCO1lBQy9CLElBQUk7U0FDUCxDQUFBO0lBQ0wsQ0FBQztJQUVELG9DQUFvQztJQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLCtDQUErQyxDQUFDLENBQUM7SUFDN0QsSUFBSSxXQUFXLEdBQUcsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFOUQsMENBQTBD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QUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hGLElBQUksR0FBRyxHQUFHLEdBQUcsbUJBQW1CLElBQUksR0FBRyxDQUFDLFFBQVEsTUFBTSxDQUFDO0lBQ3ZELElBQUksTUFBTSxHQUFHO1FBQ1QsTUFBTSxFQUFFLEdBQUcsQ0FBQyxlQUFlO1FBQzNCLEdBQUcsRUFBRSxHQUFHO1FBQ1IsSUFBSSxFQUFFLE1BQU0sT0FBTztLQUN0QixDQUFDO0lBQ0YsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN6QyxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFLRCxLQUFLLFVBQVUsbUJBQW1CLENBQUMsR0FBK0I7SUFDOUQsbUJBQW1CO0lBQ25CLGdDQUFnQztJQUNoQyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBV1MgZnJvbSAnYXdzLXNkayc7XHJcbmltcG9ydCAqIGFzIHNoYXJwIGZyb20gJ3NoYXJwJztcclxuXHJcbmNvbnN0IHNpemVzOiB7XHJcbiAgICBzaXplOiBudW1iZXI7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbn1bXSA9IFtcclxuICAgIHsgc2l6ZTogNTAwLCBuYW1lOiAndGh1bWJuYWlsJyB9LFxyXG4gICAgeyBzaXplOiAyMDAwLCBuYW1lOiAnbGFyZ2UnIH0sXHJcbl07XHJcblxyXG5pbnRlcmZhY2UgQmFzaWNDb250ZXh0IHtcclxuICAgIHMzOiBBV1MuUzM7XHJcbiAgICBkZGI6IEFXUy5EeW5hbW9EQjtcclxuICAgIHByb2Nlc3NlZEJ1Y2tldDogc3RyaW5nO1xyXG4gICAgaW5ncmVzc0J1Y2tldDogc3RyaW5nO1xyXG4gICAgbWV0YWRhdGFUYWJsZTogc3RyaW5nO1xyXG4gICAgcGFydGljaXBhbnRUYWJsZTogc3RyaW5nO1xyXG4gICAgXHJcbn1cclxuXHJcblxyXG5pbnRlcmZhY2UgUHJvY2Vzc0ltYWdlQ29udGV4dCBleHRlbmRzIEJhc2ljQ29udGV4dCB7XHJcbiAgICBpbmdyZXNzS2V5OiBzdHJpbmc7XHJcbn1cclxudHlwZSBQcm9jZXNzSW1hZ2VGYWlsdXJlID0ge1xyXG4gICAgc3VjY2VzczogZmFsc2U7XHJcbiAgICBtZXNzYWdlOiBzdHJpbmc7XHJcbiAgICBkYXRhPzogYW55O1xyXG59XHJcbnR5cGUgUHJvY2Vzc0ltYWdlU3VjY2VzcyA9IHtcclxuICAgIHN1Y2Nlc3M6IHRydWU7XHJcbiAgICBtZXNzYWdlOiBzdHJpbmc7XHJcbiAgICBkYXRhPzogYW55O1xyXG59XHJcbnR5cGUgUHJvY2Vzc0ltYWdlUmVzdWx0ID0gUHJvY2Vzc0ltYWdlRmFpbHVyZSB8IFByb2Nlc3NJbWFnZVN1Y2Nlc3M7XHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9jZXNzSW1hZ2UoY3R4OiBQcm9jZXNzSW1hZ2VDb250ZXh0KSA6IFByb21pc2U8UHJvY2Vzc0ltYWdlUmVzdWx0PiB7XHJcbiAgICBjb25zdCBwYXJhbXMgPSB7XHJcbiAgICAgICAgQnVja2V0OiBjdHguaW5ncmVzc0J1Y2tldCxcclxuICAgICAgICBLZXk6IGN0eC5pbmdyZXNzS2V5LFxyXG4gICAgfTtcclxuICAgIGNvbnNvbGUubG9nKCdHZXR0aW5nIG9iamVjdCBmcm9tIFMzJywgcGFyYW1zKTtcclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBjdHguczMuZ2V0T2JqZWN0KHBhcmFtcykucHJvbWlzZSgpXHJcbiAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICByZXR1cm4gZGF0YS5Cb2R5XHJcbiAgICB9KVxyXG4gICAgLy9DaGVjayBkYXRhIGlzIGEgYnVmZmVyXHJcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihkYXRhKSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnRGF0YSBpcyBub3QgYSBidWZmZXInLFxyXG4gICAgICAgICAgICBkYXRhXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vQ29udmVydCB0byBQTkcgYW5kIGZpeCBvcmllbnRhdGlvblxyXG4gICAgY29uc29sZS5sb2coJ1BlcmZvcm1pbmcgcm90YXRpb24gZml4IGFuZCBjb252ZXJzaW9uIHRvIFBORycpO1xyXG4gICAgbGV0IGltYWdlQnVmZmVyID0gYXdhaXQgc2hhcnAoZGF0YSkucm90YXRlKCkucG5nKCkudG9CdWZmZXIoKTtcclxuXHJcbiAgICAvL1Byb2Nlc3MgdGhlIGltYWdlIHdoaWxlIGdlbmVyYXRpbmcgc2l6ZXNcclxuICAgIC8vdG8gYmUgaW1wbGVtZW50ZWQuXHJcbiAgICBsZXQgcGFydGljaXBhbnRDb2Rlc1Byb21pc2UgPSBnZXRQYXJ0aWNpcGFudENvZGVzKHtcclxuICAgICAgICBpYnVmZmVyOiBpbWFnZUJ1ZmZlclxyXG4gICAgfSk7XHJcblxyXG4gICAgLy9HZW5lcmF0ZSBzaXplc1xyXG4gICAgY29uc29sZS5sb2coJ0dlbmVyYXRpbmcgaW1hZ2Ugc2l6ZXMnKTtcclxuICAgIGxldCBpbWFnZVNpemVzID0gYXdhaXQgUHJvbWlzZS5hbGwoc2l6ZXMubWFwKHNpemUgPT4ge1xyXG4gICAgICAgIHJldHVybiBnZW5lcmF0ZUltYWdlU2l6ZSh7XHJcbiAgICAgICAgICAgIHMzOiBjdHguczMsXHJcbiAgICAgICAgICAgIGluZ3Jlc3NNZWRpYUtleTogY3R4LmluZ3Jlc3NLZXksXHJcbiAgICAgICAgICAgIGluZ3Jlc3NNZWRpYURhdGE6IGltYWdlQnVmZmVyLFxyXG4gICAgICAgICAgICBwcm9jZXNzZWRCdWNrZXQ6IGN0eC5wcm9jZXNzZWRCdWNrZXQsXHJcbiAgICAgICAgICAgIHNpemU6IHNpemUuc2l6ZSxcclxuICAgICAgICAgICAgc2l6ZU5hbWU6IHNpemUubmFtZSxcclxuICAgICAgICB9KTtcclxuICAgIH0pKVxyXG5cclxuICAgIC8vU2F2ZSBtZXRhZGF0YVxyXG4gICAgY29uc29sZS5sb2coJ1NhdmluZyBtZXRhZGF0YScpO1xyXG4gICAgbGV0IG1ldGFkYXRhSXRlbSA9IHtcclxuICAgICAgICBpbmdyZXNzS2V5OiBjdHguaW5ncmVzc0tleSxcclxuICAgICAgICBwYXJ0aWNpcGFudENvZGVzOiBhd2FpdCBwYXJ0aWNpcGFudENvZGVzUHJvbWlzZSxcclxuICAgICAgICB0aHVtYm5haWxLZXk6IGltYWdlU2l6ZXMuZmluZChrZXkgPT4ga2V5LmluY2x1ZGVzKCd0aHVtYm5haWwnKSkgfHwgJycsXHJcbiAgICAgICAgZnVsbHNpemVLZXk6IGltYWdlU2l6ZXMuZmluZChrZXkgPT4ga2V5LmluY2x1ZGVzKCdsYXJnZScpKSB8fCAnJyxcclxuICAgIH07XHJcblxyXG4gICAgYXdhaXQgY3R4LmRkYi5wdXRJdGVtKHtcclxuICAgICAgICBUYWJsZU5hbWU6IGN0eC5tZXRhZGF0YVRhYmxlLFxyXG4gICAgICAgIEl0ZW06IHtcclxuICAgICAgICAgICAgaW5ncmVzc0tleTogeyBTOiBjdHguaW5ncmVzc0tleSB9LFxyXG4gICAgICAgICAgICBwYXJ0aWNpcGFudENvZGVzOiB7IE5TOiBtZXRhZGF0YUl0ZW0ucGFydGljaXBhbnRDb2Rlcy5tYXAoY29kZSA9PiBjb2RlLnRvU3RyaW5nKCkpIH0sXHJcbiAgICAgICAgICAgIHRodW1ibmFpbEtleTogeyBTOiBtZXRhZGF0YUl0ZW0udGh1bWJuYWlsS2V5IH0sXHJcbiAgICAgICAgICAgIGZ1bGxzaXplS2V5OiB7IFM6IG1ldGFkYXRhSXRlbS5mdWxsc2l6ZUtleSB9LFxyXG4gICAgICAgIH1cclxuICAgIH0pLnByb21pc2UoKTtcclxuXHJcbiAgICAvL1NhdmUgcGFydGljaXBhbnQgbWV0YWRhdGFcclxuICAgIGNvbnNvbGUubG9nKCdTYXZpbmcgcGFydGljaXBhbnQgbWV0YWRhdGEnKTtcclxuICAgIGF3YWl0IFByb21pc2UuYWxsKG1ldGFkYXRhSXRlbS5wYXJ0aWNpcGFudENvZGVzLm1hcChhc3luYyBjb2RlID0+IHtcclxuICAgICAgICAvL1VwZGF0ZS9jcmVhdGUgZW50cmllcyBzbyB0aGF0IHRoZWlyIGN1cnJlbnQgbGlzdCBvZiBpbmdyZXNzS2V5cyBpbmNsdWRlcyB0aGUgbmV3IGtleS5cclxuICAgICAgICBsZXQgY3VycmVudEtleXMgPSBbXTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gYXdhaXQgY3R4LmRkYi51cGRhdGVJdGVtKHtcclxuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogY3R4LnBhcnRpY2lwYW50VGFibGUsXHJcbiAgICAgICAgICAgICAgICBLZXk6IHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudENvZGU6IHsgTjogY29kZS50b1N0cmluZygpIH0sXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgVXBkYXRlRXhwcmVzc2lvbjogJ0FERCBpbmdyZXNzS2V5cyA6bmV3S2V5JyxcclxuICAgICAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAnOm5ld0tleSc6IHsgU1M6IFtjdHguaW5ncmVzc0tleV0gfSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBSZXR1cm5WYWx1ZXM6ICdVUERBVEVEX05FVycsXHJcbiAgICAgICAgICAgIH0pLnByb21pc2UoKTtcclxuICAgICAgICAgICAgY3VycmVudEtleXMgPSByZXN1bHQuQXR0cmlidXRlcz8uaW5ncmVzc0tleXM/LlNTIHx8IFtdO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHVwZGF0ZSBwYXJ0aWNpcGFudCBtZXRhZGF0YScsIGUpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGBVcGRhdGVkIHBhcnRpY2lwYW50IG1ldGFkYXRhIGZvciBjb2RlICR7Y29kZX0gdG8gaW5jbHVkZSAke2N0eC5pbmdyZXNzS2V5fS4gQ3VycmVudCBrZXlzOiAke2N1cnJlbnRLZXlzfWApO1xyXG4gICAgfSkpO1xyXG4gICAgY29uc29sZS5sb2coJ0FsbCBNZXRhZGF0YSBzYXZlZCcpO1xyXG4gICAgXHJcblxyXG5cclxuICAgIGNvbnNvbGUubG9nKCdGaW5pc2hpbmcgdXAnKVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxyXG4gICAgICAgIG1lc3NhZ2U6ICdJbWFnZSBwcm9jZXNzZWQgc3VjY2Vzc2Z1bGx5JyxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIHNpemVzOiBzaXplcy5tYXAoc2l6ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7c2l6ZS5uYW1lfTogJHtzaXplLnNpemV9cHhgO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgcHJvY2Vzc2VkSW1hZ2VzOiBpbWFnZVNpemVzLFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG5cclxufVxyXG5cclxuXHJcbmludGVyZmFjZSBHZW5lcmF0ZUltYWdlU2l6ZUNvbnRleHQge1xyXG4gICAgczM6IEFXUy5TMztcclxuICAgIGluZ3Jlc3NNZWRpYUtleTogc3RyaW5nO1xyXG4gICAgaW5ncmVzc01lZGlhRGF0YTogQnVmZmVyO1xyXG4gICAgcHJvY2Vzc2VkQnVja2V0OiBzdHJpbmc7XHJcbiAgICBzaXplOiBudW1iZXI7IC8vIE1heCB3aWR0aCAmIGhlaWdodCBpbiBweC5cclxuICAgIHNpemVOYW1lOiBzdHJpbmc7IC8vIEUuZy4gJ3RodW1ibmFpbCcsICdmdWxsc2l6ZScsIGV0Yy5cclxufVxyXG4vLyBUaGlzIGZ1bmN0aW9uIHdpbGwgZ2VuZXJhdGUgYSBuZXcgaW1hZ2Ugd2l0aCB0aGUgc3BlY2lmaWVkIHNpemUsIHVwbG9hZCBpdCB0byB0aGUgcHJvY2Vzc2VkIGJ1Y2tldCwgYW5kIHJldHVybiB0aGUga2V5LlxyXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUltYWdlU2l6ZShjdHg6IEdlbmVyYXRlSW1hZ2VTaXplQ29udGV4dCk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAvLyBEbyB0aGUgaW1hZ2UgcmVzaXppbmcgaGVyZS5cclxuICAgIC8vIFJldHVybiB0aGUgbmV3IGltYWdlIGRhdGEuXHJcbiAgICBsZXQgaWJ1ZmZlciA9IHNoYXJwKGN0eC5pbmdyZXNzTWVkaWFEYXRhKS5yZXNpemUoY3R4LnNpemUsIGN0eC5zaXplKS5wbmcoe3F1YWxpdHk6IDgwfSkudG9CdWZmZXIoKTtcclxuICAgIC8vIFVwbG9hZCB0aGUgbmV3IGltYWdlIHRvIHRoZSBwcm9jZXNzZWQgYnVja2V0LlxyXG4gICAgbGV0IGtleVdpdGhvdXRFeHRlbnNpb24gPSBjdHguaW5ncmVzc01lZGlhS2V5LnNwbGl0KCcuJykuc2xpY2UoMCwgLTEpLmpvaW4oJy4nKTtcclxuICAgIGxldCBrZXkgPSBgJHtrZXlXaXRob3V0RXh0ZW5zaW9ufS0ke2N0eC5zaXplTmFtZX0ucG5nYDtcclxuICAgIGxldCBwYXJhbXMgPSB7XHJcbiAgICAgICAgQnVja2V0OiBjdHgucHJvY2Vzc2VkQnVja2V0LFxyXG4gICAgICAgIEtleToga2V5LFxyXG4gICAgICAgIEJvZHk6IGF3YWl0IGlidWZmZXIsXHJcbiAgICB9O1xyXG4gICAgYXdhaXQgY3R4LnMzLnB1dE9iamVjdChwYXJhbXMpLnByb21pc2UoKTtcclxuICAgIHJldHVybiBrZXk7XHJcbn1cclxuXHJcbmludGVyZmFjZSBHZXRQYXJ0aWNpcGFudENvZGVzQ29udGV4dCB7XHJcbiAgICBpYnVmZmVyOiBCdWZmZXI7XHJcbn1cclxuYXN5bmMgZnVuY3Rpb24gZ2V0UGFydGljaXBhbnRDb2RlcyhjdHg6IEdldFBhcnRpY2lwYW50Q29kZXNDb250ZXh0KTogUHJvbWlzZTxudW1iZXJbXT4ge1xyXG4gICAgLy8gRG8gdGhlIE9DUiBoZXJlLlxyXG4gICAgLy8gUmV0dXJuIHRoZSBwYXJ0aWNpcGFudCBjb2Rlcy5cclxuICAgIHJldHVybiBbMSwyLDMsNCw1XTtcclxufSJdfQ==