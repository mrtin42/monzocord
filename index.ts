/**
 * this is monzocord.
 */

let initialized = false;

// let token: string;
// let refresh: string;
// let user: string;
// let expiry: Date;

let auth: types.Auth = {
    token: '',
    refresh: '',
    user: '',
    expiry: new Date()
}

// imports -------------------------------------------------- //
const vars: types.DotEnv = require('dotenv').config();        
import { ActionRowBuilder, ActivityType, ButtonBuilder, ButtonStyle, Client, ClientPresence, Collection, EmbedBuilder, Events, InteractionEditReplyOptions, MessagePayload, Presence, SlashCommandBuilder } from 'discord.js';                          
import { GatewayIntentBits } from 'discord.js';
import { deploy } from './utils/deploy';
import express from 'express';                                
import axios from 'axios';                                    
import path from 'path';                                      
import fs from 'fs';
import * as types from './utils/constants/types';             
// ---------------------------------------------------------- //


console.log(`[PROCESS] Welcome to monzocord`);
console.log('[PROCESS] Declaring Discord.js client')
// client set up
const client = new Client({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
});

const commands: {
    collection: Collection<string, types.ExportedCommand>,
    data: any[]
} = {
    collection: new Collection(),
    data: []
}
const commandsDirectoryPath = path.join(__dirname, './commands');
console.log('[PROCESS] Assembling command library');

for (const folder of fs.readdirSync(commandsDirectoryPath)) {
    console.log(`[PROCESS] Processing ${folder}`);
    const cmdPath = path.join(commandsDirectoryPath, folder);
    const files = fs.readdirSync(cmdPath).filter(file => file == 'command.ts');
    for (const file of files) {
        console.log('[PROCESS] Found the following files:')

        const filePath = path.join(cmdPath, file);
        const module = require(filePath);
        const command: types.ExportedCommand | any = module.command;
        if ('data' in command && 'execute' in command) {
            console.log(`[PROCESS] Adding ${command.data.name} to command library`);
            commands.collection.set(command.data.name, command);
            if (command.data instanceof SlashCommandBuilder) {
                commands.data.push(command.data.toJSON() as any)
            }
        } else if (!('data' in command) && 'execute' in command) {
            console.error(`[PROCESS] Could not add the command in ${filePath} to the command library: missing command data`);
        } else if (!('execute' in command) && 'data' in command) { 
            console.error(`[PROCESS] Could not add command ${command.data.name} in ${filePath} to the command library: missing execute function`);
        } else if (!('execute' in command) && !('data' in command)) {
            console.error(`[PROCESS] Could not add the command in ${filePath} to the command library: missing command data and execute function`);
        }
    }
}

