import { ExportedCommand } from "@/utils/constants/types";
import { Auth } from "@/utils/constants/types";
import axios, { AxiosResponse } from "axios";
import { ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import enable from "./enable";
import disable from "./disable";

const command: ExportedCommand = {
    data: new SlashCommandBuilder()
        .setName('notifications')
        .setDescription('Manage DM notifications for transaction events.')
        .setContexts([0, 1, 2])
        .addSubcommand(sub => sub
            .setName('enable')
            .setDescription('Enable DM notifications for transaction events.')
            .addStringOption(option => option.setName('account').setDescription('The account ID to fetch the balance for.').setRequired(true).setAutocomplete(true))
            .addBooleanOption(option => option.setName('public').setDescription('Set if the response should be visible to everyone. Default is false.').setRequired(false)))
        .addSubcommand(sub => sub
            .setName('disable')
            .setDescription('Disable DM notifications for transaction events.')
            .addStringOption(option => option.setName('stream').setDescription('The notification stream to disable. Included for bug-proofing.').setRequired(false).setAutocomplete(true))
            .addBooleanOption(option => option.setName('public').setDescription('Set if the response should be visible to everyone. Default is false.').setRequired(false))),
    async autocomplete(interaction: ChatInputCommandInteraction, auth: Auth): Promise<any> {
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
        const accs = accounts.data.accounts;
        if (interaction.options.getSubcommand() === 'enable') {
            return accs.map((account: any) => {
                return {
                    name: account.description,
                    value: account.id
                };
            });
        } else if (interaction.options.getSubcommand() === 'disable') {
            const streams = await axios.get(`https://api.monzo.com/webhooks/`, {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                },
                params: {
                    account_id: accs.find((acc: any) => acc.id.startsWith('acc_'))?.id
                }
            }).catch((error) => {
                console.error('[MONZO] Error fetching webhooks:', error);
                return [];
            }) as AxiosResponse<any>;
            if (!streams || !streams.data) {
                console.error('[MONZO] No streams found.');
                return [];
            }
            const data = streams.data.webhooks;
            return data.map((stream: any) => {
                return {
                    name: stream.id,
                    value: stream.id
                };
            });
        }
        return [];
    },
    async execute(interaction: ChatInputCommandInteraction, auth: Auth | undefined): Promise<InteractionEditReplyOptions> {
        if (!auth) {
            console.error('[PROCESS] No auth object provided');
            return {
                content: 'An error occurred: The authorization information was not provided. Please raise an issue on GitHub or contact the developer, as this is a bug.'
            };
        }
        if (interaction.options.getSubcommand() === 'enable') {
            return await enable(interaction, auth);
        } else if (interaction.options.getSubcommand() === 'disable') {
            return await disable(interaction, auth);
        } else {
            console.error('[PROCESS] Invalid subcommand provided.');
            return {
                content: 'An error occurred: Invalid subcommand provided.'
            };
        }
    }
}

export { command };