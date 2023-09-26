

 # Kafka Plug-in 🔗

Kafka is a versatile messaging system designed to securely transfer data between various systems. Its functionality can be tailored through configuration, allowing it to serve as a reliable conduit for real-time event tracking or even function as a replicated distributed database. While it's often colloquially labeled as a queue, it's more precisely described as a hybrid system that combines characteristics and trade-offs from both queue and database systems.

A brief description of how to use Kafka plug-in in our godspeed framework as Data Source as Event Source. 

## Steps to use kafka plug-in in godspeed framework:

### Example usage Datasource (Producer):

1. Update configuration file based on your requirements in `Datasource/kafka.yaml`.
#### kafka config ( src/datasources/kafka.yaml )
```yaml
type: kafka
clientId: "kafka_proj"
brokers: ["kafka:9092"]
```



#### kafka event for Producer ( src/events/kafka_pub.yaml )
In the event, we establish an HTTP endpoint that accepts parameters such as the topic name and message content. When this endpoint is invoked, it triggers the `datasource.kafka.producer` function. This function, in turn, takes the provided topic name and message as input arguments and performs the task of publishing the message to the specified Kafka topic.
```yaml
# event for Publish

'http.post./kafka-pub':
  fn: kafka-publish
  body:
    content:
      application/json:
        schema:
          type: object
          properties:
            message:
              type: string
          required: ['message']
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
#### kafka workflow for Producer ( src/functions/kafka_publish.yaml )

In workflow we need to mension `datasource.kafka.producer` as function (fn) to Produce data.

```yaml
id: kafka-publish
summary: kafka publish message
tasks:
    - id: publish
      fn: datasource.kafka.producer
      args:
        topic: "publish-producer1"
        message: <% inputs.body.message%>
```

### Example usage EventSource (Consumer):

1. Update configuration file based on your requirements in `Eventsources/kafka.yaml`.
#### kafka config ( kafka.yaml )
```yaml
type: kafka
groupId: "kafka_proj"

```

#### kafka event for consumer ( src/events/kafka_pub.yaml )

To use Consumer we need to follow the below event key format.

```
 Kafka.{Topic}.{GroupId}
```
The consumer event is triggered whenever a new message arrives on the specified topic. Upon triggering, it retrieves the incoming message and forwards it to the `kafka_consume` function. Inside this function, the incoming message is processed, and the result is then returned.

``` yaml
# event for consume data from Topic
Kafka.publish-producer1.kafka_proj: // event key
  id: kafka__consumer
  fn: kafka_consume
  body:
    description: The body of the query
    content:
      application/json: 
        schema:
          type: string
```
#### kafka workflow for Consumer ( src/functions/kafka_consume.yaml )
```yaml
# function for consume data
id: kafka-conumer
summary: consumer
tasks:
    - id: set_consume
      fn: com.gs.return
      args: <% inputs %>
```
