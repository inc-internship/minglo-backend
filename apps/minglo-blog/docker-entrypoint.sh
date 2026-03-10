#!/bin/sh
set -e

echo "Running migrations..."
pnpm run migrate:minglo-blog:deploy

echo "Starting application..."
exec pnpm run start:minglo-blog:prod