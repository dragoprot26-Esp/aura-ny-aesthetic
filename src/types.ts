export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  value: string;
  options?: string[]; // for select type
}

export interface Service {
  id: string;
  name: string;
  category: string;
  duration: number; // in minutes
  price: number;
  description: string;
  customFields: CustomField[];
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[]; // exactly up to 5 images
  customFields: CustomField[];
  viewsCount?: number;
  viewsSemaphore?: 'green' | 'yellow' | 'red';
  isLastAvailable?: boolean;
  lastAvailableText?: string;
  barcode?: string;
  views?: number; // alias compatible with dashboard
  isLastUnitsEnabled?: boolean; // alias compatible with product tab
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatar: string;
  specialties: string[];
  commissionRate: number; // percentage
  rating: number;
  schedule: {
    days: string[]; // e.g. ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    hours: string; // e.g. "09:00 - 18:00"
  };
  username?: string;
  password?: string;
  presenceStatus?: 'offline' | 'pending' | 'online';
  isAdminOverride?: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  collaboratorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  customFieldValues: { [fieldId: string]: string };
}

export interface Sale {
  id: string;
  date: string; // ISO string or YYYY-MM-DD
  itemType: 'service' | 'product';
  itemId: string;
  itemName: string;
  collaboratorId: string;
  collaboratorName: string;
  amount: number;
  paymentMethod: 'Stripe' | 'Efectivo' | 'Tarjeta' | 'Retiro en Tienda';
}

export interface PageTheme {
  id: string;
  name: string;
  mode: 'light' | 'medium' | 'dark' | 'transparent';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'display';
}

export interface WhatsAppConfig {
  enabled: boolean;
  apiKey: string;
  phoneID: string;
  reminderHoursBefore: number;
  templatePending: string;
  templateConfirmed: string;
}

export interface StripeConfig {
  enabled: boolean;
  publicKey: string;
  secretKey: string;
  mode: 'test' | 'live';
}

export interface TenantConfig {
  id: string; // This corresponds to the license code (e.g. SOHO-CHIC, BELL-1234)
  name: string;
  subdomain: string;
  logo: string;
  address: string;
  phone: string;
  theme: PageTheme;
  whatsapp: WhatsAppConfig;
  stripe: StripeConfig;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  password?: string; // Tenant master password
  isModoEncargoEnabled?: boolean;
  isServiceSeleccionarEnabled?: boolean;
  isEnviosEnabled?: boolean;
  heroLabel?: string;
  heroDescription?: string;
  heroImage?: string;
  phonePrefix?: string;
  defaultLanguage?: 'es' | 'en';
}

export interface WhatsAppLog {
  id: string;
  recipient: string;
  clientName: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'failed' | 'delivered';
}

export interface ClientComment {
  id: string;
  tenantId: string; // so it's tied to the specific salon/tenant
  name: string;
  rating: number; // 1 to 5 stars
  text: string;
  date: string;
  approved: boolean;
}

