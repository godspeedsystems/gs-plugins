import { GSContext,  GSDataSource, PlainObject,} from "@godspeedsystems/core";
import nodemailer from 'nodemailer';

export default class DataSource extends GSDataSource {
protected async initClient(): Promise<object> {
  return nodemailer;
}

async execute(ctx: GSContext, args: PlainObject): Promise<any> {
    
  try {
    const {
      from,
      to,
      subject,
      text,
      meta: { fnNameInWorkflow },
    } = args;
    let method = fnNameInWorkflow.split(".")[2];
    if (this.client) {
      if(method == "send"){
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: this.config.user,
            pass: this.config.pass // Use the App Password you generated
          }
        });
        const mailOptions = {
          from: from,
          to: to,
          subject: subject,
          text: text
        };
        
        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log(info.response);
          }
        });
      }else{
        return 'Invalid method'
      }
      
    }
  } catch (error) {
    throw error;
  }
}
}
const SourceType = 'DS';
const Type = "mailer"; // this is the loader file of the plugin, So the final loader file will be `types/${Type.js}`
const CONFIG_FILE_NAME = "mailer"; // in case of event source, this also works as event identifier, and in case of datasource works as datasource name
const DEFAULT_CONFIG = {};

export {
  DataSource,
  SourceType,
  Type,
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG
}