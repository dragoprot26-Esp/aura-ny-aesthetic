import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TenantConfig, Service, Product, Collaborator, Appointment, CustomField, ClientComment
} from '../types';
import { 
  Calendar, Clock, User, Phone, Mail, Sparkles, Check, ShoppingBag, 
  ChevronLeft, ChevronRight, CreditCard, Share2, ArrowRight, Smartphone,
  Info, ShieldCheck, X, Star, Heart, Copy, MessageSquare, Globe, Shield, Eye, LogOut
} from 'lucide-react';

const translations = {
  es: {
    services: 'Servicios',
    products: 'Cosmética & Productos',
    reviews: 'Opiniones de Clientes',
    suggestions: 'Sugerencias',
    bookAppointment: 'Agendar Turno',
    selectService: 'Selecciona tu Servicio Premium',
    chooseCollaborator: 'Elige tu Especialista de Confianza',
    selectDate: 'Selecciona Fecha y Hora del Turno',
    duration: 'Duración',
    price: 'Precio',
    noCollaborator: 'Cualquier profesional disponible',
    personalData: 'Datos Personales para la Confirmación',
    fullName: 'Nombre completo',
    phone: 'Teléfono móvil (WhatsApp)',
    email: 'Correo electrónico',
    customFields: 'Campos personalizados de tu servicio',
    deliveryOption: '¿Deseas envío a domicilio?',
    deliveryAddress: 'Dirección de Entrega Completa',
    deliveryYes: 'Sí, enviar a mi domicilio',
    deliveryNo: 'No, retirar en el local',
    whatsAppNotice: 'Recibirás confirmaciones por WhatsApp',
    paymentMethod: 'Método de Pago Simulador',
    payInSalon: 'Pagar en el Local',
    payNow: 'Pagar con Tarjeta Simulada',
    bookingSummary: 'Resumen del Turno Seleccionado',
    selectedService: 'Servicio',
    selectedSpecialist: 'Especialista',
    selectedDate: 'Fecha',
    selectedTime: 'Hora',
    totalAmount: 'Total a Pagar',
    confirmBooking: 'Confirmar Reserva de Turno',
    bookingSuccess: '¡Turno Agendado con Éxito!',
    bookingPending: '¡Tu Reserva de Turno está Pendiente!',
    orderCode: 'Código de Reserva',
    showReceipt: 'Guardar Comprobante',
    anotherBooking: 'Agendar otro Turno',
    addressLabel: 'Ubicación',
    contactLabel: 'Contacto',
    hoursLabel: 'Horarios',
    hoursText: 'Lun a Sáb: 09:00 - 20:00',
    checkoutTitle: 'Finalizar Compra y Turno',
    ratingLabel: 'Déjanos tu Comentario',
    ratingSubtitle: 'CUÉNTANOS CÓMO FUE TU EXPERIENCIA PARA AYUDARNOS A MEJORAR',
    yourName: 'Tu Nombre',
    yourComment: 'Tu Comentario',
    submitComment: 'Enviar Opinión para Aprobación',
    commentSuccessTitle: '¡Comentario Recibido!',
    commentSuccessText: 'Muchas gracias por tu reseña. Tu comentario ha sido registrado con éxito y aparecerá de forma pública una vez aprobado por nuestro equipo de administración.',
    writeAnotherComment: 'Escribir otra reseña',
    categoryAll: 'Todos',
    modoEncargoBadge: 'Modo Encargo',
    addToCart: 'Añadir al Turno',
    addedToCart: 'Añadido',
    removeFromCart: 'Quitar',
    selectedProducts: 'Productos seleccionados para retirar en cita',
    emptyCart: 'Aún no has seleccionado productos.',
    addProductsPrompt: 'Puedes añadir productos de alta gama y retirar el día del turno.',
    servicesTitle: 'Nuestros Servicios Premium',
    servicesSubtitle: 'EXPERIENCIAS DE BELLEZA EXCLUSIVAS',
    productsTitle: 'Línea de Cosmética Exclusiva',
    productsSubtitle: 'PRODUCTOS SELECCIONADOS PARA TU CUIDADO',
    suggestionsTitle: 'Buzón de Sugerencias',
    suggestionsSubtitle: 'TU OPINIÓN ES FUNDAMENTAL PARA NOSOTROS',
    writeSuggestionTitle: 'Enviar Sugerencia Directa al Dueño',
    writeSuggestionSubtitle: 'MENSAJES 100% PRIVADOS Y CONFIDENCIALES',
    suggestionSuccessTitle: '¡Sugerencia Enviada!',
    suggestionSuccessText: 'Muchas gracias por tu feedback. Tu sugerencia ha sido enviada de forma directa y privada al buzón del propietario del salón.',
    sendSuggestionButton: 'Enviar Sugerencia Privada',
    opinionsTitle: 'Opiniones de Clientes',
    opinionsSubtitle: 'HISTORIAS REALES Y EXPERIENCIAS',
    noOpinions: 'Aún no hay opiniones aprobadas para este salón. ¡Sé el primero en dejar la tuya abajo!',
    verifiedClient: 'Cliente Verificado'
  },
  en: {
    services: 'Services',
    products: 'Cosmetics & Products',
    reviews: 'Client Reviews',
    suggestions: 'Suggestions',
    bookAppointment: 'Book Appointment',
    selectService: 'Select Your Premium Service',
    chooseCollaborator: 'Choose Your Trusted Specialist',
    selectDate: 'Select Date and Time',
    duration: 'Duration',
    price: 'Price',
    noCollaborator: 'Any available specialist',
    personalData: 'Personal Information for Confirmation',
    fullName: 'Full name',
    phone: 'Mobile phone (WhatsApp)',
    email: 'Email address',
    customFields: 'Custom fields for your service',
    deliveryOption: 'Would you like home delivery?',
    deliveryAddress: 'Full Delivery Address',
    deliveryYes: 'Yes, deliver to my home',
    deliveryNo: 'No, pickup at the salon',
    whatsAppNotice: 'You will receive WhatsApp confirmations',
    paymentMethod: 'Simulated Payment Method',
    payInSalon: 'Pay at Salon',
    payNow: 'Pay with Simulated Card',
    bookingSummary: 'Booking Summary',
    selectedService: 'Service',
    selectedSpecialist: 'Specialist',
    selectedDate: 'Date',
    selectedTime: 'Time',
    totalAmount: 'Total Amount',
    confirmBooking: 'Confirm Appointment Booking',
    bookingSuccess: 'Appointment Booked Successfully!',
    bookingPending: 'Your Appointment Booking is Pending!',
    orderCode: 'Booking Code',
    showReceipt: 'Save Receipt',
    anotherBooking: 'Book Another Appointment',
    addressLabel: 'Location',
    contactLabel: 'Contact',
    hoursLabel: 'Working Hours',
    hoursText: 'Mon to Sat: 09:00 - 20:00',
    checkoutTitle: 'Complete Booking & Purchase',
    ratingLabel: 'Leave a Review',
    ratingSubtitle: 'TELL US ABOUT YOUR EXPERIENCE TO HELP US IMPROVE',
    yourName: 'Your Name',
    yourComment: 'Your Review',
    submitComment: 'Submit Review for Approval',
    commentSuccessTitle: 'Review Received!',
    commentSuccessText: 'Thank you very much for your review. Your comment has been successfully registered and will appear publicly once approved by our administration team.',
    writeAnotherComment: 'Write another review',
    categoryAll: 'All',
    modoEncargoBadge: 'Reservation Mode',
    addToCart: 'Add to Booking',
    addedToCart: 'Added',
    removeFromCart: 'Remove',
    selectedProducts: 'Selected products to pick up at appointment',
    emptyCart: 'No products selected yet.',
    addProductsPrompt: 'You can add premium cosmetics and pick them up on the day of your appointment.',
    servicesTitle: 'Our Premium Services',
    servicesSubtitle: 'EXCLUSIVE BEAUTY EXPERIENCES',
    productsTitle: 'Exclusive Cosmetics Line',
    productsSubtitle: 'HANDPICKED PRODUCTS FOR YOUR CARE',
    suggestionsTitle: 'Suggestions Box',
    suggestionsSubtitle: 'YOUR OPINION IS EXTREMELY VALUABLE TO US',
    writeSuggestionTitle: 'Send a Suggestion Direct to Owner',
    writeSuggestionSubtitle: '100% PRIVATE AND CONFIDENTIAL MESSAGES',
    suggestionSuccessTitle: 'Suggestion Sent!',
    suggestionSuccessText: 'Thank you very much for your feedback. Your suggestion has been sent directly and privately to the salon owner.',
    sendSuggestionButton: 'Send Private Suggestion',
    opinionsTitle: 'Client Opinions',
    opinionsSubtitle: 'REAL STORIES AND EXPERIENCES',
    noOpinions: 'There are no approved reviews for this salon yet. Be the first to leave yours below!',
    verifiedClient: 'Verified Client'
  }
};

