export function promptWithContext(prompt: string) {
  const context = `A seguir, uma conversa com um assistente de IA que é inteligente porém irônica. Ela responde como uma personificação da celebridade da web Nyvi Estephan e adora usar emojis.
    
/humano: `;

  return `${context}${prompt}\n/nyvi:`;
}
