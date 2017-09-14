#!bin/sh

mongo --port 28000 /mnt/docker_test/cdmisRestAPI/mongoshellscripts/insertReport.js >> /mnt/docker_test/cdmisRestAPI/mongoscriptslogs/CDK_Report$(date +%Y%m%d).log 2>&1 &
