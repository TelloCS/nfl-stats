FROM node:24-alpine3.23 AS node

WORKDIR /app/frontend

COPY --chown=node:node frontend/package*.json .

RUN npm ci

COPY --chown=node:node frontend/ .

#######################################################################
FROM node AS builder

RUN chown -R node:node /app

USER node

RUN npm run build

#######################################################################
FROM nginx:1.31.2-alpine3.23 AS prod

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

COPY nginx/ /etc/nginx/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]