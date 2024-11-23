const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// MongoDB Atlas connection
const MONGO_URI = 'mongodb+srv://carlosperea:Looneytunes2001@cluster0.tcdwd.mongodb.net/ChatBot';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Error connecting to MongoDB', err));

// Chat schema and model
const chatSchema = new mongoose.Schema({
    chatId: Number,
    name: String,
    messages: [
        {
            sender: String,
            text: String
        }
    ]
});

const Chat = mongoose.model('Chat', chatSchema);

const app = express();
app.use(cors());
app.use(express.json());

// Get all chats
app.get('/api/chats', async (req, res) => {
    try {
        const chats = await Chat.find().sort({ chatId: 1 });
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving chats' });
    }
});

// Get maximum chatId
app.get('/api/chats/maxChatId', async (req, res) => {
    try {
        const maxChat = await Chat.findOne().sort({ chatId: -1 });
        const maxChatId = maxChat ? maxChat.chatId : 0;
        res.json({ maxChatId });
    } catch (err) {
        res.status(500).json({ error: 'Error getting maximum chatId' });
    }
});

// Save or update chat
app.post('/api/chats', async (req, res) => {
    const { chatId, name, messages } = req.body;

    try {
        const existingChat = await Chat.findOne({ chatId });
        if (existingChat) {
            existingChat.messages = messages;
            await existingChat.save();
        } else {
            const newChat = new Chat({ chatId, name, messages });
            await newChat.save();
        }
        res.json({ message: 'Chat saved successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error saving chat' });
    }
});

// Delete chat
app.delete('/api/chats/:chatId', async (req, res) => {
    const { chatId } = req.params;

    try {
        await Chat.deleteOne({ chatId: parseInt(chatId) });
        res.json({ message: 'Chat deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting chat' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});