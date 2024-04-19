# godspeed-plugin-salesforce-as-datasource-as-eventsource

Welcome to the [Godspeed](https://www.godspeed.systems/) salesforce Plugin! 🚀

Salesforce is a powerful cloud-based customer relationship management (CRM) platform that enables businesses to manage their sales, marketing, and customer service operations efficiently. 

A brief description of how to use Salesforce plug-in in our godspeed framework as Data Source as Event Source. 

**Note:** This Salesforce plugin is both a datasource (via its API) and an eventsource (to listen on Salesforce events). Learn more about [datasource-as-eventsource type plugins](https://godspeed.systems/docs/microservices-framework/event-sources/create-custom-event-source#datasource-as-eventsource).

As explained in the link shared just before, in order to use Salesforce as an eventsource, you will need to set up the datasource as well. This plugin uses the Salesforce [Node.js SDK](https://jsforce.github.io/). If you want to call Salesforce APIs via REST, then you should not use this plugin. For that, you can use the [Axios plugin](https://github.com/godspeedsystems/gs-plugins/tree/main/plugins/axios-as-datasource).
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


### Example usage EventSource (Consumer):

1. Update configuration file based on your requirements in `Eventsources/salesforce.yaml`.
#### salesforce config ( salesforce.yaml )
```yaml
type: salesforce
loginUrl: <%config.salesforce.loginUrl%>
username: <%config.salesforce.username%>
password: <%config.salesforce.password%>
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
