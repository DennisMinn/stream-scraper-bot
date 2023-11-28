# Twitch Stream Scraper

## Overview

This Node.js application, `app.ts`, is designed to scrape information from Twitch streams using the Twitch API. This repository gathers permissible and offensive Twitch chat messages and serves as the initial component for the Stream Guard Bot, a deep-learning moderation chatbot finely tuned using [OpenAI](https://platform.openai.com/docs/guides/fine-tuning). It utilizes the [tmi.js](https://github.com/tmijs/tmi.js) library for Twitch chat interactions and incorporates a `StreamScraperManager` to manage and log information about channels.

## Features

- **Chat Interaction**: The application connects to Twitch chat using the Twitch Messaging Interface (TMI) library. It listens for events like messages, timeouts, bans, and deleted messages.

- **Stream Information Scraping**: The application periodically fetches information about Twitch streams using the Twitch API. It retrieves data such as the channel name, category, and viewer count for streams that have more than 1000 views.

- **Automatic Channel Joining**: The application automatically joins Twitch channels based on the retrieved stream information. It ensures that the bot is present in channels with streams meeting the specified criteria.

- **Token Management**: The application handles Twitch API authentication by using OAuth tokens. It includes a token refresh mechanism to ensure continued access to the Twitch API.

## Prerequisites

Before running the application, make sure to set the following environment variables:

- `STREAM_SCRAPER_CLIENT_ID`: Twitch application client ID.
- `STREAM_SCRAPER_SECRET`: Twitch application client secret.
- `STREAM_SCRAPER_OAUTH_TOKEN`: Twitch OAuth token for authentication.
- `STREAM_SCRAPER_REFRESH_TOKEN`: Twitch OAuth refresh token for token refresh.

## Installation

1. Clone the repository: `git clone https://github.com/your/repository.git`
2. Install dependencies: `npm install`
3. Set the required environment variables in a `.env` file.

## Usage

Run the application using the following command:

```bash
npm start
