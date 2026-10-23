import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  MapPin,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Crown,
  BookOpen,
  Bell,
  Eye,
  EyeOff,
  ShieldCheck,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { CategoryItem, SiteConfig, User as UserType } from '../data/akeaData';

interface ReaderRegisterViewProps {
  categories: CategoryItem[];
  siteConfig?: SiteConfig;
  onRegisterReader: (payload: {
    name: string;
    email: string;
    password?: string;
    location?: string;
    preferredCategories: string[];
    optInNewsletter: boolean;
    optInPush: boolean;
  }) => Promise<{ ok: boolean; user?: UserType; error?: string }>;
  onBack: () => void;
  onOpenLogin: () => void;
  onOpenSubscriptions: () => void;
  onOpenLegal: (section: 'privacy' | 'refund' | 'terms') => void;
}

const DEFAULT_TOPICS = [
  'Estilo de Vida',
  'Moda',
  'Tecnología',
  'Viajes',
  'Fotografía',
  'Arquitectura & Diseño',
  'Cultura Contemporánea',
  'Gastronomía Consciente',
];

export const ReaderRegisterView: React.FC<ReaderRegisterViewProps> = ({
  categories,
  siteConfig,
  onRegisterReader,
  onBack,
  onOpenLogin,
  onOpenSubscriptions,
  onOpenLegal,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState('Madrid, España');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Estilo de Vida',
    'Fotografía',
  ]);
  const [optInNewsletter, setOptInNewsletter] = useState(true);
  const [optInPush, setOptInPush] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<UserType | null>(null);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Por favor, introduce tu nombre completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Introduce una dirección de correo electrónico válida.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMessage(
        'Debes aceptar las Políticas de Privacidad y Términos de Uso para crear tu cuenta de lector.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await onRegisterReader({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        location: location.trim() || 'España',
        preferredCategories: selectedTopics,
        optInNewsletter,
        optInPush,
      });

      if (!result.ok) {
        setErrorMessage(result.error || 'No fue posible registrar la cuenta.');
      } else {
        setIsSuccess(true);
        if (result.user) setRegisteredUser(result.user);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error inesperado durante el registro.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableTopics = categories && categories.length > 0
    ? categories.map((c) => c.name)
    : DEFAULT_TOPICS;

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#171920]">
      {/* Top Bar */}
      <div className="bg-white border-b border-[#dcdfe7] sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#dcdfe7] text-xs font-semibold text-[#4b546e] hover:text-[#171920] hover:border-[#171920] bg-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Revista</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#595F71] hidden sm:inline">
              ¿Ya tienes una cuenta de lector o autor?
            </span>
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-xs font-bold text-[#FF2C54] hover:underline cursor-pointer"
            >
              Iniciar Sesión →
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 sm:px-6 py-12">
        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="max-w-2xl mx-auto bg-white border border-[#dcdfe7] rounded-[22px] p-8 sm:p-12 text-center shadow-lg animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              ¡Cuenta de Lector Creada con Éxito!
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171920] mt-1 mb-3">
              Bienvenido a Kayleen Magazine, {registeredUser?.name || name}
            </h2>
            <p className="text-sm text-[#4b546e] max-w-lg mx-auto leading-relaxed mb-8">
              Tu perfil de lector ha sido activado. Ahora puedes comentar en las publicaciones, guardar artículos y disfrutar de nuestro contenido editorial contemporáneo.
            </p>

            {/* Premium Upgrade Promotion Card */}
            <div className="rounded-[18px] bg-gradient-to-br from-amber-500/10 via-amber-50 to-white border-2 border-amber-300/80 p-6 text-left mb-8 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                <Crown className="w-4 h-4" />
                <span>Paso Recomendado: Suscripción Premium</span>
              </div>
              <h3 className="text-lg font-bold text-[#171920] mb-2">
                Desbloquea el archivo completo de Artículos Exclusivos
              </h3>
              <p className="text-xs text-[#4b546e] leading-relaxed mb-4">
                Elige un plan de suscripción Premium (desde $9.99/mes o $89.99/año) para leer reportajes fotográficos sin censura ni paywall, y acceder a la mensajería privada con nuestros autores. Garantía de reembolso del 100% durante 14 días.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenSubscriptions}
                  className="px-5 py-2.5 rounded-[10px] bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Ver Planes Premium y Activar</span>
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2.5 rounded-[10px] bg-white border border-[#dcdfe7] text-xs font-semibold text-[#171920] hover:bg-black/5 transition-colors cursor-pointer"
                >
                  Explorar Artículos Abiertos
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#f0f2f7] flex items-center justify-center gap-6 text-xs text-[#595F71]">
              <button
                type="button"
                onClick={onBack}
                className="hover:text-[#FF2C54] transition-colors cursor-pointer font-semibold"
              >
                Ir a Portada Principal
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM & BENEFITS */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Brand Manifesto & Reader Privileges */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-[20px] bg-[#171920] text-white p-7 sm:p-9 shadow-md relative overflow-hidden">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold uppercase tracking-wider mb-4">
                  <BookOpen className="w-3.5 h-3.5 text-[#FF2C54]" />
                  <span>Membresía para Lectores</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                  Crea tu Cuenta de Lector en Kayleen
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                  Únete a una comunidad internacional de entusiastas de la fotografía analógica y digital, diseño de interiores, viajes serenos y moda contemporánea.
                </p>

                <div className="space-y-4 pt-4 border-t border-white/10 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-[#FF2C54]/20 text-[#FF2C54] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="block text-white">Comentarios y Debate:</strong>
                      <span className="text-gray-400">Participa activamente en cada publicación con tu nombre y perfil verificado.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-[#5960FF]/20 text-[#5960FF] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="block text-white">Temas a tu Medida:</strong>
                      <span className="text-gray-400">Selecciona tus intereses editoriales para recibir recomendaciones personalizadas.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="block text-white">Boletín Semanal y Alertas Push:</strong>
                      <span className="text-gray-400">Recibe resúmenes de portada antes de su difusión abierta en redes sociales.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                      <Crown className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="block text-white">Acceso a Planes Premium:</strong>
                      <span className="text-gray-400">Desbloquea en cualquier momento reportajes a fondo y contacto directo con autores.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust & Guarantee Pill Card */}
              <div className="p-5 rounded-[16px] bg-white border border-[#dcdfe7] flex items-center gap-4 text-xs text-[#4b546e]">
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block text-[#171920]">Privacidad 100% Protegida:</strong>
                  <span>Tus datos personales nunca se venden ni se ceden a terceros. Cumplimos con el RGPD europeo.</span>
                </div>
              </div>
            </div>

            {/* Right Column: Reader Registration Form */}
            <div className="lg:col-span-7 bg-white border border-[#dcdfe7] rounded-[22px] p-7 sm:p-10 shadow-xs">
              <div className="mb-6">
                <span className="text-[11px] font-bold text-[#FF2C54] uppercase tracking-wider block mb-1">
                  Registro Rápido y Gratuito
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#171920]">
                  Completa tu perfil de Lector
                </h2>
                <p className="text-xs text-[#595F71] mt-1">
                  Solo toma 1 minuto. Puedes actualizar tus datos cuando lo desees.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-[12px] bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed flex items-start gap-2.5">
                  <span className="font-bold">⚠️</span>
                  <div>{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#171920] mb-1.5">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#595F71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Carmen Ortiz"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[10px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54] bg-[#fdfdfd]"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-[#171920] mb-1.5">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#595F71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="carmen.ortiz@correo.com"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[10px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54] bg-[#fdfdfd]"
                    />
                  </div>
                </div>

                {/* Password with visibility toggle */}
                <div>
                  <label className="block text-xs font-bold text-[#171920] mb-1.5">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#595F71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-10 py-2.5 text-sm rounded-[10px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54] bg-[#fdfdfd]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#595F71] hover:text-[#171920] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* City / Country */}
                <div>
                  <label className="block text-xs font-bold text-[#171920] mb-1.5">
                    Ciudad y País de Residencia (opcional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#595F71] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Madrid, España"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[10px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54] bg-[#fdfdfd]"
                    />
                  </div>
                </div>

                {/* Category Preferences (Multi-Select Chips) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-[#171920]">
                      ¿Qué temáticas editoriales te interesan más?
                    </label>
                    <span className="text-[11px] text-[#595F71]">
                      {selectedTopics.length} seleccionada(s)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTopics.map((topic) => {
                      const isSelected = selectedTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleTopic(topic)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#171920] text-white shadow-xs'
                              : 'bg-[#f7f8fc] text-[#4b546e] border border-[#dcdfe7] hover:border-[#171920]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-[#FF2C54]" />}
                          <span>{topic}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Checkboxes: Newsletter, Push and Legal Consent */}
                <div className="space-y-3 pt-3 border-t border-[#f0f2f7]">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={optInNewsletter}
                      onChange={(e) => setOptInNewsletter(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-[#FF2C54] focus:ring-[#FF2C54]"
                    />
                    <span className="text-xs text-[#4b546e] leading-relaxed">
                      Deseo recibir el <strong>boletín editorial semanal</strong> con la selección curada de artículos y ensayos de portada.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={optInPush}
                      onChange={(e) => setOptInPush(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-[#FF2C54] focus:ring-[#FF2C54]"
                    />
                    <span className="text-xs text-[#4b546e] leading-relaxed">
                      Activar <strong>notificaciones Push en mi navegador</strong> para avisos de nuevos artículos y reportajes especiales.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-[10px] bg-[#f7f8fc] border border-[#dcdfe7]">
                    <input
                      type="checkbox"
                      required
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-[#FF2C54] focus:ring-[#FF2C54]"
                    />
                    <span className="text-xs text-[#171920] leading-relaxed">
                      He leído y acepto expresamente las{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenLegal('privacy');
                        }}
                        className="text-[#FF2C54] underline font-semibold hover:text-[#5960FF]"
                      >
                        Políticas de Privacidad
                      </button>
                      , las{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenLegal('refund');
                        }}
                        className="text-[#FF2C54] underline font-semibold hover:text-[#5960FF]"
                      >
                        Políticas de Devolución
                      </button>{' '}
                      y los{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenLegal('terms');
                        }}
                        className="text-[#FF2C54] underline font-semibold hover:text-[#5960FF]"
                      >
                        Términos de Uso
                      </button>{' '}
                      de Kayleen Magazine. *
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-[12px] bg-[#FF2C54] hover:bg-[#e02247] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {isLoading ? 'Creando tu cuenta de lector...' : 'Crear mi Cuenta de Lector'}
                  </span>
                </button>

                <p className="text-center text-xs text-[#595F71] pt-2">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="font-bold text-[#FF2C54] hover:underline cursor-pointer"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
