import { StreamScraperBot } from './streamScraperBot.js';

export const joinChannelCommand = '!guard';
export const leaveChannelCommand = '!discharge';

export class StreamScraperManager {

  readonly channels: Map<string, StreamScraperBot>;

  constructor () {
    this.channels = new Map();
  }

  public async addChannel (requestedChannel: string): Promise<void> {
    if (this.channels.has(requestedChannel)) {
      return;
    }

    this.channels.set(requestedChannel, new StreamScraperBot(requestedChannel));
  }

  public async removeChannel (requestedChannel: string): Promise<void> {
    const channelBot = await this.getChannel(requestedChannel);
    channelBot.writeStream.end();
    this.channels.delete(requestedChannel);
  }

  public async getChannel (requestedChannel: string): Promise<StreamScraperBot> {
    if (!this.channels.has(requestedChannel)) {
      await this.addChannel(requestedChannel);
    }

    return this.channels.get(requestedChannel);
  }

}

export default StreamScraperManager;
