import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Calendar,
  Flame,
  BookOpen,
  Sun,
  Moon,
  Sparkles,
  Type,
  Maximize2,
  Minimize2,
  ArrowRight,
  Images,
  Users,
  X,
  ThumbsDown,
  Eye,
  Crown,
  Lock,
  Hash,
  SlidersHorizontal,
  AlignLeft,
  AlignJustify,
  RotateCcw,
  Check,
  Share2,
} from 'lucide-react';
import { Article, BlogComment, SubscriptionPlan, User } from '../data/akeaData';
import { EditorialVisual, AuthorAvatar } from './EditorialVisual';
import { SocialShareBar } from './SocialShareBar';

interface ArticleDetailViewProps {
  article: Article;
  author: User;
  allArticles: Article[];
  allUsers: User[];
  comments: BlogComment[];
  currentUser: User | null;
  subscriptionPlans?: SubscriptionPlan[];
  onBack: () => void;
  onSelectArticle: (articleId: string) => void;
  onSelectAuthor: (authorId: string) => void;
  onSelectHashtag?: (tag: string) => void;
  onOpenSubscriptionModal?: () => void;
  onShare: (articleId: string, network: string) => void;
  onLike: (articleId: string) => void;
  onDislike?: (articleId: string) => void;
  onSubmitComment: (payload: {
    articleId: string;
    userId?: string;
    authorName: string;
    authorEmail: string;
    authorRole?: User['role'];
    content: string;
  }) => Promise<BlogComment | null>;
  onApproveComment?: (commentId: string) => void;
  onOpenAdminComments?: () => void;
}

export type ReadingTheme = 'sepia' | 'crema' | 'light' | 'dark' | 'amoled';
export type ReadingFontFamily = 'serif' | 'sans' | 'mono';
export type ReadingLineHeight = 'compact' | 'normal' | 'relaxed';
export type ReadingColumnWidth = 'narrow' | 'normal' | 'wide';

export const FONT_SIZE_STEPS = [15, 17, 19, 22, 26];

export const READING_THEME_CONFIG: Record<
  ReadingTheme,
  {
    name: string;
    bgClass: string;
    textClass: string;
    headingClass: string;
    hudBgClass: string;
    hudBorderClass: string;
    hudTextClass: string;
    surfaceCardClass: string;
    accentDotColor: string;
  }
