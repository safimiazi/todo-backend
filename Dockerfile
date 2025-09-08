# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Only generate Prisma client (NO migrate here)
RUN npx prisma generate

# Build the app
RUN npm run build


# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Run migrations when the container starts, before running the app
CMD npx prisma migrate deploy && node dist/src/main.js
