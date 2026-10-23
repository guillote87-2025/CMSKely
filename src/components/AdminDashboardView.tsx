import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileText,
  MessageSquare,
  Users,
  Code2,
  LayoutDashboard,
  FolderKanban,
  Plus,
  Search,
  Check,
  X,
  Trash2,
  Edit3,
  Eye,
  ArrowLeft,
  Copy,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  Link2,
  Star,
  UserPlus,
  FileArchive,
  Send,
  UserCog,
  Globe,
  MapPin,
  Save,
  Settings,
  Megaphone,
  Mail,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Flame,
  TrendingUp,
  Sparkles,
  BellRing,
  Crown,
  Hash,
  ShieldCheck,
  CreditCard,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  Quote,
  Maximize2,
  Minimize2,
  Calendar,
  RefreshCw,
  Ban,
  ArrowRightLeft,
  Inbox,
  Reply,
  LogOut,
  LogIn,
  Palette,
} from 'lucide-react';
import {
  Article,
  ArticleApprovalStatus,
  ArticleCategory,
  ArticlePublishMode,
  BlogComment,
  CategoryItem,
  CommentStatus,
  DatabaseState,
  HashtagItem,
  INITIAL_SITE_CONFIG,
  MarketingCampaign,
  PrivateMessage,
  PushNotificationItem,
  SiteConfig,
  SubscriberItem,
  SubscriptionPlan,
  User,
  UserRole,
  VisualPreset,
} from '../data/akeaData';
import { AuthorAvatar, EditorialVisual } from './EditorialVisual';
import { SiteSettingsAndMarketingView } from './SiteSettingsAndMarketingView';
import { ArticleWordpressEditor } from './ArticleWordpressEditor';
import { generatePhpMysqlPackage } from '../utils/phpExporter';

export const CMS_ADMIN_VERSION = 'v4.2.0';

export type DashboardTab =
  | 'overview'
  | 'articles'
  | 'approvals'
  | 'hashtags'
  | 'categories'
  | 'comments'
  | 'users'
  | 'premium_plans'
  | 'messages'
  | 'profile_settings'
  | 'subscribers'
  | 'campaigns'
  | 'site_settings'
  | 'color_palette'
  | 'legal_pages'
  | 'php_export';

interface AdminDashboardViewProps {
  db: DatabaseState;
  currentUser: User | null;
  initialTab?: DashboardTab;
  onBackToBlog: () => void;
  onViewArticle: (articleId: string) => void;
  onViewAuthor: (authorId: string) => void;
  onOpenPublicLegalPage?: (section?: 'privacy' | 'refund' | 'terms' | 'cookies') => void;
  onOpenAuthModal?: (mode?: 'login' | 'register', group?: 'all' | 'admin' | 'reader') => void;
  onLogout?: () => void;
  onSaveArticle: (payload: Partial<Article>) => Promise<void>;
  onToggleArticleStatus: (articleId: string, newStatus: 'published' | 'draft') => Promise<void>;
  onDeleteArticle: (articleId: string) => Promise<void>;
  onApproveArticle?: (
    articleId: string,
    payload: {
      approvalStatus: ArticleApprovalStatus;
      publishMode?: ArticlePublishMode;
      scheduledPublishAt?: string;
      reviewedBy?: string;
      reviewNotes?: string;
    }
  ) => Promise<void>;
  onSaveCategory: (payload: Partial<CategoryItem>) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onSaveHashtag?: (payload: Partial<HashtagItem>) => Promise<void>;
  onDeleteHashtag?: (hashtagId: string) => Promise<void>;
  onSavePlan?: (payload: Partial<SubscriptionPlan>) => Promise<void>;
  onDeletePlan?: (planId: string) => Promise<void>;
  onManageUserSubscription?: (
    userId: string,
    payload: {
      action: 'upgrade_premium' | 'downgrade_free' | 'cancel' | 'expire' | 'renew';
      planId?: string;
      subscriptionEnd?: string;
      autoRenew?: boolean;
    }
  ) => Promise<void>;
  onSendMessage?: (payload: Partial<PrivateMessage>) => Promise<void>;
  onMarkMessageRead?: (messageId: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onUpdateCommentStatus: (commentId: string, status: CommentStatus) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onCreateUser: (payload: {
    name: string;
    email: string;
    role: UserRole;
    specialty: string;
    bio: string;
    location: string;
  }) => Promise<void>;
  onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
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

const VISUAL_PRESETS: { value: VisualPreset; label: string }[] = [
  { value: 'summer_coast', label: 'Atardecer Costero (Kayleen Sunset)' },
  { value: 'photo_mistakes', label: 'Fotografía & Geometría Urbana' },
  { value: 'xe_entertainment', label: 'Danza & Cultura Contemporánea' },
  { value: 'alpine_lake', label: 'Naturaleza & Bosque Sereno' },
  { value: 'winter_fashion', label: 'Moda & Retrato Editorial' },
  { value: 'minimal_gadgets', label: 'Estudio Creativo & Equilibrio' },
  { value: 'tech_hq', label: 'Comunidad & Innovación' },
  { value: 'tropical_beach', label: 'Gastronomía & Aire Libre' },
  { value: 'madrid_runway', label: 'Street Style & Pasarela' },
  { value: 'breathtaking_cliffs', label: 'Viajes & Horizonte Abierto' },
];

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  db,
  currentUser,
  initialTab = 'overview',
  onBackToBlog,
  onViewArticle,
  onViewAuthor,
  onOpenPublicLegalPage,
  onOpenAuthModal,
  onLogout,
  onSaveArticle,
  onToggleArticleStatus,
  onDeleteArticle,
  onApproveArticle,
  onSaveCategory,
  onDeleteCategory,
  onSaveHashtag,
  onDeleteHashtag,
  onSavePlan,
  onDeletePlan,
  onManageUserSubscription,
  onSendMessage,
  onMarkMessageRead,
  onDeleteMessage,
  onUpdateCommentStatus,
  onDeleteComment,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
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
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Overview & Articles Sort Mode ('recent' | 'popular' | 'commented')
  const [overviewArticlesSort, setOverviewArticlesSort] = useState<
    'recent' | 'popular' | 'commented'
  >('recent');
  const [articlesTabSort, setArticlesTabSort] = useState<
    'recent' | 'popular' | 'commented'
  >('recent');

  // Articles Filter & Editor State
  const [articleSearch, setArticleSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'published' | 'draft'>('ALL');
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [confirmDeleteArticleId, setConfirmDeleteArticleId] = useState<string | null>(null);

  // Word-Style Editor & Distraction-Free "Modo Escritura" State
  const [isWritingMode, setIsWritingMode] = useState(false);
  const [writingTheme, setWritingTheme] = useState<'paper' | 'white' | 'dark'>('paper');
  const [newHashtagInput, setNewHashtagInput] = useState('');
  const editorTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Hashtags Admin CRUD State
  const [hashtagSearch, setHashtagSearch] = useState('');
  const [editingHashtag, setEditingHashtag] = useState<Partial<HashtagItem> | null>(null);

  // Subscription Plans CRUD State
  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const [planFeaturesText, setPlanFeaturesText] = useState('');

  // Users Premium Filter & Subscription Editor State
  const [userTierFilter, setUserTierFilter] = useState<'ALL' | 'premium' | 'free' | 'expired'>('ALL');
  const [userSearch, setUserSearch] = useState('');

  // Article Approvals Filter & Review Notes State
  const [approvalFilter, setApprovalFilter] = useState<'ALL' | 'pending_review' | 'approved' | 'rejected'>('ALL');
  const [reviewNotesMap, setReviewNotesMap] = useState<Record<string, string>>({});
  const [scheduleDateMap, setScheduleDateMap] = useState<Record<string, string>>({});
  const [publishModeMap, setPublishModeMap] = useState<Record<string, ArticlePublishMode>>({});

  // Private Messaging State
  const [messageBoxTab, setMessageBoxTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [msgRecipientId, setMsgRecipientId] = useState<string>(db.users[0]?.id || 'usr-1');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgCategory, setMsgCategory] = useState<PrivateMessage['category']>('editorial');
  const [msgSentNotice, setMsgSentNotice] = useState('');

  // Multi-image upload & URL input inside Article Modal
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quick Inline Co-Author Creator inside Article Modal
  const [showQuickAuthorForm, setShowQuickAuthorForm] = useState(false);
  const [quickAuthorName, setQuickAuthorName] = useState('');
  const [quickAuthorEmail, setQuickAuthorEmail] = useState('');
  const [quickAuthorSpecialty, setQuickAuthorSpecialty] = useState('');

  // Categories CRUD State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryItem> | null>(null);
  const [confirmDeleteCategoryId, setConfirmDeleteCategoryId] = useState<string | null>(null);

  // Comments Moderation Filter State
  const [commentFilter, setCommentFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>(
    'pending'
  );

  // Users Management State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  // Independent Profile Configuration Tab State ('Configuración de Perfil')
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string>(
    currentUser?.id || db.users[0]?.id || 'usr-1'
  );
  const activeProfileTarget = useMemo(
    () =>
      db.users.find((u) => u.id === selectedProfileUserId) ||
      currentUser ||
      db.users[0],
    [db.users, selectedProfileUserId, currentUser]
  );
  const [profileForm, setProfileForm] = useState<Partial<User>>(() => ({
    ...activeProfileTarget,
  }));
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync profileForm when switching target user in Configuración de Perfil
  const handleSelectProfileTarget = (userId: string) => {
    setSelectedProfileUserId(userId);
    const target = db.users.find((u) => u.id === userId);
    if (target) {
      setProfileForm({ ...target });
      setProfileSavedNotice(false);
    }
  };

  // Handle Avatar Upload from PC in Configuración de Perfil
  const handleAvatarFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
    if (avatarFileInputRef.current) {
      avatarFileInputRef.current.value = '';
    }
  };

  const handleSaveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfileTarget) return;
    await onUpdateUser(activeProfileTarget.id, {
      name: profileForm.name?.trim() || activeProfileTarget.name,
      email: profileForm.email?.trim() || activeProfileTarget.email,
      specialty: profileForm.specialty?.trim() ?? activeProfileTarget.specialty,
      location: profileForm.location?.trim() ?? activeProfileTarget.location,
      bio: profileForm.bio?.trim() ?? activeProfileTarget.bio,
      website: profileForm.website?.trim() ?? '',
      twitter: profileForm.twitter?.trim() ?? '',
      instagram: profileForm.instagram?.trim() ?? '',
      linkedin: profileForm.linkedin?.trim() ?? '',
      youtube: profileForm.youtube?.trim() ?? '',
      github: profileForm.github?.trim() ?? '',
      avatarTheme: profileForm.avatarTheme || activeProfileTarget.avatarTheme,
      avatarUrl: profileForm.avatarUrl?.trim() ?? activeProfileTarget.avatarUrl,
    });
    setProfileSavedNotice(true);
    setTimeout(() => setProfileSavedNotice(false), 3000);
  };

