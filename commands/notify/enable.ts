import { Auth } from "@/utils/constants/types";
import axios, { AxiosResponse } from "axios";
import { ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions, SlashCommandBuilder } from "discord.js";

export default async (interaction: ChatInputCommandInteraction, auth: Auth): Promise<InteractionEditReplyOptions> => {
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
            content: 'An error occurred: there was an error setting up the webhook.'
        };
    }
    console.log(`[MONZO] Webhook set up successfully:`, webhookResponse.data);
    const feedItem = new URLSearchParams();
    feedItem.append('account_id', interaction.options.getString('account') as string);
    feedItem.append('type', 'basic');
    feedItem.append('params[title]', 'Discord notifications enabled');
    feedItem.append('params[body]', 'You will now receive DMs via Monzocord for transactions made on this account. Contact Monzo support if you do not recognise this.');
    feedItem.append('params[image_url]', 'https://support.discord.com/hc/user_images/PRywUXcqg0v5DD6s7C3LyQ.jpeg');
    feedItem.append('params[webhook_id]', webhookResponse.data.id);
    const feedUrl = `${url}feed`;
    await axios.post(feedUrl, feedItem, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'User-Agent': 'Monzocord/1.0',
            Authorization: `Bearer ${auth.token}`
        }
    }).catch((err) => {
        console.error('[MONZO] Error sending feed item. Not critical, proceeding with webhook registration:', err);
        // Not critical, we can still proceed with the webhook registration
    });
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Notifications enabled')
        .setDescription(`DM notifications for transaction events have been successfully enabled for your account.`)
        .setTimestamp()
        .setFooter({ text: `Webhook ID: ${webhookResponse.data.webhook.id}` });
    return {
        embeds: [embed],
        content: interaction.options.getBoolean('public') ? undefined : 'Webhook registered successfully!',
    };
}

// account_id	"acc_0000Ansh1Wpx8y42dHFGIj"
// params[body]	"Is this real life?"
// params[image_url]	"http://www.nyan.cat/cats/original.gif"
// params[title]	"Hullo from the API console"
// type	"basic"