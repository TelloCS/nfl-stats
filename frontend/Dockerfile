FROM node:22-slim AS node

WORKDIR /app/frontend

COPY --chown=node:node package*.json .

RUN npm install

COPY --chown=node:node . .

EXPOSE 5173

#######################################################################
FROM node AS dev

RUN chown -R node:node /app

USER node

CMD ["npm", "run", "dev", "--", "--host"]

#######################################################################
FROM node AS builder

COPY --chown=node:node . .

RUN npm run build

#######################################################################
FROM nginx:1.25-alpine AS prod

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]