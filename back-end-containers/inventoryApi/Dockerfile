FROM node:16-bullseye-slim
WORKDIR /usr/src
COPY inventoryApi .
COPY common /opt/nodejs
EXPOSE 80
CMD [ "npm", "start" ]