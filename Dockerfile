FROM node:20-bookworm-slim AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
RUN npm ci

FROM dependencies AS build

COPY frontend ./frontend
RUN npm run build --workspace frontend

FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
RUN npm ci --omit=dev

COPY server ./server
COPY --from=build /app/frontend/dist ./frontend/dist

USER node
EXPOSE 8080
CMD ["npm", "start"]
