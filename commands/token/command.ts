import { ExportedCommand } from "@/utils/constants/types";
import { Auth } from "@/utils/constants/types";
import { ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions, MessagePayload, SlashCommandBuilder } from "discord.js";


const command: ExportedCommand = {
    data: new SlashCommandBuilder()
        .setName('token')
        .setDescription('Print the active token to the bot console. Your token is sensitive and thus is not sent to Discord.')
        .setContexts([0,1,2]),
    async execute(interaction: ChatInputCommandInteraction, auth: Auth | undefined): Promise<InteractionEditReplyOptions> {
        if (!auth) {
            console.error('[PROCESS] No auth object provided');
            return {
                content: 'An error occurred: The authorisation information was not provided. Please raise an issue on GitHub or contact the developer, as this is a bug.'
            };
        }

        console.log(`[PROCESS] Active token for user ${auth.user}: ${auth.token}`);
        return {
            content: 'The active token has been printed to the console. To protect your privacy, it is not sent through Discord.'
        };
    }
}

export { command };