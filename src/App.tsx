"use client";

import React, { useState, useEffect } from 'react';
import { 
  Scale, FileText, Phone, User, Calculator, Bot, Truck, Sparkles, 
  Plus, Trash2, Printer, Download, Search, Building2, HelpCircle, 
  Send, Layers, Table, Share2, CheckCircle2, Calendar, DollarSign, 
  Hammer, FileSpreadsheet, Percent, Wrench, ShieldAlert, Lock, Mail, LogOut
} from 'lucide-react';
import { SteelProduct, QuoteItem, Quote } from './types';
import { STEEL_PRODUCTS, TRUCK_OPTIONS, getRecommendedTruck, BITOLA_CONVERSIONS } from './data';
import AcoCalculator from './components/AcoCalculator';
import AcoAssistant from './components/AcoAssistant';
import CalhaTelhaCalculators from './components/CalhaTelhaCalculators';

// Firebase Authentication and Store Imports
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
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

export default function App() {
  const [items, setItems] = useState<QuoteItem[]>([]);
  
  // Sales & customer states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [notes, setNotes] = useState("");
  
  // Direct adjustment states
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [additionPercent, setAdditionPercent] = useState<number>(0);
  const [freightCost, setFreightCost] = useState<number>(0);
  const [validityDays, setValidityDays] = useState<number>(10);

  // Firebase Authentication states
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Saved quotes history state
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);

  // Watch Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync savedQuotes from Realtime Database in Real-time
  useEffect(() => {
    if (!user) {
      setSavedQuotes([]);
      return;
    }

    const quotesRef = ref(db, `quotes/${user.uid}`);

    const unsubscribe = onValue(quotesRef, (snapshot) => {
      const quotes: Quote[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          quotes.push(childSnapshot.val() as Quote);
        });
      }
      // Sort on client side to put newest creations first
      quotes.sort((a, b) => {
        const dateA = a.createdAt || "";
        const dateB = b.createdAt || "";
        return dateB.localeCompare(dateA);
      });
      setSavedQuotes(quotes);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `quotes/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  // Auth execution handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsAuthSubmitting(true);

    if (!authEmail || !authPassword) {
      setAuthError("Preencha todos os campos.");
      setIsAuthSubmitting(false);
      return;
    }

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setAuthError("E-mail ou senha incorretos.");
      } else if (err.code === 'auth/weak-password') {
        setAuthError("A senha precisa ter pelo menos 6 caracteres.");
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError("Este e-mail já está cadastrado.");
      } else if (err.code === 'auth/invalid-email') {
        setAuthError("E-mail inválido.");
      } else {
        setAuthError("Falha na autenticação. Tente novamente.");
      }
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setItems([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerCompany("");
      setNotes("");
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };
  
  // UI Panels / Navigation
  const [activeTab, setActiveTab] = useState<'quote' | 'catalog' | 'bitolas' | 'ai' | 'calheiros' | 'history'>('quote');
  const [searchText, setSearchText] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // Modern UI Modal States
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [quoteCode, setQuoteCode] = useState("");

  // Re-generate a cute code on loading/editing
  useEffect(() => {
    if (!quoteCode) {
      const num = Math.floor(1000 + Math.random() * 9000);
      const year = new Date().getFullYear();
      setQuoteCode(`ORC-${year}-${num}`);
    }
  }, [quoteCode]);

  // Aggregate Calculations
  const totalWeightKg = items.reduce((sum, item) => sum + item.calculatedWeightKg, 0);
  const subtotalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  const discountAmount = subtotalPrice * (discountPercent / 100);
  const additionAmount = subtotalPrice * (additionPercent / 100);
  const totalPriceBrl = Math.max(0, subtotalPrice - discountAmount + additionAmount + freightCost);

  const recommendedTruck = getRecommendedTruck(totalWeightKg);

  // Add Item callback from Calculator component
  const handleAddItem = (newItem: Omit<QuoteItem, "id">) => {
    const itemWithId: QuoteItem = {
      ...newItem,
      id: Math.random().toString(36).substring(2, 9)
    };
    setItems((prev) => [...prev, itemWithId]);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter(item => item.id !== id));
  };

  // Clear current quote workspace
  const handleClearQuote = () => {
    if (confirm("Tem certeza que deseja zerar a lista de materiais do orçamento atual?")) {
      setItems([]);
      setDiscountPercent(0);
      setAdditionPercent(0);
      setFreightCost(0);
      setQuoteCode("");
    }
  };

  // Start an entirely new quote from scratch
  const handleNewQuoteInit = (quiet = false) => {
    if (!quiet && items.length > 0 && !confirm("Deseja mesmo iniciar um NOVO orçamento do zero? Os itens atuais não salvos serão descartados.")) {
      return;
    }
    setItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerCompany("");
    setNotes("");
    setDiscountPercent(0);
    setAdditionPercent(0);
    setFreightCost(0);
    setValidityDays(10);
    
    // Generate a brand new quote code
    const num = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    setQuoteCode(`ORC-${year}-${num}`);
    
    if (!quiet) {
      alert("Painel limpo! Um novo orçamento em branco foi iniciado.");
    }
  };

  // Save the currently constructed quote to history
  const handleSaveQuoteToHistory = async () => {
    if (items.length === 0) {
      alert("Por favor, adicione pelo menos um material (aço/calha/telha) antes de salvar o orçamento!");
      return;
    }

    if (!user) {
      alert("Você precisa estar autenticado para salvar orçamentos!");
      return;
    }

    const targetQuoteCode = quoteCode || `ORC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuote = {
      id: targetQuoteCode,
      userId: user.uid,
      customerName: customerName || "Consumidor Final",
      customerPhone: customerPhone || "",
      customerCompany: customerCompany || "",
      items,
      discountPercent,
      additionPercent,
      freightCost,
      validityDays,
      date: new Date().toLocaleDateString('pt-BR'),
      totalWeightKg,
      totalPriceBrl,
      notes: notes || "",
      createdAt: new Date().toISOString()
    };

    try {
      const quotesRef = ref(db, `quotes/${user.uid}/${targetQuoteCode}`);
      await set(quotesRef, newQuote);
      alert(`Sucesso em Tempo Real! O orçamento "${targetQuoteCode}" de "${newQuote.customerName}" foi sincronizado com sucesso.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `quotes/${user.uid}/${targetQuoteCode}`);
      alert("Erro ao salvar orçamento no banco de dados.");
    }
  };

  // Load a historic saved quote back into the active workspace
  const handleLoadQuote = (quote: Quote) => {
    setQuoteCode(quote.id);
    setCustomerName(quote.customerName || "");
    setCustomerPhone(quote.customerPhone || "");
    setCustomerCompany(quote.customerCompany || "");
    setNotes(quote.notes || "");
    setItems(quote.items || []);
    setDiscountPercent(quote.discountPercent || 0);
    setAdditionPercent(quote.additionPercent || 0);
    setFreightCost(quote.freightCost || 0);
    setValidityDays(quote.validityDays || 10);
    
    setActiveTab('quote'); // Return active panel to quote view
  };

  // Remove quote from history
  const handleDeleteSavedQuote = async (id: string) => {
    if (confirm(`Excluir o orçamento "${id}" permanentemente do seu histórico?`)) {
      try {
        const quoteRef = ref(db, `quotes/${user.uid}/${id}`);
        await remove(quoteRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `quotes/${user.uid}/${id}`);
        alert("Erro ao excluir o orçamento.");
      }
    }
  };

  // Generate serialized WhatsApp message with proper formatting
  const handleSendWhatsApp = () => {
    if (items.length === 0) {
      alert("Adicione pelo menos um item de aço antes de compartilhar!");
      return;
    }

    const customerInfo = customerName 
      ? `*Cliente:* ${customerName}${customerCompany ? ` (${customerCompany})` : ''}\n` 
      : '';
    const phoneInfo = customerPhone ? `*Contato:* ${customerPhone}\n` : '';
    
    let message = `*📊 PROPOSTA COMERCIAL - ${quoteCode}*\n`;
    message += `*Calha Norte* - Gerdau / CSN\n`;
    message += `-------------------------------------------\n`;
    message += customerInfo;
    message += phoneInfo;
    message += `*Data:* ${new Date().toLocaleDateString('pt-BR')}\n`;
    message += `*Validade:* ${validityDays} dias\n\n`;
    message += `*🛍️ MATERIAIS SOLICITADOS:*\n`;

    items.forEach((item, index) => {
      let sizingLabel = '';
      if (item.product.category === 'sheets') {
        sizingLabel = `${item.thicknessMm?.toFixed(2)}mmx${item.widthM?.toFixed(1)}mx${item.lengthM?.toFixed(1)}m`;
      } else if (item.product.category === 'tubes') {
        sizingLabel = `Chapa ${item.thicknessMm?.toFixed(2)}mm x Barra de ${item.lengthM?.toFixed(1)}m`;
      } else if (item.product.category === 'calhas_telhas') {
        sizingLabel = `Corte/Vão: ${item.lengthM?.toFixed(1)}m x Medida: ${item.widthM?.toFixed(2)}m (Esp: ${item.thicknessMm?.toFixed(2)}mm)`;
      } else if (item.lengthM) {
        sizingLabel = `Barra de ${item.lengthM?.toFixed(1)}m`;
      }

      message += `${index + 1}. *${item.product.name}*\n`;
      message += `   Qtd: ${item.quantity} un | Dimensões: ${sizingLabel || 'Padrão'}\n`;
      message += `   Peso Total: ${item.calculatedWeightKg.toFixed(2)} kg | R$/kg: R$ ${item.unitPrice.toFixed(2)}\n`;
      message += `   Subtotal: R$ ${item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`;
    });

    message += `-------------------------------------------\n`;
    message += `*Subtotal:* R$ ${subtotalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (discountPercent > 0) message += `*Desconto (-${discountPercent}%):* R$ ${discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (additionPercent > 0) message += `*Acréscimo (+${additionPercent}%):* R$ ${additionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (freightCost > 0) message += `*Frete Rodoviário:* R$ ${freightCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    message += `*💰 TOTAL DO ORÇAMENTO:* R$ ${totalPriceBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    message += `*⚖️ PESO TOTAL DA CARGA:* ${totalWeightKg.toFixed(2)} kg\n`;
    message += `*🚚 Logística sugerida:* ${recommendedTruck.name} (Capac. máx ${recommendedTruck.maxWeightKg}kg)\n`;
    
    if (notes) {
      message += `\n*Observações:* ${notes}\n`;
    }
    
    message += `\n_Gerado de forma digital pela Calha Norte._`;

    const encodedText = encodeURIComponent(message);
    const cleanPhone = customerPhone.replace(/\D/g, "");
    
    // Fallback if no specific phone is given
    const url = cleanPhone 
      ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;
      
    window.open(url, '_blank');
  };

  // Print function directly targeting document or window
  const triggerBrowserPrint = () => {
    window.print();
  };

  // Catalog filtered products
  const filteredCatalog = STEEL_PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          p.standards.toLowerCase().includes(searchText.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "all" || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white font-sans">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest animate-pulse">Conectando ao Firebase...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans select-none relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-slate-500/10 blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
          
          {/* Logo Brand Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-orange-500/20">
              <Scale className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">Calha Norte <span className="text-orange-500 text-sm">PRO</span></h1>
            <p className="text-xs text-slate-400 mt-1">Cálculos Avançados de Metalurgia & Lançador de Orçamentos</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-400 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Endereço de E-mail</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-550">
                  <Mail className="w-4 h-4 text-slate-500" />
                </span>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="exemplo@empresa.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/25 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-650 outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Sua Senha</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-550">
                  <Lock className="w-4 h-4 text-slate-500" />
                </span>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/25 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-655 outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-slate-950 font-black text-sm py-3.5 px-4 rounded-2xl shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isAuthSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isRegisterMode ? "Registrar e Entrar" : "Entrar no Sistema"}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-850 text-center">
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setAuthError("");
              }}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer underline decoration-dotted underline-offset-4"
            >
              {isRegisterMode ? "Já tem registro? Faça login aqui" : "Novo usuário? Registrar nova conta agora"}
            </button>
          </div>

        </div>

        {/* Small footer */}
        <p className="text-[10px] text-slate-650 mt-8">Calha Norte PRO • Bancos de Dados em Tempo Real</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* PROFESSIONAL UPPER BAR HEADER */}
      <header className="bg-slate-900 border-b border-slate-950 text-white sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-row items-center justify-between gap-4">
            
            {/* Branding with steel aesthetics */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 sm:h-11 sm:w-11 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/25">
                <Hammer className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-base sm:text-xl font-black uppercase tracking-wider text-white">Calha Norte</h1>
                  <span className="bg-orange-500/15 text-orange-400 border border-orange-500/20 text-[9px] sm:text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase">PRO</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0"></span>
                  <span className="truncate max-w-[140px] sm:max-w-none">Gerdau & CSN</span>
                </p>
              </div>
            </div>

            {/* Quick Summary Widgets */}
            <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
              <div className="hidden sm:flex flex-col text-right bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800/40">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Operador</span>
                <span className="text-[11px] font-bold text-slate-300 max-w-[130px] truncate">{user.email}</span>
              </div>

              <div className="hidden lg:flex flex-col text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Carga do Orçamento Ativo</span>
                <span className="text-sm font-black text-white flex items-center justify-end space-x-1.5 mt-0.5">
                  <Scale className="w-4 h-4 text-orange-400" />
                  <span>{totalWeightKg.toFixed(2)} kg</span>
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Valor Estimado</span>
                <span className="text-xs sm:text-sm font-black text-orange-400 flex items-center justify-end space-x-1 mt-0.5 font-mono">
                  R$ {totalPriceBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              {/* Desktop view primary sharing */}
              <button
                id="btn-quick-whatsapp"
                onClick={handleSendWhatsApp}
                disabled={items.length === 0}
                className="hidden md:flex bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold px-4 py-2.5 rounded-xl transition items-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Enviar p/ WhatsApp</span>
              </button>

              <button
                onClick={handleSignOut}
                title="Sair do Sistema"
                className="bg-slate-850 hover:bg-red-500/20 hover:text-red-400 text-slate-300 text-xs font-bold p-2.5 rounded-xl border border-slate-800 transition flex items-center justify-center cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Responsive Tab Selector Navigation */}
        <div className="bg-slate-950 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex flex-wrap md:flex-nowrap gap-1.5 md:gap-1 py-3 text-xs sm:text-[13px] font-bold">
              <button
                id="tabnav-quote"
                onClick={() => setActiveTab('quote')}
                className={`px-3 sm:px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center space-x-1.5 sm:space-x-2 ${
                  activeTab === 'quote' 
                    ? 'bg-slate-800 text-white border-b-2 border-orange-500' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calculator className="w-4 h-4 text-orange-400" />
                <span>Painel de Orçamento ({items.length})</span>
              </button>

              <button
                id="tabnav-catalog"
                onClick={() => setActiveTab('catalog')}
                className={`px-3 sm:px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center space-x-1.5 sm:space-x-2 ${
                  activeTab === 'catalog' 
                    ? 'bg-slate-800 text-white border-b-2 border-orange-500' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-orange-450" />
                <span>Catálogo de Produtos</span>
              </button>

              <button
                id="tabnav-bitolas"
                onClick={() => setActiveTab('bitolas')}
                className={`px-3 sm:px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center space-x-1.5 sm:space-x-2 ${
                  activeTab === 'bitolas' 
                    ? 'bg-slate-800 text-white border-b-2 border-orange-500' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-4 h-4 text-blue-400" />
                <span>Tabela de Bitolas</span>
              </button>

              <button
                id="tabnav-calheiros"
                onClick={() => setActiveTab('calheiros')}
                className={`px-3 sm:px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center space-x-1.5 sm:space-x-2 ${
                  activeTab === 'calheiros' 
                    ? 'bg-slate-800 text-white border-b-2 border-orange-500' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>Calha & Telha PRO</span>
              </button>

              <button
                id="tabnav-history"
                onClick={() => setActiveTab('history')}
                className={`px-3 sm:px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center space-x-1.5 sm:space-x-2 ${
                  activeTab === 'history' 
                    ? 'bg-slate-800 text-white border-b-2 border-orange-500' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="flex items-center space-x-1">
                  <span>Consultar Clientes</span>
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full text-[10px] scale-90">
                    {savedQuotes.length}
                  </span>
                </span>
              </button>

              <button
                id="tabnav-ai"
                onClick={() => setActiveTab('ai')}
                className={`px-3 sm:px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center space-x-1.5 sm:space-x-2 ${
                  activeTab === 'ai' 
                    ? 'bg-slate-800 text-white border-b-2 border-orange-500 text-orange-350' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4 text-orange-400 animate-pulse" />
                <span>AssisteAço AI Expert</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE PORTAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:py-0">
        
        {/* TAB 1: ELABORAR ORÇAMENTO COM CALCULADORA */}
        {activeTab === 'quote' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Column A: Calculator (WidthSpan 5/12) */}
            <div className="lg:col-span-5 h-full">
              <AcoCalculator onAddItem={handleAddItem} />
            </div>

            {/* Column B: Active Quote Detail (WidthSpan 7/12) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* WORKSPACE CARD BLOCK */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      <span>Itens Solicitados nesta Cotação</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Identificação: <span className="font-bold text-slate-700">{quoteCode}</span></p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      id="btn-new-quote-init-header"
                      onClick={() => handleNewQuoteInit(false)}
                      className="text-xs font-bold text-orange-600 hover:text-white bg-orange-50 hover:bg-orange-500 border border-orange-200 hover:border-orange-500 px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
                      title="Salvar o orçamento atual primeiro se necessário antes de limpar."
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Fazer Outro</span>
                    </button>

                    {items.length > 0 && (
                      <button
                        id="btn-clear-entire-quote"
                        onClick={handleClearQuote}
                        className="text-xs font-bold text-red-600 hover:text-red-750 bg-red-50 hover:bg-red-100 border border-red-105 px-3 py-1.5 rounded-xl transition"
                      >
                        Limpar Tudo
                      </button>
                    )}
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                      <Calculator className="w-8 h-8" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <h4 className="font-bold text-slate-800 text-sm">Nenhum item adicionado ainda</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Configure a espessura, diâmetro ou comprimentos do aço desejado utilizando a calculadora interativa ao lado e clique em <strong>"Inserir no Orçamento Ativo"</strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 lg:max-h-[460px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs uppercase font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {item.product.category === 'sheets' ? 'Chapa' : 
                               item.product.category === 'tubes' ? 'Tubo' : 
                               item.product.category === 'profiles' ? 'Perfil/Viga' : 
                               item.product.category === 'rebar' ? 'Vergalhão' : 
                               item.product.category === 'calhas_telhas' ? 'Calha/Telha' : 'Tela/Arame'}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">{item.product.standards}</span>
                          </div>
                          
                          <h4 className="font-bold text-slate-850 text-sm leading-tight">{item.product.name}</h4>
                          
                          {/* Dimensions visual metrics */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                            {item.product.category === 'sheets' && (
                              <>
                                <span>Espessura: <strong>{item.thicknessMm?.toFixed(2)} mm</strong></span>
                                <span>Dimensão: <strong>{item.widthM?.toFixed(1)}m x {item.lengthM?.toFixed(1)}m</strong></span>
                              </>
                            )}
                            {item.product.category === 'calhas_telhas' && (
                              <>
                                <span>Esp: <strong>{item.thicknessMm?.toFixed(2)} mm</strong></span>
                                <span>Espec: <strong>{item.lengthM?.toFixed(1)}m x {item.widthM?.toFixed(2)}m</strong></span>
                              </>
                            )}
                            {item.product.category === 'tubes' && (
                              <>
                                <span>Parede: <strong>{item.thicknessMm?.toFixed(2)} mm</strong></span>
                                <span>Barra: <strong>{item.lengthM?.toFixed(1)} m</strong></span>
                                {item.outerDiameterMm && <span>Diâmetro: <strong>{item.outerDiameterMm?.toFixed(1)} mm</strong></span>}
                              </>
                            )}
                            {(item.product.category === 'profiles' || item.product.category === 'rebar') && (
                              <span>Comprimento da Barra: <strong>{item.lengthM?.toFixed(1)} m</strong></span>
                            )}
                            <span>Peso do lote: <strong className="text-slate-900 font-mono">{item.calculatedWeightKg.toFixed(2)} kg</strong></span>
                          </div>
                          
                          <div className="pt-1.5 text-xs">
                            <span className="text-slate-500">Unidades:</span> <strong className="text-slate-800">{item.quantity} un</strong>
                            <span className="text-slate-300 mx-1.5">|</span>
                            <span className="text-slate-500">Negociado:</span> <strong className="text-slate-800">R$ {item.unitPrice.toFixed(2)}/kg</strong>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="text-right shrink-0 flex flex-col items-end space-y-2">
                          <p className="text-sm font-black text-slate-900">
                            R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <button
                            id={`btn-remove-item-${item.id}`}
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition"
                            title="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DATA CUSTOMER & PRICING STATS */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 flex items-center space-x-2">
                  <User className="w-4 h-4 text-orange-500" />
                  <span>Dados do Cliente & Custos Adicionais</span>
                </h3>

                {/* Form client */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Nome do Comprador</label>
                    <input
                      id="customer-name-field"
                      type="text"
                      placeholder="Ex: Carlos Pedreira"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">WhatsApp / Celular</label>
                    <input
                      id="customer-phone-field"
                      type="text"
                      placeholder="Ex: 11988887777"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Parceiro / Empresa</label>
                    <input
                      id="customer-company-field"
                      type="text"
                      placeholder="Ex: Serralheria Confiança"
                      value={customerCompany}
                      onChange={(e) => setCustomerCompany(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                {/* Form parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                      <Percent className="w-3.5 h-3.5 text-orange-400" />
                      <span>Desconto (%)</span>
                    </label>
                    <input
                      id="discount-pct-field"
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent || ''}
                      onChange={(e) => setDiscountPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                      <Plus className="w-3.5 h-3.5 text-slate-400" />
                      <span>Acréscimo (%)</span>
                    </label>
                    <input
                      id="addition-pct-field"
                      type="number"
                      min="0"
                      max="100"
                      value={additionPercent || ''}
                      onChange={(e) => setAdditionPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Frete CIF/FOB (R$)</label>
                    <input
                      id="freight-cost-field"
                      type="number"
                      min="0"
                      value={freightCost || ''}
                      onChange={(e) => setFreightCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Validade (dias)</label>
                    <select
                      id="validity-days-field"
                      value={validityDays}
                      onChange={(e) => setValidityDays(parseInt(e.target.value) || 10)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-850 font-semibold focus:outline-none"
                    >
                      <option value="5">5 dias úteis</option>
                      <option value="10">10 dias úteis</option>
                      <option value="15">15 dias úteis</option>
                      <option value="30">30 dias corridos</option>
                    </select>
                  </div>
                </div>

                {/* Additional Note */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Observações Legais no PDF</label>
                  <textarea
                    id="quote-notes"
                    rows={2}
                    placeholder="Ex: Retirada imediata FOB ou Prazo de entrega de 5 dias úteis de acordo com a produção Gerdau."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-700 focus:outline-none focus:border-orange-500 transition"
                  ></textarea>
                </div>
              </div>

              {/* LOGISTICS SUGGESTION & OVERALL REVENUE ACCRUAL */}
              {items.length > 0 && (
                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-950 space-y-6">
                  
                  {/* Logistics Truck Advisor banner */}
                  <div className={`p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start space-x-4`}>
                    <div className="p-3 bg-slate-900 rounded-xl text-orange-400">
                      <Truck className="w-6 h-6 stroke-1.5" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">Logística de Transporte Calculada</span>
                        <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">Resolução ABNT</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-white">{recommendedTruck.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{recommendedTruck.description}</p>
                      
                      {/* Weight progress bar */}
                      <div className="pt-2">
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>Carga Atual: <strong>{totalWeightKg.toFixed(1)} kg</strong></span>
                          <span>Capacidade Máxima: <strong>{recommendedTruck.maxWeightKg} kg</strong></span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="bg-orange-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (totalWeightKg / recommendedTruck.maxWeightKg) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial final aggregation */}
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-2 text-center sm:divide-x sm:divide-slate-800">
                      <div className="px-1">
                        <p className="text-[10px] uppercase text-slate-400 font-semibold">Peso Total</p>
                        <p className="text-base sm:text-lg font-bold text-white mt-1 font-mono">{totalWeightKg.toFixed(1)} <span className="text-[10px] sm:text-xs font-normal">kg</span></p>
                      </div>
                      <div className="px-1">
                        <p className="text-[10px] uppercase text-slate-400 font-semibold font-sans">Soma</p>
                        <p className="text-sm sm:text-base font-bold text-slate-300 mt-1 font-mono">R$ {subtotalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="px-1">
                        <p className="text-[10px] uppercase text-slate-400 font-semibold">Descontos</p>
                        <p className="text-sm sm:text-base font-bold text-emerald-400 mt-1 font-mono">- R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="px-1">
                        <p className="text-[10px] sm:text-[11px] uppercase text-orange-400 font-black tracking-wide">Valor Final</p>
                        <p className="text-lg sm:text-xl font-black text-white mt-1 font-mono">R$ {totalPriceBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Save to history action */}
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-350">Gravar Cotação Ativa</p>
                        <p className="text-[10px] text-slate-400">Guarde no Histórico local para consultas posteriores.</p>
                      </div>
                    </div>
                    <button
                      id="btn-save-to-history-main"
                      onClick={handleSaveQuoteToHistory}
                      className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Salvar em Histórico</span>
                    </button>
                  </div>

                  {/* Operational sharing actions row */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      id="btn-generate-pdf-preview"
                      onClick={() => setShowPreviewModal(true)}
                      className="flex-1 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm py-3.5 px-6 rounded-2xl transition flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <Printer className="w-4.5 h-4.5" />
                      <span>Gerar PDF / Imprimir Orçamento</span>
                    </button>

                    <button
                      id="btn-whatsapp-quote-bottom"
                      onClick={handleSendWhatsApp}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/10"
                    >
                      <Send className="w-4.5 h-4.5 stroke-[2.5]" />
                      <span>Encaminhar via WhatsApp</span>
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 2: PRODUTOS CATALOG REFERENCE */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Catálogo Referencial Brasileiro de Materiais Metálicos</h3>
                  <p className="text-xs text-slate-500 mt-1">Preços de mercado referenciados em Reais (R$) por Kg com especificações da liga nas normas ABNT / ASTM.</p>
                </div>
                
                {/* Search Bar Input */}
                <div className="relative w-full md:w-80">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    id="catalog-search-input"
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Buscar liga, norma ou material..."
                    className="w-full text-slate-800 bg-slate-50 border border-slate-220 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Category Quick Filter */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <button
                  onClick={() => setSelectedCategoryFilter("all")}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition ${
                    selectedCategoryFilter === "all" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Todos os Materiais
                </button>
                <button
                  onClick={() => setSelectedCategoryFilter("sheets")}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition ${
                    selectedCategoryFilter === "sheets" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Chapas & Bobinas
                </button>
                <button
                  onClick={() => setSelectedCategoryFilter("tubes")}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition ${
                    selectedCategoryFilter === "tubes" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Tubos e Metalon
                </button>
                <button
                  onClick={() => setSelectedCategoryFilter("profiles")}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition ${
                    selectedCategoryFilter === "profiles" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Vigas & Perfis Estruturais
                </button>
                <button
                  onClick={() => setSelectedCategoryFilter("rebar")}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition ${
                    selectedCategoryFilter === "rebar" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Vergalhões Gerdau CA-50/60
                </button>
              </div>
            </div>

            {/* Grid display products */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalog.map((prod) => (
                <div key={prod.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-750 px-2 py-0.5 rounded border border-orange-100">
                        {prod.category}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{prod.standards}</span>
                    </div>

                    <h4 className="font-black text-slate-900 leading-snug">{prod.name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{prod.description}</p>

                    {prod.thicknesses && prod.thicknesses.length > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                        <span className="text-[9px] text-slate-400 block font-black uppercase tracking-wider mb-1">Espessuras Disponíveis</span>
                        <div className="flex flex-wrap gap-1">
                          {prod.thicknesses.map(t => (
                            <span key={t} className="text-[10px] font-semibold bg-white border text-slate-700 px-1.5 py-0.5 rounded">
                              {t.toFixed(2)}mm
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider">Referência Kg</p>
                      <p className="text-base font-black text-slate-800">
                        R$ {prod.basePricePerKg.toFixed(2)} <span className="text-xs font-semibold text-slate-500">/ kg</span>
                      </p>
                    </div>

                    <button
                      id={`btn-select-catalog-${prod.id}`}
                      onClick={() => {
                        // Quick switch to quote mode and set this product
                        setActiveTab('quote');
                        // Small timeout to allow render and update the category
                        setSelectedCategoryFilter(prod.category);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                    >
                      Configurar Peça
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BITOLA CONVERSIONS AND SPECIFICATION GUIDE */}
        {activeTab === 'bitolas' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Conversor Comercial Inteligente de Bitolas</h3>
                <p className="text-xs text-slate-500 mt-1">Converte polegadas comerciais para o padrão brasileiro de milímetros, detalhando o uso habitual recomendado em metalúrgicas brasileiras e serralherias.</p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#1e293b] text-white">
                    <tr>
                      <th className="p-3.5 font-bold">Bitola Comercial (Pol)</th>
                      <th className="p-3.5 font-bold">Equivalente em Milímetros (mm)</th>
                      <th className="p-3.5 font-bold">Designação Habitual Brasileira</th>
                      <th className="p-3.5 font-bold">Densidade de Vol. Média</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {BITOLA_CONVERSIONS.map((bit, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-bold text-slate-900 font-mono text-sm">{bit.gaugeInches}</td>
                        <td className="p-3.5 font-semibold text-slate-700 font-mono text-sm">{bit.gaugeMm.toFixed(2)} mm</td>
                        <td className="p-3.5 text-slate-705 font-medium">{bit.designator}</td>
                        <td className="p-3.5 text-slate-400 font-mono">7850 kg/m³</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-amber-50/55 border border-amber-250 rounded-2xl p-5 flex items-start space-x-3.5">
              <Bot className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1.5 leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-amber-950">Dica Prática do Vendedor:</p>
                <p>
                  No Brasil, o peso de chapas xadrez antiderrapantes costuma ter um acréscimo de <strong>3kg a 4.5kg por metro quadrado</strong> sobre a chapa lisa de mesma espessura, devido à relevagem do design antiderrapante estampado (padrão CSN).
                </p>
                <p>
                  Para calcular tubos e perfis sob medida com o nosso assistente AI integrado, mude para a guia <strong>AssisteAço AI Expert</strong> para estimar perfis sob medida em tempo recorde!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3.5: CALHA & TELHA PRO SUITE */}
        {activeTab === 'calheiros' && (
          <div className="max-w-6xl mx-auto">
            <CalhaTelhaCalculators onAddItem={handleAddItem} />
          </div>
        )}

        {/* TAB 3.7: HISTÓRICO & CARTEIRA DE CLIENTES (CONSULTAS) */}
        {activeTab === 'history' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                    <span>Histórico de Orçamentos & Clientes</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                    <span>Consulte cotações salvas, envie segundas vias por WhatsApp, abra visualizações em PDF ou recarregue dados de clientes para novos ajustes.</span>
                  </p>
                </div>
                
                <button
                  id="btn-history-new-init"
                  onClick={() => {
                    handleNewQuoteInit(true);
                    setActiveTab('quote');
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Orçamento</span>
                </button>
              </div>

              {/* Aggregated KPI Metrics of the Saved portfolio */}
              {savedQuotes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Cotações Gravadas</span>
                    <span className="text-xl font-black text-slate-800 mt-1 block font-mono">{savedQuotes.length} <span className="text-xs font-semibold text-slate-500">cadastros</span></span>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Peso Total Negociado</span>
                    <span className="text-xl font-black text-orange-650 mt-1 block font-mono">
                      {savedQuotes.reduce((acc, q) => acc + q.totalWeightKg, 0).toFixed(1)} <span className="text-xs font-semibold text-slate-500">kg</span>
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Volume Financeiro Total</span>
                    <span className="text-xl font-black text-emerald-650 mt-1 block font-mono">
                      R$ {savedQuotes.reduce((acc, q) => acc + q.totalPriceBrl, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* List or Empty State */}
            {savedQuotes.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm">O histórico de orçamentos está vazio</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Você ainda não gravou nenhum orçamento. Vá para a primeira guia, monte a relação de peças do seu cliente e clique no botão <strong>"Salvar em Histórico"</strong> na lateral.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('quote')}
                      className="bg-slate-900 hover:bg-slate-855 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                    >
                      Ir para Calculadora de Aço
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedQuotes.map((quote) => (
                  <div key={quote.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    
                    {/* Card Top */}
                    <div className="p-5 space-y-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="bg-slate-100 border text-slate-700 font-mono font-bold text-[11px] px-2 py-0.5 rounded-lg block w-max">
                            {quote.id}
                          </span>
                          <h4 className="text-base font-black text-slate-850 leading-tight pt-1">
                            {quote.customerName}
                          </h4>
                          {quote.customerCompany && (
                            <span className="bg-orange-50 text-orange-650 border border-orange-100 text-[10px] font-bold px-1.5 py-0.5 rounded inline-block">
                              {quote.customerCompany}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-semibold">{quote.date}</span>
                      </div>

                      {/* Items Summaries */}
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-150 text-xs text-slate-600 space-y-1.5">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Produtos incluídos ({quote.items.length})</p>
                        <div className="max-h-24 overflow-y-auto space-y-1 divide-y divide-slate-100 pr-1">
                          {quote.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] py-1 gap-4">
                              <span className="truncate font-semibold text-slate-700">{it.quantity}x {it.product.name}</span>
                              <span className="font-mono text-slate-500 shrink-0">{it.calculatedWeightKg.toFixed(1)} kg</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financial aggregation metrics */}
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2.5 bg-slate-50/50 rounded-xl border">
                          <span className="text-[10px] text-slate-400 font-semibold block">Peso Total</span>
                          <span className="font-bold text-slate-800 font-mono">{quote.totalWeightKg.toFixed(2)} kg</span>
                        </div>
                        <div className="p-2.5 bg-slate-50/50 rounded-xl border">
                          <span className="text-[10px] text-slate-400 font-semibold block">Preço Final</span>
                          <span className="font-bold text-slate-900 font-mono">R$ {quote.totalPriceBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Row */}
                    <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                      
                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteSavedQuote(quote.id)}
                        className="text-red-500 hover:text-red-700 font-bold hover:bg-red-50 p-2 rounded-xl transition"
                        title="Excluir do histórico"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center space-x-2">
                        {/* Send WhatsApp */}
                        <button
                          onClick={() => {
                            // Load payload momentarily
                            setQuoteCode(quote.id);
                            setCustomerName(quote.customerName);
                            setCustomerPhone(quote.customerPhone);
                            setCustomerCompany(quote.customerCompany || "");
                            setNotes(quote.notes || "");
                            setItems(quote.items);
                            setDiscountPercent(quote.discountPercent);
                            setAdditionPercent(quote.additionPercent);
                            setFreightCost(quote.freightCost);
                            setValidityDays(quote.validityDays);
                            
                            setTimeout(() => {
                              handleSendWhatsApp();
                            }, 100);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition flex items-center space-x-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>

                        {/* PDF View */}
                        <button
                          onClick={() => {
                            // Load payload momentarily
                            setQuoteCode(quote.id);
                            setCustomerName(quote.customerName);
                            setCustomerPhone(quote.customerPhone);
                            setCustomerCompany(quote.customerCompany || "");
                            setNotes(quote.notes || "");
                            setItems(quote.items);
                            setDiscountPercent(quote.discountPercent);
                            setAdditionPercent(quote.additionPercent);
                            setFreightCost(quote.freightCost);
                            setValidityDays(quote.validityDays);
                            
                            setShowPreviewModal(true);
                          }}
                          className="bg-white hover:bg-slate-100 text-slate-700 border font-bold py-1.5 px-3 rounded-lg text-xs transition flex items-center space-x-1"
                        >
                          <Printer className="w-3 h-3 text-slate-500" />
                          <span>Ver PDF</span>
                        </button>

                        {/* Reload back for edit / duplicate */}
                        <button
                          onClick={() => {
                            handleLoadQuote(quote);
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black py-1.5 px-3 rounded-lg text-xs transition flex items-center space-x-1"
                          title="Alterna para o Painel ativo carregando este orçamento para edição ou emissão de outro"
                        >
                          <Calculator className="w-3 h-3 stroke-[2.5]" />
                          <span>Editar</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GEMINI ASSISTANT */}
        {activeTab === 'ai' && (
          <div className="max-w-4xl mx-auto h-[600px]">
            <AcoAssistant />
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-450 text-xs py-8 border-t border-slate-950 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-semibold text-slate-300">Calha Norte • © {new Date().getFullYear()} Soluções Metalúrgicas Avançadas</p>
          <p>Compatível com tabelas oficiais de pesos teóricos Gerdau, CSN, Tubos de Aço estrutural, Ligas ABNT 1010/1020 e ASTM A36.</p>
        </div>
      </footer>

      {/* MODAL PRINT PREVIEW SIMULATED PDF OR LETTERHEAD */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal header */}
            <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden font-sans">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <span className="font-extrabold text-xs sm:text-sm tracking-wide">Orçamento - {quoteCode}</span>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
                <button
                  onClick={triggerBrowserPrint}
                  className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl transition flex items-center justify-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir PDF</span>
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-xs px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Print Area - Beautiful Letterhead style doc */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-12 font-sans" id="quote-print-area">
              
              {/* BRAND HEADER LINE */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-900 pb-6 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-9 w-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-extrabold font-mono text-sm">
                      CN
                    </div>
                    <span className="text-lg font-black uppercase tracking-wider text-slate-900">Calha Norte</span>
                  </div>
                  <p className="text-xs text-slate-500">Distribuição Oficial Gerdau & Chapas CSN</p>
                </div>
                
                <div className="text-left sm:text-right text-xs text-slate-650 space-y-0.5">
                  <p className="font-bold text-slate-900">PROPOSTA COMERCIAL: {quoteCode}</p>
                  <p>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                  <p>Validade: {validityDays} dias</p>
                </div>
              </div>

              {/* CLIENT INFO BLOCK */}
              <div className="my-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-black text-slate-450 uppercase tracking-wider mb-1">Destinatário / Comprador</p>
                  <p className="text-sm font-bold text-slate-800">{customerName || "Consumidor Final"}</p>
                  {customerCompany && <p className="text-slate-600">{customerCompany}</p>}
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-black text-slate-450 uppercase tracking-wider mb-1">Canal de Atendimento / Contato</p>
                  <p className="text-sm font-bold text-slate-800">{customerPhone || "(Não informado)"}</p>
                </div>
              </div>

              {/* PRODUCTS LIST TABLE */}
              <div className="my-6 border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[760px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="p-3 font-bold text-center w-12">Item</th>
                      <th className="p-3 font-bold">Especificação do Material / Dimensões</th>
                      <th className="p-3 font-bold text-center">Referência Norma</th>
                      <th className="p-3 font-bold text-center w-16">Qtd</th>
                      <th className="p-3 font-bold text-right w-24">Peso Total</th>
                      <th className="p-3 font-bold text-right w-24">Preço/Kg</th>
                      <th className="p-3 font-bold text-right w-28">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {items.map((item, idx) => {
                      let sizingLabel = '';
                      if (item.product.category === 'sheets') {
                        sizingLabel = `Chapa ${item.thicknessMm?.toFixed(2)}mm x ${item.widthM?.toFixed(1)}m x ${item.lengthM?.toFixed(1)}m`;
                      } else if (item.product.category === 'tubes') {
                        sizingLabel = `Tubo Parede ${item.thicknessMm?.toFixed(2)}mm x Barra ${item.lengthM?.toFixed(1)}m`;
                      } else if (item.product.category === 'calhas_telhas') {
                        sizingLabel = `Corte/Vão: ${item.lengthM?.toFixed(1)}m x Medida/Dev: ${item.widthM?.toFixed(2)}m (Esp: ${item.thicknessMm?.toFixed(2)}mm)`;
                      } else if (item.lengthM) {
                        sizingLabel = `Barra de ${item.lengthM?.toFixed(1)}m`;
                      }

                      return (
                        <tr key={item.id} className="text-slate-800 hover:bg-slate-50/40">
                          <td className="p-3 font-semibold font-mono text-center">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">
                            <div>{item.product.name}</div>
                            {sizingLabel && (
                              <div className="text-[10px] text-slate-400 font-normal mt-0.5">Dimensões: {sizingLabel}</div>
                            )}
                          </td>
                          <td className="p-3 text-center text-slate-500">{item.product.standards}</td>
                          <td className="p-3 text-center font-bold">{item.quantity}</td>
                          <td className="p-3 text-right font-mono font-medium">{item.calculatedWeightKg.toFixed(2)} kg</td>
                          <td className="p-3 text-right font-mono">R$ {item.unitPrice.toFixed(2)}</td>
                          <td className="p-3 text-right font-bold font-mono text-slate-900">
                            R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* FINANCIAL & LOGISTICAL REPORT SUMS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start mt-8 border-t border-slate-200 pt-6">
                
                {/* Delivery recommendations */}
                <div className="space-y-3 text-xs text-slate-650">
                  <p className="font-black text-slate-450 uppercase tracking-wider">Laudo Geral de Pesagem & Transporte</p>
                  <div>
                    <span className="font-semibold text-slate-800 block">Sugerido para Envio:</span>
                    <span className="font-bold text-orange-650">{recommendedTruck.name}</span>
                  </div>
                  <p className="leading-relaxed">
                    Carga aferida em <strong className="text-slate-900 font-mono">{totalWeightKg.toFixed(2)} kg</strong>. 
                    Recomenda-se amarração segura conforme resoluções de trânsito rodoviário nacional do CONTRAN para materiais em ferro e aço.
                  </p>
                  {notes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-[11px] text-slate-700 italic">
                      <strong>Observações:</strong> {notes}
                    </div>
                  )}
                </div>

                {/* Totals table */}
                <div className="space-y-2 text-xs text-slate-700 max-w-sm ml-auto w-full">
                  <div className="flex justify-between py-1 border-b">
                    <span>Soma dos Materiais:</span>
                    <span className="font-bold font-mono">R$ {subtotalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between py-1 border-b text-emerald-600">
                      <span>Desconto ({discountPercent}%):</span>
                      <span className="font-bold font-mono">- R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {additionPercent > 0 && (
                    <div className="flex justify-between py-1 border-b">
                      <span>Taxas / Adicionais ({additionPercent}%):</span>
                      <span className="font-bold font-mono">+ R$ {additionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {freightCost > 0 && (
                    <div className="flex justify-between py-1 border-b">
                      <span>Custo do Frete:</span>
                      <span className="font-bold font-mono">R$ {freightCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 text-sm text-slate-900 font-black border-t-2 border-slate-900">
                    <span>PREÇO FINAL OFERECIDO:</span>
                    <span className="font-mono text-base">R$ {totalPriceBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

              </div>

              {/* PRINT ASSIGNATURE BLOCK */}
              <div className="mt-16 pt-12 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-450 gap-8">
                <div className="text-center w-52">
                  <div className="border-b border-slate-350 h-5 mb-1.5"></div>
                  <span>{customerName || "Assinatura do Cliente"}</span>
                </div>
                <div className="text-center w-52">
                  <div className="border-b border-slate-350 h-5 mb-1.5"></div>
                  <span>Vendedor Autorizado</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
