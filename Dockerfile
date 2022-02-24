FROM node:16-alpine

WORKDIR /usr/app

COPY package.json .

RUN yarn --pure-lockfile \
  && yarn cache clean \
  && yarn run build \
  && rm -rf src

COPY . .

CMD ["yarn", "start"]

EXPOSE 3000