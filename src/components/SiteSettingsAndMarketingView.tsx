import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Palette,
  LayoutTemplate,
  Mail,
  Megaphone,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Download,
  Send,
  Search,
  Eye,
  Sparkles,
  Users,
  BarChart3,
  Clock,
  FileText,
  Edit3,
  X,
  Globe,
  Code2,
  Bell,
  BellRing,
  BellOff,
} from 'lucide-react';
import {
  Article,
  INITIAL_SITE_CONFIG,
  MarketingCampaign,
  PushNotificationItem,
  SiteConfig,
  SubscriberItem,
} from '../data/akeaData';
import { EditorialVisual } from './EditorialVisual';
import {
  applyGlobalThemeCssVariables,
  formatRootCssVariablesSnippet,
} from '../utils/themeVariables';

interface SiteSettingsAndMarketingViewProps {
  activeSubMode: 'site_settings' | 'subscribers' | 'campaigns';
  initialSettingsSection?: 'identity' | 'colors' | 'footer' | 'seo' | 'legal';
  onSwitchSubMode: (mode: 'site_settings' | 'subscribers' | 'campaigns') => void;
  onOpenPublicLegalPage?: (section?: 'privacy' | 'refund' | 'terms' | 'cookies') => void;
  siteConfig: SiteConfig;
  subscribers: SubscriberItem[];
  campaigns: MarketingCampaign[];
  pushNotifications?: PushNotificationItem[];
  articles: Article[];
  onSaveSiteConfig: (config: Partial<SiteConfig>) => Promise<void>;
  onSaveSubscriber: (sub: Partial<SubscriberItem>) => Promise<void>;
  onUpdateSubscriber: (id: string, updates: Partial<SubscriberItem>) => Promise<void>;
  onDeleteSubscriber: (id: string) => Promise<void>;
  onSaveCampaign: (campaign: Partial<MarketingCampaign>) => Promise<void>;
  onSendCampaign: (campaignId: string) => Promise<void>;
  onDeleteCampaign: (campaignId: string) => Promise<void>;
  onSendPushNotification?: (payload: Partial<PushNotificationItem>) => Promise<void>;
  onDeletePushNotification?: (id: string) => Promise<void>;
}

const COLOR_THEME_PRESETS = [
  {
    name: 'Kayleen Home 03 (Original)',
    primaryAccentColor: '#FF2C54',
    secondaryAccentColor: '#5960FF',
    pageBackgroundColor: '#FFFFFF',
    surfaceBackgroundColor: '#f7f8fc',
    footerBackgroundColor: '#f7f8fc',
    logoDotColor: '#FF2C54',
  },
  {
    name: 'Sepia Editorial Cálido',
    primaryAccentColor: '#C84B31',
    secondaryAccentColor: '#2D4263',
    pageBackgroundColor: '#FDFBF7',
    surfaceBackgroundColor: '#F4EFE6',
    footerBackgroundColor: '#EFE8DC',
    logoDotColor: '#C84B31',
  },
  {
    name: 'Esmeralda & Estudio',
    primaryAccentColor: '#0D9488',
    secondaryAccentColor: '#4F46E5',
    pageBackgroundColor: '#FFFFFF',
    surfaceBackgroundColor: '#F0FDFA',
    footerBackgroundColor: '#F3F4F6',
    logoDotColor: '#0D9488',
  },
  {
    name: 'Índigo & Magenta Moderno',
    primaryAccentColor: '#6366F1',
    secondaryAccentColor: '#EC4899',
    pageBackgroundColor: '#F8FAFC',
    surfaceBackgroundColor: '#F1F5F9',
    footerBackgroundColor: '#F1F5F9',
    logoDotColor: '#6366F1',
  },
  {
    name: 'Monocromo Galería',
    primaryAccentColor: '#171920',
    secondaryAccentColor: '#FF2C54',
    pageBackgroundColor: '#FAFAFA',
    surfaceBackgroundColor: '#F4F4F5',
    footerBackgroundColor: '#F4F4F5',
    logoDotColor: '#FF2C54',
  },
  {
    name: 'Ámbar & Violeta Real',
    primaryAccentColor: '#D97706',
    secondaryAccentColor: '#7C3AED',
    pageBackgroundColor: '#FFFDF9',
    surfaceBackgroundColor: '#FEF3C7',
    footerBackgroundColor: '#F5F3FF',
    logoDotColor: '#D97706',
  },
];

const PRIMARY_ACCENT_SWATCHES = [
  '#FF2C54',
  '#E11D48',
  '#EA580C',
  '#C84B31',
  '#0D9488',
  '#2563EB',
  '#7C3AED',
  '#171920',
];

const SECONDARY_ACCENT_SWATCHES = [
  '#5960FF',
  '#4F46E5',
  '#0284C7',
  '#EC4899',
  '#10B981',
  '#D97706',
  '#9333EA',
  '#2D4263',
];

