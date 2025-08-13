# **Godspeed Plugin: Stripe as a Datasource**  
🚀 **Seamlessly integrate Stripe’s secure payment processing with the Godspeed framework.**  

> **"Stripe: Simplifying Payments for Developers. One Platform, Any Business."**  

Stripe is a powerful, developer-friendly payment platform that enables businesses to accept payments online and in mobile apps. It provides a robust API for **payment processing, subscription management, fraud prevention, and financial reporting**.  

This plugin allows you to integrate **Stripe** as a datasource in **Godspeed**, making it easy to process payments and handle event-based responses, such as **payment success and failure notifications**.

---

## **📌 Features**
✔ **Create payment intents** using Stripe API  
✔ **Listen to payment events** (success & failure)  
✔ **Secure and scalable integration** with Stripe  
✔ **Easily configurable within the Godspeed framework**  

---

## **📖 Installation & Setup**
### **1️⃣ Install the Plugin**
Run the following command inside your Godspeed project:
```sh
npm install /path/to/stripe-as-datasource
```

### **2️⃣ Add the Datasource**
Create `src/datasources/stripe.yaml`:
```yaml
type: stripe
apiKey: <%config.STRIPE_API_KEY%>
```
💡 **Replace** `<%config.STRIPE_API_KEY%>` with your actual Stripe API key in `.env`:
```env
STRIPE_API_KEY=sk_test_1234567890abcdef
```

### **3️⃣ Add the Stripe Plugin**
Create `src/datasources/types/stripe.ts`:
```ts
import { DataSource } from "@godspeedsystems/plugins-stripe-as-datasource";
export default DataSource;
```

---

## **🔧 API Endpoints**
The following **API endpoints** are registered in Godspeed to handle payments:

### **1️⃣ Create Payment Intent**
✅ **Endpoint:** `POST /stripe/create-payment`  
✅ **Description:** Creates a Stripe payment intent  
✅ **Request Body:**
```json
{
  "amount": 2000,
  "currency": "usd"
}
```
✅ **Response:**
```json
{
  "success": true,
  "code": 200,
  "message": "Payment intent created successfully",
  "data": {
    "paymentIntentId": "pi_xxx",
    "clientSecret": "secret_xxx"
  }
}
```
✅ **Implementation:**
- **Event Definition (`src/events/stripe-events.yaml`)**:
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
- **Function (`src/functions/stripe_create_payment.ts`)**:
```ts
import { GSContext, GSStatus } from "@godspeedsystems/core";

export default async function (ctx: GSContext) {
  ctx.logger.info("Creating Stripe payment intent");

  try {
    const { amount, currency } = ctx.inputs.data.body;

    const result = await ctx.datasources.stripe.execute(ctx, {
      meta: { resource: "paymentIntents", method: "create" },
      args: [{
        amount,
        currency,
        payment_method_types: ["card"],
        metadata: { integration_check: "accept_a_payment" }
      }]
    });

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

---

### **2️⃣ Payment Success Webhook**
✅ **Endpoint:** `POST /stripe/payment-success`  
✅ **Description:** Captures successful payments from Stripe  
✅ **Request Body:**
```json
{
  "id": "pi_xxx",
  "amount": 2000,
  "currency": "usd"
}
```
✅ **Implementation (`src/functions/stripe_payment_success.ts`)**:
```ts
import { GSContext, GSStatus, PlainObject } from "@godspeedsystems/core";

export default async function (ctx: GSContext, args: PlainObject) {
  ctx.logger.info("Payment succeeded event received.");
  ctx.logger.info("Event data:", args);

  return new GSStatus(true, 200, "Payment processed successfully.");
}
```

---

### **3️⃣ Payment Failure Webhook**
✅ **Endpoint:** `POST /stripe/payment-failure`  
✅ **Description:** Captures failed payments from Stripe  
✅ **Request Body:**
```json
{
  "error_code": "card_declined",
  "message": "Your card was declined."
}
```
✅ **Implementation (`src/functions/stripe_payment_failure.ts`)**:
```ts
import { GSContext, GSStatus, PlainObject } from "@godspeedsystems/core";

export default async function (ctx: GSContext, args: PlainObject) {
  ctx.logger.error("Payment failed event received.");
  ctx.logger.error("Event data:", args);

  return new GSStatus(false, 500, "Payment failed. Please check logs.");
}
```

---

## **🚀 Running the Server**
Once everything is set up, start the Godspeed server:
```sh
godspeed serve
```
---

## **🛠 Testing the Plugin**
### **1️⃣ Create a Payment Intent**
Run:
```sh
curl -X POST http://localhost:3000/stripe/create-payment \
     -H "Content-Type: application/json" \
     -d '{"amount": 2000, "currency": "usd"}'
```

### **2️⃣ Test Payment Failure**
Run:
```sh
stripe trigger payment_intent.payment_failed
```
Expected Logs:
```
ERROR: Payment failed event received.
ERROR: Event data: { error_code: "card_declined", message: "Your card was declined." }
```

### **3️⃣ Test Payment Success**
Run:
```sh
stripe trigger payment_intent.succeeded
```
Expected Logs:
```
INFO: Payment succeeded event received.
INFO: Event data: { id: "pi_xxx", amount: 2000, currency: "usd" }
```

---

## **📂 Project Repository**
🔗 **Godspeed Test Project:** [GitHub Repository](https://github.com/qu-bit1/stripe-test-project)

---

## **🙌 Thank You for Using Godspeed!**  
Need help? **Join our community or open an issue!** 🚀💳  

---
