import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TenantConfig, Service, Product, Collaborator, Appointment, Sale, CustomField, WhatsAppLog, ClientComment 
} from '../types';
import { 
  TrendingUp, Scissors, Package, Users, Palette, Settings, Plus, Trash2, 
  Check, DollarSign, Calendar, Clock, BarChart3, Star, Percent, FileDown, 
  Smartphone, Eye, ShieldCheck, Mail, Phone, Edit, ArrowUpRight, MessageSquare, Image,
  Shield, QrCode, LogOut, RefreshCw, AlertTriangle, Search, Sparkles, Filter, CheckCircle, XCircle, Info, Copy, X, Globe
} from 'lucide-react';

interface AdminDashboardProps {
  currentTenant: TenantConfig;
  onUpdateTenant: (updatedTenant: TenantConfig) => void;
  services: Service[];
  onAddService: (newService: Service) => void;
  onDeleteService: (serviceId: string) => void;
  products: Product[];
  onAddProduct: (newProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
  collaborators: Collaborator[];
  onAddCollaborator: (newCol: Collaborator) => void;
  onDeleteCollaborator: (colId: string) => void;
  appointments: Appointment[];
  sales: Sale[];
  whatsappLogs: WhatsAppLog[];
  onTriggerTestWhatsApp: (recipient: string, clientName: string, text: string) => void;
  session: { role: 'admin' | 'collaborator'; name: string; licenseCode: string; collaboratorId?: string };
  onLogout: () => void;
  suggestions: { id: string; name: string; email: string; text: string; date: string }[];
  comments?: ClientComment[];
  onApproveComment?: (id: string, approved: boolean) => void;
  onDeleteComment?: (id: string) => void;
  retiroOrders: {
    id: string;
    clientName: string;
    clientPhone: string;
    items: { name: string; price: number; type: string }[];
    total: number;
    code: string;
    date: string;
    status: 'pending' | 'completed' | 'cancelled';
    isDelivery?: boolean;
    deliveryAddress?: string;
  }[];
  onApproveCollaborator: (colId: string, approve: boolean) => void;
  onSetProducts: (prods: Product[]) => void;
  onSetSales: (sales: Sale[]) => void;
  onSetServices: (srvs: Service[]) => void;
  onSetCollaborators: (cols: Collaborator[]) => void;
  onSetRetiroOrders: (orders: any[]) => void;
  onSetAppointments?: (orders: Appointment[]) => void;
}

export default function AdminDashboard({
  currentTenant,
  onUpdateTenant,
  services,
  onAddService,
  onDeleteService,
  products,
  onAddProduct,
  onDeleteProduct,
  collaborators,
  onAddCollaborator,
  onDeleteCollaborator,
  appointments,
  sales,
  whatsappLogs,
  onTriggerTestWhatsApp,
  session,
  onLogout,
  suggestions,
  retiroOrders,
  onApproveCollaborator,
  onSetProducts,
  onSetSales,
  onSetServices,
  onSetCollaborators,
  onSetRetiroOrders,
  onSetAppointments,
  comments = [],
  onApproveComment,
  onDeleteComment
}: AdminDashboardProps) {
  const currentCollaborator = session.role === 'collaborator'
    ? collaborators.find(c => c.id === session.collaboratorId)
    : null;
  const isUserAdmin = session.role === 'admin' || currentCollaborator?.isAdminOverride === true;

  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [newColIsAdmin, setNewColIsAdmin] = useState<boolean>(false);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'services' | 'products' | 'collaborators' | 'theme' | 'config' | 'retiro' | 'comments'>('dashboard');
  
  // Sales Dashboard Timeframe Filter
  const [salesFilter, setSalesFilter] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('weekly');

  // CyC specific states
  const [isReportDownloaded, setIsReportDownloaded] = useState<boolean>(false);
  const [barcodeSearchQuery, setBarcodeSearchQuery] = useState<string>('');
  const [scannedHighlightId, setScannedHighlightId] = useState<string | null>(null);
  const [showScannerSimulator, setShowScannerSimulator] = useState<boolean>(false);
  const [scannerInputCode, setScannerInputCode] = useState<string>('');
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [inactivitySeconds, setInactivitySeconds] = useState<number>(2700); // 45 minutes
  const [serviceCategories, setServiceCategories] = useState<string[]>(['Coloración', 'Tratamientos', 'Corte', 'Manicuría', 'Peinado']);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [selectedSemaphoreFilter, setSelectedSemaphoreFilter] = useState<string>('all');
  const [retiroSearchQuery, setRetiroSearchQuery] = useState<string>('');
  const [retiroStatusFilter, setRetiroStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  
  // Appointments management states
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState<string>('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [dashboardToast, setDashboardToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [colorStyleSubTab, setColorStyleSubTab] = useState<'claros' | 'medios' | 'transparentes'>('claros');

  // Auto-clear toast notifications
  useEffect(() => {
    if (dashboardToast) {
      const timer = setTimeout(() => {
        setDashboardToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [dashboardToast]);

  // Temporizador de inactividad de 45 minutos para colaborador
  useEffect(() => {
    if (session.role !== 'collaborator') return;
    const interval = setInterval(() => {
      setInactivitySeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogout();
          alert('Tu sesión ha expirado por inactividad de 45 minutos (Simulado).');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [session, onLogout]);

  // --- SERVICE CREATION STATES ---
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCategory, setNewSrvCategory] = useState('Coloración');
  const [newSrvDuration, setNewSrvDuration] = useState(60);
  const [newSrvPrice, setNewSrvPrice] = useState(100);
  const [newSrvDesc, setNewSrvDesc] = useState('');
  const [newSrvImage, setNewSrvImage] = useState('');
  const [newSrvFields, setNewSrvFields] = useState<CustomField[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  
  // Custom Field Form for Service
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'boolean' | 'select'>('text');
  const [fieldOptions, setFieldOptions] = useState('');

  // --- PRODUCT CREATION STATES ---
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(50);
  const [newProdStock, setNewProdStock] = useState(20);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdFields, setNewProdFields] = useState<CustomField[]>([]);
  const [newProdImages, setNewProdImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80'
  ]); // prefilled 5 images

  
  // Custom Field Form for Product
  const [pFieldLabel, setPFieldLabel] = useState('');
  const [pFieldType, setPFieldType] = useState<'text' | 'number' | 'boolean' | 'select'>('text');
  const [pFieldOptions, setPFieldOptions] = useState('');

  // --- COLLABORATOR CREATION STATES ---
  const [newColName, setNewColName] = useState('');
  const [newColRole, setNewColRole] = useState('Senior Stylist');
  const [newColSpecialties, setNewColSpecialties] = useState<string[]>(['Coloración']);
  const [newColCommission, setNewColCommission] = useState(35);
  const [newColDays, setNewColDays] = useState<string[]>(['Martes', 'Miércoles', 'Jueves', 'Viernes']);
  const [newColHours, setNewColHours] = useState('09:00 - 18:00');

  // Custom roles & specialties management states
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    'Senior Stylist',
    'Senior Master Stylist',
    'Senior Master Colorist',
    'Nail Artist Specialist',
    'Brow & Lash Expert',
    'Spa Aesthetic Director'
  ]);
  const [showAddRoleInput, setShowAddRoleInput] = useState(false);
  const [newCustomRole, setNewCustomRole] = useState('');

  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([
    'Coloración',
    'Corte',
    'Manicuría',
    'Estética Facial',
    'Tratamientos'
  ]);
  const [showAddSpecialtyInput, setShowAddSpecialtyInput] = useState(false);
  const [newCustomSpecialty, setNewCustomSpecialty] = useState('');

  // Populate from existing collaborators
  useEffect(() => {
    if (collaborators && collaborators.length > 0) {
      // Roles
      const uniqueRoles = Array.from(new Set([
        ...availableRoles,
        ...collaborators.map(c => c.role).filter(Boolean)
      ]));
      setAvailableRoles(uniqueRoles);

      // Specialties (categories)
      const uniqueSpecs = Array.from(new Set([
        ...availableSpecialties,
        ...collaborators.flatMap(c => c.specialties || [])
      ]));
      setAvailableSpecialties(uniqueSpecs);
    }
  }, [collaborators]);

  // --- PRESETS & CONFIGS FOR CURRENT TENANT ---
  const updateThemeProperty = (prop: string, value: string) => {
    onUpdateTenant({
      ...currentTenant,
      theme: {
        ...currentTenant.theme,
        [prop]: value
      }
    });
  };

  const updateTenantProperty = (prop: keyof TenantConfig, value: any) => {
    onUpdateTenant({
      ...currentTenant,
      [prop]: value
    });
  };

  const applyThemePreset = (preset: 'light' | 'medium' | 'dark' | 'transparent') => {
    let updatedTheme = { ...currentTenant.theme };
    if (preset === 'dark') {
      updatedTheme = {
        id: 'soho-dark',
        name: 'Manhattan Midnight (Oscuro)',
        mode: 'dark',
        primaryColor: '#ffffff',
        secondaryColor: '#a3a3a3',
        backgroundColor: '#0a0a0a',
        textColor: '#f5f5f5',
        accentColor: '#d4af37',
        fontFamily: 'display',
      };
    } else if (preset === 'medium') {
      updatedTheme = {
        id: 'tribeca-warm',
        name: 'Loft Warmth (Medio)',
        mode: 'medium',
        primaryColor: '#451a03',
        secondaryColor: '#78350f',
        backgroundColor: '#fafaf9',
        textColor: '#1c1917',
        accentColor: '#b45309',
        fontFamily: 'serif',
      };
    } else if (preset === 'transparent') {
      updatedTheme = {
        id: 'fifth-glass',
        name: 'Brooklyn Neo-Glass (Transparente)',
        mode: 'transparent',
        primaryColor: '#e0f2fe',
        secondaryColor: '#bae6fd',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        textColor: '#f8fafc',
        accentColor: '#0ea5e9',
        fontFamily: 'mono',
      };
    } else {
      updatedTheme = {
        id: 'fifth-luxe',
        name: 'Crystal Glass (Claro)',
        mode: 'light',
        primaryColor: '#0f172a',
        secondaryColor: '#475569',
        backgroundColor: '#f8fafc',
        textColor: '#0f172a',
        accentColor: '#0ea5e9',
        fontFamily: 'sans',
      };
    }
    onUpdateTenant({
      ...currentTenant,
      theme: updatedTheme
    });
  };

  const applyColorStylePreset = (preset: { mode: 'dark' | 'medium' | 'light' | 'transparent'; backgroundColor: string; textColor: string; accentColor: string }) => {
    onUpdateTenant({
      ...currentTenant,
      theme: {
        ...currentTenant.theme,
        mode: preset.mode,
        backgroundColor: preset.backgroundColor,
        textColor: preset.textColor,
        accentColor: preset.accentColor
      }
    });
  };

  // --- RESPALDOS (BACKUP & RESTORE) Y MARKETING QR ---
  const handleExportBackup = () => {
    try {
      const backupData = {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        tenantId: currentTenant.id,
        currentTenant,
        products,
        sales,
        services,
        collaborators,
        retiroOrders,
        suggestions
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const dateStr = new Date().toISOString().slice(0,10);
      downloadAnchor.setAttribute("download", `BACKUP_CYC_${currentTenant.id.toUpperCase()}_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      alert("Error al exportar la copia de seguridad.");
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (!parsed.currentTenant || !parsed.products || !parsed.sales) {
            alert("El archivo de copia de seguridad no tiene un formato válido para el Molde CyC.");
            return;
          }

          if (confirm("¿Estás seguro de que deseas restaurar este respaldo? Se sobrescribirá el estado actual del sistema de forma definitiva.")) {
            // Restaurar a través de callbacks props
            if (onUpdateTenant) onUpdateTenant(parsed.currentTenant);
            if (onSetProducts) onSetProducts(parsed.products);
            if (onSetSales) onSetSales(parsed.sales);
            
            // Si el componente padre tiene callbacks opcionales para los otros estados:
            if ((onSetServices as any)) (onSetServices as any)(parsed.services || []);
            if ((onSetCollaborators as any)) (onSetCollaborators as any)(parsed.collaborators || []);
            if ((onSetRetiroOrders as any)) (onSetRetiroOrders as any)(parsed.retiroOrders || []);

            alert("¡Copia de seguridad restaurada con éxito! La interfaz se actualizará con los nuevos datos.");
            window.location.reload();
          }
        } catch (err) {
          alert("Error al parsear el archivo de respaldo JSON.");
        }
      };
    }
  };

  const handlePrintQRCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor habilita las ventanas emergentes para poder imprimir el cartel.");
      return;
    }

    const appUrl = window.location.origin;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cartel QR de Reservas - ${currentTenant.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Playfair+Display:wght@700&family=Space+Grotesk:wght@500;700&display=swap');
            body {
              background-color: #000000;
              color: #ffffff;
              font-family: 'Inter', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .card {
              border: 3px solid #d4af37;
              border-radius: 24px;
              padding: 50px 40px;
              width: 420px;
              text-align: center;
              box-shadow: 0 10px 30px rgba(0,0,0,0.5);
              background: linear-gradient(135deg, #0f0f0f 0%, #050505 100%);
            }
            .header-label {
              font-size: 11px;
              letter-spacing: 4px;
              text-transform: uppercase;
              color: #d4af37;
              margin-bottom: 12px;
              font-weight: 600;
            }
            .title {
              font-family: ${currentTenant.theme.fontFamily === 'serif' ? "'Playfair Display', serif" : currentTenant.theme.fontFamily === 'display' ? "'Space Grotesk', sans-serif" : "'Inter', sans-serif"};
              font-size: 32px;
              font-weight: 800;
              text-transform: uppercase;
              margin: 0 0 25px 0;
              letter-spacing: -0.5px;
            }
            .qr-container {
              background-color: #ffffff;
              padding: 24px;
              border-radius: 18px;
              display: inline-block;
              margin-bottom: 25px;
              box-shadow: 0 4px 15px rgba(212,175,55,0.15);
            }
            .qr-placeholder {
              width: 180px;
              height: 180px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .instruction {
              font-size: 14px;
              color: #a3a3a3;
              line-height: 1.6;
              margin: 0 0 10px 0;
            }
            .url {
              font-size: 12px;
              color: #d4af37;
              font-family: monospace;
              letter-spacing: 0.5px;
            }
            @media print {
              body {
                background: white !important;
                color: black !important;
              }
              .card {
                border-color: #000000 !important;
                background: white !important;
                box-shadow: none !important;
                width: 100%;
                max-width: 450px;
                margin: auto;
              }
              .header-label, .url {
                color: #000000 !important;
              }
              .instruction {
                color: #333333 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header-label">Bienvenido a</div>
            <div class="title">${currentTenant.name}</div>
            <div class="qr-container">
              <svg class="qr-placeholder" viewBox="0 0 100 100">
                <path d="M 5,5 L 25,5 L 25,10 L 10,10 L 10,25 L 5,25 Z" fill="#000" />
                <path d="M 75,5 L 95,5 L 95,25 L 90,25 L 90,10 L 75,10 Z" fill="#000" />
                <path d="M 5,75 L 5,95 L 25,95 L 25,90 L 10,90 L 10,75 Z" fill="#000" />
                <rect x="15" y="15" width="20" height="20" fill="#000" />
                <rect x="18" y="18" width="14" height="14" fill="#fff" />
                <rect x="21" y="21" width="8" height="8" fill="#000" />
                <rect x="65" y="15" width="20" height="20" fill="#000" />
                <rect x="68" y="18" width="14" height="14" fill="#fff" />
                <rect x="71" y="21" width="8" height="8" fill="#000" />
                <rect x="15" y="65" width="20" height="20" fill="#000" />
                <rect x="18" y="68" width="14" height="14" fill="#fff" />
                <rect x="21" y="71" width="8" height="8" fill="#000" />
                <rect x="45" y="15" width="5" height="10" fill="#000" />
                <rect x="55" y="25" width="5" height="5" fill="#000" />
                <rect x="40" y="30" width="10" height="5" fill="#000" />
                <rect x="65" y="45" width="10" height="10" fill="#000" />
                <rect x="15" y="45" width="10" height="5" fill="#000" />
                <rect x="30" y="50" width="5" height="10" fill="#000" />
                <rect x="45" y="65" width="5" height="15" fill="#000" />
                <rect x="65" y="65" width="5" height="5" fill="#000" />
                <rect x="75" y="75" width="10" height="10" fill="#000" />
                <rect x="85" y="65" width="5" height="5" fill="#000" />
                <rect x="55" y="55" width="10" height="5" fill="#000" />
                <rect x="55" y="75" width="5" height="10" fill="#000" />
                <rect x="35" y="75" width="5" height="5" fill="#000" />
              </svg>
            </div>
            <p class="instruction">Escanea este código con tu teléfono celular para agendar tu cita, ver el catálogo de cosméticos o contactar con nuestros especialistas.</p>
            <div class="url">${appUrl}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const updateWhatsAppProperty = (prop: string, value: any) => {
    onUpdateTenant({
      ...currentTenant,
      whatsapp: {
        ...currentTenant.whatsapp,
        [prop]: value
      }
    });
  };

  const updateStripeProperty = (prop: string, value: any) => {
    onUpdateTenant({
      ...currentTenant,
      stripe: {
        ...currentTenant.stripe,
        [prop]: value
      }
    });
  };

  // --- ACTIONS ---
  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvName) return;

    if (editingServiceId) {
      const updated = services.map(s => s.id === editingServiceId ? {
        ...s,
        name: newSrvName,
        category: newSrvCategory,
        duration: Number(newSrvDuration),
        price: Number(newSrvPrice),
        description: newSrvDesc,
        customFields: newSrvFields,
        image: newSrvImage
      } : s);
      onSetServices(updated);
      setEditingServiceId(null);
      setDashboardToast({
        message: `✓ Tratamiento "${newSrvName}" actualizado correctamente.`,
        type: 'success'
      });
    } else {
      const srv: Service = {
        id: `srv-${Date.now()}`,
        name: newSrvName,
        category: newSrvCategory,
        duration: Number(newSrvDuration),
        price: Number(newSrvPrice),
        description: newSrvDesc,
        customFields: newSrvFields,
        image: newSrvImage
      };
      onAddService(srv);
      setDashboardToast({
        message: `✓ Tratamiento "${srv.name}" registrado con éxito.`,
        type: 'success'
      });
    }
    
    // Reset Form
    setNewSrvName('');
    setNewSrvDesc('');
    setNewSrvImage('');
    setNewSrvFields([]);
    setNewSrvDuration(60);
    setNewSrvPrice(100);
  };

  const addCustomFieldToService = () => {
    if (!fieldLabel) return;
    const newField: CustomField = {
      id: `fld-${Date.now()}`,
      label: fieldLabel,
      type: fieldType,
      value: fieldType === 'boolean' ? 'false' : '',
      options: fieldOptions ? fieldOptions.split(',').map(s => s.trim()) : undefined
    };
    setNewSrvFields(prev => [...prev, newField]);
    setFieldLabel('');
    setFieldOptions('');
  };

  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [newProdLastUnits, setNewProdLastUnits] = useState(false);

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    if (editingProdId) {
      const updatedProducts = products.map(p => {
        if (p.id === editingProdId) {
          return {
            ...p,
            name: newProdName,
            price: Number(newProdPrice),
            stock: Number(newProdStock),
            description: newProdDesc,
            images: newProdImages,
            customFields: newProdFields,
            barcode: newProdBarcode || p.barcode,
            isLastUnitsEnabled: newProdLastUnits
          };
        }
        return p;
      });
      onSetProducts(updatedProducts);
      setEditingProdId(null);
      alert(`✓ Producto cosmético "${newProdName}" editado con éxito.`);
    } else {
      const prod: Product = {
        id: `prod-${Date.now()}`,
        name: newProdName,
        price: Number(newProdPrice),
        stock: Number(newProdStock),
        description: newProdDesc,
        images: newProdImages,
        customFields: newProdFields,
        barcode: newProdBarcode || `779${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        views: Math.floor(Math.random() * 25), // aleatorio para semáforo inicial
        isLastUnitsEnabled: newProdLastUnits
      };

      onAddProduct(prod);
      alert(`✓ Producto cosmético "${prod.name}" guardado con éxito.`);
    }

    // Reset Form
    setNewProdName('');
    setNewProdDesc('');
    setNewProdBarcode('');
    setNewProdLastUnits(false);
    setNewProdFields([]);
    setNewProdImages([
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80'
    ]);
  };

  const addCustomFieldToProduct = () => {
    if (!pFieldLabel) return;
    const newField: CustomField = {
      id: `p-fld-${Date.now()}`,
      label: pFieldLabel,
      type: pFieldType,
      value: pFieldType === 'boolean' ? 'false' : '',
      options: pFieldOptions ? pFieldOptions.split(',').map(s => s.trim()) : undefined
    };
    setNewProdFields(prev => [...prev, newField]);
    setPFieldLabel('');
    setPFieldOptions('');
  };

  const handleAddColSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName) return;

    const col: Collaborator = {
      id: `col-${Date.now()}`,
      name: newColName,
      role: newColRole,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?auto=format&fit=crop&w=150&h=150&q=80`,
      specialties: newColSpecialties,
      commissionRate: Number(newColCommission),
      rating: 5.0,
      schedule: {
        days: newColDays,
        hours: newColHours
      },
      isAdminOverride: newColIsAdmin
    };

    onAddCollaborator(col);
    setNewColName('');
    setNewColIsAdmin(false);
    alert(`✓ Colaborador "${col.name}" agendado con éxito.`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: 'completed' | 'cancelled') => {
    const updated = retiroOrders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    onSetRetiroOrders(updated);
    alert(`✓ Pedido de retiro actualizado a "${newStatus === 'completed' ? 'Entregado' : 'Cancelado'}" con éxito.`);
  };

  // --- STATS COMPUTATIONS ---
  // Filtrar ventas por rol de usuario (Inquilino ve todo, colaborador solo ve sus propias comisiones/ventas)
  const roleBaseSales = sales.filter(sale => {
    if (session.role === 'collaborator') {
      return sale.collaboratorId === session.collaboratorId;
    }
    return true;
  });

  // Filtrar ventas de acuerdo al filtro temporal
  const filteredSales = roleBaseSales.filter(sale => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - saleDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (salesFilter === 'daily') {
      return diffDays <= 1; // Hoy
    } else if (salesFilter === 'weekly') {
      return diffDays <= 7; // Última semana
    } else if (salesFilter === 'monthly') {
      return diffDays <= 30; // Último mes
    } else {
      return true; // Anual / Todo
    }
  });

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.amount, 0);
  const serviceSales = filteredSales.filter(s => s.itemType === 'service');
  const productSales = filteredSales.filter(s => s.itemType === 'product');

  const revFromServices = serviceSales.reduce((acc, s) => acc + s.amount, 0);
  const revFromProducts = productSales.reduce((acc, s) => acc + s.amount, 0);

  // Calcular comisiones devengadas por colaborador en tiempo real
  const collaboratorStats = collaborators.map(col => {
    const colSales = filteredSales.filter(s => s.collaboratorId === col.id);
    const colEarnings = colSales.reduce((acc, s) => acc + s.amount, 0);
    const colCommissions = colSales.reduce((acc, s) => acc + (s.amount * (col.commissionRate / 100)), 0);

    return {
      ...col,
      totalSalesCount: colSales.length,
      earnings: colEarnings,
      commissionEarned: colCommissions
    };
  });

  // --- CUSTOM SVG GRAPH MATRIX ---
  // Representamos datos visuales de ventas usando SVG puro, elegante, escalable y sin problemas de dependencias en React 19.
  const getChartData = () => {
    if (salesFilter === 'daily') {
      return [
        { label: '09:00', val: 120 },
        { label: '11:00', val: 320 },
        { label: '13:00', val: 80 },
        { label: '15:00', val: 240 },
        { label: '17:00', val: 420 },
        { label: '19:00', val: 180 }
      ];
    } else if (salesFilter === 'weekly') {
      return [
        { label: 'Lun', val: 110 },
        { label: 'Mar', val: 320 },
        { label: 'Mié', val: 450 },
        { label: 'Jue', val: 180 },
        { label: 'Vie', val: 540 },
        { label: 'Sáb', val: 680 },
        { label: 'Dom', val: 95 }
      ];
    } else if (salesFilter === 'monthly') {
      return [
        { label: 'Sem 1', val: 1150 },
        { label: 'Sem 2', val: 1420 },
        { label: 'Sem 3', val: 980 },
        { label: 'Sem 4', val: 1890 }
      ];
    } else {
      return [
        { label: 'Ene', val: 3400 },
        { label: 'Feb', val: 4100 },
        { label: 'Mar', val: 3900 },
        { label: 'Abr', val: 4800 },
        { label: 'May', val: 5100 },
        { label: 'Jun', val: 6200 },
        { label: 'Jul', val: 7400 },
        { label: 'Ago', val: 3200 },
        { label: 'Sep', val: 4100 },
        { label: 'Oct', val: 5500 },
        { label: 'Nov', val: 6100 },
        { label: 'Dic', val: 8900 }
      ];
    }
  };

  const chartData = getChartData();
  const maxVal = Math.max(...chartData.map(d => d.val), 500);

  // Export sales data to spreadsheet (CSV) format
  const exportSalesToCSV = () => {
    setIsReportDownloaded(true);
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "Fecha,Tipo,Item/Tratamiento,Vendido por,Metodo de Pago,Monto (USD)\n";
    
    filteredSales.forEach(sale => {
      const row = [
        sale.date,
        sale.itemType === 'service' ? 'Cita' : 'Cosmético',
        `"${sale.itemName.replace(/"/g, '""')}"`,
        `"${sale.collaboratorName.replace(/"/g, '""')}"`,
        sale.paymentMethod,
        sale.amount
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Ventas_${currentTenant.id.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('✓ Planilla de cálculo (CSV) exportada con éxito.');
  };

  // Trigger simulated print window of financial report
  const printFinancialReport = () => {
    setIsReportDownloaded(true);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const commissionTableRows = collaboratorStats.map(c => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${c.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${c.role}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${c.commissionRate}%</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${c.totalSalesCount}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; color: #10B981;">$${c.commissionEarned.toFixed(2)}</td>
      </tr>
    `).join('');

    const recentSalesRows = filteredSales.map(s => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 11px;">${s.date}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 11px; text-transform: uppercase;">${s.itemType}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 11px;">${s.itemName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 11px;">${s.collaboratorName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 11px; font-weight: bold; text-align: right;">$${s.amount}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte Financiero Aura NY - ${currentTenant.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; line-height: 1.5; }
            .header { border-bottom: 2px solid #222; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
            .meta { text-align: right; font-size: 12px; color: #666; }
            .metrics-grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .metric-card { background: #f9f9f9; border: 1px solid #eee; padding: 20px; border-radius: 8px; text-align: center; }
            .metric-val { font-size: 28px; font-weight: bold; color: #b45309; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background: #111; color: #fff; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            h3 { border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 16px; text-transform: uppercase; color: #444; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header">
            <div>
              <div class="logo">${currentTenant.logo}</div>
              <div style="font-size: 12px; color: #555; margin-top: 4px;">NYC Premium Multi-Tenant Aesthetics network</div>
              <div style="font-size: 11px; color: #888;">${currentTenant.address} | ${currentTenant.phone}</div>
            </div>
            <div class="meta">
              <strong>BALANCE FINANCIERO AUTOMATIZADO</strong><br/>
              Fecha: ${new Date().toISOString().split('T')[0]}<br/>
              Rango: ${salesFilter.toUpperCase()}<br/>
              Inquilino ID: ${currentTenant.id}
            </div>
          </div>

          <div class="metrics-grid">
            <div class="metric-card">
              <div style="font-size: 11px; text-transform: uppercase; color: #666;">Facturación Total</div>
              <div class="metric-val">$${totalRevenue}</div>
            </div>
            <div class="metric-card">
              <div style="font-size: 11px; text-transform: uppercase; color: #666;">Ingresos por Servicios</div>
              <div class="metric-val">$${revFromServices}</div>
            </div>
            <div class="metric-card">
              <div style="font-size: 11px; text-transform: uppercase; color: #666;">Ingresos por Productos</div>
              <div class="metric-val">$${revFromProducts}</div>
            </div>
          </div>

          <h3>1. Balance de Liquidación de Comisiones de Colaboradores</h3>
          <table>
            <thead>
              <tr>
                <th>Profesional</th>
                <th>Rol / Especialidad</th>
                <th style="text-align: center;">Tasa Comisión</th>
                <th style="text-align: right;">Citas Atendidas</th>
                <th style="text-align: right;">Monto de Comisión a Pagar</th>
              </tr>
            </thead>
            <tbody>
              ${commissionTableRows}
            </tbody>
          </table>

          <h3>2. Registro de Auditoría de Ventas Recientes</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Ítem / Tratamiento</th>
                <th>Realizado por</th>
                <th style="text-align: right;">Total Cobrado</th>
              </tr>
            </thead>
            <tbody>
              ${recentSalesRows}
            </tbody>
          </table>

          <div style="margin-top: 60px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 10px; color: #888; text-align: center;">
            Documento financiero certificado por Aura NY Stripe Ingress API. Firma autorizada por el inquilino administrador.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Simulated outbound WhatsApp sender console test
  const [testNum, setTestNum] = useState('+1 (212) 555-0142');
  const [testName, setTestName] = useState('Sarah Jessica');
  const [testMsg, setTestMsg] = useState('Hola Sarah Jessica, tu recordatorio de cita está programado para mañana.');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white min-h-screen font-sans text-left">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT BAR: Navigation Panel (3 Columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            {/* User Session Info */}
            <div className="flex flex-col space-y-2 mb-6 pb-4 border-b border-neutral-800">
              <div className="flex items-center space-x-2.5">
                <div className={`p-1.5 rounded-xl text-neutral-950 font-bold font-mono text-[10px] shadow-sm uppercase ${session.role === 'admin' ? 'bg-amber-500' : 'bg-indigo-400'}`}>
                  {session.role === 'admin' ? 'INQUILINO' : 'COLABORADOR'}
                </div>
                <span className="text-[9px] font-mono text-neutral-500 tracking-wider">LICENCIA: {session.licenseCode}</span>
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight text-neutral-100">¡Hola, {session.name}!</h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">Soporte: <a href="mailto:dragoprot26@gmail.com" className="text-amber-500 hover:underline">dragoprot26@gmail.com</a></p>
              </div>
            </div>

            {/* Navigation Tab list (filtered for collaborator) */}
            <nav className="space-y-1.5">
              <button
                id="tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <TrendingUp className="h-4.5 w-4.5" />
                  <span>Mi Dashboard</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'dashboard' ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-800 text-neutral-400'}`}>
                  USD
                </span>
              </button>

              <button
                id="tab-appointments"
                onClick={() => setActiveTab('appointments')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'appointments'
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Calendar className="h-4.5 w-4.5" />
                  <span>Agenda / Turnos</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'appointments' ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-800 text-amber-500 font-bold'}`}>
                  {appointments.length}
                </span>
              </button>

              {isUserAdmin && (
                <button
                  id="tab-services"
                  onClick={() => setActiveTab('services')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === 'services'
                      ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Scissors className="h-4.5 w-4.5" />
                    <span>Servicios</span>
                  </div>
                  <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                    {services.length}
                  </span>
                </button>
              )}

              <button
                id="tab-products"
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Package className="h-4.5 w-4.5" />
                  <span>Productos</span>
                </div>
                <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                  {products.length}
                </span>
              </button>

              {isUserAdmin && (
                <button
                  id="tab-collaborators"
                  onClick={() => setActiveTab('collaborators')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === 'collaborators'
                      ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Users className="h-4.5 w-4.5" />
                    <span>Colaboradores</span>
                  </div>
                  <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                    {collaborators.length}
                  </span>
                </button>
              )}

              <button
                id="tab-retiro"
                onClick={() => setActiveTab('retiro')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'retiro'
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <QrCode className="h-4.5 w-4.5 text-amber-500" />
                  <span>Pedidos Retiro</span>
                </div>
                <span className="text-[10px] font-mono bg-neutral-800 text-amber-500 px-1.5 py-0.5 rounded font-bold animate-pulse">
                  {retiroOrders.filter(o => o.status === 'pending').length}
                </span>
              </button>

              <button
                id="tab-comments"
                onClick={() => setActiveTab('comments')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === 'comments'
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <MessageSquare className="h-4.5 w-4.5 text-amber-500" />
                  <span>Comentarios</span>
                </div>
                {comments.filter(c => !c.approved && c.tenantId === currentTenant.id).length > 0 && (
                  <span className="text-[10px] font-mono bg-red-600 text-white px-2 py-0.5 rounded-full font-bold animate-bounce">
                    {comments.filter(c => !c.approved && c.tenantId === currentTenant.id).length}
                  </span>
                )}
              </button>

              {isUserAdmin && (
                <>
                  <button
                    id="tab-theme"
                    onClick={() => setActiveTab('theme')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      activeTab === 'theme'
                        ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Palette className="h-4.5 w-4.5" />
                      <span>Tema de Página</span>
                    </div>
                    <span className="text-[10px] font-mono bg-neutral-800 text-amber-500 px-1.5 py-0.5 rounded">
                      GUI
                    </span>
                  </button>

                  <button
                    id="tab-config"
                    onClick={() => setActiveTab('config')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      activeTab === 'config'
                        ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Settings className="h-4.5 w-4.5" />
                      <span>Configuración Local</span>
                    </div>
                    <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                      PWA
                    </span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Colaborador PRESENCIA & TIMER FICHA */}
          {session.role === 'collaborator' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4 shadow-xl">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">Mi Ficha de Presencia</span>
                <span className="relative flex h-2 w-2">
                  {(() => {
                    const myCol = collaborators.find(c => c.id === session.collaboratorId);
                    const status = myCol?.presenceStatus || 'offline';
                    if (status === 'online') {
                      return (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </>
                      );
                    } else if (status === 'pending') {
                      return (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                        </>
                      );
                    } else {
                      return <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-600"></span>;
                    }
                  })()}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Estado en Vivo:</span>
                  {(() => {
                    const myCol = collaborators.find(c => c.id === session.collaboratorId);
                    const status = myCol?.presenceStatus || 'offline';
                    if (status === 'online') {
                      return <span className="text-emerald-400 font-bold uppercase">APROBADO (ONLINE)</span>;
                    } else if (status === 'pending') {
                      return <span className="text-yellow-400 font-bold uppercase animate-pulse">PENDIENTE DE APERTURA</span>;
                    } else {
                      return <span className="text-rose-500 font-bold uppercase">ACCESO RECHAZADO / DENEGADO</span>;
                    }
                  })()}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Tiempo de Sesión:</span>
                  <span className="text-white font-bold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                    {Math.floor(inactivitySeconds / 60)}:{(inactivitySeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Botón de simulación acelerada de inactividad de 45 minutos */}
              <button
                type="button"
                onClick={() => {
                  setInactivitySeconds(5);
                  alert('Se ha acelerado el temporizador de inactividad de 45 minutos. En 5 segundos expirará la sesión.');
                }}
                className="w-full bg-neutral-950 hover:bg-rose-950 text-[10px] font-mono text-rose-400 border border-neutral-850 hover:border-rose-900/30 py-2 rounded-xl transition-all uppercase tracking-widest cursor-pointer"
              >
                ⌛ Simular Inactividad (Expirar)
              </button>
            </div>
          )}

          {/* ADMIN: Solicitudes de colaboradores pendientes (Titilando en Amarillo) */}
          {isUserAdmin && collaborators.some(c => c.presenceStatus === 'pending') && (
            <div className="bg-yellow-500/10 border-2 border-yellow-500/40 rounded-2xl p-4 space-y-3 shadow-xl animate-pulse">
              <div className="flex items-center gap-1.5 text-yellow-400">
                <AlertTriangle className="h-4.5 w-4.5 animate-bounce" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">Aprobación de Presencia en Vivo</span>
              </div>
              <p className="text-[11px] text-yellow-200">
                Hay colaboradores que ingresaron con su licencia y necesitan autorización para habilitar su jornada.
              </p>

              <div className="space-y-2.5 pt-1">
                {collaborators.filter(c => c.presenceStatus === 'pending').map(col => (
                  <div key={col.id} className="bg-neutral-950 p-2.5 rounded-xl border border-yellow-500/25 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <img src={col.avatar} className="h-7 w-7 rounded-full object-cover border border-yellow-500/30" alt={col.name} />
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{col.name}</h4>
                        <span className="text-[9px] font-mono text-neutral-400">{col.role}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onApproveCollaborator(col.id, true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 p-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        title="Aprobar ingreso"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onApproveCollaborator(col.id, false)}
                        className="bg-rose-500 hover:bg-rose-400 text-white p-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        title="Rechazar ingreso"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick System Diagnostics */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-[11px] font-mono text-neutral-400 space-y-1.5">
            <div className="flex justify-between">
              <span>Local ID Licencia:</span>
              <span className="text-white font-bold">{currentTenant.id.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Estado del Panel:</span>
              <span className="text-emerald-400">● Certificado CyC</span>
            </div>
            <div className="flex justify-between">
              <span>Soporte Oficial:</span>
              <span className="text-amber-500 hover:underline cursor-pointer">dragoprot26@gmail.com</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Dynamic View Area (9 Columns) */}
        <div className="lg:col-span-9 space-y-6">

          <AnimatePresence mode="wait">
            
            {/* 1. DASHBOARD HUB */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Header Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden shadow-md">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Facturación Activa</span>
                    <h4 className="text-2xl font-mono font-extrabold mt-1 text-white">${totalRevenue}</h4>
                    <span className="text-[9px] text-amber-500 font-mono mt-2 block">Rango: {salesFilter.toUpperCase()}</span>
                    <DollarSign className="absolute right-3 bottom-3 h-8 w-8 text-neutral-800/40" />
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden shadow-md">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Tratamientos</span>
                    <h4 className="text-2xl font-mono font-extrabold mt-1 text-emerald-400">${revFromServices}</h4>
                    <span className="text-[9px] text-neutral-400 font-mono mt-2 block">{serviceSales.length} Citas liquidadas</span>
                    <Scissors className="absolute right-3 bottom-3 h-8 w-8 text-neutral-800/40" />
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden shadow-md">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Venta Cosméticos</span>
                    <h4 className="text-2xl font-mono font-extrabold mt-1 text-amber-500">${revFromProducts}</h4>
                    <span className="text-[9px] text-neutral-400 font-mono mt-2 block">{productSales.length} Envases vendidos</span>
                    <Package className="absolute right-3 bottom-3 h-8 w-8 text-neutral-800/40" />
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 relative overflow-hidden shadow-md">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Colaboradores</span>
                    <h4 className="text-2xl font-mono font-extrabold mt-1 text-white">{collaborators.length}</h4>
                    <span className="text-[9px] text-neutral-400 font-mono mt-2 block">Tasa comisiones activa</span>
                    <Users className="absolute right-3 bottom-3 h-8 w-8 text-neutral-800/40" />
                  </div>
                </div>

                {/* GRAPH SECTION (Automated live chart switcher!) */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider">Reporte de Caja e Ingresos</h3>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">ESTADÍSTICAS FINANCIERAS EN TIEMPO REAL</p>
                    </div>

                    <div className="bg-neutral-950 p-1 rounded-xl border border-neutral-800 flex space-x-1 shadow-inner self-start sm:self-auto">
                      {(['daily', 'weekly', 'monthly', 'annual'] as const).map((time) => (
                        <button
                          key={time}
                          id={`filter-sales-${time}`}
                          onClick={() => setSalesFilter(time)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider transition-all uppercase ${
                            salesFilter === time
                              ? 'bg-amber-500 text-neutral-950 shadow-sm'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {time === 'daily' ? 'Diario' : time === 'weekly' ? 'Semanal' : time === 'monthly' ? 'Mensual' : 'Anual'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Elegant High-Fidelity Custom SVG Graph */}
                  <div className="h-64 relative">
                    <svg className="w-full h-full" viewBox="0 0 600 240">
                      {/* Grid Lines */}
                      <line x1="40" y1="30" x2="570" y2="30" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="40" y1="80" x2="570" y2="80" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="40" y1="130" x2="570" y2="130" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="40" y1="180" x2="570" y2="180" stroke="#1f2937" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="40" y1="180" x2="570" y2="180" stroke="#374151" strokeWidth="1.5" />

                      {/* Bars & Labels */}
                      {chartData.map((d, index) => {
                        const colWidth = 530 / chartData.length;
                        const barWidth = colWidth * 0.55;
                        const barHeight = (d.val / maxVal) * 140; // max height is 140px
                        const x = 40 + (index * colWidth) + (colWidth - barWidth) / 2;
                        const y = 180 - barHeight;

                        return (
                          <g key={index} className="group cursor-pointer">
                            {/* Bar background hover highlighting */}
                            <rect 
                              x={40 + (index * colWidth)} 
                              y="20" 
                              width={colWidth} 
                              height="170" 
                              fill="rgba(251, 191, 36, 0.01)" 
                              className="hover:fill-amber-500/5 transition-colors"
                            />
                            
                            {/* Visual Bar */}
                            <rect
                              x={x}
                              y={y}
                              width={barWidth}
                              height={barHeight}
                              rx="4"
                              fill={index % 2 === 0 ? '#d4af37' : '#f59e0b'}
                              className="transition-all duration-500 origin-bottom"
                            />

                            {/* Value tooltip above bar */}
                            <text
                              x={x + barWidth / 2}
                              y={y - 8}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="9"
                              fontWeight="bold"
                              fontFamily="monospace"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ${d.val}
                            </text>

                            {/* Label */}
                            <text
                              x={x + barWidth / 2}
                              y="198"
                              textAnchor="middle"
                              fill="#9ca3af"
                              fontSize="9"
                              fontFamily="monospace"
                            >
                              {d.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Summary of chart */}
                  <div className="flex flex-wrap items-center justify-between text-xs font-mono text-neutral-400 mt-4 border-t border-neutral-800 pt-4">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Servicio de Color</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400"></span> Cosmética</span>
                    </div>
                    <span>Facturación Máxima de Rango: <strong className="text-white">${maxVal} USD</strong></span>
                  </div>
                </div>

                {/* LIQUIDACION DE COMISIONES (REAL-TIME COLLABORATORS REVENUES!) */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-neutral-800">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider">Cálculo de Comisiones de Colaboradores</h3>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">LIQUIDACIÓN SEGÚN DESEMPEÑO INDIVIDUAL Y TASA PERSONALIZADA</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        id="export-financial-report"
                        onClick={printFinancialReport}
                        className="bg-neutral-800 hover:bg-neutral-700 text-amber-500 hover:text-white border border-neutral-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all uppercase shadow-md"
                        title="Imprimir o exportar PDF"
                      >
                        <FileDown className="h-4 w-4" />
                        Imprimir PDF
                      </button>

                      <button
                        id="export-sales-csv"
                        onClick={exportSalesToCSV}
                        className="bg-emerald-950/40 hover:bg-emerald-900 text-emerald-400 hover:text-white border border-emerald-800/60 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all uppercase shadow-md"
                        title="Exportar a Excel / Planilla de cálculo (CSV)"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Exportar Planilla (CSV)
                      </button>

                      {isUserAdmin && (
                        <>
                          <button
                            id="clear-sales-db"
                            type="button"
                            onClick={() => {
                              if (confirm('🚨 ATENCIÓN: ¿Seguro que deseas vaciar todo el registro histórico de ventas de la caja? Esta acción es irreversible.')) {
                                onSetSales([]);
                                setIsReportDownloaded(false);
                                alert('✓ Registro de ventas de la caja vaciado correctamente.');
                              }
                            }}
                            className="bg-rose-950/85 hover:bg-rose-900 text-rose-200 border border-rose-800/60 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all uppercase shadow-md"
                          >
                            <Trash2 className="h-4 w-4 text-rose-400" />
                            Limpiar Ventas
                          </button>

                          <button
                            id="clear-deliveries-db"
                            type="button"
                            onClick={() => {
                              if (confirm('🚨 ATENCIÓN: ¿Seguro que deseas vaciar todo el registro de entregas/encargos (retiros)? Esta acción es irreversible.')) {
                                onSetRetiroOrders([]);
                                alert('✓ Registro de entregas y encargos vaciado correctamente.');
                              }
                            }}
                            className="bg-red-950/85 hover:bg-red-900 text-red-200 border border-red-800/60 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all uppercase shadow-md"
                          >
                            <RefreshCw className="h-4 w-4 text-red-400" />
                            Limpiar Entregas
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-neutral-950 text-neutral-400 font-mono text-[10px] tracking-wider uppercase">
                        <tr>
                          <th className="p-4">Profesional</th>
                          <th className="p-4">Tasa Comisión</th>
                          <th className="p-4">Citas Atendidas</th>
                          <th className="p-4">Monto Total Generado</th>
                          <th className="p-4 text-right">Comisión a Pagar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {collaboratorStats.map((col) => (
                          <tr key={col.id} className="hover:bg-neutral-800/20">
                            <td className="p-4 flex items-center space-x-3">
                              <img src={col.avatar} alt={col.name} className="w-8 h-8 rounded-full object-cover border border-neutral-700 shadow-xs" />
                              <div>
                                <span className="font-semibold text-white block">{col.name}</span>
                                <span className="text-[10px] text-neutral-500 font-mono">{col.role}</span>
                              </div>
                            </td>
                            <td className="p-4 font-mono font-bold text-amber-500">{col.commissionRate}%</td>
                            <td className="p-4 font-mono">{col.totalSalesCount}</td>
                            <td className="p-4 font-mono">${col.earnings}</td>
                            <td className="p-4 font-mono font-bold text-emerald-400 text-right text-sm">
                              ${col.commissionEarned.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AUDITED DETAILED SALES LOGS (WHO DID IT, PRODUCT VS SERVICE DETAIL) */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                  <div className="mb-6">
                    <h3 className="text-base font-bold uppercase tracking-wider">Libro Mayor y Registro de Ventas Recientes</h3>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">DETALLE DE CADA TRANSACCIÓN DE SERVICIOS Y PRODUCTOS</p>
                  </div>

                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-neutral-950 text-neutral-400 font-mono text-[10px] tracking-wider uppercase sticky top-0">
                        <tr>
                          <th className="p-4">Fecha</th>
                          <th className="p-4">Tipo</th>
                          <th className="p-4">Tratamiento / Ítem</th>
                          <th className="p-4">Vendido por</th>
                          <th className="p-4">Método</th>
                          <th className="p-4 text-right">Precio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {filteredSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-neutral-800/20">
                            <td className="p-4 font-mono text-[10px]">{sale.date}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                                sale.itemType === 'service' 
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-amber-950 text-amber-500 border border-amber-500/20'
                              }`}>
                                {sale.itemType === 'service' ? 'Cita' : 'Cosmético'}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-white line-clamp-1">{sale.itemName}</td>
                            <td className="p-4 text-neutral-400">{sale.collaboratorName}</td>
                            <td className="p-4 font-mono text-neutral-500">{sale.paymentMethod}</td>
                            <td className="p-4 font-mono font-bold text-white text-right">${sale.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {/* 1.5. AGENDA / APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <motion.div
                key="appointments-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">Total Turnos</span>
                    <h5 className="text-xl font-mono font-extrabold text-white mt-1">{appointments.length}</h5>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider block">Pendientes</span>
                    <h5 className="text-xl font-mono font-extrabold text-amber-500 mt-1">{appointments.filter(a => a.status === 'pending').length}</h5>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Confirmados</span>
                    <h5 className="text-xl font-mono font-extrabold text-emerald-400 mt-1">{appointments.filter(a => a.status === 'confirmed').length}</h5>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">Completados</span>
                    <h5 className="text-xl font-mono font-extrabold text-indigo-400 mt-1">{appointments.filter(a => a.status === 'completed').length}</h5>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-mono text-rose-500 uppercase tracking-wider block">Cancelados</span>
                    <h5 className="text-xl font-mono font-extrabold text-rose-500 mt-1">{appointments.filter(a => a.status === 'cancelled').length}</h5>
                  </div>
                </div>

                {/* Filters and search */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-amber-500" /> Agenda de Turnos Recibidos
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5 font-bold uppercase">HISTORIAL DE CITAS DE BELLEZA Y CÓDIGOS DE ACCESO VINCULADOS</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setAppointmentStatusFilter(status)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                            appointmentStatusFilter === status
                              ? 'bg-amber-500 text-neutral-950 border-amber-500 font-extrabold shadow-md'
                              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                          }`}
                        >
                          {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendientes' : status === 'confirmed' ? 'Confirmados' : status === 'completed' ? 'Completados' : 'Cancelados'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Buscar por código de reserva, nombre de cliente, teléfono, servicio o profesional..."
                      value={appointmentSearchQuery}
                      onChange={(e) => setAppointmentSearchQuery(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-all font-mono"
                    />
                    {appointmentSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setAppointmentSearchQuery('')}
                        className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-neutral-300 text-[10px] uppercase font-mono"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>

                  {/* Appointments Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-neutral-950 text-neutral-400 font-mono text-[10px] tracking-wider uppercase">
                        <tr>
                          <th className="p-4">Cód. Reserva</th>
                          <th className="p-4">Cliente</th>
                          <th className="p-4">Servicio / Tratamiento</th>
                          <th className="p-4">Profesional</th>
                          <th className="p-4">Fecha y Hora</th>
                          <th className="p-4">Monto</th>
                          <th className="p-4">Retiro Cosméticos</th>
                          <th className="p-4 text-center">Estado</th>
                          <th className="p-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60 font-sans">
                        {(() => {
                          const searched = appointments.filter(app => {
                            const q = appointmentSearchQuery.toLowerCase();
                            const matchedSrv = services.find(s => s.id === app.serviceId)?.name || '';
                            const matchedCol = collaborators.find(c => c.id === app.collaboratorId)?.name || '';
                            const codeStr = (app as any).code || '';
                            const retiroCodeStr = (app as any).retiroCode || '';
                            return (
                              app.clientName.toLowerCase().includes(q) ||
                              app.clientPhone.includes(q) ||
                              app.clientEmail.toLowerCase().includes(q) ||
                              matchedSrv.toLowerCase().includes(q) ||
                              matchedCol.toLowerCase().includes(q) ||
                              codeStr.toLowerCase().includes(q) ||
                              retiroCodeStr.toLowerCase().includes(q)
                            );
                          });

                          const filtered = searched.filter(app => {
                            if (appointmentStatusFilter === 'all') return true;
                            return app.status === appointmentStatusFilter;
                          });

                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan={9} className="text-center py-16 text-neutral-500 font-mono text-xs">
                                  No se encontraron turnos con los filtros aplicados.
                                </td>
                              </tr>
                            );
                          }

                          return filtered.map((app) => {
                            const matchedSrv = services.find(s => s.id === app.serviceId);
                            const matchedCol = collaborators.find(c => c.id === app.collaboratorId);
                            const code = (app as any).code || `RES-GEN-${app.id.substring(4, 8).toUpperCase()}`;
                            const retiroCode = (app as any).retiroCode;

                            return (
                              <tr key={app.id} className="hover:bg-neutral-800/10 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-[10px] border border-amber-500/20">
                                      {code}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(code);
                                        alert('✓ Código de Reserva copiado.');
                                      }}
                                      className="text-neutral-500 hover:text-white p-1 transition-colors cursor-pointer"
                                      title="Copiar Código"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div>
                                    <span className="font-bold text-white block">{app.clientName}</span>
                                    <span className="text-[10px] text-neutral-400 font-mono block">{app.clientPhone}</span>
                                    {app.clientEmail && <span className="text-[9px] text-neutral-500 font-mono block">{app.clientEmail}</span>}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div>
                                    <span className="font-semibold text-white block">{matchedSrv?.name || 'Servicio Desconocido'}</span>
                                    <span className="text-[9px] text-neutral-400 font-mono block uppercase tracking-wider">{matchedSrv?.category}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    {matchedCol?.avatar && (
                                      <img src={matchedCol.avatar} alt={matchedCol.name} className="w-6 h-6 rounded-full object-cover border border-neutral-800" />
                                    )}
                                    <span className="text-neutral-200">{matchedCol?.name || 'Colaborador'}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div>
                                    <span className="text-white font-mono block">{app.date}</span>
                                    <span className="text-amber-500 font-mono block font-semibold">{app.time} hs</span>
                                  </div>
                                </td>
                                <td className="p-4 font-mono font-bold text-white">${app.price}</td>
                                <td className="p-4">
                                  {retiroCode ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] border border-emerald-500/10 font-bold">
                                        {retiroCode}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(retiroCode);
                                          alert('✓ Código de Retiro copiado.');
                                        }}
                                        className="text-neutral-500 hover:text-white p-1 transition-colors cursor-pointer"
                                        title="Copiar Código de Retiro"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-neutral-600 font-mono">Sin Cosméticos</span>
                                  )}
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                                    app.status === 'confirmed'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20'
                                      : app.status === 'completed'
                                      ? 'bg-indigo-950 text-indigo-400 border border-indigo-500/20'
                                      : app.status === 'cancelled'
                                      ? 'bg-rose-950 text-rose-400 border border-rose-500/20'
                                      : 'bg-amber-950 text-amber-500 border border-amber-500/20'
                                  }`}>
                                    {app.status === 'confirmed' ? 'Confirmado' : app.status === 'completed' ? 'Atendido' : app.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    {app.status === 'confirmed' && onSetAppointments && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = appointments.map(a => a.id === app.id ? { ...a, status: 'completed' as const } : a);
                                          onSetAppointments(updated);
                                          setDashboardToast({
                                            message: '✓ Cita marcada como atendida (completada).',
                                            type: 'success'
                                          });
                                        }}
                                        className="bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/30 px-2 py-1 rounded-lg text-[10px] transition-all font-mono uppercase cursor-pointer"
                                        title="Marcar como Atendido"
                                      >
                                        Atendido
                                      </button>
                                    )}
                                    {app.status !== 'cancelled' && onSetAppointments && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAppointmentToCancel(app.id);
                                        }}
                                        className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/30 px-2 py-1 rounded-lg text-[10px] transition-all font-mono uppercase cursor-pointer"
                                        title="Cancelar Turno"
                                      >
                                        Cancelar
                                      </button>
                                    )}
                                    {!onSetAppointments && (
                                      <span className="text-[10px] text-neutral-600 font-mono">Solo lectura</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. SERVICES TAB (MANAGE SERVICES + ADD CUSTOM FIELDS) */}
            {activeTab === 'services' && (
              <motion.div
                key="services-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Form to add service (7 columns) */}
                <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                  <div className="mb-6 pb-4 border-b border-neutral-800">
                    <h3 className="text-base font-bold uppercase tracking-wider">
                      {editingServiceId ? 'Editar Servicio Premium' : 'Configurar Nuevo Servicio Premium'}
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      {editingServiceId ? 'MODIFICA EL TRATAMIENTO SELECCIONADO Y SUS CAMPOS' : 'AÑADE SERVICIOS CON CAMPOS PERSONALIZADOS DINÁMICOS'}
                    </p>
                  </div>

                  <form id="add-service-form" onSubmit={handleAddServiceSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="srv-name" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">Nombre del Servicio</label>
                        <input
                          id="srv-name"
                          type="text"
                          required
                          placeholder="Ej. Balayage Signature Brooklyn"
                          value={newSrvName}
                          onChange={(e) => setNewSrvName(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="srv-category" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">Categoría</label>
                        <div className="flex gap-1.5">
                          <select
                            id="srv-category"
                            value={newSrvCategory}
                            onChange={(e) => setNewSrvCategory(e.target.value)}
                            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            {serviceCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const removeCat = prompt('¿Estás seguro que deseas eliminar esta categoría de la lista?', newSrvCategory);
                              if (removeCat) {
                                setServiceCategories(prev => prev.filter(c => c !== removeCat));
                                if (serviceCategories.length > 1) {
                                  setNewSrvCategory(serviceCategories[0]);
                                }
                              }
                            }}
                            className="bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 p-3 rounded-xl border border-neutral-800 transition-colors cursor-pointer flex items-center justify-center text-sm"
                            title="Eliminar categoría seleccionada"
                          >
                            -
                          </button>
                        </div>
                        <div className="mt-2 flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Nueva categoría..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newCategoryName.trim()) return;
                              if (serviceCategories.includes(newCategoryName.trim())) {
                                alert('Esta categoría ya existe.');
                                return;
                              }
                              setServiceCategories(prev => [...prev, newCategoryName.trim()]);
                              setNewSrvCategory(newCategoryName.trim());
                              setNewCategoryName('');
                            }}
                            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            + Cat
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="srv-duration" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">Duración (minutos)</label>
                        <input
                          id="srv-duration"
                          type="number"
                          required
                          value={newSrvDuration}
                          onChange={(e) => setNewSrvDuration(Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="srv-price" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">Precio de Venta ($ USD)</label>
                        <input
                          id="srv-price"
                          type="number"
                          required
                          value={newSrvPrice}
                          onChange={(e) => setNewSrvPrice(Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="srv-desc" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">Descripción de Lujo</label>
                      <textarea
                        id="srv-desc"
                        rows={3}
                        placeholder="Describe detalladamente los beneficios y pasos del tratamiento para llamar la atención del cliente público..."
                        value={newSrvDesc}
                        onChange={(e) => setNewSrvDesc(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="srv-image" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">
                        Imagen del Servicio (Sube una Foto o ingresa URL)
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          id="srv-image"
                          type="text"
                          placeholder="URL de imagen o sube un archivo..."
                          value={newSrvImage}
                          onChange={(e) => setNewSrvImage(e.target.value)}
                          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        />
                        
                        {/* PC/Mobile Upload Button */}
                        <label 
                          className="p-3 bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 hover:border-amber-500 text-neutral-300 hover:text-amber-400 rounded-xl cursor-pointer flex items-center justify-center shrink-0 transition-all gap-1.5 text-xs font-bold font-mono"
                          title="Subir desde PC o móvil"
                        >
                          <Image className="h-4 w-4" />
                          <span>SUBIR</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setNewSrvImage(event.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        {/* Image Preview */}
                        <div className="w-14 h-11 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center relative group">
                          {newSrvImage ? (
                            <>
                              <img src={newSrvImage} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setNewSrvImage('')}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-rose-400 font-bold transition-opacity"
                              >
                                Quitar
                              </button>
                            </>
                          ) : (
                            <span className="text-[9px] text-neutral-600 font-mono text-center">Sin Foto</span>
                          )}
                        </div>
                      </div>

                      {/* Quick Presets packs */}
                      <div className="mt-2 flex flex-wrap gap-2 items-center">
                        <span className="text-[9px] font-mono text-neutral-500">Presets rápidos:</span>
                        <button
                          type="button"
                          onClick={() => setNewSrvImage('https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80')}
                          className="bg-neutral-950 border border-neutral-850 hover:border-neutral-700 text-[9px] font-mono py-1 px-2 rounded-lg text-neutral-400 hover:text-white transition-all"
                        >
                          Corte / Peinado
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewSrvImage('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80')}
                          className="bg-neutral-950 border border-neutral-850 hover:border-neutral-700 text-[9px] font-mono py-1 px-2 rounded-lg text-neutral-400 hover:text-white transition-all"
                        >
                          Coloración
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewSrvImage('https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=600&q=80')}
                          className="bg-neutral-950 border border-neutral-850 hover:border-neutral-700 text-[9px] font-mono py-1 px-2 rounded-lg text-neutral-400 hover:text-white transition-all"
                        >
                          Trat. Facial
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewSrvImage('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80')}
                          className="bg-neutral-950 border border-neutral-850 hover:border-neutral-700 text-[9px] font-mono py-1 px-2 rounded-lg text-neutral-400 hover:text-white transition-all"
                        >
                          Maquillaje
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewSrvImage('https://images.unsplash.com/photo-1519415590294-40647e2285b5?auto=format&fit=crop&w=600&q=80')}
                          className="bg-neutral-950 border border-neutral-850 hover:border-neutral-700 text-[9px] font-mono py-1 px-2 rounded-lg text-neutral-400 hover:text-white transition-all"
                        >
                          Manicura
                        </button>
                      </div>
                    </div>

                    {/* DYNAMIC FIELD CONFIGURATOR ("+ botón para agregar campos") */}
                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-4">
                      <div>
                        <span className="text-[10px] font-mono text-amber-500 block">⚡ Configuración de Campos Personalizados para Clientes</span>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Define preguntas que completará el cliente al reservar este tratamiento.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          id="field-label"
                          type="text"
                          placeholder="Etiqueta. Ej: Tipo de Pelo"
                          value={fieldLabel}
                          onChange={(e) => setFieldLabel(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <select
                          id="field-type"
                          value={fieldType}
                          onChange={(e) => setFieldType(e.target.value as any)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="text">Texto Libre</option>
                          <option value="number">Número</option>
                          <option value="boolean">Verdadero / Falso (Checkbox)</option>
                          <option value="select">Lista de Opciones</option>
                        </select>
                        <button
                          id="add-custom-field-service"
                          type="button"
                          onClick={addCustomFieldToService}
                          className="w-full bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-mono font-bold px-3 py-2 rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all border border-neutral-700"
                        >
                          <Plus className="h-3.5 w-3.5" /> AGREGAR CAMPO
                        </button>
                      </div>

                      {fieldType === 'select' && (
                        <div>
                          <input
                            id="field-options"
                            type="text"
                            placeholder="Opciones separadas por coma. Ej: Corto, Largo, Extra Largo"
                            value={fieldOptions}
                            onChange={(e) => setFieldOptions(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                      )}

                      {newSrvFields.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-neutral-900">
                          <span className="text-[9px] font-mono text-neutral-400 block uppercase">Campos añadidos para este servicio:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {newSrvFields.map((field, idx) => (
                              <span key={field.id} className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-[9px] font-mono text-neutral-300 flex items-center gap-1.5">
                                <strong>{field.label}</strong> ({field.type})
                                <button 
                                  id={`delete-field-srv-${idx}`}
                                  type="button" 
                                  onClick={() => setNewSrvFields(prev => prev.filter(f => f.id !== field.id))}
                                  className="text-rose-500 hover:text-rose-400 font-bold"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        id="save-service-button"
                        type="submit"
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3.5 rounded-xl text-xs tracking-wider transition-all uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <Check className="h-4 w-4" /> {editingServiceId ? 'ACTUALIZAR TRATAMIENTO' : 'GUARDAR TRATAMIENTO PREMIUM'}
                      </button>

                      {editingServiceId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingServiceId(null);
                            setNewSrvName('');
                            setNewSrvCategory('Coloración');
                            setNewSrvDuration(60);
                            setNewSrvPrice(100);
                            setNewSrvDesc('');
                            setNewSrvImage('');
                            setNewSrvFields([]);
                          }}
                          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-3.5 px-6 rounded-xl text-xs tracking-wider transition-all uppercase cursor-pointer border border-neutral-700"
                        >
                          Cancelar Edición
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* List of current services (5 columns) */}
                <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider">Tratamientos del Inquilino</h3>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">ESTRELLA DE LA ESTÉTICA</p>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {services.map((srv) => (
                      <div key={srv.id} id={`admin-service-item-${srv.id}`} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex items-center justify-between gap-4 text-left">
                        <div className="flex items-center gap-3.5 pr-4 flex-1 min-w-0">
                          {/* Miniatura de Imagen de Servicio */}
                          <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-850 overflow-hidden shrink-0 flex items-center justify-center">
                            {srv.image ? (
                              <img src={srv.image} alt={srv.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[9px] text-neutral-600 font-mono text-center">Sin Foto</span>
                            )}
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/10 uppercase">
                                {srv.category}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-500">{srv.duration} min</span>
                            </div>
                            <h4 className="font-bold text-xs text-white line-clamp-1">{srv.name}</h4>
                            <span className="text-sm font-mono font-bold text-amber-500 block">${srv.price}</span>
                            
                            {srv.customFields && srv.customFields.length > 0 && (
                              <div className="text-[9px] font-mono text-neutral-500 truncate">
                                Campos cliente: {srv.customFields.map(f => f.label).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingServiceId(srv.id);
                              setNewSrvName(srv.name);
                              setNewSrvCategory(srv.category);
                              setNewSrvDuration(srv.duration);
                              setNewSrvPrice(srv.price);
                              setNewSrvDesc(srv.description || '');
                              setNewSrvImage(srv.image || '');
                              setNewSrvFields(srv.customFields || []);
                              
                              // Scroll smoothly to form
                              const formEl = document.getElementById('add-service-form');
                              if (formEl) {
                                formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }
                            }}
                            className="p-2 bg-neutral-900 hover:bg-amber-500/10 text-neutral-500 hover:text-amber-400 rounded-lg border border-neutral-800 hover:border-amber-500/20 cursor-pointer transition-all"
                            title="Editar Tratamiento"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            id={`delete-service-button-${srv.id}`}
                            onClick={() => {
                              if (confirm(`¿Seguro que desea eliminar el servicio "${srv.name}"?`)) {
                                if (editingServiceId === srv.id) {
                                  setEditingServiceId(null);
                                  setNewSrvName('');
                                  setNewSrvDesc('');
                                  setNewSrvImage('');
                                  setNewSrvFields([]);
                                }
                                onDeleteService(srv.id);
                              }
                            }}
                            className="p-2 bg-neutral-900 hover:bg-rose-950/40 text-neutral-500 hover:text-rose-400 rounded-lg border border-neutral-800 hover:border-rose-500/20 cursor-pointer transition-all"
                            title="Eliminar Tratamiento"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. PRODUCTS TAB (MANAGE PRODUCTS + 5 IMAGES, BARCODE SCANNER, SEMAPHORE) */}
            {activeTab === 'products' && (
              <motion.div
                key="products-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
              >
                {/* Product editor (7 columns) - Hidden or disabled for collaborators without admin permission */}
                <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                  {!isUserAdmin ? (
                    <div className="p-8 text-center bg-neutral-950 border border-neutral-850 rounded-xl space-y-4">
                      <Shield className="h-10 w-10 text-indigo-400 mx-auto" />
                      <div>
                        <h4 className="font-bold text-white text-sm">Vista de Catálogo de Cosméticos</h4>
                        <p className="text-xs text-neutral-400 mt-1">
                          Como Colaborador, tienes acceso al stock, códigos de barra y semáforos del catálogo, pero la creación y edición global de productos está restringida al Inquilino Administrador.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="pb-4 border-b border-neutral-800">
                        <h3 className="text-base font-bold uppercase tracking-wider text-amber-500">
                          {editingProdId ? 'Editar Cosmético o Producto de Lujo' : 'Añadir Cosmético o Producto de Lujo'}
                        </h3>
                        <p className="text-xs text-neutral-400 font-mono mt-0.5">REQUISITO DEL INQUILINO: HASTA 5 IMÁGENES CON DETALLE, PRECIO Y CAMPOS DINÁMICOS</p>
                      </div>

                      <form id="add-product-form" onSubmit={handleAddProductSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2">
                            <label htmlFor="prod-name" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">Nombre del Cosmético</label>
                            <input
                              id="prod-name"
                              type="text"
                              required
                              placeholder="Ej. Serum NY Gold Shine"
                              value={newProdName}
                              onChange={(e) => setNewProdName(e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label htmlFor="prod-price" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">Precio ($ USD)</label>
                            <input
                              id="prod-price"
                              type="number"
                              required
                              value={newProdPrice}
                              onChange={(e) => setNewProdPrice(Number(e.target.value))}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="prod-stock" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">Stock de Inventario</label>
                            <input
                              id="prod-stock"
                              type="number"
                              required
                              value={newProdStock}
                              onChange={(e) => setNewProdStock(Number(e.target.value))}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label htmlFor="prod-barcode" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">Código de Barras / Identificador</label>
                            <input
                              id="prod-barcode"
                              type="text"
                              placeholder="Ej: 7791234567890"
                              value={newProdBarcode}
                              onChange={(e) => setNewProdBarcode(e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                            />
                          </div>
                          <div className="flex flex-col justify-end pb-1">
                            <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold select-none bg-neutral-950 hover:bg-neutral-850 p-2.5 rounded-xl border border-neutral-800 transition-colors">
                              <input
                                id="prod-last-units"
                                type="checkbox"
                                checked={newProdLastUnits}
                                onChange={(e) => setNewProdLastUnits(e.target.checked)}
                                className="h-4.5 w-4.5 text-amber-500 focus:ring-amber-500 border-neutral-850 bg-neutral-950 rounded"
                              />
                              <span>Habilitar "Últimos disponibles"</span>
                            </label>
                          </div>
                        </div>

                        {/* IMAGE ASSET MANAGER - INSERTA HASTA 5 IMÁGENES A GUSTO */}
                        <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3 text-left">
                          <div>
                            <span className="text-[10px] font-mono text-amber-500 block">🖼️ Galería del Cosmético (Carga de hasta 5 imágenes)</span>
                            <p className="text-[10px] text-neutral-500 mt-0.5">Define las URLs de las imágenes estéticas para el carrusel de exhibición pública de la PWA.</p>
                          </div>

                          <div className="space-y-2">
                            {newProdImages.map((img, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-500 w-12 shrink-0">Img {idx+1}:</span>
                                <input
                                  id={`product-image-${idx}`}
                                  type="text"
                                  required
                                  value={img}
                                  onChange={(e) => {
                                    const copy = [...newProdImages];
                                    copy[idx] = e.target.value;
                                    setNewProdImages(copy);
                                  }}
                                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[10px] text-neutral-300 font-mono focus:outline-none"
                                  placeholder={`URL de imagen ${idx+1}`}
                                />
                                
                                {/* Botón para subir imagen desde PC/Móvil */}
                                <label 
                                  className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-neutral-400 hover:text-amber-500 rounded-lg cursor-pointer flex items-center justify-center shrink-0 transition-all"
                                  title="Subir imagen desde PC/Móvil 📱💻"
                                >
                                  <Image className="h-3.5 w-3.5" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          if (event.target?.result) {
                                            const copy = [...newProdImages];
                                            copy[idx] = event.target.result as string;
                                            setNewProdImages(copy);
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>

                                <div className="w-12 h-8 rounded bg-neutral-800 overflow-hidden border border-neutral-700 shrink-0">
                                  <img src={img || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=60&q=80'} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Presets images trigger drawer */}
                          <div className="pt-1 flex flex-wrap gap-2">
                            <span className="text-[9px] font-mono text-neutral-400 self-center">Presets rápidos:</span>
                            <button
                              id="preset-pack-serum"
                              type="button"
                              onClick={() => setNewProdImages([
                                'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
                                'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
                                'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
                                'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80',
                                'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80'
                              ])}
                              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded px-2 py-0.5 text-[9px] text-amber-500 font-mono cursor-pointer"
                            >
                              Serum Lujo NYC (5 Img)
                            </button>
                            <button
                              id="preset-pack-lotion"
                              type="button"
                              onClick={() => setNewProdImages([
                                'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80',
                                'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
                                'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80',
                                'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
                                'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
                              ])}
                              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded px-2 py-0.5 text-[9px] text-amber-500 font-mono cursor-pointer"
                            >
                              Pack Completo Aloe (5 Img)
                            </button>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="prod-desc" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">Detalle & Composición del Cosmético</label>
                          <textarea
                            id="prod-desc"
                            rows={2}
                            placeholder="Ingredientes activos, pH balanceado, fragancia, beneficios para el cabello..."
                            value={newProdDesc}
                            onChange={(e) => setNewProdDesc(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none font-sans leading-relaxed"
                          />
                        </div>

                        {/* DYNAMIC FIELD CONFIGURATOR FOR PRODUCTS */}
                        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-4">
                          <div>
                            <span className="text-[10px] font-mono text-amber-500 block">⚡ Campos Técnicos del Cosmético (Ficha Técnica)</span>
                            <p className="text-[10px] text-neutral-500 mt-0.5">Agrega campos técnicos dinámicos con el botón + (pH, volumen, aroma, etc.).</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              id="prod-field-label"
                              type="text"
                              placeholder="Ej: pH Balance"
                              value={pFieldLabel}
                              onChange={(e) => setPFieldLabel(e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                            />
                            <select
                              id="prod-field-type"
                              value={pFieldType}
                              onChange={(e) => setPFieldType(e.target.value as any)}
                              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
                            >
                              <option value="text">Texto</option>
                              <option value="number">Número</option>
                              <option value="boolean">Booleano (Sí/No)</option>
                              <option value="select">Opciones</option>
                            </select>
                            <button
                              id="add-custom-field-product"
                              type="button"
                              onClick={addCustomFieldToProduct}
                              className="w-full bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-mono font-bold px-3 py-2 rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-all border border-neutral-700 uppercase"
                            >
                              <Plus className="h-3.5 w-3.5" /> Agregar campo +
                            </button>
                          </div>

                          {pFieldType === 'select' && (
                            <div>
                              <input
                                id="prod-field-options"
                                type="text"
                                placeholder="Opciones separadas por coma. Ej: 50ml, 100ml, 250ml"
                                value={pFieldOptions}
                                onChange={(e) => setPFieldOptions(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                              />
                            </div>
                          )}

                          {newProdFields.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-neutral-900">
                              <span className="text-[9px] font-mono text-neutral-400 block uppercase">Estructura del campo:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {newProdFields.map((field, idx) => (
                                  <span key={field.id} className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-[9px] font-mono text-neutral-300 flex items-center gap-1.5">
                                    <strong>{field.label}</strong> ({field.type})
                                    <button 
                                      id={`delete-field-prod-${idx}`}
                                      type="button" 
                                      onClick={() => setNewProdFields(prev => prev.filter(f => f.id !== field.id))}
                                      className="text-rose-500 hover:text-rose-400 font-bold"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {editingProdId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProdId(null);
                              setNewProdName('');
                              setNewProdDesc('');
                              setNewProdBarcode('');
                              setNewProdLastUnits(false);
                              setNewProdFields([]);
                              setNewProdImages([
                                'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
                                'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
                                'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
                                'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80',
                                'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80'
                              ]);
                            }}
                            className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2.5 rounded-xl text-xs uppercase cursor-pointer mb-2 border border-neutral-750 transition-all"
                          >
                            Cancelar Edición
                          </button>
                        )}

                        <button
                          id="save-product-button"
                          type="submit"
                          className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3.5 rounded-xl text-xs tracking-wider transition-all uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Check className="h-4 w-4" /> {editingProdId ? 'GUARDAR CAMBIOS EN PRODUCTO' : 'GUARDAR PRODUCTO EN CATÁLOGO'}
                        </button>
                      </form>
                    </>
                  )}
                </div>

                {/* List of products (5 columns) with Barcode Scanner simulator, search, and semaphore filters */}
                <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider">Línea de Cosméticos</h3>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">CATÁLOGO DE PRODUCTOS RECIENTES</p>
                    </div>
                    
                    {/* Botón para Simular Escáner de Código de barras */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowScannerSimulator(!showScannerSimulator);
                        setScannerInputCode('');
                      }}
                      className="bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-500 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                    >
                      <Smartphone className="h-3.5 w-3.5" /> Escáner 📱
                    </button>
                  </div>

                  {/* SIMULADOR DE ESCANEO DE CÓDIGO DE BARRAS MÓVIL */}
                  {showScannerSimulator && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-neutral-950 p-4 rounded-xl border border-amber-500/25 space-y-3 text-left overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">📱 Lector de Código de Barra PWA (Simulado)</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Introduce un código manualmente o presiona un preset para simular el disparo de la cámara trasera sobre un producto.
                      </p>

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Introduce código..."
                          value={scannerInputCode}
                          onChange={(e) => setScannerInputCode(e.target.value)}
                          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!scannerInputCode.trim()) return;
                            const code = scannerInputCode.trim();
                            // Buscar producto
                            const matchedProd = products.find(p => p.barcode === code);
                            if (matchedProd) {
                              setScannedHighlightId(matchedProd.id);
                              alert(`✓ ¡Producto Encontrado!: "${matchedProd.name}" (${matchedProd.barcode}). Se ha resaltado en verde parpadeante en el catálogo.`);
                              // Auto scroll o ubicar
                              const el = document.getElementById(`admin-product-item-${matchedProd.id}`);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              
                              // Limpiar brillo despues de 5 segundos
                              setTimeout(() => setScannedHighlightId(null), 5000);
                            } else {
                              if (confirm(`El código "${code}" no existe en el inventario actual. ¿Deseas darlo de alta de inmediato en el formulario de creación?`)) {
                                setNewProdBarcode(code);
                                setShowScannerSimulator(false);
                                // Foco visual en el input de nombre
                                const inputName = document.getElementById('prod-name');
                                if (inputName) inputName.focus();
                              }
                            }
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all uppercase font-mono"
                        >
                          Escanear
                        </button>
                      </div>

                      {/* Presets rápidos de códigos para pruebas */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[9px] font-mono text-neutral-500 self-center">Escanear rápidos:</span>
                        <button
                          type="button"
                          onClick={() => setScannerInputCode('prod-serum')}
                          className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-[9px] font-mono"
                        >
                          Serum Serum (prod-serum)
                        </button>
                        <button
                          type="button"
                          onClick={() => setScannerInputCode('prod-shampoo')}
                          className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-[9px] font-mono"
                        >
                          Champú Gold (prod-shampoo)
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* BARRA DE BÚSQUEDA Y FILTRADO POR SEMÁFORO */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o código de barra..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1">
                      <span>Filtrar por Popularidad:</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelectedSemaphoreFilter('all')}
                          className={`px-2 py-0.5 rounded-md ${selectedSemaphoreFilter === 'all' ? 'bg-neutral-800 text-white font-bold' : 'hover:text-white'}`}
                        >
                          Todos
                        </button>
                        <button
                          onClick={() => setSelectedSemaphoreFilter('green')}
                          className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${selectedSemaphoreFilter === 'green' ? 'bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30' : 'hover:text-emerald-400'}`}
                          title="Popular (+15 vistas)"
                        >
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span> Vistos
                        </button>
                        <button
                          onClick={() => setSelectedSemaphoreFilter('yellow')}
                          className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${selectedSemaphoreFilter === 'yellow' ? 'bg-yellow-950 text-yellow-400 font-bold border border-yellow-500/30' : 'hover:text-yellow-400'}`}
                          title="Medio (5-15 vistas)"
                        >
                          <span className="h-1.5 w-1.5 bg-yellow-500 rounded-full"></span> Medios
                        </button>
                        <button
                          onClick={() => setSelectedSemaphoreFilter('red')}
                          className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${selectedSemaphoreFilter === 'red' ? 'bg-rose-950 text-rose-400 font-bold border border-rose-500/30' : 'hover:text-rose-400'}`}
                          title="Poco visto (<5 vistas)"
                        >
                          <span className="h-1.5 w-1.5 bg-rose-500 rounded-full"></span> Nuevos
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* LISTADO DE PRODUCTOS FILTRADO */}
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                    {(() => {
                      // Aplicar filtros
                      const searched = products.filter(p => {
                        const sQuery = productSearchQuery.toLowerCase();
                        return (
                          p.name.toLowerCase().includes(sQuery) ||
                          (p.description || '').toLowerCase().includes(sQuery) ||
                          (p.barcode || '').toLowerCase().includes(sQuery)
                        );
                      });

                      const filtered = searched.filter(p => {
                        const views = p.views || 0;
                        if (selectedSemaphoreFilter === 'green') return views >= 15;
                        if (selectedSemaphoreFilter === 'yellow') return views >= 5 && views < 15;
                        if (selectedSemaphoreFilter === 'red') return views < 5;
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-12 text-neutral-500 font-mono text-xs border border-dashed border-neutral-800 rounded-xl bg-neutral-950">
                            No se encontraron cosméticos bajo los filtros aplicados.
                          </div>
                        );
                      }

                      return filtered.map((prod) => {
                        const views = prod.views || 0;
                        let semaphoreColor = 'bg-rose-500';
                        let semaphoreTitle = 'Poco visto / Nuevo (<5 visitas)';
                        if (views >= 15) {
                          semaphoreColor = 'bg-emerald-500';
                          semaphoreTitle = 'Súper Popular (+15 visitas)';
                        } else if (views >= 5) {
                          semaphoreColor = 'bg-yellow-500';
                          semaphoreTitle = 'Interés Medio (5-15 visitas)';
                        }

                        const isScanned = scannedHighlightId === prod.id;

                        return (
                          <div
                            key={prod.id}
                            id={`admin-product-item-${prod.id}`}
                            className={`bg-neutral-950 border p-4 rounded-xl flex items-center justify-between gap-4 text-left transition-all duration-300 ${
                              isScanned 
                                ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-500/10 scale-102 bg-neutral-900 animate-pulse' 
                                : 'border-neutral-800 hover:border-neutral-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              {/* Main image thumbnail with badge for total views and semaphore */}
                              <div className="relative w-14 h-14 rounded-lg bg-neutral-900 overflow-hidden shrink-0 border border-neutral-800">
                                <img src={prod.images[0] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=60&q=80'} alt={prod.name} className="w-full h-full object-cover" />
                                <span
                                  className={`absolute top-1 right-1 h-2 w-2 rounded-full ${semaphoreColor} shadow-md`}
                                  title={semaphoreTitle}
                                ></span>
                              </div>
                              
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-bold text-xs text-white line-clamp-1 leading-tight">{prod.name}</h4>
                                  {prod.isLastUnitsEnabled && (
                                    <span className="bg-amber-500/15 text-amber-500 border border-amber-500/25 text-[8px] font-mono font-bold px-1 rounded">
                                      Últimos disponibles
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm font-mono font-bold text-amber-500 block mt-0.5">${prod.price}</span>
                                
                                <div className="flex flex-col text-[9px] font-mono text-neutral-500 mt-1">
                                  <span>Stock: <strong className="text-neutral-300">{prod.stock} un.</strong></span>
                                  <span className="flex items-center gap-1">
                                    Código: <strong className="text-neutral-300">{prod.barcode || 'N/D'}</strong>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(prod.barcode || '');
                                        alert('✓ Código copiado al portapapeles.');
                                      }}
                                      className="text-neutral-600 hover:text-amber-500 shrink-0"
                                      title="Copiar código"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                  </span>
                                  <span>Visualizaciones: <strong className="text-neutral-400">{views} visitas</strong></span>
                                </div>
                                
                                {prod.customFields && prod.customFields.length > 0 && (
                                  <div className="text-[8px] font-mono text-neutral-600 line-clamp-1 mt-1">
                                    Campos: {prod.customFields.map(f => f.label).join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>

                            {isUserAdmin && (
                              <div className="flex gap-1.5 shrink-0">
                                <button
                                  id={`edit-product-button-${prod.id}`}
                                  onClick={() => {
                                    setEditingProdId(prod.id);
                                    setNewProdName(prod.name);
                                    setNewProdPrice(prod.price);
                                    setNewProdStock(prod.stock);
                                    setNewProdDesc(prod.description || '');
                                    setNewProdBarcode(prod.barcode || '');
                                    setNewProdLastUnits(!!prod.isLastUnitsEnabled);
                                    setNewProdImages(prod.images && prod.images.length === 5 ? prod.images : [
                                      prod.images?.[0] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
                                      prod.images?.[1] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
                                      prod.images?.[2] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
                                      prod.images?.[3] || 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80',
                                      prod.images?.[4] || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80'
                                    ]);
                                    setNewProdFields(prod.customFields || []);
                                    
                                    // Foco en el nombre
                                    const el = document.getElementById('prod-name');
                                    if (el) el.focus();
                                    
                                    // Scroll suave para ubicar el formulario
                                    const formEl = document.getElementById('add-product-form');
                                    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }}
                                  className="p-2 bg-neutral-900 hover:bg-amber-950/45 text-neutral-400 hover:text-amber-500 rounded-lg border border-neutral-800 hover:border-amber-500/20 cursor-pointer transition-all"
                                  title="Editar producto"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>

                                <button
                                  id={`delete-product-button-${prod.id}`}
                                  onClick={() => {
                                    if (confirm(`¿Seguro que desea eliminar el cosmético "${prod.name}" del catálogo?`)) {
                                      onDeleteProduct(prod.id);
                                    }
                                  }}
                                  className="p-2 bg-neutral-900 hover:bg-rose-950/40 text-neutral-450 hover:text-rose-450 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 rounded-lg border border-neutral-800 hover:border-rose-500/20 cursor-pointer transition-all"
                                  title="Eliminar producto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

              </motion.div>
            )}

            {/* 4. COLLABORATORS TAB */}
            {activeTab === 'collaborators' && (
              <motion.div
                key="collaborators-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Add new professional (5 columns) */}
                <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl text-left">
                  <div className="mb-6 pb-4 border-b border-neutral-800">
                    <h3 className="text-base font-bold uppercase tracking-wider">Añadir Profesional Especialista</h3>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">PERFIL PROFESIONAL AVANZADO CON GESTIÓN DE HORARIOS</p>
                  </div>

                  <form id="add-collaborator-form" onSubmit={handleAddColSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="col-name" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">Nombre Completo</label>
                      <input
                        id="col-name"
                        type="text"
                        required
                        placeholder="Ej. Sarah Parker"
                        value={newColName}
                        onChange={(e) => setNewColName(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="col-role" className="block text-[10px] font-mono text-neutral-400 uppercase">Cargo / Rango</label>
                          <button
                            type="button"
                            onClick={() => setShowAddRoleInput(!showAddRoleInput)}
                            className="p-1 bg-neutral-800 hover:bg-amber-500/15 text-neutral-400 hover:text-amber-500 rounded-md transition-all border border-neutral-700/50 cursor-pointer flex items-center justify-center"
                            title="Añadir Nuevo Cargo"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <AnimatePresence>
                          {showAddRoleInput && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden mb-2"
                            >
                              <div className="flex gap-1.5 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                                <input
                                  type="text"
                                  value={newCustomRole}
                                  onChange={(e) => setNewCustomRole(e.target.value)}
                                  placeholder="Ej: Colorista Senior"
                                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none placeholder:text-neutral-600"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (newCustomRole.trim()) {
                                      const r = newCustomRole.trim();
                                      if (!availableRoles.includes(r)) {
                                        setAvailableRoles(prev => [...prev, r]);
                                      }
                                      setNewColRole(r);
                                      setNewCustomRole('');
                                      setShowAddRoleInput(false);
                                      // Trigger a nice toast
                                      setDashboardToast({
                                        message: `✓ Cargo "${r}" agregado con éxito.`,
                                        type: 'success'
                                      });
                                    }
                                  }}
                                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-2 rounded-lg text-[10px] transition-all uppercase flex items-center justify-center cursor-pointer"
                                >
                                  OK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddRoleInput(false);
                                    setNewCustomRole('');
                                  }}
                                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-400 px-2 rounded-lg text-[10px] transition-all cursor-pointer flex items-center justify-center"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <select
                          id="col-role"
                          value={newColRole}
                          onChange={(e) => setNewColRole(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                        >
                          {availableRoles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="col-commission" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">Monto de Comisión (%)</label>
                        <input
                          id="col-commission"
                          type="number"
                          required
                          value={newColCommission}
                          onChange={(e) => setNewColCommission(Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase">Especialidades Asignadas</label>
                        <button
                          type="button"
                          onClick={() => setShowAddSpecialtyInput(!showAddSpecialtyInput)}
                          className="p-1 bg-neutral-800 hover:bg-amber-500/15 text-neutral-400 hover:text-amber-500 rounded-md transition-all border border-neutral-700/50 cursor-pointer flex items-center justify-center"
                          title="Añadir Nueva Especialidad"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <AnimatePresence>
                        {showAddSpecialtyInput && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-3.5"
                          >
                            <div className="flex gap-1.5 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                              <input
                                type="text"
                                value={newCustomSpecialty}
                                onChange={(e) => setNewCustomSpecialty(e.target.value)}
                                placeholder="Ej: Masajista, Kinesiólogo, Barbería..."
                                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none placeholder:text-neutral-600"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newCustomSpecialty.trim()) {
                                    const s = newCustomSpecialty.trim();
                                    if (!availableSpecialties.includes(s)) {
                                      setAvailableSpecialties(prev => [...prev, s]);
                                    }
                                    if (!newColSpecialties.includes(s)) {
                                      setNewColSpecialties(prev => [...prev, s]);
                                    }
                                    setNewCustomSpecialty('');
                                    setShowAddSpecialtyInput(false);
                                    setDashboardToast({
                                      message: `✓ Especialidad "${s}" agregada y seleccionada.`,
                                      type: 'success'
                                    });
                                  }
                                }}
                                className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-2 rounded-lg text-[10px] transition-all uppercase flex items-center justify-center cursor-pointer"
                              >
                                OK
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAddSpecialtyInput(false);
                                  setNewCustomSpecialty('');
                                }}
                                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-400 px-2 rounded-lg text-[10px] transition-all cursor-pointer flex items-center justify-center"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {availableSpecialties.map((cat) => {
                          const has = newColSpecialties.includes(cat);
                          return (
                            <div
                              key={cat}
                              onClick={() => {
                                setNewColSpecialties(prev => 
                                  has ? prev.filter(c => c !== cat) : [...prev, cat]
                                );
                              }}
                              className={`cursor-pointer px-3 py-2 rounded-xl border text-center transition-all truncate ${
                                has 
                                  ? 'bg-amber-500/10 border-amber-500 text-white font-semibold' 
                                  : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                              }`}
                              title={cat}
                            >
                              {cat}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="col-hours" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1.5">Rango de Horario</label>
                      <input
                        id="col-hours"
                        type="text"
                        required
                        placeholder="09:00 - 18:00"
                        value={newColHours}
                        onChange={(e) => setNewColHours(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2.5 py-1.5 px-3 bg-neutral-950/50 border border-neutral-850 rounded-xl">
                      <input
                        type="checkbox"
                        id="col-is-admin-input"
                        checked={newColIsAdmin}
                        onChange={(e) => setNewColIsAdmin(e.target.checked)}
                        className="accent-amber-500 h-4 w-4 rounded border-neutral-800 bg-neutral-950 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="col-is-admin-input" className="text-[10px] font-mono text-neutral-300 font-bold uppercase tracking-wider cursor-pointer">
                        Habilitar Acceso Administrador Completo
                      </label>
                    </div>

                    <button
                      id="save-collaborator-button"
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3.5 rounded-xl text-xs tracking-wider transition-all uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Plus className="h-4 w-4" /> REGISTRAR COLABORADOR NUEVO
                    </button>
                  </form>
                </div>

                {/* Show team members cards (7 columns) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                    <div className="mb-6">
                      <h3 className="text-base font-bold uppercase tracking-wider">Equipo de Especialistas</h3>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">PERFILES DE RENDIMIENTO Y CALIFICACIÓN DE CLIENTES</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {collaboratorStats.map((col) => (
                        <div key={col.id} id={`admin-collaborator-card-${col.id}`} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex flex-col justify-between text-left space-y-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center space-x-3">
                              <img src={col.avatar} alt={col.name} className="w-12 h-12 rounded-full object-cover border border-neutral-700 shadow-sm" />
                              <div>
                                <h4 className="font-bold text-xs text-white">{col.name}</h4>
                                <span className="text-[9px] text-amber-500 font-mono font-bold uppercase tracking-wider">{col.role}</span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 mt-1">
                                  <Star className="h-3 w-3 fill-current" /> {col.rating}
                                </div>
                              </div>
                            </div>

                            <button
                              id={`delete-collaborator-button-${col.id}`}
                              onClick={() => {
                                if (confirm(`¿Seguro que desea eliminar al colaborador "${col.name}"?`)) {
                                  onDeleteCollaborator(col.id);
                                }
                              }}
                              className="p-1.5 bg-neutral-900 hover:bg-rose-950/40 text-neutral-600 hover:text-rose-400 border border-neutral-800 hover:border-rose-500/10 rounded-md transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Admin toggle (cajita con tilde) */}
                          <div className="flex items-center gap-1.5 py-1 px-2.5 bg-neutral-900 rounded-lg border border-neutral-850">
                            <input
                              type="checkbox"
                              id={`col-admin-override-${col.id}`}
                              checked={!!col.isAdminOverride}
                              onChange={() => {
                                const updatedCols = collaborators.map(c => 
                                  c.id === col.id ? { ...c, isAdminOverride: !c.isAdminOverride } : c
                                );
                                onSetCollaborators(updatedCols);
                              }}
                              className="accent-amber-500 h-3.5 w-3.5 rounded border-neutral-800 bg-neutral-950 focus:ring-0 cursor-pointer"
                            />
                            <label htmlFor={`col-admin-override-${col.id}`} className="text-[9px] font-mono font-bold text-neutral-300 uppercase tracking-wider cursor-pointer">
                              Administrador
                            </label>
                          </div>

                          <div className="bg-neutral-900/40 p-2.5 rounded-lg space-y-1.5 text-[10px] font-mono border border-neutral-900">
                            <div className="flex justify-between text-neutral-400">
                              <span>Tasa Comisión:</span>
                              <span className="text-white font-bold">{col.commissionRate}%</span>
                            </div>
                            <div className="flex justify-between text-neutral-400">
                              <span>Horarios:</span>
                              <span className="text-neutral-300">{col.schedule.hours}</span>
                            </div>
                            <div className="flex justify-between text-neutral-400">
                              <span>Especialidades:</span>
                              <span className="text-amber-500 font-bold max-w-[120px] truncate">{col.specialties.join(', ')}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-baseline pt-2 border-t border-neutral-900 text-xs">
                            <span className="text-neutral-500 font-mono">Facturación:</span>
                            <span className="font-mono font-bold text-emerald-400">${col.earnings}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* 5. THEME CUSTOMIZATION TAB */}
            {activeTab === 'theme' && (
              <motion.div
                key="theme-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
              >
                {/* Color and style selector controls (7 columns) */}
                <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider">Diseñador y Estilo Visual del Cliente</h3>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">MODIFICA COLORES Y TIPOGRAFÍAS DE LA PÁGINA PÚBLICA</p>
                  </div>

                  {/* PRESETS */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">A) Temas de Página Predeterminados</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        id="preset-theme-light"
                        onClick={() => applyThemePreset('light')}
                        className={`p-3 rounded-xl border text-xs font-semibold uppercase text-center transition-all ${
                          currentTenant.theme.mode === 'light' 
                            ? 'bg-white text-neutral-950 border-white' 
                            : 'bg-neutral-950 border-neutral-800 text-white hover:bg-neutral-900'
                        }`}
                      >
                        Claro Slate
                      </button>
                      <button
                        id="preset-theme-medium"
                        onClick={() => applyThemePreset('medium')}
                        className={`p-3 rounded-xl border text-xs font-semibold uppercase text-center transition-all ${
                          currentTenant.theme.mode === 'medium' 
                            ? 'bg-amber-100/10 text-amber-400 border-amber-500' 
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-900'
                        }`}
                      >
                        Medio Clay
                      </button>
                      <button
                        id="preset-theme-dark"
                        onClick={() => applyThemePreset('dark')}
                        className={`p-3 rounded-xl border text-xs font-semibold uppercase text-center transition-all ${
                          currentTenant.theme.mode === 'dark' 
                            ? 'bg-neutral-800 text-white border-amber-500' 
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-900'
                        }`}
                      >
                        Oscuro Midnight
                      </button>
                      <button
                        id="preset-theme-transparent"
                        onClick={() => applyThemePreset('transparent')}
                        className={`p-3 rounded-xl border text-xs font-semibold uppercase text-center transition-all ${
                          currentTenant.theme.mode === 'transparent' 
                            ? 'bg-sky-950/40 text-sky-400 border-sky-400' 
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-900'
                        }`}
                      >
                        Transparente
                      </button>
                    </div>
                  </div>

                  {/* CUSTOM COLORS */}
                  <div className="space-y-4 pt-4 border-t border-neutral-800">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">B) Colorímetro Personalizado del Inquilino</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="theme-bg" className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Color Fondo Principal</label>
                        <div className="flex gap-2">
                          <input
                            id="theme-bg"
                            type="color"
                            value={currentTenant.theme.backgroundColor.startsWith('rgba') ? '#0f172a' : currentTenant.theme.backgroundColor}
                            onChange={(e) => updateThemeProperty('backgroundColor', e.target.value)}
                            className="h-9 w-12 rounded border border-neutral-700 bg-transparent cursor-pointer"
                          />
                          <input
                            id="theme-bg-text"
                            type="text"
                            value={currentTenant.theme.backgroundColor}
                            onChange={(e) => updateThemeProperty('backgroundColor', e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 text-xs text-neutral-300 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="theme-text" className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Color de Texto</label>
                        <div className="flex gap-2">
                          <input
                            id="theme-text"
                            type="color"
                            value={currentTenant.theme.textColor}
                            onChange={(e) => updateThemeProperty('textColor', e.target.value)}
                            className="h-9 w-12 rounded border border-neutral-700 bg-transparent cursor-pointer"
                          />
                          <input
                            id="theme-text-text"
                            type="text"
                            value={currentTenant.theme.textColor}
                            onChange={(e) => updateThemeProperty('textColor', e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 text-xs text-neutral-300 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="theme-accent" className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">Color Acento (Botones, Destacados)</label>
                        <div className="flex gap-2">
                          <input
                            id="theme-accent"
                            type="color"
                            value={currentTenant.theme.accentColor}
                            onChange={(e) => updateThemeProperty('accentColor', e.target.value)}
                            className="h-9 w-12 rounded border border-neutral-700 bg-transparent cursor-pointer"
                          />
                          <input
                            id="theme-accent-text"
                            type="text"
                            value={currentTenant.theme.accentColor}
                            onChange={(e) => updateThemeProperty('accentColor', e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 text-xs text-neutral-300 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="theme-font" className="block text-[10px] font-mono text-neutral-500 uppercase mb-1">D) Tipografía Seleccionada</label>
                        <select
                          id="theme-font"
                          value={currentTenant.theme.fontFamily}
                          onChange={(e) => updateThemeProperty('fontFamily', e.target.value as any)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 font-mono"
                        >
                          <option value="sans">Inter Sans (Limpio & Moderno)</option>
                          <option value="serif">Playfair Display (Lujo Clásico)</option>
                          <option value="display">Space Grotesk (Vanguardia NY)</option>
                          <option value="mono">JetBrains Mono (Industrial / Tecnológico)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* C) ESTILOS DE COLOR PARA LA PÁGINA PÚBLICA */}
                  <div className="space-y-4 pt-6 border-t border-neutral-800">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">C) Estilos de Color para la Página Pública</span>
                    
                    {/* Sub-tabs selector for Claros, Medios, Transparentes */}
                    <div className="flex bg-neutral-950 p-1.5 rounded-xl border border-neutral-850 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setColorStyleSubTab('claros')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          colorStyleSubTab === 'claros'
                            ? 'bg-amber-500 text-neutral-950 font-extrabold shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                        }`}
                      >
                        Estilos Claros
                      </button>
                      <button
                        type="button"
                        onClick={() => setColorStyleSubTab('medios')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          colorStyleSubTab === 'medios'
                            ? 'bg-amber-500 text-neutral-950 font-extrabold shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                        }`}
                      >
                        Estilos Medios
                      </button>
                      <button
                        type="button"
                        onClick={() => setColorStyleSubTab('transparentes')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          colorStyleSubTab === 'transparentes'
                            ? 'bg-amber-500 text-neutral-950 font-extrabold shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                        }`}
                      >
                        Transparentes
                      </button>
                    </div>

                    {/* Color Presets Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {(colorStyleSubTab === 'claros' ? [
                        {
                          name: 'Crystal Glass',
                          mode: 'light',
                          backgroundColor: '#f8fafc',
                          textColor: '#0f172a',
                          accentColor: '#0ea5e9',
                          desc: 'Blanco nieve con acentos de azul cristalino'
                        },
                        {
                          name: 'Nude Soft',
                          mode: 'light',
                          backgroundColor: '#fafaf6',
                          textColor: '#2c2421',
                          accentColor: '#c29b62',
                          desc: 'Beige natural, estilo romántico y cálido'
                        },
                        {
                          name: 'Mint Fresh',
                          mode: 'light',
                          backgroundColor: '#f2f8f5',
                          textColor: '#112a27',
                          accentColor: '#10b981',
                          desc: 'Fondo menta suave con acentos esmeralda'
                        },
                        {
                          name: 'Cotton Candy',
                          mode: 'light',
                          backgroundColor: '#fdf4f5',
                          textColor: '#2e1026',
                          accentColor: '#db2777',
                          desc: 'Fresa suave, ideal para cosmética femenina'
                        }
                      ] : colorStyleSubTab === 'medios' ? [
                        {
                          name: 'Loft Warmth',
                          mode: 'medium',
                          backgroundColor: '#fafaf9',
                          textColor: '#1c1917',
                          accentColor: '#b45309',
                          desc: 'Piedra cálida con acentos ámbar e industriales'
                        },
                        {
                          name: 'Sage & Olive',
                          mode: 'medium',
                          backgroundColor: '#f4f5f0',
                          textColor: '#2d3522',
                          accentColor: '#606c38',
                          desc: 'Tono salvia natural, relajante y orgánico'
                        },
                        {
                          name: 'Moka Cream',
                          mode: 'medium',
                          backgroundColor: '#f5ebe0',
                          textColor: '#4e3d30',
                          accentColor: '#b58263',
                          desc: 'Tono café con crema, sofisticado y elegante'
                        },
                        {
                          name: 'Nordic Gray',
                          mode: 'medium',
                          backgroundColor: '#f4f4f5',
                          textColor: '#18181b',
                          accentColor: '#3f3f46',
                          desc: 'Gris neutro de alto contraste escandinavo'
                        }
                      ] : [
                        {
                          name: 'Aero Azul',
                          mode: 'transparent',
                          backgroundColor: 'rgba(15, 23, 42, 0.4)',
                          textColor: '#f8fafc',
                          accentColor: '#0ea5e9',
                          desc: 'Efecto cristal translúcido con azul de Nueva York'
                        },
                        {
                          name: 'Aero Violeta',
                          mode: 'transparent',
                          backgroundColor: 'rgba(24, 15, 35, 0.45)',
                          textColor: '#fdf4ff',
                          accentColor: '#c084fc',
                          desc: 'Cristal místico amatista con acento de neón violeta'
                        },
                        {
                          name: 'Aero Verde',
                          mode: 'transparent',
                          backgroundColor: 'rgba(10, 25, 18, 0.5)',
                          textColor: '#f0fdf4',
                          accentColor: '#34d399',
                          desc: 'Cristal bosque profundo con acentos menta'
                        },
                        {
                          name: 'Aero Rosa',
                          mode: 'transparent',
                          backgroundColor: 'rgba(29, 10, 18, 0.45)',
                          textColor: '#fff1f2',
                          accentColor: '#fb7185',
                          desc: 'Cristal rosa fucsia translúcido, glamoroso y audaz'
                        }
                      ]).map((preset) => {
                        const isActive = 
                          currentTenant.theme.backgroundColor === preset.backgroundColor &&
                          currentTenant.theme.textColor === preset.textColor &&
                          currentTenant.theme.accentColor === preset.accentColor &&
                          currentTenant.theme.mode === preset.mode;

                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => applyColorStylePreset(preset as any)}
                            className={`flex flex-col items-start text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                              isActive
                                ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/5'
                                : 'bg-neutral-950 border-neutral-850 hover:border-neutral-700 hover:bg-neutral-900/40'
                            }`}
                          >
                            <div className="w-full flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-neutral-100">{preset.name}</span>
                              <div className="flex gap-1">
                                <span className="h-3 w-3 rounded-full border border-neutral-800 shadow-xs" style={{ backgroundColor: preset.backgroundColor }}></span>
                                <span className="h-3 w-3 rounded-full border border-neutral-800 shadow-xs" style={{ backgroundColor: preset.textColor }}></span>
                                <span className="h-3 w-3 rounded-full border border-neutral-800 shadow-xs" style={{ backgroundColor: preset.accentColor }}></span>
                              </div>
                            </div>
                            <p className="text-[10px] text-neutral-400 font-normal leading-normal">{preset.desc}</p>
                            {isActive && (
                              <span className="absolute right-2 bottom-2 text-[9px] font-mono text-amber-500 font-extrabold uppercase">Activo</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Live Hero Banner Editor & Style Gallery (5 columns) */}
                <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider text-amber-500">Editor de Banner Hero</h3>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">VISTA PREVIA Y PERSONALIZACIÓN DE LA PORTADA DEL INQUILINO</p>
                  </div>

                  {/* High-Fidelity Live Hero Preview */}
                  <div className="relative h-48 rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-center items-center text-center p-4 shadow-inner">
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={currentTenant.heroImage || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80"} 
                        alt="Hero Live Preview" 
                        className="w-full h-full object-cover filter brightness-[0.25] saturate-[0.85]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    </div>

                    <div className="relative z-10 space-y-1">
                      <span className="text-[8px] font-mono tracking-[0.2em] text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {currentTenant.heroLabel || "FIRST CLASS SALON • NYC"}
                      </span>
                      <h4 
                        style={{ 
                          fontFamily: currentTenant.theme.fontFamily === 'serif' ? 'Playfair Display' : currentTenant.theme.fontFamily === 'display' ? 'Space Grotesk' : currentTenant.theme.fontFamily === 'mono' ? 'JetBrains Mono' : 'Inter'
                        }}
                        className="text-base sm:text-xl font-bold uppercase tracking-tight text-white"
                      >
                        {currentTenant.name}
                      </h4>
                      <p className="text-[10px] text-neutral-300 font-light max-w-xs mx-auto leading-relaxed line-clamp-2">
                        {currentTenant.heroDescription || "Experiencias de belleza excepcionales en pleno Nueva York. Especialidades de alto nivel, coloración de autor y cosmética de lujo a medida."}
                      </p>
                    </div>
                  </div>

                  {/* Editor Form fields */}
                  <div className="space-y-4 pt-3 border-t border-neutral-800/60">
                    <div>
                      <label htmlFor="hero-label-input" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                        1. Etiqueta Superior (Badge)
                      </label>
                      <input
                        id="hero-label-input"
                        type="text"
                        value={currentTenant.heroLabel || ''}
                        onChange={(e) => updateTenantProperty('heroLabel', e.target.value)}
                        placeholder="Ej: FIRST CLASS SALON • NYC"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 font-mono placeholder:text-neutral-600"
                      />
                    </div>

                    <div>
                      <label htmlFor="hero-desc-input" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                        2. Descripción de Portada (Subtítulo)
                      </label>
                      <textarea
                        id="hero-desc-input"
                        rows={3}
                        value={currentTenant.heroDescription || ''}
                        onChange={(e) => updateTenantProperty('heroDescription', e.target.value)}
                        placeholder="Ej: Experiencias de belleza excepcionales en pleno Nueva York..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 font-sans placeholder:text-neutral-600 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label htmlFor="hero-image-input" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                        3. URL de Imagen de Fondo (Portada)
                      </label>
                      <input
                        id="hero-image-input"
                        type="text"
                        value={currentTenant.heroImage || ''}
                        onChange={(e) => updateTenantProperty('heroImage', e.target.value)}
                        placeholder="Ej: https://images.unsplash.com/photo-..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 font-mono placeholder:text-neutral-600 text-ellipsis"
                      />
                    </div>

                    {/* Preselected Unsplash Vibe Presets */}
                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                        ✨ O elegir un estilo de fondo predefinido:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateTenantProperty('heroImage', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80')}
                          className="flex items-center gap-1.5 p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-[10px] text-neutral-400 font-mono transition-colors border border-neutral-850 cursor-pointer"
                        >
                          <span className="inline-block w-4 h-4 rounded bg-amber-600 shrink-0 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=80&h=80" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </span>
                          <span>Lujo Dorado</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateTenantProperty('heroImage', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1600&q=80')}
                          className="flex items-center gap-1.5 p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-[10px] text-neutral-400 font-mono transition-colors border border-neutral-850 cursor-pointer"
                        >
                          <span className="inline-block w-4 h-4 rounded bg-zinc-600 shrink-0 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=80&h=80" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </span>
                          <span>Industrial / Barba</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateTenantProperty('heroImage', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80')}
                          className="flex items-center gap-1.5 p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-[10px] text-neutral-400 font-mono transition-colors border border-neutral-850 cursor-pointer"
                        >
                          <span className="inline-block w-4 h-4 rounded bg-pink-600 shrink-0 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=80&h=80" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </span>
                          <span>Minimal Rosé</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateTenantProperty('heroImage', 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1600&q=80')}
                          className="flex items-center gap-1.5 p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-[10px] text-neutral-400 font-mono transition-colors border border-neutral-850 cursor-pointer"
                        >
                          <span className="inline-block w-4 h-4 rounded bg-sky-600 shrink-0 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=80&h=80" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </span>
                          <span>Spa Cristal</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

              </motion.div>
            )}

            {/* RETIRO ORDERS TAB */}
            {activeTab === 'retiro' && (
              <motion.div
                key="retiro-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
              >
                {/* Outbound Orders List & Filters (8 columns) */}
                <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-amber-500" /> Centro de Despacho de Pedidos Retiro
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1">PRODUCTOS COSMÉTICOS RESERVADOS PARA RETIRO EN SUCURSAL</p>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => setRetiroStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                          retiroStatusFilter === 'all'
                            ? 'bg-amber-500 text-neutral-950 border-amber-500'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => setRetiroStatusFilter('pending')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                          retiroStatusFilter === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                        }`}
                      >
                        Pendientes ({retiroOrders.filter(o => o.status === 'pending').length})
                      </button>
                      <button
                        onClick={() => setRetiroStatusFilter('completed')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                          retiroStatusFilter === 'completed'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                        }`}
                      >
                        Entregados
                      </button>
                      <button
                        onClick={() => setRetiroStatusFilter('cancelled')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                          retiroStatusFilter === 'cancelled'
                            ? 'bg-rose-950/40 text-rose-400 border-rose-500/20'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                        }`}
                      >
                        Cancelados
                      </button>

                      {isUserAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('🚨 ATENCIÓN: ¿Seguro que deseas limpiar todo el registro histórico de pedidos de retiro? Esta acción es irreversible.')) {
                              onSetRetiroOrders([]);
                              alert('✓ Registro de pedidos de retiro limpiado correctamente.');
                            }
                          }}
                          className="bg-rose-950/80 hover:bg-rose-900 border border-rose-800/40 text-rose-300 font-bold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider shadow-sm ml-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-400 hover:scale-105" />
                          Limpiar Pedidos
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search bar inside the orders panel */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
                    <input
                      id="retiro-search-input"
                      type="text"
                      placeholder="Buscar por código de retiro (CYC-...) o nombre del cliente..."
                      value={retiroSearchQuery}
                      onChange={(e) => setRetiroSearchQuery(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-all font-mono"
                    />
                    {retiroSearchQuery && (
                      <button
                        onClick={() => setRetiroSearchQuery('')}
                        className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-neutral-300 text-[10px] uppercase font-mono"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>

                  {/* Orders List Container */}
                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                    {(() => {
                      // Apply text query search
                      const searched = retiroOrders.filter(o => {
                        const q = retiroSearchQuery.toLowerCase();
                        return (
                          o.code.toLowerCase().includes(q) ||
                          o.clientName.toLowerCase().includes(q) ||
                          o.clientPhone.includes(q)
                        );
                      });

                      // Apply status filters
                      const filtered = searched.filter(o => {
                        if (retiroStatusFilter === 'all') return true;
                        return o.status === retiroStatusFilter;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-16 text-neutral-500 font-mono text-xs border border-dashed border-neutral-800 rounded-2xl bg-neutral-950">
                            No se encontraron pedidos de retiro con los filtros aplicados.
                          </div>
                        );
                      }

                      return filtered.map((order) => {
                        return (
                          <div
                            key={order.id}
                            className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700/80 p-5 rounded-xl transition-all space-y-4 text-left relative overflow-hidden"
                          >
                            {/* Accent badge for state */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-900">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono font-bold text-neutral-300 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800">
                                  {order.code}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(order.code);
                                    alert(`✓ Código ${order.code} copiado al portapapeles.`);
                                  }}
                                  className="text-[10px] text-neutral-500 hover:text-amber-500 font-mono flex items-center gap-1"
                                >
                                  <Copy className="h-3 w-3" /> Copiar Código
                                </button>
                              </div>

                              <div>
                                {order.status === 'pending' && (
                                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                                    ● Pendiente de Retiro
                                  </span>
                                )}
                                {order.status === 'completed' && (
                                  <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5" /> ✓ Entregado
                                  </span>
                                )}
                                {order.status === 'cancelled' && (
                                  <span className="bg-rose-950/40 text-rose-400 border border-rose-500/20 text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1.5">
                                    <XCircle className="h-3.5 w-3.5" /> Cancelado
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Client & Booking Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-neutral-400">
                              <div>
                                <span className="text-[9px] text-neutral-500 uppercase block mb-0.5">Cliente Premium</span>
                                <strong className="text-white font-sans">{order.clientName}</strong>
                              </div>
                              <div>
                                <span className="text-[9px] text-neutral-500 uppercase block mb-0.5">Contacto Celular</span>
                                <a href={`tel:${order.clientPhone}`} className="text-amber-500 font-sans hover:underline">{order.clientPhone}</a>
                              </div>
                              <div>
                                <span className="text-[9px] text-neutral-500 uppercase block mb-0.5">Modalidad / Entrega</span>
                                <span className="text-neutral-300 font-sans flex items-center gap-1">
                                  {order.isDelivery ? (
                                    <span className="text-amber-400 font-semibold flex items-center gap-1">🚚 Envío a Domicilio</span>
                                  ) : (
                                    <span className="text-emerald-400 font-semibold flex items-center gap-1">🏪 Retiro en Tienda</span>
                                  )}
                                </span>
                              </div>
                            </div>

                            {order.isDelivery && order.deliveryAddress && (
                              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 text-xs">
                                <span className="text-[9px] text-amber-500 font-mono uppercase block mb-1">📍 Dirección de Envío Declarada</span>
                                <p className="text-white font-sans font-medium">{order.deliveryAddress}</p>
                              </div>
                            )}

                            {/* Ordered Items List */}
                            <div className="bg-neutral-900/40 border border-neutral-900/60 rounded-xl p-4 space-y-2.5">
                              <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider block">Artículos Reservados:</span>
                              
                              <div className="space-y-1.5 divide-y divide-neutral-900 text-xs">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center pt-1.5 first:pt-0">
                                    <div className="flex items-center gap-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                      <span className="font-sans font-medium text-neutral-200">{item.name}</span>
                                      <span className="text-[9px] bg-neutral-900 text-neutral-400 px-1.5 py-0.5 rounded uppercase font-mono">
                                        {item.type === 'product' ? 'Cosmético' : 'Tratamiento'}
                                      </span>
                                    </div>
                                    <span className="font-mono font-bold text-white">${item.price}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-between items-baseline pt-2 border-t border-neutral-900/80 text-xs font-mono">
                                <span className="text-neutral-500">Monto Total de Orden:</span>
                                <span className="font-bold text-amber-500 text-sm">${order.total}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {order.status === 'pending' && (
                              <div className="flex flex-col sm:flex-row gap-2 pt-1 font-sans">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Check className="h-4 w-4 text-neutral-950 font-black" /> Entregar Pedido al Cliente
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`¿Seguro que desea CANCELAR la orden de retiro ${order.code}?`)) {
                                      handleUpdateOrderStatus(order.id, 'cancelled');
                                    }
                                  }}
                                  className="px-4 py-2.5 bg-neutral-900 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-500/20 rounded-xl text-[10px] uppercase font-bold transition-all cursor-pointer font-sans"
                                >
                                  Cancelar Reserva
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* NYC Guide sidebar (4 columns) */}
                <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="pb-3 border-b border-neutral-800">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500">Guía de Entrega y Recepción</h3>
                      <p className="text-[9px] text-neutral-400 font-mono mt-0.5">PROCEDIMIENTO OPERATIVO ESTÁNDAR (SOP)</p>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Sigue estas directrices de primer nivel para coordinar el retiro de productos cosméticos en el salón, garantizando una experiencia elegante que represente fielmente la marca.
                    </p>

                    <div className="space-y-4 text-xs font-sans">
                      <div className="flex gap-3">
                        <span className="h-5 w-5 rounded-full bg-amber-500/10 text-amber-500 font-mono font-bold flex items-center justify-center shrink-0">1</span>
                        <div>
                          <p className="font-bold text-neutral-200">Verifica el código de retiro</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5 leading-normal">Pídele al cliente que te enseñe el código de retiro único (ej: <code>CYC-...</code>) generado en la página de confirmación pública de su dispositivo móvil.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="h-5 w-5 rounded-full bg-amber-500/10 text-amber-500 font-mono font-bold flex items-center justify-center shrink-0">2</span>
                        <div>
                          <p className="font-bold text-neutral-200">Prepara el empaque de lujo</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5 leading-normal">Ubica el producto cosmético en los exhibidores, colócalo en la bolsa institucional negra con detalles en ámbar y añade la tarjeta de agradecimiento de la sucursal.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="h-5 w-5 rounded-full bg-amber-500/10 text-amber-500 font-mono font-bold flex items-center justify-center shrink-0">3</span>
                        <div>
                          <p className="font-bold text-neutral-200">Actualiza el estado en el panel</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5 leading-normal">Haz clic en "Entregar Pedido al Cliente" para registrar la entrega física, liberando formalmente la reserva y asegurando la fidelidad del stock.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex items-center gap-3.5 mt-6">
                    <QrCode className="h-8 w-8 text-amber-500 shrink-0" />
                    <div className="text-[10px] font-mono leading-tight">
                      <span className="text-neutral-400 block uppercase tracking-wider font-sans">Orden pendiente</span>
                      <strong className="text-white text-xs block mt-1 font-sans">SOP LOCAL CYC NY</strong>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* COMMENTS TAB */}
            {activeTab === 'comments' && (
              <motion.div
                key="comments-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                {/* Comments Header & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Comentarios de Clientes
                      </h3>
                      <p className="text-[11px] text-neutral-400 font-mono mt-1 uppercase">
                        Modera y aprueba las opiniones enviadas por tus clientes en la página pública
                      </p>
                    </div>
                    <p className="text-xs text-neutral-500 leading-normal mt-4">
                      Todos los comentarios nuevos ingresan en estado "Pendiente". Solo aquellos que apruebes explícitamente se mostrarán debajo de la sección de Cosmética & Productos en la web pública de {currentTenant.name}.
                    </p>
                  </div>

                  {/* Stat Card 1: Pending */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-2 right-2 p-3 bg-red-500/5 rounded-full text-red-500">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">Pendientes de Aprobación</span>
                      <h4 className="text-4xl font-mono font-extrabold text-red-500 mt-2">
                        {comments.filter(c => !c.approved && c.tenantId === currentTenant.id).length}
                      </h4>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono mt-4">Requieren tu acción</span>
                  </div>

                  {/* Stat Card 2: Approved */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-2 right-2 p-3 bg-emerald-500/5 rounded-full text-emerald-500">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">Comentarios Publicados</span>
                      <h4 className="text-4xl font-mono font-extrabold text-emerald-400 mt-2">
                        {comments.filter(c => c.approved && c.tenantId === currentTenant.id).length}
                      </h4>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono mt-4">Visibles en la web pública</span>
                  </div>
                </div>

                {/* Main Moderation Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Pending Comments (7 columns) */}
                  <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                        Solicitudes Pendientes ({comments.filter(c => !c.approved && c.tenantId === currentTenant.id).length})
                      </h4>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">Moderación en Tiempo Real</span>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1.5 scrollbar-thin">
                      {comments.filter(c => !c.approved && c.tenantId === currentTenant.id).length === 0 ? (
                        <div className="py-12 text-center rounded-xl border border-dashed border-neutral-800/60 bg-neutral-950/20">
                          <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2.5" />
                          <p className="text-xs text-neutral-300 font-bold uppercase">¡Todo al día!</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">No hay comentarios pendientes de revisión para este salón.</p>
                        </div>
                      ) : (
                        comments.filter(c => !c.approved && c.tenantId === currentTenant.id).map((comment) => (
                          <div key={comment.id} className="p-4 bg-neutral-950 rounded-xl border border-neutral-850 space-y-3 relative group">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white uppercase tracking-wide">{comment.name}</span>
                                  <span className="text-[9px] font-mono text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-850">{comment.date}</span>
                                </div>
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${
                                        star <= comment.rating ? 'text-amber-500 fill-amber-500' : 'text-neutral-800'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-[9px] font-mono text-red-500 bg-red-500/5 px-2 py-0.5 rounded-full border border-red-500/10 uppercase font-semibold">Pendiente</span>
                            </div>

                            <p className="text-xs text-neutral-300 italic font-light leading-relaxed">
                              "{comment.text}"
                            </p>

                            <div className="flex gap-2.5 pt-3 border-t border-neutral-900">
                              <button
                                onClick={() => onApproveComment && onApproveComment(comment.id, true)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg text-[10px] transition-all uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Check className="h-3 w-3" /> Aprobar Comentario
                              </button>
                              <button
                                onClick={() => onDeleteComment && onDeleteComment(comment.id)}
                                className="bg-neutral-900 hover:bg-red-900/30 text-neutral-400 hover:text-red-400 border border-neutral-800 hover:border-red-900/50 py-2 px-3 rounded-lg text-[10px] transition-all uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                                title="Rechazar y eliminar comentario"
                              >
                                <Trash2 className="h-3 w-3" /> Rechazar
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Published Comments (5 columns) */}
                  <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                        Comentarios Públicos ({comments.filter(c => c.approved && c.tenantId === currentTenant.id).length})
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-500 uppercase flex items-center gap-1">
                        <Check className="h-3 w-3 animate-pulse" /> Activos
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1.5 scrollbar-thin">
                      {comments.filter(c => c.approved && c.tenantId === currentTenant.id).length === 0 ? (
                        <div className="py-12 text-center rounded-xl border border-dashed border-neutral-800/60 bg-neutral-950/20">
                          <MessageSquare className="h-8 w-8 text-neutral-500 mx-auto mb-2.5" />
                          <p className="text-xs text-neutral-500 uppercase">Sin comentarios públicos</p>
                          <p className="text-[10px] text-neutral-600 mt-0.5">Aprueba un comentario de la lista de pendientes para que aparezca aquí y en la web pública.</p>
                        </div>
                      ) : (
                        comments.filter(c => c.approved && c.tenantId === currentTenant.id).map((comment) => (
                          <div key={comment.id} className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-850 space-y-2.5 relative group">
                            <div className="flex items-start justify-between">
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-neutral-200 uppercase tracking-wide block">{comment.name}</span>
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-2.5 w-2.5 ${
                                        star <= comment.rating ? 'text-amber-500 fill-amber-500' : 'text-neutral-800'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => onApproveComment && onApproveComment(comment.id, false)}
                                className="text-[9px] font-mono text-neutral-400 hover:text-amber-500 bg-neutral-900 border border-neutral-800 hover:border-amber-500/20 px-2 py-0.5 rounded transition-all cursor-pointer"
                                title="Ocultar de la página pública"
                              >
                                Ocultar / Desactivar
                              </button>
                            </div>

                            <p className="text-[11px] text-neutral-400 italic">
                              "{comment.text}"
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-[9px] font-mono">
                              <span className="text-neutral-600">{comment.date}</span>
                              <button
                                onClick={() => onDeleteComment && onDeleteComment(comment.id)}
                                className="text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-0.5 cursor-pointer"
                              >
                                <Trash2 className="h-2.5 w-2.5" /> Eliminar permanentemente
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. CONFIGURATION TAB (QR MARKETING & BACKUP & RESTORE) */}
            {activeTab === 'config' && (
              <motion.div
                key="config-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
              >
                {/* Configuración Local, Multi-idioma y Regional */}
                <div className="lg:col-span-12 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-amber-500" /> Configuración de Idioma y Telefonía
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono mt-1">ESTABLECE EL IDIOMA PREDETERMINADO Y EL PREFIJO INTERNACIONAL PARA WHATSAPP</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Idioma Predeterminado */}
                    <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-850 space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider block">
                          Idioma Predeterminado del Portal
                        </label>
                        <p className="text-[10px] text-neutral-400 leading-normal">
                          Elige el idioma con el que se cargará por defecto la página pública de turnos para tus clientes.
                        </p>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateTenant({
                              ...currentTenant,
                              defaultLanguage: 'es'
                            });
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                            (currentTenant.defaultLanguage || 'es') === 'es'
                              ? 'bg-amber-500 text-neutral-950 border-amber-500'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                          }`}
                        >
                          <span className="text-lg">🇪🇸</span> Español Castellano
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateTenant({
                              ...currentTenant,
                              defaultLanguage: 'en'
                            });
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                            currentTenant.defaultLanguage === 'en'
                              ? 'bg-amber-500 text-neutral-950 border-amber-500'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                          }`}
                        >
                          <span className="text-lg">🇬🇧</span> English (Inglés)
                        </button>
                      </div>
                    </div>

                    {/* Prefijo Telefónico */}
                    <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-850 space-y-4">
                      <div className="space-y-1">
                        <label htmlFor="input-phone-prefix" className="text-xs font-bold text-neutral-200 uppercase tracking-wider block">
                          Prefijo Telefónico WhatsApp
                        </label>
                        <p className="text-[10px] text-neutral-400 leading-normal">
                          Establece el prefijo predeterminado para la carga de teléfonos móviles. Aparecerá automáticamente cuando tus clientes ingresen su número.
                        </p>
                      </div>
                      <div className="pt-2 relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-500 font-bold">🛠️ Prefijo</span>
                        <input
                          id="input-phone-prefix"
                          type="text"
                          value={currentTenant.phonePrefix || '+54 9'}
                          onChange={(e) => {
                            onUpdateTenant({
                              ...currentTenant,
                              phonePrefix: e.target.value
                            });
                          }}
                          placeholder="Ej: +54 9"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-20 pr-4 py-3 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/30 transition-colors"
                        />
                      </div>
                      <p className="text-[9px] text-neutral-500 font-mono">
                        El valor por defecto recomendado para Argentina es <strong className="text-amber-500 font-mono">+54 9</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preferencia de Modalidad y Nomenclatura (Tildes/Checkboxes) */}
                <div className="lg:col-span-12 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-amber-500" /> Preferencia de Modalidad y Nomenclatura
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono mt-1">CONFIGURACIÓN DE MODALIDAD ENCARGO (PRODUCTOS) Y SELECCIÓN (SERVICIOS)</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Checkbox 1: Modo Encargo para Productos */}
                    <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-850 flex items-start space-x-3.5">
                      <input
                        type="checkbox"
                        id="toggle-modo-encargo"
                        checked={currentTenant.isModoEncargoEnabled !== false}
                        onChange={(e) => {
                          onUpdateTenant({
                            ...currentTenant,
                            isModoEncargoEnabled: e.target.checked
                          });
                        }}
                        className="accent-amber-500 h-5 w-5 rounded border-neutral-800 bg-neutral-900 focus:ring-0 cursor-pointer mt-0.5 shrink-0"
                      />
                      <div className="space-y-1">
                        <label htmlFor="toggle-modo-encargo" className="text-xs font-bold text-neutral-200 uppercase tracking-wider cursor-pointer">
                          Habilitar "Modo Encargo" para Productos
                        </label>
                        <p className="text-[10px] text-neutral-400 leading-normal">
                          Si está activo, los productos se manejarán bajo <strong className="text-amber-500 font-mono">"Modo Encargo"</strong>, permitiendo seleccionarlos y reservarlos sin pagar con tarjeta de crédito simulada. Los clientes podrán retirarlos en la fecha y hora de su cita asignada.
                        </p>
                      </div>
                    </div>

                    {/* Checkbox 2: Seleccionar para Servicios */}
                    <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-850 flex items-start space-x-3.5">
                      <input
                        type="checkbox"
                        id="toggle-service-seleccionar"
                        checked={!!currentTenant.isServiceSeleccionarEnabled}
                        onChange={(e) => {
                          onUpdateTenant({
                            ...currentTenant,
                            isServiceSeleccionarEnabled: e.target.checked
                          });
                        }}
                        className="accent-amber-500 h-5 w-5 rounded border-neutral-800 bg-neutral-900 focus:ring-0 cursor-pointer mt-0.5 shrink-0"
                      />
                      <div className="space-y-1">
                        <label htmlFor="toggle-service-seleccionar" className="text-xs font-bold text-neutral-200 uppercase tracking-wider cursor-pointer">
                          Usar "Seleccionar" en lugar de "Agendar" para Servicios
                        </label>
                        <p className="text-[10px] text-neutral-400 leading-normal">
                          Si está activo, la etiqueta y botón para los servicios premium mostrará <strong className="text-amber-500 font-mono">"Seleccionar"</strong> en lugar del clásico "Agendar".
                        </p>
                      </div>
                    </div>

                    {/* Checkbox 3: Envíos a Domicilio */}
                    <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-850 flex items-start space-x-3.5">
                      <input
                        type="checkbox"
                        id="toggle-envios-enabled"
                        checked={!!currentTenant.isEnviosEnabled}
                        onChange={(e) => {
                          onUpdateTenant({
                            ...currentTenant,
                            isEnviosEnabled: e.target.checked
                          });
                        }}
                        className="accent-amber-500 h-5 w-5 rounded border-neutral-800 bg-neutral-900 focus:ring-0 cursor-pointer mt-0.5 shrink-0"
                      />
                      <div className="space-y-1">
                        <label htmlFor="toggle-envios-enabled" className="text-xs font-bold text-neutral-200 uppercase tracking-wider cursor-pointer">
                          Habilitar Envíos a Domicilio
                        </label>
                        <p className="text-[10px] text-neutral-400 leading-normal">
                          Si está activo, los clientes podrán elegir recibir sus cosméticos directamente en su domicilio declarando una dirección de entrega.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* QR Marketing Card (6 columns) */}
                <div className="lg:col-span-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-neutral-800">
                      <h3 className="text-base font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-amber-500" /> Tarjeta de Mesa QR & Difusión Física
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1">HERRAMIENTA DE MARKETING DE PRIMER NIVEL - ESTILO MANHATTAN</p>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Genera un cartel o tarjeta física elegante con los colores y la tipografía de tu marca para colocar en la recepción de tu local, en cada espejo o escritorio. Tus clientes podrán escanear el código para agendar turnos o ver productos en tiempo real.
                    </p>

                    {/* Desktop Card Preview */}
                    <div className="bg-neutral-950 p-6 rounded-2xl border-2 border-amber-500/30 text-center space-y-4 max-w-xs mx-auto relative overflow-hidden">
                      <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
                      <span className="text-[9px] font-mono tracking-[0.25em] text-amber-500 uppercase">BIENVENIDO A</span>
                      <h4 
                        style={{ 
                          fontFamily: currentTenant.theme.fontFamily === 'serif' ? 'Playfair Display' : currentTenant.theme.fontFamily === 'display' ? 'Space Grotesk' : currentTenant.theme.fontFamily === 'mono' ? 'JetBrains Mono' : 'Inter'
                        }}
                        className="text-xl font-black uppercase text-white tracking-tight"
                      >
                        {currentTenant.name}
                      </h4>
                      
                      {/* Simulated elegant vector QR code */}
                      <div className="bg-white p-3.5 rounded-xl inline-block shadow-lg mx-auto">
                        <svg className="h-28 w-28 text-neutral-950" viewBox="0 0 100 100">
                          <path d="M 5,5 L 25,5 L 25,10 L 10,10 L 10,25 L 5,25 Z" fill="currentColor" />
                          <path d="M 75,5 L 95,5 L 95,25 L 90,25 L 90,10 L 75,10 Z" fill="currentColor" />
                          <path d="M 5,75 L 5,95 L 25,95 L 25,90 L 10,90 L 10,75 Z" fill="currentColor" />
                          <rect x="15" y="15" width="20" height="20" fill="currentColor" />
                          <rect x="18" y="18" width="14" height="14" fill="#fff" />
                          <rect x="21" y="21" width="8" height="8" fill="currentColor" />
                          <rect x="65" y="15" width="20" height="20" fill="currentColor" />
                          <rect x="68" y="18" width="14" height="14" fill="#fff" />
                          <rect x="71" y="21" width="8" height="8" fill="currentColor" />
                          <rect x="15" y="65" width="20" height="20" fill="currentColor" />
                          <rect x="18" y="68" width="14" height="14" fill="#fff" />
                          <rect x="21" y="71" width="8" height="8" fill="currentColor" />
                          <rect x="45" y="15" width="5" height="10" fill="currentColor" />
                          <rect x="55" y="25" width="5" height="5" fill="currentColor" />
                          <rect x="40" y="30" width="10" height="5" fill="currentColor" />
                          <rect x="65" y="45" width="10" height="10" fill="currentColor" />
                          <rect x="15" y="45" width="10" height="5" fill="currentColor" />
                          <rect x="30" y="50" width="5" height="10" fill="currentColor" />
                          <rect x="45" y="65" width="5" height="15" fill="currentColor" />
                          <rect x="65" y="65" width="5" height="5" fill="currentColor" />
                          <rect x="75" y="75" width="10" height="10" fill="currentColor" />
                          <rect x="85" y="65" width="5" height="5" fill="currentColor" />
                          <rect x="55" y="55" width="10" height="5" fill="currentColor" />
                          <rect x="55" y="75" width="5" height="10" fill="currentColor" />
                          <rect x="35" y="75" width="5" height="5" fill="currentColor" />
                        </svg>
                      </div>

                      <p className="text-[10px] text-neutral-400 font-sans leading-relaxed max-w-[220px] mx-auto">
                        Escanea para agendar tu cita premium en segundos.
                      </p>
                    </div>
                  </div>

                  <button
                    id="print-qr-card-button"
                    type="button"
                    onClick={handlePrintQRCard}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider"
                  >
                    <QrCode className="h-4 w-4" /> IMPRIMIR TARJETA DE MESA (PDF/PAPEL)
                  </button>
                </div>

                {/* Backup & Restore (6 columns) */}
                <div className="lg:col-span-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="pb-3 border-b border-neutral-800">
                      <h3 className="text-base font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-amber-500" /> Seguridad de Datos y Respaldos (Backup)
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1">RESPALDO DE INFORMACIÓN DEL SISTEMA DEL INQUILINO</p>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Toda la información del sistema (servicios, productos de lujo, historial financiero, órdenes de retiro, colaboradores y configuraciones personalizadas) se almacena localmente de forma segura. Descarga copias de seguridad de forma regular para proteger tus datos de pérdidas fortuitas o para migrarlos a otros dispositivos.
                    </p>

                    <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-4">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-2">A) Descargar Copia de Seguridad Actual</span>
                        <button
                          id="export-backup-button"
                          type="button"
                          onClick={handleExportBackup}
                          className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-neutral-700 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider"
                        >
                          <FileDown className="h-4 w-4 text-amber-500" /> Exportar Datos (.json)
                        </button>
                      </div>

                      <div className="pt-2 border-t border-neutral-900">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-2">B) Restaurar Copia de Seguridad</span>
                        <label 
                          htmlFor="import-backup-file" 
                          className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-dashed border-neutral-700 hover:border-amber-500/50 py-4 rounded-xl text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-center"
                        >
                          <span className="font-bold text-amber-500 font-mono text-xs uppercase">Seleccionar Archivo de Respaldo</span>
                          <span className="text-[9px] text-neutral-500">Cargar un archivo .json válido</span>
                          <input
                            id="import-backup-file"
                            type="file"
                            accept=".json"
                            onChange={handleImportBackup}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-xs text-amber-400">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-bold">Advertencia importante</p>
                      <p className="text-[10px] text-amber-500/80 mt-0.5 leading-normal">
                        Al restaurar un archivo de copia de seguridad se reemplazará de forma irreversible todo el stock, ventas y servicios que estén configurados actualmente en este dispositivo.
                      </p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

      {/* FLOATING CUSTOM TOAST NOTIFICATION */}
      <AnimatePresence>
        {dashboardToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-neutral-950 border border-neutral-800 text-neutral-100 px-5 py-4 rounded-2xl shadow-2xl max-w-sm"
          >
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
              dashboardToast.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : dashboardToast.type === 'error'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              <Check className="h-4.5 w-4.5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                {dashboardToast.type === 'success' ? 'Éxito' : dashboardToast.type === 'error' ? 'Error' : 'Aviso'}
              </p>
              <p className="text-xs text-neutral-200 mt-0.5">{dashboardToast.message}</p>
            </div>
            <button
              onClick={() => setDashboardToast(null)}
              className="text-neutral-500 hover:text-white ml-2 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATE-BASED CUSTOM CANCEL BOOKING DIALOG */}
      <AnimatePresence>
        {appointmentToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-left shadow-2xl"
            >
              <div className="text-center pb-4 border-b border-neutral-800">
                <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
                  <AlertTriangle className="h-6 w-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  ¿Confirmar Cancelación?
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Esta acción marcará el turno de forma permanente como CANCELADO en el sistema.
                </p>
              </div>

              <div className="py-4 space-y-2.5 font-mono text-[11px] text-neutral-300">
                {(() => {
                  const targetApp = appointments.find(a => a.id === appointmentToCancel);
                  if (!targetApp) return null;
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">CLIENTE:</span>
                        <span className="text-white font-sans font-semibold">{targetApp.clientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">FECHA:</span>
                        <span className="text-amber-500 font-bold">{targetApp.date} a las {targetApp.time} hs</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setAppointmentToCancel(null)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 rounded-xl text-[11px] uppercase transition-all tracking-wider cursor-pointer border border-neutral-700"
                >
                  No, Volver
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = appointments.map(a => a.id === appointmentToCancel ? { ...a, status: 'cancelled' as const } : a);
                    if (onSetAppointments) {
                      onSetAppointments(updated);
                    }
                    setAppointmentToCancel(null);
                    setDashboardToast({
                      message: '✓ Cita cancelada con éxito.',
                      type: 'success'
                    });
                  }}
                  className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-[11px] uppercase transition-all tracking-wider cursor-pointer shadow-md"
                >
                  Sí, Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
