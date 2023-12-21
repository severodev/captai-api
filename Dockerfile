FROM node:14.15.5-alpine3.11 AS deploy

ARG APP_NAME

LABEL app=${APP_NAME}

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN npm ci && npm run build

FROM node:14.15.5-alpine3.11 AS prod

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package* ./

RUN npm ci

# COPY . .

COPY --from=deploy /usr/src/app/dist ./dist

CMD ["node", "dist/main.js"]
