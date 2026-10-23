export type UserRole = 'admin' | 'moderator' | 'editor' | 'author' | 'reader';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'free';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug?: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  durationDays: number;
  description: string;
  features: string[];
  badgeColor?: string;
  badge?: string;
  popular?: boolean;
  highlighted?: boolean;
  active: boolean;
}

export interface HashtagItem {
  id: string;
  tag?: string; // without #, e.g. 'FotografíaDocumental' or 'Sunset'
  name?: string;
  slug?: string;
  description: string;
  color?: string;
  featured: boolean;
  usageCount?: number;
  createdAt: string;
}

export interface PrivateMessage {
  id: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  senderIsPremium?: boolean;
  recipientId: string;
  recipientName?: string;
  recipientRole?: string;
  subject: string;
  body: string;
  category: 'editorial' | 'soporte_premium' | 'colaboracion' | 'moderacion';
  read: boolean;
  createdAt: string;
  replyToId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  specialty: string;
  bio: string;
  location: string;
  website: string;
  twitter: string;
  instagram: string;
  linkedin?: string;
  youtube?: string;
  github?: string;
  avatarTheme: 'terracotta' | 'slate' | 'forest' | 'navy' | 'ochre';
  avatarUrl?: string;
  active: boolean;
  joinedAt: string;
  // Premium Subscription Management Fields
  isPremium?: boolean;
  subscriptionPlanId?: string;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  billingCycle?: 'monthly' | 'annual' | 'none';
  autoRenew?: boolean;
}

export type ArticleCategory = string;

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  accentColor?: string;
}

export type VisualPreset =
  | 'summer_coast'
  | 'alpine_lake'
  | 'vr_headset'
  | 'smartphone_era'
  | 'xe_entertainment'
  | 'tropical_beach'
  | 'tech_hq'
  | 'minimal_gadgets'
  | 'voice_privacy'
  | 'travel_apps'
  | 'usbc_future'
  | 'photo_mistakes'
  | 'winter_fashion'
  | 'madrid_runway'
  | 'friday_attire'
  | 'travel_pro'
  | 'breathtaking_cliffs';

export type ArticleApprovalStatus = 'approved' | 'pending_review' | 'rejected';
export type ArticlePublishMode = 'immediate' | 'scheduled';

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string[];
  richContentHtml?: string;
  pullQuote: string;
  category: ArticleCategory;
  authorId: string;
  coAuthorIds?: string[];
  publishedAt: string;
  readTimeMinutes: number;
  featuredHero: boolean;
  akeaSection: 'recent' | 'tech_lead' | 'tech_stack' | 'fashion_medium' | 'travel_top' | 'travel_bottom';
  visualPreset: VisualPreset;
  customImageUrl?: string;
  galleryImages?: string[];
  tags: string[];
  views: number;
  likes: number;
  dislikes?: number;
  shares: number;
  trending?: boolean;
  status: 'published' | 'draft' | 'scheduled' | 'pending_review' | 'rejected';
  // Premium & Editorial Workflow & SEO Fields
  isPremium?: boolean;
  approvalStatus?: ArticleApprovalStatus;
  publishMode?: ArticlePublishMode;
  scheduledPublishAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface BlogComment {
  id: string;
  articleId: string;
  userId?: string;
  authorName: string;
  authorEmail: string;
  authorRole?: UserRole;
  content: string;
  createdAt: string;
  status: CommentStatus;
}

export interface SiteConfig {
  siteTitle: string;
  siteTagline: string;
  logoText: string;
  logoDotColor: string;
  logoImageUrl: string;
  useImageLogo: boolean;
  primaryAccentColor: string;
  secondaryAccentColor: string;
  pageBackgroundColor: string;
  surfaceBackgroundColor: string;
  footerBackgroundColor: string;
  editorsPickTitle: string;
  editorsPickSubtitle: string;
  postsPerPage: number;
  footerDescription: string;
  footerCopyright: string;
  newsletterHeading: string;
  newsletterPlaceholder: string;
  newsletterButtonText: string;
  showNewsletterBox: boolean;
  contactEmail: string;
  promoBannerEnabled: boolean;
  promoBannerText: string;
  promoBannerCta: string;
  promoBannerColor: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  metaAuthor?: string;
  ogImage?: string;
  robotsIndex?: boolean;
  // Legal Pages Content
  copyrightPageTitle?: string;
  copyrightPageContent?: string;
  refundPolicyTitle?: string;
  refundPolicyContent?: string;
  privacyPolicyTitle?: string;
  privacyPolicyContent?: string;
  termsPageTitle?: string;
  termsPageContent?: string;
  termsTitle?: string;
  termsContent?: string;
}

export interface SubscriberItem {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'unsubscribed';
  source: string;
  tags: string[];
  joinedAt: string;
  pushEnabled?: boolean;
  pushDeviceLabel?: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  segment: 'all' | 'active' | 'vip';
  featuredArticleId?: string;
  contentHeadline?: string;
  contentBody?: string;
  customMessage?: string;
  ctaText: string;
  ctaUrl: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledDate?: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
}

export interface PushNotificationItem {
  id: string;
  type: 'new_article' | 'new_campaign' | 'custom_alert';
  title: string;
  body: string;
  imageUrl?: string;
  category?: string;
  targetArticleId?: string;
  targetCampaignId?: string;
  ctaText: string;
  segment: 'all' | 'active' | 'vip';
  recipientCount: number;
  createdAt: string;
}

