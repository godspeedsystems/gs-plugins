# godspeed-plugin-rabbitmq-as-eventsource


RabbitMQ is an open-source message-broker software that originally implemented the Advanced Message Queuing Protocol and has since been extended with a plug-in architecture to support Streaming Text Oriented Messaging Protocol, MQ Telemetry Transport, and other protocols.


A brief description of how to use RabbitMQ plug-in in  godspeed framework as Event Source. 

## Steps to use RabbitMQ plug-in in godspeed framework:

### Example usage :

1. Update configuration file based on your requirements in `eventsource/rabbitmq.yaml`.
#### rabbitmq config ( src/eventsources/rabbitmq.yaml )
```yaml
type: rabbitmq
message: Hello World
```
event key prefix should be the `type` mensioned in the config `yaml` file.

#### rabbitmq event  ( src/events/send_msg.yaml )

```yaml

rabbitmq.gs_rabbitmq.messages: //event key
  fn: send_msg

```

#### rabbitmq workflow to schedule ( src/functions/send_msg.yaml )


```yaml
summary: this workflow will send a message
tasks:
  - id: print
    description: print the message at consumer side of RabbitMQ
    fn: com.gs.return
```
