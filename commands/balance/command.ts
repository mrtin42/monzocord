import { ExportedCommand } from "@/utils/constants/types";
import { Auth } from "@/utils/constants/types";
import axios, { AxiosResponse } from "axios";
import { ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions, MessagePayload, SlashCommandBuilder } from "discord.js";

const command: ExportedCommand = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Get your Monzo balance.')
        .setContexts([0,1,2])
        .addStringOption(option => option.setName('account').setDescription('The account ID to fetch the balance for.').setRequired(true).setAutocomplete(true))
        .addBooleanOption(option => option.setName('public').setDescription('Set if the response should be visible to everyone. Default is false.').setRequired(false)),
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

        const data = accounts.data.accounts;

        return data.map((account: any) => {
            return {
                name: account.description,
                value: account.id
            };
        });
    },
    async execute(interaction: ChatInputCommandInteraction, auth: Auth | undefined): Promise<InteractionEditReplyOptions> {
        if (!auth) {
            console.error('[PROCESS] No auth object provided.');
            return {
                content: 'An error occurred: The authorisation information was not provided.'
        }; }
        if (!interaction.options.getString('account') || !interaction.options.getString('account')?.startsWith('acc_')) {
            console.error('[PROCESS] Empty or invalid account ID provided.');
            return {
                content: 'An error occurred: No account ID was provided.\n-# Make sure you chose an account from the list!'
            };
        }
        console.log(`[PROCESS] Fetching balance for user ${auth.user}...`);
        console.log('[MONZO] Fetching balance...');
        const response = await axios.get('https://api.monzo.com/balance', {
            headers: {
                Authorization: `Bearer ${auth.token}`
            },
            params: {
                account_id: interaction.options.getString('account')
            }
        }).catch((error) => {
            console.error('[MONZO] Error fetching balance:', error);
            return {
                content: 'An error occurred: There was an error fetching your balance.'
            };
        }) as AxiosResponse<any>;
        if (!response || !response.data) {
            return {
                content: 'An error occurred: There was an error fetching your balance.'
            };
        }
        console.log('[MONZO] Balance fetched.');
        const data = response.data 
        const bal = Math.abs(data.balance / 100).toFixed(2);
        const spent = Math.abs((data.spend_today * -1) / 100).toFixed(2);
        const total = Math.abs(data.total_balance / 100).toFixed(2);
        const currency = data.currency === 'GBP' ? '£' : '$'; // monzo currently only operates in the UK and USA, using their respective currencies.
        const embed = new EmbedBuilder()
            .setColor('#ff4f40')
            .setAuthor({
                name: 'monzocord',
                iconURL: 'https://cdn.sanity.io/images/rn4tswnp/production/0220ab893f5262b8024fb897d63f251bed0ef28d-1700x1250.jpg?w=2048&fit=max&auto=format'
            })
            .setTitle(`Your Monzo balance: ${currency}${bal}`)
            .setDescription(`You have spent ${currency}${spent} today.`)
            .setFooter({
                text: `Total balance (includes pots): ${currency}${total}`
            }).setTimestamp();
        return { embeds: [embed] };
    }
}

export { command };