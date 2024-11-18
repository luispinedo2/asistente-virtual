import React, { useState } from 'react';
import './App.css';
import { getAIResponse } from './utils';
import ChatWindow from './components/ChatWindows';

function App() {
  const [chats, setChats] = useState([
    {
      id: 1,
      name: 'Chat 1',
      messages: [
        { sender: 'ai', text: 'Hola, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?' }
      ]
    }
  ]);
  const [currentChatId, setCurrentChatId] = useState(1);
  const [isTyping, setIsTyping] = useState(false);

  const createNewChat = () => {
    const newChatId = chats.length + 1;
    const newChat = {
      id: newChatId,
      name: `Chat ${newChatId}`,
      messages: [
        { sender: 'ai', text: 'Hola, soy tu asistente sexual. ¿En qué puedo ayudarte hoy?' }
      ]
    };
    setChats(prevChats => [...prevChats, newChat]);
    setCurrentChatId(newChatId);
  };

  const addMessage = async (messageText, sender) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === currentChatId) {
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

      const currentChat = chats.find(chat => chat.id === currentChatId);
      const aiResponse = await getAIResponse([...currentChat.messages, { sender, text: messageText }]);
      const cleanedResponse = aiResponse.replace(/\n/g, ' ').trim();
      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, { sender: 'ai', text: cleanedResponse }]
            };
          }
          return chat;
        })
      );
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-list">
        {chats.map(chat => (
          <button
            key={chat.id}
            className={chat.id === currentChatId ? 'active' : ''}
            onClick={() => setCurrentChatId(chat.id)}
          >
            {chat.name}
          </button>
        ))}
        <button onClick={createNewChat}>Nuevo Chat</button>
      </div>
      <ChatWindow
        currentChat={chats.find(chat => chat.id === currentChatId)}
        onSendMessage={messageText => addMessage(messageText, 'user')}
        isTyping={isTyping}
      />
    </div>
  );
}

export default App;
