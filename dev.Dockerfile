FROM oven/bun:slim as dev

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install --production

COPY src src
COPY tsconfig.json .