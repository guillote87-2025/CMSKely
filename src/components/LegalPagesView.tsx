import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  FileText,
  Cookie,
  ArrowLeft,
  Printer,
  CheckCircle2,
  Mail,
  ChevronRight,
  Lock,
  Clock,
  Sparkles,
  Edit3,
  Save,
  X,
  Settings,
  Eye,
} from 'lucide-react';
import { INITIAL_SITE_CONFIG, SiteConfig, User } from '../data/akeaData';

export type LegalSection = 'privacy' | 'refund' | 'terms' | 'cookies';

interface LegalPagesViewProps {
  initialSection?: LegalSection;
  siteConfig?: SiteConfig;
  currentUser?: User | null;
  onBack: () => void;
  onOpenSubscriptions?: () => void;
  onOpenRegister?: () => void;
  onSaveSiteConfig?: (updates: Partial<SiteConfig>) => Promise<void>;
  onOpenAdminLegalEditor?: () => void;
}

export const LegalPagesView: React.FC<LegalPagesViewProps> = ({
  initialSection = 'privacy',
  siteConfig,
  currentUser,
  onBack,
  onOpenSubscriptions,
  onSaveSiteConfig,
  onOpenAdminLegalEditor,
}) => {
  const [activeSection, setActiveSection] = useState<LegalSection>(initialSection);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const mergedConfig: SiteConfig = {
    ...INITIAL_SITE_CONFIG,
    ...(siteConfig || {}),
  };

  const [editForm, setEditForm] = useState({
    privacyPolicyTitle: mergedConfig.privacyPolicyTitle || INITIAL_SITE_CONFIG.privacyPolicyTitle || '',
    privacyPolicyContent: mergedConfig.privacyPolicyContent || INITIAL_SITE_CONFIG.privacyPolicyContent || '',
    refundPolicyTitle: mergedConfig.refundPolicyTitle || INITIAL_SITE_CONFIG.refundPolicyTitle || '',
    refundPolicyContent: mergedConfig.refundPolicyContent || INITIAL_SITE_CONFIG.refundPolicyContent || '',
    termsPageTitle:
      mergedConfig.termsPageTitle ||
      mergedConfig.termsTitle ||
      INITIAL_SITE_CONFIG.termsPageTitle ||
      '',
    termsPageContent:
      mergedConfig.termsPageContent ||
      mergedConfig.termsContent ||
      INITIAL_SITE_CONFIG.termsPageContent ||
      '',
    copyrightPageTitle: mergedConfig.copyrightPageTitle || INITIAL_SITE_CONFIG.copyrightPageTitle || '',
    copyrightPageContent:
      mergedConfig.copyrightPageContent || INITIAL_SITE_CONFIG.copyrightPageContent || '',
    contactEmail: mergedConfig.contactEmail || INITIAL_SITE_CONFIG.contactEmail || 'estudio.nelli@gmail.com',
  });

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    const cfg: SiteConfig = {
      ...INITIAL_SITE_CONFIG,
      ...(siteConfig || {}),
    };
    setEditForm({
      privacyPolicyTitle: cfg.privacyPolicyTitle || INITIAL_SITE_CONFIG.privacyPolicyTitle || '',
      privacyPolicyContent: cfg.privacyPolicyContent || INITIAL_SITE_CONFIG.privacyPolicyContent || '',
      refundPolicyTitle: cfg.refundPolicyTitle || INITIAL_SITE_CONFIG.refundPolicyTitle || '',
      refundPolicyContent: cfg.refundPolicyContent || INITIAL_SITE_CONFIG.refundPolicyContent || '',
      termsPageTitle:
        cfg.termsPageTitle || cfg.termsTitle || INITIAL_SITE_CONFIG.termsPageTitle || '',
      termsPageContent:
        cfg.termsPageContent || cfg.termsContent || INITIAL_SITE_CONFIG.termsPageContent || '',
      copyrightPageTitle: cfg.copyrightPageTitle || INITIAL_SITE_CONFIG.copyrightPageTitle || '',
      copyrightPageContent: cfg.copyrightPageContent || INITIAL_SITE_CONFIG.copyrightPageContent || '',
      contactEmail: cfg.contactEmail || INITIAL_SITE_CONFIG.contactEmail || 'estudio.nelli@gmail.com',
    });
  }, [siteConfig]);

  const canEditLegal =
    !currentUser ||
    currentUser.role === 'admin' ||
    currentUser.role === 'editor' ||
    currentUser.role === 'moderator';

  const sections: {
    id: LegalSection;
    title: string;
    shortTitle: string;
    icon: React.ReactNode;
    badge: string;
  }[] = [
    {
      id: 'privacy',
      title: editForm.privacyPolicyTitle || 'Políticas de Privacidad y Protección de Datos (RGPD)',
      shortTitle: 'Políticas de Privacidad',
      icon: <ShieldCheck className="w-4 h-4 text-[#FF2C54]" />,
      badge: 'RGPD / GDPR',
    },
    {
      id: 'refund',
      title: editForm.refundPolicyTitle || 'Políticas de Devolución, Cancelación y Reembolsos',
      shortTitle: 'Políticas de Devolución',
      icon: <RotateCcw className="w-4 h-4 text-[#5960FF]" />,
      badge: 'Garantía 14 días',
    },
    {
      id: 'terms',
      title: editForm.termsPageTitle || 'Términos y Condiciones de Uso y Suscripción Premium',
      shortTitle: 'Términos y Condiciones',
      icon: <FileText className="w-4 h-4 text-[#0EA5E9]" />,
      badge: 'Actualizado 2026',
    },
    {
      id: 'cookies',
      title: editForm.copyrightPageTitle || 'Aviso Legal, Propiedad Intelectual y Política de Cookies',
      shortTitle: 'Aviso Legal & Cookies',
      icon: <Cookie className="w-4 h-4 text-[#10B981]" />,
      badge: 'Transparencia Digital',
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleSaveLegalChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveSiteConfig) return;
    await onSaveSiteConfig({
      privacyPolicyTitle: editForm.privacyPolicyTitle,
      privacyPolicyContent: editForm.privacyPolicyContent,
      refundPolicyTitle: editForm.refundPolicyTitle,
      refundPolicyContent: editForm.refundPolicyContent,
      termsPageTitle: editForm.termsPageTitle,
      termsPageContent: editForm.termsPageContent,
      termsTitle: editForm.termsPageTitle,
      termsContent: editForm.termsPageContent,
      copyrightPageTitle: editForm.copyrightPageTitle,
      copyrightPageContent: editForm.copyrightPageContent,
      contactEmail: editForm.contactEmail,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    setIsEditingInline(false);
  };

  const handleResetCurrentSectionDefault = () => {
    if (activeSection === 'privacy') {
      setEditForm((prev) => ({
        ...prev,
        privacyPolicyTitle: INITIAL_SITE_CONFIG.privacyPolicyTitle || '',
        privacyPolicyContent: INITIAL_SITE_CONFIG.privacyPolicyContent || '',
      }));
    } else if (activeSection === 'refund') {
      setEditForm((prev) => ({
        ...prev,
        refundPolicyTitle: INITIAL_SITE_CONFIG.refundPolicyTitle || '',
        refundPolicyContent: INITIAL_SITE_CONFIG.refundPolicyContent || '',
      }));
    } else if (activeSection === 'terms') {
      setEditForm((prev) => ({
        ...prev,
        termsPageTitle: INITIAL_SITE_CONFIG.termsPageTitle || '',
        termsPageContent: INITIAL_SITE_CONFIG.termsPageContent || '',
      }));
    } else if (activeSection === 'cookies') {
      setEditForm((prev) => ({
        ...prev,
        copyrightPageTitle: INITIAL_SITE_CONFIG.copyrightPageTitle || '',
        copyrightPageContent: INITIAL_SITE_CONFIG.copyrightPageContent || '',
      }));
    }
  };

  // Helper to render structured paragraphs and headings from editable plain text
  const renderEditableLegalBlocks = (rawText: string) => {
    const blocks = (rawText || '')
      .split(/\n\n+/)
      .map((b) => b.trim())
      .filter(Boolean);

    return blocks.map((block, index) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return null;

      const firstLine = lines[0];
      const isNumberedHeading = /^\d+\.\s+/.test(firstLine);

      if (isNumberedHeading && lines.length > 1) {
        const restLines = lines.slice(1);
        const bulletLines = restLines.filter((l) => l.startsWith('•') || l.startsWith('-'));
        const normalLines = restLines.filter((l) => !l.startsWith('•') && !l.startsWith('-'));

        return (
          <div key={index} className="space-y-2.5 pt-2">
            <h3 className="text-base font-bold text-[#171920]">{firstLine}</h3>
            {normalLines.map((p, idx) => (
              <p key={idx} className="text-sm text-[#333B52] leading-relaxed">
                {p}
              </p>
            ))}
            {bulletLines.length > 0 && (
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#333B52]">
                {bulletLines.map((b, idx) => (
                  <li key={idx}>{b.replace(/^[•-]\s*/, '')}</li>
                ))}
              </ul>
            )}
          </div>
        );
      }

      if (lines.every((l) => l.startsWith('•') || l.startsWith('-'))) {
        return (
          <ul key={index} className="list-disc pl-5 space-y-1.5 text-sm text-[#333B52]">
            {lines.map((b, idx) => (
              <li key={idx}>{b.replace(/^[•-]\s*/, '')}</li>
            ))}
          </ul>
        );
      }

      return (
        <p key={index} className="text-sm text-[#333B52] leading-relaxed whitespace-pre-line">
          {block}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#171920]">
      {/* Top Banner Navigation */}
      <div className="bg-white border-b border-[#dcdfe7] sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#dcdfe7] text-xs font-semibold text-[#4b546e] hover:text-[#171920] hover:border-[#171920] bg-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Revista</span>
            </button>
            <span className="text-[#dcdfe7] hidden sm:inline" aria-hidden="true">|</span>
            <div className="hidden sm:block">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF2C54]">
                Centro de Transparencia y Legalidad
              </span>
              <h1 className="text-sm font-bold text-[#171920]">
                Kayleen Editorial &amp; Media
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canEditLegal && onSaveSiteConfig && (
              <button
                type="button"
                onClick={() => setIsEditingInline((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-xs font-bold border transition-colors cursor-pointer ${
                  isEditingInline
                    ? 'bg-[#171920] text-white border-[#171920]'
                    : 'bg-[#FF2C54]/10 text-[#FF2C54] border-[#FF2C54]/30 hover:bg-[#FF2C54] hover:text-white'
                }`}
              >
                {isEditingInline ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Modo Lectura</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Políticas Legales</span>
                  </>
                )}
              </button>
            )}

            {canEditLegal && onOpenAdminLegalEditor && (
              <button
                type="button"
                onClick={onOpenAdminLegalEditor}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#f7f8fc] hover:bg-[#171920] hover:text-white text-xs font-semibold text-[#171920] border border-[#dcdfe7] transition-colors cursor-pointer"
                title="Abrir editor de páginas legales en el Panel de Administración"
              >
                <Settings className="w-3.5 h-3.5 text-[#5960FF]" />
                <span className="hidden md:inline">Panel Admin Legal</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#f7f8fc] hover:bg-[#ebeef5] text-xs font-semibold text-[#171920] border border-[#dcdfe7] transition-colors cursor-pointer"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            {onOpenSubscriptions && (
              <button
                type="button"
                onClick={onOpenSubscriptions}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] bg-gradient-to-r from-[#FF2C54] to-[#e02247] text-white text-xs font-bold shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Planes Premium</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-10">
        {/* Header Introduction Card */}
        <div className="mb-8 rounded-[18px] bg-white border border-[#dcdfe7] p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF2C54]/10 text-[#FF2C54] text-xs font-bold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Compromiso Editorial &amp; Protección al Consumidor</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171920] tracking-tight mb-3">
                Políticas Legales y Privacidad de Kayleen
              </h2>
              <p className="text-sm sm:text-base text-[#4b546e] leading-relaxed">
                En Kayleen Magazine nos comprometemos a brindar una experiencia de lectura transparente, honesta y respetuosa de tus derechos digitales y privacidad. Conoce o edita nuestras condiciones de uso, políticas de devolución garantizada de 14 días y gestión ética de datos.
              </p>
            </div>

            {canEditLegal && onSaveSiteConfig && (
              <div className="shrink-0 bg-[#f7f8fc] border border-[#dcdfe7] rounded-[14px] p-4 max-w-xs">
                <div className="text-xs font-bold text-[#171920] mb-1 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-[#FF2C54]" />
                  <span>Administración de Textos Legales</span>
                </div>
                <p className="text-[11px] text-[#595F71] mb-3 leading-relaxed">
                  Puedes editar en vivo las 4 páginas legales (Privacidad, Devoluciones, Términos y Aviso Legal) desde aquí o en el Panel Admin.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingInline((prev) => !prev)}
                  className="w-full py-2 px-3 rounded-[8px] bg-[#FF2C54] hover:bg-[#171920] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingInline ? 'Cerrar Editor Rápido' : 'Editar Esta Página Ahora'}</span>
                </button>
              </div>
            )}
          </div>

          {savedSuccess && (
            <div className="mt-4 p-3 rounded-[10px] bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Las páginas de Políticas Legales y Privacidad se han guardado y actualizado en todo el sitio!</span>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#595F71] pt-6 border-t border-[#f0f2f7]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <strong>Garantía de Devolución 100%:</strong> 14 días en suscripciones Premium
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#5960FF]" />
              <strong>Cumplimiento RGPD / GDPR:</strong> Cero venta de datos personales
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#FF2C54]" />
              <strong> Contacto Legal:</strong> {editForm.contactEmail}
            </span>
          </div>
        </div>

        {/* Two-Column Navigation & Text Display / Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#dcdfe7] rounded-[16px] p-4 shadow-xs sticky top-24">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#595F71] px-2 mb-3">
                Documentos Legales (4)
              </h3>
              <div className="space-y-1.5">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full text-left p-3.5 rounded-[12px] transition-all flex items-center justify-between cursor-pointer ${
                      activeSection === sec.id
                        ? 'bg-[#171920] text-white shadow-sm'
                        : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-[8px] ${
                          activeSection === sec.id
                            ? 'bg-white/10 text-white'
                            : 'bg-[#f7f8fc]'
                        }`}
                      >
                        {sec.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-snug">
                          {sec.shortTitle}
                        </div>
                        <span
                          className={`text-[10px] font-medium block ${
                            activeSection === sec.id
                              ? 'text-white/70'
                              : 'text-[#595F71]'
                          }`}
                        >
                          {sec.badge}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        activeSection === sec.id
                          ? 'rotate-90 text-white'
                          : 'text-[#595F71]'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Quick Contact Box */}
              <div className="mt-6 pt-5 border-t border-[#f0f2f7] px-2">
                <div className="text-xs font-semibold text-[#171920] mb-1">
                  ¿Tienes dudas legales o de facturación?
                </div>
                <p className="text-[11px] text-[#595F71] mb-3 leading-relaxed">
                  Nuestro departamento editorial y de atención al lector responde en menos de 24 horas hábiles.
                </p>
                <a
                  href={`mailto:${editForm.contactEmail}?subject=Consulta Legal / Devolución Kayleen`}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#f7f8fc] hover:bg-[#171920] hover:text-white text-xs font-semibold text-[#171920] border border-[#dcdfe7] transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-[#FF2C54]" />
                  <span>Contactar Soporte Legal</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Document Reader Body OR Inline Admin Editor */}
          <div className="lg:col-span-8">
            {isEditingInline && canEditLegal && onSaveSiteConfig ? (
              <form
                onSubmit={handleSaveLegalChanges}
                className="bg-white border-2 border-[#FF2C54] rounded-[18px] p-6 sm:p-8 shadow-lg space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#dcdfe7]">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF2C54] block">
                      Modo Edición Administrativa en Vivo
                    </span>
                    <h3 className="text-lg font-extrabold text-[#171920]">
                      Editar Contenido de Páginas Legales y Privacidad
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetCurrentSectionDefault}
                      className="px-3 py-1.5 rounded-[8px] text-xs font-semibold text-[#595F71] bg-[#f7f8fc] border border-[#dcdfe7] hover:text-[#171920] cursor-pointer inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar sección</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingInline(false)}
                      className="p-1.5 rounded-[8px] text-[#595F71] hover:text-[#171920] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick selector tabs inside editor */}
                <div className="flex flex-wrap gap-2">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveSection(s.id)}
                      className={`px-3 py-1.5 rounded-[8px] text-xs font-bold border transition-colors cursor-pointer ${
                        activeSection === s.id
                          ? 'bg-[#171920] text-white border-[#171920]'
                          : 'bg-[#f7f8fc] text-[#4b546e] border-[#dcdfe7]'
                      }`}
                    >
                      {s.shortTitle}
                    </button>
                  ))}
                </div>

                {activeSection === 'privacy' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171920] mb-1">
                        Título de Políticas de Privacidad (RGPD)
                      </label>
                      <input
                        type="text"
                        value={editForm.privacyPolicyTitle}
                        onChange={(e) =>
                          setEditForm({ ...editForm, privacyPolicyTitle: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#171920] mb-1">
                        Contenido Completo de Políticas de Privacidad (separa secciones con doble salto de línea)
                      </label>
                      <textarea
                        rows={12}
                        value={editForm.privacyPolicyContent}
                        onChange={(e) =>
                          setEditForm({ ...editForm, privacyPolicyContent: e.target.value })
                        }
                        className="w-full px-4 py-3 text-xs sm:text-sm rounded-[10px] border border-[#dcdfe7] leading-relaxed focus:outline-none focus:border-[#FF2C54]"
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'refund' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171920] mb-1">
                        Título de Políticas de Devolución, Cancelación y Reembolsos
                      </label>
                      <input
                        type="text"
                        value={editForm.refundPolicyTitle}
                        onChange={(e) =>
                          setEditForm({ ...editForm, refundPolicyTitle: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#171920] mb-1">
                        Contenido Completo de Políticas de Devolución y Garantía de 14 Días
                      </label>
                      <textarea
                        rows={12}
                        value={editForm.refundPolicyContent}
                        onChange={(e) =>
                          setEditForm({ ...editForm, refundPolicyContent: e.target.value })
                        }
                        className="w-full px-4 py-3 text-xs sm:text-sm rounded-[10px] border border-[#dcdfe7] leading-relaxed focus:outline-none focus:border-[#FF2C54]"
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'terms' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171920] mb-1">
                        Título de Términos y Condiciones de Uso y Suscripción
                      </label>
                      <input
                        type="text"
                        value={editForm.termsPageTitle}
                        onChange={(e) =>
                          setEditForm({ ...editForm, termsPageTitle: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#171920] mb-1">
                        Contenido Completo de Términos y Condiciones
                      </label>
                      <textarea
                        rows={12}
                        value={editForm.termsPageContent}
                        onChange={(e) =>
                          setEditForm({ ...editForm, termsPageContent: e.target.value })
                        }
                        className="w-full px-4 py-3 text-xs sm:text-sm rounded-[10px] border border-[#dcdfe7] leading-relaxed focus:outline-none focus:border-[#FF2C54]"
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'cookies' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171920] mb-1">
                        Título de Aviso Legal, Propiedad Intelectual y Cookies
                      </label>
                      <input
                        type="text"
                        value={editForm.copyrightPageTitle}
                        onChange={(e) =>
                          setEditForm({ ...editForm, copyrightPageTitle: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-sm rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#171920] mb-1">
                        Contenido Completo de Aviso Legal, Derechos Reservados y Cookies
                      </label>
                      <textarea
                        rows={12}
                        value={editForm.copyrightPageContent}
                        onChange={(e) =>
                          setEditForm({ ...editForm, copyrightPageContent: e.target.value })
                        }
                        className="w-full px-4 py-3 text-xs sm:text-sm rounded-[10px] border border-[#dcdfe7] leading-relaxed focus:outline-none focus:border-[#FF2C54]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#171920] mb-1">
                    Correo Oficial de Soporte Legal y Privacidad
                  </label>
                  <input
                    type="email"
                    value={editForm.contactEmail}
                    onChange={(e) =>
                      setEditForm({ ...editForm, contactEmail: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-[8px] border border-[#dcdfe7]"
                  />
                </div>

                <div className="pt-4 border-t border-[#dcdfe7] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingInline(false)}
                    className="px-4 py-2.5 rounded-[8px] text-xs font-semibold border border-[#dcdfe7] text-[#4b546e] hover:text-[#171920] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-[8px] text-xs font-bold text-white bg-[#FF2C54] hover:bg-[#171920] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Todas las Políticas Legales</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white border border-[#dcdfe7] rounded-[18px] p-6 sm:p-10 shadow-xs">
                {/* SECTION 1: POLÍTICAS DE PRIVACIDAD */}
                {activeSection === 'privacy' && (
                  <div className="prose max-w-none text-sm text-[#333B52] leading-relaxed space-y-6">
                    <div className="border-b border-[#f0f2f7] pb-5 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold text-[#FF2C54] uppercase tracking-wider">
                          Documento Oficial RGPD / GDPR
                        </span>
                        <h2 className="text-2xl font-bold text-[#171920] mt-1">
                          {editForm.privacyPolicyTitle ||
                            'Políticas de Privacidad y Protección de Datos Personales'}
                        </h2>
                        <p className="text-xs text-[#595F71] mt-1">
                          En vigor desde el 1 de enero de 2026. Conforme al Reglamento General de Protección de Datos de la Unión Europea.
                        </p>
                      </div>
                      {canEditLegal && onSaveSiteConfig && (
                        <button
                          type="button"
                          onClick={() => setIsEditingInline(true)}
                          className="px-3 py-1.5 rounded-[8px] bg-[#f7f8fc] hover:bg-[#FF2C54] hover:text-white text-xs font-semibold text-[#171920] border border-[#dcdfe7] transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar Privacidad</span>
                        </button>
                      )}
                    </div>

                    <div className="p-4 rounded-[12px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Garantía de Privacidad Kayleen:</strong> No comercializamos, no alquilamos ni transferimos tus datos personales a empresas de publicidad ni a intermediarios de datos. Tu confianza es el núcleo de nuestro periodismo independiente.
                      </div>
                    </div>

                    {/* Dynamically rendered content from siteConfig.privacyPolicyContent */}
                    <div className="space-y-4">
                      {renderEditableLegalBlocks(editForm.privacyPolicyContent)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-[10px] bg-[#f7f8fc] border border-[#dcdfe7]">
                        <strong className="block text-xs text-[#171920] mb-1">
                          Acceso &amp; Portabilidad:
                        </strong>
                        <span className="text-xs text-[#595F71]">
                          Obtener una copia íntegra de tus datos registrados y aportaciones editoriales.
                        </span>
                      </div>
                      <div className="p-3.5 rounded-[10px] bg-[#f7f8fc] border border-[#dcdfe7]">
                        <strong className="block text-xs text-[#171920] mb-1">
                          Supresión &amp; Olvido:
                        </strong>
                        <span className="text-xs text-[#595F71]">
                          Eliminar definitivamente tu cuenta de usuario, comentarios y registros asociados.
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#595F71]">
                      Para ejercer cualquiera de estos derechos ARCO, envía un correo a{' '}
                      <a
                        href={`mailto:${editForm.contactEmail}`}
                        className="text-[#FF2C54] underline"
                      >
                        {editForm.contactEmail}
                      </a>{' '}
                      con el asunto &quot;Derechos Privacidad RGPD&quot;.
                    </p>
                  </div>
                )}

                {/* SECTION 2: POLÍTICAS DE DEVOLUCIÓN Y REEMBOLSO */}
                {activeSection === 'refund' && (
                  <div className="prose max-w-none text-sm text-[#333B52] leading-relaxed space-y-6">
                    <div className="border-b border-[#f0f2f7] pb-5 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold text-[#5960FF] uppercase tracking-wider">
                          Satisfacción Garantizada &amp; Flexibilidad
                        </span>
                        <h2 className="text-2xl font-bold text-[#171920] mt-1">
                          {editForm.refundPolicyTitle ||
                            'Políticas de Devoluciones, Cancelaciones y Reembolsos'}
                        </h2>
                        <p className="text-xs text-[#595F71] mt-1">
                          Nuestra promesa es simple: si no estás 100% satisfecho con tu suscripción Premium, te devolvemos tu dinero sin complicaciones.
                        </p>
                      </div>
                      {canEditLegal && onSaveSiteConfig && (
                        <button
                          type="button"
                          onClick={() => setIsEditingInline(true)}
                          className="px-3 py-1.5 rounded-[8px] bg-[#f7f8fc] hover:bg-[#FF2C54] hover:text-white text-xs font-semibold text-[#171920] border border-[#dcdfe7] transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar Devoluciones</span>
                        </button>
                      )}
                    </div>

                    {/* Highlights Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-[12px] bg-amber-500/10 border border-amber-300 text-center">
                        <div className="text-xl font-extrabold text-amber-700">14 Días</div>
                        <div className="text-xs font-semibold text-[#171920] mt-0.5">
                          Reembolso 100% Garantizado
                        </div>
                        <div className="text-[11px] text-[#595F71] mt-1">
                          Primeros 14 días naturales desde el alta
                        </div>
                      </div>
                      <div className="p-4 rounded-[12px] bg-emerald-500/10 border border-emerald-300 text-center">
                        <div className="text-xl font-extrabold text-emerald-700">1 Clic</div>
                        <div className="text-xs font-semibold text-[#171920] mt-0.5">
                          Cancelación Inmediata
                        </div>
                        <div className="text-[11px] text-[#595F71] mt-1">
                          Sin llamadas ni trámites burocráticos
                        </div>
                      </div>
                      <div className="p-4 rounded-[12px] bg-[#5960FF]/10 border border-[#5960FF]/30 text-center">
                        <div className="text-xl font-extrabold text-[#5960FF]">3-7 Días</div>
                        <div className="text-xs font-semibold text-[#171920] mt-0.5">
                          Acreditación Bancaria
                        </div>
                        <div className="text-[11px] text-[#595F71] mt-1">
                          Directo a tu método de pago original
                        </div>
                      </div>
                    </div>

                    {/* Dynamically rendered content from siteConfig.refundPolicyContent */}
                    <div className="space-y-4">
                      {renderEditableLegalBlocks(editForm.refundPolicyContent)}
                    </div>
                  </div>
                )}

                {/* SECTION 3: TÉRMINOS Y CONDICIONES */}
                {activeSection === 'terms' && (
                  <div className="prose max-w-none text-sm text-[#333B52] leading-relaxed space-y-6">
                    <div className="border-b border-[#f0f2f7] pb-5 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold text-[#0EA5E9] uppercase tracking-wider">
                          Marco Legal y Contrato de Uso
                        </span>
                        <h2 className="text-2xl font-bold text-[#171920] mt-1">
                          {editForm.termsPageTitle ||
                            'Términos y Condiciones de Uso y Membresía Premium'}
                        </h2>
                        <p className="text-xs text-[#595F71] mt-1">
                          Reglas de navegación, acceso editorial y convivencia en la comunidad de lectores de Kayleen Magazine.
                        </p>
                      </div>
                      {canEditLegal && onSaveSiteConfig && (
                        <button
                          type="button"
                          onClick={() => setIsEditingInline(true)}
                          className="px-3 py-1.5 rounded-[8px] bg-[#f7f8fc] hover:bg-[#FF2C54] hover:text-white text-xs font-semibold text-[#171920] border border-[#dcdfe7] transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar Términos</span>
                        </button>
                      )}
                    </div>

                    {/* Dynamically rendered content from siteConfig.termsPageContent */}
                    <div className="space-y-4">
                      {renderEditableLegalBlocks(editForm.termsPageContent)}
                    </div>
                  </div>
                )}

                {/* SECTION 4: AVISO LEGAL Y COOKIES */}
                {activeSection === 'cookies' && (
                  <div className="prose max-w-none text-sm text-[#333B52] leading-relaxed space-y-6">
                    <div className="border-b border-[#f0f2f7] pb-5 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider">
                          Identificación y Transparencia Técnica
                        </span>
                        <h2 className="text-2xl font-bold text-[#171920] mt-1">
                          {editForm.copyrightPageTitle ||
                            'Aviso Legal, Propiedad Intelectual y Política de Cookies'}
                        </h2>
                        <p className="text-xs text-[#595F71] mt-1">
                          Identidad corporativa del medio digital, derechos de autor y uso de tecnologías de almacenamiento local.
                        </p>
                      </div>
                      {canEditLegal && onSaveSiteConfig && (
                        <button
                          type="button"
                          onClick={() => setIsEditingInline(true)}
                          className="px-3 py-1.5 rounded-[8px] bg-[#f7f8fc] hover:bg-[#FF2C54] hover:text-white text-xs font-semibold text-[#171920] border border-[#dcdfe7] transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar Aviso Legal</span>
                        </button>
                      )}
                    </div>

                    <div className="p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7] text-xs space-y-1.5 text-[#4b546e]">
                      <div>
                        <strong>Denominación Social:</strong> Kayleen Editorial Studio S.L.
                      </div>
                      <div>
                        <strong>Nombre Comercial:</strong> Kayleen Magazine (Rivax Studio Home 03)
                      </div>
                      <div>
                        <strong>Correo de Contacto:</strong> {editForm.contactEmail}
                      </div>
                      <div>
                        <strong>Actividad Principal:</strong> Edición, difusión y publicación de periodismo cultural y fotografía contemporánea.
                      </div>
                    </div>

                    {/* Dynamically rendered content from siteConfig.copyrightPageContent */}
                    <div className="space-y-4">
                      {renderEditableLegalBlocks(editForm.copyrightPageContent)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
