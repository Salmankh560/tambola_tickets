const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Replace the connection string with your MongoDB connection string
const mongoUri = 'mongodb://127.0.0.1:27017/tambola_task';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Define the schema for Tambola tickets
const tambolaTicketSchema = new mongoose.Schema({
    set_id: Number,
    ticket_number: Number,
    numbers: [Number]
});

// Create the model based on the schema
const TambolaTicket = mongoose.model('TambolaTicket', tambolaTicketSchema);

// Express middleware to parse JSON requests
app.use(express.json());

// Function to generate a single Tambola ticket
function generateTambolaTicket(setId, ticketNumber) {
    return new TambolaTicket({
        set_id: setId,
        ticket_number: ticketNumber,
        numbers: Array.from({ length: 9 }, () => Math.floor(Math.random() * 90) + 1)
    });
}

// Function to generate N Tambola sets
async function generateTambolaSets(numSets) {
    const tickets = [];
    for (let i = 11; i <= 10 + numSets; i++) {
        for (let j = 1; j <= 6; j++) {
            const ticket = generateTambolaTicket(i, j);
            tickets.push(ticket);
        }
    }
    return TambolaTicket.insertMany(tickets);
}

// Number of Tambola sets to generate (change this value as needed)
const numSetsToGenerate = 3;

// Generate Tambola sets
generateTambolaSets(numSetsToGenerate)
    .then(() => {
        console.log('Tambola sets generated successfully');
    })
    .catch((error) => {
        console.error('Error generating Tambola sets:', error);
    })


// GET endpoint for retrieving Tambola tickets with pagination
app.get('/tambola_tickets', async (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;

    try {
        const tickets = await TambolaTicket.find()
            .skip((page - 1) * pageSize)
            .limit(Number(pageSize))
            .exec();

        // Transform the data into the desired format
        const formattedTickets = tickets.map((ticket) => ({
            setId: ticket.set_id,
            ticketNumber: ticket.ticket_number,
            numbers: ticket.numbers
        }));

        res.json({ tickets: formattedTickets });
    } catch (error) {
        console.error('Error fetching Tambola tickets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the Express server after generating tickets
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
