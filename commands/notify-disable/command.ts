import { ExportedCommand } from "@/utils/constants/types";
import { Auth } from "@/utils/constants/types";
import axios, { AxiosResponse } from "axios";
import { ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions, SlashCommandBuilder } from "discord.js";

const command: ExportedCommand = {
    data: new SlashCommandBuilder()
        .setName('notifications-disable')
        .setDescription('Disable DM notifications for transaction events.')
        .setContexts([0,1,2])
        .addStringOption(option => option.setName('webhook_id').setDescription('The webhook ID to disable notifications for.').setRequired(true).setAutocomplete(true))
        .addBooleanOption(option => option.setName('public').setDescription('Set if the response should be visible to everyone. Default is false.').setRequired(false)),
    async autocomplete(interaction, auth) {
        const accounts = await axios.get('https://api.monzo.com/accounts', {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        }).catch((error) => {
            console.error('[MONZO] Error fetching accounts:', error);
            return [];
        }) as AxiosResponse<any>;

        if (!accounts || !accounts.data) {
            console.error('[MONZO] No accounts found.');
            return [];
        }

        const acc = accounts.data.accounts.find((account: any) => account.id.startsWith('acc_'));
        if (!acc) {
            console.error('[MONZO] No valid account found.');
            return [];
        }

        console.log(`[MONZO] Fetching webhooks for account ${acc.id}`);
        const webhooks = await axios.get('https://api.monzo.com/webhooks', {
            headers: {
                Authorization: `Bearer ${auth.token}`
            },
            params: {
                account_id: acc.id
            }
        }).catch((error) => {
            console.error('[MONZO] Error fetching webhooks:', error);
            return [];
        }) as AxiosResponse<any>;

        if (!webhooks || !webhooks.data) {
            console.error('[MONZO] No webhooks found.');
            return [];
        }

        const data = webhooks.data.webhooks;

        return data.map((webhook: any) => {
            return {
                name: webhook.id,
                value: webhook.id
            };
        });
    },
    async execute(interaction: ChatInputCommandInteraction, auth: Auth | undefined): Promise<InteractionEditReplyOptions> {
        if (!auth) {
            console.error('[PROCESS] No auth object provided');
            return {
                content: 'An error occurred: The authorisation information was not provided. Please raise an issue on GitHub or contact the developer, as this is a bug.'
            };
        }
        const webhookId = interaction.options.getString('webhook_id');
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
}

export { command };