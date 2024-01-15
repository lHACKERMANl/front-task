FROM node

WORKDIR front/
COPY . .

ENTRYPOINT ["npm", "start"]