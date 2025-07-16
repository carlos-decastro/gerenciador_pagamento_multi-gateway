#!/bin/sh

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
while ! nc -z mysql 3306; do
  sleep 1
done
echo "MySQL is ready!"

# Create database if it doesn't exist
echo "Creating database if it doesn't exist..."
mysql -h mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS gerenciador_pagamentos;" 2>/dev/null || echo "Database creation failed, but continuing..."

# Run migrations
echo "Running migrations..."
node ace.js migration:run --force

# Run seeds
echo "Running seeds..."
node ace.js db:seed

# Start the application
echo "Starting application..."
exec node bin/server.js