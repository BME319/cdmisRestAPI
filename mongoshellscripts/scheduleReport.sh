#!bin/sh

mongo --port 28000 /mnt/codes/cdmisRestAPI/mongoshellscripts/insertReport.js >> /mnt/codes/cdmisRestAPI/mongoscriptslogs/CDK_Report$(date +%Y%m%d).log 2>&1 &
