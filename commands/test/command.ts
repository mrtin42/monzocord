import { ExportedCommand } from "@/utils/constants/types";
import { Auth } from "@/utils/constants/types";
import axios, { AxiosResponse } from "axios";
import { ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions, MessagePayload, SlashCommandBuilder } from "discord.js";


const command: ExportedCommand = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping the Monzo Who Am I endpoint to verify the authorisation.')
        .setContexts([0,1,2]),
    async execute(interaction: ChatInputCommandInteraction, auth: Auth | undefined): Promise<InteractionEditReplyOptions> {
        const response = await axios.get('https://api.monzo.com/ping/whoami', {
            headers: {
                Authorization: `Bearer ${auth?.token}`
            }
        }).catch((error) => {
            console.error('[MONZO] Error fetching whoami:', error);
            return {
                content: 'An error occurred: There was an error fetching your whoami.'
            };
        }) as AxiosResponse<any>;

        if (!response || !response.data) {
            return {
                content: 'An error occurred: There was an error fetching your whoami.'
            };
        }

        const data = response.data;
        const embed = new EmbedBuilder()
            .setColor('#ff4f40')
            .setAuthor({
                name: 'monzocord',
                iconURL: 'https://cdn.sanity.io/images/rn4tswnp/production/0220ab893f5262b8024fb897d63f251bed0ef28d-1700x1250.jpg?w=2048&fit=max&auto=format'
            })
            .setTitle('Who Am I')
            .setDescription(`Your Monzo account ID is ${data.user_id}.\nThe client ID is ${data.client_id}.\nmonzocord **does${data.authenticated ? ' ' : ' not'}** have access to your Monzo account.`)
            .setFooter({
                text: 'This is a test command to verify the authorisation.'
            }).setTimestamp();

        return { embeds: [embed] };
    }
}



export { command };