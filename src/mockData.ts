import { TenantConfig, Service, Product, Collaborator, Appointment, Sale, WhatsAppLog } from './types';

export const INITIAL_TENANTS: TenantConfig[] = [
  {
    id: 'soho-chic',
    name: 'Soho Chic Atelier',
    subdomain: 'soho-chic',
    logo: '✨ SOHO CHIC',
    address: '42 Greene St, New York, NY 10012',
    phone: '+1 (212) 555-0142',
    theme: {
      id: 'soho-dark',
      name: 'Manhattan Midnight (Oscuro)',
      mode: 'dark',
      primaryColor: '#ffffff',
      secondaryColor: '#a3a3a3',
      backgroundColor: '#0a0a0a',
      textColor: '#f5f5f5',
      accentColor: '#d4af37', // Gold
      fontFamily: 'display',
    },
    whatsapp: {
      enabled: true,
      apiKey: 'wa_live_soho_9921kdsajh832',
      phoneID: '109382103982',
      reminderHoursBefore: 24,
      templatePending: 'Hola {{clientName}}, tu solicitud de cita para {{serviceName}} el día {{date}} a las {{time}} en Soho Chic está siendo procesada. ¡Te esperamos!',
      templateConfirmed: 'Hola {{clientName}}, tu cita para {{serviceName}} ha sido CONFIRMADA con {{collaboratorName}} para el {{date}} a las {{time}}. Dirección: 42 Greene St.'
    },
    stripe: {
      enabled: true,
      publicKey: 'pk_test_soho_51Nv892Jk',
      secretKey: 'sk_test_soho_51Nv892JkSecretKey',
      mode: 'test'
    },
    ownerName: 'Diego Ariel',
    ownerPhone: '+1 (212) 555-9876',
    ownerEmail: 'diegoariel1980@gmail.com',
    password: '123',
    phonePrefix: '+54 9',
    defaultLanguage: 'es'
  },
  {
    id: 'tribeca-loft',
    name: 'Tribeca Loft Aesthetics',
    subdomain: 'tribeca-loft',
    logo: '🌿 TRIBECA LOFT',
    address: '185 Hudson St, New York, NY 10013',
    phone: '+1 (212) 555-0185',
    theme: {
      id: 'tribeca-warm',
      name: 'Loft Warmth (Medio)',
      mode: 'medium',
      primaryColor: '#451a03', // Deep clay brown
      secondaryColor: '#78350f',
      backgroundColor: '#fafaf9', // Warm stone white
      textColor: '#1c1917', // Warm black
      accentColor: '#b45309', // Terracotta amber
      fontFamily: 'serif',
    },
    whatsapp: {
      enabled: true,
      apiKey: 'wa_live_tribeca_38219hdsjka',
      phoneID: '302918230192',
      reminderHoursBefore: 12,
      templatePending: 'Hola {{clientName}}, recibimos tu reserva en Tribeca Loft para {{serviceName}} el {{date}} a las {{time}} hs.',
      templateConfirmed: '¡Confirmado! {{clientName}}, te agendamos con {{collaboratorName}} el {{date}} a las {{time}} hs. Te esperamos en 185 Hudson St.'
    },
    stripe: {
      enabled: true,
      publicKey: 'pk_test_tribeca_82hJ',
      secretKey: 'sk_test_tribeca_82hJSecretKey',
      mode: 'test'
    },
    ownerName: 'Laura Smith',
    ownerPhone: '+1 (212) 555-5432',
    ownerEmail: 'laura@tribeca.com',
    password: '123',
    phonePrefix: '+54 9',
    defaultLanguage: 'es'
  },
  {
    id: 'fifth-ave-luxe',
    name: 'Fifth Avenue Wellness',
    subdomain: 'fifth-ave',
    logo: '💎 FIFTH AVENUE',
    address: '730 5th Ave, New York, NY 10019',
    phone: '+1 (212) 555-0730',
    theme: {
      id: 'fifth-luxe',
      name: 'Crystal Glass (Claro)',
      mode: 'light',
      primaryColor: '#0f172a', // Deep slate blue
      secondaryColor: '#475569',
      backgroundColor: '#f8fafc', // Clean bright slate
      textColor: '#0f172a',
      accentColor: '#0ea5e9', // Royal sky blue
      fontFamily: 'sans',
    },
    whatsapp: {
      enabled: false,
      apiKey: '',
      phoneID: '',
      reminderHoursBefore: 2,
      templatePending: 'Hola {{clientName}}, tu pre-reserva de lujo para {{serviceName}} está registrada para el {{date}}.',
      templateConfirmed: 'Estimado/a {{clientName}}, su experiencia de bienestar para {{serviceName}} con {{collaboratorName}} está totalmente confirmada el {{date}} a las {{time}} en Fifth Avenue Wellness.'
    },
    stripe: {
      enabled: false,
      publicKey: '',
      secretKey: '',
      mode: 'test'
    },
    ownerName: 'Marcus Well',
    ownerPhone: '+1 (212) 555-1122',
    ownerEmail: 'marcus@fifthave.com',
    password: '123',
    phonePrefix: '+54 9',
    defaultLanguage: 'es'
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-balayage',
    name: 'Balayage Signature Manhattan',
    category: 'Coloración',
    duration: 180,
    price: 320,
    description: 'Técnica de aclarado a mano alzada personalizada para dar luz natural y tridimensionalidad al cabello, estilo clásico neoyorquino.',
    customFields: [
      { id: 'fld-hair-length', label: 'Largo del cabello', type: 'select', value: 'Largo', options: ['Corto', 'Medio', 'Largo', 'Extra Largo'] },
      { id: 'fld-previous-color', label: '¿Tiene tintura previa?', type: 'boolean', value: 'false' },
      { id: 'fld-extra-note', label: 'Tono deseado o especificaciones', type: 'text', value: '' }
    ]
  },
  {
    id: 'srv-corte-soho',
    name: 'Corte de Autor & Styling Soho',
    category: 'Corte',
    duration: 60,
    price: 110,
    description: 'Corte vanguardista adaptado a tus rasgos, lavado premium con masaje capilar y peinado profesional con ondas o alisado.',
    customFields: [
      { id: 'fld-hair-texture', label: 'Textura del cabello', type: 'select', value: 'Lacio', options: ['Lacio', 'Ondulado', 'Rizado', 'Afro'] },
      { id: 'fld-fringe', label: '¿Desea flequillo?', type: 'boolean', value: 'false' }
    ]
  },
  {
    id: 'srv-nails-porcelain',
    name: 'Uñas de Escultura Tribeca',
    category: 'Manicuría',
    duration: 90,
    price: 95,
    description: 'Extensiones de uñas de porcelana fina con acabados ultra naturales y esmaltado semipermanente de alta duración.',
    customFields: [
      { id: 'fld-nail-shape', label: 'Forma de uñas', type: 'select', value: 'Almendra', options: ['Cuadrada', 'Almendra', 'Stiletto', 'Redonda'] },
      { id: 'fld-nail-art', label: '¿Desea Nail Art de diseño?', type: 'boolean', value: 'false' }
    ]
  },
  {
    id: 'srv-microblading',
    name: 'Microblading Cejas 3D Chelsea',
    category: 'Estética Facial',
    duration: 120,
    price: 450,
    description: 'Diseño y micropigmentación pelo a pelo para unas cejas perfectamente pobladas y naturales.',
    customFields: [
      { id: 'fld-skin-type', label: 'Tipo de piel facial', type: 'select', value: 'Normal', options: ['Seca', 'Normal', 'Mixta', 'Grasa'] },
      { id: 'fld-retouch', label: '¿Es retoque o primera sesión?', type: 'select', value: 'Primera vez', options: ['Primera vez', 'Retoque anual'] }
    ]
  },
  {
    id: 'srv-hidratacion-gold',
    name: 'Terapia de Hidratación 24k Gold',
    category: 'Tratamientos',
    duration: 75,
    price: 180,
    description: 'Tratamiento capilar profundo con mascarilla infusionada con micropartículas de oro de 24 quilates para brillo espejo y sedosidad extrema.',
    customFields: [
      { id: 'fld-damage-level', label: 'Nivel de daño percibido', type: 'select', value: 'Moderado', options: ['Bajo', 'Moderado', 'Extremo'] }
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-serum',
    name: 'Serum Velvet Shine Therapy',
    description: 'Elixir capilar premium concentrado con aceite de argán de primera prensada y queratina pura. Otorga un brillo satinado y elimina el frizz instantáneamente.',
    price: 58,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'
    ],
    customFields: [
      { id: 'p-fld-size', label: 'Volumen', type: 'select', value: '100ml', options: ['50ml', '100ml', '200ml'] },
      { id: 'p-fld-hairtype', label: 'Tipo de cabello recomendado', type: 'text', value: 'Todo tipo, especialmente deshidratado' }
    ]
  },
  {
    id: 'prod-shampoo',
    name: 'Shampoo New York Glossing',
    description: 'Fórmula sin sulfatos enriquecida con células madre de rosa alpina para limpiar con extrema suavidad y prolongar la vida del color.',
    price: 42,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80'
    ],
    customFields: [
      { id: 'p-fld-size-2', label: 'Volumen', type: 'select', value: '250ml', options: ['250ml', '500ml'] },
      { id: 'p-fld-color-safe', label: 'Seguro para coloración avanzada', type: 'boolean', value: 'true' }
    ]
  }
];

