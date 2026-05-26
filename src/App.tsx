"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, History, Scissors, Ruler, Building2, Bot, 
  Building, Sparkles, Mail, Lock, LogOut, Loader2, CheckCircle2,
  Bell, Moon, Sun, ChevronRight, Plus, ArrowLeft, Wrench, Users,
  Phone, MapPin, Camera, Check, Menu, Trash2, Edit3, Printer,
  Clock, Info, X, ChevronDown, Calendar, DollarSign, AlertCircle, Search,
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
  onValue,
  update
} from 'firebase/database';

// Modular CalhaZap Components
import CalhaZapHistory from './components/CalhaZapHistory';
import CalhaZapCorte from './components/CalhaZapCorte';
import CalhaZapMetro from './components/CalhaZapMetro';
import CalhaZapPlanos from './components/CalhaZapPlanos';
import AcoAssistant from './components/AcoAssistant';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'cliente'>('cliente');
  const [hasRedirected, setHasRedirected] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Real Camera capture & file upload ref and handlers
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoInfo, setPhotoInfo] = useState<{ name: string; size: string } | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeInKB = (file.size / 1024).toFixed(0);
      setPhotoInfo({
        name: file.name,
        size: `${sizeInKB} KB`
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setWPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCameraInput = () => {
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };

  // Active workspace settings (mapped to iPhone Viewport Tabs)
  // 'home' = Dashboard, 'orc' = 5-Step Wizard, 'hist' = Saved List, 'calc' = 2x2 calculators grid, 'emp' = settings/plans/AI, 'admin' = Admin Panel
  const [viewportTab, setViewportTab] = useState<'home' | 'orc' | 'hist' | 'calc' | 'emp' | 'notif' | 'admin'>('home');

  // Multi-Company Admin States
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [allQuotes, setAllQuotes] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [selectedAdminCompanyFilter, setSelectedAdminCompanyFilter] = useState<string>('all');
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');
  const [adminPermissionError, setAdminPermissionError] = useState<boolean>(false);

  // Selected Active Calculator
  const [selectedCalc, setSelectedCalc] = useState<null | 'metragem' | 'metro-kg' | 'corte' | 'incline'>(null);

  // Dark/Light Mode state
  const [darkMode, setDarkMode] = useState(false);

  // Company Details persistent states
  const [companyName, setCompanyName] = useState('Minha Empresa de Calhas');
  const [ownerName, setOwnerName] = useState('Responsável');
  const [companyCNPJ, setCompanyCNPJ] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyCityState, setCompanyCityState] = useState('');
  const [companyLogo, setCompanyLogo] = useState(''); // Base64 url

  // Saved quotes from database
  const [quotes, setQuotes] = useState<any[]>([]);

  // Premium Activation State
  const [czAtivo, setCzAtivo] = useState(false);

  // Lock Overlay Dialog State
  const [showLock, setShowLock] = useState(false);
  const [lockTitle, setLockTitle] = useState('');
  const [lockSub, setLockSub] = useState('');

  // WhatsApp PDF Helper States
  const [showWhatsAppPdfHelper, setShowWhatsAppPdfHelper] = useState(false);
  const [selectedQuoteForPdf, setSelectedQuoteForPdf] = useState<any | null>(null);

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

  // Step 4 condutores / chaminé / coifa / PU-40 / accessories
  const [wCondQty, setWCondQty] = useState(2);
  const [wCondType, setWCondType] = useState('Retangular Galvalume 5x10');
  const [wCondLen, setWCondLen] = useState(3.0);
  const [wCondPrice, setWCondPrice] = useState(21.00);

  const [wChamQty, setWChamQty] = useState(1);
  const [wChamType, setWChamType] = useState('Chaminé de Lareira Galvanizada');
  const [wChamDiam, setWChamDiam] = useState(150);
  const [wChamPrice, setWChamPrice] = useState(115.00);
  const [wChamMaterial, setWChamMaterial] = useState('Galvanizado');

  // Coifas states
  const [wCoifaQty, setWCoifaQty] = useState(0);
  const [wCoifaType, setWCoifaType] = useState('Coifa de Churrasqueira');
  const [wCoifaSize, setWCoifaSize] = useState('80 cm');
  const [wCoifaPrice, setWCoifaPrice] = useState(480.00);
  const [wCoifaMaterial, setWCoifaMaterial] = useState('Galvanizado');

  const [puQty, setPuQty] = useState(2);
  const [puPrice, setPuPrice] = useState(22.00);

  // Step 5 labor / additional services
  const [laborPrice, setLaborPrice] = useState(350.00);
  const [discountPercent, setDiscountPercent] = useState(5);
  const [wNotes, setWNotes] = useState('Materiais para fixação inclusos.');

  // Live Calculations for Wizard
  const calcWizardTotal = () => {
    let sub = 0;
    wTileItems.forEach(it => sub += it.total);
    wGutterItems.forEach(it => sub += it.total);
    wRufoItems.forEach(it => sub += it.total);
    sub += wCondQty * wCondPrice * wCondLen;
    sub += wChamQty * wChamPrice;
    sub += wCoifaQty * wCoifaPrice;
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
  const [notifs, setNotifs] = useState<{ id: string; type: string; title: string; desc: string; time: string; read: boolean; }[]>([]);

  const unreadCount = notifs.filter(n => !n.read).length;
  const isAdmin = userRole === 'admin';

  const markAllNotifsRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotif = (id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  // -------------------------------------------------------------
  // CLIENTS & SALES CRM DASHBOARD SUB-SYSTEM STATES
  // -------------------------------------------------------------
  const [clients, setClients] = useState<any[]>([]);
  const [homeSubTab, setHomeSubTab] = useState<'geral' | 'dashboard' | 'clientes'>('geral');
  
  // Client Form inputs
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cAddress, setCAddress] = useState("");
  const [cEditingId, setCEditingId] = useState<string | null>(null);

  // Wizard autocomplete support
  const [wizardClientSearch, setWizardClientSearch] = useState("");
  const [showWizardClientDropdown, setShowWizardClientDropdown] = useState(false);

  // Client Data Actions
  const handleSaveClient = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    if (!cName.trim()) {
      alert("Por favor, preencha o nome do cliente.");
      return;
    }

    const payload = {
      id: cEditingId || "CLI-" + Math.floor(10000 + Math.random() * 90000).toString(),
      name: cName,
      phone: cPhone,
      address: cAddress,
      createdAt: new Date().toISOString()
    };

    try {
      const clientRef = ref(db, `quotes/${user.uid}/_clients/${payload.id}`);
      await set(clientRef, payload);
      alert(cEditingId ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso! 🎉");
      
      // Reset form
      setCName("");
      setCPhone("");
      setCAddress("");
      setCEditingId(null);
    } catch (err: any) {
      console.error("Erro ao salvar cliente:", err);
      alert(`Falha ao salvar cliente na nuvem: ${err?.message || err}`);
    }
  };

  const handleEditClientStart = (cli: any) => {
    setCName(cli.name || "");
    setCPhone(cli.phone || "");
    setCAddress(cli.address || "");
    setCEditingId(cli.id);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!user) return;
    if (!confirm("Confirmar a exclusão permanente deste cliente? Isso não apagará os orçamentos existentes do mesmo.")) return;
    try {
      const clientRef = ref(db, `quotes/${user.uid}/_clients/${clientId}`);
      await remove(clientRef);
      alert("Cliente excluído.");
    } catch (err: any) {
      console.error("Erro ao deletar cliente:", err);
      alert(`Falha ao excluir cliente: ${err?.message || err}`);
    }
  };

  // -------------------------------------------------------------
  // SYNC AUTH, COMPANY, QUOTES AND CLIENTS FROM FIREBASE DATABASE
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

  // Dynamic User Profile & Role Synchronization
  useEffect(() => {
    if (!user) {
      setUserRole('cliente');
      setHasRedirected(false);
      return;
    }

    const companyRoleRef = ref(db, `companies/${user.uid}/role`);
    const unsubUserRole = onValue(companyRoleRef, (snapshot) => {
      if (snapshot.exists()) {
        const role = snapshot.val() || 'cliente';
        setUserRole(role);
      } else {
        const defaultRole = (user.email === 'thiago.viaembratelgja@gmail.com' || user.email?.toLowerCase().includes('admin')) ? 'admin' : 'cliente';
        set(companyRoleRef, defaultRole).then(() => {
          setUserRole(defaultRole);
        }).catch((err) => {
          console.error("Erro ao gravar role do usuário:", err);
        });
        
        // Also save user metadata inside companies table so they can recognize who the uid belongs to in their console
        const companyEmailRef = ref(db, `companies/${user.uid}/email`);
        set(companyEmailRef, user.email || '').catch((err) => {
          console.error("Erro ao gravar email do usuário:", err);
        });
      }
    }, (err) => {
      console.error("Erro de permissão no Firebase Realtime Database. Por favor atualize as regras de segurança.", err);
    });

    return () => {
      unsubUserRole();
    };
  }, [user]);

  // First-time Logon Redirection based on dynamically loaded DB Role
  useEffect(() => {
    if (user && userRole && !hasRedirected) {
      if (userRole === 'admin') {
        setViewportTab('admin');
      } else {
        setViewportTab('home');
      }
      setHasRedirected(true);
    }
  }, [user, userRole, hasRedirected]);

  // Sync quotes, clients, company, and multi-company admin lists
  useEffect(() => {
    if (!user) {
      setQuotes([]);
      setClients([]);
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
          if (child.key !== '_clients') {
            arr.push(child.val());
          }
        });
      }
      setQuotes(arr.reverse()); // Put newest first
    });

    // Sync Clients
    const clientsRef = ref(db, `quotes/${user.uid}/_clients`);
    const unsubClients = onValue(clientsRef, (snapshot) => {
      const arr: any[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          arr.push(child.val());
        });
      }
      setClients(arr);
    });

    // Multi-Company Real-time Admin Sync Flow
    let unsubAllCompanies = () => {};
    let unsubAllQuotes = () => {};

    if (userRole === 'admin') {
      setAdminPermissionError(false); // Reset on mount / role change
      const companiesRef = ref(db, 'companies');
      unsubAllCompanies = onValue(companiesRef, (snapshot) => {
        const arr: any[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            arr.push({
              uid: child.key,
              ...child.val()
            });
          });
        }
        setAllCompanies(arr);
      }, (err) => {
        console.error("Erro ao ler empresas (Admin):", err);
        setAdminPermissionError(true);
      });

      const rootQuotesRef = ref(db, 'quotes');
      unsubAllQuotes = onValue(rootQuotesRef, (snapshot) => {
        const quotesArr: any[] = [];
        const clientsArr: any[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((userNode) => {
            const userUid = userNode.key;
            userNode.forEach((childNode) => {
              if (childNode.key === '_clients') {
                childNode.forEach((clientNode) => {
                  clientsArr.push({
                    id: clientNode.key,
                    ...clientNode.val(),
                    companyUid: userUid
                  });
                });
              } else {
                quotesArr.push({
                  ...childNode.val(),
                  companyUid: userUid
                });
              }
            });
          });
        }
        setAllQuotes(quotesArr.reverse());
        setAllClients(clientsArr);
      }, (err) => {
        console.error("Erro ao ler orçamentos (Admin):", err);
        setAdminPermissionError(true);
      });
    }

    try {
      const ok = localStorage.getItem('cz_ativo') === '1';
      setCzAtivo(ok);
    } catch (_) {}

    return () => {
      unsubCompany();
      unsubQuotes();
      unsubClients();
      unsubAllCompanies();
      unsubAllQuotes();
    };
  }, [user, userRole]);

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
      setHasRedirected(false);
      setUserRole('cliente');
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

  // -------------------------------------------------------------
  // CRM SALES INTELLIGENCE & PREDICTIVE ANALYTICS ENGINE
  // -------------------------------------------------------------
  const getClientSalesIntelligence = () => {
    // Group records by unique name/lowercase key
    const clientMap: { [key: string]: { name: string; phone: string; address: string; quotes: any[] } } = {};

    // Seed from registered clients list
    clients.forEach(c => {
      const key = (c.name || '').trim().toLowerCase();
      if (key) {
        clientMap[key] = {
          name: c.name,
          phone: c.phone || '',
          address: c.address || '',
          quotes: []
        };
      }
    });

    // Add quotes historic logs
    quotes.forEach(q => {
      const key = (q.customerName || '').trim().toLowerCase();
      if (key) {
        if (!clientMap[key]) {
          clientMap[key] = {
            name: q.customerName,
            phone: q.customerPhone || '',
            address: q.customerAddress || '',
            quotes: []
          };
        }
        clientMap[key].quotes.push(q);
      }
    });

    // Analyze individual client buying interval and generate predictions
    return Object.values(clientMap).map(c => {
      // Sort quotes chronological (oldest to newest)
      const parseDateStr = (dateStr: string) => {
        if (!dateStr) return 0;
        const [d, m, y] = dateStr.split('/').map(Number);
        return new Date(y, m - 1, d).getTime();
      };
      
      const sortedQuotes = [...c.quotes].sort((a, b) => parseDateStr(a.date) - parseDateStr(b.date));
      const totalSpent = c.quotes.reduce((acc, q) => acc + (q.total || 0), 0);
      const ordersCount = c.quotes.length;

      // Predictive values
      let avgIntervalDays = 45; // default industrial standard cycle
      let predictedNextDate: Date | null = null;
      let daysUntilPredicted = 0;
      let predictionStatus: 'ok' | 'due' | 'past_due' | 'new' = 'new';
      let purchaseFrequencyDesc = "Apenas 1 pedido";

      const parseDateObj = (dateStr: string) => {
        if (!dateStr) return new Date();
        const [d, m, y] = dateStr.split('/').map(Number);
        return new Date(y, m - 1, d);
      };

      if (sortedQuotes.length >= 2) {
        let totalInterval = 0;
        for (let i = 1; i < sortedQuotes.length; i++) {
          const d1 = parseDateObj(sortedQuotes[i - 1].date);
          const d2 = parseDateObj(sortedQuotes[i].date);
          const diffMs = Math.abs(d2.getTime() - d1.getTime());
          totalInterval += Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }
        avgIntervalDays = Math.round(totalInterval / (sortedQuotes.length - 1)) || 30; // default to 30 if 0
        purchaseFrequencyDesc = `A cada ${avgIntervalDays} dias`;

        const lastOrderDate = parseDateObj(sortedQuotes[sortedQuotes.length - 1].date);
        predictedNextDate = new Date(lastOrderDate.getTime());
        predictedNextDate.setDate(predictedNextDate.getDate() + avgIntervalDays);

        const today = new Date();
        const diffMs = predictedNextDate.getTime() - today.getTime();
        daysUntilPredicted = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (daysUntilPredicted < -15) {
          predictionStatus = 'past_due';
        } else if (daysUntilPredicted <= 5) {
          predictionStatus = 'due';
        } else {
          predictionStatus = 'ok';
        }
      } else if (sortedQuotes.length === 1) {
        avgIntervalDays = 45;
        purchaseFrequencyDesc = "Primeiro Pedido";
        const lastOrderDate = parseDateObj(sortedQuotes[0].date);
        predictedNextDate = new Date(lastOrderDate.getTime());
        predictedNextDate.setDate(predictedNextDate.getDate() + 45); // estimate next on 45 days

        const today = new Date();
        const diffMs = predictedNextDate.getTime() - today.getTime();
        daysUntilPredicted = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysUntilPredicted <= 5) {
          predictionStatus = 'due';
        } else {
          predictionStatus = 'ok';
        }
      }

      return {
        ...c,
        totalSpent,
        ordersCount,
        avgIntervalDays,
        purchaseFrequencyDesc,
        predictedNextDate,
        daysUntilPredicted,
        predictionStatus
      };
    });
  };

  const getProductFrequencies = () => {
    let calhasFreq = 0;
    let rufosFreq = 0;
    let telhasFreq = 0;
    let condutoresFreq = 0;
    let chaminesFreq = 0;
    let coifasFreq = 0;

    quotes.forEach(q => {
      if (q.calhas) calhasFreq += q.calhas.length;
      if (q.rufos) rufosFreq += q.rufos.length;
      if (q.telhas) telhasFreq += q.telhas.length;
      if (q.condutores && q.condutores.qtd > 0) condutoresFreq += Number(q.condutores.qtd);
      if (q.chamines) q.chamines.forEach((it: any) => { if (it.qtd > 0) chaminesFreq += Number(it.qtd) });
      if (q.coifas) q.coifas.forEach((it: any) => { if (it.qtd > 0) coifasFreq += Number(it.qtd) });
    });

    const totalItems = (calhasFreq + rufosFreq + telhasFreq + condutoresFreq + chaminesFreq + coifasFreq) || 1;

    return [
      { name: 'Calhas', count: calhasFreq, pct: (calhasFreq / totalItems) * 100, color: 'bg-emerald-500' },
      { name: 'Rufos', count: rufosFreq, pct: (rufosFreq / totalItems) * 100, color: 'bg-indigo-500' },
      { name: 'Telhas', count: telhasFreq, pct: (telhasFreq / totalItems) * 100, color: 'bg-amber-500' },
      { name: 'Condutores', count: condutoresFreq, pct: (condutoresFreq / totalItems) * 100, color: 'bg-pink-500' },
      { name: 'Chaminés', count: chaminesFreq, pct: (chaminesFreq / totalItems) * 100, color: 'bg-[#06b6d4]' }, // sky/teal-ish
      { name: 'Coifas', count: coifasFreq, pct: (coifasFreq / totalItems) * 100, color: 'bg-teal-500' },
    ].sort((a, b) => b.count - a.count);
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
      await update(companyRef, {
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
    
    if (oldQuote.condutores && oldQuote.condutores.qtd > 0) {
      allItems.push({
        desc: `Condutor: ${oldQuote.condutores.desc || 'Tubo de Descida Pluvial'}`,
        specs: `Especial de vazão rápida`,
        qtd: oldQuote.condutores.qtd,
        unit: oldQuote.condutores.unit || 21.00,
        total: oldQuote.condutores.total
      });
    }

    if (oldQuote.chamines) {
      oldQuote.chamines.forEach((it: any) => {
        if (it.qtd > 0) {
          allItems.push({
            desc: `Chaminé / Exaustão: ${it.desc}`,
            specs: it.specs || 'Diâmetro padrão',
            qtd: it.qtd,
            unit: it.unit,
            total: it.total
          });
        }
      });
    }

    if (oldQuote.coifas) {
      oldQuote.coifas.forEach((it: any) => {
        if (it.qtd > 0) {
          allItems.push({
            desc: `Coifa de Exaustão: ${it.desc}`,
            specs: it.specs || 'Medida padrão',
            qtd: it.qtd,
            unit: it.unit,
            total: it.total
          });
        }
      });
    }

    if (oldQuote.puQty && oldQuote.puQty > 0) {
      allItems.push({
        desc: 'Bisnaga Silicone Vedação PU-40',
        specs: 'Alta aderência e vedação contra goteiras',
        qtd: oldQuote.puQty,
        unit: oldQuote.puPrice || 22.00,
        total: oldQuote.puQty * (oldQuote.puPrice || 22.00)
      });
    }

    if (oldQuote.laborPrice && oldQuote.laborPrice > 0) {
      allItems.push({
        desc: 'Mão de Obra e Instalação em Obra',
        specs: 'Montagem, alinhamento e estanqueidade térmica',
        qtd: 1,
        unit: oldQuote.laborPrice,
        total: oldQuote.laborPrice
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
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 800);
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
      laborPrice: laborPrice,
      condutores: {
        desc: wCondType,
        qtd: wCondQty,
        unit: wCondPrice,
        total: wCondQty * wCondPrice * wCondLen
      },
      chamines: [{
        desc: wChamType,
        specs: `Ø ${wChamDiam}mm - ${wChamMaterial}`,
        qtd: wChamQty,
        unit: wChamPrice,
        total: wChamQty * wChamPrice
      }],
      coifas: [{
        desc: wCoifaType,
        specs: `Tamanho: ${wCoifaSize} - ${wCoifaMaterial}`,
        qtd: wCoifaQty,
        unit: wCoifaPrice,
        total: wCoifaQty * wCoifaPrice
      }],
      subtotal: wSubtotal,
      discountPercent: discountPercent,
      discountAmount: wDiscAmount,
      total: wTotal,
      notes: wNotes,
      createdAt: new Date().toISOString()
    };

    await handleSaveDocToCloud(payload);

    // Auto-save client if not already in clients registry
    const clientExt = clients.find(c => (c.name || '').trim().toLowerCase() === wName.trim().toLowerCase());
    if (user && !clientExt) {
      const newClientId = "CLI-" + Math.floor(10000 + Math.random() * 90000).toString();
      const clientPayload = {
        id: newClientId,
        name: wName,
        phone: wPhone,
        address: wAddress,
        createdAt: new Date().toISOString()
      };
      try {
        const clientRef = ref(db, `quotes/${user.uid}/_clients/${newClientId}`);
        await set(clientRef, clientPayload);
      } catch (err) {
        console.error("Erro ao auto-cadastrar cliente:", err);
      }
    }

    alert(`🎉 Sucesso! Orçamento cadastrado na nuvem com o código ${payload.id}`);
    
    // Auto redirect to history list and open WhatsApp PDF Helper immediately
    setWName('');
    setWPhone('');
    setWAddress('');
    setWTileItems([]);
    setWGutterItems([]);
    setWRufoItems([]);
    setWChamQty(1);
    setWCoifaQty(0);
    
    setSelectedQuoteForPdf(payload);
    setShowWhatsAppPdfHelper(true);
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
    <div className={`min-h-screen flex flex-col items-center justify-start md:justify-center p-0 md:py-8 md:px-6 transition-colors duration-300 font-sans overflow-y-auto ${darkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-stone-100 text-zinc-900'}`}>
      
      {/* Absolute Header for Desktop/Tablet View */}
      <div className="hidden md:flex items-center gap-6 justify-between w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 py-3 border-b border-zinc-200 dark:border-zinc-850 mb-6 font-mono text-xs text-zinc-500 shrink-0">
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

      {/* Responsive Workspace App Panel Container */}
      <div className="w-full md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-screen md:h-[85vh] bg-white dark:bg-zinc-950 md:rounded-[24px] md:shadow-2xl md:border border-zinc-200 dark:border-zinc-850 relative flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Dynamic App Area inside Viewport */}
        <div className={`flex-grow flex flex-col overflow-hidden relative transition-colors duration-300 ${
          darkMode ? 'bg-zinc-950 text-white' : 'bg-stone-50 text-stone-900'
        }`}>
          
          {/* USER NOT AUTHENTICATED: Native Phone Form Login */}
          {!user ? (
            <div className="flex-grow flex flex-col p-6 justify-center items-center overflow-y-auto">
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

                    {/* Mobile LogOut Button */}
                    <button 
                      onClick={handleSignOut}
                      className={`p-2 rounded-lg transition-colors cursor-pointer border ${
                        darkMode 
                          ? 'bg-zinc-900 text-red-400 hover:text-red-300 hover:bg-red-950/20 border-zinc-800' 
                          : 'bg-stone-100 text-red-600 hover:text-red-700 hover:bg-red-50 border-stone-200'
                      }`}
                      title="Sair / Desconectar"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* VIEWPORT CONTROLLER SWITCHBOARD */}
              <div className="flex-grow overflow-y-auto p-4 pb-6 no-scrollbar">

                {viewportTab === 'home' && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Top Calendary Greeting metadata */}
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-zinc-400 tracking-wide uppercase">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                      <h3 className="text-xl font-extrabold tracking-tight">
                        CRM & Clientes CalhaZap
                      </h3>
                    </div>

                    {/* Sub-tab Navigation Bar */}
                    <div className="flex bg-zinc-150 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 gap-1 select-none">
                      <button 
                        onClick={() => setHomeSubTab('geral')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer ${
                          homeSubTab === 'geral' 
                            ? 'bg-amber-400 text-slate-950 shadow-sm' 
                            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                        }`}
                      >
                        🏠 Geral
                      </button>
                      
                      <button 
                        onClick={() => setHomeSubTab('dashboard')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer ${
                          homeSubTab === 'dashboard' 
                            ? 'bg-amber-400 text-slate-950 shadow-sm' 
                            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                        }`}
                      >
                        📈 Vendas & CRM
                      </button>
                      
                      <button 
                        onClick={() => setHomeSubTab('clientes')}
                        className={`flex-1 py-1 px-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer leading-tight ${
                          homeSubTab === 'clientes' 
                            ? 'bg-amber-400 text-slate-950 shadow-sm' 
                            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                        }`}
                      >
                        👤 Cadastrar Clientes
                      </button>
                    </div>

                    {/* 1. VISÃO GERAL TAB */}
                    {homeSubTab === 'geral' && (
                      <div className="space-y-4 animate-fade-in">
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
                              setHomeSubTab('clientes');
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
                            <span className="text-xs uppercase tracking-wider text-zinc-500">Instalações & Visitas</span>
                            <button onClick={() => setViewportTab('hist')} className="text-xs text-amber-500 cursor-pointer">Ver Todos</button>
                          </div>

                          <div className="space-y-2">
                            {quotes.filter(q => q.status === 'pendente' || q.status === 'aprovado').length === 0 ? (
                              <div className={`p-4 text-center rounded-2xl border border-dashed text-xs text-zinc-400 font-bold ${
                                darkMode ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-200 bg-zinc-50/50'
                              }`}>
                                Crie ou salve um orçamento para gerenciar instalações ativas aqui.
                              </div>
                            ) : (
                              quotes.filter(q => q.status === 'pendente' || q.status === 'aprovado').slice(0, 2).map((q) => (
                                <div 
                                  key={q.id}
                                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                                    darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 truncate">
                                    <span className={`px-2 py-1 rounded-xl text-[9px] font-black shrink-0 ${
                                      q.status === 'aprovado' ? 'bg-emerald-100 text-emerald-850' : 'bg-amber-100 text-amber-850'
                                    }`}>
                                      {q.date?.slice(0, 5) || 'Hoje'}
                                    </span>
                                    <div className="truncate">
                                      <h5 className="text-xs font-bold truncate">{q.customerName}</h5>
                                      <p className="text-[10px] text-zinc-500 truncate">{q.customerAddress || 'Oficina / Balcão'}</p>
                                    </div>
                                  </div>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 border ${
                                    q.status === 'aprovado' 
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                      : 'bg-yellow-105 text-yellow-800 border-yellow-250'
                                  }`}>
                                    {q.status === 'aprovado' ? 'APROVADO' : 'PENDENTE'}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Section Summary quick counters (3 grids) */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className={`p-3 rounded-2xl text-center border ${
                            darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                          }`}>
                            <div className="text-lg font-black font-condensed text-blue-500">
                              {quotes.filter(q => q.status === 'aprovado' || q.status === 'pago').length}
                            </div>
                            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide">Obras Ativas</div>
                          </div>
                          <div className={`p-3 rounded-2xl text-center border ${
                            darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                          }`}>
                            <div className="text-lg font-black font-condensed text-amber-500">
                              {quotes.length}
                            </div>
                            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide">Orçamentos</div>
                          </div>
                          <div className={`p-3 rounded-2xl text-center border ${
                            darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                          }`}>
                            <div className="text-lg font-black font-condensed text-emerald-500">
                              {quotes.filter(q => q.status === 'aprovado').length}
                            </div>
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
                                      q.status === 'pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-105 dark:bg-zinc-800 text-zinc-500'
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

                    {/* 2. CHURRAS DE INFORMAÇÕES / CRM SALES DASHBOARD TAB */}
                    {homeSubTab === 'dashboard' && (
                      <div className="space-y-4 animate-fade-in pb-10">
                        
                        {/* KPI Summary Cards */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`p-3 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                            <span className="text-[9px] text-zinc-400 font-bold block uppercase">Faturamento Estimado</span>
                            <span className="text-lg font-black font-condensed text-emerald-500 block">
                              R$ {quotes.reduce((acc, q) => acc + (q.status === 'pago' || q.status === 'aprovado' ? (q.total || 0) : 0), 0).toFixed(2)}
                            </span>
                            <span className="text-[8px] text-zinc-500">Soma de pagos e aprovados</span>
                          </div>

                          <div className={`p-3 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                            <span className="text-[9px] text-zinc-400 font-bold block uppercase">Na Mesa (Pendente)</span>
                            <span className="text-lg font-black font-condensed text-amber-500 block">
                              R$ {quotes.reduce((acc, q) => acc + (q.status === 'pendente' ? (q.total || 0) : 0), 0).toFixed(2)}
                            </span>
                            <span className="text-[8px] text-zinc-500">{quotes.filter(q => q.status === 'pendente').length} propostas em espera</span>
                          </div>
                        </div>

                        {/* SECTION: TOP CLIENTES */}
                        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} space-y-3`}>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-amber-500">🏆 Top Clientes (Maiores Compradores)</h4>
                            <p className="text-[10px] text-zinc-500">Clientes ordenados pelo volume financeiro total das obras</p>
                          </div>

                          <div className="space-y-2.5 pt-1">
                            {getClientSalesIntelligence().filter(c => c.totalSpent > 0).length === 0 ? (
                              <div className="text-center p-3 text-xs text-zinc-500">Nenhum orçamento com valor salvo para gerar o gráfico.</div>
                            ) : (
                              getClientSalesIntelligence()
                                .sort((a,b) => b.totalSpent - a.totalSpent)
                                .slice(0, 4)
                                .map((c, i) => {
                                  // Compute pct relative to max spent
                                  const listStats = getClientSalesIntelligence().sort((a,b) => b.totalSpent - a.totalSpent);
                                  const max = listStats[0]?.totalSpent || 1;
                                  const percent = Math.max(5, Math.round((c.totalSpent / max) * 100));
                                  return (
                                    <div key={c.name} className="space-y-1">
                                      <div className="flex justify-between items-center text-xs font-bold font-mono">
                                        <span className="text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                                          <span className="text-[10px] text-zinc-400">#{i+1}</span>
                                          {c.name}
                                        </span>
                                        <span className="text-amber-500 font-black">R$ {c.totalSpent.toFixed(2)}</span>
                                      </div>
                                      <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                          style={{ width: `${percent}%` }}
                                        />
                                      </div>
                                      <div className="flex justify-between text-[9px] text-zinc-500">
                                        <span>{c.ordersCount} {c.ordersCount === 1 ? 'pedido realizado' : 'pedidos realizados'}</span>
                                        <span>Freq: {c.purchaseFrequencyDesc}</span>
                                      </div>
                                    </div>
                                  );
                                })
                            )}
                          </div>
                        </div>

                        {/* SECTION: PRODUTOS MAIS PEDIDOS */}
                        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} space-y-3`}>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-[#3b82f6]">📊 Itens e Produtos mais Frequentes</h4>
                            <p className="text-[10px] text-zinc-500">Análise de saída de calhas, rufos, telhas e conexões</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            {getProductFrequencies().map((p) => (
                              <div key={p.name} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 space-y-1.5">
                                <span className="text-[10px] font-bold text-zinc-500 block uppercase">{p.name}</span>
                                <div className="flex justify-between items-baseline">
                                  <span className="text-base font-black font-condensed text-zinc-850 dark:text-zinc-150">{p.count}un</span>
                                  <span className="text-[9px] font-bold text-zinc-450 font-mono">{Math.round(p.pct)}%</span>
                                </div>
                                <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${p.color}`} style={{ width: `${Math.max(5, p.pct)}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* SECTION: PRE-ANÁLISE PREDITIVA CRM */}
                        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} space-y-3`}>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              Pre-Análise Inteligente (Previsão de Recompra)
                            </h4>
                            <p className="text-[10px] text-zinc-500">Estimativas geradas por inteligência baseada no intervalo histórico de pedidos</p>
                          </div>

                          <div className="space-y-2 pt-1">
                            {getClientSalesIntelligence().length === 0 ? (
                              <div className="text-center p-3 text-xs text-zinc-500">Nenhum histórico disponível. Registre orçamentos para ativar.</div>
                            ) : (
                              getClientSalesIntelligence()
                                .sort((a,b) => (a.daysUntilPredicted || 0) - (b.daysUntilPredicted || 0))
                                .map((c) => {
                                  const isCritical = c.daysUntilPredicted <= 5 || c.predictionStatus === 'past_due';
                                  
                                  // Formatting the custom WhatsApp message
                                  const customMsgText = `Olá, *${c.name}*! Tudo bem?\n\nAqui é o responsável de *${companyName}*.\nNotamos em nossos registros que você costuma realizar compras de calhas ou rufos conosco ${c.purchaseFrequencyDesc}.\n\nComo faz um tempo desde o seu último pedido, gostaria de solicitar um novo orçamento personalizado, agendar uma visita preventiva ou verificar se precisa de novos acabamentos sem compromisso?\n\nEstamos à sua inteira disposição!`;
                                  const zapUrl = `https://api.whatsapp.com/send?phone=${(c.phone || '').replace(/\D/g, '')}&text=${encodeURIComponent(customMsgText)}`;

                                  return (
                                    <div 
                                      key={c.name} 
                                      className={`p-3 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                                        isCritical 
                                          ? 'bg-red-50/40 dark:bg-red-950/10 border-red-200 dark:border-red-900/30' 
                                          : 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-150 dark:border-zinc-850'
                                      }`}
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h5 className="text-xs font-black">{c.name}</h5>
                                          <p className="text-[9px] text-zinc-500">Intervalo médio: {c.purchaseFrequencyDesc}</p>
                                        </div>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                          isCritical 
                                            ? 'bg-red-150 text-red-800 dark:bg-red-950 dark:text-red-400 border border-red-200 dark:border-red-800' 
                                            : 'bg-zinc-150 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350'
                                        }`}>
                                          {c.daysUntilPredicted <= 0 
                                            ? '🚨 CICLO ESGOTADO (OFERTE!)' 
                                            : c.daysUntilPredicted <= 5 
                                              ? '🔔 COMPRA IMINENTE' 
                                              : `Ciclo OK (${c.daysUntilPredicted} dias restantes)`}
                                        </span>
                                      </div>

                                      <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-100 dark:border-zinc-850 text-[10px] text-zinc-600 dark:text-zinc-350 italic leading-normal">
                                        "Com base no tempo habitual de {c.avgIntervalDays} dias, sugerimos enviar uma mensagem de acompanhamento para oferecer novas calhas ou conexões preventivas."
                                      </div>

                                      <div className="flex gap-2 justify-end">
                                        <a 
                                          href={zapUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer"
                                        >
                                          <Send className="w-3 h-3" />
                                          <span>💬 Ofertar no WhatsApp</span>
                                        </a>
                                      </div>
                                    </div>
                                  );
                                })
                            )}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* 3. CADASTRO DE CLIENTES ISOLADOS (SEM ORÇAMENTOS) */}
                    {homeSubTab === 'clientes' && (
                      <div className="space-y-4 animate-fade-in pb-10">
                        {/* INPUT PANEL CARD */}
                        <form onSubmit={handleSaveClient} className={`p-4 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} space-y-3`}>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-black uppercase text-amber-500">
                              {cEditingId ? '✏️ Editar Dados do Cliente' : '👤 Novo Cadastro de Cliente (Sem Orçamento)'}
                            </h4>
                            <p className="text-[10px] text-zinc-500">Você pode guardar os dados dos clientes para fazer orçamentos rápidos no futuro.</p>
                          </div>

                          <div className="space-y-2.5">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400">Nome Completo / Razão Social</label>
                              <input 
                                type="text"
                                placeholder="Nome do cliente"
                                value={cName}
                                onChange={(e) => setCName(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-950 text-xs py-2 px-3 border dark:border-zinc-850 rounded-xl outline-none focus:border-amber-400"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400">Telefone / WhatsApp</label>
                              <input 
                                type="text"
                                placeholder="Ex: (11) 99999-8888"
                                value={cPhone}
                                onChange={(e) => setCPhone(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-950 text-xs py-2 px-3 border dark:border-zinc-850 rounded-xl outline-none focus:border-amber-400"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400">Endereço Completo</label>
                              <input 
                                type="text"
                                placeholder="Rua, número, bairro..."
                                value={cAddress}
                                onChange={(e) => setCAddress(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-950 text-xs py-2 px-3 border dark:border-zinc-850 rounded-xl outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>

                          <div className="pt-2 flex gap-2">
                            {cEditingId && (
                              <button 
                                type="button"
                                onClick={() => {
                                  setCName('');
                                  setCPhone('');
                                  setCAddress('');
                                  setCEditingId(null);
                                }}
                                className="flex-1 py-2 bg-zinc-500 hover:bg-zinc-650 text-white font-bold text-xs rounded-xl cursor-pointer"
                              >
                                Cancelar
                              </button>
                            )}
                            <button 
                              type="submit"
                              className="flex-[2] py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                            >
                              {cEditingId ? 'Salvar Edições' : 'Cadastrar Cliente'}
                            </button>
                          </div>
                        </form>

                        {/* LIST DIRECTORY */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider">Diretório de Clientes Salvamentos</h4>
                          
                          <div className="space-y-2">
                            {clients.length === 0 ? (
                              <div className="text-center p-6 border border-dashed rounded-2xl text-xs text-zinc-450 italic">Nenhum cliente cadastrado no momento. Cadastre acima!</div>
                            ) : (
                              clients.map((c) => {
                                // Find previous estimates match
                                const matchingEstimates = quotes.filter(q => (q.customerName || '').trim().toLowerCase() === (c.name || '').trim().toLowerCase());
                                const sumValue = matchingEstimates.reduce((acc, q) => acc + (q.total || 0), 0);

                                return (
                                  <div key={c.id} className={`p-3 rounded-2xl border flex flex-col gap-2 ${darkMode ? 'bg-zinc-900 border-zinc-850' : 'bg-white border-zinc-150'}`}>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h5 className="text-xs font-black">{c.name}</h5>
                                        <p className="text-[10px] font-mono text-zinc-500">{c.id} • {c.phone || '(Sem WhatsApp)'}</p>
                                      </div>
                                      <span className="text-[9px] bg-amber-500/10 text-amber-600 font-bold px-1.5 py-0.5 rounded">
                                        {matchingEstimates.length} orçamentos (R$ {sumValue.toFixed(2)})
                                      </span>
                                    </div>
                                    
                                    {c.address && (
                                      <p className="text-[10px] text-zinc-500 leading-normal flex items-center gap-1">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span>{c.address}</span>
                                      </p>
                                    )}

                                    <div className="pt-2 flex gap-2 border-t border-zinc-100 dark:border-zinc-850 justify-between items-center text-[10px] font-bold">
                                      {/* Make a Quote directly! */}
                                      <button 
                                        onClick={() => {
                                          setWName(c.name);
                                          setWPhone(c.phone || '');
                                          setWAddress(c.address || '');
                                          setWizardClientSearch(c.name);
                                          setWizardStep(1);
                                          setViewportTab('orc');
                                        }}
                                        className="py-1 px-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-lg transition text-[9px] uppercase tracking-wider cursor-pointer"
                                        title="Lançar um novo orçamento para este cliente"
                                      >
                                        📝 Fazer Orçamento
                                      </button>
                                      
                                      <div className="flex gap-1">
                                        <button 
                                          onClick={() => handleEditClientStart(c)}
                                          className="p-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 hover:bg-zinc-200 rounded cursor-pointer"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteClient(c.id)}
                                          className="p-1.5 bg-zinc-100 dark:bg-zinc-800 text-red-400 hover:bg-red-50 rounded cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>

                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                      </div>
                    )}

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

                        {/* Quick registered client autocomplete dropdown selection */}
                        {clients.length > 0 && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2 relative">
                            <div className="flex justify-between items-center text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                CARREGAR CLIENTE SALVO?
                              </span>
                              {wName && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWName("");
                                    setWPhone("");
                                    setWAddress("");
                                    setWizardClientSearch("");
                                  }}
                                  className="text-[9px] text-red-500 font-black cursor-pointer uppercase tracking-tight hover:underline"
                                >
                                  Limpar Campos [x]
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <input 
                                type="text"
                                placeholder="🔍 Comece a digitar o nome..."
                                value={wizardClientSearch}
                                onChange={(e) => {
                                  setWizardClientSearch(e.target.value);
                                  setShowWizardClientDropdown(true);
                                }}
                                onFocus={() => setShowWizardClientDropdown(true)}
                                className="w-full bg-white dark:bg-zinc-950 text-xs py-1.5 px-3 rounded-lg border dark:border-zinc-850 outline-none focus:border-amber-400 text-zinc-900 dark:text-zinc-100"
                              />
                              {showWizardClientDropdown && (
                                <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white dark:bg-zinc-900 border dark:border-zinc-850 rounded-xl shadow-xl z-50">
                                  {clients.filter(c => c.name.toLowerCase().includes(wizardClientSearch.toLowerCase())).length === 0 ? (
                                    <div className="p-2 text-[10px] text-zinc-550 italic text-center">Nenhum cliente correspondente encontrado</div>
                                  ) : (
                                    clients
                                      .filter(c => c.name.toLowerCase().includes(wizardClientSearch.toLowerCase()))
                                      .map(c => (
                                        <div 
                                          key={c.id}
                                          onClick={() => {
                                            setWName(c.name || "");
                                            setWPhone(c.phone || "");
                                            setWAddress(c.address || "");
                                            setWizardClientSearch(c.name || "");
                                            setShowWizardClientDropdown(false);
                                          }}
                                          className="p-2 text-[11px] text-left cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-850 text-zinc-800 dark:text-zinc-200"
                                        >
                                          <strong>{c.name}</strong> {c.phone ? `(${c.phone})` : ""}
                                        </div>
                                      ))
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

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
                            {wName && clients.find(c => (c.name || '').trim().toLowerCase() === (wName || '').trim().toLowerCase()) && (
                              <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1.5 mt-1 relative p-1.5 bg-emerald-500/10 border border-emerald-500/15 rounded-lg animate-fade-in select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>✅ Vinculado ao cliente cadastrado: <strong className="underline">{clients.find(c => (c.name || '').trim().toLowerCase() === (wName || '').trim().toLowerCase())?.id}</strong></span>
                              </div>
                            )}
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

                          {/* Foto da Obra Capture and upload block (functional) */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-400">Foto da Obra (Opcional)</label>
                            
                            <input 
                              type="file"
                              ref={photoInputRef}
                              accept="image/*"
                              capture="environment"
                              onChange={handlePhotoChange}
                              className="hidden"
                            />

                            <div 
                              onClick={triggerCameraInput}
                              className="cursor-pointer border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex flex-col items-center justify-center gap-2 text-center text-[11px] font-bold text-zinc-500"
                            >
                              <Camera className="w-6 h-6 text-amber-500 stroke-[2] animate-pulse" />
                              <div>
                                <span className="text-zinc-650 dark:text-zinc-300">Tirar Foto ou Escolher Imagem</span>
                                <p className="text-[10px] text-zinc-500 font-normal mt-0.5">Captura real usando sua câmera ou galeria do aparelho</p>
                              </div>
                            </div>
                            
                            {wPhoto && (
                              <div className="relative rounded-2xl border bg-white border-zinc-300 text-zinc-800 p-2 text-xs flex gap-3.5 items-center">
                                <img src={wPhoto} className="w-12 h-12 object-cover rounded-lg" alt="Obra" />
                                <div className="flex-grow">
                                  <span className="font-bold block truncate max-w-[180px]">
                                    {photoInfo?.name || 'foto_obra.jpg'}
                                  </span>
                                  <span className="text-[10px] text-zinc-500">
                                    {photoInfo?.size || 'Sucesso'} • Carregada
                                  </span>
                                </div>
                                <button 
                                  onClick={() => {
                                    setWPhoto(null);
                                    setPhotoInfo(null);
                                  }} 
                                  className="p-1 hover:bg-zinc-150 text-red-500 rounded cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
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
                      <div className="space-y-5 animate-fade-in">
                        <div className="space-y-1">
                          <h3 className="text-base font-extrabold flex items-center gap-1.5">
                            <span className="text-xl">🏠</span> Telhas e Cobertura Metálica
                          </h3>
                          <p className="text-xs text-zinc-400">Escolha o modelo da telha e veja o desenho dele</p>
                        </div>

                        {/* Interactive Visual Figures for Tiles */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-zinc-400 block pb-1">Selecione o Modelo do Perfil:</span>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { name: 'Trapézio 25', desc: 'Ondas quadradas médias', fig: '╱▔╲╱▔╲╱▔╲', price: 38.5 },
                              { name: 'Trapézio 40', desc: 'Ondas quadradas altas', fig: '╱▔▔╲___╱▔▔╲', price: 44.0 },
                              { name: 'Ondulada 17', desc: 'Ondas suaves redondas', fig: '~~~~~~~~', price: 35.0 },
                              { name: 'Sanduie Termoacústica', desc: 'Isolante termoacústico', fig: '█▄█▄█▄█▄█', price: 85.0 }
                            ].map((tile) => (
                              <button
                                key={tile.name}
                                onClick={() => {
                                  setSelTileType(tile.name);
                                  setTilePrice(tile.price);
                                }}
                                className={`p-3 text-left border rounded-2xl transition duration-200 cursor-pointer flex flex-col gap-1.5 relative overflow-hidden ${
                                  selTileType === tile.name 
                                    ? 'border-amber-400 bg-amber-500/10 shadow-md ring-1 ring-amber-400' 
                                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50'
                                }`}
                              >
                                {selTileType === tile.name && (
                                  <div className="absolute right-2 top-2 bg-amber-500 text-zinc-950 rounded-full p-0.5">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                )}
                                <span className="font-extrabold text-xs text-zinc-800 dark:text-zinc-100">{tile.name}</span>
                                <span className="text-[10px] text-zinc-500 block leading-tight">{tile.desc}</span>
                                
                                {/* ASCII Shape Drawing Box */}
                                <div className="mt-2 bg-neutral-100 dark:bg-neutral-900 text-amber-600 dark:text-amber-400 font-mono text-[11px] py-1.5 px-3 rounded-lg text-center tracking-widest font-black select-none">
                                  {tile.fig}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-900/40 space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-400">Material de Composição</label>
                            <div className="grid grid-cols-4 gap-1.5">
                              {['Galvalume', 'Galvanizado', 'Alumínio', 'Inox'].map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setSelTileMat(m)}
                                  className={`py-2 px-1 text-center border rounded-xl text-[9px] font-black uppercase transition duration-200 cursor-pointer ${
                                    selTileMat === m 
                                      ? 'border-amber-400 bg-amber-500 text-zinc-950 font-black' 
                                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Comprimento (m)</label>
                              <input 
                                type="number" 
                                value={tileLen || ""}
                                onChange={(e) => setTileLen(Math.max(1, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs text-[#1a1a1a] dark:text-white font-bold outline-none"
                              />
                              <p className="text-[9px] text-zinc-500">Tamanho de cada cobertura</p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Quantidade (Placas)</label>
                              <input 
                                type="number" 
                                value={tileQty || ""}
                                onChange={(e) => setTileQty(Math.max(1, parseInt(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs text-[#1a1a1a] dark:text-white font-bold outline-none"
                              />
                              <p className="text-[9px] text-zinc-500">Número de chapas totais</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-400">Preço do m² (R$)</label>
                              <input 
                                type="number"
                                value={tilePrice || ""}
                                onChange={(e) => setTilePrice(Math.max(1, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs text-emerald-500 font-extrabold outline-none"
                              />
                            </div>
                          </div>

                          <button 
                            onClick={addTileToStep}
                            className="w-full py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>+ Guardar e Somar Cobertura</span>
                          </button>
                        </div>

                        {/* List of active added coverage items */}
                        {wTileItems.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">🏠 Coberturas Adicionadas ao Preço:</span>
                            {wTileItems.map((it) => (
                              <div key={it.id} className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex justify-between items-center text-xs border dark:border-zinc-850">
                                <div>
                                  <span className="font-extrabold text-zinc-800 dark:text-zinc-100">{it.desc}</span>
                                  <p className="text-[10px] text-zinc-500 font-bold">{it.specs} • R$ {it.unit}/m²</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <strong className="font-black text-emerald-600 dark:text-emerald-400">R$ {it.total.toFixed(2)}</strong>
                                  <button onClick={() => setWTileItems(wTileItems.filter(p => p.id !== it.id))} className="text-red-500 rounded p-1 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2.5 pt-2">
                          <button onClick={() => setWizardStep(1)} className="flex-1 py-3 bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-700 dark:text-white rounded-xl font-bold text-xs cursor-pointer transition">Voltar</button>
                          <button onClick={() => setWizardStep(3)} className="flex-1 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl font-black text-xs cursor-pointer transition flex items-center justify-center gap-1.5">
                            <span>Seguir para Calhas ➡️</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: GUTTERS AND FLASHINGS (CALHAS E RUFOS) */}
                    {wizardStep === 3 && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="space-y-1">
                          <h3 className="text-base font-extrabold flex items-center gap-1.5">
                            <span className="text-xl">🌊</span> Calhas e Rufos Sob Medida
                          </h3>
                          <p className="text-xs text-zinc-400">Toque no modelo desejado de calha ou de rufo</p>
                        </div>

                        {/* Setup Calha inputs box */}
                        <div className="p-4 rounded-3xl border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-900/30 space-y-4">
                          <span className="text-xs uppercase font-extrabold text-amber-500 tracking-wider flex items-center gap-1">🛠️ 1. Calha sob Medida</span>
                          
                          {/* Visual Selectors for Gutters */}
                          <div className="grid grid-cols-2 gap-2 pb-1">
                            {[
                              { name: 'Calha Moldura', desc: 'Decorativa e elegante', fig: '|───_┘', price: 42.0 },
                              { name: 'Calha Americana', desc: 'Arredondada de beiral', fig: '╰─────╯', price: 48.0 },
                              { name: 'Calha Quadrada', desc: 'Reforçada em esquadra', fig: '└───┘', price: 45.0 },
                              { name: 'Calha Platibanda', desc: 'Entre paredes e muros', fig: '│▔▔▔│', price: 52.0 }
                            ].map((g) => (
                              <button
                                key={g.name}
                                type="button"
                                onClick={() => {
                                  setSelGutterType(g.name);
                                  setGutterPrice(g.price);
                                }}
                                className={`p-2.5 text-left border rounded-xl text-xs transition duration-200 cursor-pointer flex flex-col gap-1 relative ${
                                  selGutterType === g.name 
                                    ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400' 
                                    : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50'
                                }`}
                              >
                                <span className="font-bold text-zinc-800 dark:text-zinc-100 text-[11px]">{g.name}</span>
                                <span className="text-[9px] text-zinc-500 pb-0.5">{g.desc}</span>
                                <span className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-center">
                                  {g.fig}
                                </span>
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400">Desenvolvimento (mm)</label>
                              <input 
                                type="number" 
                                value={gutterCut || ""}
                                onChange={(e) => setGutterCut(Math.max(10, parseInt(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-[#1a1a1a] dark:text-white font-bold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400">Comprimento (m)</label>
                              <input 
                                type="number" 
                                value={gutterLen || ""}
                                onChange={(e) => setGutterLen(Math.max(1, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-[#1a1a1a] dark:text-white font-bold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400">Quant. Barras</label>
                              <input 
                                type="number" 
                                value={gutterQty || 1}
                                onChange={(e) => setGutterQty(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-[#1a1a1a] dark:text-white font-bold outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400">Valor Ajustado por Metro (R$)</label>
                              <input 
                                type="number" 
                                value={gutterPrice || ""}
                                onChange={(e) => setGutterPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-emerald-500 font-bold outline-none"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase">Material</label>
                              <select 
                                value={selGutterMat}
                                onChange={(e) => setSelGutterMat(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs font-bold text-[#1a1a1a] dark:text-white outline-none"
                              >
                                <option>Galvalume</option>
                                <option>Galvanizado</option>
                                <option>Alumínio</option>
                                <option>Inox</option>
                              </select>
                            </div>
                          </div>

                          <button 
                            onClick={addGutterToStep}
                            className="w-full py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-850 border border-yellow-250 text-[10px] font-black uppercase tracking-wide rounded-lg cursor-pointer transition"
                          >
                            + Guardar Linha de Calha
                          </button>
                        </div>

                        {/* Setup Rufo inputs box */}
                        <div className="p-4 rounded-3xl border border-zinc-200 dark:border-zinc-850 dark:bg-zinc-900/30 space-y-4">
                          <span className="text-xs uppercase font-extrabold text-amber-500 tracking-wider flex items-center gap-1">🛡️ 2. Rufos / Contra Rufo</span>
                          
                          {/* Visual Selectors for Rufos */}
                          <div className="grid grid-cols-3 gap-1.5 pb-1">
                            {[
                              { name: 'Rufo Encosto', desc: 'Veda c/ parede', fig: '│──_ (L)', price: 33.0 },
                              { name: 'Rufo Pingadeira', desc: 'Protege os muros', fig: '┌──┐ (U)', price: 36.0 },
                              { name: 'Cumeeira', desc: 'Vértice telhado', fig: '╱╲ (Apex)', price: 39.0 }
                            ].map((r) => (
                              <button
                                key={r.name}
                                type="button"
                                onClick={() => {
                                  setSelRufoType(r.name);
                                  setRufoPrice(r.price);
                                }}
                                className={`p-2 text-left border rounded-xl text-xs transition duration-200 cursor-pointer flex flex-col gap-1 relative ${
                                  selRufoType === r.name 
                                    ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400' 
                                    : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50'
                                }`}
                              >
                                <span className="font-bold text-zinc-800 dark:text-zinc-100 text-[10px] truncate">{r.name}</span>
                                <span className="text-[9px] text-zinc-500 pb-0.5 truncate">{r.desc}</span>
                                <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-center font-bold">
                                  {r.fig}
                                </span>
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400">Desenvolvimento (mm)</label>
                              <input 
                                type="number" 
                                value={rufoCut || ""}
                                onChange={(e) => setRufoCut(Math.max(10, parseInt(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-[#1a1a1a] dark:text-white font-bold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400">Comprimento (m)</label>
                              <input 
                                type="number" 
                                value={rufoLen || ""}
                                onChange={(e) => setRufoLen(Math.max(1, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-[#1a1a1a] dark:text-white font-bold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400">Quant. Barras</label>
                              <input 
                                type="number" 
                                value={rufoQty || 1}
                                onChange={(e) => setRufoQty(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-[#1a1a1a] dark:text-white font-bold outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400">Valor Ajustado por Metro (R$)</label>
                              <input 
                                type="number" 
                                value={rufoPrice || ""}
                                onChange={(e) => setRufoPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-emerald-500 font-bold outline-none"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase">Material</label>
                              <select 
                                value={selRufoMat}
                                onChange={(e) => setSelRufoMat(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs font-bold text-[#1a1a1a] dark:text-white outline-none"
                              >
                                <option>Galvalume</option>
                                <option>Galvanizado</option>
                                <option>Alumínio</option>
                                <option>Inox</option>
                              </select>
                            </div>
                          </div>

                          <button 
                            onClick={addRufoToStep}
                            className="w-full py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-850 border border-yellow-250 text-[10px] font-black uppercase tracking-wide rounded-lg cursor-pointer transition"
                          >
                            + Guardar Linha de Rufo
                          </button>
                        </div>

                        {/* List added features */}
                        {(wGutterItems.length > 0 || wRufoItems.length > 0) && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-black text-zinc-450 uppercase block">Listagem de Peças Guardadas:</span>
                            {[...wGutterItems, ...wRufoItems].map((e) => (
                              <div key={e.id} className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex justify-between items-center text-xs border dark:border-zinc-850">
                                <div>
                                  <strong className="font-extrabold text-zinc-800 dark:text-zinc-100">{e.desc}</strong>
                                  <p className="text-[10px] text-zinc-500 font-bold">{e.specs}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-black text-emerald-600 dark:text-emerald-400">R$ {e.total.toFixed(2)}</span>
                                  <button 
                                    onClick={() => {
                                      setWGutterItems(wGutterItems.filter(p => p.id !== e.id));
                                      setWRufoItems(wRufoItems.filter(p => p.id !== e.id));
                                    }} 
                                    className="text-red-500 rounded p-1 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button onClick={() => setWizardStep(2)} className="flex-1 py-3 bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-700 dark:text-white rounded-xl font-bold text-xs cursor-pointer transition">Voltar</button>
                          <button onClick={() => setWizardStep(4)} className="flex-1 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl font-black text-xs cursor-pointer transition flex items-center justify-center gap-1">
                            <span>Conexões & Coifa/Chaminé ➡️</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: DOWNPIPES (CONDUTORES), CHIMNEY FLUES, COIFAS & SEALANT */}
                    {wizardStep === 4 && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="space-y-1">
                          <h3 className="text-base font-extrabold flex items-center gap-1.5">
                            <span className="text-xl">⚙️</span> Conexões, Chaminés e Coifas
                          </h3>
                          <p className="text-xs text-zinc-400">Defina os dutos de vazão, fumaça e as colas de vedação</p>
                        </div>

                        {/* Condutores Pluviais retangulares */}
                        <div className="bg-white dark:bg-zinc-950 p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-850 space-y-3.5">
                          <span className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1">🚿 1. Tubo de Descida (Condutor)</span>
                          <p className="text-[11px] text-zinc-400 leading-tight">Canos que descem recolhendo a água da calha até o chão.</p>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400 block">Quantidade de Canos</label>
                              <input 
                                type="number" 
                                value={wCondQty || ""}
                                onChange={(e) => setWCondQty(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a] dark:text-white font-bold outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400 block">Metros por Cano</label>
                              <input 
                                type="number" 
                                value={wCondLen || ""}
                                onChange={(e) => setWCondLen(Math.max(1, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a] dark:text-white font-bold outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 block">Preço estimado metro do Condutor (R$)</label>
                            <input 
                              type="number" 
                              value={wCondPrice || ""}
                              onChange={(e) => setWCondPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-500 font-extrabold outline-none"
                            />
                          </div>
                        </div>

                        {/* Chaminés e Chapéus */}
                        <div className="bg-white dark:bg-zinc-950 p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-850 space-y-3.5">
                          <span className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1">🏭 2. Chaminés e Acessórios</span>
                          <p className="text-[11px] text-zinc-400 leading-tight">Dutos de aquecedor, lareiras ou saída de fumaça.</p>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-400 block">Escolha o Modelo de Chaminé</label>
                            <select 
                              value={wChamType}
                              onChange={(e) => {
                                setWChamType(e.target.value);
                                if (e.target.value.includes('Lareira')) setWChamPrice(125.0);
                                else if (e.target.value.includes('Aquecedor')) setWChamPrice(85.0);
                                else if (e.target.value.includes('Exaustor')) setWChamPrice(190.0);
                                else setWChamPrice(115.0);
                              }}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1a1a1a] dark:text-white"
                            >
                              <option>Chaminé de Lareira Galvanizada</option>
                              <option>Chapéu Chinês Tradicional</option>
                              <option>Chaminé Aquecedor Alumínio Flexível</option>
                              <option>Exaustor de Teto Giratório Turbina</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400 block">Furo/Bitola Ø</label>
                              <select 
                                value={wChamDiam}
                                onChange={(e) => setWChamDiam(parseInt(e.target.value) || 150)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-[#1a1a1a] dark:text-white font-bold outline-none"
                              >
                                <option value={100}>100 mm</option>
                                <option value={150}>150 mm</option>
                                <option value={200}>200 mm</option>
                                <option value={250}>250 mm</option>
                                <option value={300}>300 mm</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400 block">Quantidade</label>
                              <input 
                                type="number" 
                                value={wChamQty}
                                onChange={(e) => setWChamQty(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-[#1a1a1a] dark:text-white font-bold outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-400 block">Material</label>
                              <select 
                                value={wChamMaterial}
                                onChange={(e) => setWChamMaterial(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-[#1a1a1a] dark:text-white font-bold outline-none"
                              >
                                <option>Galvanizado</option>
                                <option>Alumínio</option>
                                <option>Inox</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 block">Preço unitário Chaminé (R$)</label>
                            <input 
                              type="number" 
                              value={wChamPrice || ""}
                              onChange={(e) => setWChamPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-500 font-extrabold outline-none"
                            />
                          </div>

                          {wChamQty > 0 && (
                            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-850 dark:text-amber-400 rounded-xl text-center text-[10px] font-black">
                              🏭 Somando {wChamQty}x Chaminé no orçamento: R$ {(wChamQty * wChamPrice).toFixed(2)}
                            </div>
                          )}
                        </div>

                        {/* Coifas de churrasqueira (Newly added specifically for user request and visual details) */}
                        <div className="bg-[#fffbeb] dark:bg-amber-950/20 p-4.5 rounded-3xl border border-amber-200 dark:border-amber-900/60 space-y-3.5">
                          <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">🥩🔥 3. Coifas Gourmet / Cozinha</span>
                          <p className="text-[11px] text-amber-900/80 dark:text-amber-300 leading-tight">Escolha e inclua a coifa de exaustão com preenchimento visual simplificado.</p>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <label className="text-[10px] font-black text-amber-900 dark:text-amber-300 block">Tipo de Coifa</label>
                              <select 
                                value={wCoifaType}
                                onChange={(e) => {
                                  setWCoifaType(e.target.value);
                                  if (e.target.value.includes('Inox')) setWCoifaPrice(890.0);
                                  else if (e.target.value.includes('Pintada')) setWCoifaPrice(670.0);
                                  else setWCoifaPrice(480.0);
                                }}
                                className="w-full bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-850 rounded-lg px-2 py-1 text-xs font-bold text-[#1a1a1a] dark:text-white outline-none"
                              >
                                <option>Coifa de Churrasqueira</option>
                                <option>Coifa de Cozinha Parede</option>
                                <option>Coifa Industrial Exaustor</option>
                              </select>
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[10px] font-black text-amber-900 dark:text-amber-300 block">Largura da Coifa</label>
                              <select 
                                value={wCoifaSize}
                                onChange={(e) => setWCoifaSize(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-amber-200 dark:border-zinc-850 rounded-lg px-2 py-1 text-xs font-bold text-[#1a1a1a] dark:text-white outline-none"
                              >
                                <option>60 cm</option>
                                <option>80 cm</option>
                                <option>90 cm</option>
                                <option>100 cm</option>
                                <option>120 cm</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] font-black text-amber-900 dark:text-amber-300 block">Quantidade</label>
                              <input 
                                type="number" 
                                value={wCoifaQty}
                                onChange={(e) => setWCoifaQty(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-amber-150 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs font-bold text-[#1a1a1a] dark:text-white outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-amber-900 dark:text-amber-300 block">Material</label>
                              <select 
                                value={wCoifaMaterial}
                                onChange={(e) => setWCoifaMaterial(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-amber-150 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs font-bold text-[#1a1a1a] dark:text-white outline-none"
                              >
                                <option>Galvanizado</option>
                                <option>Inox Escovado</option>
                                <option>Pintura Preta</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-amber-900 dark:text-amber-300 block">Preço Unitário</label>
                              <input 
                                type="number" 
                                value={wCoifaPrice || ""}
                                onChange={(e) => setWCoifaPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-amber-150 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400 outline-none"
                              />
                            </div>
                          </div>

                          {wCoifaQty > 0 ? (
                            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900 rounded-xl text-center text-xs font-black animate-pulse">
                              🔥 Somando {wCoifaQty}x {wCoifaType} ao total: R$ {(wCoifaQty * wCoifaPrice).toFixed(2)}
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-800/80 dark:text-amber-400 font-bold text-center">
                              (Deixe em 0 se o cliente não quiser colocar Coifa nesta obra)
                            </div>
                          )}
                        </div>

                        {/* PU-40 Bisnaga counts */}
                        <div className="bg-white dark:bg-zinc-950 p-4.5 rounded-3xl border border-zinc-200 dark:border-zinc-850 space-y-3">
                          <span className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1">🧪 4. Silicone de Emenda de Calha (PU-40)</span>
                          <p className="text-[11px] text-zinc-400 leading-tight">Veda e impede goteiras nas juntas e rebites de montagem.</p>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400 block">Tubos recomendados</label>
                              <input 
                                type="number" 
                                value={puQty || ""}
                                onChange={(e) => setPuQty(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a] dark:text-white font-extrabold outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400 block">Preço por Tubo (R$)</label>
                              <input 
                                type="number" 
                                value={puPrice || ""}
                                onChange={(e) => setPuPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-[#1a1a1a] dark:text-white outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => setWizardStep(3)} className="flex-1 py-3 bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-700 dark:text-white rounded-xl font-bold text-xs cursor-pointer transition">Voltar</button>
                          <button onClick={() => setWizardStep(5)} className="flex-1 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl font-black text-xs cursor-pointer transition flex items-center justify-center gap-1">
                            <span>Avançar para o Resumo total 💵</span>
                          </button>
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
                            <label className="text-xs font-bold text-zinc-400">Anotações / Observações</label>
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
                        onSendPdfViaWhatsApp={(q) => {
                          setSelectedQuoteForPdf(q);
                          setShowWhatsAppPdfHelper(true);
                        }}
                        companyName={companyName}
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
                      darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-800'
                    }`}>
                      <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest block border-b pb-1 dark:border-zinc-800">Definições da Oficina</span>
                      
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400 font-bold">Nome Fantasia Comercial</label>
                        <input 
                          type="text" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 rounded-lg px-2.5 py-1.5 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] text-zinc-400 font-bold">Seu Nome (Dono)</label>
                          <input 
                            type="text" 
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 rounded-lg px-2.5 py-1.5 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-zinc-400 font-bold">WhatsApp Contato</label>
                          <input 
                            type="text" 
                            value={companyPhone}
                            onChange={(e) => setCompanyPhone(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 rounded-lg px-2.5 py-1.5 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400 font-bold">CNPJ de Faturamento</label>
                        <input 
                          type="text" 
                          value={companyCNPJ}
                          onChange={(e) => setCompanyCNPJ(e.target.value)}
                          className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 rounded-lg px-2.5 py-1.5 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400 font-bold">Logotipo Empresa (Cópia Base64 / URL)</label>
                        <input 
                          type="text" 
                          value={companyLogo}
                          onChange={(e) => setCompanyLogo(e.target.value)}
                          placeholder="Fórmula de imagem Base64"
                          className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 rounded-lg px-2.5 py-1.5 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none truncate"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold rounded-xl transition cursor-pointer"
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
                      {notifs.length === 0 ? (
                        <div className={`p-8 text-center border border-dashed rounded-3xl ${
                          darkMode ? 'border-zinc-800 bg-zinc-950/40 select-none' : 'border-zinc-200 bg-zinc-50/50 select-none'
                        }`}>
                          <Bell className="w-8 h-8 mx-auto text-zinc-400 mb-2 stroke-[1.5]" />
                          <p className="text-xs font-bold text-zinc-400">Tudo limpo por aqui!</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Nenhuma notificação recente pendente.</p>
                        </div>
                      ) : (
                        notifs.map((n) => (
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
                        ))
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 7: ADMIN CONTROL CENTER (Exclusive to Administrators) */}
                {viewportTab === 'admin' && isAdmin && (
                  <div className="space-y-6 animate-fade-in pb-20 select-none">
                    
                    {/* Admin Header Banner */}
                    <div className="p-5 rounded-3xl bg-zinc-900 text-white border border-zinc-800 space-y-3 relative overflow-hidden shadow-lg">
                      <div className="absolute right-[-20px] bottom-[-20px] text-zinc-800 opacity-20 text-8xl font-black">
                        ADM
                      </div>
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="p-0.5 px-2 bg-red-600 text-white text-[8px] font-black rounded uppercase tracking-wider animate-pulse">
                            🛡️ ADMINISTRADOR
                          </span>
                          <span className="text-zinc-500 font-mono text-[10px]">| Geral Consolidado</span>
                        </div>
                        <button 
                          onClick={() => setViewportTab('home')}
                          className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 text-amber-400 hover:text-amber-300 font-bold rounded-xl text-xs transition cursor-pointer border border-zinc-700"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Voltar para Oficina</span>
                        </button>
                      </div>
                      
                      <div className="space-y-1 relative z-10">
                        <h3 className="text-lg font-extrabold tracking-tight uppercase text-zinc-100">
                          Consolidação de Propostas & Empresas
                        </h3>
                        <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed max-w-xl">
                          Análise unificada e inteligência preditiva abrangendo todas as empresas afiliadas, seus orçamentos totais e histórico acumulado de clientes no CalhaZap.
                        </p>
                      </div>
                    </div>

                    {/* Admin Permission Warning Alert Box */}
                    {adminPermissionError && (
                      <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⚠️</span>
                          <h4 className="text-xs font-black uppercase tracking-wider">Acesso Restrito - Regras do Database</h4>
                        </div>
                        <p className="text-[10px] leading-relaxed text-zinc-300">
                          As regras de segurança atuais do seu Firebase impedem o usuário admin de ler todas as pastas de empresas/orçamentos. 
                          Para habilitar o painel, acesse o <strong>Firebase Console &gt; Realtime Database &gt; Rules</strong> e substitua as regras por estas:
                        </p>
                        <pre className="p-3 bg-zinc-950 rounded-xl text-[9px] font-mono text-emerald-400 overflow-x-auto select-all max-h-40">
{`{
  "rules": {
    "companies": {
      "$userId": {
        ".read": "auth != null && (auth.uid === $userId || root.child('companies').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && (auth.uid === $userId || root.child('companies').child(auth.uid).child('role').val() === 'admin')"
      },
      ".read": "auth != null && root.child('companies').child(auth.uid).child('role').val() === 'admin'",
      ".write": "auth != null && root.child('companies').child(auth.uid).child('role').val() === 'admin'"
    },
    "quotes": {
      "$userId": {
        ".read": "auth != null && (auth.uid === $userId || root.child('companies').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && (auth.uid === $userId || root.child('companies').child(auth.uid).child('role').val() === 'admin')"
      },
      ".read": "auth != null && root.child('companies').child(auth.uid).child('role').val() === 'admin'",
      ".write": "auth != null && root.child('companies').child(auth.uid).child('role').val() === 'admin'"
    }
  }
}`}
                        </pre>
                        <p className="text-[9px] text-zinc-400 font-semibold leading-relaxed">
                          💡 Essa configuração garante que usuários comuns de oficinas só vejam suas próprias propostas, enquanto o usuário admin tem permissão total de leitura integrada.
                        </p>
                      </div>
                    )}

                    {/* KEY AGGREGATED STATISTICS GRID */}
                    {(() => {
                      const totalComps = allCompanies.length;
                      const totalQCount = allQuotes.length;
                      const approvedQuotes = allQuotes.filter(q => q.status === 'aprovado');
                      const pendingQuotes = allQuotes.filter(q => q.status === 'pendente' || !q.status);
                      const rejectedQuotes = allQuotes.filter(q => q.status === 'cancelado' || q.status === 'rejeitado');
                      
                      const totalRevenue = approvedQuotes.reduce((acc, q) => acc + Number(q.total || q.valorTotal || q.subtotal || 0), 0);
                      const conversionRate = totalQCount > 0 ? ((approvedQuotes.length / totalQCount) * 100).toFixed(1) : '0';

                      return (
                        <div className="space-y-6">
                          
                          {/* Top Metric Cards BENTO Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            
                            {/* Card 1: Empresas Ativas */}
                            <div className={`p-4 rounded-3xl border flex flex-col justify-between h-[105px] shadow-xs relative overflow-hidden transition ${
                              darkMode ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-150 hover:border-zinc-200'
                            }`}>
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Empresas Unidas</span>
                              <div className="space-y-0.5">
                                <h3 className="text-xl font-black tracking-tight leading-none text-amber-500 font-mono">
                                  {totalComps}
                                </h3>
                                <span className="text-[9px] text-zinc-500 block leading-none font-bold">Oficinas no CalhaZap</span>
                              </div>
                              <span className="absolute right-3.5 bottom-3 text-2xl opacity-15 select-none">🏢</span>
                            </div>

                            {/* Card 2: Total Orçamentos */}
                            <div className={`p-4 rounded-3xl border flex flex-col justify-between h-[105px] shadow-xs relative overflow-hidden transition ${
                              darkMode ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-150 hover:border-zinc-200'
                            }`}>
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Orçamentos</span>
                              <div className="space-y-0.5">
                                <h3 className="text-xl font-black tracking-tight leading-none text-blue-500 font-mono">
                                  {totalQCount}
                                </h3>
                                <span className="text-[9px] text-zinc-500 block leading-none font-bold">Total de propostas gerais</span>
                              </div>
                              <span className="absolute right-3.5 bottom-3 text-2xl opacity-15 select-none">📋</span>
                            </div>

                            {/* Card 3: Faturamento Consolidado */}
                            <div className={`p-4 rounded-3xl border flex flex-col justify-between h-[105px] shadow-xs relative overflow-hidden transition ${
                              darkMode ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-150 hover:border-zinc-200'
                            }`}>
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Vendas (R$)</span>
                              <div className="space-y-0.5">
                                <h3 className="text-lg font-black tracking-tight leading-none text-emerald-500 font-mono truncate">
                                  {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                                </h3>
                                <span className="text-[9px] text-zinc-500 block leading-none font-bold">Geral aprovado</span>
                              </div>
                              <span className="absolute right-3.5 bottom-3 text-2xl opacity-15 select-none">💵</span>
                            </div>

                            {/* Card 4: Conversão de Vendas */}
                            <div className={`p-4 rounded-3xl border flex flex-col justify-between h-[105px] shadow-xs relative overflow-hidden transition ${
                              darkMode ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-150 hover:border-zinc-200'
                            }`}>
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Taxa Conversão</span>
                              <div className="space-y-0.5">
                                <h3 className="text-xl font-black tracking-tight leading-none text-red-500 font-mono">
                                  {conversionRate}%
                                </h3>
                                <span className="text-[9px] text-zinc-500 block leading-none font-bold">Aprovações / Emitidos</span>
                              </div>
                              <span className="absolute right-3.5 bottom-3 text-2xl opacity-15 select-none">🎯</span>
                            </div>

                          </div>

                          {/* DASHBOARDS SECTOR - TWO COLUMNS */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            
                            {/* LEFT SIDE: TOP PERFORMING COMPANIES */}
                            <div className={`lg:col-span-7 p-5 rounded-3xl border space-y-4 shadow-xs ${
                              darkMode ? 'bg-zinc-900/40 border-zinc-850' : 'bg-white border-zinc-150'
                            }`}>
                              <div className="flex justify-between items-center border-b pb-3 dark:border-zinc-850">
                                <div>
                                  <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 leading-none">
                                    🏆 Faturamento por Oficina cadastrada
                                  </h4>
                                  <span className="text-[10px] text-zinc-500 font-semibold">Consolidado em R$ comercializado</span>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {totalComps === 0 ? (
                                  <div className="text-center py-6 text-xs text-zinc-400 font-bold">Nenhuma oficina no sistema.</div>
                                ) : (
                                  allCompanies
                                    .map(comp => {
                                      const compQuotes = allQuotes.filter(q => q.companyUid === comp.uid);
                                      const compApproved = compQuotes.filter(q => q.status === 'aprovado');
                                      const compRevenue = compApproved.reduce((sum, q) => sum + Number(q.total || q.valorTotal || q.subtotal || 0), 0);
                                      return {
                                        ...comp,
                                        quotesCount: compQuotes.length,
                                        revenue: compRevenue
                                      };
                                    })
                                    .sort((a,b) => b.revenue - a.revenue)
                                    .map((comp, idx) => {
                                      const maxRev = Math.max(...allCompanies.map(c => {
                                        const cpQ = allQuotes.filter(q => q.companyUid === c.uid);
                                        return cpQ.filter(q => q.status === 'aprovado').reduce((s, q) => s + Number(q.total || q.valorTotal || q.subtotal || 0), 0);
                                      })) || 1;
                                      const barPct = Math.round((comp.revenue / maxRev) * 105);

                                      return (
                                        <div key={comp.uid} className="space-y-1">
                                          <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2 font-black">
                                              <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${
                                                idx === 0 ? 'bg-amber-400 text-black' : (idx === 1 ? 'bg-stone-300 text-black' : 'bg-stone-100 dark:bg-zinc-800 text-zinc-500')
                                              }`}>
                                                {idx + 1}
                                              </span>
                                              <span className="text-zinc-800 dark:text-zinc-100 max-w-[170px] truncate">{comp.name || "Sem Nome Especificado"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 font-mono text-[11px] font-black">
                                              <span className="text-zinc-400 text-[9px]">({comp.quotesCount} orç.)</span>
                                              <span className="text-emerald-500">{comp.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</span>
                                            </div>
                                          </div>
                                          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full"
                                              style={{ width: `${Math.max(4, Math.min(100, barPct))}%` }}
                                            />
                                          </div>
                                        </div>
                                      );
                                    })
                                )}
                              </div>
                            </div>

                            {/* RIGHT SIDE: STATUS FUNNEL */}
                            <div className={`lg:col-span-5 p-5 rounded-3xl border space-y-4 shadow-xs flex flex-col justify-between ${
                              darkMode ? 'bg-zinc-900/40 border-zinc-850' : 'bg-white border-zinc-150'
                            }`}>
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 leading-none">
                                  📊 Funil de Orçamentos Geral
                                </h4>
                                <span className="text-[10px] text-zinc-500 font-semibold block">Conversão de propostas emitidas</span>
                              </div>

                              {totalQCount === 0 ? (
                                <div className="text-center py-6 text-xs text-zinc-400 font-bold flex-1 flex items-center justify-center">Sem dados suficientes.</div>
                              ) : (
                                <div className="space-y-4">
                                  
                                  {(() => {
                                    const appCount = approvedQuotes.length;
                                    const pendCount = pendingQuotes.length;
                                    const rejCount = rejectedQuotes.length;
                                    
                                    const appPct = Math.round((appCount / totalQCount) * 100);
                                    const pendPct = Math.round((pendCount / totalQCount) * 100);
                                    const rejPct = Math.round((rejCount / totalQCount) * 100);

                                    const radius = 35;
                                    const circum = 2 * Math.PI * radius;
                                    
                                    const strokeApp = (appCount / totalQCount) * circum;
                                    const strokePend = (pendCount / totalQCount) * circum;
                                    const strokeRej = (rejCount / totalQCount) * circum;

                                    return (
                                      <div className="flex items-center gap-4 py-1">
                                        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                                          <svg width="80" height="80" className="transform -rotate-90">
                                            <circle cx="40" cy="40" r={radius} fill="transparent" stroke={darkMode ? "#18181b" : "#f4f4f5"} strokeWidth="10" />
                                            <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#10b981" strokeWidth="10" strokeDasharray={`${strokeApp} ${circum}`} strokeDashoffset="0" />
                                            <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#f59e0b" strokeWidth="10" strokeDasharray={`${strokePend} ${circum}`} strokeDashoffset={`-${strokeApp}`} />
                                            <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#ef4444" strokeWidth="10" strokeDasharray={`${strokeRej} ${circum}`} strokeDashoffset={`-${strokeApp + strokePend}`} />
                                          </svg>
                                          <div className="absolute text-center">
                                            <span className="text-sm font-black tracking-tight">{totalQCount}</span>
                                            <span className="text-[7px] text-zinc-400 block font-bold uppercase leading-none">Total</span>
                                          </div>
                                        </div>

                                        <div className="flex-grow space-y-1.5 text-xs">
                                          <div className="flex items-center gap-2 justify-between">
                                            <span className="flex items-center gap-1.5 text-zinc-500 font-bold text-[11px]">
                                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                              <span>Aprovados</span>
                                            </span>
                                            <span className="font-mono font-black">{appCount} <em className="text-zinc-500 font-normal text-[10px] NOT-italic">({appPct}%)</em></span>
                                          </div>
                                          <div className="flex items-center gap-2 justify-between">
                                            <span className="flex items-center gap-1.5 text-zinc-500 font-bold text-[11px]">
                                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                              <span>Pendentes</span>
                                            </span>
                                            <span className="font-mono font-black">{pendCount} <em className="text-zinc-550 font-normal text-[10px] NOT-italic">({pendPct}%)</em></span>
                                          </div>
                                          <div className="flex items-center gap-2 justify-between">
                                            <span className="flex items-center gap-1.5 text-zinc-500 font-bold text-[11px]">
                                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                              <span>Cancelados</span>
                                            </span>
                                            <span className="font-mono font-black">{rejCount} <em className="text-zinc-550 font-normal text-[10px] NOT-italic">({rejPct}%)</em></span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  
                                  <div className="border-t pt-2.5 dark:border-zinc-800 space-y-1 text-[10px] text-zinc-400">
                                    <span className="font-bold uppercase tracking-wider block">Eficiência de Fechamento</span>
                                    <p className="leading-snug">
                                      {Number(conversionRate) > 50 
                                        ? "🔥 Conversão acima de 50%. Parabéns! Estratégias comerciais de conversão do CalhaZap funcionando."
                                        : "🛠️ Conversão abaixo de 50%. Sugestão: Incentivar lembretes e followups automáticos pós-orçamento."
                                      }
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>

                          {/* INTERACTIVE COMPREHENSIVE RECORDS LIST */}
                          <div className={`p-5 rounded-3xl border space-y-4 shadow-sm ${
                            darkMode ? 'bg-zinc-900/40 border-zinc-850' : 'bg-white border-zinc-150'
                          }`}>
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b dark:border-zinc-850 pb-3">
                              <div className="space-y-0.5">
                                <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 leading-none">
                                  🔎 Lista Detalhada dos Orçamentos de Todas as Oficinas
                                </h4>
                                <span className="text-[10px] text-zinc-500 font-semibold block">Explorador unificado em tempo real</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                <div className="relative shadow-xs rounded-xl flex-grow sm:flex-none">
                                  <input 
                                    type="text"
                                    value={adminSearchQuery}
                                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                                    placeholder="Buscar por cliente ou empresa..."
                                    className={`w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs rounded-xl font-semibold border focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                      darkMode ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                                    }`}
                                  />
                                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
                                </div>

                                <select
                                  value={selectedAdminCompanyFilter}
                                  onChange={(e) => setSelectedAdminCompanyFilter(e.target.value)}
                                  className={`text-xs px-2.5 py-1.5 rounded-xl border font-bold bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                                    darkMode ? 'border-zinc-800 text-white' : 'border-zinc-200 text-zinc-700'
                                  }`}
                                >
                                  <option value="all">Todas as Empresas</option>
                                  {allCompanies.map(c => (
                                    <option key={c.uid} value={c.uid}>{c.name || "Oficina s/ nome"}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-[11px] font-semibold">
                                <thead>
                                  <tr className="border-b border-zinc-150 dark:border-zinc-850 text-zinc-400 text-[9px] uppercase font-black tracking-wider text-stone-500 dark:text-zinc-500">
                                    <th className="py-2">Código / Ref</th>
                                    <th className="py-2">Oficina Parceira</th>
                                    <th className="py-2">Cliente</th>
                                    <th className="py-1 text-right">Preço Final</th>
                                    <th className="py-2 text-center">Status</th>
                                    <th className="py-2 text-right pr-2">Ações</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-zinc-800 dark:text-zinc-200">
                                  {(() => {
                                    const filtered = allQuotes.filter(q => {
                                      const matchesCompany = selectedAdminCompanyFilter === 'all' || q.companyUid === selectedAdminCompanyFilter;
                                      const cName = (q.customerName || '').toLowerCase();
                                      const qId = (q.id || '').toLowerCase();
                                      const compDetails = allCompanies.find(c => c.uid === q.companyUid);
                                      const compName = (compDetails?.name || '').toLowerCase();

                                      const matchesSearch = !adminSearchQuery || 
                                        cName.includes(adminSearchQuery.toLowerCase()) || 
                                        qId.includes(adminSearchQuery.toLowerCase()) || 
                                        compName.includes(adminSearchQuery.toLowerCase());

                                      return matchesCompany && matchesSearch;
                                    });

                                    if (filtered.length === 0) {
                                      return (
                                        <tr>
                                          <td colSpan={6} className="py-8 text-center text-zinc-400 font-bold select-none">
                                            Nenhuma proposta corresponde aos parâmetros de pesquisa filtrados.
                                          </td>
                                        </tr>
                                      );
                                    }

                                    return filtered.slice(0, 50).map((q) => {
                                      const comp = allCompanies.find(c => c.uid === q.companyUid);
                                      const qTotal = Number(q.total || q.valorTotal || q.subtotal || 0);

                                      return (
                                        <tr key={q.id} className="hover:bg-stone-50 dark:hover:bg-zinc-900/30 transition-colors">
                                          <td className="py-3 font-mono font-black text-amber-500">{q.id}</td>
                                          <td className="py-3 pr-2">
                                            <div className="leading-tight">
                                              <span className="block font-black text-zinc-800 dark:text-zinc-200">{comp?.name || "Oficina Conectada"}</span>
                                              <span className="text-[10px] text-zinc-500 font-semibold block truncate max-w-[130px]">{comp?.phone || "S/ contato"}</span>
                                            </div>
                                          </td>
                                          <td className="py-3">
                                            <div className="leading-tight text-[11px] font-bold">
                                              <span className="block font-black text-zinc-850 dark:text-zinc-100">{q.customerName}</span>
                                              <span className="text-[10px] text-zinc-400 block truncate max-w-[120px]">{q.customerAddress || "S/ endereço"}</span>
                                            </div>
                                          </td>
                                          <td className="py-3 text-right font-mono font-black text-emerald-500">
                                            {qTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                          </td>
                                          <td className="py-3 text-center">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                                              q.status === 'aprovado' 
                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                                                : q.status === 'cancelado' || q.status === 'rejeitado'
                                                  ? 'bg-red-500/15 text-red-500 border border-red-500/20'
                                                  : 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                                            }`}>
                                              {q.status || 'pendente'}
                                            </span>
                                          </td>
                                          <td className="py-3 text-right">
                                            <button
                                              onClick={() => {
                                                setSelectedQuoteForPdf(q);
                                                setShowWhatsAppPdfHelper(true);
                                              }}
                                              className="p-1 px-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-450 hover:text-slate-950 rounded text-[9px] font-bold text-zinc-500 transition cursor-pointer"
                                              title="Auxiliar envio PDF"
                                            >
                                              Análise PDF
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    });
                                  })()}
                                </tbody>
                              </table>
                            </div>
                          </div>

                        </div>
                      );
                    })()}

                  </div>
                )}

              </div>

              {/* PERSISTENT MOBILE BOTTOM NAVIGATION TAB BAR (Exactly matching screen layouts) */}
              <div className={`sticky bottom-0 left-0 w-full px-5 py-2.5 flex justify-between items-center z-30 shrink-0 border-t ${
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

                {/* 6. Admin Panel tab (Exclusive to Administrators) */}
                {isAdmin && (
                  <button 
                    onClick={() => {
                      setSelectedCalc(null);
                      setViewportTab('admin');
                    }}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition select-none ${
                      viewportTab === 'admin' ? 'text-red-500 font-extrabold animate-pulse' : 'text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    <SquareTerminal className="w-5 h-5 stroke-[2.2] text-red-500" />
                    <span className="text-[9px] font-extrabold tracking-wide text-red-500">Painel ADM</span>
                  </button>
                )}
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

      {/* WHATSAPP PDF GUIDE HELPER DIALOG MODAL */}
      {showWhatsAppPdfHelper && selectedQuoteForPdf && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5 shadow-2xl relative animate-scale-up text-zinc-900 dark:text-white my-8">
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider">Passo a Passo</span>
                  <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold font-mono">💬 WhatsApp PDF</span>
                </div>
                <h4 className="text-base font-black tracking-tight leading-tight uppercase">Enviar PDF do Orçamento direto para o WhatsApp</h4>
              </div>
              <button 
                onClick={() => {
                  setShowWhatsAppPdfHelper(false);
                  setSelectedQuoteForPdf(null);
                }} 
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quote details banner */}
            <div className="p-3 bg-stone-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-850/50 space-y-1.5 text-xs">
              <div className="text-zinc-500 font-mono flex justify-between">
                <span>Identificação do Orçamento:</span>
                <span className="font-bold text-[#d97706]">{selectedQuoteForPdf.id}</span>
              </div>
              <div className="text-zinc-500 font-mono flex justify-between">
                <span>Cliente Responsável:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedQuoteForPdf.customerName}</span>
              </div>
              {selectedQuoteForPdf.customerPhone && (
                <div className="text-zinc-500 font-mono flex justify-between">
                  <span>Contato WhatsApp:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedQuoteForPdf.customerPhone}</span>
                </div>
              )}
            </div>

            {/* Instruction Steps */}
            <div className="space-y-4 pt-1">
              
              {/* Step 1 */}
              <div className="flex gap-3 px-1 items-start">
                <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 select-none">
                  1
                </div>
                <div className="space-y-1.5 flex-1">
                  <h5 className="font-bold text-xs uppercase tracking-wider">Gerar e Baixar o PDF Oficial</h5>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                    Clique no botão abaixo para gerar o orçamento em papel timbrado. No celular ou computador, escolha a opção <strong className="text-zinc-800 dark:text-zinc-100 font-bold">"Salvar como PDF"</strong> ou <strong className="text-zinc-800 dark:text-zinc-100 font-bold">"Imprimir como PDF"</strong> e salve o documento.
                  </p>
                  <button
                    onClick={() => handleDirectPrintReprnt(selectedQuoteForPdf)}
                    className="py-2.5 px-3.5 bg-zinc-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-750 text-amber-400 rounded-xl transition text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md inline-flex border border-zinc-700/60"
                  >
                    <Printer className="w-3.5 h-3.5 shrink-0" />
                    <span>Salvar arquivo PDF</span>
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 px-1 items-start">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs shrink-0 select-none">
                  2
                </div>
                <div className="space-y-1.5 flex-1">
                  <h5 className="font-bold text-xs uppercase tracking-wider">Enviar PDF no Zap do Cliente</h5>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                    Clique no botão abaixo para abrir a conversa direta com o cliente. No WhatsApp, use o botão de <strong className="text-[#25d366] font-bold">Adicionar Anexo (+ ou clipe)</strong> e selecione o PDF que você acabou de baixar no Passo 1!
                  </p>
                  <a
                    href={`https://api.whatsapp.com/send?phone=${(selectedQuoteForPdf.customerPhone || '').replace(/\D/g, '').startsWith('55') ? (selectedQuoteForPdf.customerPhone || '').replace(/\D/g, '') : '55' + (selectedQuoteForPdf.customerPhone || '').replace(/\D/g, '')}&text=${encodeURIComponent(`Olá! Estou te enviando o arquivo PDF do orçamento oficial Ref: ${selectedQuoteForPdf.id} em anexo abaixo.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md inline-flex"
                  >
                    <Send className="w-3.5 h-3.5 shrink-0" />
                    <span>Abrir Conversa do WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Platform Constraints Explanation */}
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-normal border-t dark:border-zinc-800 pt-3 flex gap-1.5 items-start">
              <span className="shrink-0 text-amber-500">⚠️</span>
              <span className="font-normal font-mono">
                Aviso: O WhatsApp não permite que sites enviem arquivos locais diretamente por razões de privacidade. É necessário primeiro salvar o PDF em seu aparelho (Passo 1), para depois anexá-lo na conversa (Passo 2).
              </span>
            </p>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button 
                onClick={() => {
                  setShowWhatsAppPdfHelper(false);
                  setSelectedQuoteForPdf(null);
                }}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl transition uppercase tracking-wider cursor-pointer"
              >
                Concluir e Voltar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
