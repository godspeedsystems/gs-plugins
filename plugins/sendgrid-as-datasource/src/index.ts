import {
  GSContext,
  GSDataSource,
  GSStatus,
  PlainObject,
} from "@godspeedsystems/core";
import sgMail, { MailDataRequired, ClientResponse } from "@sendgrid/mail";

// Define the arguments type for the plugin
interface ArgsType {
  to: string;
  subject: string;
  text: string;
  html: string;
  from?: string;
  meta: {
    fnNameInWorkflow: string;
  };
}

export default class DataSource extends GSDataSource {
  private sgClient?: typeof sgMail;

  protected async initClient(): Promise<object> {
    try {
      // initialize your client
      if (!this.config.apiKey) {
        throw new Error("SendGrid API key is missing in configuration.");
      }

      sgMail.setApiKey(this.config.apiKey);
      this.sgClient = sgMail;
      return this.sgClient;
    } catch (error) {
      throw new Error(`Failed to initialize SendGrid client: ${error}`);
    }
  }
  async execute(ctx: GSContext, args: ArgsType): Promise<GSStatus> {
    // Ensure client is available
    if (!this.sgClient) {
      return new GSStatus(false, 500, "SendGrid client is not initialized");
    }

    const {
      to,
      subject,
      text,
      html,
      from,
      meta: { fnNameInWorkflow },
    } = args;

    let method = fnNameInWorkflow?.split(".")[2];

    // Validate that method is available
    if (!method) {
      return new GSStatus(
        false,
        400,
        "Method name is missing in fnNameInWorkflow"
      );
    }

    try {
      if (method === "sendMail") {
        if (!to || !subject || !text || !html) {
          return new GSStatus(
            false,
            400,
            'Email "to", "subject", "text", and "html" are required fields'
          );
        }

        const msg: MailDataRequired = {
          to,
          from: from || this.config.defaultSender,
          subject,
          text,
          html,
        };

        // Send the email through SendGrid
        const [response]: [ClientResponse, {}] = await this.sgClient.send(msg);

        // Check for 2xx status codes as SendGrid success
        const isSuccess =
          response.statusCode >= 200 && response.statusCode < 300;

        const statusMessage = isSuccess
          ? "Email sent successfully"
          : `SendGrid responded with status ${response.statusCode}`;

        ctx.childLogger.info("SendGrid email response:", response);

        return new GSStatus(isSuccess, response.statusCode, statusMessage, {
          body: response.body,
          headers: response.headers,
        });
      } else {
        return new GSStatus(false, 400, `Method ${method} not recognized`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        ctx.childLogger.error(`SendGrid error: ${error.message}`);
        console.error(error);
        return new GSStatus(false, 500, "Failed to send email", error.message);
      }
      ctx.childLogger.error("An unknown error occurred while sending email.");
      console.error(error);
      return new GSStatus(false, 500, "Unknown error occurred");
    }
  }
}
const SourceType = "DS";
const Type = "sendgrid"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "sendgrid"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export { DataSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG };
