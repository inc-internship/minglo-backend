#!/bin/sh
set -e

echo "Running migrations..."
pnpm run migrate:minglo-messanger-service:deploy

echo "Starting application..."
exec pnpm run start:minglo-messanger-service:prod