// chosen to define the login command here in the index file, as it is a core command that uses locally scoped variables to run
const loginCommand: types.ExportedCommand = {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Log in to Monzo. For your security this command is always ephemeral.')
        .setContexts([0,1,2]),
    async execute(interaction: any): Promise<InteractionEditReplyOptions> {
        console.log('[DISCORD] Login command received');
        console.log('[PROCESS] Generating state token');
        const state = Math.random().toString(36).substring(7);
        console.log('[PROCESS] Generating login URL');
        const loginUrl = `https://auth.monzo.com/?client_id=${process.env.MONZO_CLIENT_ID}&redirect_uri=${process.env.MONZO_REDIRECT_URI}&response_type=code&state=${state}`;
        console.log('[DISCORD] Setting buttons');
        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel('Log in')
            .setURL(loginUrl);
        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents([button])
        console.log('[PROCESS] Initialising callback server');
        if (!initialized) {
            const app = express();
            app.get('/static/css/style.css', (req, res) => {
                res.sendFile(path.join(__dirname, './static/css/style.css'));
            });
            app.get('/callback', async (req, res) => {
                console.log('[PROCESS] Callback received');
                const code = req.query.code;
                const received = req.query.state;
                if (received !== state) {
                    console.error('[PROCESS] State token mismatch: possible CSRF attack');
                    console.error(`[PROCESS] ABORTING LOGIN PROCESS AND NOTIFYING USER`);
                    const page = fs.readFileSync(path.join(__dirname, './static/html/csrf.html'), 'utf8');
                    interaction.editReply({ embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: 'monzocord', iconURL: 'https://cdn.sanity.io/images/rn4tswnp/production/0220ab893f5262b8024fb897d63f251bed0ef28d-1700x1250.jpg?w=2048&fit=max&auto=format' })
                            .setTitle('An error occurred!')
                            .setDescription(`We had to abort your login process since we couldn't verify the authenticity of the request.\n\nPlease try again.`)
                            .setColor('#ff4f40')
                    ], components: [] });
                    return res.status(400).send(page);
                }
                console.log('[PROCESS] Requesting access token');
                const params = new URLSearchParams();
                params.append('grant_type', 'authorization_code');
                params.append('client_id', process.env.MONZO_CLIENT_ID as string);
                params.append('client_secret', process.env.MONZO_CLIENT_SECRET as string);
                params.append('redirect_uri', process.env.MONZO_REDIRECT_URI as string);
                params.append('code', code as string);
                const response = await axios.post('https://api.monzo.com/oauth2/token', params, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).catch(e => {
                    console.error('[PROCESS] Failed to get access token');
                    console.error(e);
                    const page = fs.readFileSync(path.join(__dirname, './static/html/failed.html'), 'utf8');
                    res.status(400).send(page);
                    return interaction.editReply({ embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: 'monzocord', iconURL: 'https://cdn.sanity.io/images/rn4tswnp/production/0220ab893f5262b8024fb897d63f251bed0ef28d-1700x1250.jpg?w=2048&fit=max&auto=format' })
                            .setTitle('An error occurred!')
                            .setDescription(`We had trouble logging you in. Please try again.`)
                            .setColor('#ff4f40')
                    ], components: [] });
                });
                if (response.status !== 200) {
                    console.error('[PROCESS] Failed to get access token');
                    console.error(response.data);
                    const page = fs.readFileSync(path.join(__dirname, './static/html/failed.html'), 'utf8');
                    res.status(400).send(page);
                    return interaction.editReply({ embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: 'monzocord', iconURL: 'https://cdn.sanity.io/images/rn4tswnp/production/0220ab893f5262b8024fb897d63f251bed0ef28d-1700x1250.jpg?w=2048&fit=max&auto=format' })
                            .setTitle('An error occurred!')
                            .setDescription(`We had trouble logging you in. Please try again.`)
                            .setColor('#ff4f40')
                    ], components: [] });
                }
                console.log('[PROCESS] Access token received');
                console.log('[PROCESS] Saving access token: ', response.data.access_token);
                auth.token = response.data.access_token;
                console.log('[PROCESS] Saving refresh token: ', response.data.refresh_token);
                auth.refresh = response.data.refresh_token;
                console.log('[PROCESS] Saving user ID: ', response.data.user_id);
                auth.user = response.data.user_id;
                console.log('[PROCESS] Saving access token expiry: ', new Date(Date.now() + response.data.expires_in * 1000));
                auth.expiry = new Date(Date.now() + response.data.expires_in * 1000);
                console.log('[PROCESS] Initiating refresh token rotation: ', response.data.expires_in * 1000);
                setInterval(async () => {
                    console.log('[PROCESS] Refreshing access token');
                    const response = await axios.post('https://api.monzo.com/oauth2/token', {
                        grant_type: 'refresh_token',
                        client_id: process.env.MONZO_CLIENT_ID,
                        client_secret: process.env.MONZO_CLIENT_SECRET,
                        refresh_token: auth.refresh
                    });
                    console.log('[PROCESS] Access token refreshed');
                    console.log('[PROCESS] Saving access token');
                    auth.token = response.data.access_token;
                    console.log('[PROCESS] Saving refresh token');
                    auth.refresh = response.data.refresh_token;
                    console.log('[PROCESS] Saving access token expiry');
                    auth.expiry = new Date(Date.now() + response.data.expires_in * 1000);
                }, response.data.expires_in * 1000);
                console.log('[PROCESS] Sending success page');
                const page = fs.readFileSync(path.join(__dirname, './static/html/success.html'), 'utf8');
                res.status(200).send(page);
                console.log('[MONZO] Pinging whoami endpoint');
                const whoami = await axios.get('https://api.monzo.com/ping/whoami', {
                    headers: {
                        Authorization: `Bearer ${auth.token}`
                    }
                });
                console.log('[MONZO] whoami response:', whoami.data);
                console.log('[DISCORD] Sending success message');
                interaction.editReply({ embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: 'monzocord', iconURL: 'https://cdn.sanity.io/images/rn4tswnp/production/0220ab893f5262b8024fb897d63f251bed0ef28d-1700x1250.jpg?w=2048&fit=max&auto=format' })
                        .setTitle('Success!')
                        .setDescription(`You've successfully logged in to monzocord!`)
                        .setColor('#ff4f40')
                ], components: [] });
                initialized = true;
                console.log('[DISCORD] Message sent');
                console.log('[PROCESS] Initialisation complete: all commands now available');
                console.log('[PROCESS] Callback server shutting down');
                server.close();
            });

            const server = app.listen(process.env.PORT, () => {
                console.log(`[PROCESS] Callback server listening on port ${process.env.PORT}`);
                const shutdown = () => {
                    console.log('[PROCESS] Shutting down callback server');
                }
            });
            return {
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: 'monzocord', iconURL: 'https://cdn.sanity.io/images/rn4tswnp/production/0220ab893f5262b8024fb897d63f251bed0ef28d-1700x1250.jpg?w=2048&fit=max&auto=format' })
                        .setTitle('Welcome to monzocord!')
                        .setDescription(`You're one step closer to using the least efficient way to view your Monzo account. Just hit the button below to log in!`)
                        .setThumbnail('https://cdn.sanity.io/images/rn4tswnp/production/e8989d47eb8c7074f254f8f7286c2b8bc36327b9-1693x1200.jpg?w=2048&fit=max&auto=format')
                        .setColor('#ff4f40')
                ],
                components: [actionRow]
            }
        } else {
            return {
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: 'monzocord', iconURL: 'https://cdn.sanity.io/images/rn4tswnp/production/0220ab893f5262b8024fb897d63f251bed0ef28d-1700x1250.jpg?w=2048&fit=max&auto=format' })
                        .setTitle('Error!')
                        .setDescription(`You're already logged in!`)
                        .setColor('#ff4f40')
                ],
                components: []
            }
        }
    }
}

