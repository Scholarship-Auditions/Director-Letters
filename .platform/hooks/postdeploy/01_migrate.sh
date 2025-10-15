#!/bin/bash
if [ -f /opt/elasticbeanstalk/deployment/env ]; then
  source /opt/elasticbeanstalk/deployment/env
fi

# Run the migration
npm run migrate