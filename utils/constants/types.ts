import { InteractionEditReplyOptions, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";

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
        description: string,
        options: any[]
    } | SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    execute: (interaction: any, auth?: Auth ) => Promise<InteractionEditReplyOptions>,
    autocomplete?: (interaction: any, auth: Auth) => Promise<any>
}

type Auth = {
    token: string,
    refresh: string,
    user: string,
    expiry: Date,
}

export { DotEnv, ExportedCommand, Auth };