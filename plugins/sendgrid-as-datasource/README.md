# godspeed-plugin-sendgrip-as-datasource

Welcome to the [Godspeed](https://www.godspeed.systems/) Sendgrip Plugin! 🚀This project helps you automate email sending and track email metrics using SendGrid, with status logging to Google Sheets.

## Features

- Automated email sending via SendGrid API
- Real-time email tracking (opens, clicks, bounces, etc.)
- Automatic logging of email status to Google Sheets
- Webhook integration for event tracking

## Prerequisites

- Node.js installed on your system
- A SendGrid account
- A Google Cloud account
- Basic familiarity with API concepts

## Steps to use sendgrip plug-in in godspeed framework:

### How to install:

- Create a godspeed project from the CLI , open the created project in vscode and then add the plugin from the CLI of vscode using `godspeed plugin add`, select the `@godspeedsystems/plugins-sendgrip-as-datasource` to integrate the plugin.

### SendGrid Configuration:

#### A. API Setup

1. Log in to [SendGrid Dashboard](https://sendgrid.com/)
2. Navigate to: Settings → API Keys → Create API Key
3. Set permissions to "Full Access"
4. Copy the generated API key
5. Add to your `.env`:
   ```
   SENDGRID_API_KEY=your_api_key_here
   SENDGRID_DEFAULT_SENDER=your_default_sender_email
   ```

#### B. Sender Authentication

1. Go to Settings → Sender Authentication
2. Choose authentication method:
   - **Recommended**: Domain Authentication
     - Follow the DNS configuration steps
     - Add provided DNS records to your domain provider
   - **Alternative**: Single Sender Verification
     - If you don't have a domain, then you opt for Single Sender Verification but this is not encouraged by sendgrip.
     - Use for testing only
     - Verify your sender email address, even the default sender that you set in env

### Project Setup:

#### A. Configuration file

1. Create a file `sendgrip.yaml` inside datasources folder.
2. Copy this inside that file:

```
type: sendgrid
apiKey: <%process.env.SENDGRID_API_KEY%>
defaultSender: <%process.env.SENDGRID_DEFAULT_SENDER%>
```

#### B. Event trigger

1. Create a file `sendgrip.yaml` inside events folder.
2. Copy this inside that file:

```
http.post./send-mail:
  summary: 'Send mail'
  description: 'Endpoint to send a mail to a mail address'
  fn: sendMail
  authn: false
  body:
    content:
      application/json:
        schema:
          type: object
          properties:
            to:
              type: string
              format: email
              description: 'Recipient email address'
            subject:
              type: string
              description: 'Email subject'
            text:
              type: string
              description: 'Plain text content of the email'
            html:
              type: string
              description: 'HTML content of the email'
            from:
              type: string
              format: email
              description: 'Sender email address'
          required: ['to', 'subject', 'text', 'html']
  responses:
    200:
      description: 'Email sent successfully'
      content:
        application/json:
          schema:
            type: object
            properties:
              message:
                type: string
                example: 'Email sent successfully.'
    400:
      description: 'Bad request - Missing or invalid fields'
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: 'Invalid request body: missing or invalid fields.'
    500:
      description: 'Internal server error'
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: 'Failed to send email.'
```

#### C. Workflow Function

1. Create a file `sendMail.ts` inside the functions folder.
2. Copy this inside that file:

```
import { GSContext, GSDataSource, GSStatus } from '@godspeedsystems/core';

export default async function (ctx: GSContext, args: any) {
  const {
    inputs: {
      data: { body },
    },
  } = ctx;

  const { to, subject, text, html, from } = body;

  // Access the SendGrid datasource from the context
  const ds: GSDataSource = ctx.datasources.sendgrid;

  try {
    // Validate required fields before attempting to send the email
    if (!to || !subject || !text || !html) {
      const missingFields = [
        !to && 'to',
        !subject && 'subject',
        !text && 'text',
        !html && 'html',
      ]
        .filter(Boolean)
        .join(', ');

      ctx.childLogger.error(`Missing required fields: ${missingFields}`);
      return new GSStatus(
        false,
        400,
        `Missing required fields: ${missingFields}`,
      );
    }

    // Execute the send function in SendGrid
    const response = await ds.execute(ctx, {
      to,
      subject,
      text,
      html,
      from: from || undefined,
      meta: { fnNameInWorkflow: 'datasource.sendgrid.sendMail' },
    });

    return response;
  } catch (error: unknown) {
    // Log and handle known and unknown errors
    if (error instanceof Error) {
      ctx.childLogger.error(`Failed to send email: ${error.message}`);
      return new GSStatus(false, 500, 'Failed to send email', error.message);
    }

    // Handle non-standard errors
    ctx.childLogger.error(`An unknown error occurred: ${error}`);
    return new GSStatus(false, 500, 'Failed to send email', `${error}`);
  }
}
```

#### That's it, now you can start the project using `godspeed serve`. To test it out, go to `/api-docs` endpoint to access the swagger UI. Then try to send a mail using `/send-mail` endpoint. Remember, only verified email addresses with sendgrip can be used in the `from` field.

---

## Steps to store the email status logs in a google spreadsheet:

#### For this, we will manually create another datasource to track the events and log them on the spreadsheet.

### Sendgrip Event Webhook Setup:

1. Go to Settings → Mail Settings → Event Webhook
2. Click on **Create Webhook URL** and configure webhook:
   - URL: `https://your-domain.com/event-tracking`
   - For local development:
     1. Install [ngrok](https://ngrok.com/)
     2. Run: `ngrok http 3000`
     3. Use the generated HTTPS URL with /event-tracking
   - Select events: processed, delivered, open, click, bounce
3. Save configuration

### Google Sheets Integration:

#### A. Google Cloud Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable Google Sheets API:
   - Search for "Google Sheets API"
   - Click Enable

#### B. Service Account Configuration

1. In the left sidebar, navigate to IAM & Admin → Service Accounts
2. Create service account:
   - Name: `godspeed-sendgrid`
   - Role: Project → Owner
   - Click on **create**
3. Create key:
   - In the **Service Accounts** section, find the account you just created.
   - Click the three dots on the right and select **Manage Keys**.
   - Click **Add Key > Create New Key**.
   - Choose **JSON** as the key type and click **Create**.
   - A .json file containing the service account's credentials will be downloaded. Save this file in the root of your project with name **google-key.json**.

#### C. Spreadsheet Setup

1. Create a copy of our [template spreadsheet](https://docs.google.com/spreadsheets/d/13w9a9fwpGJDZ68husCHv2VU6rWtdGk7gtAxrIYTDxFc/edit?usp=sharing)
2. Share with service account:
   - Open the Google Sheet that you just copied, we will use this to store email logs.
   - Click the **Share** button in the top-right corner.
   - In the **Share with people and groups** field, enter the **Service Account email** (you can find it in the downloaded .json file under the client_email field).
   - Set the permission to **editor**.
   - Click **Send** to share the sheet with the service account.
3. Set env variables for google spreedsheet in the root of your project:

- Your service account's credentials file

```env
GOOGLE_CREDENTIAL_FILE_PATH=your_google_key_filename
```

- Worksheet name

```env
GOOGLE_WORKSHEET_NAME="sheet1"
```

- Google spreasheet ID. To extract the Google Sheet ID, find it in the URL between /d/ and /edit (e.g. 1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V).

```env
GOOGLE_SHEET_ID=sheet_id
```

### Project Setup:

- Install googleapis npm package: `npm i googleapis`

#### 1. We will make a custom datasource. Create a `track.ts` file inside the `datasources/types` folder and copy this code there:

```
import {
  GSContext,
  GSDataSource,
  GSStatus,
  PlainObject,
} from '@godspeedsystems/core';
import { google } from 'googleapis';

export default class DataSource extends GSDataSource {
  private sheets?: any;
  private auth?: any;

  protected async initClient(): Promise<object> {
    try {
      this.sheets = google.sheets('v4');
      this.auth = new google.auth.GoogleAuth({
        keyFile: this.config.keyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      return { sheets: this.sheets, auth: this.auth };
    } catch (error) {
      throw new Error(`Failed to initialize google client: ${error}`);
    }
  }

  async getSheetData(): Promise<any[][]> {
    try {
      const auth = await this.auth.getClient();
      const request = {
        spreadsheetId: this.config.sheetId,
        range: `${this.config.worksheetName}`,
        auth,
      };

      const response = await this.sheets.spreadsheets.values.get(request);
      return response.data.values || [];
    } catch (error) {
      throw new Error(`Failed to get data from Google Sheets: ${error}`);
    }
  }

  // Helper function to find the row number by sg_message_id
  async findRowById(sg_message_id: string): Promise<number | null> {
    try {
      const sheetData = await this.getSheetData();
      for (let i = 1; i < sheetData.length; i++) {
        if (sheetData[i][0] === sg_message_id) {
          return i + 1; // Convert index to row number
        }
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to find row by ID: ${error}`);
    }
  }

  // Method to find the next empty row in the sheet
  async getNextEmptyRow(): Promise<number> {
    const sheetData = await this.getSheetData();
    return sheetData.length + 1; // Next empty row is one after the last filled row
  }

  async writeData(data: PlainObject) {
    const { range, values } = data;

    try {
      const auth = await this.auth.getClient();
      const request = {
        spreadsheetId: this.config.sheetId,
        range: `${this.config.worksheetName}!${range}`,
        valueInputOption: 'RAW',
        resource: { values },
        auth,
      };

      const response = await this.sheets.spreadsheets.values.update(request);
      return response;
    } catch (error) {
      throw new Error(`Failed to write data to google sheets: ${error}`);
    }
  }

  async execute(ctx: GSContext, args: any): Promise<GSStatus> {
    // Ensure client is available
    if (!this.sheets || !this.auth) {
      ctx.childLogger.error('Google client is not initialized');
      return new GSStatus(false, 500, 'Google client is not initialized');
    }

    try {
      for (const data of args) {
        const { sg_message_id, email, event } = data;
        let range: string;
        let values: any[][];

        // Check if a row already exists for the `sg_message_id`
        let rowNumber = await this.findRowById(sg_message_id);

        // If no existing row, add a new entry with the sg_message_id and email
        if (!rowNumber) {
          rowNumber = await this.getNextEmptyRow();
          range = `A${rowNumber}`;
          values = [[sg_message_id, email]];
          await this.writeData({ range, values });
        }

        // Determine the column and value based on event type
        switch (event) {
          case 'processed':
            range = `C${rowNumber}`;
            values = [['processed']];
            break;
          case 'delivered':
            range = `D${rowNumber}`;
            values = [['delivered']];
            break;
          case 'open':
            range = `E${rowNumber}`;
            values = [['opened']];
            break;
          case 'click':
            range = `F${rowNumber}`;
            values = [['clicked']];
            break;
          case 'bounce':
            range = `G${rowNumber}`;
            values = [['bounced']];
            break;
          default:
            ctx.childLogger.warn(`Unhandled event type: ${event}`);
            continue; // Skip unhandled events
        }

        // Write the event-specific data to the designated cell
        await this.writeData({ range, values });
      }

      return new GSStatus(true, 200, 'Event tracked successfully');
    } catch (error: any) {
      ctx.childLogger.error(`Failed to execute data tracking: ${error}`);
      return new GSStatus(
        false,
        500,
        'Failed to execute data tracking',
        error.message,
      );
    }
  }
}

