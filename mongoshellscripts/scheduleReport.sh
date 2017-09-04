#!bin/sh

mongo insertReport.js >> /mnt/docker_test/cdmisRestAPI/mongoscriptslogs/CDK_Report$(date +%Y%m%d).log 2>&1 &
