#!bin/sh

mongo --port 28000 schedule_develop.js >> /mnt/docker_test/cdmisRestAPI/mongoscriptslogs/CDK_Counsel$(date +%Y%m%d).log 2>&1 &
