#!/bin/sh
set -e

echo "Running migrations..."
pnpm run migrate:minglo-payment-service:deploy

echo "Starting application..."
exec pnpm run start:minglo-payment-service:prod