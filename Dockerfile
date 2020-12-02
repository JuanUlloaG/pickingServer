FROM node:alpine

RUN apk add --no-cache tzdata

ENV TZ=America/Santiago

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

COPY ./dist .

EXPOSE 3000

CMD ["node","dist/app.js"]