
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { 
  Users, QrCode, DollarSign, Utensils, FileText, 
  LayoutDashboard, Settings, LogOut, Building2, Briefcase, Bell, CreditCard,
  CalendarDays, Banknote, HeartHandshake, ChevronDown, Plus, Globe, Settings2,
  ShieldAlert, Lock, AlertTriangle, Info, MessageCircle
} from 'lucide-react';
import { UserRole, Terreiro, MediumProfile, MembershipStatus, SubscriptionStatus, SubscriptionData } from './types';

// Components
import Dashboard from './components/Dashboard';
import MediumsList from './components/MediumsList';
import FinanceView from './components/FinanceView';
import CantinaView from './components/CantinaView';
import AttendanceView from './components/AttendanceView';
import DocumentsView from './components/DocumentsView';
import AdminManagementView from './components/AdminManagementView';
import MediumFichaForm from './components/MediumFichaForm';
import LoginMock from './components/LoginMock';
import SetupWizard from './components/SetupWizard';
import AdminView from './components/AdminView';
import MonthlyFeesView from './components/MonthlyFeesView';
import AgendaView from './components/AgendaView';
import DonationsView from './components/DonationsView';
import UnidadesView from './components/UnidadesView';
import SettingsView from './components/SettingsView';
import SubscriptionView from './components/SubscriptionView';

