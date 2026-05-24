"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Compass, RotateCcw, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import { ChatMessage } from '../types';

export default function AcoAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Olá! Sou o **AssisteAço**, seu consultor virtual especialista em estruturas metálicas, normas técnicas Gerdau/CSN e pesagens. \n\nEstou aqui para ajudar você a calcular pesos de materiais difíceis, entender especificações de ligas (SAE 1020, ASTM A36) ou esclarecer dúvidas de serralheria e obras. Como posso lhe ajudar hoje?",
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    { label: "Equação de peso da Chapa", prompt: "Qual é a fórmula detalhada de cálculo de peso por metro quadrado de uma chapa de aço e como estimar o peso de chapas xadrez?" },
    { label: "CA-50 vs CA-60 Gerdau", prompt: "Qual a diferença exata de aplicação, resistência mecânica e propriedades do aço Gerdau CA-50 e CA-60 na construção civil?" },
    { label: "Viga I / W ideal para mezanino", prompt: "Quais vigas I ou W estruturais da Gerdau costumam ser cotadas para mezanino comercial de carga média (vãos de 4 a 6 metros)?" },
    { label: "Converter Chapa Calibre 14", prompt: "Qual é a espessura em milímetros de uma chapa calibre 14 (padrão MSG) e o peso teórico por m²?" }
  ];

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setErrorStatus(null);
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Houve uma falha de conexão com o servidor.");
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || "Erro para carregar resposta. Certifique-se que adicionou a chave GEMINI_API_KEY no painel de segredos.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: "Chat reiniciado! Sou o **AssisteAço**. Como posso te ajudar na cotação de aço agora?",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setErrorStatus(null);
  };

  // Helper function to render text with clean basic markdown boldings
  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      // Very basic formatting converter for asterisks
      let formattedLine = line;
      // Replace **bold** with <strong>
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-orange-950 font-bold bg-amber-50 px-1 rounded border border-amber-200/50">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : line;

      // Handle simple bullet points
      if (line.trim().startsWith('- ')) {
        return (
          <li key={lineIdx} className="ml-4 list-disc pl-1 py-0.5 text-slate-800">
            {line.trim().substring(2)}
          </li>
        );
      }
      
      return (
        <p key={lineIdx} className={`${line.trim() === '' ? 'h-3' : 'pb-1'} text-slate-800 leading-relaxed text-sm`}>
          {content}
        </p>
      );
    });
  };

  return (
    <div id="ai-assistant-card" className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-3xl overflow-hidden border border-slate-750 shadow-2xl">
      {/* Assistant Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Bot className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="absolute bottom-[-1px] right-[-1px] w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-semibold text-sm text-white tracking-wide">AssisteAço AI</h3>
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <p className="text-xs text-slate-400">Especialista Gerdau / CSN online</p>
          </div>
        </div>
        <button 
          id="btn-clear-chat"
          onClick={clearChat}
          className="p-2 hover:bg-slate-850 rounded-xl transition text-slate-400 hover:text-white"
          title="Reiniciar chat"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`flex items-start max-w-[85%] space-x-2.5 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-orange-500 text-slate-950' : 'bg-slate-800 text-amber-500'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`rounded-2xl px-4 py-3 shadow ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700' 
                  : 'bg-white text-slate-900 rounded-tl-none'
              }`}>
                <div className="space-y-1">
                  {msg.role === 'user' ? (
                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {renderMessageText(msg.text)}
                    </div>
                  )}
                  <span className={`block text-[10px] mt-2 text-right ${msg.role === 'user' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                <Bot className="w-4 h-4 text-orange-400 animate-bounce" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 px-4 py-3">
                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <span>Calculando dados de engenharia</span>
                  <span className="flex space-x-0.5">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {errorStatus && (
          <div className="p-3 bg-red-950/60 border border-red-900/40 rounded-xl flex items-start space-x-2.5 text-red-300">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 leading-snug">
              <p className="font-semibold">Erro no Servidor</p>
              <p>{errorStatus}</p>
              <p className="text-[10px] opacity-85">Adicione sua `GEMINI_API_KEY` corporativa no painel lateral de Secrets para ativar o cérebro AI.</p>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="px-4 py-2 bg-slate-950/60">
          <p className="text-[10px] font-medium tracking-wider uppercase text-slate-500 mb-1.5 flex items-center space-x-1">
            <Compass className="w-3 h-3 text-orange-400" />
            <span>Consultas Técnicas Frequentes</span>
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s.prompt)}
                className="text-left text-[11px] p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 hover:text-orange-350 transition line-clamp-2 truncate"
                title={s.prompt}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-3 bg-slate-950 border-t border-slate-900 flex items-center space-x-2"
      >
        <input
          id="assistant-input-text"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Perguntar espessuras, fórmulas ou ligas..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-105 placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm transition"
        />
        <button
          id="btn-send-assistant"
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-slate-950 rounded-xl transition disabled:opacity-50 disabled:scale-100 flex items-center justify-center shrink-0"
        >
          <Send className="w-4.5 h-4.5 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
}