export interface DatabaseState {
  users: User[];
  categories: CategoryItem[];
  hashtags?: HashtagItem[];
  subscriptionPlans?: SubscriptionPlan[];
  messages?: PrivateMessage[];
  articles: Article[];
  comments: BlogComment[];
  subscribers: string[];
  subscriberRecords?: SubscriberItem[];
  campaigns?: MarketingCampaign[];
  pushNotifications?: PushNotificationItem[];
  siteConfig?: SiteConfig;
}

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-1',
    name: 'Estilo de Vida',
    slug: 'estilo-de-vida',
    description: 'Bienestar, gastronomía, cultura cotidiana y equilibrio personal.',
    color: '#FF2C54',
  },
  {
    id: 'cat-2',
    name: 'Moda',
    slug: 'moda',
    description: 'Tendencias de pasarela, estilo urbano y dirección creativa textil.',
    color: '#5960FF',
  },
  {
    id: 'cat-3',
    name: 'Tecnología',
    slug: 'tecnologia',
    description: 'Innovación digital, diseño industrial, fotografía computacional y futuro.',
    color: '#0EA5E9',
  },
  {
    id: 'cat-4',
    name: 'Viajes',
    slug: 'viajes',
    description: 'Crónicas de expedición, miradores naturales y destinos con encanto.',
    color: '#10B981',
  },
  {
    id: 'cat-5',
    name: 'Fotografía',
    slug: 'fotografia',
    description: 'Composición visual, iluminación natural, cámaras y ensayos documentales.',
    color: '#F59E0B',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Alice Qelvin',
    email: 'alice@kayleen-studio.com',
    password: 'admin123',
    role: 'admin',
    specialty: 'Editor-in-Chief & Directora Creativa en Kayleen',
    bio: 'Directora editorial y autora principal de Kayleen Home 03. Coordina las ediciones visuales de estilo de vida, viajes y cultura contemporánea.',
    location: 'Madrid / Nueva York',
    website: 'rivaxstudio.com/kayleen',
    twitter: '@aliceqelvin',
    instagram: '@alice.kayleen',
    linkedin: 'linkedin.com/in/aliceqelvin',
    youtube: '@kayleenmagazine',
    github: 'github.com/aliceqelvin',
    avatarTheme: 'terracotta',
    avatarUrl: '/images/kayleen/nora-hutton-tCJ44OIqceU-unsplash.jpg',
    active: true,
    joinedAt: '2024-03-12',
    isPremium: true,
    subscriptionPlanId: 'plan-vip',
    subscriptionStatus: 'active',
    subscriptionStart: '2026-01-01',
    subscriptionEnd: '2027-12-31',
    billingCycle: 'annual',
    autoRenew: true,
  },
  {
    id: 'usr-2',
    name: 'Jane Smith',
    email: 'jane@kayleen-studio.com',
    password: 'author123',
    role: 'editor',
    specialty: 'Redactora Jefa de Moda & Estilo de Vida',
    bio: 'Crítica de moda, redactora jefa y fotógrafa documental. Aprueba y coordina colecciones contemporáneas, bienestar y tendencias culturales para Kayleen.',
    location: 'Madrid, España',
    website: 'janesmith.studio',
    twitter: '@janesmith_style',
    instagram: '@jane.kayleen',
    linkedin: 'linkedin.com/in/janesmith-editorial',
    youtube: '@janesmithstudio',
    github: '',
    avatarTheme: 'slate',
    avatarUrl: '/images/kayleen/brooke-lark-atzWFItRHy8-unsplash-150x150.jpg',
    active: true,
    joinedAt: '2024-05-19',
    isPremium: true,
    subscriptionPlanId: 'plan-annual',
    subscriptionStatus: 'active',
    subscriptionStart: '2026-01-15',
    subscriptionEnd: '2027-01-15',
    billingCycle: 'annual',
    autoRenew: true,
  },
  {
    id: 'usr-3',
    name: 'Paul Newman',
    email: 'paul@kayleen-studio.com',
    password: 'author123',
    role: 'author',
    specialty: 'Escritor & Cronista de Tecnología, Viajes y Fotografía',
    bio: 'Especialista en fotografía de paisaje, cultura digital y crónicas de expedición. Explora cómo la imagen contemporánea transforma nuestra percepción.',
    location: 'Lisboa, Portugal',
    website: 'paulnewman.photo',
    twitter: '@paul_expeditions',
    instagram: '@paul.kayleen',
    linkedin: 'linkedin.com/in/paulnewman-photo',
    youtube: '@paulexpeditions',
    github: 'github.com/paulnewman-lab',
    avatarTheme: 'forest',
    avatarUrl: '/images/kayleen/cleyton-ewerton-N3JngnkuyRs-unsplash-150x150.jpg',
    active: true,
    joinedAt: '2024-07-04',
    isPremium: true,
    subscriptionPlanId: 'plan-annual',
    subscriptionStatus: 'active',
    subscriptionStart: '2026-02-01',
    subscriptionEnd: '2027-02-01',
    billingCycle: 'annual',
    autoRenew: true,
  },
  {
    id: 'usr-4',
    name: 'Elena Rostova',
    email: 'elena@kayleen-studio.com',
    password: 'reader123',
    role: 'reader',
    specialty: 'Suscriptora Premium & Coleccionista Editorial',
    bio: 'Lectora Premium de Kayleen y apasionada por la fotografía documental, la botánica de interior y las publicaciones independientes.',
    location: 'Barcelona, España',
    website: 'elenarostova.es',
    twitter: '@elena_print',
    instagram: '@elena.books',
    linkedin: 'linkedin.com/in/elenarostova',
    youtube: '',
    github: '',
    avatarTheme: 'navy',
    avatarUrl: '/images/kayleen/mihai-stefan-658815-unsplash-150x150.jpg',
    active: true,
    joinedAt: '2025-01-15',
    isPremium: true,
    subscriptionPlanId: 'plan-annual',
    subscriptionStatus: 'active',
    subscriptionStart: '2026-02-10',
    subscriptionEnd: '2027-02-10',
    billingCycle: 'annual',
    autoRenew: true,
  },
  {
    id: 'usr-5',
    name: 'Mateo Alarcón',
    email: 'mateo@kayleen-studio.com',
    password: 'mod123',
    role: 'moderator',
    specialty: 'Moderador Editorial & Curador de Comunidad',
    bio: 'Responsable de moderación editorial, revisión de artículos en cola de aprobación y comunicación directa con suscriptores Premium.',
    location: 'Valencia, España',
    website: 'mateoalarcon.es',
    twitter: '@mateo_mod',
    instagram: '@mateo.kayleen',
    linkedin: 'linkedin.com/in/mateoalarcon',
    youtube: '',
    github: '',
    avatarTheme: 'ochre',
    avatarUrl: '/images/kayleen/jordan-whitfield-qODM8pfwRO4-unsplash-1000x600.jpg',
    active: true,
    joinedAt: '2025-03-01',
    isPremium: true,
    subscriptionPlanId: 'plan-vip',
    subscriptionStatus: 'active',
    subscriptionStart: '2026-01-01',
    subscriptionEnd: '2027-12-31',
    billingCycle: 'annual',
    autoRenew: true,
  },
  {
    id: 'usr-6',
    name: 'Sofía Mendoza',
    email: 'sofia.mendoza@designlab.es',
    password: 'free123',
    role: 'reader',
    specialty: 'Lectora Registrada (Cuenta Free)',
    bio: 'Diseñadora gráfica e ilustradora. Lectora de artículos abiertos de Kayleen Magazine.',
    location: 'Sevilla, España',
    website: 'sofiadesign.es',
    twitter: '@sofia_design',
    instagram: '@sofia.mendoza',
    linkedin: '',
    youtube: '',
    github: '',
    avatarTheme: 'terracotta',
    active: true,
    joinedAt: '2026-01-20',
    isPremium: false,
    subscriptionPlanId: '',
    subscriptionStatus: 'free',
    subscriptionStart: '',
    subscriptionEnd: '',
  },
  {
    id: 'usr-7',
    name: 'Marco Valerio',
    email: 'marco.valerio@estudio.it',
    password: 'free123',
    role: 'reader',
    specialty: 'Arquitecto & Fotógrafo (Suscripción Vencida)',
    bio: 'Entusiasta de la fotografía analógica y la arquitectura brutalista.',
    location: 'Milán, Italia',
    website: 'marcovalerio.it',
    twitter: '@marcovalerio',
    instagram: '@marco.arch',
    linkedin: '',
    youtube: '',
    github: '',
    avatarTheme: 'slate',
    active: true,
    joinedAt: '2025-09-10',
    isPremium: false,
    subscriptionPlanId: 'plan-monthly',
    subscriptionStatus: 'expired',
    subscriptionStart: '2026-01-05',
    subscriptionEnd: '2026-02-05',
    billingCycle: 'monthly',
    autoRenew: false,
  },
];

