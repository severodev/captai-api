FROM node:20-alpine AS deploy

ARG APP_NAME

LABEL app=${APP_NAME}

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN npm install --force && npm ci --force && npm run build

FROM node:20-alpine AS prod

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package* ./

RUN npm ci --force

# COPY . .

COPY --from=deploy /usr/src/app/dist ./dist

CMD ["node", "dist/main.js", "--trace-warnings"]
