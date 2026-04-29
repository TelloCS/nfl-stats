FROM node:22-alpine AS node

WORKDIR /app/frontend

COPY --chown=node:node package*.json .

RUN npm ci

COPY --chown=node:node . .

EXPOSE 5173

#######################################################################
FROM node AS dev

RUN chown -R node:node /app

USER node

CMD ["npm", "run", "dev", "--", "--host"]