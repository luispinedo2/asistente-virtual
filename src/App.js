import React, { useState, useEffect } from 'react';
import './App.css';
import { getAIResponse } from './utils';
import ChatWindow from './components/ChatWindows';

function App() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Cargar los chats al iniciar la aplicación
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chats');
        const data = await response.json();

        if (data.length > 0) {
          setChats(data);
          setCurrentChatId(data[data.length - 1].chatId);
        } else {
          const defaultChat = {
            chatId: 1,
            name: 'Chat 1',
            messages: [
              { sender: 'ai', text: 'Hola, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?' }
            ]
          };

          setChats([defaultChat]);
          setCurrentChatId(1);

          await fetch('http://localhost:5000/api/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(defaultChat)
          });
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();
  }, []);

  const createNewChat = async () => {
    try {
      // Calcular el nuevo chatId basado en los chats existentes
      const maxChatId = chats.length > 0
        ? Math.max(...chats.map(chat => chat.chatId))
        : 0;

      const newChatId = maxChatId + 1;
      const newChat = {
        chatId: newChatId,
        name: `Chat ${newChatId}`,
        messages: [
          { sender: 'ai', text: 'Hola, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?' }
        ]
      };

      // Actualizar el estado local primero
      setChats(prevChats => [...prevChats, newChat]);
      setCurrentChatId(newChatId);

      // Guardar en el backend
      const response = await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChat)
      });

      if (!response.ok) {
        throw new Error('Error al crear nuevo chat');
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      // Aquí podrías agregar un manejo de errores más amigable para el usuario
    }
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
      const updatedMessages = [...currentChat.messages, { sender, text: messageText }];

      try {
        // Actualizar el backend con la pregunta del usuario
        await fetch('http://localhost:5000/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: currentChatId,
            name: currentChat.name,
            messages: updatedMessages
          })
        });

        const aiResponse = await getAIResponse(updatedMessages);
        const cleanedResponse = aiResponse.replace(/\n/g, ' ').trim();

        setChats(prevChats =>
          prevChats.map(chat => {
            if (chat.chatId === currentChatId) {
              return {
                ...chat,
                messages: [...updatedMessages, { sender: 'ai', text: cleanedResponse }]
              };
            }
            return chat;
          })
        );

        // Actualizar el backend con la respuesta de la IA
        await fetch('http://localhost:5000/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: currentChatId,
            name: currentChat.name,
            messages: [...updatedMessages, { sender: 'ai', text: cleanedResponse }]
          })
        });
      } catch (error) {
        console.error('Error in message handling:', error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const deleteChat = async (chatId) => {
    try {
      // Update frontend state
      const updatedChats = chats.filter(chat => chat.chatId !== chatId);
      setChats(updatedChats);

      // If the deleted chat was selected, switch to the last remaining chat
      if (currentChatId === chatId) {
        const lastChat = updatedChats[updatedChats.length - 1];
        setCurrentChatId(lastChat ? lastChat.chatId : null);
      }

      // Delete chat in backend
      await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-list">
        {chats.map(chat => (
          <div key={chat.chatId} className="chat-item">
            <button
              className={chat.chatId === currentChatId ? 'active' : ''}
              onClick={() => setCurrentChatId(chat.chatId)}
            >
              {chat.name}
            </button>
            <span
              className="delete-btn"
              onClick={() => deleteChat(chat.chatId)}
            >
              🗑️
            </span>
          </div>
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