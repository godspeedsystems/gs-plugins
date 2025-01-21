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
"http.post./stripe/create-payment":
  fn: stripe_create_payment
  authn: false
  body:
    type: object
    properties:
      amount:
        type: number
      currency:
        type: string
    required:
      - amount
      - currency
  responses:
    200:
      content:
        application/json:
          type: object

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
      amount: 2000000
      currency: "usd"
      payment_method_types:
        - "card"
```


`stripe_create_payment.ts`
```ts
import { GSContext, GSStatus, PlainObject } from "@godspeedsystems/core";

export default async function (ctx: GSContext) {
  ctx.logger.info("Creating Stripe payment intent");

  try {
    const { amount, currency } = ctx.inputs.data.body;

    ctx.logger.info("Attempting to create payment intent", { amount, currency });

    const result = await ctx.datasources.stripe.execute(ctx, {
      meta: { resource: "paymentIntents", method: "create" },
      args: [{
        amount,
        currency,
        payment_method_types: ["card"],
        metadata: { integration_check: "accept_a_payment" }
      }]
    });

    ctx.logger.info("Payment intent created successfully", { paymentIntentId: result.data.id });

    return new GSStatus(true, 200, "Payment intent created successfully", {
      paymentIntentId: result.data.id,
      clientSecret: result.data.client_secret
    });
  } catch (error) {
    ctx.logger.error("Failed to create payment intent", { error: error.message });
    return new GSStatus(false, 500, `Failed to create payment intent: ${error.message}`);
  }
}

```

`stripe_payment_success.ts`
```ts
import { GSContext, GSStatus, PlainObject } from "@godspeedsystems/core";

export default async function (ctx: GSContext, args: PlainObject) {
  ctx.logger.info("Payment succeeded event received.WOOHOO");
  ctx.logger.info("Event data:", args);

  return new GSStatus(true, 200, "Payment processed successfully");
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

