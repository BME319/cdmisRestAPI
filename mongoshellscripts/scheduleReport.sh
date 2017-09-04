#!bin/sh

mongo insertReport.js >> /mnt/docker_test/cdmisRestAPI/mongoscriptslogs/CDK$(date + %Y%m%d).log 2>&1 &
# mongo /mnt/docker_test/cdmisRestAPI/mongoshellscripts/schedule_develop.js