export const INITIAL_ARTICLES: Article[] = [
  // =========================================================================
  // SECTION 1 (69c40c6): HERO TILES-LAYOUT-11 (3 Posts: 1 Large 2x2 + 2 Right)
  // =========================================================================
  {
    id: 'art-1',
    slug: 'ready-to-go-home-after-the-sunset-view',
    title: 'Ready To Go Home After The Sunset View?',
    subtitle: 'La calma dorada del atardecer frente al horizonte y el arte de desconectar al final de la jornada.',
    excerpt: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Un recorrido visual por los mejores miradores al caer el sol.',
    content: [
      'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.',
      'Contemplar la transición cromática del cielo durante los últimos veinte minutos de luz solar transforma nuestra percepción del día. En los miradores costeros y colinas abiertas, el silencio del crepúsculo invita a una pausa necesaria antes de regresar a casa.',
      'Para los fotógrafos de Kayleen, esta hora azul y dorada ofrece el equilibrio más rico entre sombras suaves y tonos cálidos naturales sin necesidad de iluminación artificial.'
    ],
    pullQuote: 'El atardecer no es el cierre del día, sino el instante en que la mirada recupera su serenidad natural.',
    category: 'Viajes',
    authorId: 'usr-1',
    coAuthorIds: ['usr-3'],
    publishedAt: 'November 18, 2026',
    readTimeMinutes: 4,
    featuredHero: true,
    akeaSection: 'travel_top',
    visualPreset: 'summer_coast',
    customImageUrl: '/images/kayleen/ben-masora-7GJr-Zxs-IY-unsplash-700x500.jpg',
    galleryImages: [
      '/images/kayleen/ben-masora-7GJr-Zxs-IY-unsplash-700x500.jpg',
      '/images/kayleen/najla-cam-F71ZHHBYs3w-unsplash-1000x600.jpg',
      '/images/kayleen/very-petty-girl-WRotPmZiXZQ-unsplash-400x300.jpg',
    ],
    tags: ['Sunset', 'Viajes', 'Lifestyle', 'Naturaleza'],
    views: 942,
    likes: 128,
    dislikes: 3,
    shares: 64,
    status: 'published',
    isPremium: false,
    approvalStatus: 'approved',
    publishMode: 'immediate',
    reviewedBy: 'Alice Qelvin (Admin)',
  },
  {
    id: 'art-2',
    slug: 'these-fabulous-photos-will-have-astonishing',
    title: 'These Fabulous Photos Will Have Astonishing',
    subtitle: 'Composición arquitectónica, geometría urbana y el poder narrativo de la fotografía contemporánea.',
    excerpt: 'Descubre cómo las nuevas series fotográficas combinan minimalismo cromático, luz natural y encuadres audaces que cautivan a primera vista.',
    content: [
      'La fotografía contemporánea vive un renacimiento marcado por la búsqueda de autenticidad orgánica. Lejos de los retoques artificiales excesivos, los autores actuales priorizan la textura real de los materiales y la espontaneidad del gesto.',
      'En esta selección curada por el equipo de Kayleen analizamos las obras que están redefiniendo el ensayo visual en galerías y revistas digitales internacionales.',
      'Cada imagen demuestra que basta un ángulo inesperado y una lectura precisa de la luz para convertir una escena cotidiana en una pieza memorable.'
    ],
    pullQuote: 'Una gran fotografía no explica toda la historia; abre una pregunta visual que permanece en la memoria del espectador.',
    category: 'Tecnología',
    authorId: 'usr-1',
    coAuthorIds: ['usr-2'],
    publishedAt: 'November 17, 2026',
    readTimeMinutes: 5,
    featuredHero: true,
    akeaSection: 'tech_lead',
    visualPreset: 'photo_mistakes',
    customImageUrl: '/images/kayleen/benjamin-massello-BVNhd4c7rqg-unsplash-700x500.jpg',
    galleryImages: [
      '/images/kayleen/benjamin-massello-BVNhd4c7rqg-unsplash-700x500.jpg',
      '/images/kayleen/jordan-whitfield-qODM8pfwRO4-unsplash-1000x600.jpg',
    ],
    tags: ['Fotografía', 'Tecnología', 'Arte Visual', 'Tendencias'],
    views: 835,
    likes: 114,
    dislikes: 2,
    shares: 52,
    status: 'published',
    isPremium: true,
    approvalStatus: 'approved',
    publishMode: 'immediate',
    reviewedBy: 'Jane Smith (Redactora Jefa)',
  },
  {
    id: 'art-3',
    slug: 'watch-awesome-kate-manner-go-full-dancing',
    title: 'Watch Awesome Kate Manner Go Full Dancing',
    subtitle: 'Movimiento, expresión corporal y la energía vibrante de la escena artística actual.',
    excerpt: 'Un retrato cercano sobre cómo la danza moderna y la música en vivo están inspirando una nueva ola de dirección creativa y moda urbana.',
    content: [
      'El movimiento escénico de Kate Manner se ha convertido en uno de los referentes más magnéticos de la temporada cultural. Su capacidad para fusionar improvisación rítmica y presencia visual ha cautivado tanto a directores de cine como a diseñadores de moda.',
      'Durante nuestra sesión documental pudimos observar cómo el vestuario fluido y la iluminación cálida acompañan cada giro con una naturalidad extraordinaria.',
      'El resultado es una celebración de la vitalidad creativa y de la libertad expresiva en estado puro.'
    ],
    pullQuote: 'Cuando el ritmo y la expresión corporal son auténticos, cada fotograma transmite movimiento incluso en silencio.',
    category: 'Estilo de Vida',
    authorId: 'usr-1',
    coAuthorIds: [],
    publishedAt: 'November 17, 2026',
    readTimeMinutes: 3,
    featuredHero: true,
    akeaSection: 'fashion_medium',
    visualPreset: 'xe_entertainment',
    customImageUrl: '/images/kayleen/ayo-ogunseinde-RrD8ypt8cjY-unsplash-700x500.jpg',
    galleryImages: ['/images/kayleen/ayo-ogunseinde-RrD8ypt8cjY-unsplash-700x500.jpg'],
    tags: ['Cultura', 'Danza', 'Estilo de Vida', 'Música'],
    views: 780,
    likes: 96,
    dislikes: 1,
    shares: 41,
    status: 'published',
    isPremium: false,
    approvalStatus: 'approved',
    publishMode: 'immediate',
  },

  // =========================================================================
  // SECTION 2 (510785e): EDITOR'S PICK (3 Tall Vertical Portrait Cards 400x600)
  // =========================================================================
  {
    id: 'art-4',
    slug: 'what-it-takes-to-live-in-the-world-of-denial-and-fear',
    title: 'What It Takes to Live in the World of Denial and Fear',
    subtitle: 'Claridad mental, propósito creativo y serenidad frente a la aceleración del mundo moderno.',
    excerpt: 'Una reflexión profunda sobre cómo cultivar espacios de calma, pensamiento crítico y equilibrio emocional en la era de la hiperconexión.',
    content: [
      'Vivimos rodeados de estímulos constantes que compiten por fragmentar nuestra atención. Encontrar un centro de gravedad propio exige aprender a filtrar el ruido informativo y reconectar con actividades tangibles.',
      'La lectura pausada, el contacto con entornos naturales y la conversación honesta siguen siendo los mejores antídotos frente a la incertidumbre colectiva.',
      'En este ensayo exploramos hábitos cotidianos respaldados por creadores y pensadores para habitar el presente con serenidad y lucidez.'
    ],
    pullQuote: 'La serenidad no consiste en aislarse del mundo, sino en comprenderlo sin perder nuestra propia voz interior.',
    category: 'Estilo de Vida',
    authorId: 'usr-1',
    coAuthorIds: ['usr-3'],
    publishedAt: 'November 18, 2026',
    readTimeMinutes: 5,
    featuredHero: false,
    akeaSection: 'tech_stack',
    visualPreset: 'alpine_lake',
    customImageUrl: '/images/kayleen/noah-buscher-1-kPytLsVkY-unsplash-400x600.jpg',
    galleryImages: ['/images/kayleen/noah-buscher-1-kPytLsVkY-unsplash-400x600.jpg'],
    tags: ['Editor Pick', 'Reflexión', 'Cultura', 'Mindfulness'],
    views: 890,
    likes: 145,
    dislikes: 4,
    shares: 59,
    status: 'published',
    isPremium: false,
    approvalStatus: 'approved',
    publishMode: 'immediate',
  },
  {
    id: 'art-5',
    slug: 'this-is-my-favourite-fashion-that-i-watching',
    title: 'This Is My Favourite Fashion That I Watching',
    subtitle: 'Colores vibrantes, texturas contemporáneas y el regreso de la sastrería expresiva.',
    excerpt: 'Analizamos las propuestas estilísticas más inspiradoras del año, donde el contraste cromático y la comodidad redefinen la elegancia diaria.',
    content: [
      'La moda actual ha dejado atrás las reglas rígidas para convertirse en un laboratorio de identidad personal. Las colecciones más celebradas de esta temporada apuestan por siluetas versátiles que transitan sin esfuerzo de la mañana a la noche.',
      'Destacan los tejidos orgánicos de caída fluida, los accesorios de inspiración retro y una paleta que combina tonos tierra con acentos luminosos.',
      'Te mostramos cómo incorporar estas referencias de pasarela en un armario funcional y lleno de carácter.'
    ],
    pullQuote: 'El estilo personal florece cuando las prendas acompañan nuestra personalidad en lugar de disfrazarla.',
    category: 'Moda',
    authorId: 'usr-2',
    coAuthorIds: ['usr-1'],
    publishedAt: 'November 18, 2026',
    readTimeMinutes: 4,
    featuredHero: false,
    akeaSection: 'fashion_medium',
    visualPreset: 'winter_fashion',
    customImageUrl: '/images/kayleen/nantu-das-08SgCUfxSoE-unsplash-400x600.jpg',
    galleryImages: [
      '/images/kayleen/nantu-das-08SgCUfxSoE-unsplash-400x600.jpg',
      '/images/kayleen/mihai-stefan-658815-unsplash-1000x600.jpg',
    ],
    tags: ['Editor Pick', 'Moda', 'Tendencias', 'Estilo'],
    views: 920,
    likes: 162,
    dislikes: 5,
    shares: 74,
    status: 'published',
    isPremium: true,
    approvalStatus: 'approved',
    publishMode: 'immediate',
    reviewedBy: 'Alice Qelvin (Admin)',
  },
  {
    id: 'art-6',
    slug: 'how-to-keep-work-and-personal-life-apart',
    title: 'How to Keep Work and Personal Life Apart',
    subtitle: 'Diseño de rutinas saludables, límites digitales y bienestar para profesionales creativos.',
    excerpt: 'Estrategias prácticas para proteger tu tiempo libre y mantener la inspiración fresca cuando trabajas en proyectos creativos o remotos.',
    content: [
      'Cuando nuestra vocación profesional coincide con nuestra pasión creativa, la línea entre el trabajo y el descanso puede desdibujarse con facilidad. Sin embargo, la creatividad sostenible necesita periodos reales de desconexión.',
      'Establecer rituales claros de cierre de jornada, separar físicamente el espacio de estudio y silenciar las notificaciones fuera de horario transforma tanto el bienestar personal como la calidad del trabajo.',
      'Compartimos las prácticas que aplicamos en el estudio de Kayleen para equilibrar productividad y vida personal.'
    ],
    pullQuote: 'El descanso consciente no es tiempo restado al trabajo; es la fuente misma de donde nace toda buena idea.',
    category: 'Estilo de Vida',
    authorId: 'usr-1',
    coAuthorIds: [],
    publishedAt: 'November 18, 2026',
    readTimeMinutes: 4,
    featuredHero: false,
    akeaSection: 'tech_stack',
    visualPreset: 'minimal_gadgets',
    customImageUrl: '/images/kayleen/divine-effiong-ovMPeGM3W-s-unsplash-400x600.jpg',
    galleryImages: ['/images/kayleen/divine-effiong-ovMPeGM3W-s-unsplash-400x600.jpg'],
    tags: ['Editor Pick', 'Bienestar', 'Productividad', 'Equilibrio'],
    views: 845,
    likes: 138,
    dislikes: 2,
    shares: 63,
    status: 'published',
    isPremium: false,
    approvalStatus: 'approved',
    publishMode: 'immediate',
  },

  // =========================================================================
  // SECTION 3 (4cc7931): MAIN STREAM MODERN POSTS (6 Large 1000x600 Cards)
  // =========================================================================
  {
    id: 'art-7',
    slug: 'together-we-can-make-the-world-a-better-place',
    title: 'Together We Can Make The World A Better Place',
    subtitle: 'Comunidad, innovación responsable y proyectos colaborativos que transforman nuestro entorno.',
    excerpt: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics...',
    content: [
      'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.',
      'Las iniciativas locales de diseño sostenible, energía limpia y cultura comunitaria están demostrando que los grandes cambios comienzan siempre a escala humana. Cuando diseñadores, ingenieros y vecinos colaboran con un propósito común, el impacto se multiplica.',
      'Documentamos historias reales de cooperación creativa que están mejorando la calidad de vida en diversas ciudades.'
    ],
    pullQuote: 'La innovación más valiosa es aquella que fortalece los lazos de la comunidad y cuida el entorno compartido.',
    category: 'Tecnología',
    authorId: 'usr-1',
    coAuthorIds: ['usr-2', 'usr-3'],
    publishedAt: 'November 18, 2026',
    readTimeMinutes: 3,
    featuredHero: false,
    akeaSection: 'recent',
    visualPreset: 'tech_hq',
    customImageUrl: '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg',
    galleryImages: [
      '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg',
      '/images/kayleen/brooke-lark-atzWFItRHy8-unsplash-1000x600.jpg',
    ],
    tags: ['Comunidad', 'Futuro', 'Naturaleza', 'Innovación'],
    views: 766,
    likes: 119,
    dislikes: 2,
    shares: 48,
    status: 'published',
    isPremium: false,
    approvalStatus: 'approved',
    publishMode: 'immediate',
  },
  {
    id: 'art-8',
    slug: 'it-really-have-good-feeling-when-you-enjoy-nature',
    title: 'It Really Have Good Feeling When You Enjoy Nature',
    subtitle: 'Gastronomía al aire libre, frutos de temporada y el placer de las mañanas luminosas.',
    excerpt: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Disfrutar de los sabores naturales y la luz de la mañana...',
    content: [
      'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.',
      'Comenzar el día con ingredientes frescos de temporada, luz natural y una mesa compartida al aire libre reconecta nuestros sentidos con el ritmo de las estaciones.',
      'Exploramos recetas sencillas y saludables que celebran el color y la frescura de los productos locales.'
    ],
    pullQuote: 'La sencillez de una mesa al sol con productos frescos encierra toda la filosofía del buen vivir.',
    category: 'Estilo de Vida',
    authorId: 'usr-1',
    coAuthorIds: ['usr-2'],
    publishedAt: 'November 18, 2026',
    readTimeMinutes: 3,
    featuredHero: false,
    akeaSection: 'recent',
    visualPreset: 'tropical_beach',
    customImageUrl: '/images/kayleen/brooke-lark-atzWFItRHy8-unsplash-1000x600.jpg',
    galleryImages: [
      '/images/kayleen/brooke-lark-atzWFItRHy8-unsplash-1000x600.jpg',
      '/images/kayleen/ayo-ogunseinde-sibVwORYqs0-unsplash-400x300.jpg',
    ],
    tags: ['Salud', 'Naturaleza', 'Gastronomía', 'Lifestyle'],
    views: 912,
    likes: 154,
    dislikes: 3,
    shares: 69,
    status: 'published',
    isPremium: false,
    approvalStatus: 'approved',
    publishMode: 'immediate',
  },
  {
    id: 'art-9',
    slug: 'best-dressed-girl-in-fashion-industry',
    title: 'Best Dressed Girl in Fashion Industry in 2026',
    subtitle: 'Retrato editorial, dirección de arte y las claves del nuevo estilo urbano.',
    excerpt: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Las protagonistas que marcan el pulso estético de las capitales de la moda...',
    content: [
      'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.',
      'El estilo callejero durante las semanas internacionales de la moda se ha consolidado como el verdadero termómetro de las tendencias globales. La autenticidad en la mezcla de prendas clásicas y piezas de autor define a las figuras más fotografiadas del año.',
      'Analizamos los detalles de sastrería, óptica y actitud que convierten un conjunto sencillo en un referente icónico.'
    ],
    pullQuote: 'La verdadera elegancia contemporánea nace de la seguridad personal y de la atención a los pequeños detalles.',
    category: 'Moda',
    authorId: 'usr-2',
    coAuthorIds: ['usr-1'],
    publishedAt: 'November 18, 2026',
    readTimeMinutes: 4,
    featuredHero: false,
    akeaSection: 'recent',
    visualPreset: 'madrid_runway',
    customImageUrl: '/images/kayleen/mihai-stefan-658815-unsplash-1000x600.jpg',
    galleryImages: [
      '/images/kayleen/mihai-stefan-658815-unsplash-1000x600.jpg',
      '/images/kayleen/jeferson-gomes-CO5DDUO8BWY-unsplash-400x300.jpg',
    ],
    tags: ['Moda', 'Street Style', 'Editorial', 'Tendencias'],
    views: 874,
    likes: 141,
    dislikes: 4,
    shares: 57,
    status: 'published',
    isPremium: true,
    approvalStatus: 'approved',
    publishMode: 'immediate',
    reviewedBy: 'Alice Qelvin (Admin)',
  },
  {
    id: 'art-10',
    slug: 'what-it-feels-like-to-no-longer-worry-about-money',
    title: 'What It Feels Like to No Longer Worry About Money',
    subtitle: 'Minimalismo consciente, libertad de tiempo y enfoque en las experiencias verdaderamente valiosas.',
    excerpt: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Cómo simplificar nuestras prioridades para ganar paz mental y libertad creativa...',
    content: [
      'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.',
      'Alcanzar la tranquilidad financiera rara vez depende de acumular posesiones superfluas; suele ser el resultado de alinear nuestros gastos con aquello que realmente nos aporta significado y autonomía.',
      'Conversamos con profesionales independientes que rediseñaron su estilo de vida para priorizar el tiempo creativo y los viajes.'
    ],
    pullQuote: 'La mayor riqueza contemporánea consiste en ser dueño de tu propio calendario y de tu atención.',
    category: 'Estilo de Vida',
    authorId: 'usr-3',
    coAuthorIds: [],
    publishedAt: 'November 18, 2026',
    readTimeMinutes: 3,
    featuredHero: false,
    akeaSection: 'recent',
    visualPreset: 'friday_attire',
    customImageUrl: '/images/kayleen/cleyton-ewerton-N3JngnkuyRs-unsplash-1000x600.jpg',
    galleryImages: ['/images/kayleen/cleyton-ewerton-N3JngnkuyRs-unsplash-1000x600.jpg'],
    tags: ['Libertad', 'Minimalismo', 'Cultura', 'Bienestar'],
    views: 695,
    likes: 98,
    dislikes: 1,
    shares: 44,
    status: 'published',
    isPremium: false,
    approvalStatus: 'approved',
    publishMode: 'immediate',
  },
  {
    id: 'art-11',
    slug: 'mental-shoot-tips-to-cope-with-the-end-of-summer',
    title: 'Mental Shoot Tips to Cope With the End of Summer',
    subtitle: 'Proyectos fotográficos de otoño, luz cálida de estudio y nuevos comienzos creativos.',
    excerpt: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Ideas prácticas para canalizar la nostalgia estival en nuevos proyectos visuales...',
    content: [
      'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.',
      'El final del verano marca el inicio de una de las estaciones más fotogénicas del año. La inclinación solar del otoño ofrece sombras largas y tonos ambarinos ideales para el retrato y la fotografía urbana.',
      'Proponemos cinco ejercicios visuales para renovar la mirada y preparar tu portafolio de cara al nuevo trimestre.'
    ],
    pullQuote: 'Cada cambio de estación trae consigo una nueva paleta de luz esperando ser descubierta.',
    category: 'Fotografía',
    authorId: 'usr-3',
    coAuthorIds: ['usr-1'],
    publishedAt: 'November 18, 2026',
    readTimeMinutes: 3,
    featuredHero: false,
    akeaSection: 'recent',
    visualPreset: 'photo_mistakes',
    customImageUrl: '/images/kayleen/jordan-whitfield-qODM8pfwRO4-unsplash-1000x600.jpg',
    galleryImages: [
      '/images/kayleen/jordan-whitfield-qODM8pfwRO4-unsplash-1000x600.jpg',
      '/images/kayleen/benjamin-massello-BVNhd4c7rqg-unsplash-700x500.jpg',
    ],
    tags: ['Fotografía', 'Verano', 'Creatividad', 'Luz'],
    views: 742,
    likes: 112,
    dislikes: 2,
    shares: 39,
    status: 'published',
    isPremium: true,
    approvalStatus: 'approved',
    publishMode: 'immediate',
    reviewedBy: 'Mateo Alarcón (Moderador)',
  },
  {
    id: 'art-12',
    slug: 'what-to-think-about-when-everything-goes-wrong',
    title: 'What to Think About When Everything Goes Wrong',
    subtitle: 'Resiliencia, perspectiva y el arte de encontrar nuevas rutas ante los imprevistos.',
    excerpt: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Una guía serena para transformar los contratiempos en oportunidades de aprendizaje...',
    content: [
      'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.',
      'Muchos de los hallazgos más memorables en el arte, la ciencia y los viajes surgieron precisamente cuando el plan original tuvo que modificarse sobre la marcha.',
      'Cultivar una mentalidad flexible nos permite observar los imprevistos con curiosidad en lugar de frustración.'
    ],
    pullQuote: 'Cuando el mapa previsto cambia, comienza la verdadera expedición creativa.',
    category: 'Viajes',
    authorId: 'usr-1',
    coAuthorIds: [],
    publishedAt: 'November 18, 2026',
    readTimeMinutes: 4,
    featuredHero: false,
    akeaSection: 'recent',
    visualPreset: 'breathtaking_cliffs',
    customImageUrl: '/images/kayleen/najla-cam-F71ZHHBYs3w-unsplash-1000x600.jpg',
    galleryImages: ['/images/kayleen/najla-cam-F71ZHHBYs3w-unsplash-1000x600.jpg'],
    tags: ['Perspectiva', 'Viajes', 'Mentalidad', 'Ensayo'],
    views: 688,
    likes: 105,
    dislikes: 1,
    shares: 37,
    status: 'published',
    isPremium: false,
    approvalStatus: 'approved',
    publishMode: 'immediate',
  },

  // =========================================================================
  // SECTION 4: HEADER 4-COL BAR (7535fd1) & SIDEBAR FEATURED CAROUSEL (c8a3b47)
  // =========================================================================
  {
    id: 'art-13',
    slug: '10-ways-to-stick-to-your-exercise-routine-on-vacation',
    title: '10 Ways To Stick To Your Exercise Routine On Vacation',
    subtitle: 'Movimiento activo, recorridos a pie al amanecer y bienestar durante tus viajes.',
    excerpt: 'Cómo mantener la energía y la vitalidad mientras exploras nuevos destinos sin necesidad de gimnasios cerrados.',
    content: [
      'Viajar es la oportunidad perfecta para sustituir las rutinas sedentarias por la exploración activa: caminatas costeras al amanecer, rutas en bicicleta y estiramientos frente al mar.',
      'Reunimos diez consejos sencillos para regresar de cada viaje con más energía que cuando partiste.'
    ],
    pullQuote: 'Explorar una ciudad a pie al amanecer es el mejor entrenamiento para el cuerpo y para la mirada.',
    category: 'Viajes',
    authorId: 'usr-3',
    coAuthorIds: [],
    publishedAt: 'November 17, 2026',
    readTimeMinutes: 3,
    featuredHero: false,
    akeaSection: 'travel_bottom',
    visualPreset: 'travel_pro',
    customImageUrl: '/images/kayleen/very-petty-girl-WRotPmZiXZQ-unsplash-400x300.jpg',
    galleryImages: ['/images/kayleen/very-petty-girl-WRotPmZiXZQ-unsplash-400x300.jpg'],
    tags: ['Vacaciones', 'Bienestar', 'Viajes', 'Salud'],
    views: 540,
    likes: 82,
    dislikes: 1,
    shares: 29,
    status: 'published',
    isPremium: false,
    approvalStatus: 'approved',
    publishMode: 'immediate',
  },
  {
    id: 'art-14',
    slug: 'low-carb-diet-recipes-and-general-advice',
    title: 'Low Carb Diet: Recipes and General Advice',
    subtitle: 'Ingredientes mediterráneos, energía sostenida y platos llenos de sabor.',
    excerpt: 'Una guía práctica con recetas equilibradas y consejos nutricionales basados en alimentos reales de temporada.',
    content: [
      'La cocina saludable no tiene por qué ser restrictiva ni aburrida. Al priorizar verduras asadas, aceite de oliva virgen extra, frutos secos y proteínas de calidad, cada plato gana en textura y sabor.',
      'Compartimos nuestras recetas favoritas para el día a día en el estudio.'
    ],
    pullQuote: 'Comer bien es un acto diario de cuidado y creatividad.',
    category: 'Estilo de Vida',
    authorId: 'usr-2',
    coAuthorIds: [],
    publishedAt: 'November 17, 2026',
    readTimeMinutes: 4,
    featuredHero: false,
    akeaSection: 'travel_bottom',
    visualPreset: 'summer_coast',
    customImageUrl: '/images/kayleen/ayo-ogunseinde-sibVwORYqs0-unsplash-400x300.jpg',
    galleryImages: ['/images/kayleen/ayo-ogunseinde-sibVwORYqs0-unsplash-400x300.jpg'],
    tags: ['Nutrición', 'Recetas', 'Salud', 'Lifestyle'],
    views: 615,
    likes: 94,
    dislikes: 2,
    shares: 35,
    status: 'published',
    isPremium: false,
    approvalStatus: 'approved',
    publishMode: 'immediate',
  },
  {
    id: 'art-15',
    slug: 'spring-fashion-show-at-the-university-of-michigan',
    title: 'Spring Fashion Show at the University of Michigan',
    subtitle: 'El talento emergente de las escuelas de diseño y la experimentación textil sostenible.',
    excerpt: 'Cobertura especial de las colecciones presentadas por la nueva generación de diseñadores universitarios.',
    content: [
      'Las pasarelas académicas son el espacio donde nacen las ideas más libres de la industria textil. Este año vimos tejidos reciclados, patronaje modular y una audacia cromática extraordinaria.',
      'Analizamos los nombres que pronto protagonizarán las grandes capitales de la moda.'
    ],
    pullQuote: 'El futuro del diseño viste con libertad experimental y conciencia ecológica.',
    category: 'Moda',
    authorId: 'usr-2',
    coAuthorIds: [],
    publishedAt: 'November 17, 2026',
    readTimeMinutes: 4,
    featuredHero: false,
    akeaSection: 'fashion_medium',
    visualPreset: 'madrid_runway',
    customImageUrl: '/images/kayleen/noah-buscher-ru6ONpVluQs-unsplash-400x300.jpg',
    galleryImages: ['/images/kayleen/noah-buscher-ru6ONpVluQs-unsplash-400x300.jpg'],
    tags: ['Pasarela', 'Diseño Joven', 'Moda', 'Primavera'],
    views: 580,
    likes: 88,
    dislikes: 1,
    shares: 31,
    status: 'published',
    isPremium: false,
    approvalStatus: 'approved',
    publishMode: 'immediate',
  },
  {
    id: 'art-16',
    slug: 'worried-for-your-plants-with-this-cold-weather',
    title: 'Worried for Your Plants With This Cold Weather?',
    subtitle: 'Guía de botánica de interior: humedad, luz indirecta y cuidados durante los meses fríos.',
    excerpt: 'Todo lo que necesitas saber para mantener tus plantas de estudio verdes y saludables cuando bajan las temperaturas.',
    content: [
      'Las plantas de interior transforman la atmósfera acústica y visual de cualquier espacio de trabajo, pero el descenso de las temperaturas y la calefacción requieren ajustar la frecuencia de riego.',
      'Te explicamos cómo agrupar especies tropicales y aprovechar la luz natural de las ventanas orientadas al sur.'
    ],
    pullQuote: 'Cuidar un jardín interior enseña el valor de la observación paciente.',
    category: 'Estilo de Vida',
    authorId: 'usr-4',
    coAuthorIds: ['usr-1'],
    publishedAt: 'November 17, 2026',
    readTimeMinutes: 3,
    featuredHero: false,
    akeaSection: 'travel_bottom',
    visualPreset: 'alpine_lake',
    customImageUrl: '/images/kayleen/v-t-UxLcRkhw0yM-unsplash-400x300.jpg',
    galleryImages: ['/images/kayleen/v-t-UxLcRkhw0yM-unsplash-400x300.jpg'],
    tags: ['Botánica', 'Hogar', 'Invierno', 'Plantas'],
    views: 640,
    likes: 103,
    dislikes: 1,
    shares: 42,
    status: 'published',
    isPremium: false,
    approvalStatus: 'approved',
    publishMode: 'immediate',
  },
  {
    id: 'art-17',
    slug: 'expert-advice-the-best-cheap-retro-chic-fashion',
    title: 'Expert Advice: The Best Cheap Retro Chic Fashion',
    subtitle: 'Cómo encontrar piezas vintage de calidad y combinarlas con básicos contemporáneos.',
    excerpt: 'Los secretos de los estilistas para construir un vestuario con estética retro chic auténtica y accesible.',
    content: [
      'La estética retro chic combina la calidez nostálgica de las décadas clásicas con cortes actuales limpios. Buscar en tiendas de segunda mano seleccionadas permite hallar gabardinas, gafas de acetato y bolsos de piel con historia propia.',
      'Aquí tienes nuestras claves para equilibrar piezas vintage con prendas modernas.'
    ],
    pullQuote: 'Las prendas con historia aportan un carácter que ninguna producción masiva puede imitar.',
    category: 'Moda',
    authorId: 'usr-2',
    coAuthorIds: [],
    publishedAt: 'November 17, 2026',
    readTimeMinutes: 4,
    featuredHero: false,
    akeaSection: 'tech_stack',
    visualPreset: 'winter_fashion',
    customImageUrl: '/images/kayleen/jeferson-gomes-CO5DDUO8BWY-unsplash-400x300.jpg',
    galleryImages: ['/images/kayleen/jeferson-gomes-CO5DDUO8BWY-unsplash-400x300.jpg'],
    tags: ['Retro Chic', 'Moda', 'Vintage', 'Estilo'],
    views: 710,
    likes: 118,
    dislikes: 2,
    shares: 46,
    status: 'published',
    isPremium: false,
    approvalStatus: 'approved',
    publishMode: 'immediate',
  },
  {
    id: 'art-18',
    slug: 'arquitectura-de-la-luz-en-los-estudios-nordicos',
    title: 'Arquitectura de la Luz en los Estudios Fotográficos Nórdicos',
    subtitle: 'Ensayo especial para suscriptores sobre diseño espacial, madera clara y difusión lumínica natural.',
    excerpt: 'Un recorrido exclusivo por cinco estudios de Estocolmo y Copenhague que han transformado la luz septentrional en su herramienta creativa principal.',
    content: [
      'En las latitudes nórdicas, donde el ángulo solar cambia drásticamente entre estaciones, los arquitectos y fotógrafos han desarrollado una sensibilidad única para capturar y multiplicar cada rayo de luz natural.',
      'A través de tragaluces orientados al norte, superficies de abedul sin tratar y reflectores textiles artesanales, estos espacios logran una atmósfera envolvente libre de sombras duras.',
      'En este reportaje exclusivo analizamos los planos, materiales y esquemas ópticos de cinco talleres creativos contemporáneos.'
    ],
    pullQuote: 'Diseñar con luz natural es aprender a escuchar el ritmo silencioso de las estaciones.',
    category: 'Fotografía',
    authorId: 'usr-3',
    coAuthorIds: ['usr-2'],
    publishedAt: 'November 20, 2026',
    readTimeMinutes: 6,
    featuredHero: false,
    akeaSection: 'recent',
    visualPreset: 'minimal_gadgets',
    customImageUrl: '/images/kayleen/jordan-whitfield-qODM8pfwRO4-unsplash-1000x600.jpg',
    galleryImages: ['/images/kayleen/jordan-whitfield-qODM8pfwRO4-unsplash-1000x600.jpg'],
    tags: ['Fotografía', 'Arquitectura', 'Luz', 'Tendencias'],
    views: 42,
    likes: 18,
    dislikes: 0,
    shares: 7,
    status: 'pending_review',
    isPremium: true,
    approvalStatus: 'pending_review',
    publishMode: 'immediate',
    reviewNotes: 'Enviado por Paul Newman para revisión de Redacción / Moderación. Propuesto como artículo Premium con publicación automática al aprobarse.',
  },
  {
    id: 'art-19',
    slug: 'cronicas-del-atlantico-expedicion-visual-invierno',
    title: 'Crónicas del Atlántico: Expedición Visual de Invierno',
    subtitle: 'Fotografía de gran formato en acantilados costeros y cuaderno de bitácora analógico.',
    excerpt: 'Una serie documental aprobada por el consejo editorial y programada para su lanzamiento especial de temporada.',
    content: [
      'Durante tres semanas recorrimos la costa atlántica documentando el encuentro entre la niebla invernal y la arquitectura marítima tradicional con cámaras de medio formato.',
      'Cada capítulo de esta crónica explora la relación entre el paisaje oceánico, el oficio artesanal y la contemplación pausada.'
    ],
    pullQuote: 'El océano en invierno despoja al paisaje de todo artificio y deja únicamente lo esencial.',
    category: 'Viajes',
    authorId: 'usr-3',
    coAuthorIds: ['usr-1'],
    publishedAt: 'December 01, 2026',
    readTimeMinutes: 5,
    featuredHero: false,
    akeaSection: 'recent',
    visualPreset: 'breathtaking_cliffs',
    customImageUrl: '/images/kayleen/najla-cam-F71ZHHBYs3w-unsplash-1000x600.jpg',
    galleryImages: ['/images/kayleen/najla-cam-F71ZHHBYs3w-unsplash-1000x600.jpg'],
    tags: ['Viajes', 'Fotografía', 'Naturaleza', 'Ensayo'],
    views: 19,
    likes: 9,
    dislikes: 0,
    shares: 3,
    status: 'scheduled',
    isPremium: true,
    approvalStatus: 'approved',
    publishMode: 'scheduled',
    scheduledPublishAt: '2026-12-01T09:00',
    reviewedBy: 'Jane Smith (Redactora Jefa)',
    reviewedAt: '2026-05-18',
    reviewNotes: 'Aprobado por Redacción. Excelente calidad fotográfica; queda programado para su publicación automática en la fecha indicada.',
  },
];

