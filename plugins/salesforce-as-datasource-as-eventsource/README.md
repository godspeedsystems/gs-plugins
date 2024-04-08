# godspeed-plugin-salesforce-as-datasource-as-eventsource

Welcome to the [Godspeed](https://www.godspeed.systems/) salesforce Plugin! 🚀

Salesforce is a powerful cloud-based customer relationship management (CRM) platform that enables businesses to manage their sales, marketing, and customer service operations efficiently. 

A brief description of how to use Salesforce plug-in in our godspeed framework as Data Source as Event Source. 

## Steps to use Salesforce plug-in in godspeed framework:

## How to Use
- Create a godspeed project from the CLI , open the created project in vscode and then add the plugin from the CLI of vscode, select the `@godspeedsystems/plugins-salesforce-as-datasource-as-eventsource` to integrate the plugin.

```
> godspeed plugin add
       ,_,   ╔════════════════════════════════════╗
      (o,o)  ║        Welcome to Godspeed         ║
     ({___}) ║    World's First Meta Framework    ║
       " "   ╚════════════════════════════════════╝
? Please select godspeed plugin to install: (Press <space> to select, <Up and Down> to move rows)
┌──────┬────────────────────────────────────┬────────────────────────────────────────────────────────────────────┐
│      │ Name                               │ Description                                                        │
├──────┼────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│  ◯   │ prisma-as-datastore                │ Prisma as a datasource plugin for Godspeed Framework.              │
├──────┼────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│  ◯   │ aws-as-datasource                  │ aws as datasource plugin for Godspeed Framework                    │
├──────┼────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│  ◯   │ excel-as-datasource                │ excel as datasource plugin for Godspeed Framework                  │
├──────┼────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│  ◯   │ mailer-as-datasource               │ mailer as datasource plugin for Godspeed Framework                 │
├──────┼────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│ ❯◯   │ salesforce-as-datasource-as-eventsource │ salesforce as datasource-as-eventsource plugin for Godspeed Framework   │
└──────┴────────────────────────────────────┴────────────────────────────────────────────────────────────────────┘
```

### Example usage Datasource (Producer):

1. Update configuration file based on your requirements in `Datasource/salesforce.yaml`.
#### salesforce config ( src/datasources/salesforce.yaml )
```yaml
type: salesforce
loginUrl: 'https://dummy.salesforce.com'
username: dummy.username.password@organizationname.com
password: password@123
```



#### salesforce event for Producer ( src/events/salesforce_pub.yaml )
In the event, we establish an HTTP endpoint that accepts parameters such as message content. When this endpoint is invoked, it triggers the `salesforce-publish` function. This function, in turn, takes the provided  message as input arguments and performs the task of publishing the message to the specified salesforce api end-point.
```yaml
# event for Publish

'http.post./salesforce-pub':
  fn: salesforce-publish
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
#### salesforce workflow for Producer ( src/functions/salesforce-publish.yaml )


```yaml
id: salesforce-publish
summary: salesforce publish message
tasks:
  - id: push_data_into_salesforce
    description: Push data into salesforce
    fn: datasource.salesforce_api.post./data/v56.0/sobjects/dummy__e
    args:   
      data: <% inputs.body.message%>
```
salesforce_api is name of the salesforce datasource filename
```yaml
type: axios
base_url: 'https://dummy.salesforce.com'
headers:
  Content-Type: application/json
params: 
    client_id: 3MVG9aWdXtdHRrI1oWIdN0b0scZcgxP4pyWs92pr3qCesNzorkco6Dxqlz
    grant_type: password
    password: password@123
    username: dummy.username.password@organizationname.com
    client_secret: 5DA75A27730D178DF33E4AAAASSSSSSSDDDDDDD9A90B940F9A88A3
```

### Example usage EventSource (Consumer):

1. Update configuration file based on your requirements in `Eventsources/salesforce.yaml`.
#### salesforce config ( salesforce.yaml )
```yaml
type: salesforce
loginUrl: 'https://dummy.salesforce.com'
username: dummy.username.password@organizationname.com
password: password@123
```

#### salesforce event for consumer ( src/events/salesforce.yaml )

To use Consumer we need to follow the below event key format.

```
A Salesforce event is specified as 'salesforce.{topic_name}'. 'topic_name' represents the Salesforce event.
```
The consumer event is triggered whenever a new message arrives on the specified topic. Upon triggering, it retrieves the incoming message and forwards it to the `salesforce_consume` function. Inside this function, the incoming message is processed, and the result is then returned.

``` yaml
# event for consume data from Topic
salesforce.salesforce_topic_name: 
  id: salesforce__consumer
  fn: salesforce_consume
  body:
    description: The body of the query
    content:
      application/json: 
        schema:
          type: string
```
#### salesforce workflow for Consumer ( src/functions/salesforce_consume.yaml )
```yaml
# function for consume data
id: salesforce-consumer
summary: consumer
tasks:
    - id: set_consumer
      fn: com.gs.return
      args: <% inputs.body.payload %>
```

## Thank You For Using Godspeed 
