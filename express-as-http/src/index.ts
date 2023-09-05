import { PlainObject, GSActor, GSCloudEvent, GSStatus, GSEventSource, GSDataSource, GSContext } from "@godspeedsystems/core";
import express from "express";
import bodyParser from 'body-parser';
import _ from "lodash";

class ExpressEventSource extends GSEventSource {
  async initClient(): Promise<PlainObject> {
    const app = express();
    const {
      port = 3000,
      request_body_limit = 50 * 1024 * 1024,
      file_size_limit = 50 * 1024 * 1024
    } = this.config;

    app.use(bodyParser.urlencoded({ extended: true, limit: request_body_limit }));
    app.use(bodyParser.json({ limit: file_size_limit }));
    app.listen(port);
    return app;
  }

  subscribeToEvent(eventRoute: string, eventConfig: PlainObject, processEvent: (event: GSCloudEvent, eventConfig: PlainObject) => Promise<GSStatus>): Promise<void> {
    const routeSplit = eventRoute.split('.');
    const httpMethod: string = routeSplit[1];
    const endpoint = routeSplit[2].replace(/{(.*?)}/g, ':$1');
    const app: express.Express = this.client as express.Express;

    //@ts-ignore
    app[httpMethod](endpoint, async (req: express.Request, res: express.Response) => {
      const gsEvent: GSCloudEvent = ExpressEventSource.createGSEvent(req, endpoint)
      const status: GSStatus = await processEvent(gsEvent, eventConfig);
      res
        .status(status.code || 200)
        // if data is a integer, it takes it as statusCode, so explicitly converting it to string
        .send(Number.isInteger(status.data) ? String(status.data) : status.data);
    });
    return Promise.resolve();
  }

  static createGSEvent(req: express.Request, endpoint: string) {
    const reqProp = _.omit(req, [
      '_readableState',
      'socket',
      'client',
      '_parsedUrl',
      'res',
      'app'
    ]);
    const reqHeaders = _.pick(req, ['headers']);
    let data = { ...reqProp, ...reqHeaders };

    const event: GSCloudEvent = new GSCloudEvent(
      'id',
      endpoint,
      new Date(),
      'http',
      '1.0',
      data,
      'REST',
      new GSActor('user'),
      {}
    );

    return event;
  }
}

export {
  ExpressEventSource
}

// schema of your config YAML
// docker compose
// {{port}}
// questaionnaire

// godspeed plugin list, fetch all the plugins
// godspeed plugin add  <plugin-name>, node_modules/dist/questuonnaire.yaml
// generate answers
// fetch template from the same dist folder
// generate docker-compse section
// append it to out own docker compose

// godspeed plugin remove <plugin-name>