export const INITIAL_HASHTAGS: HashtagItem[] = [
  {
    id: 'tag-1',
    tag: 'Fotografía',
    slug: 'fotografia',
    description: 'Ensayos visuales, técnica fotográfica, composición y luz natural.',
    color: '#F59E0B',
    featured: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'tag-2',
    tag: 'Moda',
    slug: 'moda',
    description: 'Pasarelas internacionales, sastrería contemporánea y estilo personal.',
    color: '#5960FF',
    featured: true,
    createdAt: '2026-01-12',
  },
  {
    id: 'tag-3',
    tag: 'Viajes',
    slug: 'viajes',
    description: 'Crónicas de expedición, rutas escénicas y destinos culturales.',
    color: '#10B981',
    featured: true,
    createdAt: '2026-01-14',
  },
  {
    id: 'tag-4',
    tag: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Hábitos conscientes, bienestar cotidiano, gastronomía e interiorismo.',
    color: '#FF2C54',
    featured: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'tag-5',
    tag: 'Tendencias',
    slug: 'tendencias',
    description: 'Corrientes estéticas, cultura emergente y dirección creativa.',
    color: '#8B5CF6',
    featured: true,
    createdAt: '2026-01-18',
  },
  {
    id: 'tag-6',
    tag: 'Naturaleza',
    slug: 'naturaleza',
    description: 'Paisajes orgánicos, botánica, ecología y vida al aire libre.',
    color: '#059669',
    featured: true,
    createdAt: '2026-01-20',
  },
  {
    id: 'tag-7',
    tag: 'Tecnología',
    slug: 'tecnologia',
    description: 'Innovación digital, diseño industrial y futuro creativo.',
    color: '#0EA5E9',
    featured: true,
    createdAt: '2026-01-22',
  },
  {
    id: 'tag-8',
    tag: 'Cultura',
    slug: 'cultura',
    description: 'Pensamiento contemporáneo, danza, música, libros y exposiciones.',
    color: '#EC4899',
    featured: true,
    createdAt: '2026-01-25',
  },
  {
    id: 'tag-9',
    tag: 'Editor Pick',
    slug: 'editor-pick',
    description: 'Selección especial curada por la dirección editorial de Kayleen.',
    color: '#171920',
    featured: true,
    createdAt: '2026-02-01',
  },
  {
    id: 'tag-10',
    tag: 'Sunset',
    slug: 'sunset',
    description: 'Fotografía de hora dorada, crepúsculos y horizontes costeros.',
    color: '#EA580C',
    featured: false,
    createdAt: '2026-02-05',
  },
  {
    id: 'tag-11',
    tag: 'Street Style',
    slug: 'street-style',
    description: 'Crónica urbana de estilo en las capitales internacionales de la moda.',
    color: '#6366F1',
    featured: false,
    createdAt: '2026-02-10',
  },
  {
    id: 'tag-12',
    tag: 'Bienestar',
    slug: 'bienestar',
    description: 'Equilibrio mental, descanso creativo y salud integral.',
    color: '#14B8A6',
    featured: false,
    createdAt: '2026-02-12',
  },
];

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
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
      'Cancelación flexible en cualquier momento',
    ],
    badgeColor: '#5960FF',
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
      'Ahorro del 25% respecto a la facturación mensual',
      'Acceso anticipado a reportajes de portada y galerías en alta resolución',
      'Mensajería Privada prioritaria con el consejo editorial y autores',
      'Insignia verificada de Suscriptor Premium en comentarios y comunidad',
    ],
    badgeColor: '#FF2C54',
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
      'Acceso total vitalicio anual a todas las publicaciones y archivos Premium',
      'Canal directo con Dirección Creativa, Administradores y Redactores',
      'Descarga de monografías digitales y catálogos fotográficos en PDF/Alta Res',
      'Invitación a encuentros virtuales y revisiones de portafolio con autores',
      'Mención opcional en el cuadro de honor de Mecenas de Kayleen Magazine',
    ],
    badgeColor: '#171920',
    popular: false,
    active: true,
  },
];

