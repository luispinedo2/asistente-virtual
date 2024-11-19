import React, { useState, useEffect } from 'react';
import './App.css';
import { getAIResponse } from './utils';
import ChatWindow from './components/ChatWindows';

function App() {
  const [chats, setChats] = useState([
  ]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Cargar los chats al iniciar la aplicación
  useEffect(() => {
    const fetchChats = async () => {
      const response = await fetch('http://localhost:5000/api/chats');
      const data = await response.json();
      setChats(data);
      if (data.length > 0) {
        setCurrentChatId(data[0].chatId); // Seleccionar el primer chat por defecto
      }
    };
    fetchChats();
  }, []);

  const createNewChat = async () => {
    const newChatId = chats.length + 1;
    const newChat = {
      chatId: newChatId,
      name: `Chat ${newChatId}`,
      messages: [
        { sender: 'ai', text: 'Hola, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?' }
      ]
    };
    setChats(prevChats => [...prevChats, newChat]);
    setCurrentChatId(newChatId);

    // Guardar el nuevo chat en el backend
    await fetch('http://localhost:5000/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChat)
    });
  };

  const addMessage = async (messageText, sender) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.chatId === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, { sender, text: messageText }]
          };
        }
        return chat;
      })
    );

    if (sender === 'user') {
      setIsTyping(true);

      const currentChat = chats.find(chat => chat.chatId === currentChatId);
      const aiResponse = await getAIResponse([...currentChat.messages, { sender, text: messageText }]);
      const cleanedResponse = aiResponse.replace(/\n/g, ' ').trim();

      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat.chatId === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, { sender: 'ai', text: cleanedResponse }]
            };
          }
          return chat;
        })
      );

      setIsTyping(false);

      // Actualizar el chat en el backend
      await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: currentChatId,
          name: currentChat.name,
          messages: [...currentChat.messages, { sender: 'ai', text: cleanedResponse }]
        })
      });
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-list">
        {chats.map(chat => (
          <button
            key={chat.chatId}
            className={chat.chatId === currentChatId ? 'active' : ''}
            onClick={() => setCurrentChatId(chat.chatId)}
          >
            {chat.name}
          </button>
        ))}
        <button onClick={createNewChat}>Nuevo Chat</button>
      </div>
      {currentChatId && (
        <ChatWindow
          currentChat={chats.find(chat => chat.chatId === currentChatId)}
          onSendMessage={messageText => addMessage(messageText, 'user')}
          isTyping={isTyping}
        />
      )}
    </div>
  );
}

export default App;
