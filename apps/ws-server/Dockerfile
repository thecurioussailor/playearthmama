FROM node:lts-alpine

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

COPY apps/ws-server/package.json apps/ws-server/

RUN mkdir -p /packages/db
COPY packages/db/package.json /packages/db/
COPY packages/db/ /packages/db/

RUN pnpm install --frozen-lockfile

WORKDIR /app/packages/db
RUN pnpm prisma generate

WORKDIR /app
COPY apps/ws-server/ apps/ws-server/

RUN pnpm --filter ws-server run build

EXPOSE 3001

CMD [ "pnpm", "--filter", "ws-server", "run", "start" ]