interface PublicPageProps {
  currentTenant: TenantConfig;
  services: Service[];
  products: Product[];
  collaborators: Collaborator[];
  appointments: Appointment[];
  comments?: ClientComment[];
  onAddComment?: (name: string, rating: number, text: string) => void;
  onNewBooking: (appointment: Omit<Appointment, 'id'>) => void;
  onNewProductSale: (productId: string, productName: string, price: number, collaboratorId: string) => void;
  onAddSuggestion?: (name: string, email: string, text: string) => void;
  onNewRetiroOrder?: (
    clientName: string,
    clientPhone: string,
    items: { id: string; name: string; price: number; type: string; }[],
    isDelivery?: boolean,
    deliveryAddress?: string
  ) => string;
  onOpenLoginModal?: () => void;
  session?: { role: 'admin' | 'collaborator'; name: string; licenseCode: string } | null;
  setIsViewingPanel?: (val: boolean) => void;
  onLogout?: () => void;
}

export default function PublicPage({
  currentTenant,
  services,
  products,
  collaborators,
  appointments,
  comments = [],
  onAddComment,
  onNewBooking,
  onNewProductSale,
  onNewRetiroOrder,
  onOpenLoginModal,
  session,
  setIsViewingPanel,
  onLogout
}: PublicPageProps) {
  // Language Support
  const defaultLang = currentTenant.defaultLanguage || 'es';
  const [lang, setLang] = useState<'es' | 'en'>(defaultLang);

  useEffect(() => {
    if (currentTenant.defaultLanguage) {
      setLang(currentTenant.defaultLanguage);
    }
  }, [currentTenant.defaultLanguage]);

  const t = translations[lang] || translations.es;

  // PWA banner simulation
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [showPwaToast, setShowPwaToast] = useState(true);

  // Booking Flow State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  
  // Selected Products for Custom Order/Encargo
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isRetiroWithAppointment, setIsRetiroWithAppointment] = useState<boolean>(true);
  const [isDeliveryRequested, setIsDeliveryRequested] = useState<boolean>(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');

  // Comment Form States
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [commentHoverRating, setCommentHoverRating] = useState(0);
  const [commentSuccess, setCommentSuccess] = useState(false);

  const toggleSelectProduct = (product: Product) => {
    setSelectedProducts(prev => {
      if (prev.some(p => p.id === product.id)) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };
  
  // Custom field responses (service & booking)
  const [customFieldResponses, setCustomFieldResponses] = useState<{ [fieldId: string]: string }>({});

  // Last confirmed booking for success ticket display
  const [lastConfirmedBooking, setLastConfirmedBooking] = useState<{
    clientName: string;
    bookingCode: string;
    retiroCode?: string;
    serviceName: string;
    collaboratorName: string;
    date: string;
    time: string;
    price: number;
    products?: { name: string; price: number }[];
  } | null>(null);

  // Product shop details
  const [activeProductIndex, setActiveProductIndex] = useState<{ [prodId: string]: number }>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productCustomFieldResponses, setProductCustomFieldResponses] = useState<{ [fieldId: string]: string }>({});

  // Payment Simulation
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripePaymentItem, setStripePaymentItem] = useState<{
    type: 'service' | 'product';
    name: string;
    price: number;
    itemId: string;
  } | null>(null);
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [stripeSuccess, setStripeSuccess] = useState(false);
  
  // Stripe Card Form States
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');

  // WhatsApp Simulated notification popup
  const [showWaNotification, setShowWaNotification] = useState(false);
  const [waNotificationMessage, setWaNotificationMessage] = useState('');

  // Interactive Agenda/Calendar Helper Functions
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getSpanishDayName = (date: Date) => {
    const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return names[dayIndex];
  };

  const formatYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateWorkingForCollaborator = (date: Date) => {
    if (!selectedCollaborator) return true;
    const dayName = getSpanishDayName(date);
    return selectedCollaborator.schedule.days.includes(dayName);
  };

  const timeSlots = [
    { value: '09:00', label: '09:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:30', label: '11:30 AM' },
    { value: '13:00', label: '01:00 PM' },
    { value: '14:30', label: '02:30 PM' },
    { value: '16:00', label: '04:00 PM' },
    { value: '17:30', label: '05:30 PM' },
    { value: '19:00', label: '07:00 PM' }
  ];

  const isSlotBooked = (dateStr: string, timeStr: string) => {
    if (!selectedCollaborator) return false;
    return appointments.some(app => 
      app.date === dateStr && 
      app.time === timeStr && 
      app.collaboratorId === selectedCollaborator.id &&
      app.status !== 'cancelled'
    );
  };

  // Apply typography class
  const getFontClass = () => {
    switch (currentTenant.theme.fontFamily) {
      case 'serif': return 'font-serif';
      case 'display': return 'font-display';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  };

  // Build custom CSS styles from tenant configuration
  const theme = currentTenant.theme;
  const customStyles = {
    color: theme.textColor,
    backgroundColor: theme.backgroundColor,
  };

  // Preset theme container classes
  const getThemeContainerClass = () => {
    if (theme.mode === 'dark') {
      return 'bg-neutral-950 text-neutral-100';
    } else if (theme.mode === 'medium') {
      return 'bg-stone-50 text-stone-900';
    } else if (theme.mode === 'transparent') {
      return 'bg-linear-to-b from-neutral-900 to-neutral-950 text-neutral-100 min-h-screen relative overflow-hidden bg-radial';
    } else {
      return 'bg-slate-50 text-slate-900';
    }
  };

  const getCardClass = () => {
    if (theme.mode === 'dark') {
      return 'bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl';
    } else if (theme.mode === 'medium') {
      return 'bg-white border border-stone-200 rounded-2xl p-6 shadow-sm';
    } else if (theme.mode === 'transparent') {
      return 'glass-effect-dark rounded-2xl p-6 shadow-2xl border border-white/10';
    } else {
      return 'bg-white border border-slate-100 rounded-2xl p-6 shadow-md';
    }
  };

  const getInputClass = () => {
    if (theme.mode === 'dark' || theme.mode === 'transparent') {
      return 'w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-white';
    }
    return 'w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-600/50 text-neutral-900';
  };

  // Handle dynamic field changes
  const handleCustomFieldChange = (fieldId: string, value: string) => {
    setCustomFieldResponses(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleProductCustomFieldChange = (fieldId: string, value: string) => {
    setProductCustomFieldResponses(prev => ({ ...prev, [fieldId]: value }));
  };

  // Image carousels helper
  const nextImage = (prodId: string, max: number) => {
    setActiveProductIndex(prev => ({
      ...prev,
      [prodId]: ((prev[prodId] || 0) + 1) % max
    }));
  };

  const prevImage = (prodId: string, max: number) => {
    setActiveProductIndex(prev => ({
      ...prev,
      [prodId]: ((prev[prodId] || 0) - 1 + max) % max
    }));
  };

  // Initiate purchase checkout
  const initiateServiceCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedCollaborator || !bookingDate || !bookingTime || !clientName || !clientPhone) {
      alert('Por favor complete todos los datos del formulario de cita.');
      return;
    }

    const prefix = currentTenant.phonePrefix || '+54 9';
    const finalPhone = clientPhone.startsWith('+') ? clientPhone : `${prefix} ${clientPhone}`;

    if (currentTenant.isModoEncargoEnabled !== false) {
      const generatedBookingCode = `RES-${currentTenant.subdomain.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Create Retiro Order if products are selected and checked/delivery
      let orderCode = '';
      if (selectedProducts.length > 0 && (isRetiroWithAppointment || isDeliveryRequested) && onNewRetiroOrder) {
        const items = selectedProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          type: 'product'
        }));
        orderCode = onNewRetiroOrder(clientName, finalPhone, items, isDeliveryRequested, deliveryAddress);
      }

      // 1. Create appointment
      onNewBooking({
        clientName,
        clientPhone: finalPhone,
        clientEmail,
        serviceId: selectedService.id,
        collaboratorId: selectedCollaborator.id,
        date: bookingDate,
        time: bookingTime,
        status: 'confirmed',
        price: selectedService.price,
        customFieldValues: customFieldResponses,
        code: generatedBookingCode,
        retiroCode: orderCode || undefined
      } as any);

      // Save for Success Ticket Modal
      setLastConfirmedBooking({
        clientName,
        bookingCode: generatedBookingCode,
        retiroCode: orderCode || undefined,
        serviceName: selectedService.name,
        collaboratorName: selectedCollaborator.name,
        date: bookingDate,
        time: bookingTime,
        price: selectedService.price,
        products: selectedProducts.length > 0 && (isRetiroWithAppointment || isDeliveryRequested) ? selectedProducts.map(p => ({ name: p.name, price: p.price })) : undefined
      });

      // 3. Build WhatsApp message for Modo Encargo + Appointment
      let message = `📝 MODO ENCARGO / ${currentTenant.name}:\n` +
        `¡Hola ${clientName}! Tu reserva y encargo han sido registrados con éxito.\n` +
        `• Código de Reserva: ${generatedBookingCode}\n` +
        `• Servicio: ${selectedService.name} con ${selectedCollaborator.name}\n` +
        `• Fecha y Hora: ${bookingDate} a las ${bookingTime} hs\n`;

      if (selectedProducts.length > 0 && (isRetiroWithAppointment || isDeliveryRequested)) {
        const productsListText = selectedProducts.map(p => ` - ${p.name} ($${p.price})`).join('\n');
        if (isDeliveryRequested) {
          message += `• Cosméticos para envío a domicilio:\n${productsListText}\n` +
            `• Dirección de Envío: ${deliveryAddress}\n` +
            `• Código de Pedido: ${orderCode || 'N/A'}\n` +
            `• Total Pedido: $${selectedProducts.reduce((sum, p) => sum + p.price, 0)}\n`;
        } else {
          message += `• Cosméticos para retirar:\n${productsListText}\n` +
            `• Código de Retiro: ${orderCode || 'N/A'}\n` +
            `• Total Pedido: $${selectedProducts.reduce((sum, p) => sum + p.price, 0)}\n`;
        }
      }
      
      message += `Te esperamos o coordinaremos contigo. ¡Muchas gracias por elegirnos!`;

      // Show notification
      setWaNotificationMessage(message);
      setShowWaNotification(true);

      // Reset Booking Fields
      setSelectedService(null);
      setSelectedCollaborator(null);
      setBookingDate('');
      setBookingTime('');
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setCustomFieldResponses({});
      setSelectedProducts([]); // Reset selected products
      return;
    }

    setStripePaymentItem({
      type: 'service',
      name: selectedService.name,
      price: selectedService.price,
      itemId: selectedService.id
    });
    setShowStripeModal(true);
  };

  const initiateProductCheckout = (product: Product) => {
    setSelectedProduct(product);
    setStripePaymentItem({
      type: 'product',
      name: product.name,
      price: product.price,
      itemId: product.id
    });
    setShowStripeModal(true);
  };

  // Process Stripe payment simulation
  const handleStripePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStripeProcessing(true);

    setTimeout(() => {
      setStripeProcessing(false);
      setStripeSuccess(true);

      setTimeout(() => {
        // Clear payment states
        setShowStripeModal(false);
        setStripeSuccess(false);

        if (stripePaymentItem?.type === 'service') {
          const generatedBookingCode = `RES-${currentTenant.subdomain.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

          const prefix = currentTenant.phonePrefix || '+54 9';
          const finalPhone = clientPhone.startsWith('+') ? clientPhone : `${prefix} ${clientPhone}`;

          let orderCode = '';
          if (selectedProducts.length > 0 && (isRetiroWithAppointment || isDeliveryRequested) && onNewRetiroOrder) {
            const items = selectedProducts.map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              type: 'product'
            }));
            orderCode = onNewRetiroOrder(clientName, finalPhone, items, isDeliveryRequested, deliveryAddress);
          }

          // Add booking to state
          onNewBooking({
            clientName,
            clientPhone: finalPhone,
            clientEmail,
            serviceId: selectedService!.id,
            collaboratorId: selectedCollaborator!.id,
            date: bookingDate,
            time: bookingTime,
            status: 'confirmed',
            price: selectedService!.price,
            customFieldValues: customFieldResponses,
            code: generatedBookingCode,
            retiroCode: orderCode || undefined
          } as any);

          // Save for Success Ticket Modal
          setLastConfirmedBooking({
            clientName,
            bookingCode: generatedBookingCode,
            retiroCode: orderCode || undefined,
            serviceName: selectedService!.name,
            collaboratorName: selectedCollaborator!.name,
            date: bookingDate,
            time: bookingTime,
            price: selectedService!.price,
            products: selectedProducts.length > 0 && (isRetiroWithAppointment || isDeliveryRequested) ? selectedProducts.map(p => ({ name: p.name, price: p.price })) : undefined
          });

          // Build dynamic WhatsApp text using tenant templates
          let message = currentTenant.whatsapp.templateConfirmed
            .replace('{{clientName}}', clientName)
            .replace('{{serviceName}}', selectedService!.name)
            .replace('{{collaboratorName}}', selectedCollaborator!.name)
            .replace('{{date}}', bookingDate)
            .replace('{{time}}', bookingTime);

          message += `\n\n🎫 Código de Reserva: ${generatedBookingCode}`;
          if (orderCode) {
            if (isDeliveryRequested) {
              message += `\n🚚 Envío a domicilio solicitado\n📍 Dirección: ${deliveryAddress}\n📦 Código de Pedido: ${orderCode}`;
            } else {
              message += `\n📦 Código de Retiro de Cosméticos: ${orderCode}`;
            }
          }

          setWaNotificationMessage(message);
          setShowWaNotification(true);

          // Reset Booking Fields
          setSelectedService(null);
          setSelectedCollaborator(null);
          setBookingDate('');
          setBookingTime('');
          setClientName('');
          setClientPhone('');
          setClientEmail('');
          setCustomFieldResponses({});
          setSelectedProducts([]);
        } else if (stripePaymentItem?.type === 'product') {
          // Select random collaborator to assign commission
          const randomCol = collaborators[Math.floor(Math.random() * collaborators.length)]?.id || 'col-marcus';
          onNewProductSale(
            stripePaymentItem.itemId,
            stripePaymentItem.name,
            stripePaymentItem.price,
            randomCol
          );

          // WhatsApp confirmation for product purchase
          const productMsg = `💎 Aura NY / ${currentTenant.name}: ¡Gracias por tu compra! Tu pedido de [${stripePaymentItem.name}] por USD $${stripePaymentItem.price} ha sido confirmado mediante Stripe. Pronto coordinaremos el envío/retiro en ${currentTenant.address}.`;
          setWaNotificationMessage(productMsg);
          setShowWaNotification(true);

          setShowProductModal(false);
          setSelectedProduct(null);
        }
      }, 1800);
    }, 2000);
  };

  const simulatePwaInstall = () => {
    setPwaInstalled(true);
    setTimeout(() => {
      setShowPwaToast(false);
    }, 2500);
  };

  return (
    <div className={`transition-all duration-300 pb-20 ${getThemeContainerClass()} ${getFontClass()}`}>
      
      {/* Background radial effects for transparent theme */}
      {theme.mode === 'transparent' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl"></div>
        </div>
      )}

      {/* PWA Simulated Toast Banner */}
      {showPwaToast && (
        <div className="bg-neutral-900 border-b border-neutral-800 text-white px-4 py-3 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-amber-400 shrink-0 animate-bounce" />
              <span>
                {pwaInstalled 
                  ? '🎉 ¡Instalando Aura NY PWA en segundo plano! Accede instantáneamente desde tu móvil sin conexión.'
                  : '¡Añade esta App Estética a tu Inicio como PWA para agendar al instante con un solo toque!'}
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              {!pwaInstalled ? (
                <button
                  id="install-pwa-button"
                  onClick={simulatePwaInstall}
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3 py-1.5 rounded-lg text-xs tracking-wider transition-all shadow-md active:scale-95"
                >
                  INSTALAR APP
                </button>
              ) : (
                <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                  <Check className="h-4 w-4" /> INSTALADA
                </span>
              )}
              <button 
                id="close-pwa-banner"
                onClick={() => setShowPwaToast(false)} 
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NY Luxury Hero Banner */}
      <section className="relative h-[400px] flex items-center justify-center text-center overflow-hidden border-b border-neutral-800">
        {/* Absolute Language & Admin Controls Selector */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang('es')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border backdrop-blur-md cursor-pointer ${
              lang === 'es'
                ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-lg shadow-amber-500/20'
                : 'bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
          >
            <span>🇪🇸</span> <span className="hidden sm:inline">ESP</span>
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border backdrop-blur-md cursor-pointer ${
              lang === 'en'
                ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-lg shadow-amber-500/20'
                : 'bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
          >
            <span>🇬🇧</span> <span className="hidden sm:inline">ENG</span>
          </button>

          <div className="h-6 w-[1px] bg-neutral-850 mx-0.5"></div>

          {session ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsViewingPanel?.(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-amber-500 bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 cursor-pointer"
                title={lang === 'es' ? 'Ir al Panel de Administración' : 'Go to Admin Panel'}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>{lang === 'es' ? 'PANEL' : 'PANEL'}</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 bg-neutral-950/60 hover:bg-neutral-900 border border-neutral-800 hover:border-rose-900/30 transition-all cursor-pointer"
                title={lang === 'es' ? 'Cerrar Sesión' : 'Logout'}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="public-ingresar-button"
              onClick={onOpenLoginModal}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border bg-neutral-950/60 text-amber-500 border-neutral-800 hover:border-amber-500 hover:text-amber-400 hover:bg-neutral-900 backdrop-blur-md cursor-pointer"
            >
              <Shield className="h-3.5 w-3.5 text-amber-500" />
              <span>{lang === 'es' ? 'INGRESAR' : 'LOGIN'}</span>
            </button>
          )}
        </div>

        <div className="absolute inset-0 z-0">
          <img 
            src={currentTenant.heroImage || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80"} 
            alt="New York Luxury Salon Interior" 
            className="w-full h-full object-cover filter brightness-[0.25] saturate-[0.85]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-mono tracking-[0.3em] text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {currentTenant.heroLabel || "FIRST CLASS SALON • NYC"}
            </span>
            <h2 className="text-4xl sm:text-6xl font-display font-black tracking-tight text-white uppercase mt-4 mb-3 animate-fade-in">
              {currentTenant.name}
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 font-light max-w-2xl mx-auto mb-6">
              {currentTenant.heroDescription || "Experiencias de belleza excepcionales en pleno Nueva York. Especialidades de alto nivel, coloración de autor y cosmética de lujo a medida."}
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/60 border border-neutral-800">
                📍 {currentTenant.address}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/60 border border-neutral-800">
                📞 {currentTenant.phone}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Dynamic Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Services & Products lists (8 Columns) */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Services Showcase */}
            {/* Services Showcase */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight uppercase flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    {t.servicesTitle}
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    {lang === 'es' ? 'TOCA PARA SELECCIONAR Y AGENDAR' : 'TAP TO SELECT AND BOOK'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    id={`service-card-${service.id}`}
                    onClick={() => {
                      setSelectedService(service);
                      // Pre-fill fields with service default custom fields
                      const defaults: { [id: string]: string } = {};
                      service.customFields.forEach(f => {
                        defaults[f.id] = f.value;
                      });
                      setCustomFieldResponses(defaults);
                    }}
                    className={`cursor-pointer transition-all duration-300 text-left relative ${getCardClass()} ${
                      selectedService?.id === service.id 
                        ? 'ring-2 ring-amber-500 scale-[1.01]' 
                        : 'hover:scale-[1.005]'
                    }`}
                  >
                    {service.image && (
                      <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-neutral-950/20 border border-neutral-800/10">
                        <img 
                          src={service.image} 
                          alt={service.name} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                        />
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono tracking-widest text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
                        {service.category}
                      </span>
                      <span className="text-xl font-bold font-mono tracking-tight text-amber-500">
                        ${service.price}
                      </span>
                    </div>

                    <h4 className="font-semibold text-base mb-1 pr-6">{service.name}</h4>
                    <p className="text-xs opacity-75 line-clamp-2 mb-4 font-light leading-relaxed">{service.description}</p>
                    
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-3 border-t border-neutral-800/10 dark:border-neutral-800/40">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {service.duration} mins
                      </span>
                      
                      {selectedService?.id === service.id ? (
                        <span className="text-amber-400 flex items-center gap-1 font-semibold">
                          {lang === 'es' ? 'Seleccionado' : 'Selected'} <Check className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="text-neutral-500 hover:text-neutral-300 flex items-center gap-1">
                          {currentTenant.isServiceSeleccionarEnabled 
                            ? (lang === 'es' ? 'Seleccionar' : 'Select') 
                            : (lang === 'es' ? 'Agendar' : 'Book')} <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Products Showcase */}
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold tracking-tight uppercase flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-amber-500" />
                  {t.productsTitle}
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  {lang === 'es' ? 'ESTÉTICA CON SELLO NUEVA YORK, CON 3 IMÁGENES CADA UNO' : 'NYC LUXURY ESTHETICS, WITH 3 IMAGES EACH'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.map((product) => {
                  const currentImgIdx = activeProductIndex[product.id] || 0;
                  const isProductSelected = selectedProducts.some(p => p.id === product.id);
                  const isModoEncargo = currentTenant.isModoEncargoEnabled !== false;
                  
                  return (
                    <div 
                      key={product.id} 
                      id={`product-card-${product.id}`}
                      className={`${getCardClass()} flex flex-col justify-between overflow-hidden relative group text-left transition-all ${
                        isModoEncargo && isProductSelected 
                          ? 'ring-2 ring-amber-500 scale-[1.01] bg-amber-500/5' 
                          : 'hover:scale-[1.005]'
                      }`}
                    >
                      {/* 3-Image Carousel Area */}
                      <div className="relative h-48 -mx-6 -mt-6 mb-4 bg-neutral-900 group">
                        <img 
                          src={product.images[currentImgIdx] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80'} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        />
                        
                        {/* Carousel Arrows */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              prevImage(product.id, product.images.length);
                            }}
                            className="p-1 rounded-full bg-black/60 hover:bg-black text-white transition-all shadow-md"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              nextImage(product.id, product.images.length);
                            }}
                            className="p-1 rounded-full bg-black/60 hover:bg-black text-white transition-all shadow-md"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Carousel dots indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          {product.images.map((_, idx) => (
                            <span 
                              key={idx} 
                              className={`h-1.5 w-1.5 rounded-full transition-all ${idx === currentImgIdx ? 'bg-amber-400 w-3' : 'bg-neutral-500'}`}
                            ></span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-baseline mb-2">
                          <h4 className="font-bold text-base line-clamp-1">{product.name}</h4>
                          <span className="text-lg font-mono font-extrabold text-amber-500">${product.price}</span>
                        </div>
                        <p className="text-xs opacity-75 line-clamp-2 font-light leading-relaxed mb-4">{product.description}</p>
                        
                        {/* Active custom fields preview */}
                        {product.customFields.length > 0 && (
                          <div className="space-y-1 mb-4 p-2.5 rounded-lg bg-neutral-500/5 border border-neutral-500/10">
                            {product.customFields.map((f) => (
                              <div key={f.id} className="flex justify-between text-[10px] font-mono">
                                <span className="text-neutral-400">{f.label}:</span>
                                <span className="font-semibold text-neutral-300">{f.value || 'N/A'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-800/10 dark:border-neutral-800/40">
                        <span className={`text-[10px] font-mono ${product.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {product.stock > 0 ? `✓ En stock (${product.stock})` : '✕ Agotado'}
                        </span>
                        
                        {isModoEncargo ? (
                          <button
                            id={`select-product-${product.id}`}
                            onClick={() => toggleSelectProduct(product)}
                            disabled={product.stock === 0}
                            className={`font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                              isProductSelected
                                ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400'
                                : 'bg-neutral-900 hover:bg-neutral-800 text-amber-400 hover:text-white border border-neutral-800 hover:border-amber-400/30'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            {isProductSelected ? 'Seleccionado' : 'Seleccionar'}
                          </button>
                        ) : (
                          <button
                            id={`buy-product-${product.id}`}
                            onClick={() => initiateProductCheckout(product)}
                            disabled={product.stock === 0}
                            className="bg-neutral-900 hover:bg-neutral-800 text-amber-400 hover:text-white border border-neutral-800 hover:border-amber-400/30 font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CreditCard className="h-3 w-3" />
                            Comprar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Client Comments / Testimonials Section */}
            <div className="mt-12 pt-12 border-t border-neutral-800/10 dark:border-neutral-800/40">
              <div className="mb-8">
                <h3 className="text-2xl font-bold tracking-tight uppercase flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                  {t.opinionsTitle}
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  {lang === 'es' 
                    ? `HISTORIAS REALES Y EXPERIENCIAS EN ${currentTenant.name.toUpperCase()}` 
                    : `REAL STORIES & EXPERIENCES AT ${currentTenant.name.toUpperCase()}`}
                </p>
              </div>

              {/* Comments Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {comments.filter(c => c.approved && c.tenantId === currentTenant.id).length === 0 ? (
                  <div className="sm:col-span-2 py-8 px-4 text-center rounded-2xl border border-dashed border-neutral-800/40 bg-neutral-950/30">
                    <p className="text-sm text-neutral-400 font-sans">{t.noOpinions}</p>
                  </div>
                ) : (
                  comments.filter(c => c.approved && c.tenantId === currentTenant.id).map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${getCardClass()} flex flex-col justify-between p-5 relative border border-neutral-800/40`}
                    >
                      <div className="space-y-3">
                        {/* Rating Stars & Date */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= comment.rating
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-neutral-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[9px] font-mono text-neutral-500">{comment.date}</span>
                        </div>

                        {/* Comment Text */}
                        <p className="text-xs text-neutral-300 italic font-light leading-relaxed">
                          "{comment.text}"
                        </p>
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center gap-2.5 pt-4 mt-4 border-t border-neutral-900">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center">
                          <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">
                            {comment.name.substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">{comment.name}</h5>
                          <span className="text-[9px] text-amber-500 font-mono">{t.verifiedClient}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Leave a Comment Form */}
              <div className={`${getCardClass()} p-6 border border-neutral-850 bg-neutral-950/40 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <MessageSquare className="h-32 w-32 text-amber-500" />
                </div>

                <div className="relative z-10">
                  <h4 className="text-base font-bold uppercase tracking-wider text-white mb-1.5">{t.ratingLabel}</h4>
                  <p className="text-[10px] text-neutral-400 font-mono mb-6 uppercase">{t.ratingSubtitle}</p>

                  <AnimatePresence mode="wait">
                    {commentSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3"
                      >
                        <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-500">
                          <Check className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider">{t.commentSuccessTitle}</h5>
                          <p className="text-[11px] text-neutral-300 max-w-md mx-auto leading-relaxed">
                            {t.commentSuccessText}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCommentSuccess(false)}
                          className="mt-2 text-[10px] font-mono uppercase text-amber-500 hover:text-amber-400 font-semibold underline cursor-pointer"
                        >
                          {t.writeAnotherComment}
                        </button>
                      </motion.div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!commentName.trim() || !commentText.trim()) return;

                          if (onAddComment) {
                            onAddComment(commentName.trim(), commentRating, commentText.trim());
                          }

                          // Clear fields
                          setCommentName('');
                          setCommentText('');
                          setCommentRating(5);
                          setCommentSuccess(true);
                        }}
                        className="space-y-4"
                      >
                        {/* Rating Selection */}
                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-mono text-neutral-400 uppercase">
                            {lang === 'es' ? 'Puntuación / Calificación' : 'Rating / Score'}
                          </label>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setCommentRating(star)}
                                onMouseEnter={() => setCommentHoverRating(star)}
                                onMouseLeave={() => setCommentHoverRating(0)}
                                className="p-1 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                              >
                                <Star
                                  className={`h-6 w-6 transition-colors ${
                                    star <= (commentHoverRating || commentRating)
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-neutral-800 hover:text-neutral-700'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-[10px] font-mono text-neutral-500 ml-1">
                              {lang === 'es' 
                                ? `(${commentHoverRating || commentRating} de 5 estrellas)` 
                                : `(${commentHoverRating || commentRating} of 5 stars)`}
                            </span>
                          </div>
                        </div>

                        {/* Name and Text Inputs */}
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1.5">
                            <label htmlFor="comment-author-name" className="block text-[9px] font-mono text-neutral-400 uppercase">
                              {t.yourName}
                            </label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                              <input
                                id="comment-author-name"
                                type="text"
                                required
                                value={commentName}
                                onChange={(e) => setCommentName(e.target.value)}
                                placeholder="Ej: Julianne Moore"
                                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/30 transition-colors"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label htmlFor="comment-text-area" className="block text-[9px] font-mono text-neutral-400 uppercase">
                              {t.yourComment}
                            </label>
                            <textarea
                              id="comment-text-area"
                              required
                              rows={3}
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder={lang === 'es' ? 'Describe tu experiencia con nosotros... (coloración, atención, corte, etc.)' : 'Describe your experience with us... (color, service, cut, etc.)'}
                              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/30 transition-colors resize-none leading-relaxed"
                            />
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-4 rounded-xl text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {t.submitComment}
                        </button>
                      </form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Booking Engine & Checkout Form (5 Columns) */}
          <div id="booking-portal" className="lg:col-span-5">
            <div className={getCardClass()}>
              <div className="border-b border-neutral-800/15 dark:border-neutral-800/60 pb-4 mb-6">
                <span className="text-xs font-mono tracking-widest text-amber-500 uppercase">
                  {lang === 'es' ? 'Reserva Inmediata PWA' : 'Immediate Booking PWA'}
                </span>
                <h3 className="text-xl font-bold tracking-tight uppercase mt-1">
                  {lang === 'es' ? 'Portal de Citas y Agendamiento' : 'Appointment Portal'}
                </h3>
              </div>

              {!selectedService ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-neutral-800/30">
                  <Calendar className="h-10 w-10 text-neutral-400 mx-auto mb-3 animate-pulse" />
                  <p className="text-sm font-medium">
                    {lang === 'es' ? 'Por favor, selecciona un servicio premium' : 'Please select a premium service'}
                  </p>
                  <p className="text-xs text-neutral-400 font-light mt-1 max-w-xs mx-auto">
                    {lang === 'es' 
                      ? 'Selecciona cualquier tratamiento de la lista izquierda para comenzar a configurar tu experiencia exclusiva.' 
                      : 'Select any treatment from the left list to begin configuring your exclusive experience.'}
                  </p>
                </div>
              ) : (
                <form id="booking-form" onSubmit={initiateServiceCheckout} className="space-y-5 text-left">
                  
                  {/* Selected service resume */}
                  <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3.5 items-center text-sm">
                    {selectedService.image && (
                      <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-amber-500/10 overflow-hidden shrink-0">
                        <img src={selectedService.image} alt={selectedService.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-amber-500 uppercase">
                        {lang === 'es' ? 'Servicio seleccionado' : 'Selected service'}
                      </span>
                      <h4 className="font-semibold line-clamp-1 mt-0.5">{selectedService.name}</h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-neutral-400 block">{selectedService.duration} min</span>
                      <span className="font-bold text-amber-500 font-mono">${selectedService.price}</span>
                    </div>
                  </div>

                  {/* STEP 1: Choose Stylist/Collaborator */}
                  <div>
                    <label className="block text-xs font-mono text-neutral-400 uppercase mb-2">
                      {lang === 'es' ? '1. Selecciona tu Profesional Especialista' : '1. Select Your Specialist'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {collaborators
                        .filter(col => col.specialties.includes(selectedService.category))
                        .map((col) => (
                          <div
                            key={col.id}
                            id={`collaborator-select-${col.id}`}
                            onClick={() => setSelectedCollaborator(col)}
                            className={`cursor-pointer p-2.5 rounded-xl border text-center transition-all ${
                              selectedCollaborator?.id === col.id
                                ? 'bg-amber-500/10 border-amber-500 text-white'
                                : 'bg-neutral-500/5 hover:bg-neutral-500/10 border-neutral-800/40 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <img 
                              src={col.avatar} 
                              alt={col.name} 
                              className="w-10 h-10 rounded-full object-cover mx-auto mb-2 border border-neutral-700 shadow-sm"
                            />
                            <h5 className="text-[11px] font-bold line-clamp-1 leading-tight">{col.name}</h5>
                            <p className="text-[9px] opacity-75 line-clamp-1 font-light mt-0.5">{col.role.split(' ')[0]}</p>
                            <div className="flex items-center justify-center gap-0.5 text-[8px] mt-1 text-amber-400 font-bold font-mono">
                              <Star className="h-2.5 w-2.5 fill-current" /> {col.rating}
                            </div>
                          </div>
                        ))}
                      {collaborators.filter(col => col.specialties.includes(selectedService.category)).length === 0 && (
                        // Fallback show all if category match not found (for dynamic categories)
                        collaborators.map((col) => (
                          <div
                            key={col.id}
                            onClick={() => setSelectedCollaborator(col)}
                            className={`cursor-pointer p-2.5 rounded-xl border text-center transition-all ${
                              selectedCollaborator?.id === col.id
                                ? 'bg-amber-500/10 border-amber-500 text-white'
                                : 'bg-neutral-500/5 hover:bg-neutral-500/10 border-neutral-800/40 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <img 
                              src={col.avatar} 
                              alt={col.name} 
                              className="w-10 h-10 rounded-full object-cover mx-auto mb-2 border border-neutral-700 shadow-sm"
                            />
                            <h5 className="text-[11px] font-bold line-clamp-1 leading-tight">{col.name}</h5>
                            <p className="text-[9px] opacity-75 line-clamp-1 font-light mt-0.5">{col.role.split(' ')[0]}</p>
                            <div className="flex items-center justify-center gap-0.5 text-[8px] mt-1 text-amber-400 font-bold font-mono">
                              <Star className="h-2.5 w-2.5 fill-current" /> {col.rating}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* STEP 2: Agenda de Citas Interactiva (Visual Calendar) */}
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs font-mono text-neutral-400 uppercase mb-2">
                        {lang === 'es' ? '2. Agenda de Turnos Disponibles (Próximos 14 días)' : '2. Available Appointment Slots (Next 14 Days)'}
                      </span>
                      
                      {/* Horizontal scroll of days */}
                      <div className="flex gap-2 overflow-x-auto pb-2.5 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                        {getNextDays().map((date, idx) => {
                          const dateStr = formatYYYYMMDD(date);
                          const isWorking = isDateWorkingForCollaborator(date);
                          const isSelected = bookingDate === dateStr;
                          const dayNameShort = lang === 'en'
                            ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
                            : getSpanishDayName(date).substring(0, 3);
                          const dayNum = date.getDate();
                          const isToday = idx === 0;

                          return (
                            <button
                              key={dateStr}
                              type="button"
                              disabled={!isWorking}
                              onClick={() => {
                                  setBookingDate(dateStr);
                                  setBookingTime(''); // reset time on date change
                              }}
                              className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[64px] border text-center transition-all cursor-pointer relative select-none ${
                                isSelected
                                  ? 'bg-amber-500 border-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20'
                                  : isWorking
                                    ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-200 hover:bg-neutral-800'
                                    : 'bg-neutral-950 border-neutral-900 text-neutral-600 cursor-not-allowed opacity-40'
                              }`}
                            >
                              <span className={`text-[9px] font-mono uppercase tracking-wider ${isSelected ? 'text-neutral-950 font-extrabold' : 'text-neutral-400'}`}>
                                {isToday ? (lang === 'es' ? 'Hoy' : 'Today') : dayNameShort}
                              </span>
                              <span className="text-base font-extrabold mt-0.5">{dayNum}</span>
                              <span className={`text-[7px] font-mono uppercase mt-1 leading-none ${isSelected ? 'text-neutral-950' : 'text-amber-500/80'}`}>
                                {isWorking ? (lang === 'es' ? 'Libre' : 'Free') : (lang === 'es' ? 'Cerrado' : 'Closed')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {bookingDate && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <span className="block text-xs font-mono text-neutral-400 uppercase">
                          {lang === 'es' ? `3. Horarios Disponibles para ${bookingDate}` : `3. Available Times for ${bookingDate}`}
                        </span>
                        
                        <div className="grid grid-cols-4 gap-2">
                          {timeSlots.map((slot) => {
                            const booked = isSlotBooked(bookingDate, slot.value);
                            const isSelected = bookingTime === slot.value;

                            return (
                              <button
                                key={slot.value}
                                type="button"
                                disabled={booked}
                                onClick={() => setBookingTime(slot.value)}
                                className={`py-2 px-1 rounded-lg border text-center font-mono text-xs transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-500 border-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                                    : booked
                                      ? 'bg-neutral-950 border-neutral-950 text-neutral-600 line-through cursor-not-allowed opacity-30'
                                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                                }`}
                              >
                                {slot.label}
                                {booked && (
                                  <span className="block text-[7px] font-sans font-normal opacity-70 mt-0.5">Reservado</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* STEP 3: Client Details */}
                  <div className="space-y-3">
                    <label className="block text-xs font-mono text-neutral-400 uppercase -mb-1">
                      {lang === 'es' ? '4. Información del Cliente' : '4. Client Information'}
                    </label>
                    
                    <div>
                      <input
                        id="client-name"
                        type="text"
                        placeholder={t.fullName}
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className={getInputClass()}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className={`relative flex rounded-xl overflow-hidden ${
                          theme.mode === 'dark' || theme.mode === 'transparent'
                            ? 'bg-neutral-900/50 border border-neutral-800 focus-within:ring-1 focus-within:ring-amber-500/50'
                            : 'bg-neutral-50 border border-neutral-200 focus-within:ring-1 focus-within:ring-amber-600/50'
                        }`}>
                          <span className={`px-3.5 py-3 text-xs font-mono font-bold flex items-center justify-center border-r select-none shrink-0 ${
                            theme.mode === 'dark' || theme.mode === 'transparent'
                              ? 'bg-neutral-950/80 border-neutral-850 text-amber-500'
                              : 'bg-neutral-200/80 border-neutral-300 text-amber-700'
                          }`}>
                            {currentTenant.phonePrefix || '+54 9'}
                          </span>
                          <input
                            id="client-phone"
                            type="tel"
                            placeholder={lang === 'es' ? 'Teléfono (WhatsApp)' : 'Phone number (WhatsApp)'}
                            required
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            className={`w-full bg-transparent px-4 py-3 text-sm focus:outline-none ${
                              theme.mode === 'dark' || theme.mode === 'transparent' ? 'text-white' : 'text-neutral-900'
                            }`}
                          />
                        </div>
                        <span className="text-[9px] text-emerald-400 font-mono mt-1 block">
                          📲 {t.whatsAppNotice}
                        </span>
                      </div>
                      <div>
                        <input
                          id="client-email"
                          type="email"
                          placeholder={t.email}
                          required
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className={getInputClass()}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Selected products for pick-up option (Modo Encargo) */}
                  {selectedProducts.length > 0 && (
                    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3.5 text-left shadow-lg">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 font-mono">
                          📦 Canasta de Cosméticos en Modo Encargo
                        </h4>
                      </div>
                      
                      <div className="space-y-1.5 border-b border-neutral-800 pb-3 max-h-32 overflow-y-auto">
                        {selectedProducts.map(product => (
                          <div key={product.id} className="flex justify-between text-xs">
                            <span className="text-neutral-400 font-light">• {product.name}</span>
                            <span className="font-mono text-neutral-300 font-bold">${product.price}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs pt-2 font-bold border-t border-neutral-800/50">
                          <span className="text-neutral-300 uppercase font-mono">Total Pedido:</span>
                          <span className="font-mono text-amber-500 font-extrabold">${selectedProducts.reduce((sum, p) => sum + p.price, 0)}</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2.5 pt-1">
                        <input
                          type="checkbox"
                          id="checkbox-pickup"
                          checked={isRetiroWithAppointment}
                          onChange={(e) => {
                            setIsRetiroWithAppointment(e.target.checked);
                            if (e.target.checked) {
                              setIsDeliveryRequested(false);
                            }
                          }}
                          className="accent-amber-500 h-4.5 w-4.5 rounded border-neutral-800 bg-neutral-950 focus:ring-0 cursor-pointer mt-0.5 shrink-0"
                        />
                        <div className="space-y-0.5">
                          <label htmlFor="checkbox-pickup" className="text-[11px] font-bold text-neutral-200 uppercase cursor-pointer">
                            Retirar productos en tienda el día de mi turno
                          </label>
                          <p className="text-[9px] text-neutral-400 leading-normal">
                            Al confirmar la cita, crearemos una orden de encargo vinculada a su visita ({bookingDate || 'Seleccione fecha'} a las {bookingTime || 'Seleccione hora'}) para pagar directamente al retirar.
                          </p>
                        </div>
                      </div>

                      {currentTenant.isEnviosEnabled && (
                        <div className="space-y-3 pt-2 border-t border-neutral-800/40">
                          <div className="flex items-start space-x-2.5">
                            <input
                              type="checkbox"
                              id="checkbox-delivery"
                              checked={isDeliveryRequested}
                              onChange={(e) => {
                                setIsDeliveryRequested(e.target.checked);
                                if (e.target.checked) {
                                  setIsRetiroWithAppointment(false);
                                }
                              }}
                              className="accent-amber-500 h-4.5 w-4.5 rounded border-neutral-800 bg-neutral-950 focus:ring-0 cursor-pointer mt-0.5 shrink-0"
                            />
                            <div className="space-y-0.5">
                              <label htmlFor="checkbox-delivery" className="text-[11px] font-bold text-neutral-200 uppercase cursor-pointer flex items-center gap-1">
                                🚚 Solicitar Envío a Domicilio
                              </label>
                              <p className="text-[9px] text-neutral-400 leading-normal">
                                Enviaremos tus productos directamente a la dirección que nos indiques.
                              </p>
                            </div>
                          </div>

                          {isDeliveryRequested && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 space-y-1.5"
                            >
                              <label htmlFor="delivery-address-input" className="block text-[9px] font-mono text-neutral-400 uppercase">
                                Dirección Completa de Envío
                              </label>
                              <input
                                id="delivery-address-input"
                                type="text"
                                required={isDeliveryRequested}
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                placeholder="Calle, Número, Departamento, Ciudad"
                                className="w-full bg-neutral-900 border border-neutral-850 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none"
                              />
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Button */}
                  {currentTenant.isModoEncargoEnabled !== false ? (
                    <button
                      id="submit-booking-button"
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-neutral-950 font-bold py-3.5 rounded-xl text-xs tracking-wider transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer uppercase flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Check className="h-4 w-4" />
                      {selectedProducts.length > 0 && isRetiroWithAppointment 
                        ? "Confirmar Turno y Encargo de Productos" 
                        : "Confirmar Reserva de Turno"}
                    </button>
                  ) : (
                    <button
                      id="submit-booking-button"
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3.5 rounded-xl text-xs tracking-wider transition-all shadow-lg hover:shadow-amber-500/10 cursor-pointer uppercase flex items-center justify-center gap-2 active:scale-98"
                    >
                      <CreditCard className="h-4 w-4" />
                      Proceder al Pago con Stripe (${selectedService.price})
                    </button>
                  )}

                  <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-400 font-mono">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Conexión cifrada de Stripe de extremo a extremo</span>
                  </div>

                </form>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* STRIPE PAYMENT MODAL */}
      <AnimatePresence>
        {showStripeModal && stripePaymentItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!stripeProcessing) setShowStripeModal(false);
              }}
              className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-white z-10"
            >
              {/* Close Button */}
              <button
                id="close-stripe-modal"
                onClick={() => setShowStripeModal(false)}
                disabled={stripeProcessing}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white disabled:opacity-30 p-1"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center mb-6">
                {currentTenant.isModoEncargoEnabled !== false ? (
                  <>
                    <div className="mx-auto w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2 border border-amber-500/20">
                      <ShoppingBag className="h-5 w-5 animate-bounce text-amber-500" />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">Gestión de Encargo</span>
                    <h4 className="text-lg font-bold uppercase mt-0.5">Confirmar Pedido / Reserva</h4>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2 border border-indigo-500/20">
                      <CreditCard className="h-5 w-5 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">Pasarela de Pago Stripe</span>
                    <h4 className="text-lg font-bold uppercase mt-0.5">Simulador de Pago Seguro</h4>
                  </>
                )}
              </div>

              {!stripeSuccess ? (
                <form id="stripe-form" onSubmit={handleStripePaymentSubmit} className="space-y-4 text-left">
                  
                  {/* Bill details */}
                  <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-sm">
                    <div className="flex justify-between text-neutral-400 text-xs">
                      <span>Concepto: {stripePaymentItem.type === 'service' ? 'Reserva de Cita' : 'Encargo de Producto'}</span>
                      <span>{currentTenant.name}</span>
                    </div>
                    <div className="font-semibold text-neutral-200 mt-1 line-clamp-1">{stripePaymentItem.name}</div>
                    <div className="flex justify-between items-baseline mt-4 pt-3 border-t border-neutral-800">
                      <span className="text-xs font-mono text-neutral-400">Total:</span>
                      <span className="text-2xl font-mono font-extrabold text-amber-500">${stripePaymentItem.price}</span>
                    </div>
                  </div>

                  {currentTenant.isModoEncargoEnabled !== false ? (
                    /* Notice for Modo Encargo */
                    <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2 text-xs leading-relaxed">
                      <p className="font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                        📦 Solicitud por Encargo sin Cobro Inmediato
                      </p>
                      <p className="text-neutral-300">
                        Tu solicitud se registrará directamente en nuestro sistema <span className="text-white font-medium">sin necesidad de ingresar una tarjeta de crédito</span>.
                      </p>
                      <p className="text-[10px] text-neutral-400 font-light">
                        Podrás abonar en efectivo, transferencia o tarjeta de forma externa o al asistir a tu cita en recepción.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Card Number */}
                      <div>
                        <label htmlFor="stripe-card-number" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Número de Tarjeta</label>
                        <div className="relative">
                          <input
                            id="stripe-card-number"
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 pl-11 text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="4242 4242 4242 4242"
                          />
                          <CreditCard className="absolute left-4 top-3.5 h-4.5 w-4.5 text-neutral-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="stripe-card-expiry" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Vencimiento</label>
                          <input
                            id="stripe-card-expiry"
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-mono text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="MM / AA"
                          />
                        </div>
                        <div>
                          <label htmlFor="stripe-card-cvc" className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">CVC / CVV</label>
                          <input
                            id="stripe-card-cvc"
                            type="password"
                            required
                            maxLength={4}
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-mono text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="•••"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[10px] text-neutral-400 flex gap-2 items-start">
                        <Info className="h-4 w-4 text-amber-500 shrink-0" />
                        <p>
                          Esto es una pasarela de prueba de Stripe. Puedes usar números de tarjeta de prueba estándar (ej. 4242 4242...) para simular flujos de caja y registrar ventas.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <button
                    id="stripe-pay-submit"
                    type="submit"
                    disabled={stripeProcessing}
                    className={`w-full text-neutral-950 font-bold py-3.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                      currentTenant.isModoEncargoEnabled !== false
                        ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/10'
                        : 'bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/10 text-white'
                    }`}
                  >
                    {stripeProcessing ? (
                      <span className="flex items-center gap-1.5 font-mono">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {currentTenant.isModoEncargoEnabled !== false ? 'CONFIRMANDO ENCARGO...' : 'PROCESANDO CON STRIPE...'}
                      </span>
                    ) : (
                      <span>{currentTenant.isModoEncargoEnabled !== false ? 'CONFIRMAR MI ENCARGO' : `CONFIRMAR PAGO DE $${stripePaymentItem.price}`}</span>
                    )}
                  </button>

                </form>
              ) : (
                <div className="py-12 text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400"
                  >
                    <Check className="h-8 w-8" />
                  </motion.div>
                  <div>
                    <h5 className="text-lg font-bold uppercase text-emerald-400">
                      {currentTenant.isModoEncargoEnabled !== false ? '¡Encargo Confirmado!' : '¡Pago Exitoso!'}
                    </h5>
                    <p className="text-xs text-neutral-300 font-light mt-1">
                      {currentTenant.isModoEncargoEnabled !== false 
                        ? 'La solicitud ha sido registrada con éxito por encargo.' 
                        : `Stripe ha procesado el pago y liquidado los fondos de ${currentTenant.name}.`
                      }
                    </p>
                  </div>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    ID Solicitud: {currentTenant.isModoEncargoEnabled !== false ? `req_${Math.random().toString(36).substring(2, 11)}` : 'ch_3MthY9Ksd281asKjsa'}
                  </p>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WHATSAPP REAL-TIME NOTIFICATION POPUP SIMULATOR */}
      <AnimatePresence>
        {showWaNotification && (
          <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm px-4">
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              className="bg-emerald-950 text-white border border-emerald-500/30 rounded-2xl shadow-2xl p-4 overflow-hidden relative"
            >
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2 mb-3">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-emerald-400" />
                  <div>
                    <span className="text-[9px] font-mono text-emerald-400 block uppercase font-bold">Simulación WhatsApp API</span>
                    <span className="text-xs font-semibold">Cliente: {clientName || 'Cliente Aura'}</span>
                  </div>
                </div>
                <button
                  id="close-wa-notification"
                  onClick={() => setShowWaNotification(false)}
                  className="text-neutral-400 hover:text-white p-0.5 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Chat bubble representation */}
              <div className="bg-neutral-900 rounded-xl p-3 text-xs border border-neutral-800 text-left relative">
                <div className="absolute top-2 right-2 flex items-center gap-1 text-[8px] font-mono text-neutral-500">
                  <span>Ahora</span>
                  <div className="flex text-emerald-400">✓✓</div>
                </div>
                <p className="text-neutral-200 font-sans leading-relaxed pr-6 whitespace-pre-line">
                  {waNotificationMessage}
                </p>
              </div>

              <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-emerald-400">
                <span>✓ Enviado vía API Gateway</span>
                <span className="bg-emerald-500/10 px-2 py-0.5 rounded text-[8px]">MOCK LIVE</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING STICKY ORDER BAR FOR MODO ENCARGO */}
      <AnimatePresence>
        {currentTenant.isModoEncargoEnabled !== false && selectedProducts.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-neutral-200 font-mono">
                  🛍️ {selectedProducts.length} {selectedProducts.length === 1 ? 'Cosmético Seleccionado' : 'Cosméticos Seleccionados'}
                </h5>
                <p className="text-[10px] text-neutral-400 leading-normal mt-0.5">
                  Total: <strong className="text-amber-500 font-mono text-xs">${selectedProducts.reduce((sum, p) => sum + p.price, 0)}</strong>. Selecciona un tratamiento de belleza de la lista e ingresa tus datos en el portal de citas para coordinar el retiro físico.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const bookingElement = document.getElementById('booking-portal');
                if (bookingElement) {
                  bookingElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2 px-4 rounded-xl text-[11px] uppercase tracking-wider font-mono transition-all shrink-0 cursor-pointer shadow-md flex items-center justify-center gap-1"
            >
              <Calendar className="h-3.5 w-3.5" />
              Agendar Retiro
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXTREMELY POLISHED CUSTOM BOOKING SUCCESS TICKET MODAL */}
      <AnimatePresence>
        {lastConfirmedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl p-6 text-left"
            >
              <div className="text-center pb-5 border-b border-dashed border-neutral-800">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold uppercase tracking-wider text-white">
                  ¡Turno Reservado!
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Tu reserva y retiro han sido registrados correctamente en nuestro sistema.
                </p>
              </div>

              {/* Physical ticket aesthetics */}
              <div className="py-5 space-y-4 font-sans">
                {/* Booking Code Card */}
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 block uppercase">Código de Reserva (Turno)</span>
                    <span className="text-lg font-mono font-extrabold text-amber-500 tracking-wider">
                      {lastConfirmedBooking.bookingCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(lastConfirmedBooking.bookingCode);
                      alert('✓ Código de Reserva copiado.');
                    }}
                    className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-800"
                    title="Copiar Código"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                {/* Retiro Code Card (if available) */}
                {lastConfirmedBooking.retiroCode && (
                  <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-amber-500/80 block uppercase font-bold animate-pulse">
                        📦 Código de Retiro (Cosméticos)
                      </span>
                      <span className="text-lg font-mono font-extrabold text-emerald-400 tracking-wider">
                        {lastConfirmedBooking.retiroCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(lastConfirmedBooking.retiroCode || '');
                        alert('✓ Código de Retiro copiado.');
                      }}
                      className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-800"
                      title="Copiar Código"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Details list */}
                <div className="bg-neutral-950/40 border border-neutral-850 rounded-2xl p-4.5 space-y-2.5 text-xs font-mono text-neutral-300">
                  <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                    <span className="text-neutral-500">CLIENTE</span>
                    <span className="text-white font-sans font-semibold">{lastConfirmedBooking.clientName}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                    <span className="text-neutral-500">TRATAMIENTO</span>
                    <span className="text-white font-sans font-semibold">{lastConfirmedBooking.serviceName}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                    <span className="text-neutral-500">PROFESIONAL</span>
                    <span className="text-white font-sans font-semibold">{lastConfirmedBooking.collaboratorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                    <span className="text-neutral-500">FECHA Y HORA</span>
                    <span className="text-amber-500 font-bold">{lastConfirmedBooking.date} • {lastConfirmedBooking.time} hs</span>
                  </div>
                  
                  {/* Products purchased details */}
                  {lastConfirmedBooking.products && lastConfirmedBooking.products.length > 0 && (
                    <div className="pt-1.5 space-y-1">
                      <span className="text-neutral-500 block uppercase text-[10px]">Cosméticos Adquiridos:</span>
                      {lastConfirmedBooking.products.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-neutral-400 text-[11px] pl-2 border-l border-neutral-800">
                          <span>• {p.name}</span>
                          <span className="text-neutral-300">${p.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-neutral-500 text-center font-mono leading-relaxed px-2">
                  ⚠️ Por favor guarda o toma captura de pantalla de estos códigos. Preséntalos al ingresar al local y al retirar tus productos.
                </p>
              </div>

              {/* Footer Button */}
              <button
                type="button"
                onClick={() => setLastConfirmedBooking(null)}
                className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold py-3 rounded-2xl text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer mt-2"
              >
                Entendido, Cerrar Ticket
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
