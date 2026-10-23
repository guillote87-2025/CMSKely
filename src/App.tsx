import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  MessageSquare,
  CheckCircle2,
  UserCheck,
  LogOut,
  SlidersHorizontal,
  Code2,
  Calendar,
  Flame,
  Clock,
  Menu,
  X,
  Settings,
  Bell,
  BellRing,
  Crown,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Lock,
  LogIn,
  UserPlus,
  Edit3,
  Palette,
} from 'lucide-react';
import {
  INITIAL_DATABASE,
  INITIAL_SITE_CONFIG,
  INITIAL_PUSH_NOTIFICATIONS,
  DatabaseState,
  Article,
  ArticleCategory,
  CategoryItem,
  BlogComment,
  CommentStatus,
  SiteConfig,
  SubscriberItem,
  MarketingCampaign,
  PushNotificationItem,
  User,
  UserRole,
} from './data/akeaData';
import {
  registerPushServiceWorker,
  requestBrowserPushPermission,
  isBrowserPushSubscribedLocal,
  setBrowserPushSubscribedLocal,
  dispatchNativeBrowserNotification,
  playSubtlePushChime,
} from './utils/pushNotificationService';
import { EditorialVisual, AuthorAvatar } from './components/EditorialVisual';
import { SocialShareBar } from './components/SocialShareBar';
import { ArticleDetailView } from './components/ArticleDetailView';
import { AuthorProfileView } from './components/AuthorProfileView';
import { AuthModal } from './components/AuthModal';
import { AdminDashboardView, DashboardTab } from './components/AdminDashboardView';
import { LegalPagesView, LegalSection } from './components/LegalPagesView';
import { applyGlobalThemeCssVariables } from './utils/themeVariables';
import { SubscriptionPlansView } from './components/SubscriptionPlansView';
import { ReaderRegisterView } from './components/ReaderRegisterView';

type ActiveView =
  | { type: 'home'; categoryFilter?: ArticleCategory | null }
  | { type: 'article'; articleId: string }
  | { type: 'author'; authorId: string | null }
  | { type: 'dashboard'; tab?: DashboardTab }
  | { type: 'subscriptions' }
  | { type: 'register' }
  | { type: 'legal'; section?: LegalSection };