> = {
  sepia: {
    name: 'Sepia Editorial',
    bgClass: 'bg-[#FBF7F0]',
    textClass: 'text-[#2D241E]',
    headingClass: 'text-[#1C1613]',
    hudBgClass: 'bg-[#FBF7F0]/95 backdrop-blur-md',
    hudBorderClass: 'border-[#E3D6C5]',
    hudTextClass: 'text-[#2D241E]',
    surfaceCardClass: 'bg-[#F2EAE0] border-[#E3D6C5] text-[#2D241E]',
    accentDotColor: '#C84B31',
  },
  crema: {
    name: 'Papel Crema',
    bgClass: 'bg-[#FDFBF7]',
    textClass: 'text-[#332D27]',
    headingClass: 'text-[#1F1A15]',
    hudBgClass: 'bg-[#FDFBF7]/95 backdrop-blur-md',
    hudBorderClass: 'border-[#E8E2D6]',
    hudTextClass: 'text-[#332D27]',
    surfaceCardClass: 'bg-[#F5EFE3] border-[#E8E2D6] text-[#332D27]',
    accentDotColor: '#D97706',
  },
  light: {
    name: 'Blanco Claro',
    bgClass: 'bg-white',
    textClass: 'text-[#1E2530]',
    headingClass: 'text-[#0F172A]',
    hudBgClass: 'bg-white/95 backdrop-blur-md',
    hudBorderClass: 'border-[#E2E8F0]',
    hudTextClass: 'text-[#1E2530]',
    surfaceCardClass: 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E2530]',
    accentDotColor: '#2563EB',
  },
  dark: {
    name: 'Noche Carbón',
    bgClass: 'bg-[#151821]',
    textClass: 'text-[#E2E8F0]',
    headingClass: 'text-[#F8FAFC]',
    hudBgClass: 'bg-[#151821]/95 backdrop-blur-md',
    hudBorderClass: 'border-[#272E3F]',
    hudTextClass: 'text-[#E2E8F0]',
    surfaceCardClass: 'bg-[#1E2230] border-[#2E3547] text-[#E2E8F0]',
    accentDotColor: '#5960FF',
  },
  amoled: {
    name: 'AMOLED Negro',
    bgClass: 'bg-black',
    textClass: 'text-[#D8DEE9]',
    headingClass: 'text-white',
    hudBgClass: 'bg-black/95 backdrop-blur-md',
    hudBorderClass: 'border-[#222228]',
    hudTextClass: 'text-white',
    surfaceCardClass: 'bg-[#121216] border-[#222228] text-[#D8DEE9]',
    accentDotColor: '#FF2C54',
  },
};

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  author,
  allArticles,
  allUsers,
  comments,
  currentUser,
  subscriptionPlans = [],
  onBack,
  onSelectArticle,
  onSelectAuthor,
  onSelectHashtag,
  onOpenSubscriptionModal,
  onShare,
  onLike,
  onDislike,
  onSubmitComment,
  onApproveComment,
  onOpenAdminComments,
}) => {
  const isStaff =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'moderator' ||
    currentUser?.role === 'editor' ||
    currentUser?.role === 'author';
  const hasActivePremium =
    Boolean(currentUser?.isPremium) &&
    currentUser?.subscriptionStatus !== 'expired' &&
    currentUser?.subscriptionStatus !== 'cancelled';
  const canReadFullArticle = !article.isPremium || isStaff || hasActivePremium;

  const renderInlineFormatting = (text: string) => {
    // Regex matching markdown bold, italic, underline, strikethrough, inline code, and links [label](url)
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|~~[^~]+~~|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-inherit">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('__') && part.endsWith('__')) {
        return <u key={i} className="underline decoration-[#FF2C54] underline-offset-4">{part.slice(2, -2)}</u>;
      }
      if (part.startsWith('~~') && part.endsWith('~~')) {
        return <del key={i} className="line-through opacity-75">{part.slice(2, -2)}</del>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[13px] text-[#5960FF]">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (match) {
          return (
            <a
              key={i}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF2C54] hover:text-[#5960FF] underline font-semibold transition-colors"
            >
              {match[1]}
            </a>
          );
        }
      }
      // Render raw HTML tags like <span style="..."> or <mark...> safely if present
      if (part.includes('<span') || part.includes('<mark')) {
        return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  const [commentName, setCommentName] = useState(currentUser?.name || '');
  const [commentEmail, setCommentEmail] = useState(currentUser?.email || '');
  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmittedComment, setLastSubmittedComment] = useState<BlogComment | null>(null);
  const [formError, setFormError] = useState('');

  // Immersive Reading Mode ("Modo Lectura") State & Typography Customization
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('sepia');
  const [readingFontSize, setReadingFontSize] = useState<number>(19); // Default 19px
  const [readingFontFamily, setReadingFontFamily] = useState<ReadingFontFamily>('serif');
  const [readingLineHeight, setReadingLineHeight] = useState<ReadingLineHeight>('normal');
  const [readingWidth, setReadingWidth] = useState<ReadingColumnWidth>('normal');
  const [readingAlign, setReadingAlign] = useState<'left' | 'justify'>('left');
  const [readingShowCover, setReadingShowCover] = useState(true);
  const [readingDropCap, setReadingDropCap] = useState(true);
  const [isTypographyMenuOpen, setIsTypographyMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const readingContainerRef = useRef<HTMLDivElement | null>(null);

  // Lightbox for article gallery images
  const [selectedLightboxImg, setSelectedLightboxImg] = useState<string | null>(null);

  // Collaborating co-authors
  const coAuthors: User[] = (article.coAuthorIds || [])
    .map((id) => allUsers.find((u) => u.id === id))
    .filter((u): u is User => Boolean(u && u.id !== author.id));

  // Gallery images attached to the article
  const galleryImages: string[] = Array.isArray(article.galleryImages)
    ? article.galleryImages.filter(Boolean)
    : [];

  // Track standard window scroll when outside Reading Mode
  useEffect(() => {
    const handleScroll = () => {
      if (isReadingMode) return;
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article.id, isReadingMode]);

  // Handle Reading Mode Container Scroll
  const handleReadingScroll = () => {
    if (!readingContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = readingContainerRef.current;
    const diff = scrollHeight - clientHeight;
    if (diff > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollTop / diff) * 100)));
    }
  };

  // Keyboard shortcut (Escape exits Reading Mode or closes popover) + Fullscreen tracker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isTypographyMenuOpen) {
          setIsTypographyMenuOpen(false);
        } else if (isReadingMode) {
          setIsReadingMode(false);
        }
      }
    };
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, [isReadingMode, isTypographyMenuOpen]);

  // Lock background body scroll when Reading Mode is active
  useEffect(() => {
    if (isReadingMode) {
      document.body.style.overflow = 'hidden';
      if (readingContainerRef.current) {
        readingContainerRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = '';
      setIsTypographyMenuOpen(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isReadingMode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Reset last submitted comment notice when switching articles
  useEffect(() => {
    setLastSubmittedComment(null);
    setSelectedLightboxImg(null);
  }, [article.id]);

  // Only approved comments are shown publicly
  const approvedComments = comments.filter(
    (c) => c.articleId === article.id && c.status === 'approved'
  );

  const pendingForThisArticle = comments.filter(
    (c) => c.articleId === article.id && c.status === 'pending'
  );

  // Strict same-category Related Articles excluding the current article being read
  const relatedCategoryArticles = allArticles.filter(
    (a) =>
      a.id !== article.id &&
      a.status === 'published' &&
      a.category === article.category
  );

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const finalName = (currentUser ? currentUser.name : commentName).trim();
    const finalEmail = (currentUser ? currentUser.email : commentEmail).trim();
    const finalContent = commentBody.trim();

    if (!finalName || !finalEmail || !finalContent) {
      setFormError('Por favor completa tu nombre, correo electrónico y comentario.');
      return;
    }

    setSubmitting(true);
    const created = await onSubmitComment({
      articleId: article.id,
      userId: currentUser?.id,
      authorName: finalName,
      authorEmail: finalEmail,
      authorRole: currentUser?.role || 'reader',
      content: finalContent,
    });
    setSubmitting(false);

    if (created) {
      setLastSubmittedComment(created);
      setCommentBody('');
    }
  };

  const currentTheme = READING_THEME_CONFIG[readingTheme];

  const estimatedMinutesRemaining = Math.max(
    1,
    Math.round((article.readTimeMinutes || 4) * (1 - scrollProgress / 100))
  );

  // Dynamic classes for Standard View
  const headingThemeColor = 'text-[#171920]';
  const proseThemeClasses = 'text-[16px] text-[#4b546e] leading-[1.85]';
  const surfaceCardClasses = 'bg-[#f7f8fc] border-[#dcdfe7] text-[#4b546e]';

  // Core Article Content Renderer (Shared between Standard View and Immersive Reading Mode)
  const renderArticleBody = (isImmersive: boolean) => {
    const headingColor = isImmersive ? currentTheme.headingClass : headingThemeColor;
    const cardClass = isImmersive ? currentTheme.surfaceCardClass : surfaceCardClasses;

    return (
      <div
        className={
          isImmersive
            ? `space-y-6 ${
                readingFontFamily === 'serif'
                  ? 'font-serif'
                  : readingFontFamily === 'mono'
                  ? 'font-mono'
                  : 'font-sans'
              } ${
                readingLineHeight === 'compact'
                  ? 'leading-[1.65]'
                  : readingLineHeight === 'relaxed'
                  ? 'leading-[2.25]'
                  : 'leading-[1.95]'
              } ${readingAlign === 'justify' ? 'text-justify hyphens-auto' : 'text-left'}`
            : `max-w-[68ch] space-y-6 ${proseThemeClasses}`
        }
        style={isImmersive ? { fontSize: `${readingFontSize}px` } : undefined}
      >
        {(canReadFullArticle ? article.content : article.content.slice(0, 1)).map(
          (paragraph, index) => {
            const trimmed = paragraph.trim();
            // H4
            if (trimmed.startsWith('#### ')) {
              return (
                <h4
                  key={index}
                  className={`text-base sm:text-lg font-bold mt-5 mb-2 ${headingColor}`}
                >
                  {renderInlineFormatting(trimmed.slice(5))}
                </h4>
              );
            }
            // H3
            if (trimmed.startsWith('### ')) {
              return (
                <h3
                  key={index}
                  className={`text-lg sm:text-xl font-bold mt-6 mb-2 ${headingColor}`}
                >
                  {renderInlineFormatting(trimmed.slice(4))}
                </h3>
              );
            }
            // H2
            if (trimmed.startsWith('## ')) {
              return (
                <h2
                  key={index}
                  className={`text-xl sm:text-2xl font-bold mt-8 mb-3 ${headingColor}`}
                >
                  {renderInlineFormatting(trimmed.slice(3))}
                </h2>
              );
            }
            // H1
            if (trimmed.startsWith('# ')) {
              return (
                <h2
                  key={index}
                  className={`text-2xl sm:text-3xl font-bold mt-8 mb-3 ${headingColor}`}
                >
                  {renderInlineFormatting(trimmed.slice(2))}
                </h2>
              );
            }
            // Pullquote block
            if (trimmed.startsWith('[PULLQUOTE:')) {
              const clean = trimmed.slice(11, -1).trim();
              return (
                <div
                  key={index}
                  className="my-8 py-6 px-8 text-center border-y-2 border-black/15 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.03] rounded-[8px]"
                >
                  <p className="text-xl sm:text-2xl font-serif italic font-bold tracking-tight leading-snug">
                    {renderInlineFormatting(clean)}
                  </p>
                </div>
              );
            }
            // Callout Box
            if (trimmed.startsWith('[CALLOUT:')) {
              const inner = trimmed.slice(9, -1).trim();
              const colonIdx = inner.indexOf(':');
              const cType =
                colonIdx !== -1 ? inner.slice(0, colonIdx).trim().toUpperCase() : 'INFO';
              const cText = colonIdx !== -1 ? inner.slice(colonIdx + 1).trim() : inner;
              const borderColor =
                cType === 'TIP'
                  ? 'border-emerald-500'
                  : cType === 'WARNING'
                  ? 'border-amber-500'
                  : cType === 'QUOTE'
                  ? 'border-[#FF2C54]'
                  : 'border-[#5960FF]';
              return (
                <div
                  key={index}
                  className={`p-5 rounded-[12px] border-l-4 my-6 text-sm leading-relaxed ${borderColor} ${cardClass}`}
                >
                  <strong className="block text-xs uppercase tracking-wider font-bold mb-1 opacity-80">
                    {cType === 'TIP'
                      ? 'Consejo Práctico'
                      : cType === 'WARNING'
                      ? 'Advertencia Editorial'
                      : cType === 'QUOTE'
                      ? 'Reflexión'
                      : 'Nota Editorial'}
                  </strong>
                  {renderInlineFormatting(cText)}
                </div>
              );
            }
            // Legacy [NOTA:]
            if (trimmed.startsWith('[NOTA:') && trimmed.endsWith(']')) {
              return (
                <div
                  key={index}
                  className={`p-5 rounded-[12px] border-l-4 border-[#5960FF] text-sm leading-relaxed my-6 ${cardClass}`}
                >
                  <strong className="block text-xs uppercase tracking-wider text-[#5960FF] mb-1">
                    Nota Editorial
                  </strong>
                  {renderInlineFormatting(trimmed.slice(6, -1).trim())}
                </div>
              );
            }
            // Blockquote
            if (trimmed.startsWith('> ')) {
              return (
                <blockquote
                  key={index}
                  className="pl-5 border-l-4 border-[#FF2C54] italic font-medium my-5 opacity-90 text-lg leading-relaxed"
                >
                  {renderInlineFormatting(trimmed.slice(2))}
                </blockquote>
              );
            }
            // Horizontal rule / divider
            if (trimmed === '---' || trimmed === '***') {
              return (
                <hr
                  key={index}
                  className="my-8 border-t-2 border-black/10 dark:border-white/10"
                />
              );
            }
            // Markdown Table
            if (trimmed.includes('|') && trimmed.includes('\n')) {
              const lines = trimmed.split('\n').filter((l) => l.trim().startsWith('|'));
              if (lines.length >= 2) {
                const headerCells = lines[0]
                  .split('|')
                  .map((c) => c.trim())
                  .filter(Boolean);
                const bodyRows = lines
                  .slice(2)
                  .map((l) => l.split('|').map((c) => c.trim()).filter(Boolean));
                return (
                  <div
                    key={index}
                    className="my-6 overflow-x-auto rounded-[10px] border border-black/10 dark:border-white/10"
                  >
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-black/5 dark:bg-white/10 border-b border-black/10 dark:border-white/10 font-bold text-xs uppercase tracking-wider">
                          {headerCells.map((h, hi) => (
                            <th key={hi} className="py-2.5 px-4">
                              {renderInlineFormatting(h)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10 dark:divide-white/10 text-xs">
                        {bodyRows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-black/[0.02]">
                            {row.map((cell, ci) => (
                              <td key={ci} className="py-2.5 px-4">
                                {renderInlineFormatting(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
            }
            // Inline Image ![caption](url)
            if (trimmed.startsWith('![') && trimmed.includes('](')) {
              const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
              if (match) {
                return (
                  <figure key={index} className="my-7">
                    <img
                      src={match[2]}
                      alt={match[1]}
                      onClick={() => setSelectedLightboxImg(match[2])}
                      className="w-full rounded-[12px] object-cover max-h-[460px] cursor-zoom-in border border-black/10 dark:border-white/10"
                    />
                    {match[1] && (
                      <figcaption className="text-center text-xs opacity-75 mt-2 italic">
                        {match[1]}
                      </figcaption>
                    )}
                  </figure>
                );
              }
            }
            // Numbered list
            if (/^\d+\.\s/.test(trimmed)) {
              const items = trimmed
                .split('\n')
                .map((line) => line.replace(/^\d+\.\s*/, '').trim())
                .filter(Boolean);
              return (
                <ol key={index} className="list-decimal pl-6 space-y-2 my-4">
                  {items.map((it, liIdx) => (
                    <li key={liIdx}>{renderInlineFormatting(it)}</li>
                  ))}
                </ol>
              );
            }
            // Bullet list
            if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
              const items = trimmed
                .split('\n')
                .map((line) => line.replace(/^[-•]\s*/, '').trim())
                .filter(Boolean);
              return (
                <ul key={index} className="list-disc pl-6 space-y-2 my-4">
                  {items.map((it, liIdx) => (
                    <li key={liIdx}>{renderInlineFormatting(it)}</li>
                  ))}
                </ul>
              );
            }
            // Standard paragraph with optional Drop Cap
            const isFirst = index === 0;
            const dropCapClass =
              isImmersive && isFirst && readingDropCap
                ? 'first-letter:float-left first-letter:text-5xl first-letter:font-bold first-letter:leading-none first-letter:mr-3.5 first-letter:pt-1 first-letter:text-[var(--color-primary)]'
                : '';

            return (
              <p key={index} className={dropCapClass}>
                {renderInlineFormatting(paragraph)}
              </p>
            );
          }
        )}

        {/* PAYWALL FOR PREMIUM ARTICLES WHEN USER IS NOT PREMIUM */}
        {!canReadFullArticle && (
          <div className="my-10 rounded-[18px] border-2 border-amber-400/80 bg-gradient-to-br from-[#FFFBEB] via-white to-[#FEF3C7] p-7 sm:p-9 shadow-lg text-[#171920]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" />
                Contenido Exclusivo Kayleen Premium
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                <Lock className="w-3.5 h-3.5" />
                Suscripción de pago requerida
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[#171920] mb-2">
              Continúa leyendo este reportaje a fondo con una suscripción Premium
            </h3>
            <p className="text-sm text-[#595F71] leading-relaxed mb-6">
              Este artículo forma parte de nuestra colección exclusiva para suscriptores de pago. Desbloquea al instante todos los ensayos profundos, monografías descargables, modo lectura de archivo y mensajería privada directa con nuestros escritores y editores.
            </p>

            {subscriptionPlans.filter((p) => p.active).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {subscriptionPlans
                  .filter((p) => p.active)
                  .slice(0, 3)
                  .map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-[12px] border bg-white ${
                        plan.highlighted
                          ? 'border-amber-500 ring-2 ring-amber-400/40'
                          : 'border-[#dcdfe7]'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                        {plan.badge}
                      </span>
                      <div className="font-bold text-sm text-[#171920] mb-1">
                        {plan.name}
                      </div>
                      <div className="text-lg font-extrabold text-[#FF2C54] tabular-nums">
                        ${plan.price.toFixed(2)}{' '}
                        <span className="text-[11px] font-normal text-[#595F71]">
                          USD / {plan.billingCycle === 'monthly' ? 'mes' : 'año'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenSubscriptionModal && onOpenSubscriptionModal()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Ver Planes Premium y Suscribirme Ahora</span>
              </button>
              <span className="text-xs text-[#595F71]">
                Cancela o cambia tu plan en cualquier momento desde tu cuenta.
              </span>
            </div>
          </div>
        )}

        {/* Kayleen Pull Quote */}
        {canReadFullArticle && article.pullQuote && (
          <blockquote className={`my-10 p-8 rounded-[15px] border text-center ${cardClass}`}>
            <p className={`text-xl sm:text-2xl font-semibold leading-relaxed mb-3 ${headingColor}`}>
              “{article.pullQuote}”
            </p>
            <footer className="text-xs uppercase tracking-wider opacity-75 font-medium">
              — {author.name}
              {coAuthors.length > 0
                ? ` & ${coAuthors.map((c) => c.name).join(', ')}`
                : ` · ${author.specialty}`}
            </footer>
          </blockquote>
        )}
      </div>
    );
  };

  // =========================================================================
  // BRANCH 1: IMMERSIVE READING MODE (NO SIDEBARS, NO NAVIGATIONS, TOTAL FOCUS)
  // =========================================================================
  if (isReadingMode) {
    return (
      <div
        ref={readingContainerRef}
        onScroll={handleReadingScroll}
        className={`fixed inset-0 z-50 overflow-y-auto flex flex-col ${currentTheme.bgClass} ${currentTheme.textClass} transition-colors duration-300`}
      >
        {/* Top Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-black/10 dark:bg-white/10 pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Sticky Minimalist Reading HUD */}
        <header
          className={`sticky top-0 z-40 px-5 sm:px-8 py-3 border-b ${currentTheme.hudBgClass} ${currentTheme.hudBorderClass} ${currentTheme.hudTextClass} flex items-center justify-between gap-4 shadow-xs`}
        >
          {/* Left: Exit button & Article identity */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsReadingMode(false)}
              className="px-3.5 py-1.5 rounded-[8px] bg-black/5 dark:bg-white/10 hover:bg-[#FF2C54] hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Salir de Modo Lectura y volver al sitio completo (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Salir de Modo Lectura</span>
              <kbd className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 opacity-75">
                Esc
              </kbd>
            </button>

            <span className="h-4 w-px bg-black/10 dark:bg-white/10" aria-hidden="true" />

            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FF2C54]/15 text-[#FF2C54] shrink-0">
              {article.category}
            </span>

            <span className="text-xs font-semibold truncate hidden md:inline-block opacity-85">
              {article.title}
            </span>
          </div>

          {/* Center: Estimated Reading Time Remaining & Progress */}
          <div className="hidden lg:flex items-center gap-2 text-xs opacity-80 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-[#5960FF]" />
            <span>~{estimatedMinutesRemaining} min restantes</span>
            <span>·</span>
            <span>{Math.round(scrollProgress)}% leído</span>
          </div>

          {/* Right: Typography Popover Trigger & Fullscreen Toggle */}
          <div className="flex items-center gap-2 shrink-0 relative">
            <button
              type="button"
              onClick={() => setIsTypographyMenuOpen((prev) => !prev)}
              className={`px-3 py-1.5 rounded-[8px] border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                isTypographyMenuOpen
                  ? 'bg-[#171920] text-white border-[#171920]'
                  : 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/10 hover:border-[#5960FF]'
              }`}
              title="Ajustar Tipografía, Tamaño y Tema"
            >
              <Type className="w-3.5 h-3.5 text-[#FF2C54]" />
              <span>Tipografía</span>
              <span className="text-[10px] opacity-80 font-mono">({readingFontSize}px)</span>
              <SlidersHorizontal className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-[8px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition-colors cursor-pointer"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsReadingMode(false)}
              className="p-2 rounded-[8px] hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
              title="Cerrar Modo Lectura (Esc)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Typography & Customization Floating Popover */}
            {isTypographyMenuOpen && (
              <div
                className={`absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] p-5 rounded-[15px] border shadow-2xl z-50 space-y-4 ${
                  readingTheme === 'dark'
                    ? 'bg-[#1B1E2B] border-[#2E3547] text-[#E2E8F0]'
                    : readingTheme === 'amoled'
                    ? 'bg-[#121216] border-[#222228] text-white'
                    : 'bg-white border-[#dcdfe7] text-[#171920]'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-[#FF2C54]" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Ajustes de Tipografía &amp; Lectura
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTypographyMenuOpen(false)}
                    className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1. Font Size Control */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Tamaño de Letra</span>
                    <span className="font-mono text-[#5960FF] font-bold">
                      {readingFontSize}px
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const idx = FONT_SIZE_STEPS.indexOf(readingFontSize);
                        if (idx > 0) setReadingFontSize(FONT_SIZE_STEPS[idx - 1]);
                        else if (readingFontSize > FONT_SIZE_STEPS[0])
                          setReadingFontSize(readingFontSize - 1);
                      }}
                      className="px-2.5 py-1.5 rounded-[7px] text-xs font-bold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                      title="Reducir tamaño"
                    >
                      A-
                    </button>
                    <div className="flex-1 grid grid-cols-5 gap-1">
                      {FONT_SIZE_STEPS.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setReadingFontSize(sz)}
                          className={`py-1 text-[11px] font-semibold rounded-[6px] transition-colors cursor-pointer ${
                            readingFontSize === sz
                              ? 'bg-[#FF2C54] text-white'
                              : 'bg-black/5 dark:bg-white/10 hover:bg-black/10'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const idx = FONT_SIZE_STEPS.indexOf(readingFontSize);
                        if (idx !== -1 && idx < FONT_SIZE_STEPS.length - 1)
                          setReadingFontSize(FONT_SIZE_STEPS[idx + 1]);
                        else if (readingFontSize < FONT_SIZE_STEPS[FONT_SIZE_STEPS.length - 1])
                          setReadingFontSize(readingFontSize + 1);
                      }}
                      className="px-2.5 py-1.5 rounded-[7px] text-xs font-bold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                      title="Aumentar tamaño"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* 2. Font Family */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold">Familia Tipográfica</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'serif', label: 'Serif Novela', fontClass: 'font-serif' },
                        { id: 'sans', label: 'Sans Moderno', fontClass: 'font-sans' },
                        { id: 'mono', label: 'Mono Enfoque', fontClass: 'font-mono' },
                      ] as const
                    ).map((ff) => (
                      <button
                        key={ff.id}
                        type="button"
                        onClick={() => setReadingFontFamily(ff.id)}
                        className={`py-1.5 px-2 rounded-[7px] text-xs font-medium border text-center transition-colors cursor-pointer ${ff.fontClass} ${
                          readingFontFamily === ff.id
                            ? 'bg-[#171920] text-white border-[#171920]'
                            : 'bg-black/5 dark:bg-white/10 border-transparent hover:border-black/20'
                        }`}
                      >
                        {ff.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Theme Ambience */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold">Ambiente de Color</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(
                      [
                        { id: 'sepia', label: 'Sepia', bg: '#FBF7F0', border: '#E3D6C5' },
                        { id: 'crema', label: 'Crema', bg: '#FDFBF7', border: '#E8E2D6' },
                        { id: 'light', label: 'Claro', bg: '#FFFFFF', border: '#E2E8F0' },
                        { id: 'dark', label: 'Noche', bg: '#151821', border: '#2E3547' },
                        { id: 'amoled', label: 'Negro', bg: '#000000', border: '#222228' },
                      ] as const
                    ).map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => setReadingTheme(th.id)}
                        className={`py-2 px-1 rounded-[8px] text-[10px] font-bold border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          readingTheme === th.id
                            ? 'ring-2 ring-[#FF2C54] scale-105 shadow-xs'
                            : 'opacity-85 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: th.bg, borderColor: th.border }}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border border-black/20 ${
                            th.id === 'dark' || th.id === 'amoled'
                              ? 'bg-white'
                              : 'bg-[#FF2C54]'
                          }`}
                        />
                        <span
                          className={
                            th.id === 'dark' || th.id === 'amoled'
                              ? 'text-white'
                              : 'text-[#171920]'
                          }
                        >
                          {th.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Column Width & Line Height */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <span className="block text-[11px] font-semibold">Ancho de Columna</span>
                    <div className="grid grid-cols-3 gap-1">
                      {(
                        [
                          { id: 'narrow', label: '580' },
                          { id: 'normal', label: '680' },
                          { id: 'wide', label: '780' },
                        ] as const
                      ).map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setReadingWidth(w.id)}
                          className={`py-1 text-[11px] font-semibold rounded-[6px] border cursor-pointer ${
                            readingWidth === w.id
                              ? 'bg-[#5960FF] text-white border-[#5960FF]'
                              : 'bg-black/5 dark:bg-white/10 border-transparent'
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[11px] font-semibold">Interlineado</span>
                    <div className="grid grid-cols-3 gap-1">
                      {(
                        [
                          { id: 'compact', label: '1.6' },
                          { id: 'normal', label: '1.9' },
                          { id: 'relaxed', label: '2.2' },
                        ] as const
                      ).map((lh) => (
                        <button
                          key={lh.id}
                          type="button"
                          onClick={() => setReadingLineHeight(lh.id)}
                          className={`py-1 text-[11px] font-semibold rounded-[6px] border cursor-pointer ${
                            readingLineHeight === lh.id
                              ? 'bg-[#5960FF] text-white border-[#5960FF]'
                              : 'bg-black/5 dark:bg-white/10 border-transparent'
                          }`}
                        >
                          {lh.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Toggles: Drop Cap & Alignment */}
                <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={readingDropCap}
                      onChange={(e) => setReadingDropCap(e.target.checked)}
                      className="accent-[#FF2C54]"
                    />
                    <span>Letra Capital</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={readingShowCover}
                      onChange={(e) => setReadingShowCover(e.target.checked)}
                      className="accent-[#FF2C54]"
                    />
                    <span>Mostrar Portada</span>
                  </label>

                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setReadingAlign('left')}
                      className={`p-1.5 rounded-[5px] cursor-pointer ${
                        readingAlign === 'left'
                          ? 'bg-[#171920] text-white'
                          : 'hover:bg-black/10'
                      }`}
                      title="Alinear a la izquierda"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setReadingAlign('justify')}
                      className={`p-1.5 rounded-[5px] cursor-pointer ${
                        readingAlign === 'justify'
                          ? 'bg-[#171920] text-white'
                          : 'hover:bg-black/10'
                      }`}
                      title="Justificar texto"
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Immersive Reading Canvas (Centered Column with Adjustable Typography) */}
        <main
          className={`flex-1 w-full mx-auto px-6 sm:px-8 py-10 sm:py-14 ${
            readingWidth === 'narrow'
              ? 'max-w-xl'
              : readingWidth === 'wide'
              ? 'max-w-3xl'
              : 'max-w-2xl'
          }`}
        >
          {/* Optional Hero Image for Pure Text or Visual Mode */}
          {readingShowCover && (
            <div className="mb-10 rounded-[15px] overflow-hidden shadow-lg h-64 sm:h-96 relative">
              <EditorialVisual
                preset={article.visualPreset}
                customImageUrl={article.customImageUrl || galleryImages[0]}
                alt={article.title}
                aspectRatio="fill"
                className="w-full h-full"
              />
              <div className="absolute top-4 right-4 bg-black/60 text-white text-[11px] px-3 py-1 rounded-full backdrop-blur-xs">
                {article.readTimeMinutes} min lectura
              </div>
            </div>
          )}

          {/* Article Header Lockup */}
          <header className="mb-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF2C54]/15 text-[#FF2C54]">
                {article.category}
              </span>
              <span>·</span>
              <span className="opacity-75">{article.publishedAt}</span>
              <span>·</span>
              <span className="opacity-75">{article.views.toLocaleString('es-ES')} vistas</span>
            </div>

            <h1
              className={`text-2xl sm:text-4xl lg:text-[40px] font-bold leading-[1.3] tracking-tight ${currentTheme.headingClass} ${
                readingFontFamily === 'serif' ? 'font-serif' : 'font-sans'
              }`}
            >
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-lg sm:text-xl font-medium opacity-90 leading-relaxed pt-1">
                {article.subtitle}
              </p>
            )}

            <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center gap-3">
              <AuthorAvatar user={author} size="md" />
              <div>
                <p className="text-xs font-bold">{author.name}</p>
                <p className="text-[11px] opacity-75">{author.specialty}</p>
              </div>
            </div>
          </header>

          {/* Prose Content with Configured Typography */}
          <div className="mb-14">{renderArticleBody(true)}</div>

          {/* Reading Completed Footer */}
          <footer
            className={`pt-8 border-t border-black/15 dark:border-white/15 space-y-6 ${currentTheme.hudTextClass}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold">Has finalizado la lectura</h4>
                <p className="text-xs opacity-75">
                  Esperamos que hayas disfrutado este artículo en Modo Lectura.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onLike(article.id)}
                  className="px-4 py-2 rounded-[8px] bg-black/5 dark:bg-white/10 hover:bg-[#FF2C54] hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-[#FF2C54]" />
                  <span>Me gusta ({article.likes})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReadingMode(false)}
                  className="px-4 py-2 rounded-[8px] bg-[#171920] text-white hover:bg-[#FF2C54] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Salir de Modo Lectura</span>
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    );
  }

  // =========================================================================
  // BRANCH 2: STANDARD VIEW (KAYLEEN EDITORIAL WITH SIDEBAR & COMMENTS)
  // =========================================================================
  return (
    <div className="bg-white text-[#4b546e] transition-colors duration-300 relative">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#FF2C54] to-[#5960FF] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Reading Mode Quick-Access Button (Bottom-Right Corner) */}
      <button
        type="button"
        onClick={() => setIsReadingMode(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-[#171920] hover:bg-[#FF2C54] text-white text-xs font-bold shadow-2xl border border-white/20 transition-all transform hover:scale-105 inline-flex items-center gap-2 cursor-pointer group"
        title="Activar Modo Lectura Inmersivo (Oculta barras de navegación y laterales)"
      >
        <BookOpen className="w-4 h-4 text-[#FF2C54] group-hover:text-white" />
        <span>Modo Lectura</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
      </button>

      {/* Image Lightbox Modal */}
      {selectedLightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setSelectedLightboxImg(null)}
        >
          <div
            className="relative max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedLightboxImg(null)}
              className="mb-3 self-end px-3 py-1.5 rounded-[8px] bg-white/15 hover:bg-[#FF2C54] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cerrar vista previa</span>
            </button>
            <img
              src={selectedLightboxImg}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="max-h-[82vh] w-auto object-contain rounded-[15px] shadow-2xl"
            />
          </div>
        </div>
      )}

      <article className="max-w-[1240px] mx-auto px-5 sm:px-6 py-10">
        {/* Top Breadcrumb + Reading Mode Trigger Button */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#dcdfe7] pb-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#4b546e] hover:text-[#FF2C54] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Kayleen Home 03</span>
          </button>

          {/* Right Toolbar: Reading Mode Trigger Button & Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsReadingMode(true)}
              className="px-4 py-2 rounded-[8px] text-xs font-bold text-white bg-[#FF2C54] hover:bg-[#e02247] shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              title="Activar Modo Lectura Inmersivo (elimina barras de navegación y laterales con tipografía ajustable)"
            >
              <BookOpen className="w-4 h-4" />
              <span>Modo Lectura Inmersivo</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs opacity-75 tabular-nums">
              <Flame className="w-3.5 h-3.5 text-[#FF2C54]" />
              <span>{article.views.toLocaleString('es-ES')} vistas</span>
              <span aria-hidden="true">·</span>
              <span>{Math.round(scrollProgress)}% leído</span>
            </div>
          </div>
        </div>

        {/* Kayleen Single Post Hero Image + Overlay Title Box */}
        <div className="kayleen-modern-image-wrapper mb-10 relative h-[360px] sm:h-[480px]">
          <EditorialVisual
            preset={article.visualPreset}
            customImageUrl={article.customImageUrl || galleryImages[0]}
            alt={article.title}
            aspectRatio="fill"
            zoomOnHover={false}
            className="w-full h-full"
          />

          {/* Top-left Premium Badge if article is Premium */}
          {article.isPremium && (
            <div className="absolute top-5 left-5 z-10 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
              <Crown className="w-3.5 h-3.5" />
              <span>Exclusivo Suscriptores Premium</span>
            </div>
          )}

          {/* Top-right Kayleen metrics overlay */}
          <div className="absolute top-5 right-5 z-10 flex items-center gap-3 bg-black/55 backdrop-blur-xs text-white px-3.5 py-1.5 rounded-full text-xs tabular-nums">
            <span>{approvedComments.length} coment.</span>
            <span aria-hidden="true">·</span>
            <span>{article.views} vistas</span>
            <span aria-hidden="true">·</span>
            <span>{article.readTimeMinutes} min</span>
          </div>

          {/* Bottom-left Kayleen Signature White Highlighted Title */}
          <div className="absolute bottom-6 left-6 right-6 sm:right-24 z-10">
            <h1 className="text-xl sm:text-3xl lg:text-[34px] font-bold leading-[1.65]">
              <span className="kayleen-box-title">{article.title}</span>
            </h1>
          </div>
        </div>

        {/* 2-Column Grid with Main Prose & Sticky Right Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Editorial Prose */}
          <div className="lg:col-span-8">
            {/* Kayleen Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-6 pb-5 border-b border-[#dcdfe7] text-[#595F71]">
              <div className="flex flex-wrap items-center gap-2.5">
                {article.isPremium && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] uppercase tracking-wider">
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    Premium
                  </span>
                )}
                <span className="text-[#FF2C54] font-semibold">{article.category}</span>
                <span aria-hidden="true">·</span>
                <div className="inline-flex flex-wrap items-center gap-1.5">
                  <span>by</span>
                  <button
                    type="button"
                    onClick={() => onSelectAuthor(author.id)}
                    className="font-semibold text-[#171920] hover:text-[#FF2C54] transition-colors cursor-pointer"
                  >
                    {author.name}
                  </button>
                  {coAuthors.length > 0 && (
                    <span className="inline-flex flex-wrap items-center gap-1">
                      <span className="text-[#5960FF] font-medium">&amp; colab.</span>
                      {coAuthors.map((co, idx) => (
                        <React.Fragment key={co.id}>
                          {idx > 0 && <span>,</span>}
                          <button
                            type="button"
                            onClick={() => onSelectAuthor(co.id)}
                            className="font-semibold text-[#171920] hover:text-[#FF2C54] transition-colors cursor-pointer"
                          >
                            {co.name}
                          </button>
                        </React.Fragment>
                      ))}
                    </span>
                  )}
                </div>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#FF2C54]" />
                  {article.publishedAt}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {approvedComments.length === 0
                    ? 'No Comment'
                    : `${approvedComments.length} Comment(s)`}
                </span>
              </div>
            </div>

            {article.subtitle && (
              <p className="text-lg sm:text-xl font-medium leading-relaxed mb-7 text-[#171920]">
                {article.subtitle}
              </p>
            )}

            {/* Standard Prose Rendering */}
            <div className="mb-10">{renderArticleBody(false)}</div>

            {/* ================================================================= */}
            {/* MULTI-IMAGE EDITORIAL GALLERY (Uploaded from PC or via Links)     */}
            {/* ================================================================= */}
            {canReadFullArticle && galleryImages.length > 0 && (
              <section
                className={`my-10 p-6 rounded-[15px] border ${surfaceCardClasses}`}
              >
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Images className="w-4 h-4 text-[#FF2C54]" />
                    <h3 className={`text-base font-bold ${headingThemeColor}`}>
                      Galería Fotográfica del Artículo ({galleryImages.length})
                    </h3>
                  </div>
                  <span className="text-xs opacity-75">
                    Haz clic en cualquier imagen para ampliar
                  </span>
                </div>

                <div
                  className={`grid gap-4 ${
                    galleryImages.length === 1
                      ? 'grid-cols-1'
                      : galleryImages.length === 2
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                  }`}
                >
                  {galleryImages.map((imgUrl, index) => (
                    <div
                      key={`${imgUrl.slice(0, 32)}-${index}`}
                      onClick={() => setSelectedLightboxImg(imgUrl)}
                      className="group relative rounded-[12px] overflow-hidden border border-[#dcdfe7] bg-white h-52 cursor-pointer shadow-xs"
                    >
                      <img
                        src={imgUrl}
                        alt={`${article.title} - Imagen ${index + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded-full tabular-nums">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Clickable Hashtags + Like & Dislike Actions */}
            <div
              className={`mt-10 pt-6 border-t flex flex-wrap items-center justify-between gap-4 ${
                isReadingMode && readingTheme === 'dark'
                  ? 'border-[#2D3246]'
                  : isReadingMode && readingTheme === 'sepia'
                  ? 'border-[#E2D7C5]'
                  : 'border-[#dcdfe7]'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex items-center gap-1 font-semibold mr-1 ${headingThemeColor}`}>
                  <Hash className="w-3.5 h-3.5 text-[#FF2C54]" />
                  Hashtags:
                </span>
                {article.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onSelectHashtag && onSelectHashtag(tag)}
                    className="px-2.5 py-1 rounded-full bg-[#F4F6FA] hover:bg-[#FF2C54] text-[#171920] hover:text-white font-medium transition-colors cursor-pointer"
                  >
                    #{tag.replace(/^#+/, '')}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono opacity-80 tabular-nums">
                  <Eye className="w-3.5 h-3.5 text-[#5960FF]" />
                  <span>{article.views.toLocaleString('es-ES')} visitas</span>
                </span>

                <button
                  type="button"
                  onClick={() => onLike(article.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-[8px] border hover:border-[#FF2C54] hover:text-[#FF2C54] transition-colors cursor-pointer tabular-nums ${
                    isReadingMode && readingTheme === 'dark'
                      ? 'border-[#2D3246] text-[#F8FAFC]'
                      : 'border-[#dcdfe7] text-[#171920]'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-[#FF2C54]" />
                  <span>Me gusta ({article.likes})</span>
                </button>

                {onDislike && (
                  <button
                    type="button"
                    onClick={() => onDislike(article.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[8px] border hover:border-[#DC2626] hover:text-[#DC2626] transition-colors cursor-pointer tabular-nums ${
                      isReadingMode && readingTheme === 'dark'
                        ? 'border-[#2D3246] text-[#F8FAFC]'
                        : 'border-[#dcdfe7] text-[#595F71]'
                    }`}
                    title="No me gusta este artículo"
                  >
                    <ThumbsDown className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>No me gusta ({article.dislikes || 0})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Social Share Bar */}
            <SocialShareBar article={article} onShare={onShare} />

            {/* ================================================================= */}
            {/* AUTHOR & COLLABORATING CO-AUTHORS PROFILE BOXES                   */}
            {/* ================================================================= */}
            <section className="my-10 space-y-4">
              {/* Main Author Card */}
              <div className={`border rounded-[15px] p-6 sm:p-8 ${surfaceCardClasses}`}>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <AuthorAvatar user={author} size="lg" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#FF2C54] font-semibold block">
                          Autor Principal del Artículo
                        </span>
                        <h3 className={`text-xl font-bold ${headingThemeColor}`}>
                          {author.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectAuthor(author.id)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#5960FF] hover:bg-[#2c2f3c] rounded-[6px] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Ver Perfil de Autor
                      </button>
                    </div>
                    <p className="text-xs opacity-75 mb-3">
                      {author.specialty} · {author.location}
                    </p>
                    <p className="text-sm leading-relaxed mb-3">{author.bio}</p>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs opacity-80">
                      {author.website && <span>Web: {author.website}</span>}
                      {author.twitter && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>X: {author.twitter}</span>
                        </>
                      )}
                      {author.instagram && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>IG: {author.instagram}</span>
                        </>
                      )}
                      {author.linkedin && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>IN: {author.linkedin}</span>
                        </>
                      )}
                      {author.youtube && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>YT: {author.youtube}</span>
                        </>
                      )}
                      {author.github && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>GH: {author.github}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Collaborating Co-Authors Cards */}
              {coAuthors.length > 0 && (
                <div className={`border rounded-[15px] p-6 ${surfaceCardClasses}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-[#5960FF]" />
                    <span className="text-xs uppercase tracking-wider font-bold text-[#5960FF]">
                      En colaboración editorial ({coAuthors.length}{' '}
                      {coAuthors.length === 1 ? 'Co-autor' : 'Co-autores'})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {coAuthors.map((co) => (
                      <div
                        key={co.id}
                        className={`p-4 rounded-[12px] border flex items-start gap-3.5 ${
                          isReadingMode && readingTheme === 'dark'
                            ? 'bg-[#12141C] border-[#2D3246]'
                            : 'bg-white border-[#dcdfe7]'
                        }`}
                      >
                        <AuthorAvatar user={co} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-sm font-bold truncate ${headingThemeColor}`}>
                              {co.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => onSelectAuthor(co.id)}
                              className="text-[11px] font-semibold text-[#5960FF] hover:text-[#FF2C54] shrink-0 cursor-pointer"
                            >
                              Ver perfil →
                            </button>
                          </div>
                          <p className="text-[11px] opacity-75 mb-1">{co.specialty}</p>
                          <p className="text-xs opacity-85 line-clamp-2 leading-relaxed">
                            {co.bio}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ================================================================= */}
            {/* SISTEMA DE COMENTARIOS (CON APROBACIÓN PREVIA DE ADMINISTRACIÓN) */}
            {/* ================================================================= */}
            <section
              id="comments-section"
              className={`mt-12 pt-10 border-t ${
                isReadingMode && readingTheme === 'dark'
                  ? 'border-[#2D3246]'
                  : isReadingMode && readingTheme === 'sepia'
                  ? 'border-[#E2D7C5]'
                  : 'border-[#dcdfe7]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <div className="rivax-divider-heading mb-1">
                    <div className="divider-1" />
                    <div className="divider-2" />
                    <h2 className={`text-xl font-bold ${headingThemeColor}`}>
                      Comentarios ({approvedComments.length})
                    </h2>
                  </div>
                  <p className="text-xs opacity-75">
                    Todos los comentarios requieren aprobación de la administración antes de ser publicados.
                  </p>
                </div>

                {currentUser?.role === 'admin' && pendingForThisArticle.length > 0 && (
                  <button
                    type="button"
                    onClick={onOpenAdminComments}
                    className="px-3.5 py-2 text-xs font-medium bg-[#FEF3C7] text-[#92400E] rounded-[8px] border border-[#F59E0B]/40 hover:bg-[#FDE68A] transition-colors inline-flex items-center gap-1.5 cursor-pointer tabular-nums"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {pendingForThisArticle.length} pendiente(s) de aprobación
                    </span>
                  </button>
                )}
              </div>

              {/* Approved Comments List */}
              {approvedComments.length === 0 ? (
                <div
                  className={`py-8 px-6 border rounded-[15px] text-center mb-10 ${surfaceCardClasses}`}
                >
                  <MessageSquare className="w-5 h-5 text-[#9497AE] mx-auto mb-2" />
                  <p className="text-sm">
                    Aún no hay comentarios aprobados en este artículo. ¡Sé el primero en comentar!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mb-10">
                  {approvedComments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className={`p-5 rounded-[15px] border ${
                        isReadingMode && readingTheme === 'dark'
                          ? 'bg-[#1B1E2B] border-[#2D3246]'
                          : 'bg-white border-[#dcdfe7]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`font-semibold text-sm ${headingThemeColor}`}>
                            {cmt.authorName}
                          </span>
                          <span className="opacity-50" aria-hidden="true">
                            ·
                          </span>
                          <span className="opacity-75">{cmt.createdAt}</span>
                          {cmt.authorRole === 'author' || cmt.authorRole === 'admin' ? (
                            <>
                              <span className="opacity-50" aria-hidden="true">
                                ·
                              </span>
                              <span className="text-[#FF2C54] font-medium">
                                Equipo Kayleen
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{cmt.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Confirmation Banner when a comment was just submitted */}
              {lastSubmittedComment && (
                <div className={`mb-8 p-5 border rounded-[15px] ${surfaceCardClasses}`}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#FF2C54] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className={`text-sm font-semibold ${headingThemeColor}`}>
                        Comentario enviado a moderación administrativa
                      </h4>
                      <p className="text-xs mt-1 leading-relaxed">
                        Gracias, <strong>{lastSubmittedComment.authorName}</strong>. Tu comentario ha
                        quedado registrado con estado <code className="font-mono">pending</code> y
                        será visible en cuanto la administración lo apruebe.
                      </p>
                      {currentUser?.role === 'admin' && onApproveComment && (
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              onApproveComment(lastSubmittedComment.id);
                              setLastSubmittedComment(null);
                            }}
                            className="px-3.5 py-1.5 text-xs font-medium bg-[#16A34A] text-white rounded-[6px] hover:bg-[#15803D] transition-colors cursor-pointer"
                          >
                            Aprobar ahora mismo (Vista Admin)
                          </button>
                          {onOpenAdminComments && (
                            <button
                              type="button"
                              onClick={onOpenAdminComments}
                              className="px-3.5 py-1.5 text-xs font-medium border border-[#dcdfe7] bg-white text-[#171920] rounded-[6px] hover:bg-[#171920] hover:text-white transition-colors cursor-pointer"
                            >
                              Abrir Moderación en Dashboard
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* New Comment Form */}
              <div className={`border rounded-[15px] p-6 sm:p-8 ${surfaceCardClasses}`}>
                <h3 className={`text-lg font-bold mb-1 ${headingThemeColor}`}>
                  Dejar un Comentario
                </h3>
                <p className="text-xs opacity-75 mb-6 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#FF2C54]" />
                  <span>
                    Moderación activa: tu comentario será revisado por la administración antes de publicarse.
                  </span>
                </p>

                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  {!currentUser ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-medium mb-1.5 ${headingThemeColor}`}>
                          Nombre completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={commentName}
                          onChange={(e) => setCommentName(e.target.value)}
                          placeholder="Tu nombre"
                          className="w-full px-3.5 py-2.5 text-sm bg-white text-[#171920] rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1.5 ${headingThemeColor}`}>
                          Correo electrónico *
                        </label>
                        <input
                          type="email"
                          required
                          value={commentEmail}
                          onChange={(e) => setCommentEmail(e.target.value)}
                          placeholder="tu@correo.com"
                          className="w-full px-3.5 py-2.5 text-sm bg-white text-[#171920] rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-[#4b546e] bg-white px-3.5 py-2.5 rounded-[8px] border border-[#dcdfe7]">
                      Comentando como{' '}
                      <strong className="text-[#171920]">{currentUser.name}</strong> (
                      {currentUser.email})
                    </div>
                  )}

                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${headingThemeColor}`}>
                      Comentario *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder="Escribe tu comentario..."
                      className="w-full px-3.5 py-2.5 text-sm bg-white text-[#171920] rounded-[8px] border border-[#dcdfe7] focus:outline-none focus:border-[#FF2C54]"
                    />
                  </div>

                  {formError && <p className="text-xs text-[#DC2626]">{formError}</p>}

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 text-xs font-semibold text-white bg-[#FF2C54] hover:bg-[#2c2f3c] rounded-[8px] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Enviando...' : 'Enviar Comentario para Aprobación'}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>

          {/* Right Sticky Kayleen Sidebar (Hidden when Distraction-Free Reading Mode is active) */}
          {!isReadingMode && (
            <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
              {/* Author Card Widget (9c1f14f Kayleen Style) */}
              <div className="border border-[#dcdfe7] rounded-[15px] p-6 bg-white text-center">
                <div className="flex justify-center mb-4">
                  <AuthorAvatar user={author} size="xl" />
                </div>
                <button
                  type="button"
                  onClick={() => onSelectAuthor(author.id)}
                  className="text-xl font-bold text-[#171920] hover:text-[#FF2C54] transition-colors cursor-pointer"
                >
                  {author.name}
                </button>
                <p className="text-xs text-[#595F71] mt-1 mb-3">{author.specialty}</p>
                <p className="text-xs text-[#4b546e] leading-relaxed mb-4">{author.bio}</p>

                {coAuthors.length > 0 && (
                  <div className="mb-4 pt-3 border-t border-[#dcdfe7] text-left">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5960FF] block mb-2">
                      Co-autores en este artículo:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {coAuthors.map((co) => (
                        <button
                          key={co.id}
                          type="button"
                          onClick={() => onSelectAuthor(co.id)}
                          className="px-2.5 py-1 text-xs font-medium bg-[#f7f8fc] hover:bg-[#5960FF] hover:text-white text-[#171920] rounded-[6px] border border-[#dcdfe7] transition-colors cursor-pointer"
                        >
                          {co.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 text-xs text-[#595F71] pt-3 border-t border-[#dcdfe7]">
                  <span>{author.twitter}</span>
                  <span aria-hidden="true">·</span>
                  <span>{author.instagram}</span>
                </div>
              </div>

              {/* Quick Reading Mode Card in Sidebar */}
              <div className="border border-[#dcdfe7] rounded-[15px] p-6 bg-[#f7f8fc]">
                <div className="rivax-divider-heading mb-3">
                  <div className="divider-1" />
                  <div className="divider-2" />
                  <h3 className="text-base font-bold text-[#171920]">Experiencia de Lectura</h3>
                  <div className="divider-3" />
                </div>
                <p className="text-xs text-[#4b546e] leading-relaxed mb-4">
                  Activa el <strong>Modo Lectura</strong> para ocultar barras laterales, ajustar el
                  tamaño tipográfico y alternar entre papel sepia, modo claro o modo noche.
                </p>
                <button
                  type="button"
                  onClick={() => setIsReadingMode(true)}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#5960FF] hover:bg-[#FF2C54] rounded-[8px] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Activar Modo Lectura</span>
                </button>
              </div>
            </aside>
          )}
        </div>

        {/* =================================================================== */}
        {/* BOTTOM SECTION: ARTÍCULOS RELACIONADOS (MISMA CATEGORÍA, EXCLUYENDO ACTUAL) */}
        {/* =================================================================== */}
        <section
          className={`mt-16 pt-12 border-t ${
            isReadingMode && readingTheme === 'dark'
              ? 'border-[#2D3246]'
              : isReadingMode && readingTheme === 'sepia'
              ? 'border-[#E2D7C5]'
              : 'border-[#dcdfe7]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <div className="rivax-divider-heading mb-1">
                <div className="divider-1" />
                <div className="divider-2" />
                <h2 className={`text-2xl font-bold ${headingThemeColor}`}>
                  Artículos Relacionados
                </h2>
              </div>
              <p className="text-xs opacity-75">
                Más publicaciones sugeridas en la categoría{' '}
                <strong className="text-[#FF2C54]">{article.category}</strong>
              </p>
            </div>

            <span className="text-xs font-mono tabular-nums opacity-75">
              {relatedCategoryArticles.length} sugerencia(s) en {article.category}
            </span>
          </div>

          {relatedCategoryArticles.length === 0 ? (
            <div className={`p-8 rounded-[15px] border text-center ${surfaceCardClasses}`}>
              <p className="text-sm">
                Actualmente no hay otros artículos publicados en la categoría{' '}
                <strong>{article.category}</strong>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {relatedCategoryArticles.slice(0, 3).map((rel) => {
                const relAuthor =
                  allUsers.find((u) => u.id === rel.authorId) || allUsers[0];
                const relApprovedComments = comments.filter(
                  (c) => c.articleId === rel.id && c.status === 'approved'
                ).length;

                return (
                  <article
                    key={rel.id}
                    onClick={() => onSelectArticle(rel.id)}
                    className={`group rounded-[15px] overflow-hidden border flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all ${
                      isReadingMode && readingTheme === 'dark'
                        ? 'bg-[#1B1E2B] border-[#2D3246]'
                        : isReadingMode && readingTheme === 'sepia'
                        ? 'bg-[#F4EDE1] border-[#E2D7C5]'
                        : 'bg-white border-[#dcdfe7]'
                    }`}
                  >
                    <div>
                      <div className="relative h-52 overflow-hidden">
                        <EditorialVisual
                          preset={rel.visualPreset}
                          customImageUrl={rel.customImageUrl}
                          alt={rel.title}
                          aspectRatio="fill"
                          className="w-full h-full"
                        />
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[11px] tabular-nums">
                          {rel.readTimeMinutes} min
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Unboxed Metadata */}
                        <div className="flex flex-wrap items-center gap-2 text-xs opacity-80 mb-2.5">
                          <span className="text-[#FF2C54] font-semibold">
                            {rel.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#FF2C54]" />
                            {rel.publishedAt}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>by {relAuthor.name}</span>
                        </div>

                        <h3
                          className={`text-lg font-bold group-hover:text-[#FF2C54] transition-colors leading-snug mb-3 ${headingThemeColor}`}
                        >
                          <span className="title-animation-underline-in-out">
                            {rel.title}
                          </span>
                        </h3>

                        <p className="text-xs opacity-85 line-clamp-2 leading-relaxed">
                          {rel.excerpt}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`px-6 py-3.5 border-t flex items-center justify-between text-xs ${
                        isReadingMode && readingTheme === 'dark'
                          ? 'border-[#2D3246]'
                          : isReadingMode && readingTheme === 'sepia'
                          ? 'border-[#E2D7C5]'
                          : 'border-[#f1f3f8]'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#5960FF] group-hover:text-[#FF2C54] transition-colors">
                        <span>Leer artículo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>

                      <span className="font-mono tabular-nums opacity-75">
                        {rel.views} vistas · {relApprovedComments} coment.
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </article>
    </div>
  );
};