const SourceType = 'DS';
const Type = 'track'; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = 'track'; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export { DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG };
```

#### 2. Configuration file

1. Create a file `track.yaml` inside datasources folder.
2. Copy this inside that file:

```
type: track
sheetId: <%process.env.GOOGLE_SHEET_ID%>
keyFile: <%process.env.GOOGLE_CREDENTIAL_FILE_PATH%>
worksheetName: <%process.env.GOOGLE_WORKSHEET_NAME%>
```

#### B. Event trigger

1. Create a file `track.yaml` inside events folder.
2. Copy this inside that file:

```
http.post./event-tracking:
  summary: 'Track SendGrid Events'
  description: 'Endpoint to track multiple email events from SendGrid in a single request'
  fn: track
  authn: false
  body:
    content:
      application/json:
        schema:
          type: array
          items:
            type: object
            required:
              - sg_message_id
              - email
              - event
              - timestamp
            properties:
              sg_message_id:
                type: string
                description: 'Unique identifier for the SendGrid message'
              email:
                type: string
                format: email
                description: 'Recipient email address'
              event:
                type: string
                description: 'Event type (processed, delivered, open, click, bounce)'
                enum: ['processed', 'delivered', 'open', 'click', 'bounce']
              timestamp:
                type: integer
                description: 'Unix timestamp of the event'
  responses:
    200:
      description: 'Events tracked successfully'
      content:
        application/json:
          schema:
            type: object
            properties:
              message:
                type: string
                example: 'Events tracked successfully.'
    400:
      description: 'Bad request - Missing or invalid fields'
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: 'Invalid request body: missing required fields.'
    500:
      description: 'Internal server error'
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: 'Failed to process events.'
```

#### C. Workflow Function

1. Create a file `track.ts` inside the functions folder.
2. Copy this inside that file:

```
import { GSContext, GSDataSource, GSStatus } from '@godspeedsystems/core';