export default function App() {
  const [db, setDb] = useState<DatabaseState>(INITIAL_DATABASE);
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_DATABASE.users[0]); // Alice Qelvin (Admin)
  const [view, setView] = useState<ActiveView>({ type: 'home', categoryFilter: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalGroup, setAuthModalGroup] = useState<'all' | 'admin' | 'reader'>('all');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [showHeaderFeaturedBar, setShowHeaderFeaturedBar] = useState(false);
  const [sidebarCarouselIdx, setSidebarCarouselIdx] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterPushOptIn, setNewsletterPushOptIn] = useState(true);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openAuthModal = (
    mode: 'login' | 'register' = 'login',
    group: 'all' | 'admin' | 'reader' = 'all'
  ) => {
    setAuthModalMode(mode);
    setAuthModalGroup(group);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (view.type === 'dashboard') {
      setView({ type: 'home', categoryFilter: null });
    }
    showToast('Has cerrado sesión correctamente');
  };

  // Browser Push Notification System State
  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(() =>
    isBrowserPushSubscribedLocal()
  );
  const [isPushDropdownOpen, setIsPushDropdownOpen] = useState(false);
  const [activePushBanner, setActivePushBanner] =
    useState<PushNotificationItem | null>(null);
  const [readPushIds, setReadPushIds] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Register Service Worker on mount
  useEffect(() => {
    registerPushServiceWorker();
  }, []);

  // Trigger live browser push alert (Native Notification + In-App Browser Push Banner + Chime)
  const triggerLivePushAlert = (pushItem: PushNotificationItem) => {
    setActivePushBanner(pushItem);
    playSubtlePushChime();
    if (isPushSubscribed) {
      dispatchNativeBrowserNotification(
        pushItem,
        db.siteConfig?.logoText || 'Kayleen Magazine',
        (articleId) => openArticle(articleId)
      );
    }
  };

  const handleToggleBrowserPushSubscription = async () => {
    if (isPushSubscribed) {
      setBrowserPushSubscribedLocal(false);
      setIsPushSubscribed(false);
      showToast('Notificaciones Push desactivadas en este navegador');
      return;
    }

    const result = await requestBrowserPushPermission();
    setBrowserPushSubscribedLocal(true);
    setIsPushSubscribed(true);

    const welcomePush: PushNotificationItem = {
      id: `push-welcome-${Date.now()}`,
      type: 'custom_alert',
      title: '🔔 Notificaciones Push Activadas',
      body: 'Recibirás alertas instantáneas en tu navegador cuando publiquemos un nuevo artículo o lancemos una campaña.',
      category: 'Kayleen Push',
      ctaText: 'Explorar Magazine',
      segment: 'active',
      recipientCount:
        (db.subscriberRecords || []).filter(
          (s) => s.status === 'active' && s.pushEnabled !== false
        ).length + 1,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setActivePushBanner(welcomePush);
    playSubtlePushChime();
    if (result.permissionState === 'granted') {
      dispatchNativeBrowserNotification(
        welcomePush,
        db.siteConfig?.logoText || 'Kayleen Magazine'
      );
    }
    showToast('¡Suscripción a Notificaciones Push activada en tu navegador!');
  };

  useEffect(() => {
    fetch('/api/state')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DatabaseState | null) => {
        if (data && Array.isArray(data.articles)) {
          setDb({
            ...data,
            categories:
              Array.isArray(data.categories) && data.categories.length > 0
                ? data.categories
                : INITIAL_DATABASE.categories,
            siteConfig: data.siteConfig
              ? { ...INITIAL_SITE_CONFIG, ...data.siteConfig }
              : INITIAL_SITE_CONFIG,
            subscriberRecords: Array.isArray(data.subscriberRecords)
              ? data.subscriberRecords
              : INITIAL_DATABASE.subscriberRecords,
            campaigns: Array.isArray(data.campaigns)
              ? data.campaigns
              : INITIAL_DATABASE.campaigns,
            pushNotifications: Array.isArray(data.pushNotifications)
              ? data.pushNotifications
              : INITIAL_PUSH_NOTIFICATIONS,
          });
          setCurrentUser((prev) =>
            prev ? data.users.find((u) => u.id === prev.id) || data.users[0] : null
          );
        }
      })
      .catch(() => {});
  }, []);

  const siteConfig: SiteConfig = db.siteConfig || INITIAL_SITE_CONFIG;

  // Dynamically sync global CSS variables (--color-primary, --color-secondary, etc.) into :root
  useEffect(() => {
    applyGlobalThemeCssVariables(siteConfig);
  }, [siteConfig]);

  // Dynamically inject and sync global SEO meta tags into document <head>
  useEffect(() => {
    const activeArticle =
      view.type === 'article'
        ? db.articles.find((a) => a.id === view.articleId)
        : null;

    const baseTitle =
      siteConfig.metaTitle ||
      siteConfig.siteTitle ||
      'Kayleen Home 03 – Revista Editorial de Fotografía, Moda y Cultura';
    const resolvedTitle = activeArticle
      ? `${activeArticle.title} | ${siteConfig.logoText || 'Kayleen'}`
      : baseTitle;

    const resolvedDescription = activeArticle
      ? activeArticle.excerpt || siteConfig.metaDescription
      : siteConfig.metaDescription ||
        'Descubre artículos destacados de fotografía, arquitectura, viajes, tecnología y estilo de vida en Kayleen Magazine.';

    const resolvedKeywords = activeArticle
      ? [
          ...(activeArticle.tags || []),
          ...(siteConfig.metaKeywords || '')
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        ].join(', ')
      : siteConfig.metaKeywords ||
        'blog editorial, revista digital, fotografía, moda, tecnología, viajes, estilo de vida';

    const resolvedAuthor =
      siteConfig.metaAuthor || 'Kayleen Editorial Studio';
    const resolvedRobots =
      siteConfig.robotsIndex !== false ? 'index, follow' : 'noindex, nofollow';
    const resolvedOgImage =
      (activeArticle && activeArticle.customImageUrl) ||
      siteConfig.ogImage ||
      '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg';
    const resolvedUrl =
      typeof window !== 'undefined'
        ? window.location.origin + window.location.pathname
        : '';

    document.title = resolvedTitle;

    const upsertMeta = (
      attrName: 'name' | 'property',
      attrValue: string,
      content: string
    ) => {
      let el = document.head.querySelector(
        `meta[${attrName}="${attrValue}"]`
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    upsertMeta('name', 'description', resolvedDescription);
    upsertMeta('name', 'keywords', resolvedKeywords);
    upsertMeta('name', 'author', resolvedAuthor);
    upsertMeta('name', 'robots', resolvedRobots);
    upsertMeta('property', 'og:title', resolvedTitle);
    upsertMeta('property', 'og:description', resolvedDescription);
    upsertMeta('property', 'og:site_name', siteConfig.logoText || 'Kayleen Magazine');
    upsertMeta('property', 'og:type', activeArticle ? 'article' : 'website');
    upsertMeta('property', 'og:image', resolvedOgImage);
    if (resolvedUrl) {
      upsertMeta('property', 'og:url', resolvedUrl);
    }
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', resolvedTitle);
    upsertMeta('name', 'twitter:description', resolvedDescription);

    if (resolvedUrl) {
      let canonical = document.head.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', resolvedUrl);
    }

    let ldScript = document.getElementById(
      'kayleen-schema-ld'
    ) as HTMLScriptElement | null;
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.id = 'kayleen-schema-ld';
      ldScript.type = 'application/ld+json';
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': activeArticle ? 'BlogPosting' : 'Blog',
      name: resolvedTitle,
      headline: resolvedTitle,
      description: resolvedDescription,
      keywords: resolvedKeywords,
      author: {
        '@type': 'Organization',
        name: resolvedAuthor,
      },
      url: resolvedUrl || undefined,
    });
  }, [siteConfig, view, db.articles]);

  const categoriesList =
    Array.isArray(db.categories) && db.categories.length > 0
      ? db.categories
      : INITIAL_DATABASE.categories;

  const publishedArticles = db.articles.filter((a) => a.status === 'published');

  const getAuthor = (authorId: string): User =>
    db.users.find((u) => u.id === authorId) || db.users[0];

  const getCoAuthors = (art: Article): User[] =>
    (art.coAuthorIds || [])
      .map((id) => db.users.find((u) => u.id === id))
      .filter((u): u is User => Boolean(u && u.id !== art.authorId));

  const getApprovedCommentCount = (articleId: string): number =>
    db.comments.filter((c) => c.articleId === articleId && c.status === 'approved').length;

  const pendingCommentsCount = db.comments.filter((c) => c.status === 'pending').length;

  // Navigation Handlers
  const openArticle = (articleId: string) => {
    setView({ type: 'article', articleId });
    setIsOffcanvasOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setDb((prev) => ({
      ...prev,
      articles: prev.articles.map((a) =>
        a.id === articleId ? { ...a, views: a.views + 1 } : a
      ),
    }));
    fetch(`/api/articles/${articleId}/engage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view' }),
    }).catch(() => {});
  };

  const openAuthor = (authorId: string | null) => {
    setView({ type: 'author', authorId });
    setIsOffcanvasOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDashboard = (tab: DashboardTab = 'overview') => {
    setView({ type: 'dashboard', tab });
    setIsOffcanvasOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Engagement Handlers
  const handleShareArticle = (articleId: string, network: string) => {
    setDb((prev) => ({
      ...prev,
      articles: prev.articles.map((a) =>
        a.id === articleId ? { ...a, shares: a.shares + 1 } : a
      ),
    }));
    fetch(`/api/articles/${articleId}/engage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'share' }),
    }).catch(() => {});
    showToast(`Enlace preparado para compartir en ${network}`);
  };

  const handleLikeArticle = (articleId: string) => {
    setDb((prev) => ({
      ...prev,
      articles: prev.articles.map((a) =>
        a.id === articleId ? { ...a, likes: a.likes + 1 } : a
      ),
    }));
    fetch(`/api/articles/${articleId}/engage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'like' }),
    }).catch(() => {});
    showToast('Has recomendado este artículo');
  };

  const handleDislikeArticle = (articleId: string) => {
    setDb((prev) => ({
      ...prev,
      articles: prev.articles.map((a) =>
        a.id === articleId ? { ...a, dislikes: (a.dislikes || 0) + 1 } : a
      ),
    }));
    fetch(`/api/articles/${articleId}/engage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'dislike' }),
    }).catch(() => {});
    showToast('Tu valoración ha sido registrada');
  };

  // Auth Handlers
  const handleLogin = async (
    email: string,
    password?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        showToast(`Sesión iniciada como ${data.user.name}`);
        return { ok: true };
      }
      const errData = await res.json().catch(() => ({}));
      return { ok: false, error: errData.error || 'Credenciales inválidas' };
    } catch {
      const found = db.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (found) {
        setCurrentUser(found);
        showToast(`Sesión iniciada como ${found.name}`);
        return { ok: true };
      }
      return { ok: false, error: 'Usuario no encontrado' };
    }
  };

  const handleRegister = async (payload: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    specialty?: string;
    bio?: string;
    location?: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setDb((prev) => ({ ...prev, users: [...prev.users, data.user] }));
        setCurrentUser(data.user);
        showToast(`Cuenta creada para ${data.user.name}`);
        return { ok: true };
      }
      const errData = await res.json().catch(() => ({}));
      return { ok: false, error: errData.error || 'No se pudo registrar' };
    } catch {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        specialty: payload.specialty || 'Colaborador Editorial',
        bio: payload.bio || 'Colaborador en Kayleen Magazine.',
        location: payload.location || 'Madrid, España',
        website: 'rivaxstudio.com/kayleen',
        twitter: `@${payload.name.toLowerCase().replace(/\s+/g, '')}`,
        instagram: `@${payload.name.toLowerCase().replace(/\s+/g, '.')}`,
        avatarTheme: 'terracotta',
        active: true,
        joinedAt: new Date().toISOString().slice(0, 10),
      };
      setDb((prev) => ({ ...prev, users: [...prev.users, newUser] }));
      setCurrentUser(newUser);
      showToast(`Cuenta creada para ${newUser.name}`);
      return { ok: true };
    }
  };

  // Dedicated Reader Registration Handler
  const handleRegisterReader = async (payload: {
    name: string;
    email: string;
    password?: string;
    location?: string;
    preferredCategories: string[];
    optInNewsletter: boolean;
    optInPush: boolean;
  }): Promise<{ ok: boolean; user?: User; error?: string }> => {
    const existing = db.users.find(
      (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase()
    );
    if (existing) {
      return { ok: false, error: 'Ya existe una cuenta registrada con ese correo electrónico.' };
    }

    const newReader: User = {
      id: `usr-${Date.now()}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password || 'reader123',
      role: 'reader',
      specialty: `Lector de ${payload.preferredCategories?.slice(0, 2).join(' & ') || 'Kayleen Magazine'}`,
      bio: `Lector registrado apasionado por ${payload.preferredCategories?.join(', ') || 'la fotografía y el estilo de vida'}.`,
      location: payload.location || 'Madrid, España',
      website: '',
      twitter: '',
      instagram: '',
      avatarTheme: 'terracotta',
      active: true,
      joinedAt: new Date().toISOString().slice(0, 10),
      isPremium: false,
      subscriptionStatus: 'free',
    };

    setDb((prev) => {
      const nextUsers = [...prev.users, newReader];
      const nextSubscribers = payload.optInNewsletter && !prev.subscribers.includes(newReader.email)
        ? [...prev.subscribers, newReader.email]
        : prev.subscribers;
      const nextSubscriberRecords = payload.optInNewsletter
        ? [
            ...(prev.subscriberRecords || []),
            {
              id: `sub-${Date.now()}`,
              email: newReader.email,
              name: newReader.name,
              status: 'active' as const,
              source: 'Registro Lector',
              tags: payload.preferredCategories || ['Lector'],
              joinedAt: new Date().toISOString().slice(0, 10),
              pushEnabled: payload.optInPush,
              pushDeviceLabel: 'Navegador Web Activo',
            },
          ]
        : prev.subscriberRecords;

      return {
        ...prev,
        users: nextUsers,
        subscribers: nextSubscribers,
        subscriberRecords: nextSubscriberRecords,
      };
    });

    setCurrentUser(newReader);
    showToast(`¡Bienvenido a Kayleen, ${newReader.name}! Tu perfil de lector está activo.`);
    return { ok: true, user: newReader };
  };

  // Dedicated Premium Subscription Handler
  const handleSubscribeUser = async (
    planId: string,
    billingCycle: 'monthly' | 'annual',
    paymentMethod: string
  ): Promise<boolean> => {
    if (!currentUser) return false;

    const startDate = new Date().toISOString().slice(0, 10);
    const durationDays = billingCycle === 'annual' ? 365 : 30;
    const endDate = new Date(Date.now() + durationDays * 86400000).toISOString().slice(0, 10);

    const updatedUser: User = {
      ...currentUser,
      isPremium: true,
      subscriptionPlanId: planId,
      subscriptionStatus: 'active',
      billingCycle,
      subscriptionStart: startDate,
      subscriptionEnd: endDate,
      autoRenew: true,
    };

    setCurrentUser(updatedUser);
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === currentUser.id ? updatedUser : u)),
    }));

    showToast('🎉 ¡Suscripción Premium activada con éxito! Acceso ilimitado desbloqueado.');
    return true;
  };

  // Comment Submission (Always Pending Admin Approval First)
  const handleSubmitComment = async (payload: {
    articleId: string;
    userId?: string;
    authorName: string;
    authorEmail: string;
    authorRole?: UserRole;
    content: string;
  }): Promise<BlogComment | null> => {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setDb((prev) => ({ ...prev, comments: [data.comment, ...prev.comments] }));
        showToast('Comentario enviado a revisión de la administración');
        return data.comment;
      }
    } catch {
      // Fallback
    }
    const fallbackComment: BlogComment = {
      id: `cmt-${Date.now()}`,
      articleId: payload.articleId,
      userId: payload.userId,
      authorName: payload.authorName,
      authorEmail: payload.authorEmail,
      authorRole: payload.authorRole || 'reader',
      content: payload.content,
      createdAt: 'Hace unos instantes',
      status: 'pending',
    };
    setDb((prev) => ({ ...prev, comments: [fallbackComment, ...prev.comments] }));
    showToast('Comentario enviado a revisión de la administración');
    return fallbackComment;
  };

  // Admin CRUD Handlers
  const handleSaveArticle = async (payload: Partial<Article>) => {
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const { article } = data;
        setDb((prev) => {
          const exists = prev.articles.some((a) => a.id === article.id);
          return {
            ...prev,
            articles: exists
              ? prev.articles.map((a) => (a.id === article.id ? article : a))
              : [article, ...prev.articles],
            pushNotifications: data.pushNotifications || prev.pushNotifications,
          };
        });
        if (data.pushNotification) {
          triggerLivePushAlert(data.pushNotification);
          showToast(
            `Artículo publicado y Notificación Push enviada a ${data.pushNotification.recipientCount} suscriptores`
          );
        } else {
          showToast('Artículo guardado correctamente');
        }
        return;
      }
    } catch {
      // Fallback local state update
      const id = payload.id || `art-${Date.now()}`;
      setDb((prev) => {
        const existing = prev.articles.find((a) => a.id === id);
        if (existing) {
          return {
            ...prev,
            articles: prev.articles.map((a) =>
              a.id === id ? ({ ...a, ...payload } as Article) : a
            ),
          };
        }
        const created: Article = {
          id,
          slug: (payload.title || 'articulo').toLowerCase().replace(/\s+/g, '-'),
          title: payload.title || 'Nuevo Artículo',
          subtitle: payload.subtitle || '',
          excerpt: payload.excerpt || '',
          content: payload.content || ['Contenido del artículo.'],
          pullQuote: payload.pullQuote || '',
          category: payload.category || 'Estilo de Vida',
          tags: payload.tags || ['Kayleen'],
          authorId: payload.authorId || prev.users[0].id,
          coAuthorIds: payload.coAuthorIds || [],
          publishedAt: 'Mayo 16, 2026',
          readTimeMinutes: payload.readTimeMinutes || 5,
          akeaSection: payload.akeaSection || 'recent',
          visualPreset: payload.visualPreset || 'minimal_gadgets',
          customImageUrl: payload.customImageUrl,
          galleryImages: payload.galleryImages || [],
          featuredHero: Boolean(payload.featuredHero),
          trending: Boolean(payload.trending),
          status: payload.status || 'published',
          views: 1,
          likes: 0,
          shares: 0,
        };
        return { ...prev, articles: [created, ...prev.articles] };
      });
      showToast('Artículo guardado');
    }
  };

  // Quick 1-click toggle between 'draft' and 'published' right next to "Editar"
  const handleToggleArticleStatus = async (
    articleId: string,
    newStatus: 'published' | 'draft'
  ) => {
    setDb((prev) => ({
      ...prev,
      articles: prev.articles.map((a) =>
        a.id === articleId ? { ...a, status: newStatus } : a
      ),
    }));
    try {
      const res = await fetch(`/api/articles/${articleId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pushNotifications) {
          setDb((prev) => ({
            ...prev,
            pushNotifications: data.pushNotifications,
          }));
        }
        if (data.pushNotification) {
          triggerLivePushAlert(data.pushNotification);
          showToast(
            `Artículo publicado y Alerta Push enviada a ${data.pushNotification.recipientCount} suscriptores`
          );
          return;
        }
      }
    } catch {
      // Ignore network errors after optimistic state update
    }
    showToast(
      newStatus === 'draft'
        ? 'Artículo pasado a Borrador rápidamente'
        : 'Artículo publicado inmediatamente'
    );
  };

  // Category CRUD Handlers (Create, Edit, Delete)
  const handleSaveCategory = async (payload: Partial<CategoryItem>) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setDb((prev) => ({
          ...prev,
          categories: data.categories || prev.categories,
          articles: data.articles || prev.articles,
        }));
        showToast('Categoría guardada correctamente');
        return;
      }
    } catch {
      // Fallback
    }
    const cleanName = (payload.name || '').trim();
    if (!cleanName) return;
    setDb((prev) => {
      const existing = prev.categories.find((c) => c.id === payload.id);
      if (existing) {
        const oldName = existing.name;
        const updatedCats = prev.categories.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                name: cleanName,
                slug: cleanName.toLowerCase().replace(/\s+/g, '-'),
                description: payload.description ?? c.description,
                accentColor: payload.accentColor || c.accentColor,
              }
            : c
        );
        const updatedArts =
          oldName !== cleanName
            ? prev.articles.map((a) =>
                a.category === oldName ? { ...a, category: cleanName } : a
              )
            : prev.articles;
        return { ...prev, categories: updatedCats, articles: updatedArts };
      }
      const created: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: cleanName,
        slug: cleanName.toLowerCase().replace(/\s+/g, '-'),
        description: payload.description || 'Categoría editorial de Kayleen.',
        color: payload.accentColor || payload.color || '#FF2C54',
        accentColor: payload.accentColor || payload.color || '#FF2C54',
      };
      return { ...prev, categories: [...prev.categories, created] };
    });
    showToast('Categoría guardada correctamente');
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        setDb((prev) => ({
          ...prev,
          categories: data.categories || prev.categories,
          articles: data.articles || prev.articles,
        }));
        showToast('Categoría eliminada y artículos reasignados');
        return;
      }
    } catch {
      // Fallback
    }
    setDb((prev) => {
      if (prev.categories.length <= 1) return prev;
      const target = prev.categories.find((c) => c.id === categoryId);
      const remaining = prev.categories.filter((c) => c.id !== categoryId);
      const fallbackName = remaining[0]?.name || 'Estilo de Vida';
      const updatedArticles = target
        ? prev.articles.map((a) =>
            a.category === target.name ? { ...a, category: fallbackName } : a
          )
        : prev.articles;
      return { ...prev, categories: remaining, articles: updatedArticles };
    });
    showToast('Categoría eliminada');
  };

  const handleDeleteArticle = async (articleId: string) => {
    setDb((prev) => ({
      ...prev,
      articles: prev.articles.filter((a) => a.id !== articleId),
      comments: prev.comments.filter((c) => c.articleId !== articleId),
    }));
    await fetch(`/api/articles/${articleId}`, { method: 'DELETE' }).catch(() => {});
    showToast('Artículo eliminado');
  };

  const handleUpdateCommentStatus = async (commentId: string, status: CommentStatus) => {
    setDb((prev) => ({
      ...prev,
      comments: prev.comments.map((c) => (c.id === commentId ? { ...c, status } : c)),
    }));
    await fetch(`/api/comments/${commentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
    showToast(
      status === 'approved'
        ? 'Comentario aprobado y publicado'
        : 'Comentario marcado como rechazado'
    );
  };

  const handleDeleteComment = async (commentId: string) => {
    setDb((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c.id !== commentId),
    }));
    await fetch(`/api/comments/${commentId}`, { method: 'DELETE' }).catch(() => {});
    showToast('Comentario eliminado');
  };

  const handleCreateUser = async (payload: {
    name: string;
    email: string;
    role: UserRole;
    specialty: string;
    bio: string;
    location: string;
  }) => {
    await handleRegister(payload);
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
    }));
    setCurrentUser((prev) =>
      prev && prev.id === userId ? { ...prev, ...updates } : prev
    );
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
    showToast('Perfil y redes sociales actualizados');
  };

  const handleDeleteUser = async (userId: string) => {
    setDb((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== userId),
    }));
    await fetch(`/api/users/${userId}`, { method: 'DELETE' }).catch(() => {});
    showToast('Usuario eliminado');
  };

  // Site Configuration, Subscribers & Marketing Campaigns Handlers
  const handleSaveSiteConfig = async (updates: Partial<SiteConfig>) => {
    setDb((prev) => ({
      ...prev,
      siteConfig: { ...(prev.siteConfig || INITIAL_SITE_CONFIG), ...updates },
    }));
    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.siteConfig) {
          setDb((prev) => ({ ...prev, siteConfig: data.siteConfig }));
        }
      }
    } catch {
      // Optimistic local state already updated
    }
    showToast('Configuración del sitio actualizada en vivo');
  };

  const handleSaveSubscriber = async (sub: Partial<SubscriberItem>) => {
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });
      if (res.ok) {
        const data = await res.json();
        setDb((prev) => ({
          ...prev,
          subscriberRecords: data.subscriberRecords || prev.subscriberRecords,
          subscribers: data.subscribers || prev.subscribers,
        }));
        showToast('Suscriptor guardado en la base de datos');
        return;
      }
    } catch {
      // Fallback
    }
    const cleanEmail = (sub.email || '').trim().toLowerCase();
    if (!cleanEmail) return;
    const created: SubscriberItem = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      name: (sub.name || cleanEmail.split('@')[0]).trim(),
      status: sub.status || 'active',
      source: sub.source || 'Panel Admin',
      tags: Array.isArray(sub.tags) && sub.tags.length > 0 ? sub.tags : ['Newsletter'],
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    setDb((prev) => ({
      ...prev,
      subscriberRecords: [created, ...(prev.subscriberRecords || [])],
      subscribers: prev.subscribers.includes(cleanEmail)
        ? prev.subscribers
        : [...prev.subscribers, cleanEmail],
    }));
    showToast('Suscriptor añadido');
  };

  const handleUpdateSubscriber = async (
    id: string,
    updates: Partial<SubscriberItem>
  ) => {
    setDb((prev) => ({
      ...prev,
      subscriberRecords: (prev.subscriberRecords || []).map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
    try {
      const res = await fetch(`/api/subscribers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.subscriberRecords) {
          setDb((prev) => ({
            ...prev,
            subscriberRecords: data.subscriberRecords,
            subscribers: data.subscribers || prev.subscribers,
          }));
        }
      }
    } catch {
      // Ignore
    }
    showToast('Estado del suscriptor actualizado');
  };

  const handleDeleteSubscriber = async (id: string) => {
    setDb((prev) => ({
      ...prev,
      subscriberRecords: (prev.subscriberRecords || []).filter((s) => s.id !== id),
    }));
    await fetch(`/api/subscribers/${id}`, { method: 'DELETE' }).catch(() => {});
    showToast('Suscriptor eliminado');
  };

  const handleSaveCampaign = async (campaign: Partial<MarketingCampaign>) => {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
      });
      if (res.ok) {
        const data = await res.json();
        setDb((prev) => ({
          ...prev,
          campaigns: data.campaigns || prev.campaigns,
          pushNotifications: data.pushNotifications || prev.pushNotifications,
        }));
        if (data.pushNotification) {
          triggerLivePushAlert(data.pushNotification);
          showToast(
            `Nueva campaña creada y Notificación Push enviada a ${data.pushNotification.recipientCount} suscriptores`
          );
        } else {
          showToast('Campaña de marketing guardada');
        }
        return;
      }
    } catch {
      // Fallback
    }
    setDb((prev) => {
      const list = prev.campaigns || [];
      if (campaign.id && list.some((c) => c.id === campaign.id)) {
        return {
          ...prev,
          campaigns: list.map((c) =>
            c.id === campaign.id ? ({ ...c, ...campaign } as MarketingCampaign) : c
          ),
        };
      }
      const created: MarketingCampaign = {
        id: `cmp-${Date.now()}`,
        name: campaign.name || 'Nueva Campaña Editorial',
        subject: campaign.subject || 'Novedades en Kayleen Magazine',
        preheader: campaign.preheader || '',
        segment: campaign.segment || 'active',
        contentHeadline: campaign.contentHeadline || 'Historias de la Semana',
        contentBody: campaign.contentBody || '',
        ctaText: campaign.ctaText || 'Leer en Kayleen',
        ctaUrl: campaign.ctaUrl || 'https://demo.rivaxstudio.com/kayleen/home-03/',
        featuredArticleId: campaign.featuredArticleId || '',
        status: campaign.status || 'draft',
        sentCount: campaign.sentCount || 0,
        openRate: campaign.openRate || 0,
        clickRate: campaign.clickRate || 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return { ...prev, campaigns: [created, ...list] };
    });
    showToast('Campaña de marketing guardada');
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setDb((prev) => ({
          ...prev,
          campaigns: data.campaigns || prev.campaigns,
          pushNotifications: data.pushNotifications || prev.pushNotifications,
        }));
        if (data.pushNotification) {
          triggerLivePushAlert(data.pushNotification);
        }
        showToast(
          `¡Campaña y Notificación Push enviadas con éxito a ${data.campaign?.sentCount || 'todos los'} suscriptores!`
        );
        return;
      }
    } catch {
      // Fallback
    }
    const activeSubsCount = (db.subscriberRecords || []).filter(
      (s) => s.status === 'active'
    ).length;
    setDb((prev) => ({
      ...prev,
      campaigns: (prev.campaigns || []).map((c) =>
        c.id === campaignId
          ? {
              ...c,
              status: 'sent',
              sentCount: Math.max(1, activeSubsCount),
              openRate: 69.5,
              clickRate: 25.2,
              sentAt: new Date().toISOString().slice(0, 10),
            }
          : c
      ),
    }));
    showToast('¡Campaña y Alerta Push enviadas a los suscriptores activos!');
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    setDb((prev) => ({
      ...prev,
      campaigns: (prev.campaigns || []).filter((c) => c.id !== campaignId),
    }));
    await fetch(`/api/campaigns/${campaignId}`, { method: 'DELETE' }).catch(() => {});
    showToast('Campaña eliminada');
  };

  const handleSendPushNotification = async (
    payload: Partial<PushNotificationItem>
  ) => {
    try {
      const res = await fetch('/api/push-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setDb((prev) => ({
          ...prev,
          pushNotifications: data.pushNotifications || prev.pushNotifications,
        }));
        if (data.pushNotification) {
          triggerLivePushAlert(data.pushNotification);
          showToast(
            `Notificación Push enviada en tiempo real a ${data.pushNotification.recipientCount} suscriptores`
          );
          return;
        }
      }
    } catch {
      // Fallback local push creation
    }
    const fallbackPush: PushNotificationItem = {
      id: `push-${Date.now()}`,
      type: payload.type || 'custom_alert',
      title: payload.title || 'Alerta Editorial Kayleen',
      body:
        payload.body ||
        'Descubre las últimas novedades publicadas en nuestro magazine.',
      category: payload.category || 'Kayleen Push',
      imageUrl: payload.imageUrl || undefined,
      targetArticleId: payload.targetArticleId,
      targetCampaignId: payload.targetCampaignId,
      ctaText: payload.ctaText || 'Ver ahora',
      segment: payload.segment || 'active',
      recipientCount: Math.max(
        1,
        (db.subscriberRecords || []).filter(
          (s) => s.status === 'active' && s.pushEnabled !== false
        ).length
      ),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setDb((prev) => ({
      ...prev,
      pushNotifications: [fallbackPush, ...(prev.pushNotifications || [])],
    }));
    triggerLivePushAlert(fallbackPush);
    showToast(
      `Notificación Push enviada en tiempo real a ${fallbackPush.recipientCount} suscriptores`
    );
  };

  const handleDeletePushNotification = async (id: string) => {
    setDb((prev) => ({
      ...prev,
      pushNotifications: (prev.pushNotifications || []).filter(
        (p) => p.id !== id
      ),
    }));
    await fetch(`/api/push-notifications/${id}`, { method: 'DELETE' }).catch(
      () => {}
    );
    showToast('Registro de notificación push eliminado');
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    const cleanEmail = newsletterEmail.trim().toLowerCase();
    if (newsletterPushOptIn && !isPushSubscribed) {
      await requestBrowserPushPermission();
      setBrowserPushSubscribedLocal(true);
      setIsPushSubscribed(true);
    }
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          pushEnabled: newsletterPushOptIn,
          pushDeviceLabel: newsletterPushOptIn
            ? 'Web Push (Browser Activo)'
            : 'Sin Push',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDb((prev) => ({
          ...prev,
          subscribers: data.subscribers || prev.subscribers,
          subscriberRecords: data.subscriberRecords || prev.subscriberRecords,
        }));
      }
    } catch {
      const newRecord: SubscriberItem = {
        id: `sub-${Date.now()}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        status: 'active',
        source: 'Footer Home 03',
        tags: newsletterPushOptIn ? ['Newsletter', 'Web Push'] : ['Newsletter'],
        joinedAt: new Date().toISOString().slice(0, 10),
        pushEnabled: newsletterPushOptIn,
        pushDeviceLabel: newsletterPushOptIn
          ? 'Web Push (Browser Activo)'
          : 'Sin Push',
      };
      setDb((prev) => ({
        ...prev,
        subscribers: prev.subscribers.includes(cleanEmail)
          ? prev.subscribers
          : [...prev.subscribers, cleanEmail],
        subscriberRecords: [newRecord, ...(prev.subscriberRecords || [])],
      }));
    }
    setNewsletterEmail('');
    setNewsletterSuccess(true);
    showToast(
      newsletterPushOptIn
        ? '¡Suscripción al Newsletter y Notificaciones Push activadas!'
        : 'Suscripción al newsletter confirmada'
    );
  };

  // Floating Live Browser Push Alert Card (rendered on both Public Blog and Admin Dashboard)
  const renderLivePushBanner = () => {
    if (!activePushBanner) return null;
    return (
      <div className="fixed top-5 right-5 z-50 w-[350px] sm:w-[390px] bg-[#171920] text-white rounded-[14px] shadow-2xl border border-white/15 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <BellRing className="w-3.5 h-3.5 text-[#FF2C54]" />
            <span className="font-bold tracking-wide uppercase text-white/90">
              {siteConfig.logoText || 'Kayleen'} · Browser Push
            </span>
            <span className="text-white/50">ahora</span>
          </div>
          <button
            type="button"
            onClick={() => setActivePushBanner(null)}
            className="text-white/60 hover:text-white p-0.5 cursor-pointer"
            title="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 flex gap-3.5 items-start">
          {activePushBanner.imageUrl ? (
            <img
              src={activePushBanner.imageUrl}
              alt=""
              className="w-14 h-14 rounded-[10px] object-cover shrink-0 border border-white/10"
            />
          ) : (
            <div className="w-12 h-12 rounded-[10px] bg-[#FF2C54]/20 border border-[#FF2C54]/40 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-[#FF2C54]" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  activePushBanner.type === 'new_article'
                    ? 'bg-[#FF2C54] text-white'
                    : activePushBanner.type === 'new_campaign'
                    ? 'bg-[#5960FF] text-white'
                    : 'bg-white/15 text-white'
                }`}
              >
                {activePushBanner.type === 'new_article'
                  ? 'Nuevo Artículo'
                  : activePushBanner.type === 'new_campaign'
                  ? 'Nueva Campaña'
                  : activePushBanner.category || 'Alerta Push'}
              </span>
              <span className="text-[10px] text-white/60 font-mono">
                {activePushBanner.recipientCount} suscriptores
              </span>
            </div>

            <h4 className="text-xs font-bold text-white leading-snug mb-1 line-clamp-2">
              {activePushBanner.title}
            </h4>
            <p className="text-[11px] text-white/75 leading-relaxed line-clamp-2 mb-2.5">
              {activePushBanner.body}
            </p>

            <div className="flex items-center gap-2">
              {activePushBanner.targetArticleId ? (
                <button
                  type="button"
                  onClick={() => {
                    const targetId = activePushBanner.targetArticleId!;
                    setActivePushBanner(null);
                    openArticle(targetId);
                  }}
                  className="px-3 py-1 rounded-[6px] bg-[#FF2C54] hover:bg-[#e02247] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {activePushBanner.ctaText || 'Leer Artículo →'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActivePushBanner(null);
                    setView({ type: 'home', categoryFilter: null });
                  }}
                  className="px-3 py-1 rounded-[6px] bg-[#5960FF] hover:bg-[#474ee8] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {activePushBanner.ctaText || 'Ver Novedad →'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setActivePushBanner(null)}
                className="px-2.5 py-1 rounded-[6px] bg-white/10 hover:bg-white/15 text-white/80 text-[11px] font-medium transition-colors cursor-pointer"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Dashboard View if active
  if (view.type === 'dashboard') {
    return (
      <>
        {renderLivePushBanner()}
        <AdminDashboardView
          db={db}
          currentUser={currentUser}
          initialTab={view.tab}
          onBackToBlog={() => setView({ type: 'home', categoryFilter: null })}
          onViewArticle={(id) => openArticle(id)}
          onViewAuthor={(id) => openAuthor(id)}
          onOpenPublicLegalPage={(sec) => {
            setView({ type: 'legal', section: sec || 'privacy' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAuthModal={(mode, group) => openAuthModal(mode, group)}
          onLogout={handleLogout}
          onSaveArticle={handleSaveArticle}
          onToggleArticleStatus={handleToggleArticleStatus}
          onDeleteArticle={handleDeleteArticle}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          onUpdateCommentStatus={handleUpdateCommentStatus}
          onDeleteComment={handleDeleteComment}
          onCreateUser={handleCreateUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onSaveSiteConfig={handleSaveSiteConfig}
          onSaveSubscriber={handleSaveSubscriber}
          onUpdateSubscriber={handleUpdateSubscriber}
          onDeleteSubscriber={handleDeleteSubscriber}
          onSaveCampaign={handleSaveCampaign}
          onSendCampaign={handleSendCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          onSendPushNotification={handleSendPushNotification}
          onDeletePushNotification={handleDeletePushNotification}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          users={db.users}
          initialMode={authModalMode}
          initialAccessGroup={authModalGroup}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onOpenFullReaderRegister={() => {
            setView({ type: 'register' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#171920] text-white px-4 py-3 rounded-[10px] text-xs font-medium shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#FF2C54]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // =========================================================================
  // MAP ARTICLES TO EXACT KAYLEEN HOME 03 SECTIONS
  // =========================================================================
  // 1. Section 69c40c6: Hero Tiles Layout 11 (3 items: 1 large 2x2 left + 2 right)
  const heroTilesArticles = publishedArticles.filter((a) => a.featuredHero).slice(0, 3);
  while (heroTilesArticles.length < 3 && publishedArticles.length >= 3) {
    const candidate = publishedArticles.find((a) => !heroTilesArticles.some((h) => h.id === a.id));
    if (candidate) heroTilesArticles.push(candidate);
    else break;
  }

  // 2. Section 510785e: Editor's Pick (3 tall vertical portrait cards)
  const editorsPickArticles = publishedArticles
    .filter((a) => !heroTilesArticles.some((h) => h.id === a.id))
    .slice(0, 3);

  // 3. Section 4cc7931 / d2cb69c: Main Stream Modern Posts (Col-66) with Pagination
  const allMainStreamArticles = publishedArticles.filter(
    (a) =>
      !heroTilesArticles.some((h) => h.id === a.id) &&
      !editorsPickArticles.some((e) => e.id === a.id)
  );
  const postsPerPage = siteConfig.postsPerPage || 6;
  const totalPages = Math.max(1, Math.ceil(allMainStreamArticles.length / postsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedMainStreamArticles = allMainStreamArticles.slice(
    (safePage - 1) * postsPerPage,
    safePage * postsPerPage
  );

  // 4. Header 4-Col Mega-Menu Posts (7535fd1) & Sidebar Featured Carousel (c8a3b47)
  const headerFourPosts = publishedArticles.slice(-4);
  const sidebarCarouselPosts = [
    publishedArticles[1] || publishedArticles[0],
    publishedArticles[publishedArticles.length - 1] || publishedArticles[0],
  ].filter(Boolean);
  const activeCarouselPost =
    sidebarCarouselPosts[sidebarCarouselIdx % Math.max(1, sidebarCarouselPosts.length)];

  // Alice Qelvin for the Sidebar Author Widget (9c1f14f)
  const sidebarAuthor = db.users[0];

  // Category / Search Filtering
  const activeCategoryFilter = view.type === 'home' ? view.categoryFilter : null;
  const isFiltering = Boolean(activeCategoryFilter || searchQuery.trim() !== '');
  const filteredHomeArticles = publishedArticles.filter((art) => {
    const matchesCategory = !activeCategoryFilter || art.category === activeCategoryFilter;
    const q = searchQuery.trim().toLowerCase();
    const coNames = getCoAuthors(art)
      .map((u) => u.name.toLowerCase())
      .join(' ');
    const matchesQuery =
      !q ||
      art.title.toLowerCase().includes(q) ||
      art.excerpt.toLowerCase().includes(q) ||
      art.category.toLowerCase().includes(q) ||
      getAuthor(art.authorId).name.toLowerCase().includes(q) ||
      coNames.includes(q);
    return matchesCategory && matchesQuery;
  });

  // Top 3 dynamic categories for the 5-item Top Bar Contract
  const navCategories = categoriesList.slice(0, 3);

  return (
    <div
      className="min-h-screen flex flex-col text-[#4b546e] transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-page-bg, #ffffff)' }}
    >
      {/* Optional Configurable Top Promotional Banner */}
      {siteConfig.promoBannerEnabled && siteConfig.promoBannerText && (
        <div
          className="text-white text-xs font-medium py-2 px-4 text-center flex items-center justify-center gap-3"
          style={{
            backgroundColor:
              siteConfig.promoBannerColor ||
              siteConfig.primaryAccentColor ||
              '#171920',
          }}
        >
          <span>{siteConfig.promoBannerText}</span>
          {siteConfig.promoBannerCta && (
            <a
              href="#site-footer"
              className="px-2.5 py-0.5 rounded text-[11px] font-bold text-white"
              style={{ backgroundColor: siteConfig.primaryAccentColor || '#FF2C54' }}
            >
              {siteConfig.promoBannerCta}
            </a>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TOP ACCOUNT, LOGIN, REGISTER & ADMIN QUICK ACCESS BAR                 */}
      {/* ===================================================================== */}
      <div className="bg-[#171920] text-white text-xs border-b border-white/10">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Account Status & Direct Login / Switch Role Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {currentUser ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white font-semibold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Sesión activa:</span>
                  <strong className="text-white">{currentUser.name}</strong>
                  <span className="px-1.5 py-0.2 rounded bg-[#FF2C54] text-white text-[10px] uppercase font-bold">
                    {currentUser.role === 'admin'
                      ? 'Admin'
                      : currentUser.role === 'editor'
                      ? 'Editor'
                      : currentUser.role === 'author'
                      ? 'Autor'
                      : currentUser.isPremium
                      ? 'Lector Premium ★'
                      : 'Lector Free'}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => openAuthModal('login', 'reader')}
                  className="px-2.5 py-1 rounded-[6px] bg-white/10 hover:bg-[#5960FF] text-white text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Iniciar sesión o cambiar a una cuenta de Usuario / Lector"
                >
                  <LogIn className="w-3 h-3 text-[#5960FF] group-hover:text-white" />
                  <span>Login Usuarios</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('login', 'admin')}
                  className="px-2.5 py-1 rounded-[6px] bg-white/10 hover:bg-[#FF2C54] text-white text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Iniciar sesión o cambiar a una cuenta de Administración"
                >
                  <ShieldCheck className="w-3 h-3 text-[#FF2C54]" />
                  <span>Login Administración</span>
                </button>
              </>
            ) : (
              <>
                <span className="text-white/75 text-[11px]">
                  Bienvenido a Kayleen Magazine · Inicia sesión o crea tu cuenta:
                </span>
                <button
                  type="button"
                  onClick={() => openAuthModal('login', 'reader')}
                  className="px-2.5 py-1 rounded-[6px] bg-[#5960FF] hover:bg-[#474ee8] text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Login Usuarios</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('login', 'admin')}
                  className="px-2.5 py-1 rounded-[6px] bg-white/15 hover:bg-[#FF2C54] text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3 text-[#FF2C54]" />
                  <span>Login Administración</span>
                </button>
              </>
            )}
          </div>

          {/* Right: Registration, Legal Policies Editor & Prominent Logout */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openAuthModal('register', 'reader')}
              className="px-2.5 py-1 rounded-[6px] bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3 h-3 text-amber-400" />
              <span>Registro Rápido</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setView({ type: 'register' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-2.5 py-1 rounded-[6px] bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors hidden sm:inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Página de Registro Lector</span>
            </button>

            <button
              type="button"
              onClick={() => openDashboard('color_palette')}
              className="px-2.5 py-1 rounded-[6px] bg-[#5960FF]/20 border border-[#5960FF]/50 hover:bg-[#5960FF] text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="Abrir Editor Global de Paleta de Colores en el Panel Administrativo (Variables CSS)"
            >
              <Palette className="w-3 h-3" />
              <span>Paleta de Colores</span>
            </button>

            <button
              type="button"
              onClick={() => openDashboard('legal_pages')}
              className="px-2.5 py-1 rounded-[6px] bg-[#FF2C54]/20 border border-[#FF2C54]/50 hover:bg-[#FF2C54] text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="Editar Políticas de Privacidad, Devolución, Términos y Aviso Legal"
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar Políticas Legales</span>
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1 rounded-[6px] bg-[#DC2626] hover:bg-red-700 text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                title="Cerrar sesión de la cuenta actual (Logout)"
              >
                <LogOut className="w-3 h-3" />
                <span>Cerrar Sesión (Logout)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TOP BAR CONTRACT: Strictly 1 Row, 3 Zones separated by gap-8          */}
      {/* Zone 1: Kayleen Wordmark | Zone 2: 5 Nav Links | Zone 3: Primary CTA  */}
      {/* ===================================================================== */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xs border-b border-[#dcdfe7]"
        style={{ backgroundColor: siteConfig.pageBackgroundColor || '#ffffff' }}
      >
        <div className="max-w-[1240px] mx-auto px-5 sm:px-6 h-20 flex items-center justify-between gap-6">
          {/* Zone 1: Single text element wordmark or custom uploaded image logo */}
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setView({ type: 'home', categoryFilter: null });
            }}
            className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#171920] whitespace-nowrap shrink-0 cursor-pointer flex items-center"
          >
            {siteConfig.useImageLogo && siteConfig.logoImageUrl ? (
              <img
                src={siteConfig.logoImageUrl}
                alt={siteConfig.logoText || 'Logo'}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <>
                {siteConfig.logoText || 'Kayleen'}
                <span style={{ color: siteConfig.logoDotColor || '#FF2C54' }}>.</span>
              </>
            )}
          </button>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#171920]">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setView({ type: 'home', categoryFilter: null });
              }}
              className="hover:opacity-80 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              style={
                view.type === 'home' && !activeCategoryFilter
                  ? { color: siteConfig.primaryAccentColor || '#FF2C54' }
                  : undefined
              }
            >
              Home 03
            </button>
            {navCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setView({ type: 'home', categoryFilter: cat.name })}
                className="hover:opacity-80 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                style={
                  activeCategoryFilter === cat.name
                    ? { color: siteConfig.primaryAccentColor || '#FF2C54' }
                    : undefined
                }
              >
                {cat.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => openAuthor(null)}
              className="hover:opacity-80 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              style={
                view.type === 'author'
                  ? { color: siteConfig.primaryAccentColor || '#FF2C54' }
                  : undefined
              }
            >
              Autores
            </button>
          </nav>

          {/* Zone 3: Push Notification Bell + Subscriptions + Login/Register/Admin/Logout */}
          <div className="flex items-center gap-2.5 shrink-0 relative">
            {/* Browser Push Notification Center Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsPushDropdownOpen((prev) => !prev);
                  const allIds = (db.pushNotifications || []).map((n) => n.id);
                  setReadPushIds(allIds);
                }}
                className={`relative p-2.5 rounded-[10px] border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isPushSubscribed
                    ? 'bg-[#f7f8fc] border-[#dcdfe7] text-[#171920] hover:border-[#FF2C54]'
                    : 'bg-white border-[#dcdfe7] text-[#595F71] hover:text-[#171920]'
                }`}
                title="Notificaciones Push del Navegador (Artículos y Campañas)"
              >
                {isPushSubscribed ? (
                  <BellRing className="w-4 h-4 text-[#FF2C54]" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                {(db.pushNotifications || []).filter(
                  (n) => !readPushIds.includes(n.id)
                ).length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#FF2C54] text-white text-[9px] font-bold flex items-center justify-center">
                    {
                      (db.pushNotifications || []).filter(
                        (n) => !readPushIds.includes(n.id)
                      ).length
                    }
                  </span>
                )}
              </button>

              {/* Browser Push Notification Dropdown Panel */}
              {isPushDropdownOpen && (
                <div className="absolute right-0 mt-2 w-[340px] sm:w-[380px] bg-white border border-[#dcdfe7] rounded-[15px] shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 bg-[#171920] text-white flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <BellRing className="w-4 h-4 text-[#FF2C54]" />
                        <h4 className="text-xs font-bold text-white">
                          Notificaciones Push en el Navegador
                        </h4>
                      </div>
                      <p className="text-[11px] text-white/70 mt-0.5">
                        Alertas de nuevos artículos y campañas editoriales
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPushDropdownOpen(false)}
                      className="text-white/60 hover:text-white p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subscriber Browser Push Opt-In Bar */}
                  <div className="px-4 py-3 bg-[#f7f8fc] border-b border-[#dcdfe7] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isPushSubscribed ? 'bg-[#16A34A]' : 'bg-[#D97706]'
                        }`}
                      />
                      <span className="text-[11px] font-semibold text-[#171920]">
                        {isPushSubscribed
                          ? 'Push Activo en este Navegador'
                          : 'Activar Alertas Push en Navegador'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleBrowserPushSubscription}
                      className={`px-3 py-1 rounded-[7px] text-[11px] font-bold transition-colors cursor-pointer ${
                        isPushSubscribed
                          ? 'bg-white border border-[#dcdfe7] text-[#595F71] hover:text-[#DC2626]'
                          : 'bg-[#FF2C54] text-white hover:bg-[#e02247]'
                      }`}
                    >
                      {isPushSubscribed ? 'Desactivar' : 'Suscribirme'}
                    </button>
                  </div>

                  {/* Recent Push Notifications Feed */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#dcdfe7]">
                    {(db.pushNotifications || []).length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#595F71]">
                        No hay notificaciones push recientes.
                      </div>
                    ) : (
                      (db.pushNotifications || []).slice(0, 8).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setIsPushDropdownOpen(false);
                            if (item.targetArticleId) {
                              openArticle(item.targetArticleId);
                            } else {
                              triggerLivePushAlert(item);
                            }
                          }}
                          className="p-3.5 hover:bg-[#f7f8fc] transition-colors cursor-pointer flex gap-3 items-start"
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="w-11 h-11 rounded-[8px] object-cover shrink-0 border border-[#dcdfe7]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-[8px] bg-[#FF2C54]/10 text-[#FF2C54] flex items-center justify-center shrink-0">
                              <BellRing className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  item.type === 'new_article'
                                    ? 'bg-[#FF2C54]/10 text-[#FF2C54]'
                                    : item.type === 'new_campaign'
                                    ? 'bg-[#5960FF]/10 text-[#5960FF]'
                                    : 'bg-[#171920]/10 text-[#171920]'
                                }`}
                              >
                                {item.type === 'new_article'
                                  ? 'Nuevo Artículo'
                                  : item.type === 'new_campaign'
                                  ? 'Nueva Campaña'
                                  : 'Alerta'}
                              </span>
                              <span className="text-[10px] text-[#595F71] font-mono">
                                {item.createdAt}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-[#171920] line-clamp-1">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-[#595F71] line-clamp-2 mt-0.5">
                              {item.body}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-[#f7f8fc] border-t border-[#dcdfe7] flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        const latest = (db.pushNotifications || [])[0];
                        if (latest) {
                          triggerLivePushAlert(latest);
                          setIsPushDropdownOpen(false);
                        }
                      }}
                      className="font-semibold text-[#5960FF] hover:underline cursor-pointer"
                    >
                      Probar Alerta en Vivo
                    </button>
                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsPushDropdownOpen(false);
                          openDashboard('subscribers');
                        }}
                        className="font-semibold text-[#171920] hover:text-[#FF2C54] cursor-pointer"
                      >
                        Gestionar en Panel →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Premium Subscription Link */}
            <button
              type="button"
              onClick={() => {
                setView({ type: 'subscriptions' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-[8px] transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Ver planes de pago y suscribirme como Lector Premium"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Planes Premium</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                {(currentUser.role === 'admin' ||
                  currentUser.role === 'editor' ||
                  currentUser.role === 'moderator' ||
                  currentUser.role === 'author') && (
                  <button
                    type="button"
                    onClick={() => openDashboard('articles')}
                    className="px-3 py-2 text-xs font-semibold text-[#171920] bg-[#f7f8fc] border border-[#dcdfe7] hover:border-[#171920] rounded-[8px] transition-colors whitespace-nowrap shrink-0 cursor-pointer hidden md:inline-flex items-center gap-1.5"
                    title="Crear o redactar un nuevo artículo con Modo Escritura"
                  >
                    <span>✍️</span>
                    <span>Nuevo Artículo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openDashboard('overview')}
                  className="px-3.5 py-2 text-xs font-semibold text-white hover:opacity-90 rounded-[8px] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  style={{ backgroundColor: siteConfig.primaryAccentColor || '#FF2C54' }}
                >
                  Panel Editorial
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('login', 'all')}
                  className="px-2.5 py-2 text-xs font-semibold text-[#171920] bg-white border border-[#dcdfe7] hover:border-[#5960FF] rounded-[8px] transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1"
                  title="Cambiar de cuenta o iniciar sesión con otro usuario"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#5960FF]" />
                  <span className="hidden xl:inline">Cambiar Cuenta</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 text-xs font-bold text-[#DC2626] bg-red-50 border border-red-200 hover:bg-[#DC2626] hover:text-white rounded-[8px] transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1"
                  title="Cerrar sesión (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setView({ type: 'register' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-2 text-xs font-bold text-[#FF2C54] bg-[#FF2C54]/10 hover:bg-[#FF2C54]/20 rounded-[8px] transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrarse</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('login', 'all')}
                  className="px-3.5 py-2 text-xs font-bold text-white hover:opacity-90 rounded-[8px] transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5"
                  style={{ backgroundColor: siteConfig.secondaryAccentColor || '#5960FF' }}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* KAYLEEN UTILITY SUB-BAR & 4-COLUMN HEADER POSTS SHOWCASE (7535fd1)    */}
      {/* ===================================================================== */}
      <div
        className="border-b border-[#dcdfe7]"
        style={{ backgroundColor: siteConfig.surfaceBackgroundColor || '#f7f8fc' }}
      >
        <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Offcanvas Trigger, Mega-Menu 4-Col Toggle & Search */}
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
            <button
              type="button"
              onClick={() => setIsOffcanvasOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#171920] bg-white border border-[#dcdfe7] rounded-[8px] hover:border-[#FF2C54] transition-colors cursor-pointer"
              title="Abrir panel lateral Kayleen Offcanvas"
            >
              <Menu className="w-3.5 h-3.5 text-[#FF2C54]" />
              <span>Offcanvas</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHeaderFeaturedBar((prev) => !prev)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[8px] border transition-colors cursor-pointer ${
                showHeaderFeaturedBar
                  ? 'bg-[#5960FF] text-white border-[#5960FF]'
                  : 'bg-white text-[#4b546e] border-[#dcdfe7] hover:border-[#5960FF]'
              }`}
            >
              Destacados del Menú (4)
            </button>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#595F71] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type and hit Enter to search..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
              />
            </div>

            {isFiltering && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setView({ type: 'home', categoryFilter: null });
                }}
                className="text-xs font-semibold text-[#FF2C54] hover:underline cursor-pointer"
              >
                Restablecer Home 03
              </button>
            )}
          </div>

          {/* Right: Active User Session, Legal Editor, Comment Moderation & Logout */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {currentUser ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openAuthModal('login', 'all')}
                  className="inline-flex items-center gap-1.5 text-[#171920] hover:text-[#FF2C54] cursor-pointer"
                  title="Haz clic para cambiar de usuario o rol"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#FF2C54]" />
                  <span>
                    <strong>{currentUser.name}</strong> ({currentUser.role})
                  </span>
                </button>
                <span className="text-[#dcdfe7]" aria-hidden="true">
                  |
                </span>
                <button
                  type="button"
                  onClick={() => openDashboard('legal_pages')}
                  className="inline-flex items-center gap-1 font-semibold text-[#FF2C54] hover:underline cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Editar Políticas Legales</span>
                </button>
                <span className="text-[#dcdfe7]" aria-hidden="true">
                  |
                </span>
                <button
                  type="button"
                  onClick={() => openDashboard('profile_settings')}
                  className="inline-flex items-center gap-1 text-[#4b546e] hover:text-[#FF2C54] cursor-pointer"
                >
                  <span>Mi Perfil</span>
                </button>
                <span className="text-[#dcdfe7]" aria-hidden="true">
                  |
                </span>
                <button
                  type="button"
                  onClick={() => openDashboard('comments')}
                  className="inline-flex items-center gap-1.5 text-[#4b546e] hover:text-[#FF2C54] cursor-pointer tabular-nums"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF2C54]" />
                  <span>Moderación ({pendingCommentsCount} pend.)</span>
                </button>
                <span className="text-[#dcdfe7]" aria-hidden="true">
                  |
                </span>
                <button
                  type="button"
                  onClick={() => openDashboard('site_settings')}
                  className="inline-flex items-center gap-1 text-[#4b546e] hover:text-[#FF2C54] cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-[#FF2C54]" />
                  <span>Configuración</span>
                </button>
                <span className="text-[#dcdfe7]" aria-hidden="true">
                  |
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 font-bold text-[#DC2626] hover:underline cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => openAuthModal('login', 'reader')}
                  className="font-semibold text-[#5960FF] hover:underline cursor-pointer"
                >
                  Login Usuarios
                </button>
                <span className="text-[#dcdfe7]">|</span>
                <button
                  type="button"
                  onClick={() => openAuthModal('login', 'admin')}
                  className="font-semibold text-[#FF2C54] hover:underline cursor-pointer"
                >
                  Login Administración
                </button>
                <span className="text-[#dcdfe7]">|</span>
                <button
                  type="button"
                  onClick={() => openAuthModal('register', 'reader')}
                  className="font-semibold text-[#171920] hover:text-[#FF2C54] cursor-pointer"
                >
                  Crear Cuenta
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Kayleen Elementor 7535fd1 / e1bc83f: 4-Column Header Featured Posts Grid */}
        {showHeaderFeaturedBar && (
          <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-5 border-t border-[#dcdfe7] bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {headerFourPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => openArticle(post.id)}
                  className="group cursor-pointer text-center"
                >
                  <div className="rounded-[12px] overflow-hidden mb-2.5 h-36 shadow-xs">
                    <EditorialVisual
                      preset={post.visualPreset}
                      customImageUrl={post.customImageUrl}
                      alt={post.title}
                      aspectRatio="fill"
                      className="w-full h-full"
                    />
                  </div>
                  <h5 className="text-sm font-semibold text-[#171920] group-hover:text-[#FF2C54] transition-colors px-1 leading-snug">
                    <span className="title-animation-underline-in-out">{post.title}</span>
                  </h5>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* KAYLEEN OFFCANVAS DRAWER (cab6652 / 6167397)                          */}
      {/* ===================================================================== */}
      {isOffcanvasOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-start">
          <div className="w-full max-w-sm bg-white h-full overflow-y-auto p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#dcdfe7]">
                <span className="text-2xl font-bold text-[#171920] flex items-center">
                  {siteConfig.useImageLogo && siteConfig.logoImageUrl ? (
                    <img
                      src={siteConfig.logoImageUrl}
                      alt={siteConfig.logoText || 'Logo'}
                      className="h-8 w-auto object-contain"
                    />
                  ) : (
                    <>
                      {siteConfig.logoText || 'Kayleen'}
                      <span style={{ color: siteConfig.logoDotColor || '#FF2C54' }}>.</span>
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOffcanvasOpen(false)}
                  className="p-2 text-[#595F71] hover:text-[#FF2C54] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 Mini Posts inside Offcanvas (Exactly like Kayleen Home 03 6167397) */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#595F71] mb-3">
                  Historias Destacadas
                </h4>
                {publishedArticles.slice(6, 10).map((art) => (
                  <div
                    key={art.id}
                    onClick={() => openArticle(art.id)}
                    className="group flex items-center gap-3.5 cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-[10px] overflow-hidden shrink-0">
                      <EditorialVisual
                        preset={art.visualPreset}
                        customImageUrl={art.customImageUrl}
                        alt={art.title}
                        aspectRatio="fill"
                        className="w-16 h-16"
                      />
                    </div>
                    <h5 className="text-xs font-semibold text-[#171920] group-hover:text-[#FF2C54] transition-colors leading-snug">
                      <span className="title-animation-underline-in-out">{art.title}</span>
                    </h5>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#dcdfe7] space-y-2">
              <button
                type="button"
                onClick={() => {
                  setView({ type: 'subscriptions' });
                  setIsOffcanvasOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Planes de Suscripción Premium</span>
              </button>

              {!currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    setView({ type: 'register' });
                    setIsOffcanvasOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 px-4 text-xs font-bold text-[#FF2C54] bg-[#FF2C54]/10 hover:bg-[#FF2C54]/20 rounded-[8px] transition-colors cursor-pointer"
                >
                  Registrarme como Lector
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setView({ type: 'legal', section: 'privacy' });
                  setIsOffcanvasOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2 px-4 text-xs font-semibold text-[#4b546e] hover:text-[#171920] bg-white border border-[#dcdfe7] rounded-[8px] transition-colors cursor-pointer"
              >
                Políticas de Privacidad &amp; Legal
              </button>

              <button
                type="button"
                onClick={() => openDashboard('overview')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#171920] hover:bg-[#FF2C54] rounded-[8px] transition-colors cursor-pointer"
              >
                Ir al Dashboard Administrativo
              </button>
              <button
                type="button"
                onClick={() => openDashboard('categories')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-[#171920] bg-[#f7f8fc] border border-[#dcdfe7] hover:border-[#FF2C54] rounded-[8px] transition-colors cursor-pointer"
              >
                Gestionar Categorías
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsOffcanvasOpen(false)} />
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW ROUTING: ARTICLE DETAIL | AUTHOR PROFILE | KAYLEEN HOME 03       */}
      {/* ===================================================================== */}
      {view.type === 'article' ? (
        (() => {
          const art =
            db.articles.find((a) => a.id === view.articleId) || publishedArticles[0];
          const aut = getAuthor(art.authorId);
          return (
            <ArticleDetailView
              article={art}
              author={aut}
              allArticles={publishedArticles}
              allUsers={db.users}
              comments={db.comments}
              currentUser={currentUser}
              subscriptionPlans={db.subscriptionPlans || []}
              onBack={() => setView({ type: 'home', categoryFilter: null })}
              onSelectArticle={(id) => openArticle(id)}
              onSelectAuthor={(id) => openAuthor(id)}
              onOpenSubscriptionModal={() => {
                setView({ type: 'subscriptions' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShare={handleShareArticle}
              onLike={handleLikeArticle}
              onDislike={handleDislikeArticle}
              onSubmitComment={handleSubmitComment}
              onApproveComment={(cmtId) => handleUpdateCommentStatus(cmtId, 'approved')}
              onOpenAdminComments={() => openDashboard('comments')}
            />
          );
        })()
      ) : view.type === 'author' ? (
        <AuthorProfileView
          selectedAuthorId={view.authorId}
          users={db.users}
          articles={publishedArticles}
          onSelectAuthor={(id) => openAuthor(id)}
          onSelectArticle={(id) => openArticle(id)}
          onShare={handleShareArticle}
          onBackHome={() => setView({ type: 'home', categoryFilter: null })}
        />
      ) : view.type === 'subscriptions' ? (
        <SubscriptionPlansView
          currentUser={currentUser}
          subscriptionPlans={db.subscriptionPlans || []}
          premiumArticles={db.articles.filter((a) => a.isPremium)}
          onBack={() => {
            setView({ type: 'home', categoryFilter: null });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectArticle={(id) => openArticle(id)}
          onSubscribeUser={handleSubscribeUser}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onOpenRegister={() => {
            setView({ type: 'register' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenLegal={(sec) => {
            setView({ type: 'legal', section: sec });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : view.type === 'register' ? (
        <ReaderRegisterView
          categories={db.categories || []}
          siteConfig={db.siteConfig}
          onRegisterReader={handleRegisterReader}
          onBack={() => {
            setView({ type: 'home', categoryFilter: null });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onOpenSubscriptions={() => {
            setView({ type: 'subscriptions' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenLegal={(sec) => {
            setView({ type: 'legal', section: sec });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : view.type === 'legal' ? (
        <LegalPagesView
          initialSection={view.section || 'privacy'}
          siteConfig={db.siteConfig}
          currentUser={currentUser}
          onBack={() => {
            setView({ type: 'home', categoryFilter: null });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenSubscriptions={() => {
            setView({ type: 'subscriptions' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenRegister={() => {
            setView({ type: 'register' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSaveSiteConfig={handleSaveSiteConfig}
          onOpenAdminLegalEditor={() => openDashboard('legal_pages')}
        />
      ) : (
        <main className="flex-1">
          {isFiltering ? (
            /* Filtered Category / Search Results */
            <section className="max-w-[1240px] mx-auto px-5 sm:px-6 py-12">
              <div className="flex items-center justify-between pb-4 mb-8 border-b border-[#dcdfe7]">
                <div>
                  <div className="rivax-divider-heading mb-1">
                    <div className="divider-1" />
                    <div className="divider-2" />
                    <span className="text-xs uppercase tracking-wider text-[#FF2C54] font-semibold">
                      Archivo Kayleen
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#171920]">
                    {activeCategoryFilter
                      ? `Categoría: ${activeCategoryFilter}`
                      : `Resultados para “${searchQuery}”`}
                  </h2>
                </div>
                <span className="text-xs font-mono tabular-nums text-[#595F71]">
                  {filteredHomeArticles.length} artículo(s)
                </span>
              </div>

              {filteredHomeArticles.length === 0 ? (
                <div className="p-12 text-center border border-[#dcdfe7] rounded-[15px] bg-[#f7f8fc]">
                  <p className="text-sm text-[#4b546e] mb-4">
                    No se encontraron artículos para ese criterio.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setView({ type: 'home', categoryFilter: null });
                    }}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#FF2C54] rounded-[8px] cursor-pointer"
                  >
                    Ver Todos los Artículos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {filteredHomeArticles.map((art) => {
                    const aut = getAuthor(art.authorId);
                    const coAuts = getCoAuthors(art);
                    const cmtCount = getApprovedCommentCount(art.id);
                    return (
                      <article
                        key={art.id}
                        onClick={() => openArticle(art.id)}
                        className="group border border-[#dcdfe7] rounded-[15px] overflow-hidden bg-white flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
                      >
                        <div>
                          <EditorialVisual
                            preset={art.visualPreset}
                            customImageUrl={art.customImageUrl}
                            alt={art.title}
                            aspectRatio="4:3"
                          />
                          <div className="p-6">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#595F71] mb-2">
                              <span className="text-[#FF2C54] font-semibold">
                                {art.category}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{art.publishedAt}</span>
                              <span aria-hidden="true">·</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAuthor(aut.id);
                                }}
                                className="text-[#171920] font-medium hover:text-[#FF2C54] cursor-pointer"
                              >
                                {aut.name}
                              </button>
                              {coAuts.length > 0 && (
                                <span className="text-[#5960FF] font-medium">
                                  +{coAuts.length} colab.
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-[#171920] group-hover:text-[#FF2C54] transition-colors leading-snug mb-2.5">
                              <span className="title-animation-underline-in-out">
                                {art.title}
                              </span>
                            </h3>
                            <p className="text-sm text-[#4b546e] line-clamp-3 leading-relaxed">
                              {art.excerpt}
                            </p>
                          </div>
                        </div>
                        <div className="px-6 py-3.5 border-t border-[#dcdfe7] flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs text-[#595F71] tabular-nums">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{cmtCount}</span>
                          </span>
                          <SocialShareBar
                            article={art}
                            onShare={handleShareArticle}
                            compact
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          ) : (
            <>
              {/* ============================================================= */}
              {/* SECTION 1 (69c40c6): HERO .tiles-layout-11                    */}
              {/* 1 Large 2x2 Left Tile + 2 Stacked 1x1 Right Tiles             */}
              {/* ============================================================= */}
              <section
                data-id="69c40c6"
                className="max-w-[1240px] mx-auto px-5 sm:px-6 pt-8 pb-12"
              >
                <div className="tiles-layout-11">
                  {heroTilesArticles.map((art, idx) => {
                    const aut = getAuthor(art.authorId);
                    const coAuts = getCoAuthors(art);
                    const isMainTile = idx === 0;
                    return (
                      <div key={art.id} className="post-item">
                        <article
                          onClick={() => openArticle(art.id)}
                          className="group relative w-full h-full rounded-[15px] overflow-hidden cursor-pointer shadow-md"
                        >
                          <EditorialVisual
                            preset={art.visualPreset}
                            customImageUrl={art.customImageUrl}
                            alt={art.title}
                            aspectRatio="fill"
                            className="w-full h-full"
                          />
                          {/* Dark gradient scrim for legibility */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                          {/* Bottom-centered content wrapper (rivax-position-bottom-center style-1) */}
                          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-center text-white z-10 flex flex-col items-center">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#FF2C54]">
                              {art.category}
                            </div>

                            <h2
                              className={`font-bold text-white leading-snug mb-2.5 max-w-xl ${
                                isMainTile
                                  ? 'text-2xl sm:text-3xl lg:text-[32px]'
                                  : 'text-lg sm:text-[20px]'
                              }`}
                            >
                              <span className="title-animation-underline-in-out">
                                {art.title}
                              </span>
                            </h2>

                            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/85">
                              <span>
                                by{' '}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openAuthor(aut.id);
                                  }}
                                  className="font-semibold text-white hover:text-[#FF2C54] transition-colors cursor-pointer"
                                >
                                  {aut.name}
                                </button>
                                {coAuts.length > 0 && (
                                  <span className="text-white/80">
                                    {' '}
                                    &amp; {coAuts.map((c) => c.name).join(', ')}
                                  </span>
                                )}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#FF2C54]" />
                                {art.publishedAt}
                              </span>
                            </div>
                          </div>
                        </article>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ============================================================= */}
              {/* SECTION 2 (510785e): EDITOR'S PICK (rivax-post-kenzo-widget)  */}
              {/* 3 Tall Portrait Cards (400x600) with #000000CF Gradient       */}
              {/* ============================================================= */}
              <section
                data-id="510785e"
                className="max-w-[1240px] mx-auto px-5 sm:px-6 py-8"
              >
                {/* Exact Kayleen Advanced Heading (1695c99) */}
                <div className="mb-7">
                  <h3 className="flex flex-col text-left">
                    <span className="text-[28px] font-bold text-black leading-tight">
                      {siteConfig.editorsPickTitle || "Editor's pick"}
                    </span>
                    <span className="text-[19px] font-light text-[#595F71] mt-0.5">
                      {siteConfig.editorsPickSubtitle ||
                        'Discover the most outstanding articles in all topics of life.'}
                    </span>
                  </h3>
                </div>

                {/* 3-Column Kenzo Grid (5195b8d) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {editorsPickArticles.map((art) => (
                    <article
                      key={art.id}
                      onClick={() => openArticle(art.id)}
                      className="group kayleen-kenzo-card h-[440px] sm:h-[480px] cursor-pointer"
                    >
                      <EditorialVisual
                        preset={art.visualPreset}
                        customImageUrl={art.customImageUrl}
                        alt={art.title}
                        aspectRatio="fill"
                        className="w-full h-full"
                      />

                      <div className="absolute inset-x-0 bottom-0 p-7 text-center text-white z-10">
                        <h2 className="text-xl sm:text-[22px] font-bold text-white leading-snug mb-3">
                          <span className="title-animation-underline-in-out">
                            {art.title}
                          </span>
                        </h2>

                        <div className="flex items-center justify-center gap-2 text-xs text-white/90">
                          <Calendar className="w-3.5 h-3.5 text-[#FF2C54]" />
                          <span>{art.publishedAt}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {/* ============================================================= */}
              {/* SECTION 3 (4cc7931): 2-COL MAIN STREAM (col-66) + SIDEBAR     */}
              {/* ============================================================= */}
              <section
                data-id="4cc7931"
                className="max-w-[1240px] mx-auto px-5 sm:px-6 py-12"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                  {/* Left Column (col-66 = 8 cols): rivax-post-modern-widget (d2cb69c) */}
                  <div className="lg:col-span-8 space-y-14">
                    {paginatedMainStreamArticles.map((art) => {
                      const aut = getAuthor(art.authorId);
                      const coAuts = getCoAuthors(art);
                      const cmtCount = getApprovedCommentCount(art.id);
                      const extraGalleryCount = Array.isArray(art.galleryImages)
                        ? art.galleryImages.length
                        : 0;
                      return (
                        <article key={art.id} className="group">
                          {/* Image Wrapper with 15px Radius, Deep Shadow, Top Telemetry & Bottom White Box Title */}
                          <div
                            onClick={() => openArticle(art.id)}
                            className="kayleen-modern-image-wrapper h-[300px] sm:h-[400px] cursor-pointer mb-6"
                          >
                            <EditorialVisual
                              preset={art.visualPreset}
                              customImageUrl={art.customImageUrl}
                              alt={art.title}
                              aspectRatio="fill"
                              className="w-full h-full"
                            />

                            {/* Top-Right Kayleen Telemetry (.top-content) */}
                            <div className="absolute top-4 right-4 z-10 flex items-center gap-3 bg-black/55 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-full text-xs tabular-nums">
                              <span
                                className="inline-flex items-center gap-1"
                                title="Comentarios aprobados"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                {cmtCount}
                              </span>
                              <span
                                className="inline-flex items-center gap-1"
                                title="Vistas"
                              >
                                <Flame className="w-3.5 h-3.5 text-[#FF2C54]" />
                                {art.views}
                              </span>
                              <span
                                className="inline-flex items-center gap-1"
                                title="Tiempo de lectura"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                {art.readTimeMinutes}
                              </span>
                              {extraGalleryCount > 1 && (
                                <span>{extraGalleryCount} fotos</span>
                              )}
                            </div>

                            {/* Bottom-Left Highlighted White Box Title (.post-wrapper .title a) */}
                            <div className="absolute bottom-5 left-5 right-5 sm:right-32 z-10 text-left">
                              <h2 className="text-lg sm:text-[22px] font-bold leading-[1.85]">
                                <span className="kayleen-box-title">{art.title}</span>
                              </h2>
                            </div>
                          </div>

                          {/* Content Wrapper below Image */}
                          <div className="px-1">
                            {/* Meta Wrapper */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#595F71] mb-3">
                              <div className="inline-flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openAuthor(aut.id)}
                                  className="font-semibold text-[#171920] hover:text-[#FF2C54] transition-colors cursor-pointer"
                                >
                                  {aut.name}
                                </button>
                                {coAuts.map((co) => (
                                  <React.Fragment key={co.id}>
                                    <span className="text-[#5960FF]">&amp;</span>
                                    <button
                                      type="button"
                                      onClick={() => openAuthor(co.id)}
                                      className="font-semibold text-[#171920] hover:text-[#FF2C54] transition-colors cursor-pointer"
                                    >
                                      {co.name}
                                    </button>
                                  </React.Fragment>
                                ))}
                              </div>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#FF2C54]" />
                                {art.publishedAt}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>
                                {cmtCount === 0
                                  ? 'No Comment'
                                  : `${cmtCount} Comment(s)`}
                              </span>
                              <span aria-hidden="true">·</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setView({ type: 'home', categoryFilter: art.category });
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-[#FF2C54] font-medium hover:underline cursor-pointer"
                              >
                                {art.category}
                              </button>
                            </div>

                            {/* Excerpt */}
                            <p className="text-[15px] text-[#4b546e] leading-[1.8] mb-5">
                              {art.excerpt}
                            </p>

                            {/* Read More + Social Share Row */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#f1f3f8]">
                              <button
                                type="button"
                                onClick={() => openArticle(art.id)}
                                className="text-xs font-semibold uppercase tracking-wider text-[#171920] hover:text-[#FF2C54] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className="border-b-2 border-[#FF2C54] pb-0.5">
                                  Read More
                                </span>
                              </button>

                              <SocialShareBar
                                article={art}
                                onShare={handleShareArticle}
                                compact
                              />
                            </div>
                          </div>
                        </article>
                      );
                    })}

                    {/* Kayleen Pagination (.rivax-posts-pagination-wrap) */}
                    <div className="pt-8 text-center flex items-center justify-center gap-2.5">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        const isCurrent = pageNum === safePage;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 900, behavior: 'smooth' });
                            }}
                            className={`px-4 py-2.5 text-xs font-semibold rounded-[4px] border transition-colors cursor-pointer tabular-nums ${
                              isCurrent
                                ? 'bg-[#5960FF] text-white border-[#5960FF]'
                                : 'bg-white text-black border-[#dcdfe7] hover:border-[#9497AE]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {safePage < totalPages && (
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className="px-4 py-2.5 text-xs font-semibold rounded-[4px] bg-white text-black border border-[#dcdfe7] hover:border-[#9497AE] transition-colors cursor-pointer"
                        >
                          Next →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Sticky Column (col-33 = 4 cols): elementor-element-9c1f14f */}
                  <aside className="lg:col-span-4 space-y-10 lg:sticky lg:top-24">
                    {/* Widget 1 (76a1a5c): Kayleen Promotional Visual Image */}
                    <div
                      onClick={() => openArticle(publishedArticles[0]?.id || 'art-1')}
                      className="rounded-[15px] overflow-hidden shadow-sm cursor-pointer group"
                    >
                      <img
                        src="/images/kayleen/jon-tyson-sPim6Y8Wa7Y-unsplash-qe8qk5d0i0em1ajl2jzfp9l3crarjyyo11032tyw28.jpg"
                        alt="Kayleen Visual Feature"
                        referrerPolicy="no-referrer"
                        className="w-full h-auto object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                    </div>

                    {/* Widget 2 (96bab4f + 755a0a3 + 49d2bfe): Alice Qelvin Author Box */}
                    <div className="border border-[#dcdfe7] rounded-[15px] p-7 bg-white text-center">
                      <div
                        onClick={() => openAuthor(sidebarAuthor.id)}
                        className="inline-block cursor-pointer mb-4"
                      >
                        <AuthorAvatar user={sidebarAuthor} size="xl" />
                      </div>
                      <h3
                        onClick={() => openAuthor(sidebarAuthor.id)}
                        className="text-xl font-bold text-[#171920] hover:text-[#FF2C54] transition-colors cursor-pointer mb-2"
                      >
                        {sidebarAuthor.name}
                      </h3>
                      <p className="text-sm text-[#4b546e] leading-relaxed mb-4">
                        {sidebarAuthor.bio}
                      </p>
                      <button
                        type="button"
                        onClick={() => openAuthor(sidebarAuthor.id)}
                        className="text-xs font-semibold text-[#5960FF] hover:text-[#FF2C54] transition-colors cursor-pointer"
                      >
                        Ver Perfil y Artículos →
                      </button>
                    </div>

                    {/* Widget 3 (9a0a293 + c8a3b47): Featured Posts Carousel */}
                    <div className="border border-[#dcdfe7] rounded-[15px] p-6 bg-white">
                      <div className="rivax-divider-heading mb-5">
                        <div className="divider-1" />
                        <div className="divider-2" />
                        <h4 className="text-base font-bold text-[#171920]">
                          Featured Posts
                        </h4>
                        <div className="divider-3" />
                      </div>

                      {activeCarouselPost && (
                        <div>
                          <article
                            onClick={() => openArticle(activeCarouselPost.id)}
                            className="group cursor-pointer"
                          >
                            <div className="rounded-[12px] overflow-hidden mb-3.5 h-48">
                              <EditorialVisual
                                preset={activeCarouselPost.visualPreset}
                                customImageUrl={activeCarouselPost.customImageUrl}
                                alt={activeCarouselPost.title}
                                aspectRatio="fill"
                                className="w-full h-full"
                              />
                            </div>
                            <h4 className="text-base font-bold text-[#171920] group-hover:text-[#FF2C54] transition-colors leading-snug mb-2">
                              <span className="title-animation-underline-in-out">
                                {activeCarouselPost.title}
                              </span>
                            </h4>
                            <div className="flex items-center justify-between text-xs text-[#595F71]">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#FF2C54]" />
                                {activeCarouselPost.publishedAt}
                              </span>
                            </div>
                          </article>

                          {/* Carousel Prev/Next Controls */}
                          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#f1f3f8]">
                            <button
                              type="button"
                              onClick={() =>
                                setSidebarCarouselIdx(
                                  (prev) =>
                                    (prev - 1 + sidebarCarouselPosts.length) %
                                    sidebarCarouselPosts.length
                                )
                              }
                              className="w-8 h-8 rounded-full border border-[#dcdfe7] flex items-center justify-center text-[#171920] hover:bg-[#FF2C54] hover:text-white hover:border-[#FF2C54] transition-colors cursor-pointer"
                              aria-label="Anterior destacado"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setSidebarCarouselIdx(
                                  (prev) => (prev + 1) % sidebarCarouselPosts.length
                                )
                              }
                              className="w-8 h-8 rounded-full border border-[#dcdfe7] flex items-center justify-center text-[#171920] hover:bg-[#FF2C54] hover:text-white hover:border-[#FF2C54] transition-colors cursor-pointer"
                              aria-label="Siguiente destacado"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Widget 4 (c663dc2): Dynamic Categories */}
                    <div className="border border-[#dcdfe7] rounded-[15px] p-6 bg-white">
                      <div className="flex items-center justify-between mb-5">
                        <div className="rivax-divider-heading">
                          <div className="divider-1" />
                          <div className="divider-2" />
                          <h4 className="text-base font-bold text-[#171920]">Categories</h4>
                          <div className="divider-3" />
                        </div>
                        {currentUser && (
                          <button
                            type="button"
                            onClick={() => openDashboard('categories')}
                            className="text-[11px] font-semibold text-[#5960FF] hover:text-[#FF2C54] cursor-pointer"
                          >
                            Editar
                          </button>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        {categoriesList.map((cat) => {
                          const count = publishedArticles.filter(
                            (a) => a.category === cat.name
                          ).length;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setView({ type: 'home', categoryFilter: cat.name });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="w-full flex items-center justify-between px-4 py-2.5 rounded-[10px] bg-[#f7f8fc] hover:bg-[#171920] text-[#171920] hover:text-white transition-colors text-xs font-semibold cursor-pointer"
                            >
                              <span>{cat.name}</span>
                              <span className="font-mono tabular-nums opacity-80">
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </aside>
                </div>
              </section>
            </>
          )}
        </main>
      )}

      {/* ===================================================================== */}
      {/* FOOTER (#site-footer, elementor-1213): NEWSLETTER + LINKS             */}
      {/* ===================================================================== */}
      <footer
        id="site-footer"
        className="border-t border-[#dcdfe7] mt-12 transition-colors duration-300"
        style={{ backgroundColor: siteConfig.footerBackgroundColor || '#f7f8fc' }}
      >
        <div className="max-w-[1240px] mx-auto px-5 sm:px-6 pt-12 pb-10">
          {/* Inner Section 4612e05: 2-Column Newsletter Box */}
          {siteConfig.showNewsletterBox && (
            <div className="bg-white border border-[#dcdfe7] rounded-[15px] p-8 sm:p-10 mb-12 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6">
                  <div className="rivax-divider-heading">
                    <div className="divider-1" />
                    <div className="divider-2" />
                    <h2 className="text-xl sm:text-2xl font-bold text-[#171920]">
                      {siteConfig.newsletterHeading ||
                        'Subscribe to our newsletter and stay updated.'}
                    </h2>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  {newsletterSuccess ? (
                    <div className="flex flex-col items-end gap-1.5 text-xs font-semibold text-[#16A34A]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          ¡Suscripción confirmada! ({(db.subscriberRecords || []).length} lectores)
                        </span>
                      </div>
                      {isPushSubscribed && (
                        <span className="text-[11px] text-[#5960FF] flex items-center gap-1">
                          <BellRing className="w-3.5 h-3.5" /> Alertas Push activas para nuevos artículos y campañas
                        </span>
                      )}
                    </div>
                  ) : (
                    <form
                      onSubmit={handleNewsletterSubmit}
                      className="space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                          type="email"
                          required
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          placeholder={
                            siteConfig.newsletterPlaceholder || 'Enter your email address...'
                          }
                          className="w-full px-4 py-3 text-xs bg-[#f7f8fc] rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                        />
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-white hover:opacity-90 rounded-[8px] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          style={{
                            backgroundColor: siteConfig.primaryAccentColor || '#FF2C54',
                          }}
                        >
                          {siteConfig.newsletterButtonText || 'Subscribe'}
                        </button>
                      </div>
                      <label className="flex items-center gap-2 text-[11px] text-[#595F71] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newsletterPushOptIn}
                          onChange={(e) => setNewsletterPushOptIn(e.target.checked)}
                          className="rounded border-[#dcdfe7] text-[#FF2C54] focus:ring-[#FF2C54]"
                        />
                        <BellRing className="w-3.5 h-3.5 text-[#FF2C54]" />
                        <span>
                          Activar notificaciones Push en el navegador cuando se publique un nuevo artículo o campaña
                        </span>
                      </label>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5-Column Kayleen Footer Links ('Kayleen', 'Quick Links', 'Category', 'Legal & Privacidad', 'Comunidad & Suscripción') */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#dcdfe7]">
            <div className="lg:col-span-1">
              {siteConfig.useImageLogo && siteConfig.logoImageUrl ? (
                <img
                  src={siteConfig.logoImageUrl}
                  alt={siteConfig.logoText || 'Logo'}
                  className="h-8 w-auto object-contain mb-3"
                />
              ) : (
                <span className="text-2xl font-bold text-[#171920] block mb-3">
                  {siteConfig.logoText || 'Kayleen'}
                  <span style={{ color: siteConfig.logoDotColor || '#FF2C54' }}>.</span>
                </span>
              )}
              <p className="text-xs text-[#595F71] leading-relaxed mb-3">
                {siteConfig.footerDescription}
              </p>
              {siteConfig.contactEmail && (
                <p className="text-xs text-[#4b546e] font-medium mb-1.5">
                  Contacto: {siteConfig.contactEmail}
                </p>
              )}
              <p className="text-[11px] text-[#595F71]">
                Editorial Studio S.L. · Madrid, España
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#171920] mb-4">Explorar Revista</h4>
              <ul className="space-y-2.5 text-xs text-[#4b546e]">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setView({ type: 'home', categoryFilter: null });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#FF2C54] transition-colors cursor-pointer"
                  >
                    Portada Home 03
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      openAuthor(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#FF2C54] transition-colors cursor-pointer"
                  >
                    Perfiles de Autores
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setView({ type: 'subscriptions' });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#FF2C54] transition-colors cursor-pointer font-bold text-[#FF2C54] inline-flex items-center gap-1"
                  >
                    <Crown className="w-3 h-3 text-amber-600" />
                    <span>Artículos Exclusivos</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openDashboard('categories')}
                    className="hover:text-[#FF2C54] transition-colors cursor-pointer"
                  >
                    Gestión de Categorías
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openDashboard('php_export')}
                    className="hover:text-[#FF2C54] transition-colors cursor-pointer"
                  >
                    Exportar Código PHP + MySQL
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#171920] mb-4">Categorías</h4>
              <ul className="space-y-2.5 text-xs text-[#4b546e]">
                {categoriesList.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setView({ type: 'home', categoryFilter: cat.name });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#FF2C54] transition-colors cursor-pointer"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Legal & Políticas */}
            <div>
              <h4 className="text-sm font-bold text-[#171920] mb-4 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FF2C54]" />
                <span>Políticas &amp; Legal</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-[#4b546e]">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setView({ type: 'legal', section: 'privacy' });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#FF2C54] transition-colors cursor-pointer text-left"
                  >
                    Políticas de Privacidad (RGPD)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setView({ type: 'legal', section: 'refund' });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#5960FF] transition-colors cursor-pointer text-left font-semibold"
                  >
                    Políticas de Devolución &amp; Reembolso
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setView({ type: 'legal', section: 'terms' });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#FF2C54] transition-colors cursor-pointer text-left"
                  >
                    Términos y Condiciones de Uso
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setView({ type: 'legal', section: 'cookies' });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#FF2C54] transition-colors cursor-pointer text-left"
                  >
                    Aviso Legal &amp; Cookies
                  </button>
                </li>
                <li>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Garantía 14 días en pagos
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 5: Membresías & Lectores */}
            <div>
              <h4 className="text-sm font-bold text-[#171920] mb-4 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Lectores &amp; Planes</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-[#4b546e]">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setView({ type: 'subscriptions' });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#FF2C54] transition-colors cursor-pointer font-bold text-amber-700"
                  >
                    Planes de Suscripción Premium
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setView({ type: 'register' });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#FF2C54] transition-colors cursor-pointer font-semibold"
                  >
                    Registrarse como Lector Gratis
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="hover:text-[#FF2C54] transition-colors cursor-pointer"
                  >
                    Acceso para Colaboradores
                  </button>
                </li>
                <li className="pt-2 text-[11px] text-[#595F71]">
                  <strong>Redes Sociales:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-[#FF2C54]">@kayleen_studio</span>
                    <span className="text-[#5960FF]">@kayleen_print</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Sub-Footer Bar with Direct Legal Links */}
          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#595F71]">
            <p>{siteConfig.footerCopyright}</p>
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setView({ type: 'legal', section: 'privacy' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#FF2C54] transition-colors cursor-pointer"
              >
                Privacidad (RGPD)
              </button>
              <span className="opacity-40">•</span>
              <button
                type="button"
                onClick={() => {
                  setView({ type: 'legal', section: 'refund' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#FF2C54] transition-colors cursor-pointer"
              >
                Devoluciones y Cancelaciones
              </button>
              <span className="opacity-40">•</span>
              <button
                type="button"
                onClick={() => {
                  setView({ type: 'legal', section: 'terms' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#FF2C54] transition-colors cursor-pointer"
              >
                Términos y Condiciones
              </button>
              <span className="opacity-40">•</span>
              <button
                type="button"
                onClick={() => {
                  setView({ type: 'legal', section: 'cookies' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#FF2C54] transition-colors cursor-pointer"
              >
                Aviso Legal &amp; Cookies
              </button>
              <span className="opacity-40">•</span>
              <button
                type="button"
                onClick={() => {
                  setView({ type: 'subscriptions' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-amber-700 font-semibold hover:underline cursor-pointer"
              >
                Planes Premium
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Login & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={db.users}
        initialMode={authModalMode}
        initialAccessGroup={authModalGroup}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onOpenFullReaderRegister={() => {
          setView({ type: 'register' });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Floating Browser Push Notification Alert Card */}
      {renderLivePushBanner()}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#171920] text-white px-4 py-3 rounded-[10px] text-xs font-medium shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#FF2C54]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
