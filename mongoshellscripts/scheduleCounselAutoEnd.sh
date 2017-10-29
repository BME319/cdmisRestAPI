#!bin/sh

mongo --port 28000 /mnt/codes/cdmisRestAPI/mongoshellscripts/schedule_develop.js >> /mnt/codes/cdmisRestAPI/mongoscriptslogs/CDK_Counsel$(date +%Y%m%d).log 2>&1 &