  // PHP + MySQL Exporter State
  const phpFiles = useMemo(() => generatePhpMysqlPackage(db), [db]);
  const [selectedPhpFileIndex, setSelectedPhpFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState(false);

  // Live Site Configuration (Logo, Accent Colors, Surface Background)
  const siteConfig: SiteConfig = {
    ...INITIAL_SITE_CONFIG,
    ...(db.siteConfig || {}),
  };
  const primaryColor = 'var(--color-primary)';
  const secondaryColor = 'var(--color-secondary)';
  const surfaceBg = 'var(--color-surface-bg)';

  const pendingComments = db.comments.filter((c) => c.status === 'pending');
  const approvedComments = db.comments.filter((c) => c.status === 'approved');
  const pendingApprovalArticles = db.articles.filter(
    (a) => a.approvalStatus === 'pending_review'
  );
  const unreadMessagesCount = (db.messages || []).filter(
    (m) => !m.read && (!currentUser || m.recipientId === currentUser.id)
  ).length;
  const totalShares = db.articles.reduce((sum, a) => sum + (a.shares || 0), 0);
  const totalViews = db.articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalLikes = db.articles.reduce((sum, a) => sum + (a.likes || 0), 0);
  const totalDislikes = db.articles.reduce((sum, a) => sum + (a.dislikes || 0), 0);
  const likeApprovalRatio =
    totalLikes + totalDislikes > 0
      ? Math.round((totalLikes / (totalLikes + totalDislikes)) * 100)
      : 100;

  const adminUsersCount = db.users.filter((u) => u.role === 'admin').length;
  const editorUsersCount = db.users.filter((u) => u.role === 'editor' || u.role === 'moderator').length;
  const authorUsersCount = db.users.filter((u) => u.role === 'author').length;
  const readerUsersCount = db.users.filter((u) => u.role === 'reader').length;

  const activeSubscribersCount = (db.subscriberRecords || []).filter(
    (s) => s.status === 'active'
  ).length;
  const vipSubscribersCount = (db.subscriberRecords || []).filter((s) =>
    (s.tags || []).includes('VIP')
  ).length;

  // Helper to get comment counts per article
  const getArticleCommentsStats = (articleId: string) => {
    const allForArt = db.comments.filter((c) => c.articleId === articleId);
    const approvedForArt = allForArt.filter((c) => c.status === 'approved');
    const pendingForArt = allForArt.filter((c) => c.status === 'pending');
    return {
      total: allForArt.length,
      approved: approvedForArt.length,
      pending: pendingForArt.length,
    };
  };

  const availableCategories = useMemo(
    () =>
      db.categories && db.categories.length > 0
        ? db.categories
        : [
            {
              id: 'cat-default',
              name: 'Estilo de Vida',
              slug: 'estilo-de-vida',
              description: 'Categoría general',
              color: '#FF2C54',
            },
          ],
    [db.categories]
  );

  // Sorted articles for Overview ("Artículos Recientes" vs "Más Populares" vs "Más Comentados")
  const sortedOverviewArticles = useMemo(() => {
    const copy = [...db.articles];
    if (overviewArticlesSort === 'popular') {
      return copy.sort((a, b) => b.views + b.likes * 15 - (a.views + a.likes * 15));
    }
    if (overviewArticlesSort === 'commented') {
      return copy.sort((a, b) => {
        const countB = db.comments.filter((c) => c.articleId === b.id).length;
        const countA = db.comments.filter((c) => c.articleId === a.id).length;
        if (countB !== countA) return countB - countA;
        return b.views - a.views;
      });
    }
    return copy;
  }, [db.articles, db.comments, overviewArticlesSort]);

  const filteredArticles = useMemo(() => {
    const base = db.articles.filter((art) => {
      const q = articleSearch.toLowerCase();
      const matchesSearch =
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        (art.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesCat = categoryFilter === 'ALL' || art.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || art.status === statusFilter;
      return matchesSearch && matchesCat && matchesStatus;
    });
    if (articlesTabSort === 'popular') {
      return [...base].sort((a, b) => b.views + b.likes * 15 - (a.views + a.likes * 15));
    }
    if (articlesTabSort === 'commented') {
      return [...base].sort((a, b) => {
        const countB = db.comments.filter((c) => c.articleId === b.id).length;
        const countA = db.comments.filter((c) => c.articleId === a.id).length;
        if (countB !== countA) return countB - countA;
        return b.views - a.views;
      });
    }
    return base;
  }, [db.articles, db.comments, articleSearch, categoryFilter, statusFilter, articlesTabSort]);

  const filteredComments = db.comments.filter((cmt) =>
    commentFilter === 'all' ? true : cmt.status === commentFilter
  );

  // Helper to format main author + co-authors
  const getArticleAuthorsList = (art: Article): User[] => {
    const main = db.users.find((u) => u.id === art.authorId) || db.users[0];
    const coAuthors = (art.coAuthorIds || [])
      .map((cid) => db.users.find((u) => u.id === cid))
      .filter((u): u is User => Boolean(u && u.id !== main.id));
    return [main, ...coAuthors];
  };

  // Word-style formatting helper for Article Editor textarea
  const applyWordFormat = (
    type:
      | 'bold'
      | 'italic'
      | 'underline'
      | 'strike'
      | 'h1'
      | 'h2'
      | 'h3'
      | 'list'
      | 'quote'
      | 'callout'
      | 'link'
  ) => {
    if (!editingArticle) return;
    const textarea = editorTextareaRef.current;
    const fullText = (editingArticle.content || []).join('\n\n');
    const start = textarea ? textarea.selectionStart : fullText.length;
    const end = textarea ? textarea.selectionEnd : fullText.length;
    const selected = fullText.slice(start, end) || 'Texto destacado';

    let replacement = selected;
    if (type === 'bold') replacement = `**${selected}**`;
    if (type === 'italic') replacement = `*${selected}*`;
    if (type === 'underline') replacement = `__${selected}__`;
    if (type === 'strike') replacement = `~~${selected}~~`;
    if (type === 'h1') replacement = `\n\n# ${selected}\n\n`;
    if (type === 'h2') replacement = `\n\n## ${selected}\n\n`;
    if (type === 'h3') replacement = `\n\n### ${selected}\n\n`;
    if (type === 'list') replacement = `\n\n- ${selected}\n- Segundo punto editorial\n\n`;
    if (type === 'quote') replacement = `\n\n> ${selected}\n\n`;
    if (type === 'callout') replacement = `\n\n[NOTA: ${selected}]\n\n`;
    if (type === 'link') replacement = `**${selected}** (https://kayleen.magazine)`;

    const updatedText = fullText.slice(0, start) + replacement + fullText.slice(end);
    const paragraphs = updatedText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    const wordCount = updatedText.trim().split(/\s+/).filter(Boolean).length;
    const computedReadTime = Math.max(1, Math.ceil(wordCount / 180));

    setEditingArticle({
      ...editingArticle,
      content: paragraphs.length > 0 ? paragraphs : [''],
      readTimeMinutes: computedReadTime,
    });
  };

  // Open New Article Modal
  const openNewArticleForm = () => {
    setImageUrlInput('');
    setUploadNotice('');
    setShowQuickAuthorForm(false);
    setIsWritingMode(false);
    setNewHashtagInput('');
    const isAuthorOnly = currentUser?.role === 'author';
    setEditingArticle({
      title: '',
      subtitle: '',
      excerpt: '',
      content: [
        '## Introducción Editorial',
        'Primer párrafo del artículo con herramientas de edición estilo Word y modo escritura sin distracciones.',
        'Segundo párrafo desarrollando el contenido principal con imágenes reales y colaboración editorial.',
      ],
      pullQuote:
        'La narrativa visual contemporánea cobra fuerza cuando combina fotografía auténtica y voces colaborativas.',
      category: availableCategories[0]?.name || 'Estilo de Vida',
      authorId: currentUser?.id || db.users[0].id,
      coAuthorIds: [],
      readTimeMinutes: 4,
      featuredHero: false,
      akeaSection: 'recent',
      visualPreset: 'summer_coast',
      customImageUrl: '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg',
      galleryImages: ['/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg'],
      tags: ['Kayleen', 'Editorial'],
      status: isAuthorOnly ? 'draft' : 'published',
      isPremium: false,
      approvalStatus: isAuthorOnly ? 'pending_review' : 'approved',
      publishMode: 'immediate',
      scheduledPublishAt: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    });
    setIsArticleModalOpen(true);
  };

  // Open Edit Article Modal
  const openEditArticleForm = (article: Article) => {
    setImageUrlInput('');
    setUploadNotice('');
    setShowQuickAuthorForm(false);
    setIsWritingMode(false);
    setNewHashtagInput('');
    const existingGallery =
      Array.isArray(article.galleryImages) && article.galleryImages.length > 0
        ? [...article.galleryImages]
        : article.customImageUrl
        ? [article.customImageUrl]
        : [];
    setEditingArticle({
      ...article,
      coAuthorIds: Array.isArray(article.coAuthorIds) ? [...article.coAuthorIds] : [],
      galleryImages: existingGallery,
      isPremium: Boolean(article.isPremium),
      approvalStatus: article.approvalStatus || 'approved',
      publishMode: article.publishMode || 'immediate',
      scheduledPublishAt: article.scheduledPublishAt || '',
      seoTitle: article.seoTitle || article.title,
      seoDescription: article.seoDescription || article.excerpt,
      seoKeywords: article.seoKeywords || (article.tags || []).join(', '),
    });
    setIsArticleModalOpen(true);
  };

  // Handle Multi-File Upload from PC (JPG, JPEG, PNG, WEBP, AVIF, GIF, SVG)
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingArticle) return;

    const fileArray = Array.from(files);
    const readPromises = fileArray.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
          reader.onerror = () => reject(new Error('Error reading file'));
          reader.readAsDataURL(file);
        })
    );

    try {
      const dataUrls = (await Promise.all(readPromises)).filter(Boolean);
      const currentGallery = editingArticle.galleryImages || [];
      const updatedGallery = [...currentGallery, ...dataUrls];
      const updatedCover =
        editingArticle.customImageUrl && editingArticle.customImageUrl.trim() !== ''
          ? editingArticle.customImageUrl
          : updatedGallery[0] || '';

      setEditingArticle({
        ...editingArticle,
        galleryImages: updatedGallery,
        customImageUrl: updatedCover,
      });
      setUploadNotice(
        `Se añadieron ${dataUrls.length} imagen(es) desde tu PC (${fileArray
          .map((f) => f.name)
          .join(', ')}).`
      );
    } catch {
      setUploadNotice('No se pudieron procesar algunas imágenes seleccionadas.');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Adding 1 or Multiple Image Links
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim() || !editingArticle) return;
    const urls = imageUrlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    if (urls.length === 0) return;

    const currentGallery = editingArticle.galleryImages || [];
    const updatedGallery = [...currentGallery, ...urls];
    const updatedCover =
      editingArticle.customImageUrl && editingArticle.customImageUrl.trim() !== ''
        ? editingArticle.customImageUrl
        : updatedGallery[0] || '';

    setEditingArticle({
      ...editingArticle,
      galleryImages: updatedGallery,
      customImageUrl: updatedCover,
    });
    setImageUrlInput('');
    setUploadNotice(`Se añadieron ${urls.length} enlace(s) de imagen a la galería del artículo.`);
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    if (!editingArticle) return;
    const currentGallery = editingArticle.galleryImages || [];
    const removedUrl = currentGallery[indexToRemove];
    const updatedGallery = currentGallery.filter((_, idx) => idx !== indexToRemove);
    const updatedCover =
      editingArticle.customImageUrl === removedUrl
        ? updatedGallery[0] || ''
        : editingArticle.customImageUrl;

    setEditingArticle({
      ...editingArticle,
      galleryImages: updatedGallery,
      customImageUrl: updatedCover,
    });
  };

  const handleSetMainCoverImage = (url: string) => {
    if (!editingArticle) return;
    setEditingArticle({
      ...editingArticle,
      customImageUrl: url,
    });
  };

  // Toggle Co-Author selection
  const handleToggleCoAuthor = (userId: string) => {
    if (!editingArticle) return;
    const currentCo = editingArticle.coAuthorIds || [];
    const exists = currentCo.includes(userId);
    const updated = exists
      ? currentCo.filter((id) => id !== userId)
      : [...currentCo, userId];
    setEditingArticle({
      ...editingArticle,
      coAuthorIds: updated,
    });
  };

  // Quick Create Co-Author inside Article Modal
  const handleQuickCreateCoAuthor = async () => {
    if (!quickAuthorName.trim() || !quickAuthorEmail.trim()) return;
    await onCreateUser({
      name: quickAuthorName.trim(),
      email: quickAuthorEmail.trim(),
      role: 'author',
      specialty: quickAuthorSpecialty.trim() || 'Autor Colaborador',
      bio: `Colaborador editorial en Kayleen Magazine (${quickAuthorSpecialty.trim() || 'Ensayo y Crónica'}).`,
      location: 'Madrid, España',
    });
    setQuickAuthorName('');
    setQuickAuthorEmail('');
    setQuickAuthorSpecialty('');
    setShowQuickAuthorForm(false);
  };

  const handleArticleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title) return;
    await onSaveArticle(editingArticle);
    setIsArticleModalOpen(false);
    setEditingArticle(null);
  };

  // Categories Modal Handlers
  const openNewCategoryForm = () => {
    setEditingCategory({
      name: '',
      description: '',
      color: '#FF2C54',
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryForm = (cat: CategoryItem) => {
    setEditingCategory({ ...cat });
    setIsCategoryModalOpen(true);
  };

  const handleCategoryFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name?.trim()) return;
    await onSaveCategory(editingCategory);
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // Users Modal Handlers
  const openNewUserForm = () => {
    setEditingUser({
      name: '',
      email: '',
      role: 'author',
      specialty: 'Redactor Cultural & Ensayista',
      bio: 'Colaborador editorial en Kayleen Magazine.',
      location: 'Madrid, España',
    });
    setIsUserModalOpen(true);
  };

  const openEditUserForm = (u: User) => {
    setEditingUser({ ...u });
    setIsUserModalOpen(true);
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.name || !editingUser.email) return;
    if (editingUser.id) {
      await onUpdateUser(editingUser.id, editingUser);
    } else {
      await onCreateUser({
        name: editingUser.name,
        email: editingUser.email,
        role: (editingUser.role as UserRole) || 'author',
        specialty: editingUser.specialty || 'Colaborador Editorial',
        bio: editingUser.bio || '',
        location: editingUser.location || 'Madrid, España',
      });
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadCode = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\//g, '_');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="min-h-screen text-[#171920] flex flex-col lg:flex-row transition-colors duration-300"
      style={{ backgroundColor: surfaceBg }}
    >
      {/* ================================================================= */}
      {/* LEFT SIDEBAR NAVIGATION (265px Modern Minimalist Workspace)       */}
      {/* ================================================================= */}
      <aside className="w-full lg:w-[265px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-[#dcdfe7] flex flex-col justify-between">
        <div>
          {/* Dynamic Brand Lockup (Reflects Live Logo & Colors + Version) */}
          <div className="px-6 py-5 border-b border-[#dcdfe7] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBackToBlog}
              className="text-2xl font-bold tracking-tight text-[#171920] cursor-pointer flex items-center min-w-0"
              title="Volver al Home Público"
            >
              {siteConfig.useImageLogo && siteConfig.logoImageUrl ? (
                <img
                  src={siteConfig.logoImageUrl}
                  alt={siteConfig.logoText || 'Logo'}
                  className="h-8 w-auto max-w-[140px] object-contain"
                />
              ) : (
                <span className="truncate">
                  {siteConfig.logoText || 'Kayleen'}
                  <span style={{ color: siteConfig.logoDotColor || primaryColor }}>.</span>
                </span>
              )}
            </button>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-[10px] uppercase tracking-widest text-[#595F71] font-semibold">
                CMS Admin
              </span>
              <span
                className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 text-white"
                style={{ backgroundColor: secondaryColor }}
              >
                {CMS_ADMIN_VERSION}
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              style={
                activeTab === 'overview'
                  ? { backgroundColor: primaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Resumen Editorial</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('articles')}
              style={
                activeTab === 'articles'
                  ? { backgroundColor: primaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'articles'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Artículos (Word &amp; Escritura)</span>
              </span>
              <span className="font-mono text-[11px] tabular-nums opacity-80">
                {db.articles.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('approvals')}
              style={
                activeTab === 'approvals'
                  ? { backgroundColor: primaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'approvals'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Aprobación de Artículos</span>
              </span>
              {pendingApprovalArticles.length > 0 ? (
                <span
                  className="font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded-[4px] text-white font-semibold"
                  style={{
                    backgroundColor: activeTab === 'approvals' ? '#171920' : '#D97706',
                  }}
                >
                  {pendingApprovalArticles.length} rev.
                </span>
              ) : (
                <span className="font-mono text-[11px] tabular-nums opacity-80">OK</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hashtags')}
              style={
                activeTab === 'hashtags'
                  ? { backgroundColor: primaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'hashtags'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Hash className="w-4 h-4" />
                <span>Gestión de Hashtags</span>
              </span>
              <span className="font-mono text-[11px] tabular-nums opacity-80">
                {(db.hashtags || []).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              style={
                activeTab === 'categories'
                  ? { backgroundColor: primaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'categories'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FolderKanban className="w-4 h-4" />
                <span>Categorías</span>
              </span>
              <span className="font-mono text-[11px] tabular-nums opacity-80">
                {availableCategories.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              style={
                activeTab === 'comments'
                  ? { backgroundColor: primaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'comments'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Comentarios</span>
              </span>
              {pendingComments.length > 0 ? (
                <span
                  className="font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded-[4px] text-white font-semibold"
                  style={{
                    backgroundColor:
                      activeTab === 'comments' ? '#171920' : primaryColor,
                  }}
                >
                  {pendingComments.length} pend.
                </span>
              ) : (
                <span className="font-mono text-[11px] tabular-nums opacity-80">
                  {db.comments.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              style={
                activeTab === 'users'
                  ? { backgroundColor: primaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'users'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Usuarios (Free ↔ Premium)</span>
              </span>
              <span className="font-mono text-[11px] tabular-nums opacity-80">
                {db.users.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('premium_plans')}
              style={
                activeTab === 'premium_plans'
                  ? { backgroundColor: '#D97706', color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'premium_plans'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-[#D97706]" />
                <span>Planes de Pago Premium</span>
              </span>
              <span className="font-mono text-[11px] tabular-nums opacity-80">
                {(db.subscriptionPlans || []).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              style={
                activeTab === 'messages'
                  ? { backgroundColor: secondaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'messages'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>Mensajería Privada</span>
              </span>
              {unreadMessagesCount > 0 ? (
                <span className="font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded-[4px] bg-[#FF2C54] text-white font-semibold">
                  {unreadMessagesCount} nuev.
                </span>
              ) : (
                <span className="font-mono text-[11px] tabular-nums opacity-80">
                  {(db.messages || []).length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const targetId = currentUser?.id || selectedProfileUserId || db.users[0]?.id;
                if (targetId) handleSelectProfileTarget(targetId);
                setActiveTab('profile_settings');
              }}
              style={
                activeTab === 'profile_settings'
                  ? { backgroundColor: primaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'profile_settings'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <UserCog className="w-4 h-4" />
                <span>Configuración de Perfil</span>
              </span>
            </button>

            {/* Independent Item: Suscriptores del Newsletter */}
            <button
              type="button"
              onClick={() => setActiveTab('subscribers')}
              style={
                activeTab === 'subscribers'
                  ? { backgroundColor: secondaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'subscribers'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Mail className="w-4 h-4" />
                <span>Suscriptores Newsletter</span>
              </span>
              <span className="font-mono text-[11px] tabular-nums opacity-80">
                {(db.subscriberRecords || []).length}
              </span>
            </button>

            {/* Independent Item: Campañas de Marketing */}
            <button
              type="button"
              onClick={() => setActiveTab('campaigns')}
              style={
                activeTab === 'campaigns'
                  ? { backgroundColor: secondaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'campaigns'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4" />
                <span>Campañas de Marketing</span>
              </span>
              <span className="font-mono text-[11px] tabular-nums opacity-80">
                {(db.campaigns || []).length}
              </span>
            </button>

            {/* Independent Item: Configuración del Sitio */}
            <button
              type="button"
              onClick={() => setActiveTab('site_settings')}
              style={
                activeTab === 'site_settings'
                  ? { backgroundColor: primaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'site_settings'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Configuración &amp; SEO</span>
              </span>
            </button>

            {/* Independent Item: Editor Global de Paleta de Colores (CSS Variables) */}
            <button
              type="button"
              onClick={() => setActiveTab('color_palette')}
              style={
                activeTab === 'color_palette'
                  ? { backgroundColor: secondaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'color_palette'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Palette className="w-4 h-4" />
                <span>Paleta de Colores (CSS)</span>
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/15"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/15"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                />
              </span>
            </button>

            {/* Independent Item: Políticas Legales, Privacidad y Devolución */}
            <button
              type="button"
              onClick={() => setActiveTab('legal_pages')}
              style={
                activeTab === 'legal_pages'
                  ? { backgroundColor: primaryColor, color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'legal_pages'
                  ? 'text-white shadow-xs'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Políticas Legales y Privacidad</span>
              </span>
              <span className="font-mono text-[10px] uppercase opacity-80">4 págs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('php_export')}
              style={
                activeTab === 'php_export'
                  ? { backgroundColor: '#171920', color: '#ffffff' }
                  : undefined
              }
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'php_export'
                  ? 'bg-[#171920] text-white'
                  : 'text-[#4b546e] hover:bg-[#f7f8fc] hover:text-[#171920]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Code2 className="w-4 h-4" />
                <span>Código PHP + MySQL</span>
              </span>
              <span className="font-mono text-[10px] uppercase opacity-75">SQL/PDO</span>
            </button>
          </nav>
        </div>

        {/* Bottom Current User, Version Info & Return to Public Site */}
        <div className="p-4 border-t border-[#dcdfe7] space-y-3">
          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                <div className="flex items-center gap-3 min-w-0">
                  <AuthorAvatar user={currentUser} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#171920] truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-[#595F71] truncate capitalize">
                      Rol: {currentUser.role} {currentUser.isPremium ? '· ★ Premium' : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectProfileTarget(currentUser.id);
                    setActiveTab('profile_settings');
                  }}
                  className="p-1.5 rounded-[6px] text-[#595F71] hover:text-[#171920] hover:bg-[#f7f8fc] transition-colors cursor-pointer shrink-0"
                  title="Configurar mi perfil y redes sociales"
                >
                  <UserCog className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal('login', 'all')}
                    className="py-1.5 px-2 rounded-[6px] text-[11px] font-semibold text-[#171920] bg-[#f7f8fc] border border-[#dcdfe7] hover:border-[#171920] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <LogIn className="w-3 h-3 text-[#5960FF]" />
                    <span>Cambiar Cuenta</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="py-1.5 px-2 rounded-[6px] text-[11px] font-bold text-[#DC2626] bg-red-50 border border-red-200 hover:bg-[#DC2626] hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Cerrar Sesión</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            onOpenAuthModal && (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('login', 'admin')}
                  className="py-2 px-2 rounded-[6px] text-[11px] font-bold text-white bg-[#171920] hover:bg-[#FF2C54] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Login Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('register', 'reader')}
                  className="py-2 px-2 rounded-[6px] text-[11px] font-bold text-white bg-[#FF2C54] hover:bg-[#171920] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Registrar</span>
                </button>
              </div>
            )
          )}

          {/* Active Theme Color Swatches + Version Info */}
          <div className="px-2.5 py-2 rounded-[8px] bg-[#f7f8fc] border border-[#dcdfe7] flex items-center justify-between text-[11px] text-[#595F71]">
            <span className="font-mono font-semibold text-[#171920]">
              Versión {CMS_ADMIN_VERSION}
            </span>
            <div className="flex items-center gap-1.5" title="Paleta activa del sitio">
              <span
                className="w-3 h-3 rounded-full border border-black/10"
                style={{ backgroundColor: primaryColor }}
              />
              <span
                className="w-3 h-3 rounded-full border border-black/10"
                style={{ backgroundColor: secondaryColor }}
              />
              <span
                className="w-3 h-3 rounded-full border border-black/10"
                style={{ backgroundColor: surfaceBg }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToBlog}
            className="w-full py-2.5 px-3 rounded-[8px] text-xs font-semibold text-[#171920] bg-[#f7f8fc] border border-[#dcdfe7] hover:bg-[#171920] hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ver Blog Público (Home 03)</span>
          </button>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* MAIN WORKSPACE VIEWPORT                                           */}
      {/* ================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Contextual Top Bar Contract (Breadcrumbs Left, Primary Action + Login/Logout Right) */}
        <header className="bg-white border-b border-[#dcdfe7] px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#595F71] truncate">
            <span className="font-semibold text-[#171920]">
              {siteConfig.logoText || 'Kayleen'} CMS
            </span>
            <span
              className="font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {CMS_ADMIN_VERSION}
            </span>
            <span aria-hidden="true">/</span>
            <span className="text-[#171920] font-semibold truncate">
              {activeTab === 'overview' && 'Resumen Editorial General'}
              {activeTab === 'articles' &&
                'Creación y Gestión de Artículos (Estilo Word + Modo Escritura + Premium)'}
              {activeTab === 'approvals' &&
                'Sistema de Aprobación Editorial y Publicación Programada'}
              {activeTab === 'hashtags' &&
                'Almacenamiento y Administración de #Hashtags'}
              {activeTab === 'categories' && 'Gestión de Categorías'}
              {activeTab === 'comments' && 'Moderación de Comentarios'}
              {activeTab === 'users' &&
                'Gestión Integral de Usuarios (Free ↔ Premium, Altas, Bajas y Vencimientos)'}
              {activeTab === 'premium_plans' &&
                'Configuración de Planes de Pago y Suscripciones Premium'}
              {activeTab === 'messages' &&
                'Mensajería Privada (Usuarios Premium, Administradores, Moderadores y Escritores)'}
              {activeTab === 'profile_settings' &&
                'Configuración de Perfil (Biografía y Redes Sociales)'}
              {activeTab === 'subscribers' && 'Suscriptores del Newsletter'}
              {activeTab === 'campaigns' && 'Campañas de Marketing y Boletines'}
              {activeTab === 'site_settings' &&
                'Configuración del Sitio (Logo, Colores, SEO y Páginas Legales)'}
              {activeTab === 'color_palette' &&
                'Editor Global de Paleta de Colores en Tiempo Real (Variables CSS Primary & Secondary)'}
              {activeTab === 'legal_pages' &&
                'Editor de Páginas de Políticas Legales, Privacidad, Devoluciones y Términos'}
              {activeTab === 'php_export' && 'Arquitectura PHP 8 + MySQL Relacional'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('color_palette')}
              className={`px-3 py-2 rounded-[8px] text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'color_palette'
                  ? 'bg-[#171920] text-white border-[#171920]'
                  : 'text-[#171920] bg-[#f7f8fc] border-[#dcdfe7] hover:border-[#5960FF]'
              }`}
              title="Modificar dinámicamente los colores Primary y Secondary en tiempo real con CSS Variables"
            >
              <Palette className="w-3.5 h-3.5 text-[#5960FF]" />
              <span>Paleta de Colores</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('legal_pages')}
              className={`px-3 py-2 rounded-[8px] text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'legal_pages'
                  ? 'bg-[#171920] text-white border-[#171920]'
                  : 'text-[#171920] bg-[#f7f8fc] border-[#dcdfe7] hover:border-[#FF2C54]'
              }`}
              title="Editar Políticas de Privacidad, Devolución, Términos y Aviso Legal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF2C54]" />
              <span>Políticas Legales</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              className="px-3 py-2 rounded-[8px] text-xs font-semibold text-[#171920] bg-[#f7f8fc] border border-[#dcdfe7] hover:border-[#171920] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Inbox className="w-3.5 h-3.5 text-[#5960FF]" />
              <span>Mensajes ({unreadMessagesCount})</span>
            </button>
            <button
              type="button"
              onClick={openNewArticleForm}
              style={{ backgroundColor: primaryColor }}
              className="px-3.5 py-2 rounded-[8px] text-xs font-semibold text-white hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Artículo</span>
            </button>
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={() => onOpenAuthModal('login', 'all')}
                className="px-3 py-2 rounded-[8px] text-xs font-semibold text-[#171920] bg-white border border-[#dcdfe7] hover:border-[#5960FF] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                title="Cambiar de cuenta o iniciar sesión como Usuario o Administrador"
              >
                <LogIn className="w-3.5 h-3.5 text-[#5960FF]" />
                <span>{currentUser ? 'Cambiar Cuenta' : 'Iniciar Sesión'}</span>
              </button>
            )}
            {currentUser && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-2 rounded-[8px] text-xs font-bold text-[#DC2626] bg-red-50 border border-red-200 hover:bg-[#DC2626] hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                title="Cerrar sesión actual"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout / Salir</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-8">
          {/* ------------------------------------------------------------- */}
          {/* TAB 1: OVERVIEW (RESUMEN EDITORIAL EXPANDIDO)                 */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'overview' && (
            <>
              {/* Expanded 6-Card Executive Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Visitas Totales al Sitio & Tráfico */}
                <div className="bg-white border border-[#dcdfe7] rounded-[12px] p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#595F71]">
                      Visitas Totales al Sitio
                    </span>
                    <Eye className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <div className="font-mono text-2xl font-bold text-[#171920] tabular-nums">
                    {totalViews.toLocaleString('es-ES')}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#595F71] tabular-nums">
                    <span>
                      Promedio:{' '}
                      <strong className="text-[#171920]">
                        {Math.round(
                          totalViews / Math.max(1, db.articles.length)
                        ).toLocaleString('es-ES')}
                      </strong>{' '}
                      visitas/post
                    </span>
                    <span className="text-[#16A34A] font-semibold">
                      {totalShares.toLocaleString('es-ES')} compartidos
                    </span>
                  </div>
                </div>

                {/* 2. Cantidad de Usuarios y Autores Registrados */}
                <div className="bg-white border border-[#dcdfe7] rounded-[12px] p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#595F71]">
                      Usuarios y Autores Registrados
                    </span>
                    <Users className="w-4 h-4" style={{ color: secondaryColor }} />
                  </div>
                  <div className="font-mono text-2xl font-bold text-[#171920] tabular-nums">
                    {db.users.length}{' '}
                    <span className="text-xs font-normal text-[#595F71]">
                      cuentas activas
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#595F71]">
                    <span>
                      {adminUsersCount} Admin · {editorUsersCount} Editores ·{' '}
                      {authorUsersCount} Autores · {readerUsersCount} Lectores
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('users')}
                      style={{ color: secondaryColor }}
                      className="font-semibold hover:underline cursor-pointer"
                    >
                      Ver usuarios →
                    </button>
                  </div>
                </div>

                {/* 3. Balance de Likes, Dislikes y Valoración */}
                <div className="bg-white border border-[#dcdfe7] rounded-[12px] p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#595F71]">
                      Valoraciones (Likes / Dislikes)
                    </span>
                    <ThumbsUp className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  <div className="flex items-baseline gap-3 font-mono tabular-nums">
                    <span className="text-2xl font-bold text-[#16A34A]">
                      +{totalLikes.toLocaleString('es-ES')}
                    </span>
                    <span className="text-sm font-semibold text-[#DC2626]">
                      -{totalDislikes.toLocaleString('es-ES')} dislikes
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#595F71]">
                    <span>
                      Índice de aprobación:{' '}
                      <strong className="text-[#16A34A]">{likeApprovalRatio}%</strong>
                    </span>
                    <span>{totalShares} difusiones</span>
                  </div>
                </div>

                {/* 4. Artículos Publicados, Borradores y Categorías */}
                <div className="bg-white border border-[#dcdfe7] rounded-[12px] p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#595F71]">
                      Artículos &amp; Categorías
                    </span>
                    <FileText className="w-4 h-4" style={{ color: primaryColor }} />
                  </div>
                  <div className="font-mono text-2xl font-bold text-[#171920] tabular-nums">
                    {db.articles.filter((a) => a.status === 'published').length}{' '}
                    <span className="text-xs font-normal text-[#595F71]">
                      publicados / {db.articles.filter((a) => a.status === 'draft').length}{' '}
                      borr.
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-[#595F71]">
                      En <strong>{availableCategories.length}</strong> categorías activas
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('articles')}
                      style={{ color: primaryColor }}
                      className="font-semibold hover:underline cursor-pointer"
                    >
                      Gestionar →
                    </button>
                  </div>
                </div>

                {/* 5. Comentarios Totales y Moderación */}
                <div className="bg-white border border-[#dcdfe7] rounded-[12px] p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#595F71]">
                      Comentarios &amp; Moderación
                    </span>
                    <MessageSquare className="w-4 h-4 text-[#D97706]" />
                  </div>
                  <div className="font-mono text-2xl font-bold text-[#171920] tabular-nums">
                    {db.comments.length}{' '}
                    <span className="text-xs font-semibold text-[#D97706]">
                      ({pendingComments.length} pendientes)
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-[#16A34A] font-medium">
                      {approvedComments.length} aprobados en vivo
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('comments')}
                      style={{ color: primaryColor }}
                      className="font-semibold hover:underline cursor-pointer"
                    >
                      Moderar →
                    </button>
                  </div>
                </div>

                {/* 6. Suscriptores del Newsletter & Campañas */}
                <div className="bg-white border border-[#dcdfe7] rounded-[12px] p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#595F71]">
                      Suscriptores &amp; Campañas
                    </span>
                    <Mail className="w-4 h-4" style={{ color: secondaryColor }} />
                  </div>
                  <div className="font-mono text-2xl font-bold text-[#171920] tabular-nums">
                    {activeSubscribersCount}{' '}
                    <span className="text-xs font-normal text-[#595F71]">
                      activos ({vipSubscribersCount} VIP)
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => setActiveTab('subscribers')}
                      style={{ color: secondaryColor }}
                      className="font-semibold hover:underline cursor-pointer"
                    >
                      Ver suscriptores →
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('campaigns')}
                      style={{ color: primaryColor }}
                      className="font-semibold hover:underline cursor-pointer"
                    >
                      {(db.campaigns || []).length} campañas →
                    </button>
                  </div>
                </div>
              </div>

              {/* Pending Comments Priority Queue */}
              <section className="bg-white border border-[#dcdfe7] rounded-[12px] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#dcdfe7] flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#171920]">
                      Comentarios Pendientes de Aprobación ({pendingComments.length})
                    </h2>
                    <p className="text-xs text-[#595F71]">
                      Los comentarios enviados requieren aprobación administrativa antes de mostrarse.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('comments')}
                    style={{ color: primaryColor }}
                    className="text-xs font-semibold hover:underline cursor-pointer"
                  >
                    Ver todos ({db.comments.length})
                  </button>
                </div>

                {pendingComments.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] mx-auto mb-2" />
                    <p className="text-xs text-[#4b546e]">
                      No hay comentarios pendientes en la cola de moderación.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#dcdfe7]">
                    {pendingComments.map((cmt) => {
                      const art = db.articles.find((a) => a.id === cmt.articleId);
                      return (
                        <div
                          key={cmt.id}
                          className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f7f8fc]"
                        >
                          <div className="space-y-1 max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-semibold text-[#171920]">
                                {cmt.authorName}
                              </span>
                              <span className="text-[#9497AE]" aria-hidden="true">
                                ·
                              </span>
                              <span className="text-[#595F71]">{cmt.authorEmail}</span>
                              <span className="text-[#9497AE]" aria-hidden="true">
                                ·
                              </span>
                              <span className="text-[#D97706] font-medium inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Pendiente
                              </span>
                            </div>
                            <p className="text-xs text-[#4b546e] leading-relaxed">
                              “{cmt.content}”
                            </p>
                            {art && (
                              <p className="text-[11px] text-[#595F71]">
                                En artículo:{' '}
                                <button
                                  type="button"
                                  onClick={() => onViewArticle(art.id)}
                                  className="text-[#171920] font-medium underline hover:text-[#FF2C54] cursor-pointer"
                                >
                                  {art.title}
                                </button>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => onUpdateCommentStatus(cmt.id, 'approved')}
                              className="px-3 py-1.5 rounded-[6px] text-xs font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateCommentStatus(cmt.id, 'rejected')}
                              className="px-3 py-1.5 rounded-[6px] text-xs font-semibold text-[#DC2626] border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Recent vs Most Popular Articles Table with Full Engagement Metrics */}
              <section className="bg-white border border-[#dcdfe7] rounded-[12px] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#dcdfe7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-[#171920]">
                      {overviewArticlesSort === 'recent' &&
                        'Artículos Recientes (Rendimiento y Edición Rápida)'}
                      {overviewArticlesSort === 'popular' &&
                        'Artículos Más Populares (Ordenados por Visitas y Likes)'}
                      {overviewArticlesSort === 'commented' &&
                        'Artículos Más Comentados (Ordenados por Participación)'}
                    </h2>
                    <p className="text-xs text-[#595F71] mt-0.5">
                      Visualiza cada artículo con sus visitas, comentarios, likes, dislikes y compartidos en tiempo real.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Switcher: Artículos Recientes vs Más Populares vs Más Comentados */}
                    <div className="flex items-center gap-1 p-1 bg-[#f7f8fc] rounded-[8px] border border-[#dcdfe7]">
                      <button
                        type="button"
                        onClick={() => setOverviewArticlesSort('recent')}
                        style={
                          overviewArticlesSort === 'recent'
                            ? { backgroundColor: '#171920', color: '#ffffff' }
                            : undefined
                        }
                        className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                          overviewArticlesSort === 'recent'
                            ? 'text-white'
                            : 'text-[#4b546e] hover:text-[#171920]'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Artículos Recientes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOverviewArticlesSort('popular')}
                        style={
                          overviewArticlesSort === 'popular'
                            ? { backgroundColor: primaryColor, color: '#ffffff' }
                            : undefined
                        }
                        className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                          overviewArticlesSort === 'popular'
                            ? 'text-white'
                            : 'text-[#4b546e] hover:text-[#171920]'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Más Populares</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOverviewArticlesSort('commented')}
                        style={
                          overviewArticlesSort === 'commented'
                            ? { backgroundColor: secondaryColor, color: '#ffffff' }
                            : undefined
                        }
                        className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                          overviewArticlesSort === 'commented'
                            ? 'text-white'
                            : 'text-[#4b546e] hover:text-[#171920]'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Más Comentados</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('articles')}
                      style={{ color: primaryColor }}
                      className="text-xs font-semibold hover:underline cursor-pointer ml-1"
                    >
                      Ver todos ({db.articles.length})
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#dcdfe7] text-[11px] uppercase tracking-wider text-[#595F71] bg-[#f7f8fc]">
                        <th className="py-3 px-6 font-semibold">Título del Artículo</th>
                        <th className="py-3 px-3 font-semibold">Categoría</th>
                        <th className="py-3 px-3 font-semibold text-center">Visitas</th>
                        <th className="py-3 px-3 font-semibold text-center">Comentarios</th>
                        <th className="py-3 px-3 font-semibold text-center">
                          Likes / Dislikes
                        </th>
                        <th className="py-3 px-3 font-semibold text-center">Compartidos</th>
                        <th className="py-3 px-3 font-semibold">Estado</th>
                        <th className="py-3 px-6 font-semibold text-right">Acciones Rápidas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dcdfe7] text-xs">
                      {sortedOverviewArticles.slice(0, 8).map((art) => {
                        const authorsList = getArticleAuthorsList(art);
                        const cmtStats = getArticleCommentsStats(art.id);
                        return (
                          <tr key={art.id} className="hover:bg-[#f7f8fc]">
                            <td className="py-3.5 px-6 font-semibold text-[#171920] max-w-xs">
                              <button
                                type="button"
                                onClick={() => onViewArticle(art.id)}
                                className="hover:text-[#FF2C54] transition-colors text-left line-clamp-1 cursor-pointer"
                              >
                                {art.title}
                              </button>
                              <div className="text-[11px] font-normal text-[#595F71] truncate">
                                Por {authorsList.map((a) => a.name).join(' · ')} ·{' '}
                                {art.publishedAt}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-[#4b546e] font-medium">
                              {art.category}
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono font-bold text-[#171920] tabular-nums">
                              <span className="inline-flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-[#5960FF]" />
                                {art.views.toLocaleString('es-ES')}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                              <span className="inline-flex items-center gap-1 font-semibold text-[#171920]">
                                <MessageSquare className="w-3.5 h-3.5 text-[#595F71]" />
                                {cmtStats.total}
                              </span>
                              {cmtStats.pending > 0 && (
                                <span className="block text-[10px] text-[#D97706] font-semibold">
                                  ({cmtStats.pending} pend.)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                              <div className="inline-flex items-center gap-2.5">
                                <span
                                  className="inline-flex items-center gap-1 text-[#16A34A] font-semibold"
                                  title="Me gusta"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  {art.likes}
                                </span>
                                <span
                                  className="inline-flex items-center gap-1 text-[#DC2626] font-semibold"
                                  title="No me gusta (Dislikes)"
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                  {art.dislikes || 0}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono text-[#4b546e] tabular-nums">
                              <span className="inline-flex items-center gap-1">
                                <Share2 className="w-3.5 h-3.5 text-[#595F71]" />
                                {art.shares}
                              </span>
                            </td>
                            <td className="py-3.5 px-3">
                              {art.status === 'published' ? (
                                <span className="text-[#16A34A] font-semibold inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Publicado
                                </span>
                              ) : (
                                <span className="text-[#D97706] font-semibold inline-flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  Borrador
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-6 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditArticleForm(art)}
                                  className="px-2.5 py-1 rounded-[6px] text-xs font-semibold text-[#171920] border border-[#dcdfe7] bg-white hover:bg-[#171920] hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Editar</span>
                                </button>

                                {/* Quick 1-Click Draft / Publish Toggle right next to Editar */}
                                {art.status === 'published' ? (
                                  <button
                                    type="button"
                                    onClick={() => onToggleArticleStatus(art.id, 'draft')}
                                    className="px-2.5 py-1 rounded-[6px] text-xs font-semibold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] hover:bg-[#FEF3C7] transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    title="Pasar rápidamente a borrador"
                                  >
                                    <FileArchive className="w-3 h-3" />
                                    <span>Borrador</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => onToggleArticleStatus(art.id, 'published')}
                                    className="px-2.5 py-1 rounded-[6px] text-xs font-semibold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] hover:bg-[#DCFCE7] transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    title="Publicar inmediatamente"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Publicar</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: GESTIÓN DE ARTÍCULOS (CON MÉTRICAS Y BORRADOR RÁPIDO)  */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'articles' && (
            <section className="bg-white border border-[#dcdfe7] rounded-[12px] overflow-hidden">
              <div className="p-6 border-b border-[#dcdfe7] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-[#9497AE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={articleSearch}
                      onChange={(e) => setArticleSearch(e.target.value)}
                      placeholder="Buscar artículo por título o extracto..."
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Sort Selector: Recientes vs Más Populares vs Más Comentados */}
                    <div className="flex items-center gap-1 p-1 bg-[#f7f8fc] rounded-[8px] border border-[#dcdfe7]">
                      <button
                        type="button"
                        onClick={() => setArticlesTabSort('recent')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-[6px] transition-colors cursor-pointer ${
                          articlesTabSort === 'recent'
                            ? 'bg-[#171920] text-white'
                            : 'text-[#595F71] hover:text-[#171920]'
                        }`}
                      >
                        Recientes
                      </button>
                      <button
                        type="button"
                        onClick={() => setArticlesTabSort('popular')}
                        style={
                          articlesTabSort === 'popular'
                            ? { backgroundColor: primaryColor, color: '#ffffff' }
                            : undefined
                        }
                        className={`px-2.5 py-1 text-xs font-semibold rounded-[6px] transition-colors cursor-pointer ${
                          articlesTabSort === 'popular'
                            ? 'text-white'
                            : 'text-[#595F71] hover:text-[#171920]'
                        }`}
                      >
                        Más Populares
                      </button>
                      <button
                        type="button"
                        onClick={() => setArticlesTabSort('commented')}
                        style={
                          articlesTabSort === 'commented'
                            ? { backgroundColor: secondaryColor, color: '#ffffff' }
                            : undefined
                        }
                        className={`px-2.5 py-1 text-xs font-semibold rounded-[6px] transition-colors cursor-pointer ${
                          articlesTabSort === 'commented'
                            ? 'text-white'
                            : 'text-[#595F71] hover:text-[#171920]'
                        }`}
                      >
                        Más Comentados
                      </button>
                    </div>

                    {/* Status Quick Filter */}
                    <div className="flex items-center gap-1 p-1 bg-[#f7f8fc] rounded-[8px] border border-[#dcdfe7]">
                      {(['ALL', 'published', 'draft'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusFilter(st)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-[6px] transition-colors cursor-pointer ${
                            statusFilter === st
                              ? 'bg-[#5960FF] text-white'
                              : 'text-[#595F71] hover:text-[#171920]'
                          }`}
                        >
                          {st === 'ALL'
                            ? 'Todos'
                            : st === 'published'
                            ? 'Publicados'
                            : 'Borradores'}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('categories')}
                      className="px-3 py-1.5 text-xs font-semibold text-[#171920] bg-[#f7f8fc] border border-[#dcdfe7] rounded-[8px] hover:border-[#FF2C54] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderKanban className="w-3.5 h-3.5 text-[#FF2C54]" />
                      <span>Editar Categorías ({availableCategories.length})</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Category Filter Controls */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('ALL')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-colors cursor-pointer ${
                      categoryFilter === 'ALL'
                        ? 'bg-[#171920] text-white'
                        : 'bg-[#f7f8fc] text-[#595F71] hover:text-[#171920]'
                    }`}
                  >
                    Todas las Categorías
                  </button>
                  {availableCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryFilter(cat.name)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-colors cursor-pointer ${
                        categoryFilter === cat.name
                          ? 'bg-[#171920] text-white'
                          : 'bg-[#f7f8fc] text-[#595F71] hover:text-[#171920]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#dcdfe7] text-[11px] uppercase tracking-wider text-[#595F71] bg-[#f7f8fc]">
                      <th className="py-3 px-6 font-semibold">Artículo &amp; Galería</th>
                      <th className="py-3 px-3 font-semibold">Categoría</th>
                      <th className="py-3 px-3 font-semibold">Autor &amp; Coautores</th>
                      <th className="py-3 px-3 font-semibold text-center">
                        Métricas (Visitas · Coment. · Likes/Dislikes)
                      </th>
                      <th className="py-3 px-3 font-semibold">Estado</th>
                      <th className="py-3 px-6 font-semibold text-right">
                        Acciones (Editar · Borrador Rápido · Eliminar)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dcdfe7] text-xs">
                    {filteredArticles.map((art) => {
                      const authorsList = getArticleAuthorsList(art);
                      const mainAuthor = authorsList[0];
                      const coAuthors = authorsList.slice(1);
                      const cmtStats = getArticleCommentsStats(art.id);
                      const imgCount =
                        Array.isArray(art.galleryImages) && art.galleryImages.length > 0
                          ? art.galleryImages.length
                          : 1;

                      return (
                        <tr key={art.id} className="hover:bg-[#f7f8fc]">
                          <td className="py-4 px-6 max-w-sm">
                            <div className="flex items-center gap-3.5">
                              <div className="w-16 h-11 rounded-[8px] overflow-hidden shrink-0 relative">
                                <EditorialVisual
                                  preset={art.visualPreset}
                                  customImageUrl={art.customImageUrl}
                                  alt={art.title}
                                  aspectRatio="fill"
                                  className="w-16 h-11"
                                />
                                {imgCount > 1 && (
                                  <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[9px] font-mono px-1 rounded">
                                    +{imgCount} img
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => onViewArticle(art.id)}
                                  className="font-semibold text-[#171920] hover:text-[#FF2C54] transition-colors line-clamp-1 text-left cursor-pointer"
                                >
                                  {art.title}
                                </button>
                                <p className="text-[11px] text-[#595F71] line-clamp-1">
                                  {art.publishedAt} · {art.readTimeMinutes} min · {imgCount}{' '}
                                  imagen(es)
                                  {art.featuredHero ? ' · ★ Hero Tile' : ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-3">
                            <span className="font-semibold text-[#171920]">
                              {art.category}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-[#4b546e]">
                            <div className="font-semibold text-[#171920]">
                              {mainAuthor.name}
                            </div>
                            {coAuthors.length > 0 && (
                              <div className="text-[11px] text-[#5960FF] font-medium">
                                + Colab: {coAuthors.map((c) => c.name).join(', ')}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-3 text-center font-mono tabular-nums">
                            <div className="inline-flex flex-wrap items-center justify-center gap-2.5 text-[11px] bg-[#f7f8fc] px-2.5 py-1.5 rounded-[8px] border border-[#dcdfe7]">
                              <span
                                className="inline-flex items-center gap-1 text-[#171920] font-bold"
                                title="Visitas al artículo"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#5960FF]" />
                                {art.views.toLocaleString('es-ES')}
                              </span>
                              <span className="text-[#dcdfe7]">|</span>
                              <span
                                className="inline-flex items-center gap-1 text-[#4b546e] font-semibold"
                                title="Comentarios totales"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-[#595F71]" />
                                {cmtStats.total}
                              </span>
                              <span className="text-[#dcdfe7]">|</span>
                              <span
                                className="inline-flex items-center gap-1 text-[#16A34A] font-semibold"
                                title="Likes"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                {art.likes}
                              </span>
                              <span
                                className="inline-flex items-center gap-1 text-[#DC2626] font-semibold"
                                title="Dislikes"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                                {art.dislikes || 0}
                              </span>
                              <span className="text-[#dcdfe7]">|</span>
                              <span
                                className="inline-flex items-center gap-1 text-[#595F71]"
                                title="Compartidos en redes"
                              >
                                <Share2 className="w-3 h-3" />
                                {art.shares}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-3">
                            {art.status === 'published' ? (
                              <span className="text-[#16A34A] font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Publicado
                              </span>
                            ) : (
                              <span className="text-[#D97706] font-semibold inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                En Borrador
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            {confirmDeleteArticleId === art.id ? (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await onDeleteArticle(art.id);
                                    setConfirmDeleteArticleId(null);
                                  }}
                                  className="px-2.5 py-1 rounded-[6px] text-[11px] font-semibold bg-[#DC2626] text-white cursor-pointer"
                                >
                                  Confirmar Borrado
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteArticleId(null)}
                                  className="px-2 py-1 rounded-[6px] text-[11px] text-[#4b546e] border border-[#dcdfe7] cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex flex-wrap items-center justify-end gap-2">
                                {/* 1. Botón Editar */}
                                <button
                                  type="button"
                                  onClick={() => openEditArticleForm(art)}
                                  className="px-3 py-1.5 rounded-[6px] text-xs font-semibold text-[#171920] border border-[#dcdfe7] bg-white hover:bg-[#171920] hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Editar</span>
                                </button>

                                {/* 2. Botón Rápido al costado de Editar: Pasar a Borrador / Publicar */}
                                {art.status === 'published' ? (
                                  <button
                                    type="button"
                                    onClick={() => onToggleArticleStatus(art.id, 'draft')}
                                    className="px-3 py-1.5 rounded-[6px] text-xs font-semibold text-[#D97706] bg-[#FFFBEB] border border-[#FDE68A] hover:bg-[#FEF3C7] transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    title="Poner en borrador de forma rápida"
                                  >
                                    <FileArchive className="w-3.5 h-3.5" />
                                    <span>Pasar a Borrador</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => onToggleArticleStatus(art.id, 'published')}
                                    className="px-3 py-1.5 rounded-[6px] text-xs font-semibold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] hover:bg-[#DCFCE7] transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    title="Publicar artículo de forma rápida"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Publicar Ahora</span>
                                  </button>
                                )}

                                {/* 3. Alerta Push Rápida, Ver & Eliminar */}
                                {onSendPushNotification && art.status === 'published' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onSendPushNotification({
                                        type: 'new_article',
                                        title: `📰 Nuevo en ${art.category}: ${art.title}`,
                                        body: art.excerpt || art.subtitle || art.title,
                                        imageUrl: art.customImageUrl,
                                        category: art.category,
                                        targetArticleId: art.id,
                                        ctaText: 'Leer artículo ahora',
                                        segment: 'active',
                                      })
                                    }
                                    className="px-2.5 py-1.5 rounded-[6px] text-xs font-semibold text-[#5960FF] bg-[#f7f8fc] border border-[#dcdfe7] hover:bg-[#5960FF] hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    title="Enviar notificación push al navegador sobre este artículo"
                                  >
                                    <BellRing className="w-3.5 h-3.5" />
                                    <span>Push</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => onViewArticle(art.id)}
                                  className="p-1.5 text-[#595F71] hover:text-[#5960FF] transition-colors cursor-pointer"
                                  title="Ver artículo en el blog"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteArticleId(art.id)}
                                  className="p-1.5 text-[#595F71] hover:text-[#DC2626] transition-colors cursor-pointer"
                                  title="Eliminar artículo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: GESTIÓN DE CATEGORÍAS (CREAR, EDITAR, BORRAR)          */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'categories' && (
            <section className="bg-white border border-[#dcdfe7] rounded-[12px] overflow-hidden">
              <div className="p-6 border-b border-[#dcdfe7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#171920]">
                    Gestión de Categorías del Blog
                  </h2>
                  <p className="text-xs text-[#595F71] mt-0.5">
                    Crea nuevas categorías, edita sus nombres para acomodar los artículos automáticamente o elimina las que no necesites.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openNewCategoryForm}
                  className="px-4 py-2 rounded-[8px] text-xs font-semibold text-white bg-[#FF2C54] hover:bg-[#171920] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Nueva Categoría</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#dcdfe7] text-[11px] uppercase tracking-wider text-[#595F71] bg-[#f7f8fc]">
                      <th className="py-3 px-6 font-semibold">Nombre de Categoría</th>
                      <th className="py-3 px-4 font-semibold">Slug</th>
                      <th className="py-3 px-4 font-semibold">Descripción</th>
                      <th className="py-3 px-4 font-semibold text-right">
                        Artículos Asociados
                      </th>
                      <th className="py-3 px-6 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dcdfe7] text-xs">
                    {availableCategories.map((cat) => {
                      const count = db.articles.filter(
                        (a) => a.category === cat.name
                      ).length;
                      return (
                        <tr key={cat.id} className="hover:bg-[#f7f8fc]">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: cat.color || '#FF2C54' }}
                              />
                              <span className="font-bold text-[#171920] text-sm">
                                {cat.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono text-[#595F71]">
                            /{cat.slug}
                          </td>
                          <td className="py-4 px-4 text-[#4b546e] max-w-md">
                            {cat.description}
                          </td>
                          <td className="py-4 px-4 text-right font-mono tabular-nums font-semibold text-[#171920]">
                            <button
                              type="button"
                              onClick={() => {
                                setCategoryFilter(cat.name);
                                setActiveTab('articles');
                              }}
                              className="text-[#5960FF] hover:underline cursor-pointer"
                            >
                              {count} artículo(s) →
                            </button>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {confirmDeleteCategoryId === cat.id ? (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await onDeleteCategory(cat.id);
                                    setConfirmDeleteCategoryId(null);
                                  }}
                                  className="px-2.5 py-1 rounded-[6px] text-[11px] font-semibold bg-[#DC2626] text-white cursor-pointer"
                                >
                                  Confirmar y Reubicar Posts
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteCategoryId(null)}
                                  className="px-2 py-1 rounded-[6px] text-[11px] text-[#4b546e] border border-[#dcdfe7] cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditCategoryForm(cat)}
                                  className="px-3 py-1.5 rounded-[6px] text-xs font-semibold text-[#171920] border border-[#dcdfe7] bg-white hover:bg-[#171920] hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Editar</span>
                                </button>
                                {availableCategories.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteCategoryId(cat.id)}
                                    className="px-2.5 py-1.5 rounded-[6px] text-xs font-semibold text-[#DC2626] border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    title="Borrar categoría"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Borrar</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: MODERACIÓN DE COMENTARIOS                              */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'comments' && (
            <section className="bg-white border border-[#dcdfe7] rounded-[12px] overflow-hidden">
              <div className="p-6 border-b border-[#dcdfe7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#171920]">
                    Sistema de Moderación de Comentarios
                  </h2>
                  <p className="text-xs text-[#595F71] mt-0.5">
                    Aprueba o rechaza los comentarios enviados por los lectores antes de su publicación.
                  </p>
                </div>

                {/* Segmented Status Filter */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f7f8fc] rounded-[8px] border border-[#dcdfe7]">
                  <button
                    type="button"
                    onClick={() => setCommentFilter('pending')}
                    className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer tabular-nums ${
                      commentFilter === 'pending'
                        ? 'bg-[#171920] text-white'
                        : 'text-[#595F71] hover:text-[#171920]'
                    }`}
                  >
                    Pendientes ({pendingComments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentFilter('approved')}
                    className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer tabular-nums ${
                      commentFilter === 'approved'
                        ? 'bg-[#171920] text-white'
                        : 'text-[#595F71] hover:text-[#171920]'
                    }`}
                  >
                    Aprobados ({approvedComments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentFilter('rejected')}
                    className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer tabular-nums ${
                      commentFilter === 'rejected'
                        ? 'bg-[#171920] text-white'
                        : 'text-[#595F71] hover:text-[#171920]'
                    }`}
                  >
                    Rechazados ({db.comments.filter((c) => c.status === 'rejected').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentFilter('all')}
                    className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer tabular-nums ${
                      commentFilter === 'all'
                        ? 'bg-[#171920] text-white'
                        : 'text-[#595F71] hover:text-[#171920]'
                    }`}
                  >
                    Todos ({db.comments.length})
                  </button>
                </div>
              </div>

              {filteredComments.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm text-[#4b546e]">
                    No hay comentarios en este filtro actualmente.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#dcdfe7]">
                  {filteredComments.map((cmt) => {
                    const art = db.articles.find((a) => a.id === cmt.articleId);
                    return (
                      <div
                        key={cmt.id}
                        className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-[#f7f8fc]"
                      >
                        <div className="space-y-2 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-[#171920] text-sm">
                              {cmt.authorName}
                            </span>
                            <span className="text-[#9497AE]" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-[#595F71]">{cmt.authorEmail}</span>
                            <span className="text-[#9497AE]" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-[#595F71]">{cmt.createdAt}</span>
                            <span className="text-[#9497AE]" aria-hidden="true">
                              ·
                            </span>
                            {cmt.status === 'pending' && (
                              <span className="text-[#D97706] font-semibold inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Pendiente de Aprobación
                              </span>
                            )}
                            {cmt.status === 'approved' && (
                              <span className="text-[#16A34A] font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Aprobado y Público
                              </span>
                            )}
                            {cmt.status === 'rejected' && (
                              <span className="text-[#DC2626] font-semibold inline-flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Rechazado
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-[#171920] leading-relaxed bg-[#f7f8fc] p-3.5 rounded-[8px] border border-[#dcdfe7]">
                            “{cmt.content}”
                          </p>

                          {art && (
                            <div className="text-xs text-[#595F71]">
                              Artículo asociado:{' '}
                              <button
                                type="button"
                                onClick={() => onViewArticle(art.id)}
                                className="font-semibold text-[#171920] hover:text-[#FF2C54] underline cursor-pointer"
                              >
                                {art.title}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {cmt.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => onUpdateCommentStatus(cmt.id, 'approved')}
                              className="px-4 py-2 rounded-[6px] text-xs font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar Publicación</span>
                            </button>
                          )}
                          {cmt.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => onUpdateCommentStatus(cmt.id, 'rejected')}
                              className="px-3.5 py-2 rounded-[6px] text-xs font-semibold text-[#D97706] border border-[#FDE68A] bg-[#FFFBEB] hover:bg-[#FEF3C7] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteComment(cmt.id)}
                            className="px-3 py-2 rounded-[6px] text-xs font-semibold text-[#DC2626] border border-[#dcdfe7] hover:bg-[#FEF2F2] transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Eliminar permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: SISTEMA DE APROBACIÓN DE ARTÍCULOS Y PROGRAMACIÓN        */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'approvals' && (
            <section className="bg-white border border-[#dcdfe7] rounded-[12px] overflow-hidden">
              <div className="p-6 border-b border-[#dcdfe7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#171920] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#FF2C54]" />
                    <span>
                      Sistema de Aprobación Editorial (Redactores, Moderadores y Administradores)
                    </span>
                  </h2>
                  <p className="text-xs text-[#595F71] mt-0.5">
                    Aprueba o rechaza los artículos enviados por los escritores. Al aprobar un artículo, se publica de forma automática o en la fecha y hora programada.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f7f8fc] rounded-[8px] border border-[#dcdfe7]">
                  {(
                    [
                      { key: 'ALL', label: `Todos (${db.articles.length})` },
                      {
                        key: 'pending_review',
                        label: `En Revisión (${pendingApprovalArticles.length})`,
                      },
                      {
                        key: 'approved',
                        label: `Aprobados (${
                          db.articles.filter((a) => (a.approvalStatus || 'approved') === 'approved')
                            .length
                        })`,
                      },
                      {
                        key: 'rejected',
                        label: `Rechazados (${
                          db.articles.filter((a) => a.approvalStatus === 'rejected').length
                        })`,
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setApprovalFilter(item.key)}
                      className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
                        approvalFilter === item.key
                          ? 'bg-[#171920] text-white'
                          : 'text-[#595F71] hover:text-[#171920]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-[#dcdfe7]">
                {db.articles
                  .filter((a) =>
                    approvalFilter === 'ALL'
                      ? true
                      : (a.approvalStatus || 'approved') === approvalFilter
                  )
                  .map((art) => {
                    const artAuthor =
                      db.users.find((u) => u.id === art.authorId) || db.users[0];
                    const currentApproval = art.approvalStatus || 'approved';
                    const currentMode =
                      publishModeMap[art.id] || art.publishMode || 'immediate';
                    const currentSchedule =
                      scheduleDateMap[art.id] !== undefined
                        ? scheduleDateMap[art.id]
                        : art.scheduledPublishAt || '2026-06-01T09:00';
                    const currentNotes =
                      reviewNotesMap[art.id] !== undefined
                        ? reviewNotesMap[art.id]
                        : art.reviewNotes || '';

                    return (
                      <div
                        key={art.id}
                        className="p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6 hover:bg-[#f7f8fc]"
                      >
                        <div className="space-y-2.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {currentApproval === 'pending_review' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wider text-[11px]">
                                ⏳ Pendiente de Aprobación
                              </span>
                            )}
                            {currentApproval === 'approved' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
                                ✅ Aprobado ({art.status === 'scheduled' ? 'Programado' : 'Publicado'})
                              </span>
                            )}
                            {currentApproval === 'rejected' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold uppercase tracking-wider text-[11px]">
                                ❌ Rechazado por Redacción
                              </span>
                            )}
                            {art.isPremium && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-bold uppercase tracking-wider text-[10px]">
                                ★ Artículo Premium
                              </span>
                            )}
                            <span className="text-[#FF2C54] font-semibold">{art.category}</span>
                            <span>·</span>
                            <span className="text-[#595F71]">
                              Autor: <strong className="text-[#171920]">{artAuthor.name}</strong>
                            </span>
                            {art.reviewedBy && (
                              <>
                                <span>·</span>
                                <span className="text-[#5960FF] font-medium">
                                  Revisado por: {art.reviewedBy}
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-[#171920]">{art.title}</h3>
                          <p className="text-xs text-[#4b546e] leading-relaxed">{art.excerpt}</p>

                          {/* Publication Mode & Schedule Controls */}
                          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-[10px] border border-[#dcdfe7]">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                                Modo de Publicación al Aprobar
                              </label>
                              <select
                                value={currentMode}
                                onChange={(e) =>
                                  setPublishModeMap({
                                    ...publishModeMap,
                                    [art.id]: e.target.value as ArticlePublishMode,
                                  })
                                }
                                className="w-full px-2.5 py-1.5 text-xs rounded-[6px] border border-[#dcdfe7] bg-white font-semibold"
                              >
                                <option value="immediate">
                                  Publicación Automática Inmediata
                                </option>
                                <option value="scheduled">
                                  Programar Fecha y Hora de Publicación
                                </option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                                Fecha / Hora Programada
                              </label>
                              <input
                                type="datetime-local"
                                value={currentSchedule}
                                onChange={(e) =>
                                  setScheduleDateMap({
                                    ...scheduleDateMap,
                                    [art.id]: e.target.value,
                                  })
                                }
                                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-[6px] border border-[#dcdfe7] bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-[#171920] mb-1">
                                Notas del Redactor / Moderador / Admin
                              </label>
                              <input
                                type="text"
                                value={currentNotes}
                                onChange={(e) =>
                                  setReviewNotesMap({
                                    ...reviewNotesMap,
                                    [art.id]: e.target.value,
                                  })
                                }
                                placeholder="Observaciones editoriales..."
                                className="w-full px-2.5 py-1.5 text-xs rounded-[6px] border border-[#dcdfe7] bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap lg:flex-col items-stretch gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              onApproveArticle &&
                              onApproveArticle(art.id, {
                                approvalStatus: 'approved',
                                publishMode: currentMode,
                                scheduledPublishAt: currentSchedule,
                                reviewedBy: `${currentUser?.name || 'Administración'} (${
                                  currentUser?.role || 'admin'
                                })`,
                                reviewNotes:
                                  currentNotes ||
                                  'Aprobado por el consejo editorial para su publicación.',
                              })
                            }
                            className="px-4 py-2 rounded-[8px] text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {currentMode === 'scheduled'
                                ? 'Aprobar y Programar'
                                : 'Aprobar y Publicar Ahora'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onApproveArticle &&
                              onApproveArticle(art.id, {
                                approvalStatus: 'rejected',
                                publishMode: currentMode,
                                scheduledPublishAt: currentSchedule,
                                reviewedBy: `${currentUser?.name || 'Moderador'} (${
                                  currentUser?.role || 'moderator'
                                })`,
                                reviewNotes:
                                  currentNotes ||
                                  'Requiere ajustes editoriales antes de su publicación.',
                              })
                            }
                            className="px-4 py-2 rounded-[8px] text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>No Aprobar / Rechazar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditArticleForm(art)}
                            className="px-4 py-1.5 rounded-[8px] text-xs font-semibold text-[#171920] bg-white border border-[#dcdfe7] hover:bg-[#171920] hover:text-white transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Abrir en Modo Escritura</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: ALMACENAMIENTO Y ADMINISTRACIÓN DE HASHTAGS              */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'hashtags' && (
            <div className="space-y-6">
              <section className="bg-white border border-[#dcdfe7] rounded-[12px] p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-base font-bold text-[#171920] flex items-center gap-2">
                      <Hash className="w-5 h-5 text-[#FF2C54]" />
                      <span>
                        Almacenamiento y Administración de #Hashtags ({(db.hashtags || []).length})
                      </span>
                    </h2>
                    <p className="text-xs text-[#595F71] mt-0.5">
                      Agrega, edita o elimina los hashtags almacenados en el sistema. Si renombras un hashtag aquí, se actualizará automáticamente en todos los artículos que lo utilicen.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#9497AE] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={hashtagSearch}
                      onChange={(e) => setHashtagSearch(e.target.value)}
                      placeholder="Buscar #hashtag..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>
                </div>

                {/* Add / Edit Hashtag Form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!editingHashtag?.name?.trim() || !onSaveHashtag) return;
                    await onSaveHashtag(editingHashtag);
                    setEditingHashtag(null);
                  }}
                  className="p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7] grid grid-cols-1 sm:grid-cols-12 gap-3 items-end mb-6"
                >
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-[#171920] mb-1">
                      {editingHashtag?.id ? 'Editar #Hashtag *' : 'Nuevo #Hashtag *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={editingHashtag?.name || ''}
                      onChange={(e) =>
                        setEditingHashtag({
                          ...(editingHashtag || {}),
                          name: e.target.value,
                        })
                      }
                      placeholder="Ej. FotografiaAnaloga"
                      className="w-full px-3 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold text-[#171920] mb-1">
                      Descripción temática del Hashtag
                    </label>
                    <input
                      type="text"
                      value={editingHashtag?.description || ''}
                      onChange={(e) =>
                        setEditingHashtag({
                          ...(editingHashtag || {}),
                          description: e.target.value,
                        })
                      }
                      placeholder="Descripción para indexación y archivo de etiquetas..."
                      className="w-full px-3 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center h-9">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#171920] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingHashtag?.featured)}
                        onChange={(e) =>
                          setEditingHashtag({
                            ...(editingHashtag || {}),
                            featured: e.target.checked,
                          })
                        }
                        className="accent-[#FF2C54]"
                      />
                      <span>Destacado en Home</span>
                    </label>
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2">
                    <button
                      type="submit"
                      className="w-full py-2 px-3 rounded-[8px] text-xs font-bold text-white bg-[#FF2C54] hover:bg-[#171920] transition-colors cursor-pointer"
                    >
                      {editingHashtag?.id ? 'Actualizar' : '+ Guardar'}
                    </button>
                    {editingHashtag?.id && (
                      <button
                        type="button"
                        onClick={() => setEditingHashtag(null)}
                        className="py-2 px-2.5 rounded-[8px] text-xs font-semibold border border-[#dcdfe7] bg-white text-[#595F71] cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>

                {/* Stored Hashtags Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#dcdfe7] text-[11px] uppercase tracking-wider text-[#595F71] bg-[#f7f8fc]">
                        <th className="py-3 px-4 font-semibold">#Hashtag</th>
                        <th className="py-3 px-4 font-semibold">Slug</th>
                        <th className="py-3 px-4 font-semibold">Descripción</th>
                        <th className="py-3 px-4 font-semibold text-center">Artículos</th>
                        <th className="py-3 px-4 font-semibold text-center">Tendencia</th>
                        <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dcdfe7] text-xs">
                      {(db.hashtags || [])
                        .filter((h) =>
                          (h.name || h.tag || '').toLowerCase().includes(hashtagSearch.toLowerCase()) ||
                          h.description.toLowerCase().includes(hashtagSearch.toLowerCase())
                        )
                        .map((tagItem) => {
                          const tagName = tagItem.name || tagItem.tag || '';
                          const realCount = db.articles.filter((a) =>
                            (a.tags || []).some(
                              (t) => t.toLowerCase() === tagName.toLowerCase()
                            )
                          ).length;
                          return (
                            <tr key={tagItem.id} className="hover:bg-[#f7f8fc]">
                              <td className="py-3.5 px-4 font-bold text-[#171920]">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f7f8fc] border border-[#dcdfe7] text-[#FF2C54]">
                                  #{tagName}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[11px] text-[#595F71]">
                                #{tagItem.slug}
                              </td>
                              <td className="py-3.5 px-4 text-[#4b546e]">{tagItem.description}</td>
                              <td className="py-3.5 px-4 text-center font-mono font-bold text-[#171920]">
                                {realCount}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onSaveHashtag &&
                                    onSaveHashtag({
                                      ...tagItem,
                                      featured: !tagItem.featured,
                                    })
                                  }
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                                    tagItem.featured
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-[#f7f8fc] text-[#595F71]'
                                  }`}
                                >
                                  {tagItem.featured ? '★ Destacado' : 'Estándar'}
                                </button>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingHashtag({ ...tagItem })}
                                    className="px-2.5 py-1 rounded-[6px] text-xs font-semibold border border-[#dcdfe7] text-[#171920] hover:bg-[#171920] hover:text-white transition-colors cursor-pointer"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onDeleteHashtag && onDeleteHashtag(tagItem.id)
                                    }
                                    className="px-2.5 py-1 rounded-[6px] text-xs font-semibold text-[#DC2626] border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                                  >
                                    Quitar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 5: GESTIÓN INTEGRAL DE USUARIOS (FREE ↔ PREMIUM, PLANES)  */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'users' && (
            <section className="bg-white border border-[#dcdfe7] rounded-[12px] overflow-hidden">
              <div className="p-6 border-b border-[#dcdfe7] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#171920] flex items-center gap-2">
                      <Crown className="w-5 h-5 text-[#D97706]" />
                      <span>
                        Gestión Integral de Usuarios (Conversión Free ↔ Premium, Altas, Bajas y Vencimientos)
                      </span>
                    </h2>
                    <p className="text-xs text-[#595F71] mt-0.5">
                      Convierte cualquier usuario de Free a Premium (y viceversa) en 1 clic, asigna planes de pago, gestiona fechas de vencimiento, altas, bajas y roles (Administrador, Moderador, Redactor, Escritor, Lector).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab('premium_plans')}
                      className="px-3.5 py-2 rounded-[8px] text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Configurar Planes de Pago</span>
                    </button>
                    <button
                      type="button"
                      onClick={openNewUserForm}
                      className="px-4 py-2 rounded-[8px] text-xs font-semibold text-white bg-[#171920] hover:bg-[#FF2C54] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir Usuario</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f7f8fc] rounded-[8px] border border-[#dcdfe7]">
                    {(
                      [
                        { key: 'ALL', label: `Todos (${db.users.length})` },
                        {
                          key: 'premium',
                          label: `★ Suscriptores Premium (${
                            db.users.filter((u) => u.isPremium).length
                          })`,
                        },
                        {
                          key: 'free',
                          label: `Usuarios Free (${
                            db.users.filter((u) => !u.isPremium && u.subscriptionStatus !== 'expired')
                              .length
                          })`,
                        },
                        {
                          key: 'expired',
                          label: `Vencidos / Bajas (${
                            db.users.filter(
                              (u) =>
                                u.subscriptionStatus === 'expired' ||
                                u.subscriptionStatus === 'cancelled'
                            ).length
                          })`,
                        },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setUserTierFilter(f.key)}
                        className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
                          userTierFilter === f.key
                            ? 'bg-[#171920] text-white'
                            : 'text-[#595F71] hover:text-[#171920]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#9497AE] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Buscar usuario o email..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#dcdfe7] text-[11px] uppercase tracking-wider text-[#595F71] bg-[#f7f8fc]">
                      <th className="py-3 px-5 font-semibold">Usuario</th>
                      <th className="py-3 px-3 font-semibold">Rol Editorial</th>
                      <th className="py-3 px-3 font-semibold">Membresía (Free ↔ Premium)</th>
                      <th className="py-3 px-3 font-semibold">Plan &amp; Vencimiento</th>
                      <th className="py-3 px-3 font-semibold">Altas / Bajas Suscripción</th>
                      <th className="py-3 px-5 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dcdfe7] text-xs">
                    {db.users
                      .filter((u) => {
                        const matchesQ =
                          u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
                        if (!matchesQ) return false;
                        if (userTierFilter === 'premium') return Boolean(u.isPremium);
                        if (userTierFilter === 'free')
                          return !u.isPremium && u.subscriptionStatus !== 'expired';
                        if (userTierFilter === 'expired')
                          return (
                            u.subscriptionStatus === 'expired' ||
                            u.subscriptionStatus === 'cancelled'
                          );
                        return true;
                      })
                      .map((u) => {
                        const assignedPlan = (db.subscriptionPlans || []).find(
                          (p) => p.id === u.subscriptionPlanId
                        );
                        return (
                          <tr key={u.id} className="hover:bg-[#f7f8fc]">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <AuthorAvatar user={u} size="sm" />
                                <div>
                                  <div className="font-semibold text-[#171920] flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {u.isPremium && (
                                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                        ★ PREMIUM
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[#595F71]">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-3">
                              <select
                                value={u.role}
                                onChange={(e) =>
                                  onUpdateUser(u.id, { role: e.target.value as UserRole })
                                }
                                className="px-2.5 py-1 rounded-[6px] text-xs border border-[#dcdfe7] bg-white font-semibold text-[#171920]"
                              >
                                <option value="admin">Administrador</option>
                                <option value="moderator">Moderador</option>
                                <option value="editor">Redactor Jefe</option>
                                <option value="author">Escritor / Autor</option>
                                <option value="reader">Lector / Suscriptor</option>
                              </select>
                            </td>

                            {/* 1-Click Free <-> Premium Switcher */}
                            <td className="py-4 px-3">
                              <div className="flex flex-col gap-1.5">
                                {u.isPremium ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onManageUserSubscription &&
                                      onManageUserSubscription(u.id, {
                                        action: 'downgrade_free',
                                      })
                                    }
                                    className="px-3 py-1.5 rounded-[6px] text-xs font-bold bg-amber-500 hover:bg-[#171920] text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer w-fit"
                                    title="Haz clic para convertir a Usuario Free"
                                  >
                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                    <span>Pasar a FREE</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onManageUserSubscription &&
                                      onManageUserSubscription(u.id, {
                                        action: 'upgrade_premium',
                                        planId:
                                          (db.subscriptionPlans || [])[0]?.id ||
                                          'plan-anual-gold',
                                      })
                                    }
                                    className="px-3 py-1.5 rounded-[6px] text-xs font-bold bg-[#f7f8fc] border border-amber-400 text-amber-800 hover:bg-amber-500 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer w-fit"
                                    title="Haz clic para convertir a Suscriptor Premium"
                                  >
                                    <Crown className="w-3.5 h-3.5" />
                                    <span>Convertir a PREMIUM</span>
                                  </button>
                                )}
                                <span className="text-[10px] text-[#595F71]">
                                  Estado:{' '}
                                  <strong className="uppercase">
                                    {u.subscriptionStatus || (u.isPremium ? 'active' : 'free')}
                                  </strong>
                                </span>
                              </div>
                            </td>

                            {/* Plan Selector & Expiration Date */}
                            <td className="py-4 px-3">
                              <div className="space-y-1.5">
                                <select
                                  value={u.subscriptionPlanId || 'free'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'free') {
                                      onManageUserSubscription?.(u.id, {
                                        action: 'downgrade_free',
                                      });
                                    } else {
                                      onManageUserSubscription?.(u.id, {
                                        action: 'upgrade_premium',
                                        planId: val,
                                      });
                                    }
                                  }}
                                  className="px-2 py-1 rounded-[6px] text-xs border border-[#dcdfe7] bg-white font-medium text-[#171920] w-full max-w-[180px]"
                                >
                                  <option value="free">Plan Lector Free ($0)</option>
                                  {(db.subscriptionPlans || []).map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} (${p.price})
                                    </option>
                                  ))}
                                </select>

                                <div className="flex items-center gap-1.5 text-[11px] text-[#595F71]">
                                  <span>Vence:</span>
                                  <input
                                    type="date"
                                    value={u.subscriptionEnd || ''}
                                    onChange={(e) =>
                                      onUpdateUser(u.id, {
                                        subscriptionEnd: e.target.value,
                                      })
                                    }
                                    className="px-1.5 py-0.5 text-[11px] font-mono rounded border border-[#dcdfe7] bg-white"
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Altas / Bajas / Vencimiento Quick Actions */}
                            <td className="py-4 px-3">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onManageUserSubscription?.(u.id, {
                                      action: 'renew',
                                      planId:
                                        assignedPlan?.id ||
                                        (db.subscriptionPlans || [])[0]?.id,
                                    })
                                  }
                                  className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                                  title="Dar de Alta o Renovar Suscripción"
                                >
                                  + Alta / Renovar
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onManageUserSubscription?.(u.id, {
                                      action: 'cancel',
                                    })
                                  }
                                  className="px-2.5 py-1 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                  title="Dar de Baja Suscripción"
                                >
                                  Baja
                                </button>
                              </div>
                            </td>

                            <td className="py-4 px-5 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMsgRecipientId(u.id);
                                    setMessageBoxTab('compose');
                                    setActiveTab('messages');
                                  }}
                                  className="px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#f7f8fc] border border-[#dcdfe7] text-[#5960FF] hover:bg-[#5960FF] hover:text-white transition-colors cursor-pointer"
                                  title="Enviar mensaje privado a este usuario"
                                >
                                  Mensaje
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditUserForm(u)}
                                  className="px-2.5 py-1 rounded-[6px] text-xs font-semibold border border-[#dcdfe7] text-[#171920] hover:bg-[#171920] hover:text-white transition-colors cursor-pointer"
                                >
                                  Editar
                                </button>
                                {db.users.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteUser(u.id)}
                                    className="text-[#595F71] hover:text-[#DC2626] cursor-pointer"
                                    title="Eliminar usuario"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: CONFIGURACIÓN DE PLANES DE PAGO PREMIUM                  */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'premium_plans' && (
            <div className="space-y-6">
              <section className="bg-white border border-[#dcdfe7] rounded-[12px] p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-[#171920] flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#D97706]" />
                      <span>Configuración de Planes de Pago y Suscripciones Premium</span>
                    </h2>
                    <p className="text-xs text-[#595F71] mt-0.5">
                      Personaliza los planes de suscripción (precios, ciclos mensuales/anuales, días de vigencia y beneficios incluidos) que ven los lectores en el Paywall y que puedes asignar a los usuarios.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlan({
                        name: '',
                        badge: 'NUEVO PLAN',
                        price: 14.99,
                        currency: 'USD',
                        billingCycle: 'monthly',
                        durationDays: 30,
                        description:
                          'Acceso completo a artículos Premium y mensajería directa.',
                        features: [
                          'Acceso ilimitado a todos los artículos Premium',
                          'Mensajería privada con escritores y editores',
                        ],
                        highlighted: false,
                        active: true,
                      });
                      setPlanFeaturesText(
                        'Acceso ilimitado a todos los artículos Premium\nMensajería privada con escritores y editores'
                      );
                    }}
                    className="px-4 py-2 rounded-[8px] text-xs font-bold text-white bg-[#D97706] hover:bg-[#B45309] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crear Nuevo Plan de Pago</span>
                  </button>
                </div>

                {/* Plan Editor Form when editingPlan is active */}
                {editingPlan && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!editingPlan.name || !onSavePlan) return;
                      const features = planFeaturesText
                        .split('\n')
                        .map((f) => f.trim())
                        .filter(Boolean);
                      await onSavePlan({
                        ...editingPlan,
                        features,
                      });
                      setEditingPlan(null);
                    }}
                    className="mb-8 p-5 rounded-[12px] bg-[#FFFBEB] border-2 border-amber-300 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#171920]">
                        {editingPlan.id
                          ? `Editando Plan: ${editingPlan.name}`
                          : 'Nuevo Plan de Suscripción Premium'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingPlan(null)}
                        className="text-xs text-[#595F71] hover:text-[#171920] cursor-pointer"
                      >
                        Cerrar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Nombre del Plan *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingPlan.name || ''}
                          onChange={(e) =>
                            setEditingPlan({ ...editingPlan, name: e.target.value })
                          }
                          placeholder="Ej. Pase Editorial Anual Gold"
                          className="w-full px-3 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Etiqueta / Badge Superior
                        </label>
                        <input
                          type="text"
                          value={editingPlan.badge || ''}
                          onChange={(e) =>
                            setEditingPlan({ ...editingPlan, badge: e.target.value })
                          }
                          placeholder="MÁS POPULAR"
                          className="w-full px-3 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Precio (USD) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={editingPlan.price ?? 9.99}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              price: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 text-xs font-mono bg-white rounded-[8px] border border-[#dcdfe7]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Ciclo de Facturación
                        </label>
                        <select
                          value={editingPlan.billingCycle || 'monthly'}
                          onChange={(e) => {
                            const cycle = e.target.value as 'monthly' | 'annual';
                            setEditingPlan({
                              ...editingPlan,
                              billingCycle: cycle,
                              durationDays: cycle === 'annual' ? 365 : 30,
                            });
                          }}
                          className="w-full px-3 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                        >
                          <option value="monthly">Mensual (30 días)</option>
                          <option value="annual">Anual (365 días)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Días de Vigencia Automática
                        </label>
                        <input
                          type="number"
                          value={editingPlan.durationDays || 30}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              durationDays: Number(e.target.value) || 30,
                            })
                          }
                          className="w-full px-3 py-2 text-xs font-mono bg-white rounded-[8px] border border-[#dcdfe7]"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-5">
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#171920] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(editingPlan.highlighted)}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                highlighted: e.target.checked,
                              })
                            }
                            className="accent-[#D97706]"
                          />
                          <span>Destacar Plan</span>
                        </label>

                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#171920] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPlan.active !== false}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                active: e.target.checked,
                              })
                            }
                            className="accent-[#16A34A]"
                          />
                          <span>Plan Activo</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#171920] mb-1">
                        Descripción del Plan
                      </label>
                      <input
                        type="text"
                        value={editingPlan.description || ''}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#171920] mb-1">
                        Beneficios Incluidos (Uno por línea)
                      </label>
                      <textarea
                        rows={4}
                        value={planFeaturesText}
                        onChange={(e) => setPlanFeaturesText(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white rounded-[8px] border border-[#dcdfe7] leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPlan(null)}
                        className="px-4 py-2 rounded-[8px] text-xs font-semibold bg-white border border-[#dcdfe7] cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-[8px] text-xs font-bold text-white bg-[#D97706] hover:bg-[#171920] cursor-pointer"
                      >
                        Guardar Plan de Pago
                      </button>
                    </div>
                  </form>
                )}

                {/* Cards of Configured Subscription Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {(db.subscriptionPlans || []).map((plan) => (
                    <div
                      key={plan.id}
                      className={`rounded-[14px] border p-6 flex flex-col justify-between ${
                        plan.highlighted
                          ? 'border-2 border-amber-500 bg-[#FFFBEB]/60 shadow-sm'
                          : 'border-[#dcdfe7] bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                            {plan.badge}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              plan.active ? 'text-[#16A34A]' : 'text-[#DC2626]'
                            }`}
                          >
                            {plan.active ? '● Activo' : '○ Inactivo'}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-[#171920] mb-1">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-[#595F71] mb-4">{plan.description}</p>

                        <div className="text-2xl font-extrabold text-[#171920] mb-4 tabular-nums">
                          ${plan.price.toFixed(2)}{' '}
                          <span className="text-xs font-normal text-[#595F71]">
                            {plan.currency} /{' '}
                            {plan.billingCycle === 'monthly'
                              ? 'mes'
                              : 'año'}{' '}
                            ({plan.durationDays} días)
                          </span>
                        </div>

                        <ul className="space-y-2 mb-6 text-xs text-[#4b546e]">
                          {(plan.features || []).map((feat, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-[#dcdfe7] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPlan({ ...plan });
                            setPlanFeaturesText((plan.features || []).join('\n'));
                          }}
                          className="px-3.5 py-1.5 rounded-[6px] text-xs font-semibold bg-[#171920] text-white hover:bg-[#FF2C54] transition-colors cursor-pointer"
                        >
                          Editar Plan
                        </button>
                        {(db.subscriptionPlans || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeletePlan && onDeletePlan(plan.id)}
                            className="px-3 py-1.5 rounded-[6px] text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: SISTEMA DE MENSAJERÍA PRIVADA INTERNA                    */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'messages' && (
            <section className="bg-white border border-[#dcdfe7] rounded-[12px] overflow-hidden">
              <div className="p-6 border-b border-[#dcdfe7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#171920] flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-[#5960FF]" />
                    <span>
                      Sistema de Mensajería Privada (Usuarios Premium, Administradores, Moderadores y Escritores)
                    </span>
                  </h2>
                  <p className="text-xs text-[#595F71] mt-0.5">
                    Canal exclusivo de comunicación directa entre suscriptores Premium y el equipo editorial.
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-[#f7f8fc] rounded-[8px] border border-[#dcdfe7]">
                  <button
                    type="button"
                    onClick={() => setMessageBoxTab('inbox')}
                    className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold cursor-pointer ${
                      messageBoxTab === 'inbox'
                        ? 'bg-[#171920] text-white'
                        : 'text-[#595F71] hover:text-[#171920]'
                    }`}
                  >
                    Bandeja de Entrada ({(db.messages || []).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageBoxTab('compose')}
                    className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold cursor-pointer ${
                      messageBoxTab === 'compose'
                        ? 'bg-[#FF2C54] text-white'
                        : 'text-[#595F71] hover:text-[#171920]'
                    }`}
                  >
                    + Redactar Mensaje Privado
                  </button>
                </div>
              </div>

              {messageBoxTab === 'compose' ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!msgSubject.trim() || !msgBody.trim() || !onSendMessage) return;
                    await onSendMessage({
                      senderId: currentUser?.id || 'usr-1',
                      recipientId: msgRecipientId,
                      subject: msgSubject,
                      body: msgBody,
                      category: msgCategory,
                    });
                    setMsgSubject('');
                    setMsgBody('');
                    setMsgSentNotice('¡Mensaje privado enviado correctamente!');
                    setTimeout(() => {
                      setMsgSentNotice('');
                      setMessageBoxTab('inbox');
                    }, 1200);
                  }}
                  className="p-6 space-y-4 max-w-2xl"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171920] mb-1">
                        Destinatario (Premium / Admin / Moderador / Escritor) *
                      </label>
                      <select
                        value={msgRecipientId}
                        onChange={(e) => setMsgRecipientId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7] bg-white font-semibold"
                      >
                        {db.users
                          .filter(
                            (u) =>
                              u.isPremium ||
                              u.role === 'admin' ||
                              u.role === 'moderator' ||
                              u.role === 'editor' ||
                              u.role === 'author'
                          )
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.role.toUpperCase()}
                              {u.isPremium ? ' · ★ PREMIUM' : ''})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171920] mb-1">
                        Categoría del Mensaje
                      </label>
                      <select
                        value={msgCategory}
                        onChange={(e) =>
                          setMsgCategory(
                            e.target.value as PrivateMessage['category']
                          )
                        }
                        className="w-full px-3 py-2 text-xs rounded-[8px] border border-[#dcdfe7] bg-white"
                      >
                        <option value="editorial">Consulta / Colaboración Editorial</option>
                        <option value="aprobacion">Revisión y Aprobación de Artículo</option>
                        <option value="soporte_premium">Atención a Suscriptor Premium</option>
                        <option value="general">Mensaje Directo General</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171920] mb-1">
                      Asunto del Mensaje *
                    </label>
                    <input
                      type="text"
                      required
                      value={msgSubject}
                      onChange={(e) => setMsgSubject(e.target.value)}
                      placeholder="Ej. Observaciones sobre el próximo artículo Premium..."
                      className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171920] mb-1">
                      Mensaje *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={msgBody}
                      onChange={(e) => setMsgBody(e.target.value)}
                      placeholder="Escribe tu mensaje privado aquí..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-[8px] border border-[#dcdfe7] leading-relaxed"
                    />
                  </div>

                  {msgSentNotice && (
                    <p className="text-xs font-bold text-[#16A34A]">{msgSentNotice}</p>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-[8px] text-xs font-bold text-white bg-[#5960FF] hover:bg-[#171920] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Mensaje Privado</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="divide-y divide-[#dcdfe7]">
                  {(db.messages || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                        !msg.read ? 'bg-[#F8FAFC]' : 'bg-white'
                      }`}
                    >
                      <div className="space-y-1.5 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {!msg.read && (
                            <span className="px-2 py-0.5 rounded bg-[#FF2C54] text-white text-[10px] font-bold uppercase">
                              Nuevo
                            </span>
                          )}
                          <span className="font-bold text-[#171920]">
                            De: {msg.senderName} ({msg.senderRole})
                          </span>
                          <span>→</span>
                          <span className="font-semibold text-[#5960FF]">
                            Para: {msg.recipientName} ({msg.recipientRole})
                          </span>
                          <span>·</span>
                          <span className="text-[#595F71]">{msg.createdAt}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#171920]">{msg.subject}</h4>
                        <p className="text-xs text-[#4b546e] leading-relaxed">{msg.body}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!msg.read && (
                          <button
                            type="button"
                            onClick={() =>
                              onMarkMessageRead && onMarkMessageRead(msg.id)
                            }
                            className="px-3 py-1.5 rounded-[6px] text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
                          >
                            Marcar leído
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMsgRecipientId(msg.senderId);
                            setMsgSubject(
                              msg.subject.startsWith('Re:')
                                ? msg.subject
                                : `Re: ${msg.subject}`
                            );
                            setMessageBoxTab('compose');
                          }}
                          className="px-3 py-1.5 rounded-[6px] text-xs font-semibold bg-[#f7f8fc] border border-[#dcdfe7] text-[#171920] hover:bg-[#171920] hover:text-white inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>Responder</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteMessage && onDeleteMessage(msg.id)}
                          className="p-1.5 text-[#595F71] hover:text-[#DC2626] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 6: CONFIGURACIÓN DE PERFIL (BIO & REDES SOCIALES)         */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'profile_settings' && activeProfileTarget && (
            <div className="space-y-6">
              {/* Top User Switcher Bar: Allows each user to edit their profile independently */}
              <section className="bg-white border border-[#dcdfe7] rounded-[12px] p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#171920]">
                      Configuración de Perfil, Biografía y Enlaces de Redes Sociales
                    </h2>
                    <p className="text-xs text-[#595F71] mt-0.5">
                      Personaliza de manera independiente la biografía editorial, fotografía de perfil y enlaces de redes sociales (Twitter/X, Instagram, LinkedIn, YouTube, GitHub y Sitio Web) de cada usuario.
                    </p>
                  </div>

                  {/* Independent User Selector */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#f7f8fc] rounded-[10px] border border-[#dcdfe7]">
                    {db.users.map((u) => {
                      const isSelected = u.id === activeProfileTarget.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectProfileTarget(u.id)}
                          className={`px-3 py-1.5 rounded-[7px] text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#FF2C54] text-white shadow-xs'
                              : 'text-[#4b546e] hover:text-[#171920]'
                          }`}
                        >
                          <span>{u.name}</span>
                          {currentUser?.id === u.id && (
                            <span className="text-[10px] opacity-85">(Tú)</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 2-Column Workspace: Left Form (7 cols) + Right Live Preview Card (5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Profile & Social Links Form */}
                <form
                  onSubmit={handleSaveProfileSettings}
                  className="lg:col-span-7 bg-white border border-[#dcdfe7] rounded-[12px] p-6 sm:p-8 space-y-6"
                >
                  {/* 1. Avatar & Identity Section */}
                  <div className="pb-6 border-b border-[#dcdfe7]">
                    <h3 className="text-sm font-bold text-[#171920] mb-4">
                      1. Fotografía de Perfil e Identidad Editorial
                    </h3>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-5 p-4 rounded-[12px] bg-[#f7f8fc] border border-[#dcdfe7]">
                      <AuthorAvatar
                        user={{
                          name: profileForm.name || activeProfileTarget.name,
                          avatarTheme:
                            profileForm.avatarTheme || activeProfileTarget.avatarTheme,
                          avatarUrl: profileForm.avatarUrl,
                        }}
                        size="lg"
                      />

                      <div className="flex-1 space-y-2.5 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            ref={avatarFileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.avif,.gif,.svg,image/*"
                            onChange={handleAvatarFileSelected}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => avatarFileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-[8px] text-xs font-semibold text-white bg-[#FF2C54] hover:bg-[#171920] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Subir Foto desde mi PC</span>
                          </button>

                          {/* Quick Kayleen Preset Portraits */}
                          {(
                            [
                              {
                                theme: 'terracotta',
                                label: 'Retrato 1',
                                url: '/images/kayleen/nora-hutton-tCJ44OIqceU-unsplash.jpg',
                              },
                              {
                                theme: 'slate',
                                label: 'Retrato 2',
                                url: '/images/kayleen/brooke-lark-atzWFItRHy8-unsplash-150x150.jpg',
                              },
                              {
                                theme: 'forest',
                                label: 'Retrato 3',
                                url: '/images/kayleen/cleyton-ewerton-N3JngnkuyRs-unsplash-150x150.jpg',
                              },
                              {
                                theme: 'navy',
                                label: 'Retrato 4',
                                url: '/images/kayleen/mihai-stefan-658815-unsplash-150x150.jpg',
                              },
                              {
                                theme: 'ochre',
                                label: 'Retrato 5',
                                url: '/images/kayleen/jordan-whitfield-qODM8pfwRO4-unsplash-150x150.jpg',
                              },
                            ] as const
                          ).map((preset) => (
                            <button
                              key={preset.theme}
                              type="button"
                              onClick={() =>
                                setProfileForm({
                                  ...profileForm,
                                  avatarTheme: preset.theme,
                                  avatarUrl: preset.url,
                                })
                              }
                              className={`px-2.5 py-1 rounded-[6px] text-[11px] font-medium border transition-colors cursor-pointer ${
                                profileForm.avatarUrl === preset.url
                                  ? 'bg-[#171920] text-white border-[#171920]'
                                  : 'bg-white text-[#4b546e] border-[#dcdfe7] hover:border-[#171920]'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>

                        <div>
                          <input
                            type="text"
                            value={profileForm.avatarUrl || ''}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, avatarUrl: e.target.value })
                            }
                            placeholder="O pega aquí el enlace directo de tu foto de perfil (https://...)"
                            className="w-full px-3 py-1.5 text-xs bg-white rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#5960FF]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Nombre Público de Autor / Usuario *
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.name || ''}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, name: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          required
                          value={profileForm.email || ''}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, email: e.target.value })
                          }
                          className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Especialidad / Cargo Editorial
                        </label>
                        <input
                          type="text"
                          value={profileForm.specialty || ''}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, specialty: e.target.value })
                          }
                          placeholder="Ej. Editora de Moda & Fotografía Documental"
                          className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Ubicación / Ciudad
                        </label>
                        <input
                          type="text"
                          value={profileForm.location || ''}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, location: e.target.value })
                          }
                          placeholder="Ej. Madrid / Buenos Aires"
                          className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Personalización de Biografía */}
                  <div className="pb-6 border-b border-[#dcdfe7]">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-bold text-[#171920]">
                        2. Biografía Personalizada
                      </label>
                      <span className="text-[11px] font-mono tabular-nums text-[#595F71]">
                        {(profileForm.bio || '').length} caracteres
                      </span>
                    </div>
                    <p className="text-xs text-[#595F71] mb-3">
                      Esta biografía aparecerá al pie de todos los artículos donde participes como autor principal o coautor, así como en tu página pública de autor.
                    </p>
                    <textarea
                      rows={4}
                      value={profileForm.bio || ''}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, bio: e.target.value })
                      }
                      placeholder="Escribe tu biografía editorial, trayectoria, intereses y enfoque creativo..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-[8px] border border-[#dcdfe7] leading-relaxed focus:outline-none focus:border-[#FF2C54]"
                    />
                  </div>

                  {/* 3. Enlaces de Redes Sociales Independientes */}
                  <div>
                    <h3 className="text-sm font-bold text-[#171920] mb-1">
                      3. Enlaces de Redes Sociales y Presencia Digital
                    </h3>
                    <p className="text-xs text-[#595F71] mb-4">
                      Configura tus cuentas o enlaces directos. Deja en blanco las redes que no desees mostrar en tu perfil público.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Twitter / X
                        </label>
                        <input
                          type="text"
                          value={profileForm.twitter || ''}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, twitter: e.target.value })
                          }
                          placeholder="@usuario o https://x.com/usuario"
                          className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#5960FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Instagram
                        </label>
                        <input
                          type="text"
                          value={profileForm.instagram || ''}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, instagram: e.target.value })
                          }
                          placeholder="@usuario.ig o https://instagram.com/..."
                          className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#5960FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          Sitio Web / Portfolio Personal
                        </label>
                        <input
                          type="text"
                          value={profileForm.website || ''}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, website: e.target.value })
                          }
                          placeholder="tuportfolio.studio"
                          className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#5960FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          LinkedIn
                        </label>
                        <input
                          type="text"
                          value={profileForm.linkedin || ''}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, linkedin: e.target.value })
                          }
                          placeholder="linkedin.com/in/tu-perfil"
                          className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#5960FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          YouTube
                        </label>
                        <input
                          type="text"
                          value={profileForm.youtube || ''}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, youtube: e.target.value })
                          }
                          placeholder="@tucanal o youtube.com/@tucanal"
                          className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#5960FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#171920] mb-1">
                          GitHub / Behance
                        </label>
                        <input
                          type="text"
                          value={profileForm.github || ''}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, github: e.target.value })
                          }
                          placeholder="github.com/usuario"
                          className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#5960FF]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Action Row */}
                  <div className="pt-4 border-t border-[#dcdfe7] flex flex-wrap items-center justify-between gap-4">
                    <div>
                      {profileSavedNotice && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            ¡Perfil y redes sociales de {profileForm.name} actualizados!
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onViewAuthor(activeProfileTarget.id)}
                        className="px-4 py-2.5 rounded-[8px] text-xs font-semibold text-[#171920] bg-[#f7f8fc] border border-[#dcdfe7] hover:border-[#171920] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Página Pública de Autor</span>
                      </button>

                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-[8px] text-xs font-semibold text-white bg-[#FF2C54] hover:bg-[#171920] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar Configuración de Perfil</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Right Column: Live Kayleen Author Card Preview */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
                  <div className="bg-white border border-[#dcdfe7] rounded-[15px] p-7 text-center shadow-xs">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-[#FF2C54] mb-4">
                      Vista Previa en Tiempo Real (Estilo Kayleen Home 03)
                    </div>

                    <div className="flex justify-center mb-4">
                      <AuthorAvatar
                        user={{
                          name: profileForm.name || activeProfileTarget.name,
                          avatarTheme:
                            profileForm.avatarTheme || activeProfileTarget.avatarTheme,
                          avatarUrl: profileForm.avatarUrl,
                        }}
                        size="xl"
                      />
                    </div>

                    <h3 className="text-xl font-bold text-[#171920]">
                      {profileForm.name || activeProfileTarget.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#5960FF] mt-1 mb-2">
                      {profileForm.specialty || 'Colaborador Editorial'}
                    </p>

                    {profileForm.location && (
                      <p className="text-xs text-[#595F71] inline-flex items-center gap-1 mb-3">
                        <MapPin className="w-3 h-3 text-[#FF2C54]" />
                        <span>{profileForm.location}</span>
                      </p>
                    )}

                    <p className="text-xs text-[#4b546e] leading-relaxed mb-5 px-2">
                      {profileForm.bio || 'Sin biografía configurada.'}
                    </p>

                    {/* Live Social Links Strip */}
                    <div className="pt-4 border-t border-[#dcdfe7] flex flex-wrap items-center justify-center gap-2 text-xs text-[#595F71]">
                      {profileForm.website && (
                        <span className="px-2.5 py-1 rounded-[6px] bg-[#f7f8fc] border border-[#dcdfe7] text-[#171920] inline-flex items-center gap-1">
                          <Globe className="w-3 h-3 text-[#5960FF]" />
                          <span>{profileForm.website}</span>
                        </span>
                      )}
                      {profileForm.twitter && (
                        <span className="px-2.5 py-1 rounded-[6px] bg-[#f7f8fc] border border-[#dcdfe7] text-[#171920]">
                          X: {profileForm.twitter}
                        </span>
                      )}
                      {profileForm.instagram && (
                        <span className="px-2.5 py-1 rounded-[6px] bg-[#f7f8fc] border border-[#dcdfe7] text-[#171920]">
                          IG: {profileForm.instagram}
                        </span>
                      )}
                      {profileForm.linkedin && (
                        <span className="px-2.5 py-1 rounded-[6px] bg-[#f7f8fc] border border-[#dcdfe7] text-[#171920]">
                          IN: {profileForm.linkedin}
                        </span>
                      )}
                      {profileForm.youtube && (
                        <span className="px-2.5 py-1 rounded-[6px] bg-[#f7f8fc] border border-[#dcdfe7] text-[#171920]">
                          YT: {profileForm.youtube}
                        </span>
                      )}
                      {profileForm.github && (
                        <span className="px-2.5 py-1 rounded-[6px] bg-[#f7f8fc] border border-[#dcdfe7] text-[#171920]">
                          GH: {profileForm.github}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 7, 8, 9 & 10: SUSCRIPTORES · CAMPAÑAS · CONFIG · LEGALES  */}
          {/* ------------------------------------------------------------- */}
          {(activeTab === 'site_settings' ||
            activeTab === 'color_palette' ||
            activeTab === 'legal_pages' ||
            activeTab === 'subscribers' ||
            activeTab === 'campaigns') && (
            <SiteSettingsAndMarketingView
              activeSubMode={
                activeTab === 'legal_pages' || activeTab === 'color_palette'
                  ? 'site_settings'
                  : activeTab
              }
              initialSettingsSection={
                activeTab === 'legal_pages'
                  ? 'legal'
                  : activeTab === 'color_palette'
                  ? 'colors'
                  : 'identity'
              }
              onSwitchSubMode={(mode) => setActiveTab(mode)}
              onOpenPublicLegalPage={onOpenPublicLegalPage}
              siteConfig={db.siteConfig || INITIAL_SITE_CONFIG}
              subscribers={db.subscriberRecords || []}
              campaigns={db.campaigns || []}
              pushNotifications={db.pushNotifications || []}
              articles={db.articles}
              onSaveSiteConfig={onSaveSiteConfig}
              onSaveSubscriber={onSaveSubscriber}
              onUpdateSubscriber={onUpdateSubscriber}
              onDeleteSubscriber={onDeleteSubscriber}
              onSaveCampaign={onSaveCampaign}
              onSendCampaign={onSendCampaign}
              onDeleteCampaign={onDeleteCampaign}
              onSendPushNotification={onSendPushNotification}
              onDeletePushNotification={onDeletePushNotification}
            />
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 9: CÓDIGO PHP 8 + MYSQL RELACIONAL (EXPORTADOR DIRECTO)   */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'php_export' && (
            <section className="bg-white border border-[#dcdfe7] rounded-[12px] overflow-hidden">
              <div className="p-6 border-b border-[#dcdfe7]">
                <h2 className="text-base font-bold text-[#171920]">
                  Código Fuente Nativo PHP 8 + MySQL (Sincronizado con tu Base de Datos Actual)
                </h2>
                <p className="text-xs text-[#4b546e] mt-1 leading-relaxed">
                  Inspecciona, copia o descarga los archivos nativos en{' '}
                  <strong>PHP 8 (PDO) + MySQL 8.0 + HTML5/CSS3</strong> sincronizados con tus
                  categorías, artículos, imágenes y coautores.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-1.5">
                  {phpFiles.map((file, idx) => (
                    <button
                      key={file.filename}
                      type="button"
                      onClick={() => setSelectedPhpFileIndex(idx)}
                      className={`px-3.5 py-2 rounded-[6px] text-xs font-mono transition-colors cursor-pointer ${
                        selectedPhpFileIndex === idx
                          ? 'bg-[#171920] text-white font-semibold'
                          : 'bg-[#f7f8fc] text-[#4b546e] hover:text-[#171920] border border-[#dcdfe7]'
                      }`}
                    >
                      {file.filename}
                    </button>
                  ))}
                </div>
              </div>

              {phpFiles[selectedPhpFileIndex] && (
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#dcdfe7]">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#FF2C54]">
                        {phpFiles[selectedPhpFileIndex].filename}
                      </span>
                      <p className="text-xs text-[#4b546e] mt-0.5">
                        {phpFiles[selectedPhpFileIndex].description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyCode(phpFiles[selectedPhpFileIndex].content)
                        }
                        className="px-3.5 py-2 rounded-[6px] text-xs font-semibold border border-[#dcdfe7] text-[#171920] hover:bg-[#171920] hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedFile ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Código</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadCode(
                            phpFiles[selectedPhpFileIndex].filename,
                            phpFiles[selectedPhpFileIndex].content
                          )
                        }
                        className="px-3.5 py-2 rounded-[6px] text-xs font-semibold bg-[#FF2C54] text-white hover:bg-[#171920] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar Archivo</span>
                      </button>
                    </div>
                  </div>

                  <pre className="bg-[#171920] text-[#F5F5F4] p-5 rounded-[10px] text-xs font-mono overflow-x-auto leading-relaxed max-h-[520px]">
                    <code>{phpFiles[selectedPhpFileIndex].content}</code>
                  </pre>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* ================================================================= */}
      {/* WORD & WORDPRESS RICH ARTICLE EDITOR (WITH DISTRACTION-FREE ZEN)  */}
      {/* ================================================================= */}
      <ArticleWordpressEditor
        isOpen={isArticleModalOpen}
        initialArticle={editingArticle}
        db={db}
        currentUser={currentUser}
        onClose={() => {
          setIsArticleModalOpen(false);
          setEditingArticle(null);
        }}
        onSave={async (articleData) => {
          await onSaveArticle(articleData);
          setIsArticleModalOpen(false);
          setEditingArticle(null);
        }}
        onCreateCategory={onSaveCategory}
        onQuickCreateAuthor={async (payload) => {
          await onCreateUser(payload);
        }}
      />

      {/* ================================================================= */}
      {/* MODAL: CREATE / EDIT CATEGORY                                     */}
      {/* ================================================================= */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#dcdfe7] rounded-[15px] w-full max-w-md p-6 sm:p-8 my-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#dcdfe7]">
              <h3 className="text-lg font-bold text-[#171920]">
                {editingCategory.id ? 'Editar Categoría' : 'Crear Nueva Categoría'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-[#595F71] hover:text-[#171920] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategoryFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171920] mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  placeholder="Ej. Arquitectura & Diseño"
                  className="w-full px-3.5 py-2 text-sm rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                />
                {editingCategory.id && (
                  <p className="text-[11px] text-[#595F71] mt-1">
                    Al cambiar el nombre, todos los artículos de esta categoría se actualizarán automáticamente.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171920] mb-1">
                  Descripción Editorial
                </label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ''}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Breve descripción de los temas que abarca..."
                  className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171920] mb-1">
                  Color Distintivo
                </label>
                <div className="flex items-center gap-2">
                  {['#FF2C54', '#5960FF', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6'].map(
                    (clr) => (
                      <button
                        key={clr}
                        type="button"
                        onClick={() =>
                          setEditingCategory({ ...editingCategory, color: clr })
                        }
                        className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                          editingCategory.color === clr
                            ? 'border-[#171920] scale-110'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: clr }}
                      />
                    )
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#dcdfe7] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-[8px] text-xs font-semibold border border-[#dcdfe7] text-[#4b546e] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-[8px] text-xs font-semibold text-white bg-[#FF2C54] hover:bg-[#171920] transition-colors cursor-pointer"
                >
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: CREATE / EDIT USER & AUTHOR PROFILE                        */}
      {/* ================================================================= */}
      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#dcdfe7] rounded-[15px] w-full max-w-lg p-6 sm:p-8 my-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#dcdfe7]">
              <h3 className="text-xl font-bold text-[#171920]">
                {editingUser.id ? 'Editar Perfil de Usuario / Autor' : 'Nuevo Usuario / Autor'}
              </h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-[#595F71] hover:text-[#171920] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUserFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#171920] mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.name || ''}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-[8px] border border-[#dcdfe7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171920] mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingUser.email || ''}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-[8px] border border-[#dcdfe7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171920] mb-1">
                    Rol en el sistema *
                  </label>
                  <select
                    value={editingUser.role || 'author'}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-[8px] border border-[#dcdfe7] bg-white"
                  >
                    <option value="admin">Administrador</option>
                    <option value="author">Autor Editorial</option>
                    <option value="reader">Lector</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171920] mb-1">
                    Especialidad / Cargo Editorial
                  </label>
                  <input
                    type="text"
                    value={editingUser.specialty || ''}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, specialty: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-[8px] border border-[#dcdfe7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171920] mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={editingUser.location || ''}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, location: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-[8px] border border-[#dcdfe7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171920] mb-1">
                  Biografía de Autor
                </label>
                <textarea
                  rows={3}
                  value={editingUser.bio || ''}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, bio: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-[8px] border border-[#dcdfe7] leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-[#dcdfe7] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-[8px] text-xs font-semibold border border-[#dcdfe7] text-[#4b546e] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-[8px] text-xs font-semibold text-white bg-[#FF2C54] hover:bg-[#171920] transition-colors cursor-pointer"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
