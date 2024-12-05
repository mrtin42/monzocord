import fs from 'fs';
import path from 'path';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import * as types from '@/utils/constants/types';

const vars = process.env as types.DotEnv;

export const deploy = async (commands: any) => {
    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(vars.DISCORD_APP_TOKEN);
    
    // and deploy your commands!
    (async () => {
        try {
            console.log(`[PROCESS] Deploying ${commands.length} commands to Discord`);
    
            // The put method is used to fully refresh all commands in the guild with the current set
            const data: any = await rest.put(
                Routes.applicationCommands(vars.DISCORD_APP_ID),
                { body: commands }
            );
    
            console.log(`[PROCESS] Successfully deployed ${data.length} commands to Discord!`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();
}