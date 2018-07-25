FROM bitnami/node:10-debian-9-master
WORKDIR /code/
COPY package*.json ./
RUN npm i
COPY . .
CMD ["npm", "start"]
