# godspeed-plugin-stripe-as-datasource

Welcome to the [Godspeed](https://www.godspeed.systems/) Stripe Plugin! 🚀

**"Stripe: Simplifying Payments for Developers. One Platform, Any Business."**

Stripe is a comprehensive and developer-friendly payment platform that enables businesses to easily accept payments online and in mobile apps. It provides a seamless API for payment processing, subscription management, fraud prevention, and financial reporting. With support for various payment methods, currencies, and advanced security features, Stripe empowers developers to integrate and scale payment solutions quickly and securely for businesses of any size.

## How to Use
- Create a godspeed project from the CLI , open the created project in vscode and then add the plugin from the CLI, do `npm i /path/to/stripe-as-datasource` to integrate the plugin


`stripe.ts`

```typescript
import { DataSource } from "@godspeedsystems/plugins-stripe-as-datasource";
export default DataSource;
```

`stripe-events.yaml`
```yaml
"http.post./stripe/payment-success":
  fn: stripe_payment_success
  authn: false
  body:
    type: object
    properties:
      id:
        type: string
      amount:
        type: number
      currency:
        type: string
    required:
      - id
      - amount
      - currency
  responses:
    200:
      content:
        application/json:
          type: object

"http.post./stripe/payment-failure":
  fn: stripe_payment_failure
  authn: false
  body:
    type: object
    properties:
      error_code:
        type: string
      message:
        type: string
    required:
      - error_code
      - message
  responses:
    200:
      content:
        application/json:
          type: object

```
`stripe_create_payment.yaml`
```yaml
id: create_stripe_payment
summary: Create a payment intent with Stripe
tasks:
  - id: create_payment
    fn: datasource.stripe.paymentIntents.create
    args:
      amount: 200
      currency: "usd"
      payment_method_types:
        - "card"

```

`stripe_payment_success.ts`
```ts
import { GSContext, GSStatus, PlainObject } from "@godspeedsystems/core";

export default async function (ctx: GSContext, args: PlainObject) {
  ctx.logger.info("Payment succeeded event received.WOOHOO");
  ctx.logger.info("Event data:", args);

  return new GSStatus(true, 200, "Payment processed successfully YIPEE.");
}
```

`stripe_payment_failure.ts`
```ts
import { GSContext, GSStatus, PlainObject } from "@godspeedsystems/core";

export default async function (ctx: GSContext, args: PlainObject) {
  ctx.logger.error("Payment failed event received.");
  ctx.logger.error("Event data:", args);

  return new GSStatus(false, 500, "Payment failed. Please check logs.");
}

```

Run godspeed serve to start the development server.
```bash
godspeed serve
```
Link to the godspeed-test-project: https://github.com/qu-bit1/stripe-test-project

## Thank You For Using Godspeed 

