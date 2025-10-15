#!/bin/bash
if [ -f /opt/elasticbeanstalk/deployment/env ]; then
  source /opt/elasticbeanstalk/deployment/env
fi
npm run migrate