export const INITIAL_MESSAGES: PrivateMessage[] = [
  {
    id: 'msg-1',
    senderId: 'usr-4', // Elena Rostova (Premium Reader)
    recipientId: 'usr-1', // Alice Qelvin (Admin)
    subject: 'Felicitaciones por el reportaje Premium de fotografía arquitectónica',
    body: 'Hola Alice, como suscriptora del Plan Anual quería agradecerles la profundidad del nuevo ensayo visual sobre fotografía contemporánea. ¿Tienen previsto publicar una segunda parte sobre estudios en Lisboa?',
    category: 'editorial',
    read: false,
    createdAt: 'Hace 3 horas',
  },
  {
    id: 'msg-2',
    senderId: 'usr-3', // Paul Newman (Author)
    recipientId: 'usr-2', // Jane Smith (Editor)
    subject: 'Artículo enviado a revisión: Estudios Fotográficos Nórdicos',
    body: 'Hola Jane, acabo de terminar el artículo en el Modo Escritura y lo dejé en estado Pendiente de Aprobación. Incluye notas técnicas de iluminación natural y está marcado como artículo Premium.',
    category: 'colaboracion',
    read: false,
    createdAt: 'Hace 5 horas',
  },
  {
    id: 'msg-3',
    senderId: 'usr-5', // Mateo Alarcón (Moderator)
    recipientId: 'usr-4', // Elena Rostova (Premium Reader)
    subject: 'Bienvenida al canal privado de Suscriptores Premium de Kayleen',
    body: 'Estimada Elena, bienvenida al sistema de mensajería privada de Kayleen Magazine. Desde aquí puedes comunicarte directamente con nuestros escritores, redactores, moderadores y administradores.',
    category: 'soporte_premium',
    read: true,
    createdAt: 'Ayer',
  },
  {
    id: 'msg-4',
    senderId: 'usr-1', // Alice Qelvin (Admin)
    recipientId: 'usr-3', // Paul Newman (Author)
    subject: 'Programación aprobada para Crónicas del Atlántico',
    body: 'Excelente trabajo con las fotografías de acantilados, Paul. Hemos aprobado la pieza junto con Jane y quedó programada para su publicación automática el 1 de diciembre.',
    category: 'editorial',
    read: true,
    createdAt: 'Hace 2 días',
  },
];

