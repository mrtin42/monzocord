import { ExportedCommand } from "@/utils/constants/types";
import { ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions, MessagePayload, SlashCommandBuilder } from "discord.js";

const command: ExportedCommand = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Am I alive?')
        .setContexts([0,1,2]),
    async execute(interaction: ChatInputCommandInteraction): Promise<InteractionEditReplyOptions> {
        return {
            content: 'HELLO YES I AM ALIVE',
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff4f40')
                    .setAuthor({
                        name: 'monzocord',
                        iconURL: 'https://cdn.sanity.io/images/rn4tswnp/production/0220ab893f5262b8024fb897d63f251bed0ef28d-1700x1250.jpg?w=2048&fit=max&auto=format'
                    })
                    .setTitle('Hello!')
                    .setDescription('pong :3')
                    .setThumbnail('https://cdn.sanity.io/images/rn4tswnp/production/e8989d47eb8c7074f254f8f7286c2b8bc36327b9-1693x1200.jpg?w=2048&fit=max&auto=format')
            ]
        };
    }
}

export { command };