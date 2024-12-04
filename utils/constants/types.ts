import { InteractionEditReplyOptions, SlashCommandBuilder } from "discord.js";

interface DotEnv extends NodeJS.ProcessEnv {
    PORT: string,
    NODE_ENV: string,
    DISCORD_WEBHOOK_LINK: string,
    DISCORD_APP_ID: string,
    DISCORD_APP_TOKEN: string,
    MONZO_CLIENT_ID: string,
    MONZO_CLIENT_SECRET: string,
}

type ExportedCommand = {
    data: {
        name: string,
        contexts: number[],
        description: string
    } | SlashCommandBuilder,
    execute: (interaction: any) => Promise<InteractionEditReplyOptions>
}

export { DotEnv, ExportedCommand };