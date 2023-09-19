import { client as Client } from 'tmi.js';
import { StreamScraperManager } from './streamScraperManager.js';

const CLIENTID = process.env.STREAM_SCRAPER_CLIENT_ID;
const CLIENTSECRET = process.env.STREAM_SCRAPER_SECRET;

let accessToken = process.env.STREAM_SCRAPER_OAUTH_TOKEN;
let refreshToken = process.env.STREAM_SCRAPER_REFRESH_TOKEN;

// Define configuration options
const opts = {
  identity: {
    username: process.env.STREAM_SCRAPER_USERNAME,
    password: `oauth:${accessToken}`
  },
  channels: [
    process.env.STREAM_SCRAPER_USERNAME
  ]
};
const client = new Client(opts);
const manager = new StreamScraperManager();

// Logging
client.on('chat', (channel, userstate, message, self) => {
  void manager.getChannel(channel.substring(1))
    .then(channelBot => { channelBot.log(userstate.username, message); });
});

client.on('timeout', (channel, username, reason, duration, userstate) => {
  void manager.getChannel(channel.substring(1))
    .then(channelBot => { channelBot.log(username, 'TIMEOUT'); });
});

client.on('ban', (channel, username, reason, userstate) => {
  void manager.getChannel(channel.substring(1))
    .then(channelBot => { channelBot.log(username, 'BAN'); });
});

client.on('messagedeleted', (channel, username, deletedMessage, userstate) => {
  void manager.getChannel(channel.substring(1))
    .then(channelBot => { channelBot.log(username, `DELELTEDMESSAGE_${deletedMessage}`); });
});

client.connect();

async function refreshUserAccessToken (): Promise<undefined> {
  const url = 'https://id.twitch.tv/oauth2/token';
  const data = new URLSearchParams({
    client_id: CLIENTID,
    client_secret: CLIENTSECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: data
  };

  const response = await fetch(url, options);
  const token = await response.json();

  accessToken = token.access_token;
  refreshToken = token.refresh_token;
}

async function getStreams (): Promise<Array<{ channel: string, category: string, views: number }>> {
  const url = 'https://api.twitch.tv/helix/streams';
  const queryParameters = new URLSearchParams({
    language: 'en',
    first: '100',
    after: ''
  });
  const options = {
    headers: {
      'Client-ID': CLIENTID,
      Authorization: `Bearer ${accessToken}`
    }
  };

  let streams: Array<{ channel: string, category: string, views: number }> = [];
  while (true) {
    const query = queryParameters.toString();
    const response = await fetch(`${url}?${query}`, options);

    if (response.status === 401) {
      console.log(response.status);
      await refreshUserAccessToken();
      continue;
    }

    if (response.status === 429) {
      const ratelimitLimit = response.headers.get('ratelimit-limit');
      const ratelimitRemaining = response.headers.get('ratelimit-remaining');
      const ratelimitReset = response.headers.get('ratelimit-reset');
      console.log(response.status);
      console.log({ ratelimitLimit, ratelimitRemaining, ratelimitReset });
      break;
    }

    const { data, pagination } = await response.json();
    const extractedStreams = data.map(stream => ({
      channel: stream.user_login,
      category: stream.game_name,
      views: stream.viewer_count
    }));

    streams = streams.concat(extractedStreams);

    if (Object.keys(pagination).length === 0) {
      break;
    }
    queryParameters.set('after', pagination.cursor);
  }

  const filteredStreams = streams.filter(stream => stream.views > 100);
  return filteredStreams;
}

async function joinChannels (): Promise<undefined> {
  console.log('Updating Channels');
  const streams = await getStreams();
  for (const stream of streams) {
    if (manager.channels.has(stream.channel)) {
      const channelBot = await manager.getChannel(stream.channel);
      channelBot.category = stream.category;
      continue;
    }

    try {
      await client.join(stream.channel);
      await manager.addChannel(stream.channel);
      const channelBot = await manager.getChannel(stream.channel);
      channelBot.category = stream.category;
    } catch (error) {
      console.error(error);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log('Done Joining');
}