export const SiteSettingsAndMarketingView: React.FC<SiteSettingsAndMarketingViewProps> = ({
  activeSubMode,
  initialSettingsSection = 'identity',
  onSwitchSubMode,
  onOpenPublicLegalPage,
  siteConfig,
  subscribers,
  campaigns,
  pushNotifications = [],
  articles,
  onSaveSiteConfig,
  onSaveSubscriber,
  onUpdateSubscriber,
  onDeleteSubscriber,
  onSaveCampaign,
  onSendCampaign,
  onDeleteCampaign,
  onSendPushNotification,
  onDeletePushNotification,
}) => {
  // Local state for Site Config form
  const [configForm, setConfigForm] = useState<SiteConfig>({
    ...INITIAL_SITE_CONFIG,
    ...siteConfig,
  });
  const [settingsSection, setSettingsSection] = useState<
    'identity' | 'colors' | 'footer' | 'seo' | 'legal'
  >(initialSettingsSection);
  const [savedConfigNotice, setSavedConfigNotice] = useState(false);
  const [copiedCssVars, setCopiedCssVars] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSettingsSection(initialSettingsSection);
  }, [initialSettingsSection]);

  useEffect(() => {
    setConfigForm({
      ...INITIAL_SITE_CONFIG,
      ...siteConfig,
    });
  }, [siteConfig]);

  // Apply CSS variables (--color-primary, --color-secondary, etc.) to :root in real time
  useEffect(() => {
    applyGlobalThemeCssVariables(configForm);
  }, [
    configForm.primaryAccentColor,
    configForm.secondaryAccentColor,
    configForm.pageBackgroundColor,
    configForm.surfaceBackgroundColor,
    configForm.footerBackgroundColor,
    configForm.logoDotColor,
  ]);

  const handleRealtimeColorChange = (
    updates: Partial<SiteConfig>,
    persistImmediately = false
  ) => {
    const nextConfig: SiteConfig = {
      ...configForm,
      ...updates,
    };
    setConfigForm(nextConfig);
    applyGlobalThemeCssVariables(nextConfig);
    if (persistImmediately) {
      onSaveSiteConfig(nextConfig).then(() => {
        setSavedConfigNotice(true);
        setTimeout(() => setSavedConfigNotice(false), 2500);
      });
    }
  };

  // Sync section with activeSubMode
  const marketingSection = activeSubMode === 'campaigns' ? 'campaigns' : 'subscribers';

  // Subscribers state
  const [subSearch, setSubSearch] = useState('');
  const [subStatusFilter, setSubStatusFilter] = useState<'ALL' | 'active' | 'unsubscribed'>(
    'ALL'
  );
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubTag, setNewSubTag] = useState('VIP');
  const [newSubPushEnabled, setNewSubPushEnabled] = useState(true);

  // Manual Push Notification Composer State
  const [customPushTitle, setCustomPushTitle] = useState('');
  const [customPushBody, setCustomPushBody] = useState('');
  const [customPushArticleId, setCustomPushArticleId] = useState(articles[0]?.id || 'art-1');

  // Campaigns state
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<MarketingCampaign> | null>(
    null
  );

  // Handle Logo Image Upload from PC
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setConfigForm((prev) => ({
          ...prev,
          logoImageUrl: reader.result as string,
          useImageLogo: true,
        }));
      }
    };
    reader.readAsDataURL(file);
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  const handleSaveConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSiteConfig(configForm);
    setSavedConfigNotice(true);
    setTimeout(() => setSavedConfigNotice(false), 3000);
  };

  const handleResetDefaultConfig = async () => {
    setConfigForm({ ...INITIAL_SITE_CONFIG });
    await onSaveSiteConfig(INITIAL_SITE_CONFIG);
    setSavedConfigNotice(true);
    setTimeout(() => setSavedConfigNotice(false), 3000);
  };

  // Subscribers Filtering & Actions
  const activeSubsCount = subscribers.filter((s) => s.status === 'active').length;
  const pushSubsCount = subscribers.filter(
    (s) => s.status === 'active' && s.pushEnabled !== false
  ).length;
  const vipSubsCount = subscribers.filter(
    (s) => s.status === 'active' && s.tags?.includes('VIP')
  ).length;
  const unsubscribedCount = subscribers.filter((s) => s.status === 'unsubscribed').length;

  const filteredSubscribers = subscribers.filter((s) => {
    const matchesQuery =
      s.email.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.name.toLowerCase().includes(subSearch.toLowerCase()) ||
      (s.source || '').toLowerCase().includes(subSearch.toLowerCase());
    const matchesStatus = subStatusFilter === 'ALL' || s.status === subStatusFilter;
    return matchesQuery && matchesStatus;
  });

  const handleAddSubscriberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail.trim() || !newSubEmail.includes('@')) return;
    await onSaveSubscriber({
      email: newSubEmail.trim(),
      name: newSubName.trim() || newSubEmail.split('@')[0],
      status: 'active',
      source: 'Alta Manual en Dashboard',
      tags: [newSubTag, 'Semanal'],
      pushEnabled: newSubPushEnabled,
      pushDeviceLabel: newSubPushEnabled
        ? 'Navegador Web (Push Activo)'
        : 'Solo Email',
    });
    setNewSubEmail('');
    setNewSubName('');
  };

  const handleSendCustomPushSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSendPushNotification) return;
    const selectedArt = articles.find((a) => a.id === customPushArticleId);
    const resolvedTitle =
      customPushTitle.trim() ||
      (selectedArt
        ? `📰 Nuevo en ${selectedArt.category}: ${selectedArt.title}`
        : '🔔 Novedad Editorial en Kayleen Magazine');
    const resolvedBody =
      customPushBody.trim() ||
      selectedArt?.excerpt ||
      'Haz clic para leer la nueva publicación en nuestro blog.';

    await onSendPushNotification({
      type: 'custom_alert',
      title: resolvedTitle,
      body: resolvedBody,
      imageUrl: selectedArt?.customImageUrl,
      category: selectedArt?.category || 'Alerta Push',
      targetArticleId: selectedArt?.id,
      ctaText: 'Leer ahora',
      segment: 'active',
      recipientCount: Math.max(1, pushSubsCount),
    });
    setCustomPushTitle('');
    setCustomPushBody('');
  };

  const handleExportSubscribersCsv = () => {
    const headers = ['ID,Nombre,Email,Estado,Origen,Etiquetas,Fecha_Alta'];
    const rows = subscribers.map(
      (s) =>
        `"${s.id}","${s.name}","${s.email}","${s.status}","${s.source}","${(
          s.tags || []
        ).join('|')}","${s.joinedAt}"`
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suscriptores_newsletter_kayleen.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Campaign Modal Helpers
  const openNewCampaignModal = () => {
    setEditingCampaign({
      name: '',
      subject: '',
      segment: 'active',
      featuredArticleId: articles[0]?.id || 'art-1',
      customMessage:
        'Te compartimos las nuevas crónicas visuales, entrevistas y ensayos fotográficos publicados esta semana en nuestra revista.',
      ctaText: 'Leer Artículo Completo',
      ctaUrl: 'https://demo.rivaxstudio.com/kayleen/home-03/',
      status: 'draft',
      scheduledDate: new Date().toISOString().slice(0, 10),
    });
    setIsCampaignModalOpen(true);
  };

  const openEditCampaignModal = (cmp: MarketingCampaign) => {
    setEditingCampaign({ ...cmp });
    setIsCampaignModalOpen(true);
  };

  const handleCampaignFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign || !editingCampaign.name || !editingCampaign.subject) return;
    await onSaveCampaign(editingCampaign);
    setIsCampaignModalOpen(false);
    setEditingCampaign(null);
  };

  return (
    <div className="space-y-6">
      {/* Contextual Independent Section Header */}
      <div className="bg-white border border-[#dcdfe7] rounded-[12px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#171920]">
            {activeSubMode === 'site_settings' &&
              'Configuración General del Sitio (Logo, Colores, Fondo, Footer y SEO)'}
            {activeSubMode === 'subscribers' &&
              'Gestión de Suscriptores del Newsletter'}
            {activeSubMode === 'campaigns' &&
              'Gestión de Campañas de Marketing y Boletines Editoriales'}
          </h2>
          <p className="text-xs text-[#595F71] mt-0.5">
            {activeSubMode === 'site_settings' &&
              'Personaliza en tiempo real la identidad visual, logo, paleta de colores (tanto en el Home como en el Panel Admin), pie de página y metaetiquetas SEO.'}
            {activeSubMode === 'subscribers' &&
              'Administra de forma individual tu base de lectores suscritos al newsletter, filtra segmentos VIP, da de alta nuevos correos o exporta listas CSV.'}
            {activeSubMode === 'campaigns' &&
              'Diseña, programa y envía campañas de email marketing segmentadas con artículos incrustados y métricas de apertura en tiempo real.'}
          </p>
        </div>

        {activeSubMode === 'subscribers' && (
          <button
            type="button"
            onClick={handleExportSubscribersCsv}
            className="px-4 py-2 rounded-[8px] text-xs font-semibold text-[#171920] bg-[#f7f8fc] border border-[#dcdfe7] hover:border-[#171920] transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#5960FF]" />
            <span>Exportar Suscriptores CSV ({subscribers.length})</span>
          </button>
        )}

        {activeSubMode === 'campaigns' && (
          <button
            type="button"
            onClick={openNewCampaignModal}
            style={{ backgroundColor: siteConfig.primaryAccentColor || '#FF2C54' }}
            className="px-4 py-2 rounded-[8px] text-xs font-semibold text-white hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Nueva Campaña de Marketing</span>
          </button>
        )}
      </div>

      {/* =================================================================== */}
      {/* INDEPENDENT SECTION 1: CONFIGURACIÓN DEL SITIO                      */}
      {/* =================================================================== */}
      {activeSubMode === 'site_settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form (8 Cols) */}
          <form
            onSubmit={handleSaveConfigSubmit}
            className="lg:col-span-8 bg-white border border-[#dcdfe7] rounded-[12px] overflow-hidden"
          >
            {/* Sub-Navigation Tabs inside Site Settings */}
            <div className="px-6 pt-4 border-b border-[#dcdfe7] bg-[#f7f8fc] flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSettingsSection('identity')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-[8px] border-t border-x transition-colors inline-flex items-center gap-2 cursor-pointer ${
                  settingsSection === 'identity'
                    ? 'bg-white text-[#171920] border-[#dcdfe7] -mb-px'
                    : 'bg-transparent text-[#595F71] border-transparent hover:text-[#171920]'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-[#FF2C54]" />
                <span>1. Logo, Identidad y Parámetros</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsSection('colors')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-[8px] border-t border-x transition-colors inline-flex items-center gap-2 cursor-pointer ${
                  settingsSection === 'colors'
                    ? 'bg-white text-[#171920] border-[#dcdfe7] -mb-px'
                    : 'bg-transparent text-[#595F71] border-transparent hover:text-[#171920]'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-[#5960FF]" />
                <span>2. Paleta de Colores Global (CSS Variables)</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsSection('footer')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-[8px] border-t border-x transition-colors inline-flex items-center gap-2 cursor-pointer ${
                  settingsSection === 'footer'
                    ? 'bg-white text-[#171920] border-[#dcdfe7] -mb-px'
                    : 'bg-transparent text-[#595F71] border-transparent hover:text-[#171920]'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>3. Información del Footer &amp; Newsletter</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsSection('seo')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-[8px] border-t border-x transition-colors inline-flex items-center gap-2 cursor-pointer ${
                  settingsSection === 'seo'
                    ? 'bg-white text-[#171920] border-[#dcdfe7] -mb-px'
                    : 'bg-transparent text-[#595F71] border-transparent hover:text-[#171920]'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#FF2C54]" />
                <span>4. SEO &amp; Metaetiquetas (&lt;head&gt;)</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsSection('legal')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-[8px] border-t border-x transition-colors inline-flex items-center gap-2 cursor-pointer ${
                  settingsSection === 'legal'
                    ? 'bg-white text-[#171920] border-[#dcdfe7] -mb-px'
                    : 'bg-transparent text-[#595F71] border-transparent hover:text-[#171920]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#D97706]" />
                <span>5. Páginas Legales (Derechos, Devoluciones, Privacidad)</span>
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* SECTION 1: LOGO, IDENTITY & PARAMETERS */}
              {settingsSection === 'identity' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#171920] mb-1">
                      Configuración del Logo de Cabecera y Pie de Página
                    </h3>
                    <p className="text-xs text-[#595F71] mb-4">
                      Puedes usar el logotipo tipográfico editable o subir tu propio logo en imagen desde tu PC (PNG, SVG, WEBP, JPG).
                    </p>

                    <div className="p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7] space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#171920] cursor-pointer">
                          <input
                            type="radio"
                            checked={!configForm.useImageLogo}
                            onChange={() =>
                              setConfigForm({ ...configForm, useImageLogo: false })
                            }
                            className="accent-[#FF2C54]"
                          />
                          <span>Usar Logo de Texto (Estilo Kayleen.)</span>
                        </label>

                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#171920] cursor-pointer">
                          <input
                            type="radio"
                            checked={Boolean(configForm.useImageLogo)}
                            onChange={() =>
                              setConfigForm({ ...configForm, useImageLogo: true })
                            }
                            className="accent-[#FF2C54]"
                          />
                          <span>Usar Logo en Imagen (Subido desde PC o URL)</span>
                        </label>
                      </div>

                      {!configForm.useImageLogo ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#171920] mb-1">
                              Texto del Logo *
                            </label>
                            <input
                              type="text"
                              value={configForm.logoText}
                              onChange={(e) =>
                                setConfigForm({ ...configForm, logoText: e.target.value })
                              }
                              placeholder="Kayleen"
                              className="w-full px-3.5 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#171920] mb-1">
                              Color del Punto del Logo
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={configForm.logoDotColor || '#FF2C54'}
                                onChange={(e) =>
                                  setConfigForm({
                                    ...configForm,
                                    logoDotColor: e.target.value,
                                  })
                                }
                                className="w-9 h-9 rounded cursor-pointer border border-[#dcdfe7]"
                              />
                              <input
                                type="text"
                                value={configForm.logoDotColor || '#FF2C54'}
                                onChange={(e) =>
                                  setConfigForm({
                                    ...configForm,
                                    logoDotColor: e.target.value,
                                  })
                                }
                                className="flex-1 px-3 py-2 text-xs font-mono bg-white rounded-[8px] border border-[#dcdfe7]"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <input
                              ref={logoFileInputRef}
                              type="file"
                              accept=".png,.svg,.webp,.jpg,.jpeg,.gif,image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => logoFileInputRef.current?.click()}
                              className="px-3.5 py-2 rounded-[8px] text-xs font-semibold text-white bg-[#FF2C54] hover:bg-[#171920] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Subir Imagen de Logo desde mi PC</span>
                            </button>

                            {configForm.logoImageUrl && (
                              <div className="px-4 py-2 bg-white rounded-[8px] border border-[#dcdfe7] flex items-center gap-3">
                                <img
                                  src={configForm.logoImageUrl}
                                  alt="Logo Preview"
                                  className="h-8 w-auto object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfigForm({
                                      ...configForm,
                                      logoImageUrl: '',
                                      useImageLogo: false,
                                    })
                                  }
                                  className="text-xs text-[#DC2626] hover:underline cursor-pointer"
                                >
                                  Quitar
                                </button>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#171920] mb-1">
                              O pega el enlace directo de tu Logo (URL)
                            </label>
                            <input
                              type="text"
                              value={configForm.logoImageUrl || ''}
                              onChange={(e) =>
                                setConfigForm({
                                  ...configForm,
                                  logoImageUrl: e.target.value,
                                  useImageLogo: true,
                                })
                              }
                              placeholder="https://.../mi-logo.png"
                              className="w-full px-3.5 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Site Parameters */}
                  <div className="pt-4 border-t border-[#dcdfe7] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#171920] mb-1">
                        Título General del Sitio (Meta / Cabecera)
                      </label>
                      <input
                        type="text"
                        value={configForm.siteTitle}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, siteTitle: e.target.value })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#171920] mb-1">
                        Artículos por Página en Home 03
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={20}
                        value={configForm.postsPerPage || 6}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            postsPerPage: Math.max(2, Number(e.target.value) || 6),
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs font-mono rounded-[8px] border border-[#dcdfe7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#171920] mb-1">
                        Título de Sección Destacada (Editor&apos;s Pick)
                      </label>
                      <input
                        type="text"
                        value={configForm.editorsPickTitle}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            editorsPickTitle: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#171920] mb-1">
                        Subtítulo de Sección Destacada
                      </label>
                      <input
                        type="text"
                        value={configForm.editorsPickSubtitle}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            editorsPickSubtitle: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                      />
                    </div>
                  </div>

                  {/* Top Promotional Marketing Banner */}
                  <div className="pt-4 border-t border-[#dcdfe7] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#171920]">
                          Barra Superior de Anuncio / Campaña Activa
                        </h4>
                        <p className="text-[11px] text-[#595F71]">
                          Muestra una cintilla superior en el blog para anunciar ediciones especiales o campañas de suscripción.
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#171920] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(configForm.promoBannerEnabled)}
                          onChange={(e) =>
                            setConfigForm({
                              ...configForm,
                              promoBannerEnabled: e.target.checked,
                            })
                          }
                          className="accent-[#FF2C54]"
                        />
                        <span>Activar Barra Promocional</span>
                      </label>
                    </div>

                    {configForm.promoBannerEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#f7f8fc] rounded-[10px] border border-[#dcdfe7]">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                            Mensaje del Banner
                          </label>
                          <input
                            type="text"
                            value={configForm.promoBannerText}
                            onChange={(e) =>
                              setConfigForm({
                                ...configForm,
                                promoBannerText: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1.5 text-xs bg-white rounded-[6px] border border-[#dcdfe7]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                            Texto del Botón
                          </label>
                          <input
                            type="text"
                            value={configForm.promoBannerCta}
                            onChange={(e) =>
                              setConfigForm({
                                ...configForm,
                                promoBannerCta: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1.5 text-xs bg-white rounded-[6px] border border-[#dcdfe7]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 2: GLOBAL COLOR PALETTE EDITOR (REAL-TIME CSS VARIABLES) */}
              {settingsSection === 'colors' && (
                <div className="space-y-6">
                  {/* Top Real-Time CSS Variables Status Bar & Quick Actions */}
                  <div className="p-4 rounded-[12px] bg-[#171920] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Motor CSS Variables en Tiempo Real
                        </span>
                        <span className="text-[11px] font-mono text-white/70">
                          :root &#123; --color-primary · --color-secondary &#125;
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">
                        Editor Global de Paleta de Colores (Primary &amp; Secondary Accents)
                      </h3>
                      <p className="text-xs text-white/75">
                        Cualquier cambio en los selectores actualiza instantáneamente las variables CSS globales del DOM (<code className="font-mono text-emerald-300">--color-primary</code> y <code className="font-mono text-emerald-300">--color-secondary</code>) en todo el sitio y panel administrativo.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleRealtimeColorChange(
                            {
                              primaryAccentColor: configForm.secondaryAccentColor,
                              secondaryAccentColor: configForm.primaryAccentColor,
                              logoDotColor: configForm.secondaryAccentColor,
                            },
                            true
                          )
                        }
                        className="px-3 py-2 rounded-[8px] text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        title="Intercambiar los colores Primary y Secondary en tiempo real"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Invertir Primary ↔ Secondary</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleRealtimeColorChange(
                            {
                              primaryAccentColor: INITIAL_SITE_CONFIG.primaryAccentColor,
                              secondaryAccentColor: INITIAL_SITE_CONFIG.secondaryAccentColor,
                              pageBackgroundColor: INITIAL_SITE_CONFIG.pageBackgroundColor,
                              surfaceBackgroundColor: INITIAL_SITE_CONFIG.surfaceBackgroundColor,
                              footerBackgroundColor: INITIAL_SITE_CONFIG.footerBackgroundColor,
                              logoDotColor: INITIAL_SITE_CONFIG.logoDotColor,
                            },
                            true
                          )
                        }
                        className="px-3 py-2 rounded-[8px] text-xs font-semibold bg-white/10 hover:bg-white/20 text-white/90 border border-white/15 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Paleta</span>
                      </button>
                    </div>
                  </div>

                  {/* Curated 1-Click Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#171920]">
                          1. Paletas Editoriales Predefinidas (Aplicación Instantánea en 1 Clic)
                        </h3>
                        <p className="text-xs text-[#595F71]">
                          Selecciona un tema para inyectar y guardar sus variables CSS en tiempo real.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {COLOR_THEME_PRESETS.map((preset) => {
                        const isActivePreset =
                          configForm.primaryAccentColor.toLowerCase() ===
                            preset.primaryAccentColor.toLowerCase() &&
                          configForm.secondaryAccentColor.toLowerCase() ===
                            preset.secondaryAccentColor.toLowerCase();
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() =>
                              handleRealtimeColorChange(
                                {
                                  primaryAccentColor: preset.primaryAccentColor,
                                  secondaryAccentColor: preset.secondaryAccentColor,
                                  pageBackgroundColor: preset.pageBackgroundColor,
                                  surfaceBackgroundColor: preset.surfaceBackgroundColor,
                                  footerBackgroundColor: preset.footerBackgroundColor,
                                  logoDotColor: preset.logoDotColor,
                                },
                                true
                              )
                            }
                            className={`p-3.5 rounded-[10px] border transition-all text-left cursor-pointer ${
                              isActivePreset
                                ? 'border-[#171920] bg-white shadow-sm ring-2 ring-[#171920]/10'
                                : 'border-[#dcdfe7] bg-[#f7f8fc] hover:border-[#171920]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-5 h-5 rounded-full border border-black/15 shadow-2xs"
                                  style={{ backgroundColor: preset.primaryAccentColor }}
                                  title={`Primary: ${preset.primaryAccentColor}`}
                                />
                                <span
                                  className="w-5 h-5 rounded-full border border-black/15 shadow-2xs"
                                  style={{ backgroundColor: preset.secondaryAccentColor }}
                                  title={`Secondary: ${preset.secondaryAccentColor}`}
                                />
                                <span
                                  className="w-4 h-4 rounded-full border border-black/20"
                                  style={{ backgroundColor: preset.pageBackgroundColor }}
                                  title={`Fondo: ${preset.pageBackgroundColor}`}
                                />
                                <span
                                  className="w-4 h-4 rounded-full border border-black/20"
                                  style={{ backgroundColor: preset.surfaceBackgroundColor }}
                                  title={`Superficie: ${preset.surfaceBackgroundColor}`}
                                />
                              </div>
                              {isActivePreset && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  Activa
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-bold text-[#171920]">
                              {preset.name}
                            </div>
                            <div className="text-[10px] font-mono text-[#595F71] mt-0.5">
                              {preset.primaryAccentColor} · {preset.secondaryAccentColor}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary & Secondary Dynamic Accent Pickers */}
                  <div className="pt-4 border-t border-[#dcdfe7]">
                    <h3 className="text-sm font-bold text-[#171920] mb-3">
                      2. Colores de Acento Dinámicos (Primary &amp; Secondary CSS Variables)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* PRIMARY ACCENT CARD */}
                      <div className="p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#171920]">
                            Color de Acento Principal (Primary)
                          </span>
                          <code className="px-2 py-0.5 rounded bg-white border border-[#dcdfe7] text-[10px] font-mono text-[#171920]">
                            --color-primary
                          </code>
                        </div>
                        <p className="text-[11px] text-[#595F71]">
                          Controla botones principales, etiquetas de categoría, divisores editoriales Kayleen, subrayados activos y llamadas a la acción.
                        </p>

                        <div className="flex items-center gap-2.5">
                          <input
                            type="color"
                            value={configForm.primaryAccentColor}
                            onChange={(e) =>
                              handleRealtimeColorChange({
                                primaryAccentColor: e.target.value,
                                logoDotColor: e.target.value,
                              })
                            }
                            className="w-12 h-10 rounded-[8px] cursor-pointer border border-[#dcdfe7] bg-white p-0.5"
                          />
                          <input
                            type="text"
                            value={configForm.primaryAccentColor}
                            onChange={(e) =>
                              handleRealtimeColorChange({
                                primaryAccentColor: e.target.value,
                              })
                            }
                            placeholder="#FF2C54"
                            className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-white rounded-[8px] border border-[#dcdfe7]"
                          />
                          <span
                            className="px-3 py-2 rounded-[8px] text-[11px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: configForm.primaryAccentColor }}
                          >
                            Primary
                          </span>
                        </div>

                        {/* Quick Swatches for Primary */}
                        <div>
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#595F71] mb-1.5">
                            Muestras Rápidas Primary:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {PRIMARY_ACCENT_SWATCHES.map((hex) => (
                              <button
                                key={hex}
                                type="button"
                                onClick={() =>
                                  handleRealtimeColorChange(
                                    {
                                      primaryAccentColor: hex,
                                      logoDotColor: hex,
                                    },
                                    true
                                  )
                                }
                                className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                                  configForm.primaryAccentColor.toLowerCase() ===
                                  hex.toLowerCase()
                                    ? 'ring-2 ring-offset-1 ring-[#171920] border-white scale-110'
                                    : 'border-black/15'
                                }`}
                                style={{ backgroundColor: hex }}
                                title={`Aplicar Primary ${hex}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* SECONDARY ACCENT CARD */}
                      <div className="p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#171920]">
                            Color de Acento Secundario (Secondary)
                          </span>
                          <code className="px-2 py-0.5 rounded bg-white border border-[#dcdfe7] text-[10px] font-mono text-[#171920]">
                            --color-secondary
                          </code>
                        </div>
                        <p className="text-[11px] text-[#595F71]">
                          Controla insignias secundarias, enlaces interactivos, paginación activa, filtros de búsqueda y acentos del panel.
                        </p>

                        <div className="flex items-center gap-2.5">
                          <input
                            type="color"
                            value={configForm.secondaryAccentColor}
                            onChange={(e) =>
                              handleRealtimeColorChange({
                                secondaryAccentColor: e.target.value,
                              })
                            }
                            className="w-12 h-10 rounded-[8px] cursor-pointer border border-[#dcdfe7] bg-white p-0.5"
                          />
                          <input
                            type="text"
                            value={configForm.secondaryAccentColor}
                            onChange={(e) =>
                              handleRealtimeColorChange({
                                secondaryAccentColor: e.target.value,
                              })
                            }
                            placeholder="#5960FF"
                            className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-white rounded-[8px] border border-[#dcdfe7]"
                          />
                          <span
                            className="px-3 py-2 rounded-[8px] text-[11px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: configForm.secondaryAccentColor }}
                          >
                            Secondary
                          </span>
                        </div>

                        {/* Quick Swatches for Secondary */}
                        <div>
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#595F71] mb-1.5">
                            Muestras Rápidas Secondary:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {SECONDARY_ACCENT_SWATCHES.map((hex) => (
                              <button
                                key={hex}
                                type="button"
                                onClick={() =>
                                  handleRealtimeColorChange(
                                    {
                                      secondaryAccentColor: hex,
                                    },
                                    true
                                  )
                                }
                                className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                                  configForm.secondaryAccentColor.toLowerCase() ===
                                  hex.toLowerCase()
                                    ? 'ring-2 ring-offset-1 ring-[#171920] border-white scale-110'
                                    : 'border-black/15'
                                }`}
                                style={{ backgroundColor: hex }}
                                title={`Aplicar Secondary ${hex}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Background & Surface Variables */}
                  <div className="pt-4 border-t border-[#dcdfe7]">
                    <h3 className="text-sm font-bold text-[#171920] mb-3">
                      3. Colores de Superficie, Fondo y Punto del Logo
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Fondo General (<code className="font-mono text-[10px]">--color-page-bg</code>)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={configForm.pageBackgroundColor}
                            onChange={(e) =>
                              handleRealtimeColorChange({
                                pageBackgroundColor: e.target.value,
                              })
                            }
                            className="w-10 h-9 rounded cursor-pointer border border-[#dcdfe7]"
                          />
                          <input
                            type="text"
                            value={configForm.pageBackgroundColor}
                            onChange={(e) =>
                              handleRealtimeColorChange({
                                pageBackgroundColor: e.target.value,
                              })
                            }
                            className="flex-1 px-2.5 py-2 text-xs font-mono rounded-[8px] border border-[#dcdfe7]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Superficies (<code className="font-mono text-[10px]">--color-surface-bg</code>)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={configForm.surfaceBackgroundColor}
                            onChange={(e) =>
                              handleRealtimeColorChange({
                                surfaceBackgroundColor: e.target.value,
                              })
                            }
                            className="w-10 h-9 rounded cursor-pointer border border-[#dcdfe7]"
                          />
                          <input
                            type="text"
                            value={configForm.surfaceBackgroundColor}
                            onChange={(e) =>
                              handleRealtimeColorChange({
                                surfaceBackgroundColor: e.target.value,
                              })
                            }
                            className="flex-1 px-2.5 py-2 text-xs font-mono rounded-[8px] border border-[#dcdfe7]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Pie de Página (<code className="font-mono text-[10px]">--color-footer-bg</code>)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={configForm.footerBackgroundColor}
                            onChange={(e) =>
                              handleRealtimeColorChange({
                                footerBackgroundColor: e.target.value,
                              })
                            }
                            className="w-10 h-9 rounded cursor-pointer border border-[#dcdfe7]"
                          />
                          <input
                            type="text"
                            value={configForm.footerBackgroundColor}
                            onChange={(e) =>
                              handleRealtimeColorChange({
                                footerBackgroundColor: e.target.value,
                              })
                            }
                            className="flex-1 px-2.5 py-2 text-xs font-mono rounded-[8px] border border-[#dcdfe7]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Punto del Logo (<code className="font-mono text-[10px]">--color-logo-dot</code>)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={configForm.logoDotColor || configForm.primaryAccentColor}
                            onChange={(e) =>
                              handleRealtimeColorChange({
                                logoDotColor: e.target.value,
                              })
                            }
                            className="w-10 h-9 rounded cursor-pointer border border-[#dcdfe7]"
                          />
                          <input
                            type="text"
                            value={configForm.logoDotColor || configForm.primaryAccentColor}
                            onChange={(e) =>
                              handleRealtimeColorChange({
                                logoDotColor: e.target.value,
                              })
                            }
                            className="flex-1 px-2.5 py-2 text-xs font-mono rounded-[8px] border border-[#dcdfe7]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Real-Time UI Components Sandbox & Live :root CSS Variables Inspector */}
                  <div className="pt-4 border-t border-[#dcdfe7] grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Live Components Sandbox */}
                    <div className="lg:col-span-7 p-4 rounded-[12px] border border-[#dcdfe7] bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#171920]">
                          Laboratorio de Componentes en Tiempo Real (Usando <code className="font-mono">var(--color-primary)</code> y <code className="font-mono">var(--color-secondary)</code>)
                        </span>
                      </div>

                      <div className="p-3.5 rounded-[10px] border border-[#dcdfe7] space-y-3" style={{ backgroundColor: 'var(--color-surface-bg)' }}>
                        {/* Kayleen Divider Heading */}
                        <div className="rivax-divider-heading">
                          <span className="divider-1" />
                          <span className="divider-2" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#171920]">
                            Divisor Editorial Kayleen
                          </h4>
                          <span className="divider-3" />
                        </div>

                        {/* Interactive Buttons & Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1.5 rounded-[8px] text-xs font-bold text-white bg-[#FF2C54]">
                            Botón Primary (--color-primary)
                          </span>
                          <span className="px-3 py-1.5 rounded-[8px] text-xs font-bold text-white bg-[#5960FF]">
                            Botón Secondary (--color-secondary)
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FF2C54]/10 text-[#FF2C54] border border-[#FF2C54]/20">
                            #Categoría Activa
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#5960FF]/10 text-[#5960FF] border border-[#5960FF]/20">
                            Badge Editorial
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live :root CSS Code Inspector */}
                    <div className="lg:col-span-5 p-4 rounded-[12px] bg-[#171920] text-white flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5" />
                          <span>Variables CSS Inyectadas en :root</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const snippet = formatRootCssVariablesSnippet(configForm);
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                              navigator.clipboard.writeText(snippet).catch(() => {});
                            }
                            setCopiedCssVars(true);
                            setTimeout(() => setCopiedCssVars(false), 2000);
                          }}
                          className="px-2 py-1 rounded text-[10px] font-semibold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                        >
                          {copiedCssVars ? '¡Copiado!' : 'Copiar CSS'}
                        </button>
                      </div>
                      <pre className="text-[11px] font-mono text-white/90 bg-black/40 p-3 rounded-[8px] overflow-x-auto leading-relaxed">
                        {formatRootCssVariablesSnippet(configForm)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: FOOTER & NEWSLETTER BOX INFO */}
              {settingsSection === 'footer' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#171920] mb-1">
                      Descripción Institucional del Footer
                    </label>
                    <textarea
                      rows={3}
                      value={configForm.footerDescription}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          footerDescription: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7] leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#171920] mb-1">
                        Texto de Copyright
                      </label>
                      <input
                        type="text"
                        value={configForm.footerCopyright}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            footerCopyright: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#171920] mb-1">
                        Correo Electrónico de Contacto en Footer
                      </label>
                      <input
                        type="email"
                        value={configForm.contactEmail}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            contactEmail: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#dcdfe7] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#171920]">
                        Caja de Suscripción al Newsletter en el Footer
                      </h4>
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#171920] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(configForm.showNewsletterBox)}
                          onChange={(e) =>
                            setConfigForm({
                              ...configForm,
                              showNewsletterBox: e.target.checked,
                            })
                          }
                          className="accent-[#FF2C54]"
                        />
                        <span>Mostrar Caja de Suscripción</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Título de la Caja de Newsletter
                        </label>
                        <input
                          type="text"
                          value={configForm.newsletterHeading}
                          onChange={(e) =>
                            setConfigForm({
                              ...configForm,
                              newsletterHeading: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Placeholder del Campo de Email
                        </label>
                        <input
                          type="text"
                          value={configForm.newsletterPlaceholder}
                          onChange={(e) =>
                            setConfigForm({
                              ...configForm,
                              newsletterPlaceholder: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Texto del Botón
                        </label>
                        <input
                          type="text"
                          value={configForm.newsletterButtonText}
                          onChange={(e) =>
                            setConfigForm({
                              ...configForm,
                              newsletterButtonText: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: SEO & META TAGS (<head> DYNAMIC INJECTION) */}
              {settingsSection === 'seo' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#171920] mb-1">
                      Gestión de Metaetiquetas Globales e Inyección Dinámica en &lt;head&gt;
                    </h3>
                    <p className="text-xs text-[#595F71]">
                      Configura el título SEO, la descripción meta y las palabras clave globales que se inyectan automáticamente en el documento{' '}
                      <code className="font-mono text-[#FF2C54]">&lt;head&gt;</code> (incluyendo OpenGraph, Twitter Cards y Schema.org JSON-LD) para optimizar el posicionamiento en motores de búsqueda.
                    </p>
                  </div>

                  {/* 1. Meta Title */}
                  <div className="p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7] space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold text-[#171920]">
                        Meta Title (&lt;title&gt; y og:title) *
                      </label>
                      {(() => {
                        const len = (configForm.metaTitle || '').length;
                        const isOptimal = len >= 30 && len <= 65;
                        return (
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                              isOptimal
                                ? 'bg-[#DCFCE7] text-[#15803D] font-semibold'
                                : 'bg-[#FEF3C7] text-[#B45309]'
                            }`}
                          >
                            {len} caracteres (Óptimo: 30–60)
                          </span>
                        );
                      })()}
                    </div>
                    <input
                      type="text"
                      value={configForm.metaTitle || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          metaTitle: e.target.value,
                          siteTitle: e.target.value,
                        })
                      }
                      placeholder="Ej. Kayleen Home 03 – Revista Editorial de Fotografía, Moda y Cultura"
                      className="w-full px-3.5 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                    />
                    <p className="text-[11px] text-[#595F71]">
                      Se aplica inmediatamente a <code className="font-mono">document.title</code>,{' '}
                      <code className="font-mono">meta[property=&quot;og:title&quot;]</code> y{' '}
                      <code className="font-mono">meta[name=&quot;twitter:title&quot;]</code>.
                    </p>
                  </div>

                  {/* 2. Meta Description */}
                  <div className="p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7] space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold text-[#171920]">
                        Meta Description (&lt;meta name=&quot;description&quot;&gt;) *
                      </label>
                      {(() => {
                        const len = (configForm.metaDescription || '').length;
                        const isOptimal = len >= 110 && len <= 165;
                        return (
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                              isOptimal
                                ? 'bg-[#DCFCE7] text-[#15803D] font-semibold'
                                : 'bg-[#FEF3C7] text-[#B45309]'
                            }`}
                          >
                            {len} caracteres (Óptimo: 120–160)
                          </span>
                        );
                      })()}
                    </div>
                    <textarea
                      rows={3}
                      value={configForm.metaDescription || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          metaDescription: e.target.value,
                        })
                      }
                      placeholder="Resumen atractivo de 1 a 2 frases con la propuesta de valor editorial de tu blog..."
                      className="w-full px-3.5 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7] leading-relaxed focus:outline-none focus:border-[#FF2C54]"
                    />
                    <p className="text-[11px] text-[#595F71]">
                      Se inyecta en <code className="font-mono">meta[name=&quot;description&quot;]</code>,{' '}
                      <code className="font-mono">meta[property=&quot;og:description&quot;]</code> y Schema.org JSON-LD.
                    </p>
                  </div>

                  {/* 3. Meta Keywords */}
                  <div className="p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold text-[#171920]">
                        Keywords / Palabras Clave (&lt;meta name=&quot;keywords&quot;&gt;)
                      </label>
                      <span className="text-[11px] font-mono text-[#595F71]">
                        {(configForm.metaKeywords || '')
                          .split(',')
                          .map((k) => k.trim())
                          .filter(Boolean).length}{' '}
                        palabras clave activas
                      </span>
                    </div>

                    <input
                      type="text"
                      value={configForm.metaKeywords || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          metaKeywords: e.target.value,
                        })
                      }
                      placeholder="Separa las palabras clave con comas: blog editorial, fotografía, moda, tecnología..."
                      className="w-full px-3.5 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#5960FF]"
                    />

                    {/* Active Keyword Chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(configForm.metaKeywords || '')
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean)
                        .map((kw, idx) => (
                          <span
                            key={`${kw}-${idx}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-semibold bg-white border border-[#dcdfe7] text-[#171920]"
                          >
                            <span>{kw}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (configForm.metaKeywords || '')
                                  .split(',')
                                  .map((item) => item.trim())
                                  .filter((item, i) => Boolean(item) && i !== idx)
                                  .join(', ');
                                setConfigForm({ ...configForm, metaKeywords: updated });
                              }}
                              className="text-[#9497AE] hover:text-[#DC2626] cursor-pointer"
                              title="Quitar palabra clave"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>

                    {/* Quick 1-click SEO Keyword Suggestions */}
                    <div className="pt-2 border-t border-[#dcdfe7] flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-[#595F71] mr-1">
                        Sugerencias rápidas (+):
                      </span>
                      {[
                        'periodismo visual',
                        'arquitectura contemporánea',
                        'cultura digital',
                        'crónicas de viaje',
                        'tendencias pasarela',
                        'ensayo fotográfico',
                      ].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            const currentList = (configForm.metaKeywords || '')
                              .split(',')
                              .map((k) => k.trim())
                              .filter(Boolean);
                            if (!currentList.includes(sug)) {
                              setConfigForm({
                                ...configForm,
                                metaKeywords: [...currentList, sug].join(', '),
                              });
                            }
                          }}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-[#dcdfe7] text-[#5960FF] hover:border-[#5960FF] cursor-pointer"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Additional SEO Parameters: Author, OpenGraph Image & Robots */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#171920] mb-1">
                        Meta Author (&lt;meta name=&quot;author&quot;&gt;)
                      </label>
                      <input
                        type="text"
                        value={configForm.metaAuthor || ''}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, metaAuthor: e.target.value })
                        }
                        placeholder="Kayleen Editorial Studio"
                        className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#171920] mb-1">
                        Imagen OpenGraph Social (og:image URL)
                      </label>
                      <input
                        type="text"
                        value={configForm.ogImage || ''}
                        onChange={(e) =>
                          setConfigForm({ ...configForm, ogImage: e.target.value })
                        }
                        placeholder="/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg"
                        className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-[#f7f8fc] border border-[#dcdfe7] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#171920] block">
                        Indexación en Motores de Búsqueda (Robots Meta Tag)
                      </span>
                      <span className="text-[11px] text-[#595F71]">
                        Define si Google y otros buscadores deben indexar y seguir los enlaces del blog (
                        <code className="font-mono">
                          {configForm.robotsIndex !== false
                            ? 'index, follow'
                            : 'noindex, nofollow'}
                        </code>
                        ).
                      </span>
                    </div>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#171920] cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={configForm.robotsIndex !== false}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            robotsIndex: e.target.checked,
                          })
                        }
                        className="accent-[#16A34A]"
                      />
                      <span>Permitir Indexación (index, follow)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* SECTION 5: LEGAL PAGES (COPYRIGHT, REFUND POLICY, PRIVACY, TERMS) */}
              {settingsSection === 'legal' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#171920] mb-1">
                        Editor de Páginas de Políticas Legales, Privacidad y Devolución
                      </h3>
                      <p className="text-xs text-[#595F71]">
                        Edita el título y contenido completo de las 4 páginas legales públicas accesibles desde el pie de página y el modal de suscripción Premium. Separa cada párrafo con un salto de línea doble.
                      </p>
                    </div>
                    {onOpenPublicLegalPage && (
                      <button
                        type="button"
                        onClick={() => onOpenPublicLegalPage('privacy')}
                        className="px-3.5 py-2 rounded-[8px] bg-[#171920] hover:bg-[#FF2C54] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Páginas Legales Públicas</span>
                      </button>
                    )}
                  </div>

                  {/* 1. Políticas de Privacidad */}
                  <div className="p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-[#171920]">
                        1. Políticas de Privacidad y Protección de Datos Personales (RGPD)
                      </label>
                      {onOpenPublicLegalPage && (
                        <button
                          type="button"
                          onClick={() => onOpenPublicLegalPage('privacy')}
                          className="text-[11px] font-bold text-[#FF2C54] hover:underline cursor-pointer"
                        >
                          Ver en vivo →
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={configForm.privacyPolicyTitle || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          privacyPolicyTitle: e.target.value,
                        })
                      }
                      placeholder="Título de Políticas de Privacidad"
                      className="w-full px-3.5 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                    />
                    <textarea
                      rows={6}
                      value={configForm.privacyPolicyContent || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          privacyPolicyContent: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7] leading-relaxed"
                    />
                  </div>

                  {/* 2. Políticas de Devoluciones y Reembolsos */}
                  <div className="p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-[#171920]">
                        2. Políticas de Devoluciones, Cancelaciones y Reembolsos (Garantía 14 Días)
                      </label>
                      {onOpenPublicLegalPage && (
                        <button
                          type="button"
                          onClick={() => onOpenPublicLegalPage('refund')}
                          className="text-[11px] font-bold text-[#5960FF] hover:underline cursor-pointer"
                        >
                          Ver en vivo →
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={configForm.refundPolicyTitle || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          refundPolicyTitle: e.target.value,
                        })
                      }
                      placeholder="Título de Políticas de Devoluciones"
                      className="w-full px-3.5 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                    />
                    <textarea
                      rows={6}
                      value={configForm.refundPolicyContent || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          refundPolicyContent: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7] leading-relaxed"
                    />
                  </div>

                  {/* 3. Términos y Condiciones */}
                  <div className="p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-[#171920]">
                        3. Términos y Condiciones de Uso y Suscripción Premium
                      </label>
                      {onOpenPublicLegalPage && (
                        <button
                          type="button"
                          onClick={() => onOpenPublicLegalPage('terms')}
                          className="text-[11px] font-bold text-[#0EA5E9] hover:underline cursor-pointer"
                        >
                          Ver en vivo →
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={configForm.termsPageTitle || configForm.termsTitle || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          termsPageTitle: e.target.value,
                          termsTitle: e.target.value,
                        })
                      }
                      placeholder="Título de Términos y Condiciones"
                      className="w-full px-3.5 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                    />
                    <textarea
                      rows={6}
                      value={configForm.termsPageContent || configForm.termsContent || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          termsPageContent: e.target.value,
                          termsContent: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7] leading-relaxed"
                    />
                  </div>

                  {/* 4. Aviso Legal, Derechos Reservados y Cookies */}
                  <div className="p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-[#171920]">
                        4. Aviso Legal, Propiedad Intelectual y Política de Cookies
                      </label>
                      {onOpenPublicLegalPage && (
                        <button
                          type="button"
                          onClick={() => onOpenPublicLegalPage('cookies')}
                          className="text-[11px] font-bold text-[#10B981] hover:underline cursor-pointer"
                        >
                          Ver en vivo →
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={configForm.copyrightPageTitle || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          copyrightPageTitle: e.target.value,
                        })
                      }
                      placeholder="Título de Aviso Legal y Derechos Reservados"
                      className="w-full px-3.5 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                    />
                    <textarea
                      rows={6}
                      value={configForm.copyrightPageContent || ''}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          copyrightPageContent: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7] leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Bottom Save & Restore Row */}
              <div className="pt-5 border-t border-[#dcdfe7] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetDefaultConfig}
                  className="px-3.5 py-2 rounded-[8px] text-xs font-semibold text-[#595F71] bg-[#f7f8fc] border border-[#dcdfe7] hover:text-[#171920] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar valores originales Kayleen</span>
                </button>

                <div className="flex items-center gap-3">
                  {savedConfigNotice && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡Configuración aplicada en todo el sitio!</span>
                    </span>
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-[8px] text-xs font-semibold text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: configForm.primaryAccentColor || '#FF2C54' }}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Configuración del Sitio</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Right Live Preview Card (4 Cols) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-8">
            <div className="bg-white border border-[#dcdfe7] rounded-[12px] p-5 space-y-4">
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#595F71]">
                Vista Previa de Identidad, Colores y Footer
              </div>

              {/* Mini Header & Page Preview */}
              <div
                className="rounded-[10px] border border-[#dcdfe7] overflow-hidden"
                style={{ backgroundColor: configForm.pageBackgroundColor }}
              >
                {configForm.promoBannerEnabled && (
                  <div
                    className="px-3 py-1.5 text-[10px] text-white flex items-center justify-between"
                    style={{ backgroundColor: configForm.promoBannerColor || '#171920' }}
                  >
                    <span className="truncate">{configForm.promoBannerText}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold ml-2 shrink-0"
                      style={{ backgroundColor: configForm.primaryAccentColor }}
                    >
                      {configForm.promoBannerCta}
                    </span>
                  </div>
                )}

                <div className="px-4 py-3 border-b border-[#dcdfe7] flex items-center justify-between bg-white">
                  {configForm.useImageLogo && configForm.logoImageUrl ? (
                    <img
                      src={configForm.logoImageUrl}
                      alt={configForm.logoText}
                      className="h-6 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-lg font-bold text-[#171920]">
                      {configForm.logoText || 'Kayleen'}
                      <span style={{ color: configForm.logoDotColor || '#FF2C54' }}>.</span>
                    </span>
                  )}

                  <span
                    className="px-2.5 py-1 rounded-[5px] text-[10px] font-semibold text-white"
                    style={{ backgroundColor: configForm.primaryAccentColor }}
                  >
                    Panel Editorial
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div
                    className="p-3 rounded-[8px] border border-[#dcdfe7]"
                    style={{ backgroundColor: configForm.surfaceBackgroundColor }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                      style={{ color: configForm.primaryAccentColor }}
                    >
                      {configForm.editorsPickTitle}
                    </span>
                    <p className="text-[11px] text-[#4b546e]">
                      {configForm.editorsPickSubtitle}
                    </p>
                  </div>

                  {/* Mini Footer Preview */}
                  <div
                    className="p-3.5 rounded-[8px] border border-[#dcdfe7] space-y-2"
                    style={{ backgroundColor: configForm.footerBackgroundColor }}
                  >
                    {configForm.showNewsletterBox && (
                      <div className="p-2.5 bg-white rounded-[6px] border border-[#dcdfe7]">
                        <p className="text-[10px] font-bold text-[#171920] mb-1.5">
                          {configForm.newsletterHeading}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 px-2 py-1 text-[9px] text-[#9497AE] bg-[#f7f8fc] rounded border border-[#dcdfe7] truncate">
                            {configForm.newsletterPlaceholder}
                          </div>
                          <span
                            className="px-2 py-1 rounded text-[9px] font-semibold text-white shrink-0"
                            style={{ backgroundColor: configForm.primaryAccentColor }}
                          >
                            {configForm.newsletterButtonText}
                          </span>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-[#595F71] line-clamp-2">
                      {configForm.footerDescription}
                    </p>
                     <p className="text-[9px] text-[#171920] font-semibold">
                      {configForm.footerCopyright}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Google SERP & <head> Meta Injection Preview Card */}
            <div className="bg-white border border-[#dcdfe7] rounded-[12px] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#595F71] inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#FF2C54]" />
                  <span>Vista Previa en Google (SERP) y &lt;head&gt;</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                  &lt;head&gt; Activo
                </span>
              </div>

              {/* Simulated Google Search Result Snippet */}
              <div className="p-3.5 rounded-[10px] bg-[#f7f8fc] border border-[#dcdfe7] space-y-1">
                <div className="text-[11px] text-[#4b546e] truncate">
                  https://kayleen-magazine.studio › home-03
                </div>
                <div className="text-sm font-bold text-[#1a0dab] leading-snug line-clamp-2">
                  {configForm.metaTitle || configForm.siteTitle || 'Kayleen Magazine'}
                </div>
                <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-3">
                  {configForm.metaDescription ||
                    'Descubre artículos destacados de fotografía, arquitectura, viajes, tecnología y estilo de vida.'}
                </p>
              </div>

              {/* Live Injected <head> HTML Tags Inspector */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-[#171920] inline-flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-[#5960FF]" />
                  <span>Etiquetas inyectadas en document.head:</span>
                </div>
                <pre className="bg-[#171920] text-[#F5F5F4] p-3 rounded-[8px] text-[10px] font-mono overflow-x-auto leading-relaxed">
                  <code>{`<title>${configForm.metaTitle || configForm.siteTitle}</title>
<meta name="description" content="${configForm.metaDescription || ''}" />
<meta name="keywords" content="${configForm.metaKeywords || ''}" />
<meta name="author" content="${configForm.metaAuthor || 'Kayleen Editorial Studio'}" />
<meta name="robots" content="${
                    configForm.robotsIndex !== false ? 'index, follow' : 'noindex, nofollow'
                  }" />
<meta property="og:title" content="${configForm.metaTitle || configForm.siteTitle}" />
<meta property="og:description" content="${configForm.metaDescription || ''}" />`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* INDEPENDENT SECTION 2 & 3: SUSCRIPTORES OR CAMPAÑAS DE MARKETING    */}
      {/* =================================================================== */}
      {(activeSubMode === 'subscribers' || activeSubMode === 'campaigns') && (
        <div className="space-y-6">
          {/* 4-Column Metrics tailored to Subscribers & Campaigns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#dcdfe7] rounded-[12px] p-5">
              <span className="text-xs text-[#595F71] block mb-1">
                Suscriptores Activos
              </span>
              <div className="font-mono text-2xl font-bold text-[#16A34A] tabular-nums">
                {activeSubsCount}
              </div>
              <span className="text-[11px] text-[#595F71] mt-1 block">
                de {subscribers.length} registrados ({unsubscribedCount} bajas)
              </span>
            </div>

            <div className="bg-white border border-[#dcdfe7] rounded-[12px] p-5">
              <span className="text-xs text-[#595F71] block mb-1">
                Segmento Lectores VIP
              </span>
              <div
                className="font-mono text-2xl font-bold tabular-nums"
                style={{ color: siteConfig.secondaryAccentColor || '#5960FF' }}
              >
                {vipSubsCount}
              </div>
              <span className="text-[11px] text-[#595F71] mt-1 block">
                Suscriptores prioritarios
              </span>
            </div>

            <div className="bg-white border border-[#dcdfe7] rounded-[12px] p-5">
              <span className="text-xs text-[#595F71] block mb-1">
                Campañas de Marketing
              </span>
              <div className="font-mono text-2xl font-bold text-[#171920] tabular-nums">
                {campaigns.length}
              </div>
              <span
                className="text-[11px] font-semibold mt-1 block"
                style={{ color: siteConfig.primaryAccentColor || '#FF2C54' }}
              >
                {campaigns.filter((c) => c.status === 'sent').length} enviadas ·{' '}
                {campaigns.filter((c) => c.status !== 'sent').length} en preparación
              </span>
            </div>

            <div className="bg-white border border-[#dcdfe7] rounded-[12px] p-5">
              <span className="text-xs text-[#595F71] block mb-1">
                Suscriptores con Push Web
              </span>
              <div className="font-mono text-2xl font-bold text-[#171920] tabular-nums flex items-center gap-2">
                <span>{pushSubsCount}</span>
                <BellRing className="w-5 h-5 text-[#16A34A]" />
              </div>
              <span className="text-[11px] text-[#16A34A] font-semibold mt-1 block">
                {pushNotifications.length} alertas push enviadas al navegador
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#dcdfe7] rounded-[12px] overflow-hidden">
            {/* ------------------------------------------------------------- */}
            {/* INDEPENDENT VIEW A: SUBSCRIBERS MANAGEMENT                    */}
            {/* ------------------------------------------------------------- */}
            {marketingSection === 'subscribers' && (
              <div className="p-6 space-y-6">
                {/* Quick Add Subscriber Bar */}
                <form
                  onSubmit={handleAddSubscriberSubmit}
                  className="p-4 rounded-[10px] bg-[#f7f8fc] border border-[#dcdfe7] grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
                >
                  <div>
                    <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                      Nombre del Suscriptor
                    </label>
                    <input
                      type="text"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      placeholder="Ej. Martín Aguirre"
                      className="w-full px-3 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={newSubEmail}
                      onChange={(e) => setNewSubEmail(e.target.value)}
                      placeholder="martin@correo.com"
                      className="w-full px-3 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                      Segmento / Etiqueta Inicial
                    </label>
                    <select
                      value={newSubTag}
                      onChange={(e) => setNewSubTag(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7] font-semibold"
                    >
                      <option value="VIP">Lectores VIP</option>
                      <option value="Editorial">Boletín Editorial</option>
                      <option value="Moda">Interés: Moda</option>
                      <option value="Fotografía">Interés: Fotografía</option>
                      <option value="Tecnología">Interés: Tecnología</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                      Alertas Push Navegador
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewSubPushEnabled(!newSubPushEnabled)}
                      className={`w-full px-3 py-2 rounded-[8px] text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        newSubPushEnabled
                          ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                          : 'bg-white text-[#595F71] border-[#dcdfe7]'
                      }`}
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>{newSubPushEnabled ? 'Push Web Activo' : 'Solo Email'}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="py-2 px-4 rounded-[8px] text-xs font-semibold text-white bg-[#171920] hover:bg-[#FF2C54] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Suscriptor</span>
                  </button>
                </form>

                {/* Search & Filter Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-[#9497AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={subSearch}
                      onChange={(e) => setSubSearch(e.target.value)}
                      placeholder="Buscar suscriptor por email, nombre u origen..."
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-[#f7f8fc] rounded-[8px] border border-[#dcdfe7]">
                    {(['ALL', 'active', 'unsubscribed'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSubStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
                          subStatusFilter === st
                            ? 'bg-[#5960FF] text-white'
                            : 'text-[#595F71] hover:text-[#171920]'
                        }`}
                      >
                        {st === 'ALL'
                          ? `Todos (${subscribers.length})`
                          : st === 'active'
                          ? `Activos (${activeSubsCount})`
                          : `Bajas (${unsubscribedCount})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subscribers Table */}
                <div className="overflow-x-auto border border-[#dcdfe7] rounded-[10px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#dcdfe7] text-[11px] uppercase tracking-wider text-[#595F71] bg-[#f7f8fc]">
                        <th className="py-3 px-5 font-semibold">Suscriptor</th>
                        <th className="py-3 px-4 font-semibold">Origen de Alta</th>
                        <th className="py-3 px-4 font-semibold">Segmentos / Tags</th>
                        <th className="py-3 px-4 font-semibold">Notificaciones Push Web</th>
                        <th className="py-3 px-4 font-semibold">Estado</th>
                        <th className="py-3 px-5 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dcdfe7] text-xs">
                      {filteredSubscribers.map((sub) => {
                        const isVip = (sub.tags || []).includes('VIP');
                        const isPushOn = sub.pushEnabled !== false && sub.status === 'active';
                        return (
                          <tr key={sub.id} className="hover:bg-[#f7f8fc]">
                            <td className="py-3.5 px-5">
                              <div className="font-semibold text-[#171920]">{sub.name}</div>
                              <div className="text-[11px] text-[#595F71]">
                                {sub.email} · <span className="font-mono">{sub.joinedAt}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-[#4b546e]">{sub.source}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {(sub.tags || []).map((t) => (
                                  <span
                                    key={t}
                                    className={`text-[11px] font-semibold ${
                                      t === 'VIP' ? 'text-[#FF2C54]' : 'text-[#5960FF]'
                                    }`}
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateSubscriber(sub.id, {
                                    pushEnabled: !isPushOn,
                                    pushDeviceLabel: !isPushOn
                                      ? 'Navegador Web (Push Activo)'
                                      : 'Desactivado',
                                  })
                                }
                                className={`px-2.5 py-1 rounded-[6px] text-[11px] font-semibold border inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  isPushOn
                                    ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                                    : 'bg-white text-[#595F71] border-[#dcdfe7] hover:border-[#171920]'
                                }`}
                                title="Alternar recepción de notificaciones push en el navegador"
                              >
                                {isPushOn ? (
                                  <>
                                    <BellRing className="w-3.5 h-3.5 text-[#16A34A]" />
                                    <span>Push Activo</span>
                                  </>
                                ) : (
                                  <>
                                    <BellOff className="w-3.5 h-3.5 text-[#9497AE]" />
                                    <span>Solo Email</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3.5 px-4">
                              {sub.status === 'active' ? (
                                <span className="text-[#16A34A] font-semibold inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Suscrito Activo
                                </span>
                              ) : (
                                <span className="text-[#D97706] font-semibold inline-flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  Dado de Baja
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentTags = sub.tags || [];
                                    const nextTags = isVip
                                      ? currentTags.filter((t) => t !== 'VIP')
                                      : [...currentTags, 'VIP'];
                                    onUpdateSubscriber(sub.id, { tags: nextTags });
                                  }}
                                  className={`px-2.5 py-1 rounded-[6px] text-[11px] font-semibold border transition-colors cursor-pointer ${
                                    isVip
                                      ? 'bg-[#FF2C54] text-white border-[#FF2C54]'
                                      : 'bg-white text-[#4b546e] border-[#dcdfe7] hover:border-[#FF2C54]'
                                  }`}
                                >
                                  {isVip ? '★ VIP' : '+ Hacer VIP'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateSubscriber(sub.id, {
                                      status:
                                        sub.status === 'active'
                                          ? 'unsubscribed'
                                          : 'active',
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-[6px] text-[11px] font-semibold border border-[#dcdfe7] bg-white text-[#171920] hover:bg-[#171920] hover:text-white transition-colors cursor-pointer"
                                >
                                  {sub.status === 'active' ? 'Dar de Baja' : 'Reactivar'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onDeleteSubscriber(sub.id)}
                                  className="p-1 text-[#595F71] hover:text-[#DC2626] cursor-pointer"
                                  title="Eliminar suscriptor"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-SECTION B: MARKETING CAMPAIGNS MANAGEMENT                 */}
            {/* ------------------------------------------------------------- */}
            {marketingSection === 'campaigns' && (
              <div className="p-6 space-y-5">
                {campaigns.length === 0 ? (
                  <div className="p-10 text-center border border-[#dcdfe7] rounded-[12px] bg-[#f7f8fc]">
                    <p className="text-sm text-[#4b546e] mb-3">
                      Aún no has creado ninguna campaña de marketing.
                    </p>
                    <button
                      type="button"
                      onClick={openNewCampaignModal}
                      className="px-4 py-2 rounded-[8px] text-xs font-semibold text-white bg-[#FF2C54] cursor-pointer"
                    >
                      Crear Primera Campaña
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {campaigns.map((cmp) => {
                      const linkedArticle = articles.find(
                        (a) => a.id === cmp.featuredArticleId
                      );
                      return (
                        <div
                          key={cmp.id}
                          className="border border-[#dcdfe7] rounded-[12px] p-5 bg-white flex flex-col justify-between gap-4 hover:shadow-xs transition-all"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#5960FF] block">
                                  Segmento:{' '}
                                  {cmp.segment === 'vip'
                                    ? `Lectores VIP (${vipSubsCount})`
                                    : `Suscriptores Activos (${activeSubsCount})`}
                                </span>
                                <h3 className="text-base font-bold text-[#171920] mt-0.5">
                                  {cmp.name}
                                </h3>
                              </div>

                              <span
                                className={`text-xs font-semibold shrink-0 ${
                                  cmp.status === 'sent'
                                    ? 'text-[#16A34A]'
                                    : cmp.status === 'scheduled'
                                    ? 'text-[#5960FF]'
                                    : 'text-[#D97706]'
                                }`}
                              >
                                {cmp.status === 'sent'
                                  ? '● Enviada'
                                  : cmp.status === 'scheduled'
                                  ? '● Programada'
                                  : '● Borrador'}
                              </span>
                            </div>

                            <div className="p-3 rounded-[8px] bg-[#f7f8fc] border border-[#dcdfe7] space-y-1.5">
                              <div className="text-xs font-semibold text-[#171920]">
                                Asunto: “{cmp.subject}”
                              </div>
                              <p className="text-xs text-[#4b546e] line-clamp-2 leading-relaxed">
                                {cmp.customMessage}
                              </p>
                              {linkedArticle && (
                                <div className="pt-1.5 border-t border-[#dcdfe7] flex items-center gap-2 text-[11px] text-[#FF2C54] font-medium">
                                  <FileText className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">
                                    Artículo incrustado: {linkedArticle.title}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Telemetry Bar */}
                            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                              <div className="p-2 rounded-[6px] bg-[#f7f8fc]">
                                <span className="text-[10px] text-[#595F71] block">
                                  Destinatarios
                                </span>
                                <span className="font-mono text-xs font-bold text-[#171920] tabular-nums">
                                  {cmp.status === 'sent'
                                    ? cmp.sentCount
                                    : cmp.segment === 'vip'
                                    ? vipSubsCount
                                    : activeSubsCount}
                                </span>
                              </div>
                              <div className="p-2 rounded-[6px] bg-[#f7f8fc]">
                                <span className="text-[10px] text-[#595F71] block">
                                  Apertura
                                </span>
                                <span className="font-mono text-xs font-bold text-[#16A34A] tabular-nums">
                                  {cmp.status === 'sent' ? `${cmp.openRate}%` : '—'}
                                </span>
                              </div>
                              <div className="p-2 rounded-[6px] bg-[#f7f8fc]">
                                <span className="text-[10px] text-[#595F71] block">
                                  Clics (CTR)
                                </span>
                                <span className="font-mono text-xs font-bold text-[#5960FF] tabular-nums">
                                  {cmp.status === 'sent' ? `${cmp.clickRate}%` : '—'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[#dcdfe7] flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-[#595F71] tabular-nums">
                              Fecha: {cmp.scheduledDate}
                            </span>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditCampaignModal(cmp)}
                                className="px-3 py-1.5 rounded-[6px] text-xs font-semibold border border-[#dcdfe7] text-[#171920] hover:bg-[#171920] hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>

                              {onSendPushNotification && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onSendPushNotification({
                                      type: 'new_campaign',
                                      title: `📣 ${cmp.subject}`,
                                      body: cmp.customMessage,
                                      imageUrl: linkedArticle?.customImageUrl,
                                      category: 'Campaña Push',
                                      targetArticleId: cmp.featuredArticleId || undefined,
                                      targetCampaignId: cmp.id,
                                      ctaText: cmp.ctaText || 'Ver campaña',
                                      segment: cmp.segment,
                                      recipientCount: Math.max(1, pushSubsCount),
                                    })
                                  }
                                  className="px-3 py-1.5 rounded-[6px] text-xs font-semibold text-[#5960FF] bg-[#f7f8fc] border border-[#dcdfe7] hover:bg-[#5960FF] hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                                  title="Enviar alerta Push al navegador para esta campaña"
                                >
                                  <BellRing className="w-3.5 h-3.5" />
                                  <span>Alerta Push</span>
                                </button>
                              )}

                              {cmp.status !== 'sent' && (
                                <button
                                  type="button"
                                  onClick={() => onSendCampaign(cmp.id)}
                                  className="px-3 py-1.5 rounded-[6px] text-xs font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Enviar Ahora</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => onDeleteCampaign(cmp.id)}
                                className="p-1.5 text-[#595F71] hover:text-[#DC2626] cursor-pointer"
                                title="Eliminar campaña"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* BROWSER PUSH NOTIFICATION DISPATCHER & AUTOMATIC LOG              */}
          {/* ================================================================= */}
          <div className="bg-white border border-[#dcdfe7] rounded-[12px] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#dcdfe7] bg-[#f7f8fc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: siteConfig.primaryAccentColor || '#FF2C54' }}
                >
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#171920]">
                    Sistema de Notificaciones Push en el Navegador (Automático y Manual)
                  </h3>
                  <p className="text-xs text-[#595F71]">
                    Las alertas push se disparan automáticamente al publicar un nuevo artículo o lanzar una campaña. También puedes enviar un aviso inmediato aquí.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-[#16A34A] shrink-0">
                ● {pushSubsCount} navegadores suscritos activos
              </span>
            </div>

            <div className="p-6 space-y-6">
              {onSendPushNotification && (
                <form
                  onSubmit={handleSendCustomPushSubmit}
                  className="p-4 rounded-[10px] bg-[#f7f8fc] border border-[#dcdfe7] grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
                >
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                      Vincular Artículo (Opcional)
                    </label>
                    <select
                      value={customPushArticleId}
                      onChange={(e) => setCustomPushArticleId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7] font-medium"
                    >
                      {articles.map((art) => (
                        <option key={art.id} value={art.id}>
                          [{art.category}] {art.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                      Título de la Alerta Push
                    </label>
                    <input
                      type="text"
                      value={customPushTitle}
                      onChange={(e) => setCustomPushTitle(e.target.value)}
                      placeholder="Dejar vacío para usar título del artículo..."
                      className="w-full px-3 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                      Mensaje Corto de la Notificación
                    </label>
                    <input
                      type="text"
                      value={customPushBody}
                      onChange={(e) => setCustomPushBody(e.target.value)}
                      placeholder="Dejar vacío para usar extracto del artículo..."
                      className="w-full px-3 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      style={{ backgroundColor: siteConfig.primaryAccentColor || '#FF2C54' }}
                      className="w-full py-2 px-3 rounded-[8px] text-xs font-semibold text-white hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>Enviar Push Ahora</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Sent Push Notifications Log */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#595F71] mb-3">
                  Historial Reciente de Alertas Push Enviadas ({pushNotifications.length})
                </h4>
                {pushNotifications.length === 0 ? (
                  <p className="text-xs text-[#595F71]">
                    Aún no se han registrado alertas push. Publica un artículo o envía una campaña para disparar una alerta automática.
                  </p>
                ) : (
                  <div className="divide-y divide-[#dcdfe7] border border-[#dcdfe7] rounded-[10px] overflow-hidden">
                    {pushNotifications.slice(0, 8).map((push) => (
                      <div
                        key={push.id}
                        className="p-3.5 bg-white hover:bg-[#f7f8fc] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {push.imageUrl && (
                            <img
                              src={push.imageUrl}
                              alt={push.title}
                              className="w-12 h-12 rounded-[8px] object-cover shrink-0 border border-[#dcdfe7]"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  push.type === 'new_article'
                                    ? 'bg-[#FFF1F3] text-[#FF2C54]'
                                    : push.type === 'new_campaign'
                                    ? 'bg-[#EEF2FF] text-[#5960FF]'
                                    : 'bg-[#F0FDF4] text-[#16A34A]'
                                }`}
                              >
                                {push.type === 'new_article'
                                  ? 'Nuevo Artículo'
                                  : push.type === 'new_campaign'
                                  ? 'Nueva Campaña'
                                  : 'Aviso Push'}
                              </span>
                              <span className="font-bold text-[#171920] truncate">
                                {push.title}
                              </span>
                            </div>
                            <p className="text-[#4b546e] line-clamp-1 mt-0.5">{push.body}</p>
                            <span className="text-[11px] font-mono text-[#595F71] mt-0.5 block">
                              Enviado: {push.createdAt} · {push.recipientCount} suscriptores notificados
                            </span>
                          </div>
                        </div>

                        {onDeletePushNotification && (
                          <button
                            type="button"
                            onClick={() => onDeletePushNotification(push.id)}
                            className="p-1.5 text-[#595F71] hover:text-[#DC2626] shrink-0 self-end sm:self-center cursor-pointer"
                            title="Eliminar del historial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CREATE / EDIT MARKETING CAMPAIGN WITH LIVE EMAIL PREVIEW     */}
      {/* =================================================================== */}
      {isCampaignModalOpen && editingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#dcdfe7] rounded-[15px] w-full max-w-4xl p-6 sm:p-8 my-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#dcdfe7]">
              <div>
                <h3 className="text-xl font-bold text-[#171920]">
                  {editingCampaign.id
                    ? 'Editar Campaña de Marketing'
                    : 'Nueva Campaña de Email Marketing & Boletín'}
                </h3>
                <p className="text-xs text-[#595F71]">
                  Diseña tu boletín editorial, vincula un artículo del blog y previsualiza el correo antes de enviarlo a tus suscriptores.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCampaignModalOpen(false)}
                className="text-[#595F71] hover:text-[#171920] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Campaign Form (7 Cols) */}
              <form
                onSubmit={handleCampaignFormSubmit}
                className="lg:col-span-7 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#171920] mb-1">
                    Nombre Interno de la Campaña *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCampaign.name || ''}
                    onChange={(e) =>
                      setEditingCampaign({ ...editingCampaign, name: e.target.value })
                    }
                    placeholder="Ej. Boletín Semanal #19 — Especial Verano"
                    className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171920] mb-1">
                    Asunto del Correo (Subject Line) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCampaign.subject || ''}
                    onChange={(e) =>
                      setEditingCampaign({ ...editingCampaign, subject: e.target.value })
                    }
                    placeholder="Ej. Nuevas historias visuales en Kayleen Magazine"
                    className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171920] mb-1">
                      Segmento de Suscriptores
                    </label>
                    <select
                      value={editingCampaign.segment || 'active'}
                      onChange={(e) =>
                        setEditingCampaign({
                          ...editingCampaign,
                          segment: e.target.value as 'all' | 'active' | 'vip',
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7] bg-white font-semibold"
                    >
                      <option value="active">
                        Todos los Suscriptores Activos ({activeSubsCount})
                      </option>
                      <option value="vip">
                        Solo Segmento Lectores VIP ({vipSubsCount})
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171920] mb-1">
                      Artículo Destacado en el Boletín
                    </label>
                    <select
                      value={editingCampaign.featuredArticleId || ''}
                      onChange={(e) =>
                        setEditingCampaign({
                          ...editingCampaign,
                          featuredArticleId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7] bg-white font-semibold"
                    >
                      <option value="">— Sin artículo incrustado —</option>
                      {articles.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title} ({a.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171920] mb-1">
                    Mensaje Editorial Personalizado
                  </label>
                  <textarea
                    rows={3}
                    value={editingCampaign.customMessage || ''}
                    onChange={(e) =>
                      setEditingCampaign({
                        ...editingCampaign,
                        customMessage: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#171920] mb-1">
                      Texto Botón CTA
                    </label>
                    <input
                      type="text"
                      value={editingCampaign.ctaText || ''}
                      onChange={(e) =>
                        setEditingCampaign({
                          ...editingCampaign,
                          ctaText: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171920] mb-1">
                      Fecha Programada
                    </label>
                    <input
                      type="date"
                      value={editingCampaign.scheduledDate || ''}
                      onChange={(e) =>
                        setEditingCampaign({
                          ...editingCampaign,
                          scheduledDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171920] mb-1">
                      Estado
                    </label>
                    <select
                      value={editingCampaign.status || 'draft'}
                      onChange={(e) =>
                        setEditingCampaign({
                          ...editingCampaign,
                          status: e.target.value as 'draft' | 'scheduled' | 'sent',
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7] bg-white font-semibold"
                    >
                      <option value="draft">Borrador</option>
                      <option value="scheduled">Programada</option>
                      <option value="sent">Enviada</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#dcdfe7] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCampaignModalOpen(false)}
                    className="px-4 py-2 rounded-[8px] text-xs font-semibold border border-[#dcdfe7] text-[#4b546e] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-[8px] text-xs font-semibold text-white bg-[#FF2C54] hover:bg-[#171920] transition-colors cursor-pointer"
                  >
                    Guardar Campaña
                  </button>
                </div>
              </form>

              {/* Right Live Email Preview (5 Cols) */}
              <div className="lg:col-span-5 bg-[#f7f8fc] border border-[#dcdfe7] rounded-[12px] p-5 space-y-4">
                <div className="text-[11px] uppercase tracking-wider font-bold text-[#595F71]">
                  Vista Previa del Boletín por Correo
                </div>

                <div className="bg-white border border-[#dcdfe7] rounded-[10px] overflow-hidden shadow-xs">
                  <div className="px-4 py-3 border-b border-[#dcdfe7] text-center">
                    <span className="text-xl font-bold text-[#171920]">
                      {configForm.logoText || 'Kayleen'}
                      <span style={{ color: configForm.logoDotColor || '#FF2C54' }}>.</span>
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <h4 className="text-sm font-bold text-[#171920]">
                      {editingCampaign.subject || 'Asunto del boletín...'}
                    </h4>
                    <p className="text-xs text-[#4b546e] leading-relaxed">
                      {editingCampaign.customMessage}
                    </p>

                    {(() => {
                      const art = articles.find(
                        (a) => a.id === editingCampaign.featuredArticleId
                      );
                      if (!art) return null;
                      return (
                        <div className="rounded-[10px] border border-[#dcdfe7] overflow-hidden bg-[#f7f8fc]">
                          <div className="h-32 overflow-hidden">
                            <EditorialVisual
                              preset={art.visualPreset}
                              customImageUrl={art.customImageUrl}
                              alt={art.title}
                              aspectRatio="fill"
                              className="w-full h-full"
                            />
                          </div>
                          <div className="p-3">
                            <span
                              className="text-[10px] font-bold uppercase"
                              style={{ color: configForm.primaryAccentColor }}
                            >
                              {art.category}
                            </span>
                            <h5 className="text-xs font-bold text-[#171920] mt-0.5 mb-1">
                              {art.title}
                            </h5>
                            <p className="text-[11px] text-[#595F71] line-clamp-2">
                              {art.excerpt}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="pt-2 text-center">
                      <span
                        className="inline-block px-5 py-2 rounded-[6px] text-xs font-semibold text-white"
                        style={{
                          backgroundColor: configForm.primaryAccentColor || '#FF2C54',
                        }}
                      >
                        {editingCampaign.ctaText || 'Leer Edición Completa'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
