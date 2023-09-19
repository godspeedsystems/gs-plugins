# godspeed-plugin-cron-as-eventsource


Cron jobs are a standard method of scheduling tasks to run on your server. Cron is a service running in the background that will execute commands (jobs) at a specified time, or at a regular interval. Jobs and their schedules are defined in a configuration file called a crontab.


A brief description of how to use Cron plug-in in  godspeed framework as Event Source. 

## Steps to use cron plug-in in godspeed framework:

### Example usage :

1. Update configuration file based on your requirements in `eventsource/cron.yaml`.
#### cron config ( src/eventsources/cron.yaml )
```yaml
type: cron
```
event key prefix should be the `type` mensioned in the config `yaml` file.

#### cron event  ( src/events/every_minute_task.yaml )

```yaml
# event for Shedule a task for evrey minute.

cron.* * * * *.Asia/Kolkata: //event key
  fn: every_minute

```
For  cron expressions   `https://crontab.cronhub.io/`

#### cron workflow to schedule ( src/functions/every_minute.yaml )


```yaml
summary: this workflow will be running every minute
tasks:
  - id: print
    description: print for every minute
    fn: com.gs.return
    args:
      data: HELLO from CRON
```