export const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: 'col-marcus',
    name: 'Marcus Stone',
    role: 'Senior Master Colorist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
    specialties: ['Coloración', 'Tratamientos'],
    commissionRate: 40,
    rating: 4.9,
    schedule: {
      days: ['Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      hours: '10:00 - 19:00'
    },
    username: 'marcus',
    password: '123',
    presenceStatus: 'online'
  },
  {
    id: 'col-sasha',
    name: 'Sasha Grey',
    role: 'Creative Stylist & Art Director',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    specialties: ['Corte', 'Coloración'],
    commissionRate: 35,
    rating: 4.8,
    schedule: {
      days: ['Lunes', 'Martes', 'Jueves', 'Viernes', 'Sábado'],
      hours: '09:00 - 18:00'
    },
    username: 'sasha',
    password: '123',
    presenceStatus: 'online'
  },
  {
    id: 'col-sofia',
    name: 'Sofia Diaz',
    role: 'Nail Artist Specialist',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80',
    specialties: ['Manicuría'],
    commissionRate: 30,
    rating: 4.95,
    schedule: {
      days: ['Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      hours: '11:00 - 20:00'
    },
    username: 'sofia',
    password: '123',
    presenceStatus: 'offline'
  }
];

// Generamos fechas dinámicas para los reportes diarios, semanales, mensuales, anuales
const getPastDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    clientName: 'Julianne Moore',
    clientPhone: '+1 (212) 555-8321',
    clientEmail: 'julianne@gmail.com',
    serviceId: 'srv-balayage',
    collaboratorId: 'col-marcus',
    date: getPastDateString(0), // Hoy
    time: '11:30',
    status: 'confirmed',
    price: 320,
    customFieldValues: { 'fld-hair-length': 'Largo', 'fld-previous-color': 'true', 'fld-extra-note': 'Quiere tonos fríos de platino' }
  },
  {
    id: 'apt-2',
    clientName: 'Oliver Smith',
    clientPhone: '+1 (646) 555-9012',
    clientEmail: 'oliver.nyc@outlook.com',
    serviceId: 'srv-corte-soho',
    collaboratorId: 'col-sasha',
    date: getPastDateString(0), // Hoy
    time: '14:00',
    status: 'pending',
    price: 110,
    customFieldValues: { 'fld-hair-texture': 'Rizado', 'fld-fringe': 'false' }
  },
  {
    id: 'apt-3',
    clientName: 'Bella Hadid',
    clientPhone: '+1 (917) 555-4422',
    clientEmail: 'bella.h@gmail.com',
    serviceId: 'srv-nails-porcelain',
    collaboratorId: 'col-sofia',
    date: getPastDateString(1), // Ayer
    time: '16:00',
    status: 'completed',
    price: 95,
    customFieldValues: { 'fld-nail-shape': 'Almendra', 'fld-nail-art': 'true' }
  },
  {
    id: 'apt-4',
    clientName: 'Emma Stone',
    clientPhone: '+1 (212) 555-4567',
    clientEmail: 'emma@stone.com',
    serviceId: 'srv-microblading',
    collaboratorId: 'col-sasha',
    date: getPastDateString(2), // Hace 2 días
    time: '10:00',
    status: 'completed',
    price: 450,
    customFieldValues: { 'skin-type': 'Normal', 'retouch': 'Primera vez' }
  },
  {
    id: 'apt-5',
    clientName: 'Zendaya Coleman',
    clientPhone: '+1 (347) 555-1212',
    clientEmail: 'zendaya@daya.com',
    serviceId: 'srv-hidratacion-gold',
    collaboratorId: 'col-marcus',
    date: getPastDateString(3), // Hace 3 días
    time: '15:30',
    status: 'completed',
    price: 180,
    customFieldValues: { 'fld-damage-level': 'Extremo' }
  },
  {
    id: 'apt-6',
    clientName: 'Scarlett Johansson',
    clientPhone: '+1 (917) 555-9988',
    clientEmail: 'scarlett@johann.com',
    serviceId: 'srv-balayage',
    collaboratorId: 'col-marcus',
    date: getPastDateString(10), // Hace 10 días (Semanal)
    time: '12:00',
    status: 'completed',
    price: 320,
    customFieldValues: { 'fld-hair-length': 'Medio', 'fld-previous-color': 'false' }
  },
  {
    id: 'apt-7',
    clientName: 'Selena Gomez',
    clientPhone: '+1 (646) 555-3344',
    clientEmail: 'selena@rare.com',
    serviceId: 'srv-corte-soho',
    collaboratorId: 'col-sasha',
    date: getPastDateString(45), // Hace 45 días (Mensual/Anual)
    time: '10:30',
    status: 'completed',
    price: 110,
    customFieldValues: { 'fld-hair-texture': 'Lacio', 'fld-fringe': 'true' }
  }
];

