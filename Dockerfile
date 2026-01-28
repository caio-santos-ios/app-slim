# Mude de 18-alpine para 20-alpine
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Força o uso do webpack para gerar o sw.js (bolinha verde)
RUN npx next build --webpack

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]