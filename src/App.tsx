import React, { useState, useEffect, useRef } from 'react';
import { 
  INITIAL_TENANTS, INITIAL_SERVICES, INITIAL_PRODUCTS, 
  INITIAL_COLLABORATORS, INITIAL_APPOINTMENTS, INITIAL_SALES, 
  INITIAL_WHATSAPP_LOGS 
} from './mockData';
import { TenantConfig, Service, Product, Collaborator, Appointment, Sale, WhatsAppLog, ClientComment } from './types';
import Header from './components/Header';
import PublicPage from './components/PublicPage';
import AdminDashboard from './components/AdminDashboard';
import { Sparkles, Compass, Shield, X, ShieldAlert, Fingerprint, QrCode } from 'lucide-react';
import * as cloud from './lib/cloud';

// Molde CyC: con que arranca un inquilino nuevo (licencia real) la primera vez.
// Un ejemplo marcado de cada uno, para editar o borrar.
const EJEMPLO_SERVICES: Service[] = [{
  id: 'svc-ejemplo', name: 'Servicio de ejemplo (edita o borra)', category: 'Ejemplos',
  duration: 60, price: 0,
  description: 'Este es un servicio de ejemplo. Editalo con tus datos o eliminalo.',
  customFields: [],
}];
const EJEMPLO_PRODUCTS: Product[] = [{
  id: 'prod-ejemplo', name: 'Producto de ejemplo (edita o borra)',
  description: 'Producto de ejemplo. Editalo con tus datos o eliminalo.',
  price: 0, stock: 0, images: [], customFields: [],
}];
const EJEMPLO_COLABS: Collaborator[] = [{
  id: 'col-ejemplo', name: 'Colaborador de ejemplo', role: 'Edita o borra',
  avatar: '', specialties: [], commissionRate: 0, rating: 5,
  schedule: { days: [], hours: '09:00 - 18:00' }, presenceStatus: 'offline',
}];