commands.collection.set(loginCommand.data.name, loginCommand);
commands.data.push(loginCommand.data instanceof SlashCommandBuilder ? loginCommand.data.toJSON() as any : loginCommand.data);

deploy(commands.data);

client.on(Events.ClientReady, (e) => {
    console.log('[PROCESS] Client is ready');
    console.log('[DISCORD] Logged in as', client.user?.tag);
    client.user?.setPresence({
        status: 'dnd',
        activities: [{
            type: ActivityType.Custom,
            name: 'stealing your credit cards'
        }]
    })
})

client.on(Events.InteractionCreate, async (interaction) => {
    console.log('[DISCORD] Interaction received');
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return console.error('[DISCORD] Interaction is not a command or autocomplete');
    const cmd: any = commands.collection.get(interaction.commandName)
    if (!cmd) {
        console.error(`[DISCORD] Command ${interaction.commandName} does not exist`);
        if (interaction.isChatInputCommand()) { return interaction.reply({
            content: '🤔 This command does not exist.'
        }) } else { return };
    } else {
        try {
            if (interaction.isAutocomplete()) {
                const res = await cmd.autocomplete(interaction, auth);
                return interaction.respond(res);
            } else {
                if (!initialized && interaction.commandName !== 'login') {
                    await interaction.reply({
                        content: '🔒 Please log in first.',
                        ephemeral: true
                    });
                } else {
                    const ephemeral = interaction.options.getBoolean('public') ?? false;
                    console.log(`[DISCORD] Executing command ${interaction.commandName}`);
                    await interaction.deferReply({
                        ephemeral: !ephemeral
                    })
                    const res: InteractionEditReplyOptions = await cmd.execute(interaction, auth);
                    await interaction.editReply(res)
                    console.log(`[DISCORD] Command ${interaction.commandName} executed successfully`);
                }
            }
        } catch (e) {
            console.error('[PROCESS] exception occured:')
            console.error(e)
        }
    }
})

client.login(process.env.DISCORD_APP_TOKEN)
