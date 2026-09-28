# Imagen de producción de la API (la usa Railway y docker compose --profile completo).
FROM node:22-slim AS base
# Prisma necesita OpenSSL para su motor de migraciones.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

FROM base AS construccion
COPY package.json pnpm-lock.yaml prisma.config.ts ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base AS ejecucion
ENV NODE_ENV=production
COPY --from=construccion /app/package.json /app/pnpm-lock.yaml /app/prisma.config.ts ./
COPY --from=construccion /app/prisma ./prisma
COPY --from=construccion /app/dist ./dist
RUN pnpm install --frozen-lockfile --prod
EXPOSE 3000
# Aplica las migraciones pendientes y luego arranca la API.
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]
