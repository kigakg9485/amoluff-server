
FROM node:20-alpine

WORKDIR /app

# نسخ ملفات package
COPY package*.json ./
RUN npm ci --only=production

# نسخ باقي الملفات
COPY . .

# بناء المشروع
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
