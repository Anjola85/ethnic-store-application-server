FROM node:18

WORKDIR /quickmart/src/app

COPY package*.json ./

RUN npm install

COPY . .

COPY config/.env /quickmart/src/app

RUN npm run build

EXPOSE 7080

CMD ["node", "dist/main.js"]