#!/bin/bash
if [ -f /opt/elasticbeanstalk/deployment/env ]; then
  source /opt/elasticbeanstalk/deployment/env
fi

# Construct the DATABASE_URL from the individual environment variables,
# and append the ssl=true parameter to enable encryption.
# The default port is 5432 if DB_PORT is not set.
export DATABASE_URL="postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-5432}/${DB_DATABASE}?ssl=true"

# Run the migration
npm run migrate