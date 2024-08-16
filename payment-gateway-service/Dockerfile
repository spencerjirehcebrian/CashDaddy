FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g typescript

RUN tsc

EXPOSE 3001

CMD ["node", "dist/server.js"]
