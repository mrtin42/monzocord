// Monzocord.
//
// Monzocord is a self-host only Discord bot that provides an easy, simple, and secure way to view your Monzo finances.
// The bot is built using the Discord.js library and the Monzo API.
// 
// The bot is designed to be self-hosted and is not intended for public use, as stressed by the Monzo API terms of service.
// It also means OAuth2 for granting access to your Monzo account is simplified and secure.
//
// Entry point and bot initialisation.
// 1. Load environment variables.
// 2. Create a new Discord client.
// 3. Load commands and events.
// 4. Login to Discord.
//
// To set up the bot, the user will need to install the Monzocord bot as a user application. Server implementations are not
// supported to maximise user privacy. They will also need to set up a Monzo developer account and create a new OAuth2 client
// application. The user will need to set up the environment variables in a .env file in the root directory of the bot.
// The environment variables are:
// - DISCORD_TOKEN: The Discord bot token.
// - MONZO_CLIENT_ID: The Monzo OAuth2 client ID.
// - MONZO_CLIENT_SECRET: The Monzo OAuth2 client secret.
// - MONZO_REDIRECT_URI: The Monzo OAuth2 redirect URI.
//
// Once this is done, the user can run the bot using the command `npm start`, and begin authorising the bot to access their
// Monzo account using the `/init` command.
// The bot will reply with a link to authorise the bot client to access the user's Monzo account. The user will need to visit
// this link and authorise the bot client. Once this is done, the user will be redirected to the redirect URI, which will
// contain the authorisation code. The bot will automatically exchange this code for an access token and refresh token, and
// store these in the bot's database. The bot will be ready to use once the user then opens their Monzo app and authorises
// the data access.
//
// Obviously, the bot will NOT be able to do anything to the user's money. The bot is read-only and can only view the user's
// transactions, balance, and other information. The only changes the bot is capable of making is webhook subscriptions.
//
// The bot is designed to be simple and secure, and the user's data is never stored on the bot's servers. The bot only stores
// the access token and refresh token, and these are stored securely in the local database. Prospects for a future version
// may include a public version of the bot, but due to database privacy and security concerns, this will take a long time.
//
// Let's get started!

// Load environment variables.

