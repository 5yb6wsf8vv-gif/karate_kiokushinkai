FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3001
COPY --chown=node:node multiplayer ./multiplayer
COPY --chown=node:node shared ./shared
USER node
EXPOSE 3001
CMD ["node", "multiplayer/server.js"]
