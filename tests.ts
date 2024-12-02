// test server that will take the information from a monzo webhook notification and send it to a discord channel.

import express from 'express'
import axios from 'axios'
import path from 'path'
import fs from 'fs'
import transactionHandler from './utils/handle/transactions'

const app = express();
const port = 42069; // HAHAHAHAHAH IM SO FUNNY

app.use(express.json());

app.get('/', (req, res) => {
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify({ message: 'working: time to test the webhook' }));
});

app.post('/webhook', async (req, res) => {
    console.log('[PROCCES] Received webhook notification');
    const webhookData = req.body;
    const type: string = req.body.type;

    console.log(`[PROCESS] Event type: ${type}`);

    if (type === 'transaction.created') {
        console.log('[PROCESS] Transaction created event received: passing to transaction handler');
        console.log('[DEBUG] webhookData:', webhookData);
        await transactionHandler(webhookData);
    } else {
        console.log('[PROCESS] Unknown event type: Adding to the undiscovered events list');
        // add to a txt file, if it already exists in the file, ignore it.
        const file = path.join(__dirname, 'undiscoveredEvents.txt');
        const undiscoveredEvents = fs.readFileSync(file, 'utf-8').split('\n');
        if (!undiscoveredEvents.includes(type)) {
            fs.appendFileSync(file, `${type}\n`);
            console.log(`[PROCESS] Added ${type} to the undiscovered events list`);
        } else {
            console.log(`[PROCESS] ${type} already exists in the undiscovered events list`);
        }
        /**
         * all unknown events will be added to a list of undiscovered events.
         * 
         * ill check it every now and then to see if there are any new events that need to be handled, and make the handler for them.
         * this way, i can keep track of all the events that monzo sends, and make sure that i can handle them all for the most feature
         * rich experience.
         */
    }
    res.status(200).header('Content-Type', 'application/json').send(JSON.stringify({ message: 'received' }));
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})