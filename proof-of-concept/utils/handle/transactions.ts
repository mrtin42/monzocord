import { EmbedBuilder } from "discord.js";
import axios from "axios";

const handler = async (data: any) => {
    console.log('[PROCESS] Handling transaction');
    const transaction = data.data;

    const transactionDir = transaction.amount < 0 ? 'OUT' : 'IN';

    const embed = new EmbedBuilder()
        .setAuthor({
            name: transaction.merchant.name,
            iconURL: transaction.merchant.logo
        })
        // .setTitle(`£${Math.abs(transaction.amount / 100).toFixed(2)} ${transactionDir === 'OUT' ? 'to' : 'from'} ${transaction.merchant.name}`)
        .setTitle(`£${Math.abs(transaction.amount / 100).toFixed(2)} ${transactionDir === 'OUT' ? 'spent' : 'received'}`)
        .setDescription(`
            **Category**: ${transaction.category}\n
            **Notes**: ${transaction.notes}
        `)
        .setFooter({
            text: `Transaction made at ${new Date(transaction.created).toLocaleString()}`
        });
    
    // send to discord channel
    // TODO: change this handler to send to discord channel when the bot is fully fledged. for now, we use a webhook to test.
    const res = await axios.post('https://discord.com/api/webhooks/1313100061651112006/5e7SjiqB9qw9OgECN1DRTusgDHd0vJQV8YbT8U6JgcD73kpbwWoBys_cDpDC0iezkr2O', {
        embeds: [embed.toJSON()],
        content: `MONEY ${transactionDir}: £${Math.abs(transaction.amount / 100).toFixed(2)} ${transactionDir === 'OUT' ? 'on your card' : 'into your account'}`
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (res.status === 204) {
        console.log('[PROCESS] Transaction sent to discord');
        return;
    } else {
        console.log('[ERROR] Failed to send transaction to discord');
        return;
    }
};

export default handler;