export default function App() {
  // Global States
  const [tenants, setTenants] = useState<TenantConfig[]>(() => {
    const saved = localStorage.getItem('aura_tenants');
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });
  const [currentTenantId, setCurrentTenantId] = useState<string>('soho-chic');
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [products, setProducts] = useState<Product[]>(() => {
    // initialize products with views count and semaphore
    const initialWithViews = INITIAL_PRODUCTS.map(p => ({
      ...p,
      viewsCount: p.viewsCount || Math.floor(Math.random() * 25) + 2,
      viewsSemaphore: p.viewsSemaphore || (Math.random() > 0.5 ? 'green' : 'yellow'),
      isLastAvailable: p.isLastAvailable ?? false,
      lastAvailableText: p.lastAvailableText || '¡Últimos disponibles!',
      barcode: p.barcode || (p.id === 'prod-serum' ? '7791234567890' : '7799876543210')
    }));
    return initialWithViews;
  });
  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLog[]>(INITIAL_WHATSAPP_LOGS);
  
  // CyC Session and Interface States
  const [session, setSession] = useState<{ role: 'admin' | 'collaborator'; name: string; licenseCode: string; collaboratorId?: string } | null>(null);
  const [isViewingPanel, setIsViewingPanel] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; email: string; text: string; date: string }[]>([
    { id: 'sug-1', name: 'Zendaya C.', email: 'zendaya@daya.com', text: '¡Me encantó el servicio de Hidratación Gold! Muy profesionales.', date: '2026-07-10' },
    { id: 'sug-2', name: 'Julianne M.', email: 'julianne@gmail.com', text: 'La atención de Marcus es de otro planeta. Recomiendo el Balayage.', date: '2026-07-12' }
  ]);
  const [comments, setComments] = useState<ClientComment[]>(() => {
    const saved = localStorage.getItem('aura_comments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'comm-1',
        tenantId: 'soho-chic',
        name: 'Julianne Moore',
        rating: 5,
        text: 'La coloración de autor es increíble. Marcus realmente entendió lo que quería y el color duró semanas. ¡Altamente recomendado!',
        date: '2026-07-10',
        approved: true,
      },
      {
        id: 'comm-2',
        tenantId: 'soho-chic',
        name: 'Sarah Jessica P.',
        rating: 5,
        text: 'El espacio de Soho es súper sofisticado y de primer nivel. Un oasis de lujo en pleno Manhattan.',
        date: '2026-07-12',
        approved: true,
      },
      {
        id: 'comm-3',
        tenantId: 'soho-chic',
        name: 'Valeria P.',
        rating: 4,
        text: 'Excelente la manicuría de lujo. El trato es impecable, aunque a veces es difícil conseguir cita los sábados.',
        date: '2026-07-13',
        approved: false,
      },
      {
        id: 'comm-4',
        tenantId: 'bell-1234',
        name: 'Clara G.',
        rating: 5,
        text: 'Me encantó el tratamiento facial. ¡Mi piel brilla como nunca!',
        date: '2026-07-11',
        approved: true,
      }
    ];
  });
  const [retiroOrders, setRetiroOrders] = useState<{ id: string; clientName: string; clientPhone: string; items: { name: string; price: number; type: string }[]; total: number; code: string; date: string; status: 'pending' | 'completed' | 'cancelled' }[]>([]);

  // Biometria
  const [savedBiometry, setSavedBiometry] = useState<boolean>(() => {
    return localStorage.getItem('aura_biometry_active') === 'true';
  });

  // Navigation role switcher (Client vs Backoffice) - kept for compatibility
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Resolve current active tenant configurations
  const currentTenant = tenants.find(t => t.id === currentTenantId) || tenants[0];

  // ---- Molde CyC: sincronizacion con la nube (best-effort, no rompe el flujo local) ----
  const cloudReady = useRef(false);
  useEffect(() => {
    if (session && session.role === 'admin' && session.licenseCode) {
      const codigo = session.licenseCode;
      cloudReady.current = false;
      (async () => {
        try {
          const data = await cloud.cloudLoad(codigo);
          if (data && Object.keys(data).length) {
            if (data.tenants) setTenants(data.tenants as any);
            if (data.services) setServices(data.services as any);
            if (data.products) setProducts(data.products as any);
            if (data.collaborators) setCollaborators(data.collaborators as any);
            if (data.appointments) setAppointments(data.appointments as any);
            if (data.sales) setSales(data.sales as any);
            if (data.comments) setComments(data.comments as any);
            if (data.suggestions) setSuggestions(data.suggestions as any);
            if (data.retiroOrders) setRetiroOrders(data.retiroOrders as any);
            if (data.whatsappLogs) setWhatsappLogs(data.whatsappLogs as any);
          } else {
            // Primera activacion: si es una licencia real (no un local demo), arranca con un ejemplo de cada.
            const esDemo = INITIAL_TENANTS.some((t) => t.id.toLowerCase() === codigo.toLowerCase());
            if (!esDemo) {
              setServices(EJEMPLO_SERVICES);
              setProducts(EJEMPLO_PRODUCTS);
              setCollaborators(EJEMPLO_COLABS);
              setAppointments([]); setSales([]); setComments([]); setSuggestions([]); setRetiroOrders([]); setWhatsappLogs([]);
            }
          }
        } catch (e) { /* offline: sigue en local */ }
        cloudReady.current = true;
      })();
    } else {
      cloudReady.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (!(session && session.role === 'admin' && session.licenseCode)) return;
    if (!cloudReady.current) return;
    const codigo = session.licenseCode;
    const t = setTimeout(() => {
      cloud.cloudSave(codigo, { tenants, services, products, collaborators, appointments, sales, comments, suggestions, retiroOrders, whatsappLogs } as any);
    }, 1500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenants, services, products, collaborators, appointments, sales, comments, suggestions, retiroOrders, whatsappLogs, session]);

  // Molde CyC: pagina publica por inquilino via ?codigo= (lo que abre el QR/link)
  useEffect(() => {
    const codigo = new URLSearchParams(window.location.search).get('codigo');
    if (!codigo) return;
    (async () => {
      try {
        const data = await cloud.auraPublica(codigo.trim());
        if (data) {
          if (data.tenants && (data.tenants as any).length) setTenants(data.tenants as any);
          if (data.services) setServices(data.services as any);
          if (data.products) setProducts(data.products as any);
          if (data.comments) setComments(data.comments as any);
          setCurrentTenantId(codigo.trim());
        }
      } catch (e) { /* si falla, muestra el local por defecto */ }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- HANDLER CALLBACKS ---

  const handleTenantChange = (tenantId: string) => {
    setCurrentTenantId(tenantId);
  };

  const handleUpdateTenant = (updatedTenant: TenantConfig) => {
    setTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
  };

  const handleAddService = (newService: Service) => {
    setServices(prev => [newService, ...prev]);
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleAddCollaborator = (newCol: Collaborator) => {
    setCollaborators(prev => [newCol, ...prev]);
  };

  const handleDeleteCollaborator = (colId: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== colId));
  };

  // Registers a client booking, adds to appointment list, writes a Stripe sale entry, and logs an automated WhatsApp reminder
  const handleNewBooking = (bookingData: Omit<Appointment, 'id'>) => {
    const bookingId = `apt-${Date.now()}`;
    const newApt: Appointment = {
      ...bookingData,
      id: bookingId
    };

    // Append appointment
    setAppointments(prev => [newApt, ...prev]);

    // Resolve details for Sales Ledger
    const matchedService = services.find(s => s.id === bookingData.serviceId);
    const serviceName = matchedService?.name || 'Servicio Personalizado';
    const matchedCol = collaborators.find(c => c.id === bookingData.collaboratorId);
    const colName = matchedCol?.name || 'Marcus Stone';

    const newSale: Sale = {
      id: `sal-${Date.now()}`,
      date: bookingData.date,
      itemType: 'service',
      itemId: bookingData.serviceId,
      itemName: serviceName,
      collaboratorId: bookingData.collaboratorId,
      collaboratorName: colName,
      amount: bookingData.price,
      paymentMethod: 'Stripe'
    };

    // Append sale
    setSales(prev => [newSale, ...prev]);

    // Build automated WhatsApp reminder log using tenant's template config
    const rawTemplate = currentTenant.whatsapp.templateConfirmed;
    const compiledMsg = rawTemplate
      .replace('{{clientName}}', bookingData.clientName)
      .replace('{{serviceName}}', serviceName)
      .replace('{{collaboratorName}}', colName)
      .replace('{{date}}', bookingData.date)
      .replace('{{time}}', bookingData.time);

    const newWaLog: WhatsAppLog = {
      id: `wl-${Date.now()}`,
      recipient: bookingData.clientPhone,
      clientName: bookingData.clientName,
      message: compiledMsg,
      timestamp: new Date().toISOString(),
      status: 'delivered'
    };

    // Append WhatsApp log
    setWhatsappLogs(prev => [newWaLog, ...prev]);
  };

  // Registers a product purchase, deducts product inventory, writes a Stripe sale entry, and logs WhatsApp notification
  const handleNewProductSale = (productId: string, productName: string, price: number, collaboratorId: string) => {
    // Deduct stock
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, stock: Math.max(0, p.stock - 1) };
      }
      return p;
    }));

    const matchedCol = collaborators.find(c => c.id === collaboratorId);
    const colName = matchedCol?.name || 'Sasha Grey';

    // Append Sale
    const newSale: Sale = {
      id: `sal-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      itemType: 'product',
      itemId: productId,
      itemName: productName,
      collaboratorId: collaboratorId,
      collaboratorName: colName,
      amount: price,
      paymentMethod: 'Stripe'
    };
    setSales(prev => [newSale, ...prev]);

    // Append WhatsApp Log
    const newWaLog: WhatsAppLog = {
      id: `wl-${Date.now()}`,
      recipient: currentTenant.phone,
      clientName: 'Cliente Premium',
      message: `💎 Aura NY / ${currentTenant.name}: ¡Gracias por tu compra! Tu pedido de [${productName}] por USD $${price} ha sido confirmado mediante Stripe. Pronto coordinaremos el envío/retiro en ${currentTenant.address}.`,
      timestamp: new Date().toISOString(),
      status: 'delivered'
    };
    setWhatsappLogs(prev => [newWaLog, ...prev]);
  };

  // Manually trigger a mock test WhatsApp from administrative configuration console
  const handleTriggerTestWhatsApp = (recipient: string, clientName: string, text: string) => {
    const newWaLog: WhatsAppLog = {
      id: `wl-${Date.now()}`,
      recipient,
      clientName,
      message: text,
      timestamp: new Date().toISOString(),
      status: 'delivered'
    };
    setWhatsappLogs(prev => [newWaLog, ...prev]);
  };

  // --- CYC MOLDE SPECIFIC HANDLERS ---
  
  // Agregar sugerencia de cliente
  const handleAddSuggestion = (name: string, email: string, text: string) => {
    const newSug = {
      id: `sug-${Date.now()}`,
      name,
      email,
      text,
      date: new Date().toISOString().split('T')[0]
    };
    setSuggestions(prev => [newSug, ...prev]);
  };

  // Agregar comentario de cliente (entra desaprobado por defecto)
  const handleAddComment = (name: string, rating: number, text: string) => {
    const newComment: ClientComment = {
      id: `comm-${Date.now()}`,
      tenantId: currentTenant.id,
      name,
      rating,
      text,
      date: new Date().toISOString().split('T')[0],
      approved: false
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem('aura_comments', JSON.stringify(updated));
  };

  // Aprobar/Desaprobar comentario de cliente
  const handleApproveComment = (id: string, approved: boolean) => {
    const updated = comments.map(c => c.id === id ? { ...c, approved } : c);
    setComments(updated);
    localStorage.setItem('aura_comments', JSON.stringify(updated));
  };

  // Eliminar comentario de cliente
  const handleDeleteComment = (id: string) => {
    const updated = comments.filter(c => c.id !== id);
    setComments(updated);
    localStorage.setItem('aura_comments', JSON.stringify(updated));
  };

  // Crear Orden de Retiro por Tienda
  const handleNewRetiroOrder = (
    clientName: string,
    clientPhone: string,
    items: { id: string; name: string; price: number; type: string }[],
    isDelivery?: boolean,
    deliveryAddress?: string
  ) => {
    const uniqueCode = `CYC-${currentTenant.subdomain.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

    const newOrder = {
      id: `ret-${Date.now()}`,
      clientName,
      clientPhone,
      items,
      total: totalAmount,
      code: uniqueCode,
      date: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
      isDelivery,
      deliveryAddress
    };

    setRetiroOrders(prev => [newOrder, ...prev]);

    // Registrar las ventas asociadas
    items.forEach(item => {
      const isProduct = item.type === 'product';
      
      // Si es producto, descontamos stock
      if (isProduct) {
        setProducts(prev => prev.map(p => {
          if (p.id === item.id) {
            return { ...p, stock: Math.max(0, p.stock - 1) };
          }
          return p;
        }));
      }

      const randomCol = collaborators[Math.floor(Math.random() * collaborators.length)];

      const newSale: Sale = {
        id: `sal-${Date.now()}-${Math.random()}`,
        date: new Date().toISOString().split('T')[0],
        itemType: isProduct ? 'product' : 'service',
        itemId: item.id,
        itemName: item.name,
        collaboratorId: randomCol?.id || 'col-marcus',
        collaboratorName: randomCol?.name || 'Marcus Stone',
        amount: item.price,
        paymentMethod: 'Retiro en Tienda'
      };
      setSales(prev => [newSale, ...prev]);
    });

    // Registrar WhatsApp simulado
    const newWaLog: WhatsAppLog = {
      id: `wl-${Date.now()}`,
      recipient: clientPhone,
      clientName: clientName,
      message: `🔔 ¡Hola ${clientName}! Tu canasto de retiro por tienda en ${currentTenant.name} ha sido procesado con éxito. Presenta el CÓDIGO ÚNICO DE RETIRO: ${uniqueCode} al retirar tus productos/servicios en ${currentTenant.address}. Soporte: dragoprot26@gmail.com`,
      timestamp: new Date().toISOString(),
      status: 'delivered'
    };
    setWhatsappLogs(prev => [newWaLog, ...prev]);

    return uniqueCode;
  };

  // Cierre de sesion
  const handleLogout = () => {
    // Si era un colaborador, cambiar su estado a offline
    if (session?.role === 'collaborator' && session.collaboratorId) {
      setCollaborators(prev => prev.map(c => 
        c.id === session.collaboratorId ? { ...c, presenceStatus: 'offline' } : c
      ));
    }
    setSession(null);
    setIsViewingPanel(false);
  };

  // Solicitud de presencia de Colaborador (Titilar en amarillo)
  const handleCollaboratorLoginAttempt = (colId: string) => {
    // Poner al colaborador en estado de espera ("pending" = titila en amarillo)
    setCollaborators(prev => prev.map(c => 
      c.id === colId ? { ...c, presenceStatus: 'pending' } : c
    ));
  };

  const handleApproveCollaborator = (colId: string, approve: boolean) => {
    setCollaborators(prev => prev.map(c => {
      if (c.id === colId) {
        return { ...c, presenceStatus: approve ? 'online' : 'offline' };
      }
      return c;
    }));

    // Si desaprueba y era el colaborador en sesion, desloguearlo
    if (!approve && session?.role === 'collaborator' && session.collaboratorId === colId) {
      handleLogout();
    }
  };

  // Guardar Cambios del Tenant (Configuracion)
  const handleSaveTenantConfig = (updatedTenant: TenantConfig) => {
    handleUpdateTenant(updatedTenant);
    // Persistir en local storage para simular persistencia en la nube
    const updatedTenants = tenants.map(t => t.id === updatedTenant.id ? updatedTenant : t);
    localStorage.setItem('aura_tenants', JSON.stringify(updatedTenants));
  };

  // Modal Login States
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [loginLicense, setLoginLicense] = useState<string>('');
  const [loginRole, setLoginRole] = useState<'admin' | 'collaborator'>('admin');
  const [selectedColId, setSelectedColId] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginUsuario, setLoginUsuario] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [biometryLoading, setBiometryLoading] = useState<boolean>(false);
  const [cloudLicense, setCloudLicense] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<boolean>(false);

  // Registro States
  const [regName, setRegName] = useState<string>('');
  const [regOwner, setRegOwner] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPass, setRegPass] = useState<string>('');

  const executeLogin = (license: string, role: 'admin' | 'collaborator', colId?: string, isBiometric = false) => {
    const matchedTenant = tenants.find(t => t.id.toLowerCase() === license.toLowerCase());
    if (!matchedTenant) return;

    if (role === 'admin') {
      setSession({
        role: 'admin',
        name: matchedTenant.ownerName || 'Administrador',
        licenseCode: matchedTenant.id.toUpperCase()
      });
      setCurrentTenantId(matchedTenant.id);
      setIsViewingPanel(true);
      setIsLoginModalOpen(false);
      
      // Habilitar biometria para la proxima
      localStorage.setItem('aura_biometry_active', 'true');
      localStorage.setItem('aura_biometry_license', matchedTenant.id);
      localStorage.setItem('aura_biometry_role', 'admin');
      setSavedBiometry(true);
    } else {
      const col = collaborators.find(c => c.id === colId);
      const colName = col ? col.name : 'Colaborador';
      
      setSession({
        role: 'collaborator',
        name: colName,
        licenseCode: matchedTenant.id.toUpperCase(),
        collaboratorId: colId
      });
      setCurrentTenantId(matchedTenant.id);
      setIsViewingPanel(true);
      setIsLoginModalOpen(false);

      if (!isBiometric && colId) {
        // Enviar peticion al panel (estado pending - titila amarillo)
        handleCollaboratorLoginAttempt(colId);
      }

      // Habilitar biometria para la proxima
      localStorage.setItem('aura_biometry_active', 'true');
      localStorage.setItem('aura_biometry_license', matchedTenant.id);
      localStorage.setItem('aura_biometry_role', 'collaborator');
      localStorage.setItem('aura_biometry_col_id', colId || '');
      setSavedBiometry(true);
    }

    // Reset fields
    setLoginPassword('');
    setLoginError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const matchedTenant = tenants.find(t => t.id.toLowerCase() === loginLicense.toLowerCase());

    // ----- PASO 1: identificar la licencia (local demo o licencia real CyC) -----
    if (loginStep === 1) {
      if (matchedTenant) {
        setCloudLicense(null);
        setLoginStep(2);
        if (collaborators.length > 0) setSelectedColId(collaborators[0].id);
        return;
      }
      // No es un local demo: validar la licencia real contra Supabase.
      const code = loginLicense.trim();
      const lic = await cloud.validarLicencia(code);
      if (!lic || !lic.codigo) {
        setLoginError('Codigo de licencia no valido. Verifica el codigo AURA que te entregaron, o intenta SOHO-CHIC (demo).');
        return;
      }
      const codigo = lic.codigo as string;
      if (!tenants.some(t => t.id === codigo)) {
        const shell: TenantConfig = {
          id: codigo, name: (lic.negocio as string) || (lic.nombre as string) || 'Aura NY', subdomain: codigo,
          logo: '✨ AURA NY', address: 'Nueva York, NY', phone: '',
          ownerName: 'Dueno', ownerPhone: '', ownerEmail: '', password: '',
          theme: { id: codigo + '-theme', name: 'Manhattan Velvet (Oscuro)', mode: 'dark',
            primaryColor: '#ffffff', secondaryColor: '#d4af37', backgroundColor: '#0a0a0a',
            textColor: '#f5f5f5', accentColor: '#d4af37', fontFamily: 'display' },
          whatsapp: { enabled: false, apiKey: '', phoneID: '', reminderHoursBefore: 24,
            templatePending: 'Hola {{clientName}}, tu reserva esta bajo revision.',
            templateConfirmed: 'Hola {{clientName}}, tu reserva esta confirmada.' },
          stripe: { enabled: false, publicKey: '', secretKey: '', mode: 'test' }
        };
        setTenants(prev => [...prev, shell]);
      }
      setCurrentTenantId(codigo);
      setCloudLicense(codigo);
      setLoginStep(2);
      return;
    }

    // ----- PASO 2: contrasena -----
    // Licencia real CyC: la cuenta del dueno se crea/valida contra Supabase.
    if (cloudLicense) {
      if (loginRole !== 'admin') {
        setLoginError('Para entrar como colaborador, el dueno debe darte de alta primero desde el panel.');
        return;
      }
      if (!loginPassword || loginPassword.length < 6) {
        setLoginError('La contrasena debe tener al menos 6 caracteres.');
        return;
      }
      if (!loginUsuario.trim()) {
        setLoginError('Ingresa el usuario que te dio tu proveedor.');
        return;
      }
      const r = await cloud.asegurarCuentaSeguraDueno(loginUsuario.trim(), loginPassword, cloudLicense);
      if (!r.ok) { setLoginError(r.msg || 'No se pudo activar la licencia.'); return; }
      setSession({ role: 'admin', name: 'Dueno', licenseCode: cloudLicense });
      setCurrentTenantId(cloudLicense);
      setIsViewingPanel(true);
      setIsLoginModalOpen(false);
      setLoginStep(1); setLoginPassword(''); setLoginUsuario(''); setLoginLicense(''); setCloudLicense(null);
      return;
    }

    if (!matchedTenant) {
      setLoginError('Codigo de licencia no valido. Intente SOHO-CHIC o registre uno nuevo.');
      return;
    }

    // ----- Local demo (comportamiento original) -----
    if (loginRole === 'admin') {
      const masterPass = matchedTenant.password || '123';
      if (loginPassword !== masterPass) {
        setLoginError('Contrasena de administrador incorrecta.');
        return;
      }
      cloud.asegurarCuentaSeguraDueno(matchedTenant.ownerName || matchedTenant.name || 'dueno', loginPassword, matchedTenant.id.toUpperCase()).finally(() => executeLogin(matchedTenant.id, 'admin'));
    } else {
      const col = collaborators.find(c => c.id === selectedColId);
      const colPass = col?.password || '123';
      if (loginPassword !== colPass) {
        setLoginError('Contrasena de colaborador incorrecta.');
        return;
      }
      cloud.asegurarCuentaSeguraColab((col && (col.username || col.name)) || 'colab', loginPassword, matchedTenant.id.toUpperCase()).finally(() => executeLogin(matchedTenant.id, 'collaborator', selectedColId));
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regOwner || !regPass || !regEmail) {
      setLoginError('Por favor complete todos los campos requeridos.');
      return;
    }

    const newId = regName.toLowerCase().replace(/\s+/g, '-');
    
    // Validar duplicado
    if (tenants.some(t => t.id === newId)) {
      setLoginError('Ya existe un local registrado con ese nombre.');
      return;
    }

    const newTenant: TenantConfig = {
      id: newId,
      name: regName,
      subdomain: newId,
      logo: `✨ ${regName.toUpperCase()}`,
      address: 'Nueva York, NY',
      phone: regPhone || '+1 (212) 555-0100',
      ownerName: regOwner,
      ownerPhone: regPhone,
      ownerEmail: regEmail,
      password: regPass,
      theme: {
        id: `${newId}-theme`,
        name: 'Manhattan Velvet (Oscuro)',
        mode: 'dark',
        primaryColor: '#ffffff',
        secondaryColor: '#d4af37',
        backgroundColor: '#0a0a0a',
        textColor: '#f5f5f5',
        accentColor: '#d4af37',
        fontFamily: 'display'
      },
      whatsapp: {
        enabled: false,
        apiKey: '',
        phoneID: '',
        reminderHoursBefore: 24,
        templatePending: 'Hola {{clientName}}, tu reserva está bajo revisión.',
        templateConfirmed: 'Hola {{clientName}}, tu reserva está confirmada.'
      },
      stripe: {
        enabled: false,
        publicKey: '',
        secretKey: '',
        mode: 'test'
      }
    };

    const updatedTenants = [...tenants, newTenant];
    setTenants(updatedTenants);
    localStorage.setItem('aura_tenants', JSON.stringify(updatedTenants));

    // Auto login
    setSession({
      role: 'admin',
      name: regOwner,
      licenseCode: newId.toUpperCase()
    });
    setCurrentTenantId(newId);
    cloud.asegurarCuentaSeguraDueno(regOwner, regPass, newId.toUpperCase());
    setIsViewingPanel(true);
    setIsLoginModalOpen(false);

    // Resetear formulario
    setRegName('');
    setRegOwner('');
    setRegPhone('');
    setRegEmail('');
    setRegPass('');
    setIsRegisterMode(false);
  };

  const handleBiometryClick = () => {
    setBiometryLoading(true);
    setTimeout(() => {
      setBiometryLoading(false);
      const bioLicense = localStorage.getItem('aura_biometry_license') || 'soho-chic';
      const bioRole = (localStorage.getItem('aura_biometry_role') as 'admin' | 'collaborator') || 'admin';
      const bioColId = localStorage.getItem('aura_biometry_col_id') || undefined;
      executeLogin(bioLicense, bioRole, bioColId, true);
    }, 1200);
  };

  const openLoginModalWithCode = () => {
    setLoginStep(1);
    setIsRegisterMode(false);
    setLoginLicense(currentTenant.id.toUpperCase());
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-neutral-950 text-white selection:bg-amber-500 selection:text-neutral-950">
      
      {/* Dynamic Header with Tenant Switcher & Client/Admin Role Toggle - Only rendered inside the administrative panel */}
      {session && isViewingPanel && (
        <Header
          tenants={tenants}
          currentTenant={currentTenant}
          onTenantChange={handleTenantChange}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
          session={session}
          onLogout={handleLogout}
          isViewingPanel={isViewingPanel}
          setIsViewingPanel={setIsViewingPanel}
          onOpenLoginModal={openLoginModalWithCode}
        />
      )}

      {/* Main Content Pane */}
      <main className="flex-grow relative">
        {session && isViewingPanel ? (
          /* ADMINISTRATIVE PORTAL WITH CYC INTEGRATIONS */
          <AdminDashboard
            currentTenant={currentTenant}
            onUpdateTenant={handleSaveTenantConfig}
            services={services}
            onAddService={handleAddService}
            onDeleteService={handleDeleteService}
            products={products}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            collaborators={collaborators}
            onAddCollaborator={handleAddCollaborator}
            onDeleteCollaborator={handleDeleteCollaborator}
            appointments={appointments}
            sales={sales}
            whatsappLogs={whatsappLogs}
            onTriggerTestWhatsApp={handleTriggerTestWhatsApp}
            session={session}
            onLogout={handleLogout}
            suggestions={suggestions}
            retiroOrders={retiroOrders}
            onApproveCollaborator={handleApproveCollaborator}
            onSetProducts={setProducts}
            onSetSales={setSales}
            onSetServices={setServices}
            onSetCollaborators={setCollaborators}
            onSetRetiroOrders={setRetiroOrders}
            onSetAppointments={setAppointments}
            comments={comments}
            onApproveComment={handleApproveComment}
            onDeleteComment={handleDeleteComment}
          />
        ) : (
          /* CLIENT PAGE: Dynamically themed per active tenant */
          <PublicPage
            currentTenant={currentTenant}
            services={services}
            products={products}
            collaborators={collaborators}
            appointments={appointments}
            onNewBooking={handleNewBooking}
            onNewProductSale={handleNewProductSale}
            onAddSuggestion={handleAddSuggestion}
            onNewRetiroOrder={handleNewRetiroOrder}
            onOpenLoginModal={openLoginModalWithCode}
            comments={comments}
            onAddComment={handleAddComment}
            session={session}
            setIsViewingPanel={setIsViewingPanel}
            onLogout={handleLogout}
          />
        )}


      </main>

      {/* Molde CyC: QR + compartir la pagina del local (para el dueno) */}
      {session && isViewingPanel && (
        <button
          type="button"
          onClick={() => setShowQR(true)}
          title="QR / Compartir mi pagina"
          className="fixed bottom-5 right-5 z-40 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-full shadow-lg px-4 py-3 text-xs flex items-center gap-2"
        >
          <QrCode className="w-4 h-4" /> Mi QR
        </button>
      )}
      {showQR && (() => {
        const link = window.location.origin + '/?codigo=' + encodeURIComponent(session ? session.licenseCode : currentTenantId);
        const qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=' + encodeURIComponent(link);
        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-white mb-1">QR de tu pagina</h3>
              <p className="text-xs text-neutral-400 mb-4">Colgalo en tu local. Tus clientes lo escanean y abren tu pagina para ver y encargar.</p>
              <img src={qrSrc} alt="QR" referrerPolicy="no-referrer" className="w-56 h-56 mx-auto rounded-xl bg-white p-2" />
              <div className="mt-3 text-[11px] font-mono text-amber-400 break-all">{link}</div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <a href={qrSrc} download="qr-mi-pagina.png" target="_blank" rel="noreferrer" className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center">Descargar QR</a>
                <button type="button" onClick={async () => { try { if ((navigator as any).share) { await (navigator as any).share({ title: 'Mi pagina', url: link }); } else { await navigator.clipboard.writeText(link); alert('Link copiado'); } } catch (e) {} }} className="bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold py-2.5 rounded-lg">Compartir</button>
              </div>
              <button type="button" onClick={() => setShowQR(false)} className="mt-3 text-xs text-neutral-500 hover:text-neutral-300">Cerrar</button>
            </div>
          </div>
        );
      })()}

      {/* Premium NYC Aesthetic Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-8 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="font-semibold tracking-wider">AURA NY PWA NETWORK</span>
          </div>
          <div>
            <span>© 2026 Aura Technologies LLC. Manhattan, NY.</span>
          </div>
          <div className="flex gap-4">
            <span onClick={openLoginModalWithCode} className="hover:text-white cursor-pointer transition-colors flex items-center gap-1">
              <Shield className="h-3 w-3 text-amber-500" /> Molde CyC
            </span>
            <a href="https://vitrina-cyc.vercel.app/" target="_blank" rel="noreferrer" className="hover:text-white cursor-pointer transition-colors">
              Vitrina CyC
            </a>
            <span className="text-neutral-600">Soporte: dragoprot26@gmail.com</span>
          </div>
        </div>
      </footer>

      {/* --- PREMIUM CYC AUTENTICACIÓN MODAL --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-500" />
                  {isRegisterMode ? 'Registrar Licencia CyC' : 'Ingreso al Sistema 🛡️'}
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  MOLDE CYC PREMIUM PWA
                </p>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6">
              
              {loginError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Registro Mode */}
              {isRegisterMode ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">Nombre del Local *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Soho Hair Deluxe"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">Inquilino / Dueño *</label>
                      <input
                        type="text"
                        required
                        placeholder="Diego Ariel"
                        value={regOwner}
                        onChange={(e) => setRegOwner(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">Teléfono</label>
                      <input
                        type="text"
                        placeholder="+54 9 11..."
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">Email de Contacto *</label>
                    <input
                      type="email"
                      required
                      placeholder="propietario@salon.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">Contraseña Maestra *</label>
                    <input
                      type="password"
                      required
                      placeholder="Crea tu contraseña"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md mt-4 cursor-pointer"
                  >
                    Registrar e Iniciar Panel
                  </button>

                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(false)}
                      className="text-[11px] font-mono text-amber-500 hover:underline"
                    >
                      ¿Ya tienes licencia? Iniciar Sesión
                    </button>
                  </div>
                </form>
              ) : (
                /* Login Mode */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {loginStep === 1 ? (
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">Código de Licencia (Tenant ID)</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: SOHO-CHIC, TRIBECA-LOFT"
                        value={loginLicense}
                        onChange={(e) => setLoginLicense(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all placeholder:text-neutral-600 font-mono"
                      />
                      <p className="text-[10px] text-neutral-500 font-mono mt-1.5">
                        * Ingrese el código entregado con su molde para habilitar el acceso.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl mb-3 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-mono text-neutral-500 block">LICENCIA CARGADA</span>
                          <span className="text-xs font-mono text-amber-400 font-bold">{loginLicense.toUpperCase()}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLoginStep(1)}
                          className="text-[10px] font-mono text-neutral-400 hover:text-white underline"
                        >
                          Cambiar
                        </button>
                      </div>

                      {/* Role selection */}
                      <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 border border-neutral-850 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setLoginRole('admin')}
                          className={`py-2 rounded-lg text-xs font-mono font-medium transition-all ${loginRole === 'admin' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'}`}
                        >
                          Administrador
                        </button>
                        <button
                          type="button"
                          onClick={() => setLoginRole('collaborator')}
                          className={`py-2 rounded-lg text-xs font-mono font-medium transition-all ${loginRole === 'collaborator' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'}`}
                        >
                          Colaborador
                        </button>
                      </div>

                      {/* Collaborator selector if applicable */}
                      {loginRole === 'collaborator' && (
                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">Selecciona tu Perfil</label>
                          <select
                            value={selectedColId}
                            onChange={(e) => setSelectedColId(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-amber-500"
                          >
                            {collaborators.map(c => (
                              <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {cloudLicense && loginRole === 'admin' && (
                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">Usuario</label>
                          <input
                            type="text"
                            placeholder="usuario que te dio tu proveedor"
                            value={loginUsuario}
                            onChange={(e) => setLoginUsuario(e.target.value)}
                            autoComplete="off"
                            className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">Contraseña</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md mt-2 cursor-pointer"
                  >
                    {loginStep === 1 ? 'Siguiente' : 'Ingresar'}
                  </button>

                  {/* Biometric Login option */}
                  {savedBiometry && loginStep === 1 && (
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-neutral-850"></div>
                      <span className="flex-shrink mx-3 text-neutral-600 text-[10px] font-mono">O BIOMETRÍA</span>
                      <div className="flex-grow border-t border-neutral-850"></div>
                    </div>
                  )}

                  {savedBiometry && loginStep === 1 && (
                    <button
                      type="button"
                      onClick={handleBiometryClick}
                      disabled={biometryLoading}
                      className="w-full bg-neutral-950 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 hover:border-neutral-700 py-3 rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
                    >
                      {biometryLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="font-mono text-[10px] text-amber-500 uppercase tracking-widest">Escaneando Biometría...</span>
                        </>
                      ) : (
                        <>
                          <Fingerprint className="h-5 w-5 text-amber-500 animate-pulse" />
                          <span className="font-mono text-[10px] uppercase">Acceso con Huella / FaceID</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className="flex justify-between items-center text-[10px] font-mono mt-4 border-t border-neutral-850 pt-4 text-neutral-500">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(true);
                        setLoginError('');
                      }}
                      className="text-amber-500 hover:underline"
                    >
                      Registrar Nueva Licencia
                    </button>
                    <span>Soporte: dragoprot26@gmail.com</span>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
