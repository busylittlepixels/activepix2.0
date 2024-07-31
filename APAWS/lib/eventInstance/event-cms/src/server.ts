import express from 'express'
import payload from 'payload'
import { onFirstRun } from './onFirstRun'

require('dotenv').config()
const app = express()

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})

const start = async () => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
  }).then(async (payload) => {
    await onFirstRun(payload)
  });

  // Add your own express routes here

  app.listen(80)
  console.log('Server running on port 80')
}

start()
