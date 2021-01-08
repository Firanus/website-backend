FROM node:erbium-alpine AS build

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
COPY tsconfig.json /app/tsconfig.json
COPY src /app/src/

WORKDIR /app
RUN yarn
RUN yarn build

FROM node:erbium-alpine

COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/yarn.lock /app/yarn.lock
COPY --from=build /app/dist /app/dist/

WORKDIR /app
RUN yarn --production

EXPOSE 5000

CMD ["yarn", "start"]
