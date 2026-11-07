# Check out https://hub.docker.com/_/node to select a new base image
FROM node:22-alpine
ARG port
ARG service
ENV SERVICE=$service
ENV PORT=$port

# включаем corepack и pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/dist/${SERVICE}

WORKDIR /home/node/dist/${SERVICE}

# Install app dependencies
COPY --chown=node package*.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Bundle app source code
COPY --chown=node . .

# Устанавливаем Prisma client
RUN pnpm run prisma:minglo-payment-service:generate:prod

RUN pnpm run build:${SERVICE}

# Migrate DB + run app
RUN sed -i 's/\r$//' ./apps/minglo-payment-service/docker-entrypoint.sh && \
      chmod +x ./apps/minglo-payment-service/docker-entrypoint.sh

# Bind to all network interfaces so that it can be mapped to the host OS
EXPOSE ${PORT}

ENTRYPOINT ["./apps/minglo-payment-service/docker-entrypoint.sh"]