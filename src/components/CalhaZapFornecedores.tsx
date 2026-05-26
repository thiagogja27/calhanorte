"use client";

import React, { useState } from 'react';
import { Building2, Search, Phone, Send, Globe, Star } from 'lucide-react';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';

interface CalhaZapFornecedoresProps {
  userId?: string;
  verificarAtivo: () => boolean;
}

const LOCAL_FORNECEDORES = [
  {
    id: 'f1',
    nome: 'Aços Brasil Distribuidora',
    tipo: 'Distribuidora de Bobinas',
    logo: '🏭',
    cor: '#1565C0',
    stars: 5,
    avaliacoes: 38,
    tags: ['galvalume', 'galvanizado', 'bobina', 'corte'],
    desc: 'Galvalume #26 e #28, Galvanizado #26 e #28. Bobinas a partir de 250kg. Corte sob medida com lixamento. Entrega SP e Grande SP.',
    tel: '11999990001',
    zap: '11999990001',
    site: 'https://exemplo.com.br',
    destaque: true,
    estado: 'SP'
  },
  {
    id: 'f2',
    nome: 'Alumínio Sul Comércio',
    tipo: 'Distribuidora de Alumínio',
    logo: '🔵',
    cor: '#0277BD',
    stars: 4,
    avaliacoes: 19,
    tags: ['aluminio', 'calha', 'rufo'],
    desc: 'Especialista em chapas e bobinas de alumínio 0,50mm e 0,70mm. Calha moldura e americana em estoque. Frete grátis SP/RS.',
    tel: '51999990002',
    zap: '51999990002',
    site: 'https://exemplo.com.br',
    destaque: false,
    estado: 'RS'
  },
  {
    id: 'f3',
    nome: 'CalhaFácil Indústria',
    tipo: 'Fabricante de Calhas e Rufos',
    logo: '🌊',
    cor: '#00838F',
    stars: 5,
    avaliacoes: 72,
    tags: ['calha', 'rufo', 'galvanizado', 'galvalume'],
    desc: 'Fabricante direto industrial: calha de alumínio moldura, quadrada e encostos de zinco. Pedido mínimo 10 barras simples.',
    tel: '31999990003',
    zap: '31999990003',
    site: 'https://exemplo.com.br',
    destaque: true,
    estado: 'MG'
  },
  {
    id: 'f4',
    nome: 'Seals PU Vedações',
    tipo: 'Fornecedor de Acessórios',
    logo: '🟡',
    cor: '#F59E0B',
    stars: 4,
    avaliacoes: 11,
    tags: ['acessorio', 'pu40', 'selante'],
    desc: 'Bisnagas PU-40 400g cinza/preto, parafusos autobrocantes Zincados, silicone e fita aluminizada. Atacado com desconto.',
    tel: '11999990004',
    zap: '11999990004',
    site: 'https://exemplo.com.br',
    destaque: false,
    estado: 'SP'
  }
];

