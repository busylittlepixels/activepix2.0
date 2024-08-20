FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production
RUN rm .env

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
ENV PUBLIC_GALLERY_DOMAIN="unset"
ENV PUBLIC_ADMIN_DOMAIN="unset"
ENV PUBLIC_CMS_DOMAIN="unset"
ENV PUBLIC_INGRESS_DOMAIN="undefined"
ENV PUBLIC_API_DOMAIN="unset"
CMD [ "node", "build" ]