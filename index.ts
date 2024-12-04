/**
 * this is monzocord.
 */

let initialized = false;

// imports -------------------------------------------------- //
const vars: types.DotEnv = require('dotenv').config();        
import { ActivityType, Client, ClientPresence, Collection, Events, InteractionEditReplyOptions, MessagePayload, Presence, SlashCommandBuilder } from 'discord.js';                          
import { GatewayIntentBits } from 'discord.js';
import { deploy } from './utils/deploy';
import express from 'express';                                
import axios from 'axios';                                    
import path from 'path';                                      
import fs from 'fs';                                          
import transactionHandler from './utils/handle/transactions'; 
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
    if (!interaction.isChatInputCommand()) return console.error('[DISCORD] Interaction is not a chat input command, ignoring');
    const cmd: any = commands.collection.get(interaction.commandName)
    if (!cmd) {
        console.error(`[DISCORD] Command ${interaction.commandName} does not exist`);
        return interaction.reply({
            content: '🤔 This command does not exist.'
        });
    } else {
        try {
            console.log(`[DISCORD] Executing command ${interaction.commandName}`);
            await interaction.deferReply()
            const res: InteractionEditReplyOptions = await cmd.execute(interaction)
            await interaction.editReply(res)
            console.log(`[DISCORD] Command ${interaction.commandName} executed successfully`);
        } catch (e) {
            console.error('[PROCESS] exception occured:')
            console.error(e)
        }
    }
})

client.login(process.env.DISCORD_APP_TOKEN)
