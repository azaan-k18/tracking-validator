FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev
RUN npx playwright install --with-deps chromium

COPY . .

EXPOSE 5000

CMD ["npm", "run", "server"]
