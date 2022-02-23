FROM node:16-alpine

WORKDIR /usr/app

COPY . .
RUN yarn global add http-server-spa

CMD ["http-server-spa", "dist", "index.html", "3001"]

EXPOSE 3000