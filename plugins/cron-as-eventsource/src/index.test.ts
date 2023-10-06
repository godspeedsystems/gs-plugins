import { expect } from 'chai';
import { EventSource, SourceType, Type, CONFIG_FILE_NAME, DEFAULT_CONFIG } from './index';
import { GSCloudEvent, GSStatus, GSActor } from "@godspeedsystems/core";
import { PlainObject } from "@godspeedsystems/core";

describe('EventSource', () => {
  let eventSource: EventSource;

  beforeEach(() => {
    // Initialize the EventSource with necessary parameters for testing
    eventSource = new EventSource({
      // Add any required parameters for initialization
    });
  });

  it('should initialize the cron client', async () => {
    const client = await eventSource.init();
    expect(client).to.exist;
    // Add more assertions based on your initialization logic
  });

  it('should subscribe to an event and execute the processEvent function', async () => {
    let eventExecuted = false;


    const processEvent = async (event: GSCloudEvent, eventConfig: PlainObject): Promise<GSStatus> => {
      // Add assertions based on your processEvent logic
      expect(event).to.exist;
      expect(eventConfig).to.exist;
      eventExecuted = true;
      return Promise.resolve();
    };

    const eventKey = 'some.schedule.timezone';
    const eventConfig = {};

    await eventSource.subscribeToEvent(eventKey, eventConfig, processEvent);
    // Add assertions based on your subscribeToEvent logic
    expect(eventExecuted).to.be.true;
  });

  it('should handle errors during subscription', async () => {
    const processEvent = async (event: any, eventConfig: any) => {
      // Add assertions based on your processEvent logic
      return Promise.resolve();
    };

    const eventKey = 'invalid.schedule.timezone';
    const eventConfig = {};

    // Mock the cron client to throw an error
    eventSource.client = {
      schedule: () => {
        throw new Error('Invalid cron schedule');
      },
    };

    // Add assertions based on how you handle errors during subscription
    await expect(eventSource.subscribeToEvent(eventKey, eventConfig, processEvent)).to.be.rejectedWith('Invalid cron schedule');
  });
});

// Add more test cases as needed
