export async function getAIResponse(conversation) {
    const apiKey = 'NPvW9bDwbNJzWOul9t8teFsf8cEorRwyuhadBrl5';
    const endpoint = 'https://api.cohere.ai/v2/chat';
  
    const messages = conversation.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
  
    const body = {
      model: 'command-r',
      messages: messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 300
    };
  
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Detalles del error:', errorData);
        throw new Error(errorData.message || response.statusText);
      }
  
      const data = await response.json();
        console.log('Respuesta completa de la API:', data);
      if (data.message && Array.isArray(data.message.content)) {
        const combinedContent = data.message.content.map(item => item.text).join(' ').trim();
        return combinedContent;
      } else {
        throw new Error('La respuesta de la API no contiene un `content` válido.');
      }
    } catch (error) {
      console.error('Error al obtener respuesta de Cohere:', error.message);
      return 'Lo siento, hubo un problema al procesar tu solicitud.';
    }
  }
  