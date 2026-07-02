FROM node:20-bullseye
RUN apt-get update && apt-get upgrade -y && apt-get install -y tzdata git file curl
ENV TZ America/Chicago
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR /code/
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
CMD ["npm", "start"]