// Ventas que poblarán el reporte diario, semanal, mensual y anual
export const INITIAL_SALES: Sale[] = [
  // HOY
  {
    id: 'sal-1',
    date: getPastDateString(0),
    itemType: 'service',
    itemId: 'srv-balayage',
    itemName: 'Balayage Signature Manhattan',
    collaboratorId: 'col-marcus',
    collaboratorName: 'Marcus Stone',
    amount: 320,
    paymentMethod: 'Stripe'
  },
  {
    id: 'sal-2',
    date: getPastDateString(0),
    itemType: 'product',
    itemId: 'prod-serum',
    itemName: 'Serum Velvet Shine Therapy',
    collaboratorId: 'col-sasha',
    collaboratorName: 'Sasha Grey',
    amount: 58,
    paymentMethod: 'Tarjeta'
  },
  // ESTA SEMANA (pero no hoy)
  {
    id: 'sal-3',
    date: getPastDateString(2),
    itemType: 'service',
    itemId: 'srv-microblading',
    itemName: 'Microblading Cejas 3D Chelsea',
    collaboratorId: 'col-sasha',
    collaboratorName: 'Sasha Grey',
    amount: 450,
    paymentMethod: 'Stripe'
  },
  {
    id: 'sal-4',
    date: getPastDateString(3),
    itemType: 'service',
    itemId: 'srv-hidratacion-gold',
    itemName: 'Terapia de Hidratación 24k Gold',
    collaboratorId: 'col-marcus',
    collaboratorName: 'Marcus Stone',
    amount: 180,
    paymentMethod: 'Efectivo'
  },
  {
    id: 'sal-5',
    date: getPastDateString(4),
    itemType: 'product',
    itemId: 'prod-shampoo',
    itemName: 'Shampoo New York Glossing',
    collaboratorId: 'col-sofia',
    collaboratorName: 'Sofia Diaz',
    amount: 42,
    paymentMethod: 'Tarjeta'
  },
  // ESTE MES (pero fuera de esta semana)
  {
    id: 'sal-6',
    date: getPastDateString(12),
    itemType: 'service',
    itemId: 'srv-nails-porcelain',
    itemName: 'Uñas de Escultura Tribeca',
    collaboratorId: 'col-sofia',
    collaboratorName: 'Sofia Diaz',
    amount: 95,
    paymentMethod: 'Stripe'
  },
  {
    id: 'sal-7',
    date: getPastDateString(18),
    itemType: 'product',
    itemId: 'prod-serum',
    itemName: 'Serum Velvet Shine Therapy',
    collaboratorId: 'col-marcus',
    collaboratorName: 'Marcus Stone',
    amount: 58,
    paymentMethod: 'Efectivo'
  },
  {
    id: 'sal-8',
    date: getPastDateString(25),
    itemType: 'service',
    itemId: 'srv-corte-soho',
    itemName: 'Corte de Autor & Styling Soho',
    collaboratorId: 'col-sasha',
    collaboratorName: 'Sasha Grey',
    amount: 110,
    paymentMethod: 'Tarjeta'
  },
  // HACE MAS DE UN MES (este año)
  {
    id: 'sal-9',
    date: getPastDateString(65),
    itemType: 'service',
    itemId: 'srv-balayage',
    itemName: 'Balayage Signature Manhattan',
    collaboratorId: 'col-marcus',
    collaboratorName: 'Marcus Stone',
    amount: 320,
    paymentMethod: 'Stripe'
  },
  {
    id: 'sal-10',
    date: getPastDateString(120),
    itemType: 'service',
    itemId: 'srv-microblading',
    itemName: 'Microblading Cejas 3D Chelsea',
    collaboratorId: 'col-sasha',
    collaboratorName: 'Sasha Grey',
    amount: 450,
    paymentMethod: 'Stripe'
  },
  {
    id: 'sal-11',
    date: getPastDateString(220),
    itemType: 'product',
    itemId: 'prod-shampoo',
    itemName: 'Shampoo New York Glossing',
    collaboratorId: 'col-sofia',
    collaboratorName: 'Sofia Diaz',
    amount: 42,
    paymentMethod: 'Efectivo'
  }
];

export const INITIAL_WHATSAPP_LOGS: WhatsAppLog[] = [
  {
    id: 'wl-1',
    recipient: '+1 (212) 555-8321',
    clientName: 'Julianne Moore',
    message: 'Hola Julianne Moore, tu cita para Balayage Signature Manhattan ha sido CONFIRMADA con Marcus Stone para el 2026-07-12 a las 11:30. Dirección: 42 Greene St.',
    timestamp: '2026-07-12T09:00:00Z',
    status: 'delivered'
  },
  {
    id: 'wl-2',
    recipient: '+1 (917) 555-4422',
    clientName: 'Bella Hadid',
    message: 'Hola Bella Hadid, tu cita para Uñas de Escultura Tribeca ha sido CONFIRMADA con Sofia Diaz para el 2026-07-11 a las 16:00. Dirección: 42 Greene St.',
    timestamp: '2026-07-11T09:00:00Z',
    status: 'delivered'
  }
];
