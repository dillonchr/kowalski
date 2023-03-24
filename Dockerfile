FROM node:18.9-bullseye
RUN apt-get update && apt-get upgrade -y && apt-get install -y tzdata git file curl
ENV TZ America/Chicago
RUN ln -snf /usr/share/zoneinfo/$TZ /etclocaltime && echo $TZ > /etc/timezone
WORKDIR /code/
COPY package*.json ./
RUN npm i
COPY . .
CMD ["npm", "start"]
