import { Auth } from "@/utils/constants/types";
import axios, { AxiosResponse } from "axios";
import { ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions, SlashCommandBuilder } from "discord.js";

export default async (interaction: ChatInputCommandInteraction, auth: Auth): Promise<InteractionEditReplyOptions> => {
    if (!auth) {
        console.error('[PROCESS] No auth object provided');
        return {
            content: 'An error occurred: The authorisation information was not provided. Please raise an issue on GitHub or contact the developer, as this is a bug.'
        };
    }
    const webhookId = interaction.options.getString('stream');
    if (!webhookId) {
        console.error('[PROCESS] Empty webhook ID provided.');
        return {
            content: 'An error occurred: No webhook ID was provided.'
        };
    }
    console.log(`[PROCESS] Disabling notifications for webhook ID ${webhookId} for user ${auth.user}`);
    
    const url = `https://api.monzo.com/webhooks/${webhookId}`;
    await axios.delete(url, {
        headers: {
            Authorization: `Bearer ${auth.token}`
        }
    }).catch((err) => {
        console.error('[MONZO] Error disabling notifications:', err);
        return {
            content: 'An error occurred while trying to disable notifications. Please try again later.'
        };
    });

    console.log(`[MONZO] Notifications disabled for webhook ID ${webhookId}`);
    return {
        content: `Notifications have been successfully disabled for webhook ID \`${webhookId}\`.`
    };
}