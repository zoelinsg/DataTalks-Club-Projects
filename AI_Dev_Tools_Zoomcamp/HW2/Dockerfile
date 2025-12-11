# === Base image（作業 Q6 可以填這個） ===
FROM node:20-alpine

# 工作目錄
WORKDIR /app

# 先複製 package.json / package-lock.json，讓 npm install 可以利用快取
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# 安裝 root + backend + frontend 相依
RUN npm install \
    && cd backend && npm install \
    && cd ../frontend && npm install

# 再把整個專案複製進去
COPY . .

# 對外開放 dev server 的 port
EXPOSE 5173 4000

# 啟動前後端（用你 root 的 script）
CMD ["npm", "run", "dev"]
