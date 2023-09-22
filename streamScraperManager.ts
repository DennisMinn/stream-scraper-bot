import { StreamScraperBot } from './streamScraperBot.js';

export class StreamScraperManager {

  readonly channels: Map<string, StreamScraperBot>;

  constructor () {
    this.channels = new Map();
  }

  public addChannel (requestedChannel: string): void {
    if (this.channels.has(requestedChannel)) {
      return;
    }

    console.info(`Added ${requestedChannel}`);
    this.channels.set(requestedChannel, new StreamScraperBot(requestedChannel));
  }

  public removeChannel (requestedChannel: string): void {
    const channelBot = this.getChannel(requestedChannel);
    channelBot.writeStream.end();
    this.channels.delete(requestedChannel);
  }

  public getChannel (requestedChannel: string): StreamScraperBot {
    if (!this.channels.has(requestedChannel)) {
      this.addChannel(requestedChannel);
    }

    return this.channels.get(requestedChannel);
  }

}

export default StreamScraperManager;
