# godspeed-plugin-razorpay-as-datasource

Welcome to the [Godspeed](https://www.godspeed.systems/) Razorpay Plugin! 🚀

The Razorpay Plugin powered by GodSpeed allows seamless integration with Razorpay's API for managing transactions and handling payment events such as `order.paid` and `payment.failed`. It simplifies payment workflow automation, including sending instant order confirmations and initiating retries for failed payments.

## How to Use
- Create a godspeed project from the CLI , open the created project in vscode and then add the plugin from the CLI of vscode, select the `@godspeedsystems/plugins-razorpay-as-datastore` to integrate the plugin.


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
│ ❯◯   │ razorpay-as-datasource             │ razorpay as datasource plugin for Godspeed Framework               │
├──────┼────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
│  ◯   │ kafka-as-datasource-as-eventsource │ kafka as datasource-as-eventsource plugin for Godspeed Framework   │
└──────┴────────────────────────────────────┴────────────────────────────────────────────────────────────────────┘
```

- You will find the a file in your project related to the Razorpay plugin at `src/datasources/types/razorpay.ts` 

## Example Usage:

- Add your Razorpay credentials to the enviornment configuration:
```
key_id=your_razorpay_key_id
key_secret=your_razorpay_key_secret
```

- Create a configuration file for the Razorpay plugin at `src/datasources/razorpay.yaml`:
```
type: razorpay
key_id: ${env.key_id}
key_secret: ${env.key_secret}
```

- Create events like `order.paid` and `payment.failed` in `src/events` directory:
```yaml
# src/events/orderPaid.yaml
"razorpay.event.order.paid":
  fn: orderPaidHandler
  body:
    type: object
  responses:
    200:
      content:
        application/json:
          schema:
            type: object
```

```yaml
# src/events/paymentFailed.yaml
"razorpay.event.payment.failed":
  fn: paymentFailedHandler
  body:
    type: object
  responses:
    200:
      content:
        application/json:
          schema:
            type: object
```

- Configure workflows in `src/functions` directory to handle the events:
```yaml
# src/functions/orderPaidHandler.yaml
summary: orderPaidHandler
tasks:
  - id: sendOrderConfirmation
    fn: datasource.razorpay.sendOrderConfirmation
    args:
      orderId: ${event.orderId}
      email: ${event.email}
```

```yaml
# src/functions/paymentRetryWorkflow.yaml
id: retryPayment
tasks:
  - id: retryTask
    fn: datasource.razorpay.payment.retry
    args:
      payment_id: <% inputs.body.payment_id %>
```

## Thank You For Using Godspeed 