FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY frontend/package*.json ./frontend/
COPY back-end/package*.json ./back-end/
RUN npm --prefix frontend ci && npm --prefix back-end ci
COPY frontend ./frontend
COPY back-end ./back-end
RUN npm --prefix frontend run build && npm --prefix back-end run build && npm --prefix back-end prune --omit=dev
FROM node:24-bookworm-slim
ENV NODE_ENV=production PORT=3000 DATA_DIR=/app/back-end/persistent-data DEMO_MODE=false
WORKDIR /app/back-end
COPY --from=build --chown=node:node /app/back-end ./
COPY --from=build --chown=node:node /app/frontend/dist /app/frontend/dist
RUN mkdir -p persistent-data && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node","dist/main.js"]
