FROM node:16-bullseye-slim
WORKDIR /usr/src
COPY api .
COPY common /opt/nodejs
EXPOSE 80
CMD [ "npm", "start" ]