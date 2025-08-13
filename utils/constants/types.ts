import { InteractionEditReplyOptions, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

interface DotEnv extends NodeJS.ProcessEnv {
    CALLBACK_SERVER_PORT: string,
    WEBHOOK_SERVER_PORT: string,
    NODE_ENV: string,
    DISCORD_APP_ID: string,
    DISCORD_USER_ID: string,
    DISCORD_APP_TOKEN: string,
    MONZO_CLIENT_ID: string,
    MONZO_CLIENT_SECRET: string,
}

type ExportedCommand = {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder,
    execute: (interaction: any, auth?: Auth ) => Promise<InteractionEditReplyOptions>,
    autocomplete?: (interaction: any, auth: Auth) => Promise<any>
}

type TransactionInfo = {
    when: Date,
    where: string,
    what: string,
    amount: number,
    currency: string,
    direction: 'in' | 'out',
}

type Auth = {
    token: string,
    refresh: string,
    user: string,
    expiry: Date,
}

export { DotEnv, ExportedCommand, TransactionInfo, Auth };