export default async function (ctx: GSContext, args: any) {
  try {
    const {
      inputs: {
        data: { body },
      },
    } = ctx;

    ctx.childLogger.info('Received event data for tracking:', body);

    // Access the 'track' datasource from the context
    const ds: GSDataSource = ctx.datasources.track;

    const response = await ds.execute(ctx, body);

    ctx.childLogger.info('Event tracked successfully:', response);
    return new GSStatus(true, 200, 'Event tracked successfully');
  } catch (error: unknown) {
    // Log and handle known errors
    if (error instanceof Error) {
      ctx.childLogger.error(`Failed to track event: ${error.message}`);
      return new GSStatus(false, 500, 'Failed to track event', error.message);
    }

    // Log and handle unexpected error types
    ctx.childLogger.error(`Internal server error: ${error}`);
    return new GSStatus(false, 500, 'Internal server error', `${error}`);
  }
}
```

## Running the Project

1. Start the server:

   ```bash
   godspeed serve
   ```

2. Access Swagger UI:

   ```
   http://localhost:3000/api-docs
   ```

3. Test email sending:
   - Send a mail using the data format provided in swagger UI
   - Check the spread sheet, you should be able to see the logs being updated on it.
   - Open the email on email app to see the **open** log getting update
   - Send any link in the html section of mail body using anchor tag, and click on that link in the email app to see the **click** log getting updated.

## Troubleshooting

Common issues and solutions:

1. **Webhook not receiving events**

   - Verify ngrok is running and URL is updated in SendGrid
   - Check webhook logs in SendGrid dashboard

2. **Google Sheets access denied**

   - Verify service account email is correctly shared
   - Check `google-key.json` permissions

3. **Emails not sending**

- Check spam folder
- Verify sender email is authenticated
- Check SendGrid API key permissions

## Security Best Practices

1. Never commit sensitive files:

   - Add to `.gitignore`:
     ```
     .env
     google-key.json
     ```

2. Use environment variables for all secrets

3. Restrict API key permissions when possible

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Support

- Documentation: [Godspeed Docs](https://godspeed.systems/docs)
- Issues: Create a GitHub issue
- Community: Join our [Discord](https://discord.gg/JDjVeGJG)

# Thankyou for using godspeed💓
