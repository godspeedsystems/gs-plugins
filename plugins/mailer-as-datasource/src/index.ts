import { GSContext,  GSDataSource, PlainObject,} from "@godspeedsystems/core";
import nodemailer from 'nodemailer';

export default class DataSource extends GSDataSource {
  protected async initClient(): Promise<object> {
    return nodemailer;
  }

  async execute(ctx: GSContext, args: PlainObject): Promise<any> {  
    try {
      const {
        meta: {
          from,
          to,
          subject,
          text
        },
      } = args;

      const method = args.method ?? "send";
      
    // let method = fnNameInWorkflow?.split(".")[2]; // for yaml workflows extract method from fn field

      if (this.client) {
        if(method == "send"){
          const transporter = nodemailer.createTransport({

            service: this.config?.service || 'gmail',
            host: this.config?.host,
            port: this.config?.port,
            secure: this.config?.secure, // true for 465, false for other ports
            auth:{
              user: this.config.user,
              pass: this.config.pass
            }     
          });
          const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            text: text
          };
          
          // Send the email
          const info = await transporter.sendMail(mailOptions);
          
          return info; // Return the result
        } else {
          return 'Invalid method';
        }

      }
    } catch (error) {
      console.error('Error in mailer datasource:', error); // Log error in datasource
      throw error;
    }
  }
}
const SourceType = 'DS';
const Type = "mailer"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "mailer"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {type: 'mailer', service: 'gmail', user: '', pass: ''};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}
