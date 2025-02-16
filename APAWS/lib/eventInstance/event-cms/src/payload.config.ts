import path from 'path'

import { payloadCloud } from '@payloadcms/plugin-cloud'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { slateEditor } from '@payloadcms/richtext-slate'
import { buildConfig } from 'payload/config'

import Users from './collections/Users'
import GalleryConfiguration from './globals/GalleryConfiguration'
import Media from './collections/Media'
import ParticipantData from './collections/ParticipantData'

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
  plugins: [payloadCloud()],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
    
    connectOptions: {
      useFacet: false,
    },
  }),
  endpoints: [
    {
      path: '/health',
      method: 'get',
      handler: (req, res) => {
        res.status(200).send('OK')
      },
    },
  ],
  cors: '*'
})
