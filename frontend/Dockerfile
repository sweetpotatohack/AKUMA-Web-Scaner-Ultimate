FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем код
COPY . .

# Открываем порт
EXPOSE 3000

# Запускаем в dev режиме
CMD ["npm", "start"]