export const INITIAL_COMMENTS: BlogComment[] = [
  {
    id: 'cmt-1',
    articleId: 'art-1',
    userId: 'usr-4',
    authorName: 'Elena Rostova',
    authorEmail: 'elena@kayleen-studio.com',
    authorRole: 'reader',
    content: 'Las fotografías de este artículo tienen una luz increíble. El estilo visual de Kayleen Home 03 hace que la lectura sea súper agradable.',
    createdAt: 'Hace 2 días',
    status: 'approved',
  },
  {
    id: 'cmt-2',
    articleId: 'art-7',
    userId: 'usr-2',
    authorName: 'Jane Smith',
    authorEmail: 'jane@kayleen-studio.com',
    authorRole: 'editor',
    content: 'Totalmente de acuerdo. Los proyectos colaborativos locales están cambiando el diseño urbano.',
    createdAt: 'Hace 1 día',
    status: 'approved',
  },
  {
    id: 'cmt-3',
    articleId: 'art-9',
    userId: 'usr-4',
    authorName: 'Elena Rostova',
    authorEmail: 'elena@kayleen-studio.com',
    authorRole: 'reader',
    content: 'Me encanta la selección de fotografía de moda de esta temporada.',
    createdAt: 'Hace 14 horas',
    status: 'approved',
  },
  {
    id: 'cmt-4',
    articleId: 'art-1',
    authorName: 'Marco Valerio',
    authorEmail: 'marco.valerio@estudio.it',
    content: '¿Qué lente utilizaron para la fotografía principal del atardecer? El rango dinámico es espectacular.',
    createdAt: 'Hace 25 minutos',
    status: 'pending',
  },
  {
    id: 'cmt-5',
    articleId: 'art-7',
    authorName: 'Sofía Mendoza',
    authorEmail: 'sofia.mendoza@designlab.es',
    content: 'Excelente artículo de portada. Me gustaría compartirlo en nuestro boletín semanal de diseño.',
    createdAt: 'Hace 10 minutos',
    status: 'pending',
  },
];

