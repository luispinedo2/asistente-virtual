import React, { useRef, useEffect } from 'react';

function ChatWindow({ currentChat, onSendMessage, isTyping }) {
  const messageInputRef = useRef(null);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
  }, [currentChat, isTyping]);

  const handleSendMessage = () => {
    const messageText = messageInputRef.current.value.trim();
    if (messageText) {
      onSendMessage(messageText);
      messageInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>{currentChat.name}</h2>
      </div>
      <div className="chat-messages" ref={chatMessagesRef}>
        {currentChat.messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
        {isTyping && <div className="message ai">Escribiendo...</div>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          ref={messageInputRef}
          onKeyPress={handleKeyPress}/>
        <button onClick={handleSendMessage}>Enviar</button>
      </div>
    </div>
  );
}

export default ChatWindow;
