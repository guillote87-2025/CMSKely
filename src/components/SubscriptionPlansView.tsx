import React, { useState } from 'react';
import {
  Crown,
  Check,
  Sparkles,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  RotateCcw,
  Lock,
  Star,
  CheckCircle2,
  X,
  Zap,
  BookOpen,
  Calendar,
  MessageSquare,
  Flame,
  FileCheck,
} from 'lucide-react';
import { Article, SubscriptionPlan, User } from '../data/akeaData';
import { EditorialVisual } from './EditorialVisual';

interface SubscriptionPlansViewProps {
  currentUser: User | null;
  subscriptionPlans?: SubscriptionPlan[];
  premiumArticles: Article[];
  onBack: () => void;
  onSelectArticle: (articleId: string) => void;
  onSubscribeUser: (
    planId: string,
    billingCycle: 'monthly' | 'annual',
    paymentMethod: string
  ) => Promise<boolean>;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenLegal: (section: 'privacy' | 'refund' | 'terms') => void;
}

export const SubscriptionPlansView: React.FC<SubscriptionPlansViewProps> = ({
  currentUser,
  subscriptionPlans = [],
  premiumArticles,
  onBack,
  onSelectArticle,
  onSubscribeUser,
  onOpenLogin,
  onOpenRegister,
  onOpenLegal,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] =
    useState<SubscriptionPlan | null>(null);

  // Checkout modal form state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple_pay'>('card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8824');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || 'Carmen Ortiz');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvc, setCardCvc] = useState('482');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Fallback default plans if not populated
  const defaultPlans: SubscriptionPlan[] = [
    {
      id: 'plan-monthly',
      name: 'Plan Lector Premium Mensual',
      slug: 'premium-mensual',
      price: 9.99,
      currency: 'USD',
      billingCycle: 'monthly',
      durationDays: 30,
      description: 'Acceso completo sin límites a todos los artículos Premium, ensayos fotográficos y mensajería directa.',
      features: [
        'Acceso ilimitado a todos los artículos y reportajes Premium',
        'Sistema de Mensajería Privada con escritores, editores y moderadores',
        'Modo Lectura Editorial sin distracciones (Sepia, Claro y Noche)',
        'Alertas Push prioritarias y boletín semanal exclusivo',
        'Cancelación flexible en cualquier momento sin penalizaciones',
      ],
      badgeColor: '#5960FF',
      badge: 'Flexibilidad Mensual',
      popular: false,
      active: true,
    },
    {
      id: 'plan-annual',
      name: 'Plan Editorial Gold Anual',
      slug: 'editorial-gold-anual',
      price: 89.99,
      currency: 'USD',
      billingCycle: 'annual',
      durationDays: 365,
      description: 'Nuestra suscripción más elegida. Ahorra un 25% anual con acceso total al archivo histórico y ediciones especiales.',
      features: [
        'Todo lo incluido en el Plan Mensual (365 días de acceso continuo)',
        'Ahorro del 25% equivalente a 3 meses gratuitos al año',
        'Acceso prioritario a reportajes de portada y galerías fotográficas en alta resolución',
        'Mensajería Privada prioritaria con el consejo editorial y autores',
        'Insignia dorada verificada de Suscriptor Premium en comentarios',
        'Garantía de reembolso total del 100% durante los primeros 14 días',
      ],
      badgeColor: '#FF2C54',
      badge: 'Más Popular · Ahorro 25%',
      popular: true,
      active: true,
    },
    {
      id: 'plan-vip',
      name: 'Plan Mecenas & Coleccionista VIP',
      slug: 'mecenas-vip',
      price: 179.0,
      currency: 'USD',
      billingCycle: 'annual',
      durationDays: 365,
      description: 'Para coleccionistas, estudios creativos y mecenas culturales que impulsan el periodismo visual independiente.',
      features: [
        'Acceso total a todas las publicaciones y archivos Premium sin restricciones',
        'Descarga de monografías digitales y catálogos fotográficos en PDF / Alta Resolución',
        'Invitación a encuentros virtuales y revisiones de portafolio con autores',
        'Canal directo con Dirección Creativa, Administradores y Redactores',
        'Mención opcional en el cuadro de honor de Mecenas de Kayleen Magazine',
        'Soporte prioritario personalizado 24/7',
      ],
      badgeColor: '#171920',
      badge: 'Experiencia Coleccionista',
      popular: false,
      active: true,
    },
  ];

  const activePlans =
    subscriptionPlans && subscriptionPlans.length > 0
      ? subscriptionPlans.filter((p) => p.active)
      : defaultPlans;

  const isUserAlreadyPremium =
    Boolean(currentUser?.isPremium) &&
    currentUser?.subscriptionStatus !== 'expired' &&
    currentUser?.subscriptionStatus !== 'cancelled';

  const handleStartCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlanForCheckout(plan);
    setCheckoutError('');
    setCheckoutSuccess(false);
  };

  const handleProcessCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForCheckout) return;

    if (!currentUser) {
      setCheckoutError(
        'Debes iniciar sesión o registrarte como lector antes de completar el pago.'
      );
      return;
    }

    setIsProcessingPayment(true);
    setCheckoutError('');

    try {
      const ok = await onSubscribeUser(
        selectedPlanForCheckout.id,
        billingCycle,
        paymentMethod
      );
      if (ok) {
        setCheckoutSuccess(true);
        setTimeout(() => {
          setSelectedPlanForCheckout(null);
          setCheckoutSuccess(false);
        }, 2200);
      } else {
        setCheckoutError('No se pudo procesar el pago. Por favor intenta nuevamente.');
      }
    } catch (err: any) {
      setCheckoutError(err?.message || 'Error en la pasarela de pago.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#171920]">
      {/* Top Bar Navigation */}
      <div className="bg-white border-b border-[#dcdfe7] sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#dcdfe7] text-xs font-semibold text-[#4b546e] hover:text-[#171920] hover:border-[#171920] bg-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Revista</span>
          </button>

          <div className="flex items-center gap-3">
            {isUserAlreadyPremium ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" />
                <span>Membresía Premium Activa</span>
              </span>
            ) : currentUser ? (
              <div className="text-xs text-[#595F71]">
                Sesión iniciada como <strong>{currentUser.name}</strong> (Lector Free)
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-xs font-semibold text-[#595F71] hover:text-[#171920] cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <span className="text-[#dcdfe7]">|</span>
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="text-xs font-bold text-[#FF2C54] hover:underline cursor-pointer"
                >
                  Registrarse Gratis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white border-b border-[#dcdfe7] py-14 sm:py-20 relative overflow-hidden">
        <div className="max-w-[1000px] mx-auto px-5 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-100 to-amber-500/10 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-wider mb-5">
            <Crown className="w-4 h-4 text-amber-600" />
            <span>Periodismo Visual &amp; Narrativa Independiente</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#171920] tracking-tight mb-4">
            Planes de Suscripción Premium Kayleen
          </h1>

          <p className="text-base sm:text-lg text-[#4b546e] max-w-2xl mx-auto leading-relaxed mb-8">
            Desbloquea el acceso ilimitado a todos los reportajes fotográficos exclusivos, ensayos de portada en alta resolución, modo lectura de archivo y mensajería directa con nuestro consejo editorial.
          </p>

          {/* Billing Frequency Switcher: Mensual vs Anual */}
          <div className="inline-flex items-center p-1.5 rounded-[14px] bg-[#f7f8fc] border border-[#dcdfe7] shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-[10px] text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-[#171920] text-white shadow-xs'
                  : 'text-[#595F71] hover:text-[#171920]'
              }`}
            >
              Facturación Mensual
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-[10px] text-xs sm:text-sm font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-[#FF2C54] text-white shadow-xs'
                  : 'text-[#595F71] hover:text-[#171920]'
              }`}
            >
              <span>Facturación Anual</span>
              <span className="px-2 py-0.5 rounded-full bg-white text-[#FF2C54] text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                -25% Ahorro
              </span>
            </button>
          </div>

          {/* Quick Trust Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#595F71]">
            <span className="inline-flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              Garantía de reembolso de 14 días
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#5960FF]" />
              Pago 100% seguro SSL 256 bits
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FF2C54]" />
              Cancela en 1 clic cuando quieras
            </span>
          </div>
        </div>
      </div>

      {/* Main Pricing Tiers Grid */}
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Lector Free (Free Reader) */}
          <div className="rounded-[22px] bg-white border border-[#dcdfe7] p-7 sm:p-9 flex flex-col justify-between shadow-xs">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#595F71] mb-2">
                Nivel Estándar
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#171920] mb-2">
                Lector Registrado (Free)
              </h2>
              <p className="text-xs text-[#595F71] leading-relaxed mb-6">
                Para lectores casuales que desean disfrutar de artículos abiertos y participar en los comentarios del blog.
              </p>

              <div className="mb-6 pb-6 border-b border-[#f0f2f7]">
                <div className="text-3xl font-extrabold text-[#171920]">
                  $0
                  <span className="text-xs font-normal text-[#595F71]"> / para siempre</span>
                </div>
                <span className="text-[11px] text-[#595F71] block mt-1">
                  Sin necesidad de tarjeta de crédito
                </span>
              </div>

              <div className="space-y-3 text-xs text-[#333B52]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Acceso completo a todos los artículos abiertos de la revista</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Filtro por categorías y etiquetas temáticas</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Publicación de comentarios moderados</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Suscripción al boletín público semanal</span>
                </div>
                <div className="flex items-start gap-2.5 text-[#595F71] opacity-60">
                  <X className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                  <span>Sin acceso a reportajes exclusivos Premium</span>
                </div>
                <div className="flex items-start gap-2.5 text-[#595F71] opacity-60">
                  <X className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                  <span>Sin mensajería privada con el consejo editorial</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              {currentUser ? (
                <div className="w-full py-3 rounded-[12px] bg-[#f7f8fc] text-[#595F71] text-xs font-bold text-center border border-[#dcdfe7]">
                  Tu Cuenta Actual (Free)
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="w-full py-3 rounded-[12px] bg-white border-2 border-[#171920] hover:bg-[#171920] hover:text-white text-xs font-bold transition-colors cursor-pointer text-[#171920]"
                >
                  Crear Cuenta Gratis
                </button>
              )}
            </div>
          </div>

          {/* Plan 2: Digital Premium (Featured / Most Popular) */}
          <div className="rounded-[22px] bg-white border-2 border-[#FF2C54] p-7 sm:p-9 flex flex-col justify-between shadow-xl relative overflow-hidden ring-4 ring-[#FF2C54]/10">
            {/* Top Ribbon */}
            <div className="absolute top-0 right-0 bg-[#FF2C54] text-white text-[11px] font-bold uppercase tracking-wider py-1.5 px-6 rounded-bl-[16px] shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recomendado</span>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#FF2C54] mb-2 flex items-center gap-1.5">
                <Crown className="w-4 h-4" />
                <span>Suscripción Estrella</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#171920] mb-2">
                Digital Premium Kayleen
              </h2>
              <p className="text-xs text-[#595F71] leading-relaxed mb-6">
                Acceso total a todos los reportajes fotográficos a fondo, sin paywall ni publicidad, con modo lectura zen y contacto editorial.
              </p>

              <div className="mb-6 pb-6 border-b border-[#f0f2f7]">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-[#FF2C54] tabular-nums">
                    {billingCycle === 'annual' ? '$7.49' : '$9.99'}
                  </span>
                  <span className="text-xs font-semibold text-[#595F71]">
                    USD / mes {billingCycle === 'annual' && '(facturado $89.99/año)'}
                  </span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>14 días de garantía de satisfacción total o reembolso</span>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-[#171920]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FF2C54] shrink-0 mt-0.5" />
                  <strong>Acceso ilimitado a todos los artículos y series fotográficas Premium</strong>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FF2C54] shrink-0 mt-0.5" />
                  <span>Canal de Mensajería Privada directa con escritores, editores y moderadores</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FF2C54] shrink-0 mt-0.5" />
                  <span>Modo Lectura sin distracciones (Ambientes Claro, Sepia y Noche Zen)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FF2C54] shrink-0 mt-0.5" />
                  <span>Galerías de fotos en alta definición con visor ampliado (Lightbox)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FF2C54] shrink-0 mt-0.5" />
                  <span>Insignia dorada verificada de Suscriptor Premium en comentarios</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#FF2C54] shrink-0 mt-0.5" />
                  <span>Alertas Push de primicias editoriales y boletín VIP semanal</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              {isUserAlreadyPremium ? (
                <div className="w-full py-3.5 rounded-[12px] bg-emerald-50 text-emerald-700 text-xs font-bold text-center border border-emerald-200 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Membresía Premium Activa</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleStartCheckout(
                      activePlans.find((p) => p.id === 'plan-annual') || activePlans[0]
                    )
                  }
                  className="w-full py-4 rounded-[14px] bg-[#FF2C54] hover:bg-[#e02247] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>Suscribirme a Premium Ahora</span>
                </button>
              )}
            </div>
          </div>

          {/* Plan 3: Kayleen Club Mecenas VIP */}
          <div className="rounded-[22px] bg-white border border-[#dcdfe7] p-7 sm:p-9 flex flex-col justify-between shadow-xs">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#5960FF] mb-2 flex items-center gap-1.5">
                <Star className="w-4 h-4" />
                <span>Nivel Coleccionista &amp; Mecenas</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#171920] mb-2">
                Kayleen Club Mecenas VIP
              </h2>
              <p className="text-xs text-[#595F71] leading-relaxed mb-6">
                Para coleccionistas, directores creativos y entusiastas que impulsan activamente el periodismo cultural de vanguardia.
              </p>

              <div className="mb-6 pb-6 border-b border-[#f0f2f7]">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#171920] tabular-nums">
                    $179
                  </span>
                  <span className="text-xs font-normal text-[#595F71]"> / año</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                  Acceso anual integral sin restricciones
                </span>
              </div>

              <div className="space-y-3 text-xs text-[#333B52]">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#5960FF] shrink-0 mt-0.5" />
                  <strong>Todo lo incluido en el Plan Digital Premium</strong>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#5960FF] shrink-0 mt-0.5" />
                  <span>Descarga de monografías digitales y catálogos en PDF en alta resolución</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#5960FF] shrink-0 mt-0.5" />
                  <span>Invitación a encuentros virtuales y revisiones de portafolio con autores</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#5960FF] shrink-0 mt-0.5" />
                  <span>Canal prioritario con la dirección creativa de la revista</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#5960FF] shrink-0 mt-0.5" />
                  <span>Mención honorífica opcional en el cuadro de mecenas culturales</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#5960FF] shrink-0 mt-0.5" />
                  <span>Atención al lector prioritaria 24/7</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() =>
                  handleStartCheckout(
                    activePlans.find((p) => p.id === 'plan-vip') || activePlans[0]
                  )
                }
                className="w-full py-3.5 rounded-[12px] bg-[#171920] hover:bg-[#FF2C54] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Elegir Plan Mecenas VIP</span>
              </button>
            </div>
          </div>
        </div>

        {/* SHOWCASE OF EXCLUSIVE ARTICLES CURRENTLY UNLOCKED WITH PREMIUM */}
        <div className="mt-16 pt-12 border-t border-[#dcdfe7]">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                <Crown className="w-4 h-4" />
                <span>Colección Exclusiva de Reportajes</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171920]">
                Artículos que desbloquearás al suscribirte
              </h2>
            </div>
            <span className="text-xs font-mono text-[#595F71] bg-white px-3 py-1.5 rounded-full border border-[#dcdfe7]">
              {premiumArticles.length} artículos exclusivos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumArticles.slice(0, 3).map((art) => (
              <article
                key={art.id}
                onClick={() => onSelectArticle(art.id)}
                className="bg-white border border-[#dcdfe7] rounded-[16px] overflow-hidden group cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative">
                    <EditorialVisual
                      preset={art.visualPreset}
                      customImageUrl={art.customImageUrl}
                      alt={art.title}
                      aspectRatio="16:9"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Crown className="w-3 h-3" />
                      <span>Exclusivo</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <span className="text-[11px] font-semibold text-[#FF2C54] uppercase tracking-wider">
                      {art.category}
                    </span>
                    <h3 className="text-base font-bold text-[#171920] group-hover:text-[#FF2C54] transition-colors leading-snug mt-1 mb-2">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#595F71] line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between text-[11px] text-[#595F71] border-t border-[#f0f2f7] mt-3">
                  <span>⏱️ {art.readTimeMinutes} min de lectura</span>
                  <span className="font-semibold text-[#FF2C54] group-hover:underline">
                    Leer adelanto →
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <div className="mt-16 pt-12 border-t border-[#dcdfe7] max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#171920] mb-8">
            Preguntas Frecuentes sobre la Suscripción Premium
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-[14px] bg-white border border-[#dcdfe7]">
              <h3 className="text-sm font-bold text-[#171920] mb-1.5">
                ¿Puedo cancelar mi suscripción en cualquier momento?
              </h3>
              <p className="text-xs text-[#4b546e] leading-relaxed">
                Sí, absolutamente. Puedes cancelar la renovación automática en cualquier instante con 1 clic desde tu panel de usuario o avisándonos por soporte. Mantendrás el acceso hasta el fin de tu ciclo pagado.
              </p>
            </div>

            <div className="p-5 rounded-[14px] bg-white border border-[#dcdfe7]">
              <h3 className="text-sm font-bold text-[#171920] mb-1.5">
                ¿Cómo opera la garantía de devolución de 14 días?
              </h3>
              <p className="text-xs text-[#4b546e] leading-relaxed">
                Si te suscribes por primera vez y consideras que el contenido exclusivo no es lo que esperabas, escríbenos dentro de los primeros 14 días y te reembolsaremos el 100% de tu dinero sin preguntas.
              </p>
            </div>

            <div className="p-5 rounded-[14px] bg-white border border-[#dcdfe7]">
              <h3 className="text-sm font-bold text-[#171920] mb-1.5">
                ¿Qué métodos de pago son aceptados?
              </h3>
              <p className="text-xs text-[#4b546e] leading-relaxed">
                Aceptamos todas las tarjetas de crédito y débito internacionales (Visa, Mastercard, American Express), así como PayPal, Apple Pay y Google Pay mediante pasarelas seguras cifradas con SSL.
              </p>
            </div>

            <div className="p-5 rounded-[14px] bg-white border border-[#dcdfe7]">
              <h3 className="text-sm font-bold text-[#171920] mb-1.5">
                ¿Puedo interactuar directamente con los redactores?
              </h3>
              <p className="text-xs text-[#4b546e] leading-relaxed">
                Sí. Los suscriptores Premium tienen acceso desbloqueado al sistema interno de Mensajería Privada para consultar a los autores, editores y moderadores sobre sus ensayos y técnicas fotográficas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CHECKOUT MODAL: SIMULATED PAYMENT PROCESSOR                          */}
      {/* ===================================================================== */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#dcdfe7] rounded-[22px] w-full max-w-lg p-6 sm:p-8 relative shadow-2xl my-8">
            <button
              type="button"
              onClick={() => setSelectedPlanForCheckout(null)}
              className="absolute top-5 right-5 p-2 text-[#595F71] hover:text-[#171920] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {checkoutSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#171920] mb-2">
                  ¡Suscripción Activada con Éxito!
                </h3>
                <p className="text-xs text-[#595F71] leading-relaxed mb-6">
                  Tu cuenta ahora cuenta con el estatus de <strong>Suscriptor Premium</strong>. Tienes acceso completo a todos los artículos y mensajería privada.
                </p>
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500 text-white text-xs font-bold">
                  <Crown className="w-4 h-4" />
                  <span>Acceso Ilimitado Desbloqueado</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF2C54] mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pasarela de Pago Segura SSL 256 bits</span>
                </div>
                <h3 className="text-xl font-bold text-[#171920] mb-1">
                  Confirmar Suscripción Premium
                </h3>
                <p className="text-xs text-[#595F71] mb-5">
                  Plan seleccionado: <strong>{selectedPlanForCheckout.name}</strong> ({billingCycle === 'annual' ? 'Facturación Anual' : 'Facturación Mensual'})
                </p>

                {/* Plan Price Summary Box */}
                <div className="p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7] mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#171920]">
                      Total a Facturar
                    </div>
                    <div className="text-[11px] text-[#595F71]">
                      Garantía de reembolso 100% durante 14 días
                    </div>
                  </div>
                  <div className="text-xl font-black text-[#FF2C54]">
                    ${billingCycle === 'annual' ? '89.99' : '9.99'} USD
                  </div>
                </div>

                {checkoutError && (
                  <div className="mb-4 p-3 rounded-[10px] bg-red-50 border border-red-200 text-xs text-red-700">
                    {checkoutError}
                  </div>
                )}

                {!currentUser && (
                  <div className="mb-4 p-3 rounded-[10px] bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-3">
                    <span>Para activar tu plan necesitas tener una cuenta.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanForCheckout(null);
                        onOpenRegister();
                      }}
                      className="px-2.5 py-1 rounded bg-[#171920] text-white text-xs font-semibold cursor-pointer"
                    >
                      Registrarme Gratis
                    </button>
                  </div>
                )}

                <form onSubmit={handleProcessCheckoutSubmit} className="space-y-4">
                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#171920] mb-2">
                      Método de Pago
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-2.5 rounded-[10px] border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                          paymentMethod === 'card'
                            ? 'border-[#171920] bg-[#171920] text-white'
                            : 'border-[#dcdfe7] bg-white text-[#4b546e]'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Tarjeta</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('paypal')}
                        className={`p-2.5 rounded-[10px] border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                          paymentMethod === 'paypal'
                            ? 'border-[#171920] bg-[#171920] text-white'
                            : 'border-[#dcdfe7] bg-white text-[#4b546e]'
                        }`}
                      >
                        <span className="font-bold text-xs italic">PayPal</span>
                        <span>PayPal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('apple_pay')}
                        className={`p-2.5 rounded-[10px] border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                          paymentMethod === 'apple_pay'
                            ? 'border-[#171920] bg-[#171920] text-white'
                            : 'border-[#dcdfe7] bg-white text-[#4b546e]'
                        }`}
                      >
                        <span className="font-bold text-xs"> Pay</span>
                        <span>Apple Pay</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Details (Simulated) */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                          Número de Tarjeta
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4532 0000 0000 0000"
                          className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7] font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                            Vencimiento (MM/AA)
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7] font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                            Código CVC / CVV
                          </label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="123"
                            className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7] font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                          Titular de la Tarjeta
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Nombre y Apellidos"
                          className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="p-4 rounded-[10px] bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed text-center">
                      Serás redirigido a la pasarela oficial de PayPal para autorizar tu suscripción segura en 1 clic.
                    </div>
                  )}

                  {paymentMethod === 'apple_pay' && (
                    <div className="p-4 rounded-[10px] bg-gray-50 border border-gray-200 text-xs text-gray-800 leading-relaxed text-center">
                      Confirma con FaceID o TouchID en tu dispositivo Apple compatible.
                    </div>
                  )}

                  {/* Legal Terms Notice */}
                  <div className="pt-2 text-[11px] text-[#595F71] leading-relaxed">
                    Al confirmar tu pago aceptas los{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegal('terms')}
                      className="text-[#FF2C54] underline hover:text-[#5960FF]"
                    >
                      Términos de Suscripción
                    </button>{' '}
                    y las{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegal('refund')}
                      className="text-[#FF2C54] underline hover:text-[#5960FF]"
                    >
                      Políticas de Reembolso
                    </button>{' '}
                    (garantía de satisfacción de 14 días).
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingPayment || !currentUser}
                    className="w-full py-3.5 px-6 rounded-[12px] bg-[#FF2C54] hover:bg-[#e02247] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    <span>
                      {isProcessingPayment
                        ? 'Procesando Pago Seguro...'
                        : `Pagar y Desbloquear Acceso (${billingCycle === 'annual' ? '$89.99' : '$9.99'} USD)`}
                    </span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
