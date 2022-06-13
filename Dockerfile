FROM node:18-alpine

WORKDIR /usr/app

COPY . .

RUN yarn --pure-lockfile \
  && yarn cache clean \
  && yarn run build \
  && rm -rf src 

CMD ["yarn", "start"]

EXPOSE 3000