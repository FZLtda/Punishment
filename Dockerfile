FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

# -----------------------------

FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

RUN addgroup -S nodejs && adduser -S node -G nodejs

USER node

COPY --from=builder --chown=node:node /app ./

CMD ["node", "src/index.js"]
