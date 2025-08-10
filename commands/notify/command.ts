import { ExportedCommand } from "@/utils/constants/types";
import { Auth } from "@/utils/constants/types";
import axios, { AxiosResponse } from "axios";
import { ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions, SlashCommandBuilder } from "discord.js";

const command: ExportedCommand = {
    data: new SlashCommandBuilder()
        .setName('notifications-enable')
        .setDescription('Enable DM notifications for transaction events.')
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
            console.error('[PROCESS] No auth object provided');
            return {
                content: 'An error occured: The authorisartion information was not provided. Please raise an issue on GitHub or contact the developer, as this is a bug.'
        }; }
        if (!interaction.options.getString('account') || !interaction.options.getString('account')?.startsWith('acc_')) {
            console.error('[PROCESS] Empty or invalid account ID provided.');
            return {
                content: 'An error occurred: No account ID was provided.\n-# Make sure you chose an account from the list!'
        }; }
        console.log(`[PROCESS] Registering webhook for user ${auth.user}`);
        console.log(`[MONZO] Checking registered webhooks:`)
        const url = `https://api.monzo.com/`
        const response = await axios.get(`${url}webhooks/`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            },
            params: {
                account_id: interaction.options.getString('account')
            }
        }).catch((err) => {
            console.error('[MONZO] Error fetching balance:', err)
            return {
                content: 'An error occured: there was an error fetching any existing webhooks.'
            };
        }) as AxiosResponse<any>;
        if (!response || !response.data) {
            return {
                content: 'An error occured: there was an error fetching any existing webhooks.'
            }
        }
        console.log(response.data);
        console.log('[MONZO] Webhooks fetched.')
        const { data } = response;
        const whUrl = `${process.env.WEBHOOK_SERVER_URL}monzo/`;
        if (
            data.webhooks &&
            data.webhooks.some(
                (wh: any) =>
                    wh.account_id === interaction.options.getString('account') &&
                    wh.url === whUrl
            )
        ) {
            console.log('[MONZO] This webhook URL is already registered for this account.');
            return {
                content: 'This webhook URL is already registered for this account.'
            };
        }
        const fd = new URLSearchParams();
        fd.append('account_id', interaction.options.getString('account') as string)
        fd.append('url', `${process.env.WEBHOOK_SERVER_URL}monzo/`);
        const setUpUrl = `${url}webhooks/`;
        const webhookUrl = `${process.env.WEBHOOK_SERVER_URL}monzo/`;
        const webhookResponse = await axios.post(`${setUpUrl}`, fd, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'User-Agent': 'Monzocord/1.0',
                Authorization: `Bearer ${auth.token}`
            },
            // params: {
            //     account_id: interaction.options.getString('account'),
            //     url: webhookUrl,
            // }
        }).catch((err) => {
            console.error('[MONZO] Error setting up webhook:', err);
            return {
                content: 'An error occurred: there was an error setting up your webhook.'
            };
        }) as AxiosResponse<any>;
        if (!webhookResponse || !webhookResponse.data) {
            return {
                content: 'An error occurred: there was an error setting up your webhook.'
            };
        }
        console.log(`[MONZO] Webhook set up successfully:`, webhookResponse.data);
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Webhook Registered')
            .setDescription(`You have successfully registered a webhook for account **${interaction.options.getString('account')}**.`)
            .addFields(
                { name: 'Webhook URL', value: webhookUrl, inline: false },
                { name: 'Account ID', value: interaction.options.getString('account') as string, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Monzo Webhook Registration' });
        return {
            embeds: [embed],
            content: interaction.options.getBoolean('public') ? undefined : 'Webhook registered successfully!',
        };
    },
}

export { command };