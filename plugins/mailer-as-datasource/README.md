# godspeed-plugin-mailer-as-datasource
Welcome to the [Godspeed](https://www.godspeed.systems/) Mailer Plugin! 🚀



**Supercharge your email delivery with ease using Godspeed and Nodemailer.**

Sending emails in your Node.js application has never been smoother. The Godspeed Nodemailer Plugin provides seamless integration between the robust Godspeed framework and Nodemailer, the go-to solution for email delivery in Node.js.

## Features

- **Effortless Setup:** Get up and running in minutes with our easy-to-follow setup guide.
- **Dynamic Templating:** Craft personalized emails with dynamic content using popular templating engines.
- **Error Resilience:** Robust error handling ensures reliable email delivery, even in challenging scenarios.
- **Scalable and Secure:** Designed for scalability and security, so your email system can grow with your application.

Whether you're sending transactional emails, newsletters, or notifications, this plugin empowers you to deliver messages with Godspeed. Let's elevate your email game together!


## How to Use
- Create a godspeed project from the CLI , open the created project in vscode and then add the plugin from the CLI of vscode, select the `@godspeedsystems/plugins-mailer-as-datastore` to integrate the plugin.


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
│ ❯◯   │ mailer-as-datasource               │ mailer as datasource plugin for Godspeed Framework                 │
├──────┼────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│  ◯   │ kafka-as-datasource-as-eventsource │ kafka as datasource-as-eventsource plugin for Godspeed Framework   │
└──────┴────────────────────────────────────┴────────────────────────────────────────────────────────────────────┘
```

- You will find the a file in your project related to the Prisma plugin at `src/datasources/types/mailer.ts` 



## example usage:

#### mailer config ( src/datasources/mail.yaml )
```
type: mail
user: 'godspeed@gmail.com'
pass: 'rmeb bjak xcam xkub'
```

#### mailer event for Producer ( src/events/mail_send_event.yaml )

```
http.post./mail:
  summary: sending_mail
  description: sending_mail
  fn: mail_send
  body:
      type: object
      properties:
        name:
          type: string
  responses:
    200:
      content:
        application/json:
          schema:
            type: object

```

#### mailer workflow for send mail ( src/functions/mail_send.yaml )

```
summary: send
tasks:
  - id: send_mail
    fn: datasource.mail.send
    args: 
      from: 'sender@gmail.com'
      to: 'receiver@gmail.com'
      subject: 'Hello from Godspeed'
      text: 'Have a Nice day'
  
```

## Thank You For Using Godspeed 