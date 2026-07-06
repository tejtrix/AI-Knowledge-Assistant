import api from './api';

export const getChatSessions = async () => {
  const response = await api.get('/chat/sessions');
  return response.data;
};

export const createChatSession = async (title: string) => {
  const response = await api.post('/chat/sessions', { title });
  return response.data;
};

// Stream chat response
export const streamChatResponse = async (
  message: string, 
  sessionId: string | null,
  onChunk: (chunk: string) => void,
  onCitations: (citations: any[]) => void,
  onMetadata: (metadata: any) => void
) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'}/chat/completions/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message,
      session_id: sessionId
    })
  });

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || "";
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.replace('data: ', '');
        if (dataStr === '[DONE]') {
          return;
        }
        
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === 'chunk') {
            onChunk(parsed.content);
          } else if (parsed.type === 'citations') {
            onCitations(parsed.citations);
          } else if (parsed.type === 'metadata') {
            onMetadata(parsed);
          } else if (parsed.type === 'error') {
            throw new Error(parsed.message);
          }
        } catch (e) {
          console.error("Error parsing stream chunk", e, dataStr);
        }
      }
    }
  }
};
