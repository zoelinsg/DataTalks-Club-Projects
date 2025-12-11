FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm install \
    && cd backend && npm install \
    && cd ../frontend && npm install

COPY . .

EXPOSE 5173 4000

CMD ["npm", "run", "dev"]
