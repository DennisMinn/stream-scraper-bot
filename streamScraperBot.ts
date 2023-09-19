import { createWriteStream } from 'fs';
import type { WriteStream } from 'fs';

export class StreamScraperBot {

  readonly channel: string;
  public category: string;
  public writeStream: WriteStream;

  constructor (channel) {
    this.channel = channel;
    this.writeStream = createWriteStream(`data/${this.channel}.tsv`, { flags: 'a' });
  }

  public log (username: string, message: string): void {
    const timestamp = new Date().toISOString();
    const data = `${timestamp}\t${this.category}\t${username}\t${message}\n`;

    try {
      this.writeStream.write(data);
    } catch (error) {
      console.error(error);
    }
  }

}
