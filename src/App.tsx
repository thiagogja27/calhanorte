"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, History, Scissors, Ruler, Building2, Bot, 
  Building, Sparkles, Mail, Lock, LogOut, Loader2, CheckCircle2,
  Bell, Moon, Sun, ChevronRight, Plus, ArrowLeft, Wrench, Users,
  Phone, MapPin, Camera, Check, Menu, Trash2, Edit3, Printer,
  Clock, Info, X, ChevronDown, Calendar, DollarSign, AlertCircle,
  MessageSquareCode, HelpCircle, FileText, Send, SquareTerminal, Scale
} from 'lucide-react';

// Firebase Authentication and Database Imports
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  ref, 
  set, 
  remove, 
  onValue 
} from 'firebase/database';

// Modular CalhaZap Components
import CalhaZapHistory from './components/CalhaZapHistory';
import CalhaZapCorte from './components/CalhaZapCorte';
import CalhaZapMetro from './components/CalhaZapMetro';
import CalhaZapPlanos from './components/CalhaZapPlanos';
import AcoAssistant from './components/AcoAssistant';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Active workspace settings (mapped to iPhone Viewport Tabs)
  // 'home' = Dashboard, 'orc' = 5-Step Wizard, 'hist' = Saved List, 'calc' = 2x2 calculators grid, 'emp' = settings/plans/AI
  const [viewportTab, setViewportTab] = useState<'home' | 'orc' | 'hist' | 'calc' | 'emp' | 'notif'>('home');

  // Selected Active Calculator
  const [selectedCalc, setSelectedCalc] = useState<null | 'metragem' | 'metro-kg' | 'corte' | 'incline'>(null);

  // Dark/Light Mode state
  const [darkMode, setDarkMode] = useState(false);

  // Company Details persistent states
  const [companyName, setCompanyName] = useState('CalhaFer Ltda.');
  const [ownerName, setOwnerName] = useState('Carlos');
  const [companyCNPJ, setCompanyCNPJ] = useState('12.345.678/0001-99');
  const [companyPhone, setCompanyPhone] = useState('(11) 99876-5432');
  const [companyCityState, setCompanyCityState] = useState('São Paulo - SP');
  const [companyLogo, setCompanyLogo] = useState(''); // Base64 url

  // Saved quotes from database
  const [quotes, setQuotes] = useState<any[]>([]);

  // Premium Activation State
  const [czAtivo, setCzAtivo] = useState(false);

  // Lock Overlay Dialog State
  const [showLock, setShowLock] = useState(false);
  const [lockTitle, setLockTitle] = useState('');
  const [lockSub, setLockSub] = useState('');

  // -------------------------------------------------------------
  // CUSTOM 5-STEP WIZARD SELECTIONS STATE (for "Novo Orçamento")
  // -------------------------------------------------------------
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wName, setWName] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wAddress, setWAddress] = useState('');
  const [wPhoto, setWPhoto] = useState<string | null>(null); // base64 or placeholder preview

  // Step 2 products list (coberturas/telhas)
  const [wTileItems, setWTileItems] = useState<any[]>([]);
  const [selTileType, setSelTileType] = useState('Trapézio 25');
  const [selTileMat, setSelTileMat] = useState('Galvalume');
  const [tileQty, setTileQty] = useState(12);
  const [tileLen, setTileLen] = useState(3.5);
  const [tilePrice, setTilePrice] = useState(38.50);

  // Step 3 products list (calhas/rufos/condutores)
  const [wGutterItems, setWGutterItems] = useState<any[]>([]);
  const [selGutterType, setSelGutterType] = useState('Calha Moldura');
  const [selGutterMat, setSelGutterMat] = useState('Galvalume');
  const [gutterCut, setGutterCut] = useState(280); // mm
  const [gutterThick, setGutterThick] = useState('0,43'); // mm
  const [gutterLen, setGutterLen] = useState(6.0); // meters
  const [gutterQty, setGutterQty] = useState(2);
  const [gutterPrice, setGutterPrice] = useState(42.00);

  // Step 3.5 (rufo additions)
  const [wRufoItems, setWRufoItems] = useState<any[]>([]);
  const [selRufoType, setSelRufoType] = useState('Rufo Encosto c/ Pingadeira');
  const [selRufoMat, setSelRufoMat] = useState('Galvalume');
  const [rufoCut, setRufoCut] = useState(250); // mm
  const [rufoThick, setRufoThick] = useState('0,43'); // mm
  const [rufoLen, setRufoLen] = useState(4.0); // meters
  const [rufoQty, setRufoQty] = useState(3);
  const [rufoPrice, setRufoPrice] = useState(33.00);

  // Step 4 condutores / chaminé / PU-40 / accessories
  const [wCondQty, setWCondQty] = useState(2);
  const [wCondType, setWCondType] = useState('Retangular Galvalume 5x10');
  const [wCondLen, setWCondLen] = useState(3.0);
  const [wCondPrice, setWCondPrice] = useState(21.00);

  const [wChamQty, setWChamQty] = useState(1);
  const [wChamType, setWChamType] = useState('Chaminé de Lareira Galvanizada');
  const [wChamDiam, setWChamDiam] = useState(150);
  const [wChamPrice, setWChamPrice] = useState(115.00);

  const [puQty, setPuQty] = useState(2);
  const [puPrice, setPuPrice] = useState(22.00);

  // Step 5 labor / additional services
  const [laborPrice, setLaborPrice] = useState(350.00);
  const [discountPercent, setDiscountPercent] = useState(5);
  const [wNotes, setWNotes] = useState('Garantia especial de 1 ano contra vazamentos, oxidações e falhas de fixação nas presilhas.');

  // Live Calculations for Wizard
  const calcWizardTotal = () => {
    let sub = 0;
    wTileItems.forEach(it => sub += it.total);
    wGutterItems.forEach(it => sub += it.total);
    wRufoItems.forEach(it => sub += it.total);
    sub += wCondQty * wCondPrice * wCondLen;
    sub += wChamQty * wChamPrice;
    sub += puQty * puPrice;
    sub += laborPrice;

    const discAmount = sub * (discountPercent / 100);
    const finalTot = Math.max(0, sub - discAmount);

    return {
      subtotal: sub,
      discountAmount: discAmount,
      total: finalTot
    };
  };

  const { subtotal: wSubtotal, discountAmount: wDiscAmount, total: wTotal } = calcWizardTotal();

  // -------------------------------------------------------------
  // INTERACTIVE INLINE SPECIALTY CALCULATORS STATE (Under calculated sub-page)
  // -------------------------------------------------------------
  // Inclinação
  const [incRoofLen, setIncRoofLen] = useState<number>(4);
  const [incRoofPercent, setIncRoofPercent] = useState<number>(20);
  // Metragem manual calculator
  const [metWidthVal, setMetWidthVal] = useState<number>(5);
  const [metLengthVal, setMetLengthVal] = useState<number>(8);
  const [metPitchCoeff, setMetPitchCoeff] = useState<number>(1.04); // for 30% slope overhang

  // -------------------------------------------------------------
  // INTERACTIVE NOTIFICATIONS ALARM STATE
  // -------------------------------------------------------------
  const [notifs, setNotifs] = useState([
    { id: '1', type: 'approved', title: 'Orçamento aprovado', desc: 'Ana Rodrigues aprovou o orçamento de R$ 2.450,00 para instalação.', time: 'Há 15 min', read: false },
    { id: '2', type: 'comment', title: 'Comentário sobre obra', desc: 'Construtora JB comentou no projeto de slitting #042 do corte 30.', time: 'Há 1 hora', read: false },
    { id: '3', type: 'reminder', title: 'Lembrete de instalação', desc: 'Instalação de Calhas na rua das Palmeiras agendada para amanhã às 14h00.', time: 'Há 3 horas', read: false },
    { id: '4', type: 'payment', title: 'Instrução de Pix Recebida', desc: 'Marcos Ferreira realizou adiantamento de 50% (R$ 1.890,00).', time: 'Ontem', read: true },
    { id: '5', type: 'expiring', title: 'Orçamento expirando', desc: 'Cotação de bobinas pré-pintadas #038 vencerá em 2 dias.', time: 'Ontem', read: true },
    { id: '6', type: 'whatsapp', title: 'Mensagem do WhatsApp', desc: 'Renata Costa enviou confirmação do frete das chapas de alumínio.', time: '2 dias atrás', read: true }
  ]);

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllNotifsRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotif = (id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  // -------------------------------------------------------------
  // SYNC AUTH, COMPANY AND QUOTES FROM FIREBASE DATABASE
  // -------------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthLoading(false);
    }, 1200);

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      clearTimeout(timer);
      setUser(authUser);
      setAuthLoading(false);
    });

    try {
      const mode = localStorage.getItem('cz_dark_mode') === 'true';
      setDarkMode(mode);
    } catch (_) {}

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setQuotes([]);
      return;
    }

    // Sync Company Details
    const companyRef = ref(db, `companies/${user.uid}`);
    const unsubCompany = onValue(companyRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val.name) setCompanyName(val.name);
        if (val.cnpj) setCompanyCNPJ(val.cnpj);
        if (val.phone) setCompanyPhone(val.phone);
        if (val.cityState) setCompanyCityState(val.cityState);
        if (val.logo) setCompanyLogo(val.logo);
        if (val.owner) setOwnerName(val.owner);
      }
    });

    // Sync Quotes
    const quotesRef = ref(db, `quotes/${user.uid}`);
    const unsubQuotes = onValue(quotesRef, (snapshot) => {
      const arr: any[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          arr.push(child.val());
        });
      }
      setQuotes(arr.reverse()); // Put newest first
    });

    try {
      const ok = localStorage.getItem('cz_ativo') === '1';
      setCzAtivo(ok);
    } catch (_) {}

    return () => {
      unsubCompany();
      unsubQuotes();
    };
  }, [user]);

  // Auth Functions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsAuthSubmitting(true);

    if (!authEmail || !authPassword) {
      setAuthError("Forneça e-mail e senha cadastrados.");
      setIsAuthSubmitting(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
    } catch (err: any) {
      console.error(err);
      setAuthError("Erro de logon. Verifique as credenciais.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    try {
      localStorage.setItem('cz_dark_mode', String(next));
    } catch (_) {}
  };

  // Premium Activation
  const verificarAtivo = (): boolean => {
    try {
      const val = localStorage.getItem('cz_ativo') === '1';
      setCzAtivo(val);
      return val;
    } catch (_) {
      return false;
    }
  };

  const exibirLock = (ttl: string, sub: string) => {
    setLockTitle(ttl);
    setLockSub(sub);
    setShowLock(true);
  };

  const ativarAcessoPlano = (plMode: string) => {
    try {
      localStorage.setItem('cz_ativo', '1');
      setCzAtivo(true);
    } catch (_) {}
    setShowLock(false);
    alert("Pronto! Recursos Premium Ativados com Sucesso! Aproveite.");
  };

  // Data Actions
  const handleSaveDocToCloud = async (payload: any) => {
    if (!user) return;
    try {
      const docRef = ref(db, `quotes/${user.uid}/${payload.id}`);
      await set(docRef, payload);
    } catch (e) {
      console.error(e);
      alert("Falha ao salvar no banco Firebase.");
    }
  };

  const handleToggleQuoteStatus = async (id: string, newStatus: string) => {
    if (!user) return;
    try {
      const statusRef = ref(db, `quotes/${user.uid}/${id}/status`);
      await set(statusRef, newStatus);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteQuoteId = async (id: string) => {
    if (!user) return;
    if (!confirm("Confirmar deleção permanente deste orçamento?")) return;
    try {
      const docRef = ref(db, `quotes/${user.uid}/${id}`);
      await remove(docRef);
    } catch (e) {
      console.error(e);
    }
  };

  const saveCompanyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const companyRef = ref(db, `companies/${user.uid}`);
      await set(companyRef, {
        name: companyName,
        cnpj: companyCNPJ,
        phone: companyPhone,
        cityState: companyCityState,
        logo: companyLogo,
        owner: ownerName
      });
      alert("Definições atualizadas na nuvem!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditLoad = (oldQuote: any) => {
    setWName(oldQuote.customerName || '');
    setWPhone(oldQuote.customerPhone || '');
    setWAddress(oldQuote.customerAddress || '');
    setWTileItems(oldQuote.telhas || []);
    setWGutterItems(oldQuote.calhas || []);
    setWRufoItems(oldQuote.rufos || []);
    setLaborPrice(oldQuote.laborPrice || 350.00);
    setDiscountPercent(oldQuote.discountPercent || 0);
    setWNotes(oldQuote.notes || '');
    
    setWizardStep(1);
    setViewportTab('orc');
  };

  // Direct Printer Trigger
  const handleDirectPrintReprnt = (oldQuote: any) => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert("Por favor, habilite popups de impressão!");
      return;
    }
    const clientNm = oldQuote.customerName || "Cliente";
    const logoImgHtml = companyLogo ? `<img src="${companyLogo}" style="max-height: 52px; margin-bottom: 8px;" />` : '';

    const allItems: any[] = [];
    if (oldQuote.telhas) oldQuote.telhas.forEach((it: any) => allItems.push(it));
    if (oldQuote.calhas) oldQuote.calhas.forEach((it: any) => allItems.push(it));
    if (oldQuote.rufos) oldQuote.rufos.forEach((it: any) => allItems.push(it));
    if (oldQuote.condutores) {
      allItems.push({
        desc: 'Condutores Pluviais Tubulagem',
        specs: `Comprimento acumulado: 12m`,
        qtd: oldQuote.condutores.qtd || 2,
        unit: oldQuote.condutores.unit || 21.00,
        total: oldQuote.condutores.total || 126.00
      });
    }

    const rowsHtml = allItems.map(item => `
      <tr style="border-bottom: 1px solid #b0b2b5; font-size: 11px;">
        <td style="padding: 6px; font-weight: bold; color: #1a1a1a;">${item.desc}<div style="font-size: 9px; font-weight: normal; color: #6a6a6a;">${item.specs || ''}</div></td>
        <td style="padding: 6px; text-align: center; font-family: monospace;">${item.qtd}</td>
        <td style="padding: 6px; text-align: right; font-family: monospace;">R$ ${item.unit.toFixed(2)}</td>
        <td style="padding: 6px; text-align: right; font-family: monospace; font-weight: bold;">R$ ${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <html>
        <head>
          <title>Orçamento_${clientNm}</title>
          <style>
            body { font-family: 'Helvetica', system-ui, sans-serif; background: #ffffff; color: #1a1a1a; margin: 25px; }
            .header-tbl { width: 100%; border-bottom: 3px solid #f5c800; padding-bottom: 12px; margin-bottom: 15px; }
            .client-tbl { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
            .client-tbl td { padding: 6px; font-size: 11px; }
            .items-tbl { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            .items-tbl th { background: #111215; color: #fff; padding: 8px; font-size: 10px; text-transform: uppercase; }
            .footer-tbl { width: 100%; font-size: 11px; margin-top: 30px; border-top: 1px solid #b0b2b5; padding-top: 15px; }
          </style>
        </head>
        <body>
          <table class="header-tbl">
            <tr>
              <td>
                ${logoImgHtml}
                <div style="font-size: 16px; font-weight: bold; color: #111215;">${companyName}</div>
                <div style="font-size: 11px; color: #3a3a3a;">CNPJ: ${companyCNPJ} • Contato: ${companyPhone} • ${companyCityState}</div>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <div style="font-size: 14px; font-weight: bold; color: #d97706;">PROPOSTA COMERCIAL</div>
                <div style="font-size: 11px; font-family: monospace; color: #5a5c5f; margin-top: 4px;">Ref: ${oldQuote.id}</div>
              </td>
            </tr>
          </table>

          <table class="client-tbl" border="1" bordercolor="#e4e4e7">
            <tr style="background-color: #f4f4f5; font-weight: bold;">
              <td colspan="2" style="font-size: 10px; text-transform: uppercase;">Cliente e Endereço da Obra</td>
            </tr>
            <tr>
              <td><strong>Cliente:</strong> ${clientNm}</td>
              <td><strong>WhatsApp:</strong> ${oldQuote.customerPhone || '—'}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Localidade:</strong> ${oldQuote.customerAddress || 'Oficina / Balcão'}</td>
            </tr>
          </table>

          <table class="items-tbl">
            <thead>
              <tr style="background-color: #1a1a1a;">
                <th style="text-align: left; color: #fff; padding: 8px;">Especificação Chapas / Produtos</th>
                <th style="color: #fff; padding: 8px;">Medidas</th>
                <th style="text-align: right; color: #fff; padding: 8px;">Preço Unit</th>
                <th style="text-align: right; color: #fff; padding: 8px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div style="float: right; width: 280px; font-size: 12px; border: 1px solid #e4e4e7; padding: 12px; border-radius: 8px; background: #fafafa;">
            <table width="100%">
              <tr>
                <td>Subtotal Serviços:</td>
                <td style="text-align: right; font-family: monospace;">R$ ${oldQuote.subtotal.toFixed(2)}</td>
              </tr>
              ${oldQuote.discountPercent > 0 ? `
              <tr>
                <td style="color: #ca8a04;">Desconto (${oldQuote.discountPercent}%):</td>
                <td style="text-align: right; color: #ca8a04; font-family: monospace;">- R$ ${oldQuote.discountAmount?.toFixed(2) || '0.00'}</td>
              </tr>
              ` : ''}
              <tr style="font-weight: bold; font-size: 14px; border-top: 2px solid #111215; color:#16a34a;">
                <td style="padding-top: 6px;">TOTAL LIQUIDO:</td>
                <td style="text-align: right; padding-top: 6px; font-family: monospace;">R$ ${oldQuote.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          <div style="clear: both;"></div>
          <div style="margin-top: 50px; font-size: 10px; color: #71717a; border-top:1px solid #e4e4e7; pt-4">
             Observações: ${oldQuote.notes || 'Materiais para fixação inclusos.'}
             <br /><br />
             Assinatura do Responsável Calheiro: _________________________________________________
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 800);
  };

  // Simulated Media Upload
  const triggerMockUpload = () => {
    alert("Simulando câmera do iPhone! Foto da obra carregada com sucesso.");
    setWPhoto("https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop");
  };

  // Add Item actions to Step arrays
  const addTileToStep = () => {
    const area = tileQty * tileLen;
    const tot = area * tilePrice;
    setWTileItems([...wTileItems, {
      id: Date.now().toString(),
      desc: `Telha ${selTileType} ${selTileMat}`,
      specs: `${tileQty} un x ${tileLen}m = ${area.toFixed(1)}m²`,
      qtd: tileQty,
      unit: tilePrice,
      total: tot
    }]);
    alert("Telha adicionada ao orçamento!");
  };

  const addGutterToStep = () => {
    const tot = gutterLen * gutterQty * gutterPrice;
    setWGutterItems([...wGutterItems, {
      id: Date.now().toString(),
      desc: `${selGutterType} (${selGutterMat})`,
      specs: `Corte ${gutterCut}mm • Esp ${gutterThick}mm • ${gutterLen}m`,
      qtd: gutterQty,
      unit: gutterPrice,
      total: tot
    }]);
    alert("Calha adicionada!");
  };

  const addRufoToStep = () => {
    const tot = rufoLen * rufoQty * rufoPrice;
    setWRufoItems([...wRufoItems, {
      id: Date.now().toString(),
      desc: `${selRufoType} (${selRufoMat})`,
      specs: `Corte ${rufoCut}mm • Esp ${rufoThick}mm • ${rufoLen}m`,
      qtd: rufoQty,
      unit: rufoPrice,
      total: tot
    }]);
    alert("Rufo adicionado!");
  };

  // Save Wizard Action to Firebase Database
  const saveWizardBudget = async () => {
    if (!wName.trim()) {
      alert("Por favor, preencha o nome do cliente.");
      return;
    }

    const payload = {
      id: "CZ-" + Math.floor(10000 + Math.random() * 90000).toString(),
      customerName: wName,
      customerPhone: wPhone,
      customerAddress: wAddress,
      date: new Date().toLocaleDateString('pt-BR'),
      status: "pendente",
      telhas: wTileItems,
      calhas: wGutterItems,
      rufos: wRufoItems,
      puQty: puQty,
      puPrice: puPrice,
      condutores: {
        desc: wCondType,
        qtd: wCondQty,
        unit: wCondPrice,
        total: wCondQty * wCondPrice * wCondLen
      },
      chamines: [{
        desc: wChamType,
        specs: `Ø ${wChamDiam}mm`,
        qtd: wChamQty,
        unit: wChamPrice,
        total: wChamQty * wChamPrice
      }],
      subtotal: wSubtotal,
      discountPercent: discountPercent,
      discountAmount: wDiscAmount,
      total: wTotal,
      notes: wNotes,
      createdAt: new Date().toISOString()
    };

    await handleSaveDocToCloud(payload);
    alert(`🎉 Sucesso! Orçamento cadastrado na nuvem com o código ${payload.id}`);
    
    // Auto redirect to history list to view or print
    setWName('');
    setWPhone('');
    setWAddress('');
    setWTileItems([]);
    setWGutterItems([]);
    setWRufoItems([]);
    setViewportTab('hist');
  };

  // Render Spinner Screen
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400 mb-4" />
        <span className="font-condensed font-black tracking-widest uppercase text-xs text-stone-400 animate-pulse">
          Sincronizando Oficina CalhaZap...
        </span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 md:p-6 transition-colors duration-300 font-sans ${darkMode ? 'dark text-zinc-100' : 'text-zinc-900'}`}>
      
      {/* Absolute Header for Desktop View only */}
      <div className="hidden md:flex items-center gap-6 justify-between w-full max-w-4xl px-4 py-3 border-b border-zinc-800/60 mb-6 font-mono text-xs text-zinc-500 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>CalhaZap Cloud: Conectado</span>
          <span className="mx-2">|</span>
          <span className="text-zinc-400 font-semibold">{user ? user.email : 'Aguardando Logon'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-amber-400/20 text-amber-300 uppercase px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/30">
            {czAtivo ? '⭐ PLANO PREMIUM ATIVO' : 'TRIAL ATIVO - 10 DIAS'}
          </span>
          {user && (
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 text-zinc-300 hover:text-white rounded border border-zinc-700 hover:border-zinc-500 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Desconectar</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Smartphone Chassis Mockup Wrapper */}
      <div className="w-full md:max-w-[420px] md:h-[860px] bg-zinc-100 dark:bg-black md:rounded-[44px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border-0 md:border-[10px] md:border-zinc-800 relative flex flex-col overflow-hidden transition-all duration-300">
        
        {/* iPhone Native Header: Battery, Signal, Dynamic Island */}
        <div className="bg-zinc-100 dark:bg-black text-black dark:text-white px-5 pt-3 pb-2 flex justify-between items-center text-[11px] font-bold z-30 shrink-0 select-none border-b border-zinc-200/50 dark:border-zinc-900/60 font-mono">
          <span>14:20</span>
          
          {/* Dynamic Island Notch */}
          <div className="w-24 h-4.5 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-2.5 flex items-center justify-end pr-3 border border-zinc-900 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-900 animate-ping"></span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Wrench className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="text-zinc-400 font-normal">84%</span>
            <div className="w-5 h-2.5 rounded-sm bg-zinc-300 dark:bg-zinc-800 border border-zinc-400 dark:border-zinc-700 p-0.5 flex">
              <div className="h-full w-[84%] bg-green-500 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Dynamic App Area inside Smartphone Viewport */}
        <div className={`flex-grow flex flex-col overflow-y-auto no-scrollbar relative transition-colors duration-300 ${
          darkMode ? 'bg-zinc-950 text-white' : 'bg-stone-50 text-stone-900'
        }`}>
          
          {/* USER NOT AUTHENTICATED: Native Phone Form Login */}
          {!user ? (
            <div className="flex-grow flex flex-col p-6 justify-center items-center">
              <div className="text-center space-y-2 mb-6">
                <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <SquareTerminal className="w-8 h-8 text-slate-900 stroke-[2.5]" />
                </div>
                <h1 className="text-2xl font-black font-condensed uppercase tracking-wide">CalhaZap</h1>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Painel Exclusivo de Orçamentos e Cálculos de Chapas, Bobinas, Calhas e Rufos
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="w-full space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase block">E-mail Corporativo</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="Ex: thiago@calhazap.com"
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-3 text-xs font-semibold outline-none text-[#1a1a1a] dark:text-white"
                      required
                    />
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5 shrink-0" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase block">Senha de Segurança</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Sua senha numérica"
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-3 text-xs font-semibold outline-none text-[#1a1a1a] dark:text-white"
                      required
                    />
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5 shrink-0" />
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-red-100 dark:bg-red-950/40 border border-red-250 text-red-700 dark:text-red-300 text-xs font-semibold rounded-xl leading-normal text-center">
                    ⚠️ {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-900 rounded-xl font-bold text-xs transition uppercase tracking-wider shadow cursor-pointer disabled:opacity-50"
                >
                  {isAuthSubmitting ? "Carregando..." : "Entrar na Oficina Segura ✅"}
                </button>
              </form>

              <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-900 text-[10px] text-center text-zinc-500 font-semibold px-2">
                Acesso limitado a colaboradores e serralherias autorizadas CalhaZap.
              </div>
            </div>
          ) : (
            
            // USER AUTHENTICATED: CORE APPLICATION WORKSPACE PANELS
            <div className="flex flex-col h-full">

              {/* Viewport Top App Bar Header Menu */}
              {viewportTab !== 'notif' && (
                <div className={`px-4 py-3.5 flex justify-between items-center shrink-0 border-b ${
                  darkMode ? 'border-zinc-900 bg-zinc-950/80' : 'border-zinc-200 bg-white/80'
                } backdrop-blur-sm sticky top-0 z-20`}>
                  
                  <div className="flex items-center gap-2.5">
                    {/* Head Initials Circle Badge */}
                    <div className="w-10 h-10 rounded-full bg-amber-500 border border-amber-600/20 text-slate-950 flex items-center justify-center font-black font-condensed tracking-tighter text-sm shadow-sm select-none">
                      CS
                    </div>
                    <div>
                      <h2 className="text-xs font-semibold text-zinc-400 leading-none">Boa tarde, Carlos!</h2>
                      <span className="font-bold text-sm tracking-tight leading-normal block text-amber-500 truncate max-w-[150px]">
                        {companyName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Theme Mode Toggle Button */}
                    <button 
                      onClick={toggleDarkMode}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        darkMode ? 'bg-zinc-900 text-amber-400 hover:bg-zinc-850' : 'bg-stone-100 text-zinc-600 hover:bg-stone-200'
                      }`}
                    >
                      {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                    </button>

                    {/* Alarm Bells Notification Button */}
                    <button 
                      onClick={() => setViewportTab('notif')}
                      className={`p-2 rounded-lg transition-colors relative cursor-pointer ${
                        darkMode ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-850' : 'bg-stone-100 text-zinc-600 hover:bg-stone-200'
                      }`}
                    >
                      <Bell className="w-4.5 h-4.5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* VIEWPORT CONTROLLER SWITCHBOARD */}
              <div className="flex-grow p-4 pb-20">

                {/* TAB 1: Dashboard Home Tab */}
                {viewportTab === 'home' && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Top Calendary Greeting metadata */}
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-zinc-400 tracking-wide uppercase">
                        Quarta-feira, 24 de maio
                      </span>
                      <h3 className="text-xl font-extrabold tracking-tight">
                        O que vamos fazer hoje?
                      </h3>
                    </div>

                    {/* Novo Orçamento Mega Banner Gradient Card */}
                    <div 
                      onClick={() => {
                        setWizardStep(1);
                        setViewportTab('orc');
                      }}
                      className="cursor-pointer bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 p-4 rounded-3xl text-zinc-950 flex justify-between items-center shadow-lg shadow-amber-500/15 relative overflow-hidden group select-none transition-all border border-amber-300/20 active:scale-98"
                    >
                      <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
                      
                      <div className="flex items-center gap-3.5 z-10">
                        <div className="w-11 h-11 bg-white/25 rounded-2xl flex items-center justify-center shadow-inner">
                          <Plus className="w-5.5 h-5.5 stroke-[3.5] text-zinc-950" />
                        </div>
                        <div>
                          <h4 className="font-black text-[15px] leading-snug tracking-tight">Novo Orçamento</h4>
                          <p className="text-[10px] font-bold text-zinc-900/80">Crie um orçamento em 2 minutos</p>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-zinc-950 group-hover:translate-x-1 transition-transform" />
                    </div>

                    {/* Rounded Action Column Chips Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold font-condensed">
                      <div 
                        onClick={() => setViewportTab('hist')}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95 border ${
                          darkMode ? 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800' : 'bg-white hover:bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] tracking-wider uppercase">Obras</span>
                      </div>

                      <div 
                        onClick={() => {
                          setWizardStep(1);
                          setViewportTab('orc');
                        }}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95 border ${
                          darkMode ? 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800' : 'bg-white hover:bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] tracking-wider uppercase">Clientes</span>
                      </div>

                      <div 
                        onClick={() => setViewportTab('emp')}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95 border ${
                          darkMode ? 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800' : 'bg-white hover:bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
                          <Menu className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] tracking-wider uppercase">Mais</span>
                      </div>
                    </div>

                    {/* Section: "Para Hoje" Scheduled list */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-xs uppercase tracking-wider text-zinc-500">Agendamentos</span>
                        <button onClick={() => alert("Sua Agenda de Serviços está synced com Google Calendar.")} className="text-xs text-amber-500 cursor-pointer">Agenda</button>
                      </div>

                      <div className="space-y-2">
                        {/* Event A */}
                        <div className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1.5 bg-amber-100 text-amber-800 rounded-xl text-[10px] font-black font-condensed">14h00</span>
                            <div>
                              <h5 className="text-xs font-bold">Ana Rodrigues</h5>
                              <p className="text-[10px] text-zinc-500">Instalação • Calha + Rufo</p>
                            </div>
                          </div>
                          <span className="text-[9px] bg-yellow-100/50 text-yellow-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider select-none shrink-0 border border-yellow-250">PENDENTE</span>
                        </div>

                        {/* Event B */}
                        <div className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1.5 bg-sky-100 text-sky-800 rounded-xl text-[10px] font-black font-condensed">16h30</span>
                            <div>
                              <h5 className="text-xs font-bold">Construtora JB</h5>
                              <p className="text-[10px] text-zinc-500">Vistoria • Estrutura de slitting</p>
                            </div>
                          </div>
                          <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider select-none shrink-0 border border-blue-200">AGENDADO</span>
                        </div>
                      </div>
                    </div>

                    {/* Section Summary quick counters (3 grids) */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className={`p-3 rounded-2xl text-center border ${
                        darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}>
                        <div className="text-lg font-black font-condensed text-blue-500">7</div>
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide">Obras Ativas</div>
                      </div>
                      <div className={`p-3 rounded-2xl text-center border ${
                        darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}>
                        <div className="text-lg font-black font-condensed text-amber-500">12</div>
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide">Orçamentos</div>
                      </div>
                      <div className={`p-3 rounded-2xl text-center border ${
                        darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}>
                        <div className="text-lg font-black font-condensed text-emerald-500">3</div>
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide">Aprovados</div>
                      </div>
                    </div>

                    {/* Saved quotes feed summary */}
                    <div className="space-y-2 pb-6">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-xs uppercase tracking-wider text-zinc-500">Últimos Orçamentos</span>
                        <button onClick={() => setViewportTab('hist')} className="text-xs text-amber-500 cursor-pointer">Ver todos</button>
                      </div>

                      <div className="space-y-2">
                        {quotes.length === 0 ? (
                          <div className={`text-center p-6 border border-dashed rounded-2xl text-xs text-zinc-400 font-bold ${
                            darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white'
                          }`}>
                            Sem orçamentos no banco de dados.
                          </div>
                        ) : (
                          quotes.slice(0, 3).map((q, idx) => (
                            <div 
                              key={q.id}
                              className={`p-3 rounded-2xl border flex justify-between items-center transition-all ${
                                darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                              }`}
                            >
                              <div>
                                <h5 className="text-xs font-bold tracking-tight">{q.customerName}</h5>
                                <span className="text-[9px] font-mono font-bold text-zinc-500">{q.id} • {q.date}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black font-condensed block text-zinc-900 dark:text-zinc-100">
                                  R$ {q.total?.toFixed(2) || '0.00'}
                                </span>
                                <span className={`text-[8px] px-1 py-0.5 rounded font-black uppercase ${
                                  q.status === 'pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                }`}>
                                  {q.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 2: STEP-BY-STEP QUOTE WIZARD FORM */}
                {viewportTab === 'orc' && (
                  <div className="space-y-4 animate-fade-in pb-10">
                    
                    {/* Progress Segment Indicators block */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs font-bold text-zinc-400 select-none">
                        <span>Etapa {wizardStep} de 5</span>
                        <span className="text-amber-500">
                          {wizardStep === 1 && 'Dados do Cliente'}
                          {wizardStep === 2 && 'Chapas & Cobertura'}
                          {wizardStep === 3 && 'Calhas e Rufos'}
                          {wizardStep === 4 && 'Conexões & Vedação'}
                          {wizardStep === 5 && 'Serviços e Conclusão'}
                        </span>
                      </div>

                      {/* Bar Indicators Segment */}
                      <div className="grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <div 
                            key={s} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              s <= wizardStep ? 'bg-amber-500 shadow-sm' : 'bg-zinc-300 dark:bg-zinc-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* STEP 1: CLIENT DETAILS AND PHOTO */}
                    {wizardStep === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-0.5">
                          <h3 className="text-base font-extrabold">Identifique o Cliente</h3>
                          <p className="text-xs text-zinc-400">Adicione os dados cadastrais da proposta</p>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400">Nome do Cliente</label>
                            <div className="relative">
                              <input 
                                type="text"
                                value={wName}
                                onChange={(e) => setWName(e.target.value)}
                                placeholder="Nome completo"
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3.5 py-2.5 pl-9 pr-3 text-xs font-semibold outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-[#1a1a1a] dark:text-white"
                              />
                              <Users className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 shrink-0" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400">Telefone / WhatsApp</label>
                            <div className="relative">
                              <input 
                                type="text"
                                value={wPhone}
                                onChange={(e) => setWPhone(e.target.value)}
                                placeholder="Ex: (11) 99999-8888"
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3.5 py-2.5 pl-9 pr-3 text-xs font-semibold outline-none focus:border-amber-400 text-[#1a1a1a] dark:text-white"
                              />
                              <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 shrink-0" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-405">Endereço da Obra</label>
                            <div className="relative">
                              <input 
                                type="text"
                                value={wAddress}
                                onChange={(e) => setWAddress(e.target.value)}
                                placeholder="Rua, número, bairro e cidade"
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3.5 py-2.5 pl-9 pr-3 text-xs font-semibold outline-none focus:border-amber-400 text-[#1a1a1a] dark:text-white"
                              />
                              <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 shrink-0" />
                            </div>
                          </div>

                          {/* Foto da Obra Dash upload box (Matches screenshot 5) */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400">Foto da Obra (Opcional)</label>
                            <div 
                              onClick={triggerMockUpload}
                              className="cursor-pointer border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex flex-col items-center justify-center gap-2 text-center text-[11px] font-bold text-zinc-500"
                            >
                              <Camera className="w-6 h-6 text-zinc-450 stroke-[2] animate-bounce" />
                              <div>
                                <span className="text-zinc-650 dark:text-zinc-300">Foto da Obra</span>
                                <p className="text-[10px] text-zinc-500 font-normal mt-0.5">Clique para simular câmera do iPhone</p>
                              </div>
                            </div>
                            
                            {wPhoto && (
                              <div className="relative rounded-2xl border bg-white border-zinc-300 text-zinc-800 p-2 text-xs flex gap-3.5 items-center">
                                <img src={wPhoto} className="w-12 h-12 object-cover rounded-lg" alt="Obra" />
                                <div className="flex-grow">
                                  <span className="font-bold block">obra_01.jpeg</span>
                                  <span className="text-[10px] text-zinc-500">240 KB • Sucedido</span>
                                </div>
                                <button onClick={() => setWPhoto(null)} className="p-1 hover:bg-zinc-150 text-red-500 rounded"><X className="w-4 h-4" /></button>
                              </div>
                            )}
                          </div>
                        </div>

                        <button 
                          onClick={() => setWizardStep(2)}
                          className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl font-bold text-xs transition uppercase tracking-wider shadow cursor-pointer mt-3"
                        >
                          Continuar para Cobertura →
                        </button>
                      </div>
                    )}

                    {/* STEP 2: COVERAGE / TILES */}
                    {wizardStep === 2 && (
                      <div className="space-y-4">
                        <div className="space-y-0.5">
                          <h3 className="text-base font-extrabold">Telhas e Cobertura Metálica</h3>
                          <p className="text-xs text-zinc-400">Geração de chapas de cobertura galvalume / zinco</p>
                        </div>

                        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-900/40 space-y-3.5">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-400">Modelo da Telha</label>
                            <select 
                              value={selTileType}
                              onChange={(e) => setSelTileType(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold outline-none text-[#1a1a1a] dark:text-white"
                            >
                              <option>Trapézio 25</option>
                              <option>Trapézio 40</option>
                              <option>Ondulada 17</option>
                              <option>Sanduíche Termoacústica</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-400">Material de Composição</label>
                            <div className="flex gap-1.5 flex-wrap">
                              {['Galvalume', 'Galvanizado', 'Alumínio', 'Pré-Pintada'].map((m) => (
                                <button
                                  key={m}
                                  onClick={() => setSelTileMat(m)}
                                  className={`flex-1 py-1.5 px-3 border rounded-xl text-[10px] font-bold uppercase transition ${
                                    selTileMat === m ? 'border-amber-500 bg-amber-500 text-zinc-950 font-black' : 'border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Comprimento (m)</label>
                              <input 
                                type="number" 
                                value={tileLen}
                                onChange={(e) => setTileLen(Math.max(1, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Quantidade (un)</label>
                              <input 
                                type="number" 
                                value={tileQty}
                                onChange={(e) => setTileQty(Math.max(1, parseInt(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-403">Preço Estimado do m² (R$)</label>
                            <input 
                              type="number"
                              value={tilePrice}
                              onChange={(e) => setTilePrice(Math.max(1, parseFloat(e.target.value) || 0))}
                              className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white"
                            />
                          </div>

                          <button 
                            onClick={addTileToStep}
                            className="w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-xl font-bold text-[11px] uppercase tracking-wider transition"
                          >
                            + Adicionar Área de Cobertura
                          </button>
                        </div>

                        {/* List of active added coverage items */}
                        {wTileItems.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Ítens Coberturas Registrados:</span>
                            {wTileItems.map((it, idx) => (
                              <div key={it.id} className="p-3 bg-zinc-200/50 dark:bg-zinc-900 rounded-xl flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-extrabold">{it.desc}</span>
                                  <p className="text-[10px] text-zinc-500 font-bold">{it.specs} • R$ {it.unit}/m²</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <strong className="font-bold">R$ {it.total.toFixed(2)}</strong>
                                  <button onClick={() => setWTileItems(wTileItems.filter(p => p.id !== it.id))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2.5 pt-2">
                          <button onClick={() => setWizardStep(1)} className="flex-1 py-3 bg-zinc-500 text-white rounded-xl font-bold text-xs">Voltar</button>
                          <button onClick={() => setWizardStep(3)} className="flex-1 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl font-bold text-xs">Avançar para Calhas →</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: GUTTERS AND FLASHINGS (CALHAS E RUFOS) */}
                    {wizardStep === 3 && (
                      <div className="space-y-4">
                        <div className="space-y-0.5">
                          <h3 className="text-base font-extrabold font-condensed">Calhas e Rufos de Escoamento</h3>
                          <p className="text-xs text-zinc-400">Configure as dobragens em chapas galvanizadas</p>
                        </div>

                        {/* Setup Calha inputs box */}
                        <div className="p-4.5 rounded-2xl border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-900/30 space-y-3">
                          <span className="text-xs uppercase font-black text-amber-500 tracking-wider">🔩 1. Calha sob Medida</span>
                          
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400">Modelo Calha</label>
                            <select 
                              value={selGutterType}
                              onChange={(e) => setSelGutterType(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white font-bold"
                            >
                              <option>Calha Moldura Pluvia</option>
                              <option>Calha Americana Pingadeira</option>
                              <option>Calha Quadrada de Beiral</option>
                              <option>Calha Platibanda de Sobrecarga</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Corte Desenvolvimento (mm)</label>
                              <input 
                                type="number" 
                                value={gutterCut}
                                onChange={(e) => setGutterCut(Math.max(10, parseInt(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Comprimento (m)</label>
                              <input 
                                type="number" 
                                value={gutterLen}
                                onChange={(e) => setGutterLen(Math.max(1, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white"
                              />
                            </div>
                          </div>

                          <button 
                            onClick={addGutterToStep}
                            className="w-full py-1.5 bg-yellow-100 text-yellow-850 border border-yellow-250 text-[10px] font-black uppercase tracking-wide rounded-lg"
                          >
                            + Adicionar Linha de Calha
                          </button>
                        </div>

                        {/* Setup Rufo inputs box */}
                        <div className="p-4.5 rounded-2xl border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-900/30 space-y-3">
                          <span className="text-xs uppercase font-black text-amber-500 tracking-wider">🔩 2. Rufos / Contra Rufo</span>
                          
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400">Modelo Rufo</label>
                            <select 
                              value={selRufoType}
                              onChange={(e) => setSelRufoType(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white font-bold"
                            >
                              <option>Rufo Encosto c/ Pingadeira</option>
                              <option>Rufo Pingadeira Externa</option>
                              <option>Rufo Encosto Interno</option>
                              <option>Cumeeira Sob Medida</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Corte Desenvolvimento (mm)</label>
                              <input 
                                type="number" 
                                value={rufoCut}
                                onChange={(e) => setRufoCut(Math.max(10, parseInt(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Comprimento (m)</label>
                              <input 
                                type="number" 
                                value={rufoLen}
                                onChange={(e) => setRufoLen(Math.max(1, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white"
                              />
                            </div>
                          </div>

                          <button 
                            onClick={addRufoToStep}
                            className="w-full py-1.5 bg-yellow-100 text-yellow-850 border border-yellow-250 text-[10px] font-black uppercase tracking-wide rounded-lg"
                          >
                            + Adicionar Linha de Rufo
                          </button>
                        </div>

                        {/* List added features */}
                        {(wGutterItems.length > 0 || wRufoItems.length > 0) && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Peças Dobradas Registradas:</span>
                            {[...wGutterItems, ...wRufoItems].map((e) => (
                              <div key={e.id} className="p-3 bg-zinc-200/55 dark:bg-zinc-900 rounded-xl flex justify-between items-center text-xs">
                                <div>
                                  <strong className="font-extrabold">{e.desc}</strong>
                                  <p className="text-[10px] text-zinc-500 font-bold">{e.specs}</p>
                                </div>
                                <span className="font-bold shrink-0">R$ {e.total.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button onClick={() => setWizardStep(2)} className="flex-1 py-3 bg-zinc-500 text-white rounded-xl font-bold text-xs">Voltar</button>
                          <button onClick={() => setWizardStep(4)} className="flex-1 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl font-bold text-xs font-condensed tracking-wider">Avançar para Conexões →</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: DOWNPIPES (CONDUTORES), CHIMNEY FLUES,Bisnagas de PU-40 SEALANT */}
                    {wizardStep === 4 && (
                      <div className="space-y-4">
                        <div className="space-y-0.5">
                          <h3 className="text-base font-extrabold">Condutores e Mangueiras de Vedação</h3>
                          <p className="text-xs text-zinc-400">Defina os condutores pluviais e bisnagas de vedação PU-40</p>
                        </div>

                        {/* Condutores Pluviais retangulares */}
                        <div className="bg-zinc-500/5 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3">
                          <span className="text-[11px] font-black text-amber-500 uppercase tracking-wider block">🚿 Condutores Pluviais</span>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Quantidade (un)</label>
                              <input 
                                type="number" 
                                value={wCondQty}
                                onChange={(e) => setWCondQty(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Comp. Barra (m)</label>
                              <input 
                                type="number" 
                                value={wCondLen}
                                onChange={(e) => setWCondLen(Math.max(1, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Chaminés e Chapéus */}
                        <div className="bg-zinc-500/5 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3">
                          <span className="text-[11px] font-black text-amber-500 uppercase tracking-wider block">🏭 Chaminés & Acessórios</span>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Quantidade (un)</label>
                              <input 
                                type="number" 
                                value={wChamQty}
                                onChange={(e) => setWChamQty(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Preço Chapéu (R$)</label>
                              <input 
                                type="number" 
                                value={wChamPrice}
                                onChange={(e) => setWChamPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* PU-40 Bisnaga counts */}
                        <div className="bg-zinc-500/5 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3">
                          <span className="text-[11px] font-black text-amber-500 uppercase tracking-wider block">🧪 Selante bisnaga PU-40 (400g)</span>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Bisnagas Recomendadas</label>
                              <input 
                                type="number" 
                                value={puQty}
                                onChange={(e) => setPuQty(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Valor Unitário (R$)</label>
                              <input 
                                type="number" 
                                value={puPrice}
                                onChange={(e) => setPuPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border rounded-xl px-3 py-1.5 text-xs text-[#1a1a1a] dark:text-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => setWizardStep(3)} className="flex-1 py-3 bg-zinc-500 text-white rounded-xl font-bold text-xs">Voltar</button>
                          <button onClick={() => setWizardStep(5)} className="flex-1 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl font-bold text-xs font-condensed tracking-wider">Avançar para Resumo →</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: LABOR FEES, SERVICE COMMENTS AND CONCLUDE ORCAMENTO */}
                    {wizardStep === 5 && (
                      <div className="space-y-4">
                        <div className="space-y-0.5">
                          <h3 className="text-base font-extrabold font-condensed">Resumo e Aprovação do Orçamento</h3>
                          <p className="text-xs text-zinc-400">Configure descontos comerciais e salve o projeto</p>
                        </div>

                        <div className="p-4 rounded-3xl border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-900/20 space-y-3.5">
                          
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400">Mão de Obra de Instalação (R$)</label>
                            <input 
                              type="number" 
                              value={laborPrice}
                              onChange={(e) => setLaborPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-bold text-zinc-900 dark:text-white outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400">Desconto Comercial Especial (%)</label>
                            <input 
                              type="number" 
                              value={discountPercent}
                              onChange={(e) => setDiscountPercent(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-bold text-zinc-900 dark:text-white outline-none"
                            />
                          </div>

                          {/* Live Dynamic invoice block summary list */}
                          <div className="bg-[#111215] text-white p-4.5 rounded-2xl space-y-2 text-xs">
                            <div className="flex justify-between items-center text-zinc-400 font-bold">
                              <span>Soma Bruta Materiais:</span>
                              <span className="font-mono">R$ {wSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-amber-400 font-bold leading-normal">
                              <span>Desconto Concedido ({discountPercent}%):</span>
                              <span className="font-mono">- R$ {wDiscAmount.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-zinc-800 my-1 pt-1.5 flex justify-between items-center text-base font-black text-emerald-400">
                              <span>TOTAL DO CLIENTE:</span>
                              <span className="font-mono">R$ {wTotal.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400">Termos, Garantias e Notas</label>
                            <textarea 
                              value={wNotes}
                              onChange={(e) => setWNotes(e.target.value)}
                              className="w-full min-h-[60px] bg-white dark:bg-zinc-900 border rounded-xl text-xs p-2 text-zinc-900 dark:text-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => setWizardStep(4)} className="flex-1 py-3.5 bg-zinc-500 text-white rounded-xl font-bold text-xs cursor-pointer">Voltar</button>
                          <button 
                            onClick={saveWizardBudget}
                            className="flex-[2] py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Salvar Orçamento 🎉</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB 3: SAVED HISTORICO BUDGETS LIST */}
                {viewportTab === 'hist' && (
                  <div className="space-y-4 animate-fade-in pb-10">
                    <div className="space-y-0.5 select-none">
                      <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Controle Financeiro</span>
                      <h3 className="text-lg font-black font-condensed tracking-wide">Histórico de Orçamentos</h3>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-3 rounded-2xl border dark:border-zinc-850">
                      <CalhaZapHistory
                        quotes={quotes}
                        onToggleStatus={handleToggleQuoteStatus}
                        onDeleteQuote={handleDeleteQuoteId}
                        onEditLoad={handleEditLoad}
                        onPrintQuote={handleDirectPrintReprnt}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: CALCULATORS 2X2 DASHBOARD GRID OR ACTIVE CALC PANEL */}
                {viewportTab === 'calc' && (
                  <div className="space-y-4 animate-fade-in pb-12">
                    
                    {/* Inner detail view if calculator is selected */}
                    {selectedCalc ? (
                      <div className="space-y-4 animate-fade-in">
                        {/* Calculator header containing Back link */}
                        <button 
                          onClick={() => setSelectedCalc(null)}
                          className="flex items-center gap-1.5 text-xs text-amber-500 font-bold cursor-pointer group"
                        >
                          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                          <span>Voltar para Calculadoras</span>
                        </button>

                        {/* Metragem manual calculated box */}
                        {selectedCalc === 'metragem' && (
                          <div className="space-y-4">
                            <div className="space-y-0.5">
                              <h3 className="text-base font-extrabold">Cálculo de Metragem Quadrada (m²)</h3>
                              <p className="text-xs text-zinc-400">Calcule chapas lineares com fator de cobertura</p>
                            </div>

                            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} space-y-3`}>
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-400">Largura Plana (m)</label>
                                <input 
                                  type="number" 
                                  value={metWidthVal}
                                  onChange={(e) => setMetWidthVal(Math.max(1, parseFloat(e.target.value) || 0))}
                                  className="w-full bg-white dark:bg-zinc-950 border rounded-xl px-3 py-1.5 text-xs"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-400">Extensão / Comprimento (m)</label>
                                <input 
                                  type="number" 
                                  value={metLengthVal}
                                  onChange={(e) => setMetLengthVal(Math.max(1, parseFloat(e.target.value) || 0))}
                                  className="w-full bg-white dark:bg-zinc-950 border rounded-xl px-3 py-1.5 text-xs"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-404">Fator de Transpasse / Caimento inclinável</label>
                                <select 
                                  value={metPitchCoeff} 
                                  onChange={(e) => setMetPitchCoeff(parseFloat(e.target.value))}
                                  className="w-full bg-white dark:bg-zinc-950 border rounded-xl px-3 py-1.5 text-xs"
                                >
                                  <option value={1.0}>Plano / Liso (Sem inclinação fator 1.0)</option>
                                  <option value={1.04}>Cobertura Inclinada Padrão 20% (Fator 1.04)</option>
                                  <option value={1.12}>Cobertura Inclinada Forte 35% (Fator 1.12)</option>
                                </select>
                              </div>

                              <div className="p-3.5 bg-amber-500/10 border border-amber-300 dark:border-amber-900/50 rounded-xl space-y-1 text-center">
                                <span className="text-[10px] text-amber-500 font-black tracking-widest uppercase">ÁREA INDUSTRIAL COMPUTADA</span>
                                <div className="text-3xl font-black font-condensed text-amber-500 leading-none">
                                  {(metWidthVal * metLengthVal * metPitchCoeff).toFixed(2)} m²
                                </div>
                                <p className="text-[10px] text-zinc-500 font-normal">Superfície plana líguida: {(metWidthVal * metLengthVal).toFixed(1)} m²</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Metro ↔ Kg dynamic component */}
                        {selectedCalc === 'metro-kg' && (
                          <div className="space-y-3">
                            <div className="space-y-0.5">
                              <h3 className="text-base font-extrabold flex items-center gap-1.5">
                                <Ruler className="w-5 h-5 text-amber-500" />
                                <span>Conversor Metro ↔ Peso KG</span>
                              </h3>
                              <p className="text-xs text-zinc-400">Calcule pesos de bobinas mães e metros fatiados</p>
                            </div>
                            <CalhaZapMetro 
                              verificarAtivo={verificarAtivo}
                              exibirLock={exibirLock}
                            />
                          </div>
                        )}

                        {/* Plano de corte component */}
                        {selectedCalc === 'corte' && (
                          <div className="space-y-3">
                            <div className="space-y-0.5">
                              <h3 className="text-base font-extrabold flex items-center gap-1.5">
                                <Scissors className="w-5 h-5 text-amber-555" />
                                <span>Otimização Plano de Corte</span>
                              </h3>
                              <p className="text-xs text-zinc-400">Aproveitamento slitter sem retalhos residenciais</p>
                            </div>
                            <CalhaZapCorte 
                              verificarAtivo={verificarAtivo}
                              exibirLock={exibirLock}
                            />
                          </div>
                        )}

                        {/* Inclinação slope visual helper */}
                        {selectedCalc === 'incline' && (
                          <div className="space-y-4">
                            <div className="space-y-0.5">
                              <h3 className="text-base font-extrabold">Cálculo de Inclinação & Beiral</h3>
                              <p className="text-xs text-zinc-400">Projetos de caimento hidráulico de calha pluvial</p>
                            </div>

                            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} space-y-3.5`}>
                              
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-400">Comprimento Horizontal do Cano / Beiral (m)</label>
                                <input 
                                  type="range"
                                  min={2}
                                  max={15}
                                  step={0.5}
                                  value={incRoofLen}
                                  onChange={(e) => setIncRoofLen(parseFloat(e.target.value))}
                                  className="w-full accent-amber-500"
                                />
                                <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                                  <span>2 m</span>
                                  <span className="text-amber-500 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">{incRoofLen} metros</span>
                                  <span>15 m</span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-400">Inclinação Alvo Desejada (%)</label>
                                <div className="flex gap-1">
                                  {[10, 15, 20, 25, 30, 40].map((p) => (
                                    <button
                                      key={p}
                                      onClick={() => setIncRoofPercent(p)}
                                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                                        incRoofPercent === p ? 'bg-amber-400 text-zinc-950 font-black' : 'bg-zinc-200/50 dark:bg-zinc-950 text-zinc-500'
                                      }`}
                                    >
                                      {p}%
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Trigonometric result */}
                              <div className="p-4 bg-[#111215] text-white rounded-xl space-y-2.5">
                                <span className="text-[9px] uppercase font-bold text-zinc-450 tracking-widest block">RESULTADO MATEMÁTICO</span>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-zinc-400">Altura Necessária da Cumeeira:</span>
                                  <strong className="text-amber-400 font-mono text-base">{(incRoofLen * (incRoofPercent / 100)).toFixed(2)}m ({((incRoofLen * (incRoofPercent / 100)) * 100).toFixed(0)}cm)</strong>
                                </div>

                                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold border-t border-zinc-800 pt-1.5">
                                  <span>Ângulo de Escoamento:</span>
                                  <span className="font-mono text-zinc-300">{(Math.atan(incRoofPercent / 100) * (180 / Math.PI)).toFixed(1)}° graus</span>
                                </div>

                                {/* Triangulo diagram draw */}
                                <div className="h-20 w-full relative border-b border-zinc-700 mt-2 flex items-end">
                                  <div className="absolute left-0 bottom-0 text-[9px] text-[#ca8a04]">Calha</div>
                                  <div className="absolute right-0 bottom-0 text-[9px] text-zinc-500">Beiral</div>
                                  
                                  {/* Triangle SVG slope */}
                                  <svg className="w-full h-full stroke-amber-500 fill-amber-500/10 overflow-visible" style={{ position: 'absolute' }}>
                                    <path d={`M 15 80 L 320 ${80 - (incRoofPercent * 1.4)} L 320 80 Z`} strokeWidth="2" />
                                  </svg>
                                </div>
                              </div>

                            </div>
                          </div>
                        )}

                      </div>
                    ) : (
                      
                      // CALCULATORS 2X2 GENERAL GRID MENU (Matches screen 2)
                      <div className="space-y-4">
                        
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Ferramentas Profissionais</span>
                          <h3 className="text-lg font-black font-condensed tracking-wide">Calculadoras Técnicas</h3>
                        </div>

                        {/* Top dark navy gradient banner matching Image 2 */}
                        <div className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 text-white flex gap-4 items-center relative overflow-hidden">
                          <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                            <Calculator className="w-32 h-32 text-white" />
                          </div>
                          
                          <div className="w-12 h-12 bg-amber-400/20 text-amber-300 border border-amber-500/30 rounded-2xl flex items-center justify-center shrink-0">
                            <Calculator className="w-6 h-6 stroke-[2.5]" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-sm tracking-tight">Cálculos Profissionais</h4>
                            <p className="text-[10px] text-zinc-400 leading-snug">Economia de material e precisão absoluta na execução</p>
                          </div>
                        </div>

                        {/* Primary 2x2 cards category selector (Matches visual screen 2) */}
                        <div className="grid grid-cols-2 gap-3 pb-8">
                          
                          {/* Card 1: Metragem */}
                          <div 
                            onClick={() => setSelectedCalc('metragem')}
                            className={`p-4 rounded-2xl border cursor-pointer hover:scale-101 active:scale-98 transition flex flex-col justify-between h-[125px] ${
                              darkMode ? 'bg-zinc-905 border-zinc-850 hover:bg-zinc-900' : 'bg-white hover:bg-zinc-50 border-zinc-200 shadow-xs'
                            }`}
                          >
                            <span className="p-1 rounded-lg bg-blue-100 text-blue-700 w-7 h-7 flex items-center justify-center"><Ruler className="w-4.5 h-4.5" /></span>
                            <div>
                              <h5 className="font-extrabold text-xs">Metragem</h5>
                              <p className="text-[10px] text-zinc-550 truncate">m² de calha e telha</p>
                              <span className="text-[9px] font-black text-amber-500 block mt-1.5">Calcular →</span>
                            </div>
                          </div>

                          {/* Card 2: Metro <-> Kg */}
                          <div 
                            onClick={() => setSelectedCalc('metro-kg')}
                            className={`p-4 rounded-2xl border cursor-pointer hover:scale-101 active:scale-98 transition flex flex-col justify-between h-[125px] ${
                              darkMode ? 'bg-zinc-905 border-zinc-850 hover:bg-zinc-900' : 'bg-white hover:bg-zinc-50 border-zinc-200 shadow-xs'
                            }`}
                          >
                            <span className="p-1 rounded-lg bg-amber-100 text-amber-700 w-7 h-7 flex items-center justify-center"><Scale className="w-4.5 h-4.5" /></span>
                            <div>
                              <h5 className="font-extrabold text-xs">Metro ↔ Kg</h5>
                              <p className="text-[10px] text-zinc-550 truncate">Conversão de bobinas</p>
                              <span className="text-[9px] font-black text-amber-500 block mt-1.5">Calcular →</span>
                            </div>
                          </div>

                          {/* Card 3: Plano de Corte */}
                          <div 
                            onClick={() => setSelectedCalc('corte')}
                            className={`p-4 rounded-2xl border cursor-pointer hover:scale-101 active:scale-98 transition flex flex-col justify-between h-[125px] ${
                              darkMode ? 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900' : 'bg-white hover:bg-zinc-50 border-zinc-200 shadow-xs'
                            }`}
                          >
                            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-700 w-7 h-7 flex items-center justify-center"><Scissors className="w-4.5 h-4.5" /></span>
                            <div>
                              <h5 className="font-extrabold text-xs">Plano de Corte</h5>
                              <p className="text-[10px] text-zinc-550 truncate">Aproveitamento limpo</p>
                              <span className="text-[9px] font-black text-amber-500 block mt-1.5">Calcular →</span>
                            </div>
                          </div>

                          {/* Card 4: Inclinação */}
                          <div 
                            onClick={() => setSelectedCalc('incline')}
                            className={`p-4 rounded-2xl border cursor-pointer hover:scale-101 active:scale-98 transition flex flex-col justify-between h-[125px] ${
                              darkMode ? 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900' : 'bg-white hover:bg-zinc-50 border-zinc-200 shadow-xs'
                            }`}
                          >
                            <span className="p-1 rounded-lg bg-purple-100 text-purple-700 w-7 h-7 flex items-center justify-center"><Wrench className="w-4.5 h-4.5" /></span>
                            <div>
                              <h5 className="font-extrabold text-xs">Inclinação</h5>
                              <p className="text-[10px] text-zinc-550 truncate">Ajuste de caimento</p>
                              <span className="text-[9px] font-black text-amber-500 block mt-1.5">Calcular →</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB 5: EMPRESA, PLANS AND AI INTEGRATION */}
                {viewportTab === 'emp' && (
                  <div className="space-y-4 animate-fade-in pb-16">
                    
                    {/* Header title */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-zinc-450 tracking-wider uppercase">Painel de Configuração</span>
                      <h3 className="text-lg font-black font-condensed tracking-wide">Dados da Serralheria</h3>
                    </div>

                    {/* Integrated AI assistent inline overlay toggler */}
                    <details className={`p-4 rounded-2xl border select-none group transition-all duration-300 ${
                      darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                    }`}>
                      <summary className="flex justify-between items-center text-xs font-black uppercase tracking-wider cursor-pointer list-none">
                        <div className="flex items-center gap-2 text-amber-500">
                          <Bot className="w-4.5 h-4.5 text-amber-500" />
                          <span>FALAR COM MEU ASSISTENTE AI</span>
                        </div>
                        <ChevronRight className="w-4.5 h-4.5 group-open:rotate-90 transition-transform" />
                      </summary>
                      
                      <div className="pt-4 h-[420px] rounded-xl overflow-hidden border dark:border-zinc-800 mt-2 bg-zinc-950">
                        <AcoAssistant />
                      </div>
                    </details>

                    {/* Company Configuration credentials form */}
                    <form onSubmit={saveCompanyConfig} className={`p-4 rounded-2xl border space-y-3.5 text-xs ${
                      darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                    }`}>
                      <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block border-b pb-1 dark:border-zinc-800">Definições da Oficina</span>
                      
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400 font-bold">Nome Fantasia Comercial</label>
                        <input 
                          type="text" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-zinc-100 dark:bg-zinc-950 border rounded-lg px-2.5 py-1.5 focus:border-amber-400 outline-none font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] text-zinc-400 font-bold">Seu Nome (Dono)</label>
                          <input 
                            type="text" 
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-zinc-950 border rounded-lg px-2.5 py-1.5 outline-none font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-zinc-400 font-bold">WhatsApp Contato</label>
                          <input 
                            type="text" 
                            value={companyPhone}
                            onChange={(e) => setCompanyPhone(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-zinc-950 border rounded-lg px-2.5 py-1.5 outline-none font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400 font-bold">CNPJ de Faturamento</label>
                        <input 
                          type="text" 
                          value={companyCNPJ}
                          onChange={(e) => setCompanyCNPJ(e.target.value)}
                          className="w-full bg-zinc-100 dark:bg-zinc-950 border rounded-lg px-2.5 py-1.5 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400 font-bold">Logotipo Empresa (Cópia Base64 / URL)</label>
                        <input 
                          type="text" 
                          value={companyLogo}
                          onChange={(e) => setCompanyLogo(e.target.value)}
                          placeholder="Fórmula de imagem Base64"
                          className="w-full bg-zinc-100 dark:bg-zinc-950 border rounded-lg px-2.5 py-1.5 outline-none truncate"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold rounded-xl transition"
                      >
                        Salvar Informações da Empresa
                      </button>
                    </form>

                    {/* Pricing Plans option cards */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Licenciamento Premium</span>
                      <CalhaZapPlanos 
                        verificarAtivo={verificarAtivo}
                        ativarAcessoPlano={ativarAcessoPlano}
                      />
                    </div>

                  </div>
                )}

                {/* TAB 6: NOTIFICATIONS FULL SCREEN SCREENSHOTS 3 & 4 */}
                {viewportTab === 'notif' && (
                  <div className="space-y-4 animate-fade-in pb-16">
                    
                    {/* Mock header containing Back link */}
                    <div className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-900/50 p-2 rounded-2xl">
                      <button 
                        onClick={() => setViewportTab('home')}
                        className="flex items-center gap-1 text-xs text-amber-500 font-bold cursor-pointer"
                      >
                        <ArrowLeft className="w-4.5 h-4.5" />
                        <span>Voltar</span>
                      </button>
                      <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Notificações</h3>
                      <button 
                        onClick={markAllNotifsRead}
                        className="text-[10px] text-zinc-500 font-bold hover:text-white cursor-pointer"
                      >
                        Marcar lidas
                      </button>
                    </div>

                    <div className="space-y-2">
                      {notifs.map((n) => (
                        <div 
                          key={n.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                            n.read 
                              ? (darkMode ? 'bg-zinc-900/40 border-zinc-900 text-zinc-400' : 'bg-zinc-50/50 border-zinc-100 text-zinc-500')
                              : (darkMode ? 'bg-zinc-900 border-zinc-800 text-white font-semibold' : 'bg-white border-zinc-200 text-zinc-900 font-semibold shadow-xs')
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {/* Color indicator icons based on type */}
                            <span className="text-lg py-0.5 select-none shrink-0">
                              {n.type === 'approved' && '🟢'}
                              {n.type === 'comment' && '🔵'}
                              {n.type === 'reminder' && '🟡'}
                              {n.type === 'payment' && '💵'}
                              {n.type === 'expiring' && '🔴'}
                              {n.type === 'whatsapp' && '💬'}
                            </span>
                            <div className="space-y-0.5">
                              <h5 className="text-[11.5px] leading-snug tracking-tight font-black">{n.title}</h5>
                              <p className="text-[10px] leading-relaxed opacity-90">{n.desc}</p>
                              <span className="text-[9px] text-zinc-500 block font-normal pt-0.5">{n.time}</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => removeNotif(n.id)} 
                            className="text-zinc-500 hover:text-zinc-300 p-1 shrink-0 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

              </div>

              {/* PERSISTENT MOBILE BOTTOM NAVIGATION TAB BAR (Exactly matching screen layouts) */}
              <div className={`absolute bottom-0 left-0 w-full px-5 py-2.5 flex justify-between items-center z-30 border-t ${
                darkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200'
              }`}>
                
                {/* 1. Home Tab icon */}
                <button 
                  onClick={() => {
                    setSelectedCalc(null);
                    setViewportTab('home');
                  }}
                  className={`flex flex-col items-center gap-1 cursor-pointer transition select-none ${
                    viewportTab === 'home' ? 'text-amber-500 font-extrabold' : 'text-zinc-450 hover:text-zinc-650'
                  }`}
                >
                  <History className="w-5 h-5 stroke-[2.2]" />
                  <span className="text-[9px] font-bold tracking-wide">Home</span>
                </button>

                {/* 2. List Tab icon */}
                <button 
                  onClick={() => {
                    setSelectedCalc(null);
                    setViewportTab('hist');
                  }}
                  className={`flex flex-col items-center gap-1 cursor-pointer transition select-none ${
                    viewportTab === 'hist' ? 'text-amber-500 font-extrabold' : 'text-zinc-450 hover:text-zinc-650'
                  }`}
                >
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                  <span className="text-[9px] font-bold tracking-wide">Propostas</span>
                </button>

                {/* 3. Central glowing gold floating button "+" triggers orcamento */}
                <div className="relative top-[-18px] shrink-0">
                  <button 
                    onClick={() => {
                      setWizardStep(1);
                      setViewportTab('orc');
                    }}
                    className="w-13 h-13 bg-amber-400 hover:bg-amber-500 active:scale-90 text-slate-950 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/25 border-4 border-white dark:border-black shrink-0 transition-transform cursor-pointer"
                  >
                    <Plus className="w-6.5 h-6.5 stroke-[3]" />
                  </button>
                </div>

                {/* 4. Calculator icon tab */}
                <button 
                  onClick={() => {
                    setSelectedCalc(null);
                    setViewportTab('calc');
                  }}
                  className={`flex flex-col items-center gap-1 cursor-pointer transition select-none ${
                    viewportTab === 'calc' ? 'text-amber-500 font-extrabold' : 'text-zinc-450 hover:text-zinc-650'
                  }`}
                >
                  <Calculator className="w-5 h-5 stroke-[2.2]" />
                  <span className="text-[9px] font-bold tracking-wide">Cálculos</span>
                </button>

                {/* 5. Support / Setup tab */}
                <button 
                  onClick={() => {
                    setSelectedCalc(null);
                    setViewportTab('emp');
                  }}
                  className={`flex flex-col items-center gap-1 cursor-pointer transition select-none ${
                    viewportTab === 'emp' ? 'text-amber-500 font-extrabold' : 'text-zinc-450 hover:text-zinc-650'
                  }`}
                >
                  <Building2 className="w-5 h-5 stroke-[2.2]" />
                  <span className="text-[9px] font-bold tracking-wide">Empresa</span>
                </button>

                {/* iPhone swipe bottom pill indicator */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-300 dark:bg-zinc-800 rounded-full select-none" />
              </div>

            </div>
          )}

        </div>

      </div>

      {/* FOOTER PREMIUM ACTIONS SECURITY LOCK OVERLAY MODAL */}
      {showLock && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border-2 border-amber-450 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative animate-scale-up text-zinc-900 dark:text-white">
            <div className="text-4xl text-center">🔐</div>
            <h4 className="text-base font-black uppercase tracking-wider leading-tight">{lockTitle}</h4>
            <p className="text-xs text-zinc-500 leading-normal" dangerouslySetInnerHTML={{ __html: lockSub }}></p>
            
            <div className="pt-2 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setShowLock(false);
                  setViewportTab('emp');
                }}
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs rounded-xl transition uppercase tracking-wider cursor-pointer"
              >
                Ativar licença grátis agora!
              </button>
              <button 
                onClick={() => setShowLock(false)}
                className="w-full py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl transition uppercase tracking-wider cursor-pointer font-mono"
              >
                Voltar à oficina
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
