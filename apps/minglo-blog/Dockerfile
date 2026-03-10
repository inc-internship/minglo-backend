# Check out https://hub.docker.com/_/node to select a new base image
FROM node:22-alpine
ARG port
ARG service
ENV SERVICE=$service
ENV PORT=$port
# Set to a non-root built-in user `node`

# включаем corepack и pnpm
RUN corepack enable

USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/dist/${SERVICE}

WORKDIR /home/node/dist/${SERVICE}

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)



COPY --chown=node package*.json ./

RUN pnpm install

# Bundle app source code
COPY --chown=node folder .

# Устанавливаем Prisma client
RUN pnpm run prisma:minglo-blog:generate:prod

RUN pnpm run build:${SERVICE}

# Bind to all network interfaces so that it can be mapped to the host OS

EXPOSE ${PORT}

CMD pnpm run 'start:minglo-blog:prod'
