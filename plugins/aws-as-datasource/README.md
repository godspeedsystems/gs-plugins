# godspeed-plugin-aws-as-datasource

Welcome to the [Godspeed](https://www.godspeed.systems/) AWS Plugin! 🚀

Welcome to the backbone of the cloud—the Amazon Web Services (AWS). Renowned for its unparalleled scalability and reliability, AWS stands as a juggernaut in cloud computing. Empowering businesses with a vast array of services, from storage to machine learning, AWS is the conduit for innovation in the digital realm. Dive into the future of computing with AWS as your steadfast and cutting-edge data source.

A brief description of how to use aws plug-in in our godspeed framework as Data Source as Event Source. 

## Steps to use aws plug-in in godspeed framework:

## How to Use
- Create a godspeed project from the CLI , open the created project in vscode and then add the plugin from the CLI of vscode, select the `@godspeedsystems/plugins-aws-as-datasource` to integrate the plugin.

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
│ ❯◯   │ aws-as-datasource                  │ aws as datasource plugin for Godspeed Framework                    │
├──────┼────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│  ◯   │ excel-as-datasource                │ excel as datasource plugin for Godspeed Framework                  │
├──────┼────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│  ◯   │ mailer-as-datasource               │ mailer as datasource plugin for Godspeed Framework                 │
├──────┼────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│  ◯   │ kafka-as-datasource-as-eventsource │ kafka as datasource-as-eventsource plugin for Godspeed Framework   │
└──────┴────────────────────────────────────┴────────────────────────────────────────────────────────────────────┘
```

### Example usage (listObjects):

1. Update configuration file based on your requirements in `Datasource/aws.yaml`.
#### aws config ( src/datasources/aws.yaml )
```yaml
type: aws
region: "ap-south-1"
bucket_name: "godspeed-test"
accessKeyId: "AKIC4KQJJFGY3NDQ2TPY"
secretAccessKey: "lXxTDaVZyv+dwMn2PepJ9gyd1IotfX/voBmggu6E"


```



#### aws event for list Objects  ( src/events/aws_event.yaml )
In the event, we establish HTTP endpoint that accepts json objects in request body. When this endpoint is invoked, it triggers the `aws_list` function. This function, in turn, takes the  input arguments and performs the task of creating new objects to the specified aws file.
```yaml
# event for create

"http.post./aws":
  fn: aws_list
  body:
    type: object
  responses:
    200:
      content:
         application/json:

```
#### aws workflow for create a new user ( src/functions/aws_list.yaml )

In workflow we need to mension `datasource.aws.${method}` as function (fn) to perform operations in this case `datasource.aws.listObjects`.

```yaml
id: aws
tasks:
  - id: aws_list
    fn: datasource.aws.listObjects
    args:
      params: <% inputs.body.params %>

```

## Thank You For Using Godspeed 