export const INITIAL_SITE_CONFIG: SiteConfig = {
  siteTitle: 'Kayleen — Editorial Blog & Magazine',
  siteTagline: 'Discover the most outstanding articles in all topics of life.',
  logoText: 'Kayleen',
  logoDotColor: '#FF2C54',
  logoImageUrl: '',
  useImageLogo: false,
  primaryAccentColor: '#FF2C54',
  secondaryAccentColor: '#5960FF',
  pageBackgroundColor: '#FFFFFF',
  surfaceBackgroundColor: '#f7f8fc',
  footerBackgroundColor: '#f7f8fc',
  editorsPickTitle: "Editor's pick",
  editorsPickSubtitle: 'Discover the most outstanding articles in all topics of life.',
  postsPerPage: 6,
  footerDescription:
    'Plataforma editorial basada 100% en Kayleen Home 03 (Rivax Studio) con fotografías reales, artículos Premium, gestión integral de suscriptores y planes de pago, hashtags administrables, mensajería privada y flujo de aprobación editorial.',
  footerCopyright: '© 2026 Kayleen Editorial, Todos los Derechos Reservados.',
  newsletterHeading: 'Subscribe to our newsletter and stay updated.',
  newsletterPlaceholder: 'Enter your email address...',
  newsletterButtonText: 'Subscribe',
  showNewsletterBox: true,
  contactEmail: 'estudio.nelli@gmail.com',
  promoBannerEnabled: false,
  promoBannerText: 'Edición Especial de Temporada: Suscríbete hoy al boletín semanal de Kayleen.',
  promoBannerCta: 'Suscribirme',
  promoBannerColor: '#171920',
  metaTitle: 'Kayleen Home 03 – Revista Editorial de Fotografía, Moda y Cultura',
  metaDescription:
    'Descubre artículos destacados de fotografía, arquitectura, viajes, tecnología y estilo de vida en Kayleen Magazine con diseño editorial contemporáneo.',
  metaKeywords:
    'blog editorial, revista digital, fotografía, moda, tecnología, viajes, estilo de vida, kayleen magazine',
  metaAuthor: 'Kayleen Editorial Studio',
  ogImage: '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg',
  robotsIndex: true,
  copyrightPageTitle: 'Derechos Reservados y Propiedad Intelectual',
  copyrightPageContent: `© 2026 Kayleen Editorial Studio & Magazine. Todos los derechos reservados.\n\n1. Titularidad de los Contenidos y Fotografías\nTodos los textos, ensayos, crónicas periodísticas, series fotográficas, logotipos, diseño editorial y código fuente publicados en Kayleen Magazine son propiedad intelectual exclusiva de Kayleen Editorial Studio o de sus respectivos autores y coautores acreditados.\n\n2. Uso de Artículos Abiertos y Contenido Premium\nEl acceso a los artículos gratuitos y a las publicaciones exclusivas para suscriptores Premium tiene carácter estrictamente personal e intransferible. Queda prohibida la reproducción total o parcial, redistribución comercial, raspado automatizado de datos (scraping) o publicación en otros medios sin autorización escrita del consejo editorial.\n\n3. Citas y Referencias Académicas o Culturales\nSe permite la cita breve de fragmentos con fines divulgativos, críticos o académicos siempre que se mencione explícitamente a Kayleen Magazine, al autor principal del artículo y se incluya un enlace directo a la publicación original.`,
  refundPolicyTitle: 'Políticas de Devoluciones, Cancelaciones y Reembolsos',
  refundPolicyContent: `En Kayleen Magazine buscamos que cada suscriptor Premium disfrute de una experiencia editorial impecable. A continuación detallamos nuestras políticas transparentes de suscripción, bajas y devoluciones:\n\n1. Garantía de Satisfacción de 14 Días\nSi adquieres por primera vez cualquiera de nuestros planes de pago (Plan Lector Mensual, Plan Editorial Gold Anual o Plan Mecenas VIP) y no estás satisfecho con el contenido exclusivo, puedes solicitar el reembolso íntegro del 100% dentro de los primeros 14 días naturales desde la fecha de alta escribiendo a través de la Mensajería Privada de soporte o a nuestro correo oficial.\n\n2. Cancelación y Baja de Suscripción en Cualquier Momento\nPuedes gestionar la baja o cancelación de la renovación automática en cualquier instante sin penalizaciones ni cargos ocultos. Al solicitar la baja, mantendrás el acceso completo como usuario Premium hasta la fecha exacta de vencimiento de tu ciclo de facturación vigente, pasando posteriormente a cuenta Free de manera automática.\n\n3. Procesamiento de Devoluciones\nUna vez aprobada una devolución dentro del plazo de garantía o por cobro duplicado accidental, el reintegro se procesa al mismo método de pago original en un plazo estimado de 3 a 7 días hábiles.`,
  privacyPolicyTitle: 'Políticas de Privacidad y Protección de Datos',
  privacyPolicyContent: `Kayleen Editorial Studio cumple rigurosamente con las normativas internacionales de protección de datos personales (RGPD / GDPR y legislaciones locales aplicables).\n\n1. Datos que Recopilamos\nRecopilamos únicamente la información necesaria para brindar nuestros servicios editoriales: nombre, dirección de correo electrónico, preferencias de suscripción al boletín (Newsletter), estado de membresía Premium, comentarios enviados a moderación y mensajes privados intercambiados dentro de la plataforma.\n\n2. Uso de la Información y Notificaciones Push\nUtilizamos tus datos exclusivamente para:\n• Gestionar tu cuenta de lector Free o suscriptor Premium y controlar las fechas de alta y vencimiento.\n• Enviar alertas Push en el navegador o boletines por correo únicamente si has otorgado tu consentimiento expreso.\n• Facilitar la comunicación directa mediante el sistema de Mensajería Privada entre usuarios Premium, escritores, moderadores y administradores.\n\n3. Confidencialidad y Derechos ARCO\nJamás vendemos ni cedemos tus datos personales a terceros. Puedes solicitar el acceso, rectificación, portabilidad o eliminación definitiva de tu cuenta y suscriptor en cualquier momento desde tu panel de perfil o contactando a la administración.`,
  termsPageTitle: 'Términos y Condiciones de Uso y Suscripción Premium',
  termsPageContent: `Bienvenido a Kayleen Magazine. El acceso y uso de nuestra plataforma editorial implica la aceptación de los siguientes términos:\n\n1. Niveles de Acceso (Usuarios Free y Usuarios Premium)\nLos lectores con cuenta Free tienen acceso a nuestro catálogo general de artículos abiertos, filtrado por categorías y hashtags, y participación en comentarios sujetos a moderación. Los usuarios con suscripción Premium activa obtienen acceso desbloqueado a todos los reportajes marcados como "Premium", así como al sistema de Mensajería Privada con el equipo editorial.\n\n2. Normas de Comunidad, Comentarios y Mensajería\nTodos los comentarios públicos pasan por revisión previa de la administración y moderación para garantizar un entorno constructivo y respetuoso. El uso del sistema de Mensajería Privada está destinado al diálogo cultural, consultas editoriales y soporte a suscriptores.\n\n3. Flujo Editorial y Publicaciones\nLos artículos redactados por colaboradores pasan por el sistema de aprobación editorial (Redactores, Moderadores y Administradores) antes de su publicación inmediata o programada.`,
};

