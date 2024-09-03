import path from 'path'

import { payloadCloud } from '@payloadcms/plugin-cloud'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { slateEditor } from '@payloadcms/richtext-slate'
import { buildConfig } from 'payload/config'
import { cloudStorage } from '@payloadcms/plugin-cloud-storage'
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'
import dotenv from 'dotenv'
dotenv.config()

console.log({
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_REGION: process.env.S3_REGION,
  S3_BUCKET: process.env.S3_BUCKET,
});
const adapter = s3Adapter({
  config: {
    // credentials: {
    //   accessKeyId: process.env.S3_ACCESS_KEY_ID,
    //   secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    // },
    region: process.env.S3_REGION,
    // ... Other S3 configuration
  },
  bucket: process.env.S3_BUCKET,
})


import Users from './collections/Users'
import GalleryConfiguration from './globals/GalleryConfiguration'
import Media from './collections/Media'
import ParticipantData from './collections/ParticipantData'



import AWS from 'aws-sdk';
const s3 = new AWS.S3();
const ingressBucket = process.env.INGRESS_S3_BUCKET;

console.log('INGRESS BUCKET:', ingressBucket);
const generateSignedUrls = (bucket, keys) => {
  return keys.map(key => {
    const params = { Bucket: bucket, Key: key, Expires: 60*60 };
    console.log('requesting signed url for:', key, 'with params', JSON.stringify(params, null, 2));
    return { key, url: s3.getSignedUrl('putObject', params) };
  });
};

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  editor: slateEditor({}),
  collections: [
    Users,
    Media,
    ParticipantData,
  ],
  globals: [
    GalleryConfiguration,
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [
    payloadCloud(),
    cloudStorage({
      enabled: process.env.NODE_ENV === 'production',
      collections: {
        'media': {
          adapter: adapter, // see docs for the adapter you want to use
        },
      },
    }),
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
    
    connectOptions: {
      useFacet: false,
    },
  }),
  rateLimit: {
    window: 60 * 1000,
    max: 10000,
    trustProxy: true,
  },
  endpoints: [
    {
      path: '/health',
      method: 'get',
      handler: (req, res) => {
        res.status(200).send('OK')
      },
    },

    /**
     * Get signed URLs for uploading media to S3
     * @body { keys: string[] } - Array of keys to generate signed URLs for
     * - Maximum of 1000 keys
     */
    {
      path: '/getUploadUrls',
      method: 'post',
      handler: async (req, res) => {
        const MAX_KEYS = 1000;
        const { keys } = req.body;
        
        if (!keys) {
          return res.status(400).send('Missing keys');
        }
        
        if(!Array.isArray(keys)) {
          return res.status(400).send('Keys must be an array of keys to get URLs for.');
        }

        if (keys.length > MAX_KEYS) {
          return res.status(400).send(`Maximum of ${MAX_KEYS} keys allowed`);
        }
        
        const signedUrls = generateSignedUrls(ingressBucket, (keys as string[]));
        res.status(200).json(signedUrls);
      },
    }
  ],
  cors: '*',
  // csrf: 
})
