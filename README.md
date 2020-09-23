# Archiver

This is a docker image to automatically rename and compress logs to keep the sizes down.  

Log folders should be mounted in `/usr/logs/` or the directory specified in the `LOGDIR` env variable

The program will run by default at midnight every night or on the cron schedule specified in the `SCHEDULE` env variable
