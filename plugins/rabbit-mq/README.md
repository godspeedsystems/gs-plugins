# godspeed-plugin-rabbit-mq

Rabbit MQ is a versatile messaging system designed to securely transfer data between various systems. Its functionality can be tailored through configuration, allowing it to serve as a reliable conduit for real-time event tracking or even function as a replicated distributed database. While it's often colloquially labeled as a queue, it's more precisely described as a hybrid system that combines characteristics and trade-offs from both queue and database systems.

A brief description of how to use Rabbit MQ plug-in in our godspeed framework as Data Source as Event Source.

## Steps to use Rabbit MQ plug-in in godspeed framework:

### Example usage Datasource (Producer):

1. Update configuration file based on your requirements in `Datasource/rabbit-mq.yaml`.

#### Rabbit MQ config ( src/datasources/rabbit-mq.yaml )

```yaml
type: rabbit-mq
rabbitMqURL: "amqp://localhost"
rabbitMqClientProperties: "{connection_name: 'myFriendlyName'}"
```

Rabbit MQ url docs : https://www.rabbitmq.com/uri-spec.html

#### Rabbit MQ event for Producer ( src/events/rabbit_mq_pub.yaml )

In the event, we establish an HTTP endpoint that accepts parameters such as the queue name and message content. When this endpoint is invoked, it triggers the `datasource.rabbit-mq.producer` function. This function, in turn, takes the provided queue name and message as input arguments and performs the task of publishing the message to the specified Rabbit MQ queue.

```yaml
# event for Publish

"http.post./rabbit-mq-pub":
  fn: rabbit-mq-publish
  body:
    content:
      application/json:
        schema:
          type: object
          properties:
            message:
              type: string
          required: ["message"]
  responses:
    200:
      content:
        application/json:
          schema:
            type: object
            properties:
              name:
                type: string
```

#### Rabbit MQ workflow for Producer ( src/functions/rabbit_mq_publish.yaml )

In workflow we need to mension `datasource.rabbit-mq.producer` as function (fn) to Produce data.

```yaml
id: rabbit-mq-publish
summary: Rabbit MQ publish message
tasks:
  - id: publish
    fn: datasource.rabbit-mq.producer
    args:
      topic: "publish-producer1"
      message: <% inputs.body.message%>
```

### Example usage EventSource (Consumer):

#### Rabbit MQ event for consumer ( src/events/rabbit_mq_pub.yaml )

To use Consumer we need to follow the below event key format.

```
 RabbitMQ.{Topic}
```

The consumer event is triggered whenever a new message arrives on the specified topic. Upon triggering, it retrieves the incoming message and forwards it to the `rabbit-mq-consume` function. Inside this function, the incoming message is processed, and the result is then returned.

```yaml
# event for consume data from Queue
RabbitMQ.publish-producer1: // event key
  id: rabbit-mq-consumer
  fn: rabbit-mq-consume
  body:
    description: The body of the query
    content:
      application/json:
        schema:
          type: string
```

#### Rabbit MQ workflow for Consumer ( src/functions/rabbit_mq_consume.yaml )

```yaml
# function for consume data
id: rabbit-mq-conumer
summary: consumer
tasks:
  - id: set_consume
    fn: com.gs.return
    args: <% inputs %>
```