export const INITIAL_SUBSCRIBER_RECORDS: SubscriberItem[] = [
  {
    id: 'sub-1',
    email: 'estudio.nelli@gmail.com',
    name: 'Estudio Nelli',
    status: 'active',
    source: 'Fundador / VIP',
    tags: ['VIP', 'Editorial', 'Semanal'],
    joinedAt: '2026-01-10',
    pushEnabled: true,
    pushDeviceLabel: 'Chrome · macOS / Desktop',
  },
  {
    id: 'sub-2',
    email: 'elena@kayleen-studio.com',
    name: 'Elena Rostova',
    status: 'active',
    source: 'Footer Kayleen Home 03',
    tags: ['VIP', 'Fotografía'],
    joinedAt: '2026-02-14',
    pushEnabled: true,
    pushDeviceLabel: 'Safari · iOS / iPhone',
  },
  {
    id: 'sub-3',
    email: 'lector@arquitectura.es',
    name: 'Carlos Santamaría',
    status: 'active',
    source: 'Footer Kayleen Home 03',
    tags: ['Semanal', 'Diseño'],
    joinedAt: '2026-03-05',
    pushEnabled: true,
    pushDeviceLabel: 'Chrome · Windows',
  },
  {
    id: 'sub-4',
    email: 'valeria.moda@atelier.fr',
    name: 'Valeria Moreau',
    status: 'active',
    source: 'Campaña Moda',
    tags: ['VIP', 'Moda'],
    joinedAt: '2026-04-19',
    pushEnabled: true,
    pushDeviceLabel: 'Firefox · Desktop',
  },
  {
    id: 'sub-5',
    email: 'david.foto@visuals.io',
    name: 'David Lindqvist',
    status: 'unsubscribed',
    source: 'Importación CSV',
    tags: ['Fotografía'],
    joinedAt: '2026-02-01',
    pushEnabled: false,
    pushDeviceLabel: 'Desactivado',
  },
];

export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'cmp-1',
    name: 'Boletín Semanal #18 — Edición Fotografía & Viajes',
    subject: 'Las mejores crónicas visuales de la semana en Kayleen Magazine',
    segment: 'active',
    featuredArticleId: 'art-1',
    customMessage:
      'Descubre nuestra selección curada de ensayos fotográficos, miradores al atardecer y nuevas colaboraciones editoriales.',
    ctaText: 'Leer Edición Completa',
    ctaUrl: 'https://demo.rivaxstudio.com/kayleen/home-03/',
    status: 'sent',
    scheduledDate: '2026-05-10',
    sentCount: 4,
    openRate: 68.5,
    clickRate: 24.2,
    createdAt: '2026-05-09',
  },
  {
    id: 'cmp-2',
    name: 'Especial Tendencias de Moda & Diseño Urbano',
    subject: 'Nuevo Especial: Street Style, Arquitectura y Cultura Contemporánea',
    segment: 'vip',
    featuredArticleId: 'art-7',
    customMessage:
      'Un adelanto exclusivo para nuestros suscriptores VIP con las entrevistas y galerías de esta temporada.',
    ctaText: 'Explorar Artículos Destacados',
    ctaUrl: 'https://demo.rivaxstudio.com/kayleen/home-03/',
    status: 'scheduled',
    scheduledDate: '2026-05-25',
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    createdAt: '2026-05-15',
  },
];

export const INITIAL_PUSH_NOTIFICATIONS: PushNotificationItem[] = [
  {
    id: 'push-1',
    type: 'new_article',
    title: '📰 Nuevo Artículo en Estilo de Vida: Un Lugar Increíble para Ver el Atardecer',
    body: 'Explora los miradores costeros más serenos donde la arquitectura natural se funde con el horizonte.',
    imageUrl: '/images/kayleen/ben-masora-Oy5IKUo8lZM-unsplash-1000x600.jpg',
    category: 'Estilo de Vida',
    targetArticleId: 'art-1',
    ctaText: 'Leer artículo ahora',
    segment: 'active',
    recipientCount: 4,
    createdAt: 'Hace 2 horas',
  },
  {
    id: 'push-2',
    type: 'new_campaign',
    title: '📣 Campaña Editorial: Boletín Semanal #18 — Edición Fotografía & Viajes',
    body: 'Las mejores crónicas visuales de la semana en Kayleen Magazine ya están disponibles para suscriptores.',
    imageUrl: '/images/kayleen/averie-woodard-111832-unsplash-600x600.jpg',
    category: 'Campaña Newsletter',
    targetArticleId: 'art-1',
    targetCampaignId: 'cmp-1',
    ctaText: 'Ver edición destacada',
    segment: 'active',
    recipientCount: 4,
    createdAt: 'Ayer',
  },
];

export const INITIAL_DATABASE: DatabaseState = {
  users: INITIAL_USERS,
  categories: INITIAL_CATEGORIES,
  hashtags: INITIAL_HASHTAGS,
  subscriptionPlans: INITIAL_SUBSCRIPTION_PLANS,
  messages: INITIAL_MESSAGES,
  articles: INITIAL_ARTICLES,
  comments: INITIAL_COMMENTS,
  subscribers: INITIAL_SUBSCRIBER_RECORDS.filter((s) => s.status === 'active').map(
    (s) => s.email
  ),
  subscriberRecords: INITIAL_SUBSCRIBER_RECORDS,
  campaigns: INITIAL_CAMPAIGNS,
  pushNotifications: INITIAL_PUSH_NOTIFICATIONS,
  siteConfig: INITIAL_SITE_CONFIG,
};



