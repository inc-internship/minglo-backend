#!/bin/sh
set -e

echo "Running migrations..."
pnpm run migrate:minglo-media-service:deploy

echo "Starting application..."
exec pnpm run start:minglo-media-service:prod