export default function CalhaZapFornecedores({ userId, verificarAtivo }: CalhaZapFornecedoresProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('todos');

  const filterOptions = [
    { id: 'todos', label: 'Todos' },
    { id: 'galvalume', label: 'Galvalume' },
    { id: 'galvanizado', label: 'Galvanizado' },
    { id: 'aluminio', label: 'Alumínio' },
    { id: 'calha', label: 'Calhas' },
    { id: 'rufo', label: 'Rufos' },
    { id: 'acessorio', label: 'Acessórios' }
  ];

  const trackInteraction = async (fornecedorId: string, type: 'zap' | 'tel' | 'site') => {
    // Audit telemetry offline in local storage
    try {
      const clickStore = JSON.parse(localStorage.getItem('cz_forn_clicks') || '{}');
      if (!clickStore[fornecedorId]) clickStore[fornecedorId] = { zap: 0, tel: 0, site: 0, total: 0 };
      clickStore[fornecedorId][type] = (clickStore[fornecedorId][type] || 0) + 1;
      clickStore[fornecedorId].total = (clickStore[fornecedorId].total || 0) + 1;
      localStorage.setItem('cz_forn_clicks', JSON.stringify(clickStore));
    } catch (_) {}

    // Sinks directly into firebase database
    if (userId) {
      try {
        const telemetryRef = ref(db, `telemetry/leads/${fornecedorId}/${Date.now()}`);
        await set(telemetryRef, {
          userId,
          type,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Telemetry sync transient warning:', e);
      }
    }
  };

  const currentList = LOCAL_FORNECEDORES.filter((f) => {
    const matchesSearch = f.nome.toLowerCase().includes(searchTerm.toLowerCase()) || f.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = filterTag === 'todos' || f.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  }).sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));

  return (
    <div className="space-y-6">
      <div className="bg-[#5a5c5f] rounded-2xl p-5 text-white flex flex-col justify-center relative overflow-hidden shadow-inner">
        <h2 className="text-xl font-black font-condensed text-[#f5c800] tracking-wide mb-1">
          🏭 Rede de Fornecedores CalhaZap
        </h2>
        <p className="text-xs text-zinc-300 leading-relaxed max-w-lg font-semibold">
          Distribuidoras de aço, alumínio, barras prontas e PU-40 recomendadas e auditadas para cotações comerciais sem intermediários.
        </p>
      </div>

      <div className="flex bg-white dark:bg-zinc-900 rounded-xl border border-zinc-250 dark:border-zinc-800 px-3.5 py-2 items-center gap-3 animate-fade-in shadow-xs">
        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar distribuidoras, liga ou material..."
          className="w-full text-xs text-[#1a1a1a] dark:text-zinc-100 bg-transparent outline-none"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setFilterTag(opt.id)}
            className={`text-xs px-3.5 py-1.5 rounded-full font-bold border whitespace-nowrap transition cursor-pointer ${
              filterTag === opt.id
                ? 'border-[#e0b400] bg-[#f5c800] text-[#5a5c5f]'
                : 'border-[#b0b2b5] bg-white text-[#6a6a6a] hover:bg-zinc-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="text-center p-8 bg-[#f2f3f4] border border-dashed border-[#b0b2b5] rounded-xl text-[#6a6a6a] text-xs font-bold">
            🏢 Nenhum fornecedor encontrado para esta especificação.
          </div>
        ) : (
          currentList.map((f) => (
            <div
              key={f.id}
              className={`bg-[#f2f3f4] border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition ${
                f.destaque ? 'border-[#e0b400] relative bg-[#fffdf0]' : 'border-[#b0b2b5]'
              }`}
            >
              {f.destaque && (
                <div className="absolute top-0 right-0 bg-[#f5c800] text-[#5a5c5f] text-[9px] font-black tracking-widest px-3 py-1 uppercase rounded-bl-xl font-condensed">
                  ⭐ Destaque
                </div>
              )}

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl border border-[#b0b2b5] flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {f.logo}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#1a1a1a] tracking-tight">{f.nome}</h4>
                    <p className="text-[10px] uppercase font-bold text-[#6a6a6a]">
                      {f.tipo} • {f.estado}
                    </p>
                    <div className="flex text-[#f5c800] text-[10px] items-center gap-0.5 mt-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span className="text-[#6a6a6a] text-[9px] font-bold ml-1">({f.avaliacoes} avaliações)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {f.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-[#b0b2b5]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-[#3a3a3a] leading-relaxed font-medium">{f.desc}</p>
              </div>

              <div className="grid grid-cols-3 divide-x divide-[#b0b2b5] border-t border-[#b0b2b5] font-bold text-xs bg-white">
                <a
                  href={`https://wa.me/55${f.zap}?text=Olá, vi seu contato no painel CalhaZap`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackInteraction(f.id, 'zap')}
                  className="py-2.5 flex items-center justify-center gap-1.5 text-emerald-650 hover:bg-emerald-50 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${f.tel}`}
                  onClick={() => trackInteraction(f.id, 'tel')}
                  className="py-2.5 flex items-center justify-center gap-1.5 text-sky-650 hover:bg-sky-50 transition cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ligar</span>
                </a>
                <a
                  href={f.site}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackInteraction(f.id, 'site')}
                  className="py-2.5 flex items-center justify-center gap-1.5 text-[#5a5c5f] hover:bg-zinc-100 transition cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-[#fff9c4] border border-[#e0b400] rounded-2xl p-5 text-center space-y-3 shadow-inner">
        <div className="text-3xl text-center">📢</div>
        <h4 className="font-extrabold text-sm uppercase tracking-wide text-[#5a5c5f]">Anuncie para Funileiros e Calheiros</h4>
        <p className="text-xs text-[#6a6a6a] max-w-sm mx-auto leading-relaxed">
          Mais de <strong>750 profissionais de encunhamento</strong> usam o CalhaZap diariamente. Divulgue seu estoque com link direto!
        </p>
        <button
          onClick={() => {
            const url = `https://wa.me/5511999999999?text=Olá, tenho interesse em anunciar minha distribuidora no CalhaZap`;
            window.open(url, '_blank');
          }}
          className="bg-[#5a5c5f] border-2 border-[#8a8c8f] hover:bg-[#1a1a1a] text-[#f5c800] py-2 px-6 rounded-xl font-bold text-xs shadow-md cursor-pointer transition uppercase"
        >
          Quero Anunciar Meu Negócio
        </button>
      </div>
    </div>
  );
}
