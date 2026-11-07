#!/bin/sh
set -e

echo "Running migrations..."
pnpm run migrate:minglo-messenger-service:deploy

echo "Starting application..."
exec pnpm run start:minglo-messenger-service:prod