const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Conexión a MongoDB Atlas
const MONGO_URI = 'mongodb+srv://carlosperea:Looneytunes2001@cluster0.tcdwd.mongodb.net/ChatBot';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error al conectar a MongoDB', err));

// Crear el esquema y modelo de chat
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

// Ruta para obtener los chats
app.get('/api/chats', async (req, res) => {
    try {
        const chats = await Chat.find();
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los chats' });
    }
});

// Ruta para guardar o actualizar un chat
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
        res.json({ message: 'Chat guardado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar el chat' });
    }
});



// Iniciar el servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