const App: React.FC = () => {
  const [user, setUser] = useState<MediumProfile | null>(null);
  const [activeTerreiro, setActiveTerreiro] = useState<Terreiro | null>(null);
  const [myTerreiros, setMyTerreiros] = useState<Terreiro[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMediumId, setSelectedMediumId] = useState<string | null>(null);
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  // Simulação de banco de dados para demonstrar isolamento
  const [allMediums, setAllMediums] = useState<MediumProfile[]>([]);

  const isMaster = user?.role === UserRole.MASTER;

  useEffect(() => {
    const savedUser = localStorage.getItem('ase_user');
    const savedActiveTerreiro = localStorage.getItem('ase_active_terreiro_id');
    const savedTerreiros = localStorage.getItem('ase_my_terreiros');

    if (savedUser) setUser(JSON.parse(savedUser));
    
    if (savedTerreiros) {
      const list = JSON.parse(savedTerreiros);
      setMyTerreiros(list);
      
      if (savedActiveTerreiro) {
        const found = list.find((t: Terreiro) => t.id === savedActiveTerreiro);
        if (found) setActiveTerreiro(found);
        else setActiveTerreiro(list[0]);
      } else if (list.length > 0) {
        setActiveTerreiro(list[0]);
      }
    }
  }, []);

  // Sincronizar assinatura e cálculo de status dinâmico
  useEffect(() => {
    if (activeTerreiro) {
      const tId = activeTerreiro.id;
      const savedSub = localStorage.getItem(`ase_subscription_${tId}`);
      let subData: SubscriptionData;

      if (savedSub) {
        subData = JSON.parse(savedSub);
      } else {
        // Mock default sub for new terreiro
        subData = {
          terreiroId: tId,
          status: SubscriptionStatus.ACTIVE,
          plan: 'CASA_DIGITAL',
          price: 79.00,
          expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 dias de trial
        };
      }

      // Cálculo de Status baseado na data
      const now = new Date();
      const expiry = new Date(subData.expiresAt);
      const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);

      let newStatus = SubscriptionStatus.ACTIVE;
      if (diffDays <= 0) {
        if (diffDays <= -5) newStatus = SubscriptionStatus.BLOCKED;
        else newStatus = SubscriptionStatus.OVERDUE;
      } else if (diffDays <= 7) {
        newStatus = SubscriptionStatus.EXPIRING;
      }

      if (subData.status !== newStatus) {
        subData.status = newStatus;
        localStorage.setItem(`ase_subscription_${tId}`, JSON.stringify(subData));
      }

      setSubscription(subData);
      
      // Se estiver bloqueado, força a aba de assinatura apenas para Masters
      if (newStatus === SubscriptionStatus.BLOCKED && activeTab !== 'subscription') {
        setActiveTab('subscription');
      }
    }
  }, [activeTerreiro, activeTab]);

  // Sincronizar médiuns quando o terreiro ativo mudar
  useEffect(() => {
    if (activeTerreiro) {
      const tId = activeTerreiro.id;
      const savedMediums = localStorage.getItem(`ase_mediums_${tId}`);
      if (savedMediums) {
        setAllMediums(JSON.parse(savedMediums));
      } else {
        const initialMediums = [
          { id: `U-${tId}-1`, terreiroId: tId, fullName: 'Membro Fundador', role: UserRole.MEDIUM, status: MembershipStatus.ACTIVE, email: 'fundador@ase.com', paiOrixa: 'Orixá', balance: 0, entryDate: new Date().toISOString().split('T')[0], monthlyFeeValue: 50, photo: 'https://i.pravatar.cc/150?u=saas' } as MediumProfile,
        ];
        setAllMediums(initialMediums);
        localStorage.setItem(`ase_mediums_${tId}`, JSON.stringify(initialMediums));
      }
      localStorage.setItem('ase_active_terreiro_id', tId);
    }
  }, [activeTerreiro]);

  const getSubBanner = useMemo(() => {
    if (!subscription || !isMaster) return null;
    const s = subscription.status;
    if (s === SubscriptionStatus.EXPIRING) {
      return (
        <div className="bg-amber-500 text-stone-900 px-8 py-2.5 flex items-center justify-between text-xs font-black uppercase tracking-widest no-print">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} />
            <span>Assinatura vence em breve ({new Date(subscription.expiresAt).toLocaleDateString()}). Renove agora para evitar bloqueio.</span>
          </div>
          <button onClick={() => setActiveTab('subscription')} className="bg-stone-900 text-white px-4 py-1.5 rounded-lg hover:bg-stone-800 transition-all">Renovar</button>
        </div>
      );
    }
    if (s === SubscriptionStatus.OVERDUE) {
      return (
        <div className="bg-rose-500 text-white px-8 py-2.5 flex items-center justify-between text-xs font-black uppercase tracking-widest no-print">
          <div className="flex items-center gap-3">
            <ShieldAlert size={18} className="animate-pulse" />
            <span>Assinatura atrasada! Bloqueio automático em 5 dias. regularize seu acesso.</span>
          </div>
          <button onClick={() => setActiveTab('subscription')} className="bg-white text-rose-600 px-4 py-1.5 rounded-lg hover:bg-stone-100 transition-all">Pagar Agora</button>
        </div>
      );
    }
    if (s === SubscriptionStatus.BLOCKED) {
      return (
        <div className="bg-rose-600 text-white px-8 py-3 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest no-print">
          <Lock size={18} />
          <span>Sua conta está BLOQUEADA por falta de pagamento. Acesse o módulo assinatura para liberar.</span>
        </div>
      );
    }
    return null;
  }, [subscription, isMaster]);

  const handleSwitchTerreiro = (t: Terreiro) => {
    setActiveTerreiro(t);
    setShowUnitSelector(false);
    setActiveTab('dashboard');
    setSelectedMediumId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('ase_user');
    localStorage.removeItem('ase_active_terreiro_id');
    setUser(null);
    setActiveTerreiro(null);
    setActiveTab('dashboard');
  };

  if (!activeTerreiro && myTerreiros.length === 0) {
    return <SetupWizard onComplete={(t, u) => {
      const terreiros = [t];
      setMyTerreiros(terreiros);
      setActiveTerreiro(t);
      setUser(u);
      localStorage.setItem('ase_my_terreiros', JSON.stringify(terreiros));
      localStorage.setItem('ase_user', JSON.stringify(u));
      localStorage.setItem('ase_active_terreiro_id', t.id);
    }} />;
  }

  if (!user) {
    return <LoginMock terreiro={activeTerreiro!} onLogin={(u) => {
      setUser(u);
      localStorage.setItem('ase_user', JSON.stringify(u));
    }} />;
  }

  const isBlocked = subscription?.status === SubscriptionStatus.BLOCKED;
  const filteredMediums = allMediums.filter(m => m.terreiroId === activeTerreiro?.id);

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard, roles: [UserRole.MASTER, UserRole.MEDIUM], blocked: true },
    { id: 'agenda', label: 'Agenda', icon: CalendarDays, roles: [UserRole.MASTER, UserRole.MEDIUM], blocked: true },
    { id: 'ficha', label: isMaster ? 'Médiuns' : 'Minha Ficha', icon: Users, roles: [UserRole.MASTER, UserRole.MEDIUM], blocked: true },
    { id: 'attendance', label: 'Presença QR', icon: QrCode, roles: [UserRole.MASTER, UserRole.MEDIUM], blocked: true },
    { id: 'fees', label: 'Mensalidades', icon: Banknote, roles: [UserRole.MASTER], blocked: true },
    { id: 'donations', label: 'Doações', icon: HeartHandshake, roles: [UserRole.MASTER, UserRole.MEDIUM], blocked: true },
    { id: 'finance', label: 'Financeiro', icon: DollarSign, roles: [UserRole.MASTER], blocked: true },
    { id: 'admin', label: 'Administrativo', icon: Briefcase, roles: [UserRole.MASTER], blocked: true },
    { id: 'unidades', label: 'Unidades SaaS', icon: Globe, roles: [UserRole.MASTER], blocked: true },
    { id: 'settings_terreiro', label: 'Configurações', icon: Settings2, roles: [UserRole.MASTER], blocked: true },
    { id: 'subscription', label: 'Assinatura', icon: CreditCard, roles: [UserRole.MASTER], blocked: false },
    { id: 'cantina', label: 'Cantina', icon: Utensils, roles: [UserRole.MASTER], blocked: true },
    { id: 'documents', label: 'Documentos', icon: FileText, roles: [UserRole.MASTER, UserRole.MEDIUM], blocked: true },
  ].filter(item => item.roles.includes(user.role));

  const renderContent = () => {
    // Se bloqueado, apenas Masters veem a tela de Assinatura. Outros veem tela de bloqueio.
    if (isBlocked && activeTab !== 'subscription') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in">
           <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[3rem] flex items-center justify-center shadow-xl">
             <Lock size={48} />
           </div>
           <div>
             <h2 className="text-3xl font-black text-stone-900 tracking-tighter">Acesso Suspenso</h2>
             <p className="text-stone-500 max-w-sm mx-auto font-medium mt-2">
               A assinatura do {activeTerreiro?.name} está bloqueada por falta de pagamento. 
               Entre em contato com o administrador da casa.
             </p>
           </div>
           {isMaster ? (
             <button 
               onClick={() => setActiveTab('subscription')}
               className="bg-stone-900 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all"
             >
               Ir para Pagamento
             </button>
           ) : (
            <div className="flex gap-4">
               <button className="bg-stone-100 text-stone-900 px-8 py-3 rounded-xl font-bold flex items-center gap-2">
                 <MessageCircle size={18} /> Falar com Suporte
               </button>
            </div>
           )}
        </div>
      );
    }

    if (selectedMediumId) {
      return (
        <MediumFichaForm 
          mediumId={selectedMediumId} 
          currentUserId={user.id}
          isMaster={isMaster}
          onBack={() => setSelectedMediumId(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard mediums={filteredMediums} terreiro={activeTerreiro!} onNavigate={setActiveTab} />;
      case 'agenda': return <AgendaView user={user} mediums={filteredMediums} />;
      case 'ficha': 
        return isMaster 
          ? <MediumsList mediums={filteredMediums} onSelectMedium={setSelectedMediumId} /> 
          : <MediumFichaForm mediumId={user.id} currentUserId={user.id} isMaster={false} />;
      case 'attendance': return <AttendanceView user={user} />;
      case 'fees': return <MonthlyFeesView user={user} mediums={filteredMediums} />;
      case 'donations': return <DonationsView user={user} terreiro={activeTerreiro!} />;
      case 'finance': return <FinanceView user={user} mediums={filteredMediums} />;
      case 'admin': return <AdminView userRole={user.role} onBack={() => setActiveTab('dashboard')} />;
      case 'unidades': return (
        <UnidadesView 
          activeTerreiro={activeTerreiro!} 
          terreiros={myTerreiros} 
          onSwitch={handleSwitchTerreiro}
          onUpdateList={(newList) => {
            setMyTerreiros(newList);
            localStorage.setItem('ase_my_terreiros', JSON.stringify(newList));
          }}
        />
      );
      case 'settings_terreiro': return <SettingsView user={user} mediums={filteredMediums} terreiro={activeTerreiro!} />;
      case 'subscription': return <SubscriptionView terreiro={activeTerreiro!} onUpdate={() => setSubscription({...subscription!} )} />;
      case 'cantina': return <CantinaView />;
      case 'documents': return <DocumentsView />;
      default: return <Dashboard mediums={filteredMediums} terreiro={activeTerreiro!} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden font-sans">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-stone-900 transition-all duration-300 flex flex-col z-20`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center font-black text-stone-900 shadow-lg shadow-amber-500/20">AD</div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-tight">Asé Digital</span>
              <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">SaaS Edition</span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const blockedIcon = isBlocked && item.blocked;
            return (
              <button
                key={item.id}
                disabled={blockedIcon}
                onClick={() => { setActiveTab(item.id); setSelectedMediumId(null); }}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-amber-500 text-stone-900 shadow-lg shadow-amber-500/20 font-bold' 
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                } ${blockedIcon ? 'opacity-20 grayscale cursor-not-allowed' : ''}`}
              >
                <item.icon size={20} />
                {isSidebarOpen && (
                  <span className="flex-1 text-left text-sm flex items-center justify-between">
                    {item.label}
                    {blockedIcon && <Lock size={12} />}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-800 space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-bold text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {getSubBanner}
        <header className="h-20 bg-white border-b border-stone-200 px-8 flex items-center justify-between z-30 shrink-0">
          <div className="relative">
            <button 
              onClick={() => isMaster && setShowUnitSelector(!showUnitSelector)}
              className={`flex items-center gap-4 group ${isMaster ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-amber-500">
                <Building2 size={20} />
              </div>
              <div className="text-left">
                <span className="text-stone-400 text-[9px] font-black uppercase tracking-widest block">Unidade Ativa</span>
                <div className="flex items-center gap-2">
                  <span className="text-stone-900 font-black text-lg tracking-tight">{activeTerreiro?.name}</span>
                  {isMaster && <ChevronDown size={16} className={`text-stone-400 transition-transform ${showUnitSelector ? 'rotate-180' : ''}`} />}
                </div>
              </div>
            </button>

            {showUnitSelector && (
              <div className="absolute top-full left-0 mt-4 w-72 bg-white rounded-3xl shadow-2xl border border-stone-100 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-4 mb-3">Alternar Terreiro</p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {myTerreiros.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleSwitchTerreiro(t)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                        activeTerreiro?.id === t.id 
                          ? 'bg-amber-500 text-stone-900 font-black' 
                          : 'hover:bg-stone-50 text-stone-600 font-bold'
                      }`}
                    >
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            {subscription?.status !== SubscriptionStatus.ACTIVE && isMaster && (
              <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border animate-pulse ${
                subscription?.status === SubscriptionStatus.BLOCKED ? 'bg-rose-600 text-white border-rose-700' : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                <ShieldAlert size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{subscription?.status === SubscriptionStatus.BLOCKED ? 'SISTEMA BLOQUEADO' : 'Assinatura Irregular'}</span>
              </div>
            )}
            <button className="relative p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
               <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-stone-900 font-black">
                 {user.fullName.charAt(0)}
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-stone-50/50">
          <div className="max-w-6xl mx-auto pb-20">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            }>
              {renderContent()}
            </Suspense>
          </div>
        </div>
      </main>
      
      {showUnitSelector && (
        <div className="fixed inset-0 z-20" onClick={() => setShowUnitSelector(false)}></div>
      )}
    </div>
  );
};

export default App;
