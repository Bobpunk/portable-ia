'use client';

import { useState } from 'react';


interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [prompt, setPrompt] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAsk = async (): Promise<void> => {
    if (!prompt.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: prompt };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setPrompt('');
    setLoading(true);

    try {
      
      const res = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({
          messages: updatedMessages,
          temperature: 0.7,
          stream: false
        }),
      });

      if (!res.ok) throw new Error('Falha no motor local.');

      const data = await res.json();
      
     
      const assistantContent = data.choices?.[0]?.message?.content || 'Sem resposta.';

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantContent }]); 
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erro ao conectar com a IA local. A engine está rodando?' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto my-10 p-6 bg-[#121214] text-white rounded-lg min-h-[90vh] flex flex-col justify-between border border-[#323238]">
      {/* Cabeçalho do App */}
      <header className="border-b border-[#323238] pb-4 mb-6">
        <h1 className="text-2xl font-bold text-[#00b37e]"> IA Portátil</h1>
        <p className="text-xs text-[#8d8d99] mt-1">Next.js + TypeScript via Llama.cpp (Modo Offline)</p>
      </header>

    
      <section className="flex-1 flex flex-col gap-4 overflow-y-auto mb-6 pr-2 max-h-[60vh]">
        {messages.length === 0 && (
          <p className="text-[#8d8d99] text-center mt-20">Digite um comando abaixo para iniciar.</p>
        )}
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg border-l-4 ${
              msg.role === 'user' ? 'bg-[#29292e] border-[#00875f]' : 'bg-[#202024] border-[#8d8d99]'
            } whitespace-pre-wrap`}
          >
            <strong className="block text-sm text-[#8d8d99] mb-1">
              {msg.role === 'user' ? 'Você' : 'IA'}
            </strong>
            <p className="leading-relaxed">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="p-4 rounded-lg bg-[#202024] text-[#8d8d99] animate-pulse">
            Pensando...
          </div>
        )}
      </section>

     
      <footer className="bg-[#121214] pt-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
          placeholder="Digite seu prompt aqui (Pressione Enter para enviar)..."
          className="w-full h-20 bg-[#202024] border border-[#323238] text-white p-3 rounded-md resize-none text-base focus:outline-none focus:border-[#00b37e]"
        />
        <button 
          onClick={handleAsk} 
          disabled={loading}
          className="bg-[#00875f] hover:bg-[#00b37e] text-white font-bold py-2 px-6 rounded-md transition-colors mt-2 float-right disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Enviar'}
        </button>
      </footer>
    </main>
  );
}